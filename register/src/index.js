const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

export class PeerManager {
  constructor(state) {
    this.state = state;
    this.peers = null;
    this.signals = null;
  }

  async _load() {
    if (!this.peers) {
      this.peers = new Set((await this.state.storage.get('peers')) || []);
    }
    if (!this.signals) {
      const entries = (await this.state.storage.get('signals')) || [];
      this.signals = new Map(entries);
    }
  }

  async _save() {
    await this.state.storage.put('peers', [...this.peers]);
    await this.state.storage.put('signals', [...this.signals.entries()]);
  }

  async fetch(request) {
    await this._load();
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    if (pathname === '/register' && request.method === 'POST') {
      const { id } = await request.json();
      if (!id) return new Response('Missing id', { status: 400 });
      this.peers.add(id);
      if (!this.signals.has(id)) this.signals.set(id, []);
      await this._save();
      return new Response('OK', { headers: { ...cors } });
    }

    if (pathname === '/peers' && request.method === 'GET') {
      return new Response(JSON.stringify([...this.peers]), {
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }

    if (pathname === '/signal' && request.method === 'POST') {
      const { from, to, signal } = await request.json();
      if (!from || !to || signal === undefined)
        return new Response('Invalid', { status: 400 });
      if (!this.signals.has(to)) this.signals.set(to, []);
      this.signals.get(to).push({ from, signal });
      await this._save();
      return new Response('OK', { headers: { ...cors } });
    }

    if (pathname === '/signal' && request.method === 'GET') {
      const id = url.searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const list = this.signals.get(id) || [];
      this.signals.set(id, []);
      await this._save();
      return new Response(JSON.stringify(list), {
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }

    return new Response('Not found', { status: 404, headers: { ...cors } });
  }
};

export default {
  async fetch(request, env) {
    const id = env.PEER_MANAGER.idFromName('global');
    const stub = env.PEER_MANAGER.get(id);
    return stub.fetch(request);
  }
};
