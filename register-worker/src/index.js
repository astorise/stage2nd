const peers = new Set();
const signals = new Map();

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    if (pathname === '/register' && request.method === 'POST') {
      const { id } = await request.json();
      if (!id) return new Response('Missing id', { status: 400 });
      peers.add(id);
      if (!signals.has(id)) signals.set(id, []);
      return new Response('OK', { headers: { ...cors } });
    }

    if (pathname === '/peers' && request.method === 'GET') {
      return new Response(JSON.stringify([...peers]), {
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }

    if (pathname === '/signal' && request.method === 'POST') {
      const { from, to, signal } = await request.json();
      if (!from || !to || signal === undefined)
        return new Response('Invalid', { status: 400 });
      if (!signals.has(to)) signals.set(to, []);
      signals.get(to).push({ from, signal });
      return new Response('OK', { headers: { ...cors } });
    }

    if (pathname === '/signal' && request.method === 'GET') {
      const id = url.searchParams.get('id');
      if (!id) return new Response('Missing id', { status: 400 });
      const list = signals.get(id) || [];
      signals.set(id, []);
      return new Response(JSON.stringify(list), {
        headers: { 'Content-Type': 'application/json', ...cors }
      });
    }

    return new Response('Not found', { status: 404, headers: { ...cors } });
  }
};
