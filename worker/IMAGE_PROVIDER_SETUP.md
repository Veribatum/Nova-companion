# NOVA image generation integration

The Cloudflare Worker `/photos/generate` endpoint now tries:
1. Pollinations (when `POLLINATIONS_API_KEY` is configured), using `black-forest-labs/flux.1-schnell` by default.
2. Gemini as fallback if the Pollinations request fails and `GEMINI_API_KEY` exists.

## One-time connection
1. Create a **secret** Pollinations API key at https://enter.pollinations.ai/keys. Check the account's Pollen balance and pricing before generating. Pollinations API image generation is **not guaranteed free**.
2. On Cloudflare Dashboard > Workers & Pages > `nova-companion-api` > Settings > Variables and Secrets, add a **secret** named `POLLINATIONS_API_KEY`. Paste the key there, not in the GitHub repository or companion frontend.
3. Optionally set `POLLINATIONS_IMAGE_MODEL` to a supported model from https://gen.pollinations.ai/image/models.
4. Redeploy the Worker only if its current deployment predates the code change. The repository GitHub Action normally auto-deploys commits under `worker/**`.
5. In NOVA chat, use “Generate me a photo.” Images attach to chat and are saved locally, and to server KV if configured.

NOVA's API access code is separate and remains in the frontend settings. Google image quota errors no longer prevent trying Pollinations when its key is configured.

The provider requires authentication. Do not attempt unauthorized scraping of Perchance or embed secret keys in the public GitHub Pages code.