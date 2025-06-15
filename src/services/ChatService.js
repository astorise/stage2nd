import Peer from 'peerjs';
import { EventEmitter } from 'eventemitter3';

export class ChatService extends EventEmitter {
  constructor(options = { host: '0.peerjs.com', secure: true, port: 443 }) {
    super();
    this.peer = null;
    this.conns = new Map();
    this.options = options;
  }

  async listPeers() {
    const protocol = this.options.secure ? 'https' : 'http';
    const port = this.options.port ? `:${this.options.port}` : '';
    const basePath = this.options.path || '/';
    const url = `${protocol}://${this.options.host}${port}${basePath.replace(/\/$/, '')}/peers`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch peers: ${res.status}`);
    }
    return res.json();
  }

  register(username) {
    if (this.peer) this.peer.destroy?.();
    this.conns.clear();
    this.peer = new Peer(username, this.options);
    this.peer.on('connection', conn => this._setupConnection(conn));
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
      this.peer.on('connection', conn => this._setupConnection(conn));
      this.peer.on('open', id => this.emit('open', id));
      this.peer.on('close', () => this.emit('close'));
    }
    if (this.conns.has(peerId)) return this.conns.get(peerId);
    const conn = this.peer.connect(peerId);
    this._setupConnection(conn);
    return conn;
  }

  _setupConnection(conn) {
    if (!conn) return;
    this.conns.set(conn.peer, conn);
    conn.on('data', data => this.emit('message', data));
    conn.on('open', () => this.emit('connected', conn.peer));
    conn.on('close', () => {
      this.conns.delete(conn.peer);
      this.emit('disconnected', conn.peer);
    });
  }

  sendMessage(msg) {
    for (const conn of this.conns.values()) {
      if (conn && conn.open) {
        conn.send(msg);
      }
    }
  }

  onMessage(cb) {
    this.on('message', cb);
  }

  leave() {
    this.emit('leave');
  }

  onLeave(cb) {
    this.on('leave', cb);
  }
}
