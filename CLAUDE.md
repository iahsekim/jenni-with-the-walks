# Jenni with the Walks

Static one-page site for Jenni's Germantown (Nashville) dog walking business. No build step. The site is `public/index.html` + `public/assets/`; `netlify/functions/` holds the email function. Netlify deploys automatically on every push to `main`.

## Editing rules
- All markup, CSS, and JS live in `public/index.html`. Photos live in `public/assets/` (JPEG, max ~1000px on the long side).
- Design system (tokens in the `:root` block at the top of the CSS):
  - Tomato red `#EF3E28` = brand surfaces (hero, footer, accents). Butter yellow `#F5D980` = tap targets and highlights. Espresso `#251B17` = text, outlines, structure. Warm cream `#FFF7E8` = page background. Soft butter `#FBEBC2` = alternate section backgrounds.
  - Fonts: Bagel Fat One (display), Bricolage Grotesque (body), Space Mono (labels, prices).
  - Thick 3px ink borders and hard offset shadows; no gradients.
- Must stay mobile-first: check at 390px wide, no horizontal scroll, the sticky "Book a free meet and greet" bar stays at the bottom on phones.

## Business facts (don't invent others)
- Service area: Germantown, Nashville only. No set routes; walks are booked by length of time.
- Services: Express Walk $14 · The OG Walk $25 (30 min) · The Deluxe $44 (60 min) · Dog Transport $20 one way / $40 round trip.
- Add-ons: +$7 per extra dog, +$7 per dog over 70 lbs.
- Payment: Venmo, Zelle, or cash. No app, no GPS, no insurance/licensing claims, no overnights.
- Contact: jenniwiththewalks@gmail.com. Instagram @hi_sedona. Dogs: Sedona and Tofu (rescues).

## Meet and greet form
- Netlify Form named `meet-greet` (fields: name, phone, email, option_1..3, message, interest). Submitted by JS when `MEET_ENDPOINT = "netlify"`.
- Emails are sent by `netlify/functions/submission-created/` (runs on every non-spam submission): a branded email to jenniwiththewalks@gmail.com plus a confirmation copy to the submitter. Templates are in `emails.mjs` (table-based, inline styles). Sends via Gmail SMTP using Netlify env vars `GMAIL_USER` and `GMAIL_APP_PASSWORD`.
- Netlify's built-in form email notification should stay off, or Jenni gets duplicates.
- Any new field must also exist as an input in the static HTML form or Netlify drops it.
