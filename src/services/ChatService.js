import Peer from 'simple-peer';
import { EventEmitter } from 'eventemitter3';

export class ChatService extends EventEmitter {
  constructor(options = { registerUrl: '', rtcConfig: null }) {
    super();
    this.options = options;
    this.id = null;
    this.peers = new Map();
    this._pollHandle = null;
  }

  async listPeers() {
    if (!this.options.registerUrl) return [];
    const base = this.options.registerUrl.replace(/\/$/, '');
    const res = await fetch(`${base}/peers`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`Failed to fetch peers: ${res.status}`);
    return res.json();
  }

  async register(username) {
    this.leave();
    this.id = username;
    if (this.options.registerUrl) {
      const base = this.options.registerUrl.replace(/\/$/, '');
      try {
        await fetch(`${base}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: username })
        });
      } catch {}
    }
    this.emit('open', username);
    try {
      const peers = await this.listPeers();
      peers.filter(p => p !== username).forEach(p => {
        try { this.connect(p); } catch {}
      });
    } catch (err) {
      console.error('Failed to auto-connect peers', err);
    }
    if (this.options.registerUrl) {
      this._pollHandle = setInterval(() => this._pollSignals(), 1000);
      await this._pollSignals();
    }
  }

  connect(peerId) {
    if (this.peers.has(peerId)) return this.peers.get(peerId);
    const peer = new Peer({
      initiator: true,
      trickle: true,
      config: this.options.rtcConfig || {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      }
    });
    this._setupPeer(peerId, peer);
    return peer;
  }

  _setupPeer(peerId, peer) {
    this.peers.set(peerId, peer);
    peer.on('signal', data => this._sendSignal(peerId, data));
    peer.on('connect', () => {
      peer.connected = true;
      this.emit('connected', peerId);
    });
    peer.on('data', d => this.emit('message', d.toString()));
    peer.on('close', () => {
      peer.connected = false;
      this.peers.delete(peerId);
      this.emit('disconnected', peerId);
    });
  }

  async _sendSignal(peerId, data) {
    if (!this.options.registerUrl) return;
    const base = this.options.registerUrl.replace(/\/$/, '');
    try {
      await fetch(`${base}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: this.id, to: peerId, signal: data })
      });
    } catch {}
  }

  async handleSignal(from, data) {
    let peer = this.peers.get(from);
    if (!peer) {
      peer = new Peer({
        initiator: false,
        trickle: true,
        config: this.options.rtcConfig || {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        }
      });
      this._setupPeer(from, peer);
    }
    peer.signal(data);
  }

  async _pollSignals() {
    if (!this.options.registerUrl || !this.id) return;
    const base = this.options.registerUrl.replace(/\/$/, '');
    try {
      const res = await fetch(`${base}/signal?id=${this.id}`);
      if (!res.ok) return;
      const list = await res.json();
      for (const { from, signal } of list) {
        try {
          await this.handleSignal(from, signal);
        } catch {}
      }
    } catch {}
  }

  sendMessage(msg) {
    for (const peer of this.peers.values()) {
      if (peer.connected) {
        peer.send(msg);
      }
    }
  }

  onMessage(cb) {
    this.on('message', cb);
  }

  leave() {
    for (const peer of this.peers.values()) {
      peer.destroy?.();
    }
    this.peers.clear();
    if (this._pollHandle) {
      clearInterval(this._pollHandle);
      this._pollHandle = null;
    }
    this.emit('leave');
  }

  onLeave(cb) {
    this.on('leave', cb);
  }
}
