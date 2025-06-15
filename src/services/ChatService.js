import Peer from 'peerjs';
import { EventEmitter } from 'eventemitter3';

export class ChatService extends EventEmitter {
  constructor() {
    super();
    this.peer = null;
    this.conns = new Map();
    this.options = { host: '0.peerjs.com', secure: true, port: 443 };
  }

  register(username) {
    if (this.peer) this.peer.destroy?.();
    this.conns.clear();
    this.peer = new Peer(username, this.options);
    this.peer.on('connection', conn => this._setupConnection(conn));
    this.peer.on('open', id => this.emit('open', id));
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
    conn.on('open', () => this.emit('connected'));
    conn.on('close', () => {
      this.conns.delete(conn.peer);
      this.emit('disconnected');
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
