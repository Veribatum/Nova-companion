# NOVA Companion — Beta

A mobile-first prototype of a multi-character companion app. Built as a static site for GitHub Pages.

## Deploy

In GitHub repository **Settings → Pages**, select **Deploy from a branch**, branch **main**, folder **/(root)**, then save. The homepage is `index.html`.

## What's implemented

- Responsive roster: Nova, Sylvanas, Samus, Jenny
- Separate character conversation threads with locally saved chat history
- Character-specific **scripted** demonstration replies (not live AI)
- Gallery placeholder
- Preference controls and local conversation clearing

## Not yet implemented

- Real AI conversations, voice, 3D models, photo generation, real notifications, scheduled outbound messages, accounts, cloud memory, or cross-device sync
- Browser check-in toggle is a future preference; it does not run a background service

## Architecture direction

Keep the frontend static on GitHub Pages. A later authenticated serverless backend can secure AI model calls, store memories, schedule opted-in outbound messages, and send web push notifications. Do not commit secrets or personal/private content to this **public** repository. AI API usage and other third-party infrastructure can have separate costs; a ChatGPT subscription does not automatically authorize API usage.

All current content is a product prototype. Character icons are placeholders until authorized, consistent artwork or 3D assets are integrated.
