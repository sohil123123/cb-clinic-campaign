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
  listing. Dwarka is still empty, so the combined badge in the hero shows a
  generic label until all five rows are filled.
- Test the live URL with a query string on a phone: four care cards, five map
  pins and clinic selections, fees, the Book Now popup, call and WhatsApp
  links.

## Weekly Google review update

Edit `physiotherapy-near-me-delhi/clinic-reviews.js` and change the rating and
count for each clinic together. Leave both `null` until a clinic has a reliable
figure. Once all five rows are filled, the hero shows the total count and the
count-weighted average rating.
