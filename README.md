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

The app ships with a small chat widget powered by [PeerJS](https://peerjs.com/).
To enable it, set `"collaboration": true` in `public/config.json` (or `"chat"` if
present). After rebuilding, a chat panel will appear at the bottom of the UI
allowing connected peers to exchange short messages.
