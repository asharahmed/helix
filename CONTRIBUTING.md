# Contributing to Helix

Thanks for your interest in contributing to Helix.

## Prerequisites

- Node.js 20 or later
- Running backend services (Prometheus, Alertmanager, Loki, Wazuh, CrowdSec) for full functionality

## Development Setup

```bash
git clone https://github.com/asharahmed/helix.git
cd helix
cp .env.example .env.local   # fill in your backend URLs and secrets
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## Pull Request Process

1. Fork the repository and create a branch from `main`.
2. Make your changes and ensure all checks pass:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```
3. Open a pull request against `main` with a clear summary of your changes.

## Style Notes

- Use Canadian English spelling (e.g. "colour", "behaviour", "defence").
- Do not use em dashes. Use commas, semicolons, or separate sentences instead.
- Keep commit messages concise and descriptive.
