# Portfolio Blog

Next.js App Router frontend for the portfolio blog. Public articles are rendered
on the server, while the authenticated dashboard and Tiptap editor run in the
browser against the portfolio PHP API.

## Local development

Create `.env` from `.env.example`, then run from the repository root:

```sh
npm install
npm run dev --workspace blog
```

The blog runs at `http://localhost:3000` and expects the API at
`http://localhost:8000` by default.

## Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `API_URL` | Server | Internal/base URL used for server-rendered public articles |
| `NEXT_PUBLIC_API_URL` | Browser | API base URL used by login and admin screens |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Browser | Cloudflare Turnstile public site key |

## Verification

```sh
npm run check --workspace blog
```
