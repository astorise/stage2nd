import Peer from 'peerjs';
import { EventEmitter } from 'eventemitter3';

export class ChatService extends EventEmitter {
  constructor() {
    super();
    this.peer = null;
    this.conn = null;
    this.options = { host: '0.peerjs.com', secure: true, port: 443 };
  }

  register(username) {
    if (this.peer) this.peer.destroy?.();
    this.peer = new Peer(username, this.options);
    this.peer.on('connection', conn => this._setupConnection(conn));
    return this.peer;
  }

  connect(peerId) {
    if (!this.peer) {
      this.peer = new Peer(this.options);
      this.peer.on('connection', conn => this._setupConnection(conn));
    }
    const conn = this.peer.connect(peerId);
    this._setupConnection(conn);
    return conn;
  }

  _setupConnection(conn) {
    this.conn = conn;
    if (!conn) return;
    conn.on('data', data => this.emit('message', data));
  }

  sendMessage(msg) {
    if (this.conn && this.conn.open) {
      this.conn.send(msg);
    }
  }

  onMessage(cb) {
    this.on('message', cb);
  }
}
