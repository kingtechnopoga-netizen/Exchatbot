# ExChatBot v2

A lightweight, mobile-first AI chatbot with a dark-green hacker UI.
Powered by [puter.js](https://puter.com) for free access to 30+ AI models — no
API keys, no backend, no database. Pure static site, installable as a PWA.

## Features

### Chat
- 30+ models from OpenAI, Anthropic, Google, DeepSeek, Meta, Mistral, xAI
- Models grouped by provider in the dropdown for easy picking
- **Streaming responses** (token-by-token) with a Stop button
- **Code Assistant** mode for clean, beginner-friendly code help
- **Regenerate** any AI reply
- **Edit & resend** any user message (truncates the chat from that point)
- **Quick-prompt templates** (Explain code, Debug, Generate, Summarize,
  Translate, Interview prep, Regex, SQL)
- Friendly fallback when a model fails

### Conversations
- **Multi-chat sidebar** — keep multiple conversations side by side
- All chats persist in `localStorage` across page reloads
- **Search** across titles and messages
- **Export** current chat as Markdown
- Per-chat title auto-generated from the first message

### Voice & speech
- **Voice input** via Web Speech API (Chrome / Android)
- **Text-to-speech** for AI replies — per-message Speak button or
  optional auto-speak toggle

### UI
- Mobile-first responsive layout, drawer sidebar on mobile
- Dark / Light theme, three font sizes
- Temperature (creativity) slider
- **Markdown rendering** — headings, lists, blockquotes, tables, links
- **Syntax highlighting** for js/ts, python, html, css, json, shell
- Per-code-block Copy button
- Character counter, auto-scroll, auto-grow textarea
- Toast notifications

### Power user
- **Keyboard shortcuts**: `Enter` send · `Shift+Enter` newline ·
  `Ctrl/Cmd+K` new chat · `Ctrl/Cmd+B` toggle sidebar ·
  `Ctrl/Cmd+/` shortcuts · `Ctrl/Cmd+L` clear current chat ·
  `Esc` close modal / stop generation
- **PWA**: installable on mobile/desktop, offline shell via service worker
- **GCash donation** with copy-to-clipboard

### Performance
- ~50 KB total payload
- Vanilla JS, no frameworks, no build step
- No heavy animations, respects `prefers-reduced-motion`
- Service worker caches the static shell — instant repeat loads
- AI requests always hit the network (never stale)

## Project structure

```
.
├── index.html
├── style.css
├── script.js
├── sw.js                  # Service worker (PWA offline shell)
├── manifest.webmanifest   # PWA manifest
├── icon-192.svg
├── icon-512.svg
├── icon-maskable.svg
├── render.yaml            # Render Blueprint (IaC)
└── README.md
```

## Run locally

It's a pure static site:

```bash
# Python
python3 -m http.server 8080

# Node (if installed)
npx serve .
```

Then visit <http://localhost:8080>. Note: the service worker registers only
under `https://` or `http://localhost`.

## Deploy on Render

This repo ships with a **Render Blueprint** (`render.yaml`).

### Option A — Blueprint (recommended)

1. Push to GitHub.
2. <https://dashboard.render.com> → **New + → Blueprint**.
3. Pick the repo and click **Apply**.
4. Render reads `render.yaml`, provisions a static site, and deploys.

You'll get a URL like `https://exchatbot.onrender.com`. Auto-deploys on every
push to `main`, PR previews are enabled.

### Option B — Manual static site

1. Push to GitHub.
2. <https://dashboard.render.com> → **New + → Static Site**.
3. Configure:
   - **Build Command:** *(leave empty)*
   - **Publish Directory:** `.`
4. Click **Create Static Site**.

## Notes on puter.js

- Loaded from CDN: `<script src="https://js.puter.com/v2/"></script>`
- Free tier — no API key. The first request may show a one-time popup to
  sign in to puter.com.
- Some models occasionally rate-limit. If a model errors, just pick another
  from the dropdown and click Regenerate.

## Browser support

- Chromium (Chrome/Edge/Brave) — full support
- Firefox — chat works, no Web Speech voice input
- Safari — chat + TTS work, voice input limited
- Mobile (Android/iOS) — full chat support, install as PWA via "Add to home screen"

## Support

If ExChatBot helps you and you'd like to support development, you can donate any
amount via GCash:

- **GCash:** `09482887486`

Thanks!
