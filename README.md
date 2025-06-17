# CodePlay Core

This project contains the core application used by the CodePlay platform. It is a [Vite](https://vitejs.dev/) application written in JavaScript.

## Installation

1. Ensure you have **Node.js 20** installed.
2. Install dependencies using `npm ci`:

```bash
npm ci
```

## Development

Start a local development server with Vite:

```bash
npm run dev
```

The app will be available at the URL printed in the console.

## Deploy

Deployment is handled by GitHub Actions. Every push to the `main` branch triggers the [deploy workflow](.github/workflows/deploy.yml):

1. Dependencies are installed with `npm ci`.
2. The project is built with `npm run build -- --outDir docs`.
3. The generated `docs` directory is uploaded and deployed to **GitHub Pages**.

For manual deployment you can also run:

```bash
npm run deploy
```

This builds the project and publishes the `dist` folder using the `gh-pages` package.

## Collaboration Chat

The app ships with a small chat widget powered by [simple-peer](https://github.com/feross/simple-peer).
Enable it by setting `"collaboration": true` in `public/config.json` (or `"chat"` if present).
Once enabled, a chat panel appears at the bottom of the UI allowing connected peers to exchange short messages.

Peers discover each other and exchange WebRTC signals through a small Cloudflare Worker.
Configure its endpoint using the `registerServer` section of `public/config.json`:

```json
{
  "registerServer": {
    "registerUrl": "https://your-worker.example.com",
    "rtcConfig": { "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }] }
  }
}
```

`rtcConfig` is passed directly to `simple-peer` when creating the `RTCPeerConnection` and can be used to specify custom ICE servers.

### Deploying the Worker

The signaling API uses a Cloudflare Durable Object to persist the list of peers and pending signals. Deploy it from the `register` directory:

```bash
cd register
npm run deploy
```

The first deployment creates the Durable Object using the configuration in `wrangler.jsonc`.
