import Peer from 'peerjs';
import { EventEmitter } from 'eventemitter3';

export class ChatService extends EventEmitter {
  constructor(options = { host: '0.peerjs.com', secure: true, port: 443, rtcConfig: null }) {
    super();
    this.peer = null;
    this.options = options;
    this.signalConns = new Map();
    this.rtcPeers = new Map();
    this.channels = new Map();
  }

  async listPeers() {
    const protocol = this.options.secure ? 'https' : 'http';
    const port = this.options.port ? `:${this.options.port}` : '';
    const basePath = this.options.path || '/';
    const url = `${protocol}://${this.options.host}${port}${basePath.replace(/\/$/, '')}/peers`;
    const res = await fetch(url);
    if (res.status === 404) {
      return [];
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch peers: ${res.status}`);
    }
    return res.json();
  }

  register(username) {
    if (this.peer) this.peer.destroy?.();
    this.signalConns.clear();
    this._closeAllRtc();
    this.peer = new Peer(username, this.options);
    this.peer.on('connection', conn => this._setupSignalConnection(conn, false));
    this.peer.on('open', async id => {
      this.emit('open', id);
      try {
        const peers = await this.listPeers();
        peers
          .filter(p => p !== id)
          .forEach(p => {
            try {
              this.connect(p);
            } catch {}
          });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to auto-connect peers', err);
      }
    });
    this.peer.on('close', () => this.emit('close'));
    return this.peer;
  }

  connect(peerId) {
    if (!this.peer) {
      this.peer = new Peer(this.options);
      this.peer.on('connection', c => this._setupSignalConnection(c, false));
      this.peer.on('open', id => this.emit('open', id));
      this.peer.on('close', () => this.emit('close'));
    }
    if (this.signalConns.has(peerId)) return this.signalConns.get(peerId);
    const conn = this.peer.connect(peerId);
    this._setupSignalConnection(conn, true);
    return conn;
  }

  _setupSignalConnection(conn, initiator) {
    if (!conn) return;
    this.signalConns.set(conn.peer, conn);
    conn.on('data', data => this._handleSignal(conn.peer, data));
    conn.on('open', async () => {
      this.emit('connected', conn.peer);
      if (initiator) {
        const pc = this._createPeerConnection(conn.peer);
        const channel = pc.createDataChannel('chat');
        this._setupDataChannel(conn.peer, channel);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        conn.send({ type: 'offer', sdp: pc.localDescription });
      }
    });
    conn.on('close', () => {
      this.signalConns.delete(conn.peer);
      this._closePeer(conn.peer);
      this.emit('disconnected', conn.peer);
    });
  }

  _createPeerConnection(peerId) {
    if (this.rtcPeers.has(peerId)) return this.rtcPeers.get(peerId);
    const config = this.options.rtcConfig || {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };
    const pc = new RTCPeerConnection(config);
    pc.onicecandidate = e => {
      if (e.candidate) {
        const conn = this.signalConns.get(peerId);
        conn?.open && conn.send({ type: 'candidate', candidate: e.candidate });
      }
    };
    pc.oniceconnectionstatechange = () => {
      // eslint-disable-next-line no-console
      console.debug(
        `ICE ${peerId} ${pc.iceConnectionState}`
      );
    };
    pc.ondatachannel = e => this._setupDataChannel(peerId, e.channel);
    this.rtcPeers.set(peerId, pc);
    return pc;
  }

  _setupDataChannel(peerId, channel) {
    this.channels.set(peerId, channel);
    channel.onmessage = e => this.emit('message', e.data);
    channel.onclose = () => {
      this.channels.delete(peerId);
    };
  }

  async _handleSignal(peerId, data) {
    if (!data || typeof data !== 'object') return;
    const pc = this._createPeerConnection(peerId);
    if (data.type === 'offer') {
      await pc.setRemoteDescription(data.sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      const conn = this.signalConns.get(peerId);
      conn?.open && conn.send({ type: 'answer', sdp: pc.localDescription });
    } else if (data.type === 'answer') {
      await pc.setRemoteDescription(data.sdp);
    } else if (data.type === 'candidate') {
      try {
        await pc.addIceCandidate(data.candidate);
      } catch {}
    } else if (data.type === 'leave') {
      this._closePeer(peerId);
    }
  }

  _closePeer(peerId) {
    const pc = this.rtcPeers.get(peerId);
    if (pc) {
      pc.close();
      this.rtcPeers.delete(peerId);
    }
    const channel = this.channels.get(peerId);
    if (channel) {
      channel.close();
      this.channels.delete(peerId);
    }
  }

  _closeAllRtc() {
    for (const id of Array.from(this.rtcPeers.keys())) {
      this._closePeer(id);
    }
  }

  sendMessage(msg) {
    for (const channel of this.channels.values()) {
      if (channel.readyState === 'open') {
        channel.send(msg);
      }
    }
  }

  onMessage(cb) {
    this.on('message', cb);
  }

  leave() {
    for (const conn of this.signalConns.values()) {
      conn.send({ type: 'leave' });
    }
    this.emit('leave');
  }

  onLeave(cb) {
    this.on('leave', cb);
  }
}
