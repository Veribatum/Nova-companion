# NOVA autonomous check-ins (Cloudflare)

The existing GitHub Pages client continues to talk to the **nova-companion-api** Worker. The repository alone does not deploy the Worker; paste or deploy `worker/worker.js` in Cloudflare.

## Backend setup

1. In Cloudflare **Workers & Pages → KV**, create a namespace named `nova-companion-store`.
2. Open **nova-companion-api → Settings → Bindings**. Add a KV namespace binding with variable name **NOVA_KV**, selecting that namespace.
3. Under **Triggers**, add a Cron Trigger: `0 * * * *` (every hour, UTC). The Worker respects the 9 AM–10 PM quiet window in the America/New_York time zone and a minimum of 8 hours between check-ins. Cron scheduling is not exact delivery timing.
4. Keep `GEMINI_API_KEY` and `NOVA_ACCESS_CODE` secret in Cloudflare settings. Never put their values in GitHub.
5. Deploy the updated `worker/worker.js`. Open the NOVA app → Settings and enable companion check-ins. The frontend then sends this preference to `/preferences`.

## What this implementation actually does

- `scheduled()` writes an AI-generated Nova text message to Cloudflare KV while the phone/app is closed.
- `GET /inbox` returns saved messages to the authenticated app.
- When the app is opened or focused, it imports new server messages into conversation history; it deduplicates by server-generated ID.
- The server can attach a photo chosen from `nova:photos` KV metadata if this key contains an array of `{url}` entries pointing at approved hosted images under `https://veribatum.github.io/`.
- Check-in and photo toggles are optional.

## NOT yet enabled

**iPhone push notifications, SMS, and generation of new images are not implemented.** Cloudflare cron + KV alone cannot display a notification while the app is closed. True Web Push requires HTTPS service worker registration, notification permission, subscription storage, VAPID signing, and a push sender. A private image generation provider also needs a supported API and storage pipeline.

Do not label in-app check-ins as push messages, and do not store sensitive images in a public GitHub repository unless you want anyone to be able to access them.
