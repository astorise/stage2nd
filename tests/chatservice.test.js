import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';
import { ChatService } from '@/services/ChatService';

class MockConn extends EventEmitter {
  constructor(peer) {
    super();
    this.open = true;
    this.peer = peer;
  }
  send = vi.fn();
}

class MockPeer extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
  }
  connect(peerId) {
    const conn = new MockConn(peerId);
    this.conn = conn;
    return conn;
  }
  destroy() {}
}

vi.mock('peerjs', () => ({ default: vi.fn((id) => new MockPeer(id)) }));

describe('ChatService', () => {
  let service;

  beforeEach(() => {
    service = new ChatService();
  });

  it('register creates Peer with username', () => {
    service.register('alice');
    expect(service.peer.id).toBe('alice');
  });

  it('dispatches received messages', () => {
    service.register('bob');
    const conn = service.connect('remote');
    const handler = vi.fn();
    service.onMessage(handler);
    conn.emit('data', 'hi');
    expect(handler).toHaveBeenCalledWith('hi');
    service.sendMessage('hello');
    expect(conn.send).toHaveBeenCalledWith('hello');
  });

  it('broadcasts to multiple peers and removes closed connections', () => {
    service.register('carol');
    const c1 = service.connect('peer1');
    const c2 = service.connect('peer2');
    const handler = vi.fn();
    service.onMessage(handler);
    c1.emit('data', 'msg1');
    c2.emit('data', 'msg2');
    expect(handler).toHaveBeenCalledWith('msg1');
    expect(handler).toHaveBeenCalledWith('msg2');
    service.sendMessage('hi all');
    expect(c1.send).toHaveBeenCalledWith('hi all');
    expect(c2.send).toHaveBeenCalledWith('hi all');
    c1.emit('close');
    service.sendMessage('bye');
    expect(c1.send).toHaveBeenCalledTimes(1);
    expect(c2.send).toHaveBeenCalledTimes(2);
  });

  it('emits leave event', () => {
    const handler = vi.fn();
    service.onLeave(handler);
    service.leave();
    expect(handler).toHaveBeenCalled();
  });
});
