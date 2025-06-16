const peers = new Map();

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (request.method === "POST") {
      const body = await request.json();
      if (!id) return new Response("Missing id", { status: 400 });
      peers.set(id, body); // save SDP/ICE
      return new Response("OK");
    }

    if (request.method === "GET") {
      if (!id || !peers.has(id)) return new Response("{}", { status: 404 });
      return new Response(JSON.stringify(peers.get(id)), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not supported", { status: 405 });
  },
};