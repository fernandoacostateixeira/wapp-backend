# wapp-backend

Backend for the WhatsApp web client. Express + Socket.IO, integrates with the WhatsApp Cloud API.

## Requirements

- Node.js 20+

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` with your WhatsApp Cloud API credentials (from Meta for Developers > WhatsApp > API Setup). WhatsApp integration is optional — the server runs without it, just without sending/receiving real messages.

## Development

```bash
npm run dev
```

Runs at `http://localhost:4000`. Expects the frontend (`wapp-web`) running at the URL set in `CLIENT_ORIGIN`.

## Build

```bash
npm run build
npm start
```
