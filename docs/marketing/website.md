# Website — husoga.app

The website is a single `index.html` at the repo root. It serves as the landing page
and hosts the privacy policy required by both stores.

---

## What's on the page

1. **Hero** — app name, tagline, App Store / Play Store badges (links TBD post-launch)
2. **How it works** — brief description of the condition overview concept
3. **Free vs Pro** — feature comparison
4. **Privacy Policy** — full Swedish policy at `#privacy` anchor
5. **Footer** — copyright, privacy link

The privacy policy text lives in both `index.html` and `docs/marketing/privacy-policy.md`.
Keep them in sync if the policy changes.

---

## Deploy to Cloudflare Pages

This must be done before App Review (#81). The URL `https://husoga.app/#privacy`
must resolve for Apple to approve the app.

### Steps

1. Log in to [Cloudflare Pages](https://pages.cloudflare.com)
2. Create a new Pages project:
   - Connect to GitHub → select `HasanKhatib/HusOga`
   - Build command: *(leave blank — no build step)*
   - Build output directory: `/` (root)
   - Branch: `main`
3. Cloudflare will deploy and give you a `*.pages.dev` URL — verify it loads
4. Add custom domain `husoga.app`:
   - Pages project → Custom domains → Add domain → `husoga.app`
   - Follow Cloudflare's DNS instructions (point your domain's nameservers to Cloudflare, or add a CNAME)
5. Verify:
   - `https://husoga.app` loads the homepage
   - `https://husoga.app/#privacy` scrolls to the privacy section

### Alternative: manual upload (no GitHub connection)

1. Cloudflare Pages → Create project → Direct Upload
2. Upload `index.html` from the repo root
3. Assign custom domain as above

---

## Post-launch: adding store badges

Once both apps are live, update `index.html` to replace the badge placeholders with
real store URLs:

```html
<!-- iOS -->
<a href="https://apps.apple.com/se/app/husoga/id6761786637">
  <img src="app-store-badge.svg" alt="Ladda ned i App Store" />
</a>

<!-- Android -->
<a href="https://play.google.com/store/apps/details?id=com.husoga.app">
  <img src="google-play-badge.svg" alt="Hämta på Google Play" />
</a>
```

Badge image files (SVG) can be downloaded from Apple and Google's brand resources pages.

---

## Domain

Domain: `husoga.app`  
Registrar: *(update this when confirmed)*  
DNS: Cloudflare  
SSL: Automatic (Cloudflare handles HTTPS)
