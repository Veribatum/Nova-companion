# Nova Companion — enabling autonomous messages and photo notifications

## Code status

The repository contains implemented Web Push subscription, Service Worker, Cloudflare KV inbox, scheduled text generation, stored gallery photo rotation, and a GitHub Actions Worker deployment workflow. **These features are not live until Cloudflare configuration and deployment are completed.**

## One-time Cloudflare setup

1. In Cloudflare create a KV namespace named `nova-companion-store`.
2. Bind that namespace to the existing `nova-companion-api` Worker with variable name `NOVA_KV`. In `worker/wrangler.toml`, add:
   ```toml
   [[kv_namespaces]]
   binding = "NOVA_KV"
   id = "YOUR_NAMESPACE_ID"
   ```
3. The Worker cron trigger is already in `worker/wrangler.toml` (hourly). It does nothing unless check-ins are enabled. The scheduler observes quiet hours and per-message spacing.
4. Generate **one** VAPID key pair with the vetted @mmmike/web-push/vapid package. Example from a Node console inside `worker/` after npm install:
   ```bash
   node --input-type=module -e "import {generateVapidKeys} from '@mmmike/web-push/vapid'; console.log(await generateVapidKeys())"
   ```
   In Cloudflare Worker Settings, add encrypted secrets `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, and `VAPID_SUBJECT`. VAPID_SUBJECT is a contact URI such as `mailto:your-email@example.com` using your actual address. Do not commit keys.
5. Keep your existing `GEMINI_API_KEY` and `NOVA_ACCESS_CODE` secrets.
6. To deploy from GitHub automatically, configure repository Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Use a restricted token scoped only to this Worker/account. The workflow `.github/workflows/deploy-worker.yml` deploys on changes to `worker/` and via manual dispatch. Alternatively, deploy locally using `cd worker && npm install && npx wrangler login && npx wrangler deploy`.
7. On iPhone open https://veribatum.github.io/Nova-companion/ in Safari, Add to Home Screen, open the installed app, then use Settings → Enable phone notifications and approve the system permission. The browser must be able to register a service worker and the backend must provide the VAPID public key.
8. In Settings enable check-ins. In Gallery add photographs for the private Cloudflare photo pool; use the test-send control to verify delivery. The gallery photos are stored in KV and can be selected for future messages.

## Accurate capabilities and limitations

- **Autonomous texts:** Gemini produces them server-side on a scheduled cron; the Worker stores them in KV. A push is sent to subscribed browsers when VAPID and subscriptions are configured.
- **Photo messages:** chooses from existing uploaded JPEG photographs. The user can trigger a test delivery. The photos are stored in KV and returned only through access-code-protected app endpoints.
- **New AI-generated photos:** NOT implemented. Perchance's public website is not a guaranteed unattended free image generation API.
- **Actual SMS texts:** NOT implemented. These are web push notifications and messages in the companion app.
- **Privacy:** treat the access code as a secret. KV-stored image data is not end-to-end encrypted. Do not add private or adult photographs to a public GitHub repository.
- **Delivery:** push timing depends on device settings, network connectivity, browser permissions, and provider availability.
