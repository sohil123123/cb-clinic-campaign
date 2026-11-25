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

## Routing: which clinic a visitor from an ad sees

The central Delhi page decides from the ad click, in this order:

1. The matched keyword names a clinic area or one of its localities
   (`routing.json` → `clinics`): that clinic, wherever the person is.
2. The keyword names Delhi as a whole (`generic_locations`) or somewhere far
   (`far_locations`): the five-clinic page.
3. Location-neutral keyword ("physiotherapy near me"): the clinic nearest the
   person if Google's `loc` id is in `geo-clinics.json`, else Google's
   location of interest (`loci`), else the five-clinic page.

Clinic pages always show their own clinic. On every page the keyword also
pre-selects the concern (`conditions`) and the home-visit option
(`services.home_visit`), and tags the visit with conditions, services and an
`irrelevant` flag for the dashboard.

**Weekly review** (Routing tab in the dashboard):

1. Download the Search terms report from Google Ads (all campaigns, last 7 or
   30 days) and drop it on the Routing tab. Every term is classified with the
   current rules.
2. Look at "needs a rule": neutral terms containing words the rules do not know.
   A locality goes into `clinics`, a city or district into `generic_locations`
   or `far_locations`, a symptom into `conditions`, a treatment into
   `services`, junk into `irrelevant` (and into the Ads negative list).
3. Look at the Google location IDs table for ids with visits that are not
   mapped; add them to `geo-clinics.json` under the nearest clinic.
4. Commit and push `routing.json` / `geo-clinics.json`. The deploy syncs them
   into the page (`scripts/sync-routing.py`); nothing else changes.

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

## Action analytics and the dashboard

Every page loads `analytics.js`, which records anonymous actions (page views,
concern taps, booking opened/sent/failed, call taps, WhatsApp opened/sent,
directions, reviews, FAQ, scroll depth, time on page) and posts them in small
batches to the endpoint in the `cb-analytics-endpoint` meta tag. No names,
phone numbers, form values or message text are ever sent. Automated browsers
are ignored.

The dashboard lives at `https://book.cbphysiotherapy.in/dashboard/`. It asks
for a password, then reads events from the API for a date range and draws
everything in the browser. The password is checked by the API, not the page,
so the page itself holds no secret. `?demo=1` shows sample data.

### API contract (Laravel side)

**Storage** – one table `landing_events`: `id`, `visitor` (36), `session` (36),
`event` (40), `ts` (datetime, from the client), `page` (120), `area` (20),
`device` (10), `referrer` (120), `utm_source`, `utm_medium`, `utm_campaign`,
`utm_term`, `utm_content` (each 120, nullable), `gclid` (bool), `props` (json),
`ip_hash` (64, optional), `created_at`. Index on `ts`, `event`, `page`.

Page views also carry `props.ad` with the Google Ads ValueTrack values when the
account tracking template is set: `loc`, `loci`, `kw`, `mt`, `net`, `dev`,
`creative`, `cid`, `agid`. Nothing else needs to change on the API side; they
live inside `props`.

**`POST /api/landing/events`** – body is JSON sent as `text/plain` (so no CORS
preflight), shape:

    {"v":1,"visitor":"…","session":"…","sent_at":"ISO",
     "events":[{"event":"page_view","ts":"ISO","page":"/physiotherapy-near-me-saket/",
                "area":"saket","device":"mobile","referrer":"google.com",
                "utm_source":"google","utm_medium":"cpc","utm_campaign":"…",
                "utm_term":"","utm_content":"","gclid":1,"props":{…}}]}

Accept up to 25 events per request, 60 requests per minute per IP, origin
`https://book.cbphysiotherapy.in` only, return `204`. Drop events whose `ts`
is more than a day off the server clock. Never store names or phone numbers
(the pages do not send them).

**`GET /api/landing/events?from=YYYY-MM-DD&to=YYYY-MM-DD`** – requires
`Authorization: Bearer <DASHBOARD_PASSWORD>` where the password is an `.env`
value; return `401` otherwise. Dates are inclusive, Indian time. Respond with
`{"events":[…rows…]}` using the column names above (`props` may be a JSON
string). Cap at 90 days per request. Same CORS origin.

## Cloudflare cache

The subdomain is proxied by Cloudflare, which caches pages and files at its
edge. Versioned assets are safe, but a fresh deploy of a page or of the rule
files can stay invisible until the edge copy expires. The deploy workflow
purges the cache for the subdomain automatically when two repository
secrets exist:

| Secret | Value |
|---|---|
| `CF_ZONE_ID` | the zone id shown on the Cloudflare overview page for the domain |
| `CF_API_TOKEN` | an API token with the single permission *Zone, Cache Purge, Purge* for that zone |

Until they are added, purge manually in Cloudflare after a deploy (Caching,
Configuration, Purge Everything), or wait for the edge TTL.

## Opening hours

The hours shown on the clinic cards, the clinic landing screens and
"Getting here" come from one line near the top of
`physiotherapy-near-me-delhi/app.js`: `const HOURS='9am–8pm';`. Change it
there when the season changes and push.

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
