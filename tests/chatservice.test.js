import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

vi.mock('peerjs', () => ({ default: vi.fn(id => new MockPeer(id)) }));

class MockDataChannel {
  constructor() {
    this.readyState = 'open';
    this.send = vi.fn();
    this.onmessage = null;
    this.onclose = null;
  }
  close() {
    this.readyState = 'closed';
    this.onclose && this.onclose();
  }
}

class MockRTC extends EventEmitter {
  constructor() {
    super();
    this.onicecandidate = null;
    this.ondatachannel = null;
  }
  createDataChannel() {
    this.channel = new MockDataChannel();
    return this.channel;
  }
  async createOffer() { return { type: 'offer', sdp: 'offer' }; }
  async createAnswer() { return { type: 'answer', sdp: 'answer' }; }
  async setLocalDescription(desc) { this.local = desc; }
  async setRemoteDescription(desc) { this.remote = desc; }
  async addIceCandidate() {}
  close() {}
}

beforeEach(() => {
  global.RTCPeerConnection = vi.fn(() => new MockRTC());
});

describe('ChatService', () => {
  let service;

  beforeEach(() => {
    service = new ChatService();
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('register creates Peer with username', () => {
    service.register('alice');
    expect(service.peer.id).toBe('alice');
  });

  it('dispatches received messages', async () => {
    service.register('bob');
    const conn = service.connect('remote');
    const handler = vi.fn();
    service.onMessage(handler);
    conn.emit('open');
    await Promise.resolve();
    const channel = service.channels.get('remote');
    channel.onmessage({ data: 'hi' });
    expect(handler).toHaveBeenCalledWith('hi');
    service.sendMessage('hello');
    expect(channel.send).toHaveBeenCalledWith('hello');
  });

  it('broadcasts to multiple peers and removes closed connections', async () => {
    service.register('carol');
    const c1 = service.connect('peer1');
    const c2 = service.connect('peer2');
    const handler = vi.fn();
    service.onMessage(handler);
    c1.emit('open');
    c2.emit('open');
    await Promise.resolve();
    service.channels.get('peer1').onmessage({ data: 'msg1' });
    service.channels.get('peer2').onmessage({ data: 'msg2' });
    expect(handler).toHaveBeenCalledWith('msg1');
    expect(handler).toHaveBeenCalledWith('msg2');
    service.sendMessage('hi all');
    expect(service.channels.get('peer1').send).toHaveBeenCalledWith('hi all');
    expect(service.channels.get('peer2').send).toHaveBeenCalledWith('hi all');
    c1.emit('close');
    service.sendMessage('bye');
    expect(service.channels.get('peer1')).toBeUndefined();
    expect(service.channels.get('peer2').send).toHaveBeenCalledTimes(2);
  });

  it('emits leave event', () => {
    const handler = vi.fn();
    service.onLeave(handler);
    service.leave();
    expect(handler).toHaveBeenCalled();
  });

  it('listPeers fetches from server', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(['a', 'b'])
    });
    service.options = { host: 'host', secure: false, port: 80 };
    const peers = await service.listPeers();
    expect(fetch).toHaveBeenCalledWith('http://host:80/peers');
    expect(peers).toEqual(['a', 'b']);
  });

  it('auto connects to peers on open', async () => {
    const connectSpy = vi.spyOn(service, 'connect');
    service.register('me');
    vi.spyOn(service, 'listPeers').mockResolvedValue(['me', 'other1']);
    service.peer.emit('open', 'me');
    await new Promise(resolve => setImmediate(resolve));
    expect(connectSpy).toHaveBeenCalledWith('other1');
  });

  it('emits connected with peer id', () => {
    service.register('x');
    const conn = service.connect('y');
    const handler = vi.fn();
    service.on('connected', handler);
    conn.emit('open');
    expect(handler).toHaveBeenCalledWith('y');
  });
});
