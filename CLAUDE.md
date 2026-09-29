# Discount Tree Service & Landcare Inc. — website

Pure static HTML/CSS/JS (no build step, no frameworks). Open `index.html` or serve the folder (`python3 -m http.server`).

## Structure
- `index.html` — long scroll-journey homepage
- `tree-removal.html`, `tree-care-services.html`, `landscaping-services.html`, `irrigation-services.html` — service pages (same URLs as the old LP, plus `.html`)
- `css/styles.css` — all styles; tokens on `:root`
- `js/app.js` — reveals, parallax, pinned horizontal gallery, counters, step progress, reviews slider, FAQ, form
- Header, footer, form and shared sections are duplicated in every page. Change all 5 when editing them.

## Brand
- Logo green `#00A060` (sampled from the logo) + black `#0A0C0B`; warm desert neutrals (`--bone`, `--sand`)
- Font: Geist (local, `assets/fonts/Geist`)
- Logos: `DiscountTree_3.png` (white text, for dark backgrounds), `discount-tree-logo-color.png` (dark text, for light backgrounds), `favicon.png` (leaf mark). Don't alter client logos without asking.

## Content sources
- Copy is carried over from the old LP (lp.discountlandcareinc.com) plus the onboarding doc.
- Primary phone (909) 720-0145 (same as the old LP's ad tracking number); secondary (760) 391-8328.
- Images: `assets/content/image/jobs/` = real client job photos (small, from the old LP); `assets/content/image/stock/` = Unsplash (free license).
- Reviews are real quotes from Yelp and BuildZoom. Replace them with Google Business Profile reviews once pulled.

## Pending
- Contact form is a front-end prototype. Wire `submitLead()` in `js/app.js` to GHL or the CRM.
- Google Ads tag (AW-986563782) from the old LP isn't carried over yet. Add it at launch.
- Swap in more real job photos (Instagram / client) as they arrive.
