# ExChatBot

A lightweight, mobile-first AI chatbot website with a dark green hacker-style UI.
Powered by [puter.js](https://puter.com) for free access to multiple AI models — no
API keys, no backend, no database. Just static files.

## Features

- Chat with multiple free AI models (GPT-4o, Claude, DeepSeek, Gemini, Llama, Mistral, ...)
- Model selector with safe default and easy switching
- **Code Assistant** toggle for programming help (explain, generate, debug)
- Message history within the current session
- Copy button on AI responses
- Clear chat button
- Loading indicator and friendly error messages
- Settings: theme (dark / light), model, font size (S / M / L)
- Donation section with copy-to-clipboard for GCash number
- Theme & preferences saved to `localStorage`
- Mobile-optimized input, auto-scroll, responsive layout
- Tiny footprint — vanilla HTML / CSS / JS, no build step

## Project structure

```
.
├── index.html
├── style.css
├── script.js
├── render.yaml      # Render Blueprint (Infrastructure as Code)
└── README.md
```

## Run locally

It's a pure static site. Any of these works:

```bash
# Python
python3 -m http.server 8080

# Node (if installed)
npx serve .

# Or just open index.html in your browser
```

Then visit http://localhost:8080.

## Deploy on Render

This repo ships with a **Render Blueprint** (`render.yaml`) so deploys are
one-click — no manual dashboard config needed.

### Option A — Blueprint (recommended)

1. Push this project to a GitHub repository.
2. Go to <https://dashboard.render.com> and click **New + → Blueprint**.
3. Select your `Exchatbot` repo and click **Apply**.
4. Render reads `render.yaml`, provisions a static site, and deploys.

You'll get a URL like `https://exchatbot.onrender.com`. Auto-deploys on every
push to `main`, and PR previews are enabled by default.

### Option B — Manual static site

1. Push to GitHub.
2. <https://dashboard.render.com> → **New + → Static Site**.
3. Connect the repo and configure:
   - **Build Command:** *(leave empty)*
   - **Publish Directory:** `.`
4. Click **Create Static Site**.

## Notes on puter.js

- Loaded from CDN: `<script src="https://js.puter.com/v2/"></script>`
- Free tier requires no API key. The first request may prompt the user to
  sign in to puter.com in a popup.
- If a model errors or is unavailable, switch to another from the dropdown.

## Support

If ExChatBot helps you and you'd like to support development, you can donate any
amount via GCash:

- **GCash:** `09482887486`

Thanks!
