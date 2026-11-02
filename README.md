# Jenni with the Walks

Dog walking in Germantown, Nashville. Static site deployed on Netlify.

- `index.html` — the whole site
- `assets/` — photos
- Meet and greet requests arrive via Netlify Forms (`meet-greet`) and are emailed to jenniwiththewalks@gmail.com.
- Branded request and confirmation emails are sent by `netlify/functions/submission-created/` through Gmail (env var `GMAIL_APP_PASSWORD`).
