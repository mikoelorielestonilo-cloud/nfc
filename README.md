# Black & Gold NFC Digital Business Card

## Files to upload
Upload these files to the root of your existing GitHub repository, replacing the matching files:
- `index.html`
- `styles.css`
- `script.js`
- `customers.json`

Keep `README.md` if you want these instructions in the repository.

## Add or edit a customer
Open `customers.json` and edit an object inside the `"customers"` array.
- `id`: short unique URL identifier; use lowercase letters/numbers/hyphens, e.g. `maria-dc`
- `name`, `title`, `company`, `bio`
- `photo`: direct public HTTPS image URL (leave `""` for initials)
- `phone`, `email`, `website`
- `socials`: public profile URLs for Facebook, Instagram, LinkedIn, Messenger, WhatsApp, TikTok, YouTube, X

Keep JSON syntax valid. Use double quotes around keys and string values. Do not add a comma after the final property/object.

## URLs
For id `demo`:
`https://YOUR-USERNAME.github.io/Nfc-Cards/?id=demo`

For id `maria`:
`https://YOUR-USERNAME.github.io/Nfc-Cards/?id=maria`

Write each customer's full URL to their NFC card as a URL/URI record. The card only stores the URL; profile data stays on the website.

## Publish
GitHub repository → Settings → Pages → Deploy from a branch → `main` → `/(root)`.
After committing updates, wait a few minutes and refresh the site.

## Privacy
GitHub Pages content and `customers.json` are public. Only publish information the customer explicitly agrees to share. Do not put private information or passwords here.
