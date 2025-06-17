import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { ChatService } from '@/services/ChatService';

class MockPeer extends EventEmitter {
  constructor(opts) {
    super();
    this.opts = opts;
    this.connected = false;
  }
  send = vi.fn();
  signal() {}
  destroy() {
    this.emit('close');
  }
}

var MockPeerCtor;
vi.mock('simple-peer', () => {
  MockPeerCtor = vi.fn(opts => new MockPeer(opts));
  return { default: MockPeerCtor };
});

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('ChatService', () => {
  let service;

  beforeEach(() => {
    service = new ChatService();
  });

  it('register stores username', async () => {
    await service.register('alice');
    expect(service.id).toBe('alice');
  });

  it('dispatches received messages', () => {
    service.register('bob');
    const conn = service.connect('remote');
    const handler = vi.fn();
    service.onMessage(handler);
    conn.emit('connect');
    service.peers.get('remote').emit('data', 'hi');
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
    c1.emit('connect');
    c2.emit('connect');
    service.peers.get('peer1').emit('data', 'msg1');
    service.peers.get('peer2').emit('data', 'msg2');
    expect(handler).toHaveBeenCalledWith('msg1');
    expect(handler).toHaveBeenCalledWith('msg2');
    service.sendMessage('hi all');
    expect(c1.send).toHaveBeenCalledWith('hi all');
    expect(c2.send).toHaveBeenCalledWith('hi all');
    c1.emit('close');
    service.sendMessage('bye');
    expect(service.peers.has('peer1')).toBe(false);
    expect(c2.send).toHaveBeenCalledTimes(2);
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
    service.options = { registerUrl: 'http://host:80' };
    const peers = await service.listPeers();
    expect(fetch).toHaveBeenCalledWith('http://host:80/peers');
    expect(peers).toEqual(['a', 'b']);
  });

  it('listPeers returns empty array on 404', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    service.options = { registerUrl: 'http://host:80' };
    await expect(service.listPeers()).resolves.toEqual([]);
  });

  it('auto connects to peers on register', async () => {
    const connectSpy = vi.spyOn(service, 'connect');
    vi.spyOn(service, 'listPeers').mockResolvedValue(['me', 'other1']);
    await service.register('me');
    expect(connectSpy).toHaveBeenCalledWith('other1');
  });

  it('emits connected with peer id', () => {
    service.register('x');
    const conn = service.connect('y');
    const handler = vi.fn();
    service.on('connected', handler);
    conn.emit('connect');
    expect(handler).toHaveBeenCalledWith('y');
  });

  it('passes rtcConfig to simple-peer', () => {
    service = new ChatService({ registerUrl: '', rtcConfig: { iceServers: [] } });
    service.register('p');
    service.connect('z');
    expect(MockPeerCtor).toHaveBeenCalledWith(
      expect.objectContaining({ config: { iceServers: [] } })
    );
  });

  it('register starts polling signals', async () => {
    vi.useFakeTimers();
    service = new ChatService({ registerUrl: 'http://host' });
    const pollSpy = vi.spyOn(service, '_pollSignals').mockResolvedValue();
    const intervalSpy = vi.spyOn(global, 'setInterval');
    await service.register('me');
    expect(pollSpy).toHaveBeenCalled();
    expect(intervalSpy).toHaveBeenCalled();
  });

  it('polled signals are handled', async () => {
    vi.useFakeTimers();
    service = new ChatService({ registerUrl: 'http://host' });
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ from: 'peer', signal: 's1' }])
      });
    const handle = vi.spyOn(service, 'handleSignal').mockResolvedValue();
    await service.register('me');
    expect(global.fetch).toHaveBeenCalledWith('http://host/signal?id=me');
    expect(handle).toHaveBeenCalledWith('peer', 's1');
  });
});
