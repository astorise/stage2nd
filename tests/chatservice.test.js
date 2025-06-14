import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';
import { ChatService } from '@/services/ChatService';

class MockConn extends EventEmitter {
  constructor() {
    super();
    this.open = true;
  }
  send = vi.fn();
}

class MockPeer extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
  }
  connect() {
    this.conn = new MockConn();
    return this.conn;
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
});
