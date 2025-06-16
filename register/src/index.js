const peers = new Set();
const signals = new Map();

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/register' && request.method === 'POST') {
      const { id } = await request.json();
      if (!id) return new Response('Missing id', { status: 400 });
      peers.add(id);
      if (!signals.has(id)) signals.set(id, []);
      return new Response('OK');
    }

    if (pathname === '/peers' && request.method === 'GET') {
      return new Response(JSON.stringify([...peers]), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (pathname === '/signal' && request.method === 'POST') {
      const { from, to, signal } = await request.json();
      if (!from || !to || signal === undefined)
        return new Response('Invalid', { status: 400 });
      if (!signals.has(to)) signals.set(to, []);
      signals.get(to).push({ from, signal });
      return new Response('OK');
    }

    if (pathname === '/signal' && request.method === 'GET') {
      const id = url.searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const list = signals.get(id) || [];
      signals.set(id, []);
      return new Response(JSON.stringify(list), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};
