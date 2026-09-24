# Volo AI

**Never miss a call again.** Official website for Volo AI — the AI voice receptionist for UK small businesses. Volo answers every call 24/7: books appointments, handles enquiries and FAQs, captures caller details, saves data to your tools, and emails you the transcript.

- 📧 Email: `hello@voloai.uk`
- 💬 WhatsApp: `+92 314 4781120` (all CTAs open WhatsApp with a prefilled message)
- 🇬🇧 Built for UK clients and customers · pricing in **£ GBP**
- ⏰ Volo answers 24/7 — your team still rings first, Volo only steps in after 5 seconds

---

## How it works

1. A customer calls your existing UK number.
2. Your team's phone rings. If a real person picks up within 5 seconds, the call is theirs.
3. If nobody answers, Volo picks up instantly — books the appointment, handles the enquiry or FAQ, captures the caller's details, saves it to your database and sends you the full transcript.

---

## Pricing

| Plan | Price | What's included |
|------|-------|-----------------|
| 14-day free trial | £0 | Full access, no card required |
| **Lite** | £29/month | 1 number · 50 calls/mo · £0.15/min overage |
| **Business** (most popular) | £79/month | 1 number · 300 calls/mo · £0.12/min overage |
| **Pro** | £129/month | Up to 3 numbers · unlimited calls · £0.10/min overage |
| Annual (any plan) | 2 months free | Pay 10 months: £290 / £790 / £1,290 per year |

---

## Project Structure

```
.
├── index.html                # Landing page (hero, ROI calculator, features, industry demos, pricing, FAQ)
├── comparison.html           # Volo vs human receptionist / voicemail / other AI
├── privacy-policy.html       # Legal — UK GDPR, call recording notice, sub-processors
├── terms-and-conditions.html # Legal — plans, billing, overages, recording
├── 404.html                  # Custom error page
├── styles.css                # "Aurora" theme — premium dark + voice gradient
├── script.js                 # Navigation, FAQ, counters and reveal interactions
├── voice-demo.js             # User-initiated salon call demo with transcript fallback
├── roi-calculator.js         # Interactive missed-call ROI calculator
├── demos.js                  # Industry demo cards, YouTube lightbox, VideoObject schema
├── robots.txt                # SEO crawler rules
├── sitemap.xml               # index + comparison + legal pages
├── scripts/make_og.py        # Generates assets/images/og-image.png (1200×630)
└── assets/
    ├── logo.svg              # Volo AI logo
    ├── favicon.svg           # Volo AI favicon
    └── images/og-image.png   # Social-share preview image
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Voice demo

The landing page uses `voice-demo.js` and the browser's Web Speech API. Visitors must press **Play demo**; audio never autoplays. Stop, Replay and the Voice audio checkbox control playback. The transcript continues if speech is unsupported, blocked, or fails. Leaving the page or hiding the tab stops the demo.

The scripted example is a **hair & beauty salon booking** — price enquiry, Saturday slot, name and mobile number, confirmed booking — so the hero demo matches the first industry demo card. It stays four spoken turns and seven transcript lines because `scripts/browser-tests.html` asserts those counts.

This is an illustrative conversation, **not a live AI call**. It does not request microphone access, record audio, submit enquiries, or connect to Vapi. Voices and pronunciation depend on the browser/OS; a UK English voice is preferred when available. For a consistent branded voice, provide a licensed recording or a properly configured backend integration. Never put private service keys in frontend JavaScript.

The old pricing-toggle script was removed; monthly and annual pricing remain visible as separate cards. The video lightbox is back, but only for the `#demos` section — it is driven by `demos.js` and embeds YouTube through `youtube-nocookie.com` only after a visitor clicks a card.

## Industry demo videos

The landing page has a `#demos` section with five cards, one for each target business: hair & beauty salons, driving schools, pet groomers, physiotherapy & sports massage, and aesthetics & beauty clinics. Markup lives in `index.html` (static, so the text is crawlable), styling in the `/* demos */` block of `styles.css`, behaviour in `demos.js`.

