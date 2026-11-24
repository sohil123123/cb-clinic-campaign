# CB Physiotherapy campaign pages

Live site: **https://book.cbphysiotherapy.in/**

Google Ads landing page: **https://book.cbphysiotherapy.in/physiotherapy-near-me-delhi/**

This repository *is* the website. Whatever is on the `main` branch is what
visitors see. There is no build step and no server code: plain HTML, CSS,
JavaScript and images.

## How changes go live

1. A change is pushed to the `main` branch (normally by Claude Code in a
   session on this repository).
2. GitHub Actions runs the **Deploy to VPS** workflow automatically. It copies
   the files to the Hostinger VPS over SSH and then loads the live page to
   confirm it responds.
3. About one minute later the change is live.

You can watch each deploy under the **Actions** tab on GitHub. A green tick
means the files are on the server and the live page answered. A red cross
means something went wrong; the page keeps serving the previous version until
the next successful deploy.

### Undoing a change

Ask Claude to *revert the last change* (or name the change). It pushes a
revert commit to `main` and the previous version is redeployed the same way.

## Repository layout

| Path | Purpose |
|---|---|
| `index.html` | Root of the subdomain. Forwards to the campaign page, keeping `gclid` and `utm_*` parameters. |
| `robots.txt` | Allows crawling. Each campaign page carries its own `noindex` tag. |
| `physiotherapy-near-me-delhi/` | The Delhi landing page: `index.html`, scripts, styles and images. |
| `physiotherapy-near-me-delhi/clinic-reviews.js` | Google rating and review count per clinic. Edit this weekly. |
| `physiotherapy-near-me-delhi/polish.css` | Loaded last: readability sizes, the Call / WhatsApp / Book quick actions, hero tweaks. Put small style overrides here. |
| `.github/workflows/deploy.yml` | The automatic deployment. |

Future campaign pages go in their own folder next to `physiotherapy-near-me-delhi/`
and become available at `https://book.cbphysiotherapy.in/<folder-name>/`.

## One-time server setup (technical, already done or to be done once)

**CloudPanel**

1. Add a site: type *Static HTML Site*, domain `book.cbphysiotherapy.in`.
   CloudPanel creates a site user and a document root such as
   `/home/<siteuser>/htdocs/book.cbphysiotherapy.in`.
2. DNS: add an **A record** for `book` pointing to the VPS IP address.
3. SSL: once DNS resolves, issue the Let's Encrypt certificate from the site's
   SSL/TLS tab and keep the HTTPS redirect on.
4. SSH key: generate a key pair (`ssh-keygen -t ed25519 -C deploy -f deploy_key`)
   and paste the contents of `deploy_key.pub` into the site user's SSH keys in
   CloudPanel (site → SSH/FTP). Never use the root user for deploys.

**GitHub** (repository → Settings → Secrets and variables → Actions)

| Secret | Value |
|---|---|
| `VPS_HOST` | VPS IP address or hostname |
| `VPS_USER` | the CloudPanel site user |
| `VPS_SSH_KEY` | full contents of the private `deploy_key` file |
| `VPS_PATH` | the document root, e.g. `/home/<siteuser>/htdocs/book.cbphysiotherapy.in` |
| `VPS_PORT` | optional, only if SSH is not on port 22 |

After the secrets exist, open **Actions → Deploy to VPS → Run workflow** once
to do the first deploy by hand, or push any change to `main`.

Nginx needs no custom rules. It serves each folder's `index.html` and keeps
query parameters on the trailing-slash redirect. Use the trailing-slash URL as
the Google Ads final URL.

## Clinic landing pages (one per clinic, same content)

`areas.json` lists clinic pages such as `physiotherapy-near-me-saket`. At
deploy time `scripts/build-areas.py` copies the Delhi page into each folder
with that clinic's title and description and a `cb-area` tag. In the browser
the page then leads with that clinic: headline "Near You in Saket", the Saket
card first with the other four behind a link, Saket pre-selected in the form,
calls routed to the Saket number, and leads tagged `google-ads-saket-landing`.

- To add a clinic page, add an entry to `areas.json` and push. The folder
  appears at `https://book.cbphysiotherapy.in/physiotherapy-near-me-<slug>/`.
- Content edits are made once, in `physiotherapy-near-me-delhi/`; every clinic
  page picks them up on the next deploy.
- `?area=saket` or `?area=malviya-nagar` on the Delhi URL does the same thing
  without a separate folder, handy for testing.
- To preview locally run `python3 scripts/build-areas.py` from the repository
  root; the generated folders are not committed.

## Images and speed

Large photos have `-800.webp` and `-1200.webp` variants next to the original
and are referenced with `srcset`, so phones download the small one. The map
library (Leaflet) and OpenStreetMap tiles load only when the map scrolls into
view or a clinic pin is tapped. When adding a new photo, export it at 1200px
wide as WebP and give the `<img>` `width`, `height` and `loading="lazy"`.

## Before advertising

- The booking form posts to the main site's API at
  `https://cbphysiotherapy.in/api/landing/book-appointment`, which emails the
  team and saves the lead to the CRM. The thank-you message appears only after
  the API confirms the save; otherwise the visitor sees an error with the call
  option. WhatsApp stays an optional follow-up. The endpoint URL is the
  `data-endpoint` attribute on the form in `index.html`.
- No Google Ads or Tag Manager tag is on the page yet. Add it and test one
  conversion per saved request. Keep names, phone numbers, health concerns and
  WhatsApp message text out of analytics.
- Verify the ratings and counts in `clinic-reviews.js` against each Google
  listing. The hero badge shows the Delhi-wide figure from `cbReviewSummary`
  in the same file; keep it in step with the clinic rows.
- Test the live URL with a query string on a phone: four care cards, five map
  pins and clinic selections, fees, the Book Now popup, call and WhatsApp
  links.

## Weekly Google review update

Edit `physiotherapy-near-me-delhi/clinic-reviews.js` and change the rating and
count for each clinic together. Leave both `null` until a clinic has a reliable
figure. The hero badge uses the `cbReviewSummary` line in the same file (the
Delhi-wide rating and review count). If that line is removed, the hero falls
back to the sum of the clinic rows and their count-weighted average rating.
The same figures feed the structured data that search engines read.
