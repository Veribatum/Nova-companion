# NOVA Companion — Voice Beta

The GitHub Pages app is at https://veribatum.github.io/Nova-companion/

## What has been added
Nova now has a Talk button that uses browser speech recognition, sends the text to a configured AI backend, and reads the response with browser speech synthesis. Typed messages use that backend too. iPhone compatibility varies; if speech recognition is unavailable, use the microphone on your keyboard to dictate into the chat box.

This is push-to-talk, not yet the uninterrupted realtime Grok-style voice experience. No automatic messages, photos, 3D animation, or cross-device sync yet.

## Set up the no-extra-cost Gemini option

The API key must stay on a server, never in GitHub Pages.

1. Create a free Cloudflare Worker in your Cloudflare dashboard.
2. Copy the code from `worker/worker.js` into the Worker, then deploy it.
3. In Worker Settings, add encrypted secrets named `GEMINI_API_KEY` (your Google AI Studio key) and `NOVA_ACCESS_CODE` (a new private code that you choose).
4. In NOVA Companion, open Settings. Enter your Worker HTTPS URL and the private app access code, then return to Nova.
5. Tap Talk to Nova and try speaking. Alternatively, type a message.

The Cloudflare and Gemini free tiers have limits. Check your Gemini project's billing status before use.

## Architecture and privacy

`index.html` is the mobile website. `worker/worker.js` is a backend for Gemini AI calls. The browser stores conversation history and connection preferences locally. Recent chat messages are forwarded through the Worker to Gemini when configured. This is a private single-user prototype, not a production auth system. Do not enter your Gemini key in the website, and do not commit credentials to the repository.

Sign in with ChatGPT may be possible for certain authorized open-source clients but is not implemented in this hosted web app. See https://developers.openai.com/siwc/quickstart