The hair & beauty salon card is configured with its YouTube video and opens the privacy-friendly lightbox on click. The other cards remain in a "demo coming soon" state and link to WhatsApp. To publish another video, paste its YouTube ID into the `demos` map in `demos.js` (or define `window.VOLO_DEMOS` before that script loads) — the card then shows the real thumbnail, a duration badge and a **Watch demo** button. Nothing is requested from YouTube until a visitor presses play, and the iframe is removed again when the dialog closes.

Add `uploadDate` (`YYYY-MM-DD`, the day the video was published) as well and `demos.js` writes a matching `VideoObject` into the page's structured data. For guaranteed video rich results you can also paste a static `VideoObject` block into the `@graph` in `index.html` once a video is live.

## Validation

From the project root:

```bash
python3 scripts/validate_site.py
node --check script.js
node --check voice-demo.js
node --check roi-calculator.js
node --check demos.js
python3 -m http.server 8000
```

Open `http://localhost:8000/scripts/browser-tests.html` for dependency-free browser regression tests. It must finish with `DONE` and no `FAIL` lines. Tests load the real pages; only speech is mocked and demo timers accelerated. They cover sequencing, replay, cancellation, mute, unsupported/error/stalled speech, ROI boundaries, FAQ state, industry demo cards and the YouTube lightbox, mobile navigation, main landmarks and six viewport sizes. Mock tests do not establish audible quality or physical Safari/iPhone compatibility. Run the suite with normal browser timing: Chrome's `--virtual-time-budget` can race iframe resize/media-query events and give false failures for desktop navigation restoration.

## Deployment checklist — still requires release verification

- Deploy the HTML, CSS, JavaScript and assets together; exclude `scripts/` from the public build when practical.
- Serve over HTTPS and configure the host's custom 404 response to return HTTP 404.
- Use revalidation for unversioned HTML/CSS/JS; do not apply immutable caching without content-hashed filenames.
- Configure host-level `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a suitable `Permissions-Policy` and a tested Content Security Policy. Inline styles/scripts and Google Fonts currently need to be accounted for; do not copy a restrictive CSP without testing it.
- Test the deployed site on physical iOS Safari and Android Chrome: audible demo playback, stop/replay, rotation, keyboard navigation, reduced motion and slow/offline connections.
- Verify contact details, pricing, legal/privacy statements and service claims with the business owner. Frontend changes cannot certify GDPR compliance, service uptime or actual backend behavior.
- Check production performance/accessibility with browser audits. No Lighthouse score, WCAG certification, monitoring service or live backend integration is claimed by this repository.

## SEO and accessibility

- Main landmarks, skip links, visible focus, reduced-motion support and no-JavaScript navigation fallback
- Page titles, descriptions and canonicals; Open Graph/Twitter coverage varies by page
- JSON-LD: `Organization`, `Product` (with pricing/offer data), `WebSite`, an `ItemList` of the five industry demos and a `FAQPage` on the landing page
- Semantic HTML5, FAQ accordion, internal links between index and comparison
- Industry keyword targeting in `#demos`: one "AI receptionist for …" heading per target business, a five-item industry FAQ block, and a keyword-led title and description
- `sitemap.xml` lists all pages; `robots.txt` allows all crawlers
- Preconnected fonts, reduced-motion support, scroll-reveal animations

## Notes

- Canonical URLs, sitemap and JSON-LD use `https://voloai.uk/` — if your live domain differs, replace it across `*.html`, `sitemap.xml` and `robots.txt`.
- If you add pricing changes, update all of: `index.html` (pricing + annual cards + JSON-LD offer), `terms-and-conditions.html` (billing section), and this README.
- Generate a fresh social preview with `python3 scripts/make_og.py` (requires Pillow).
