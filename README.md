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
| `robots.txt` | Allows crawling, points to `sitemap.xml`, keeps the dashboard and demo out. The central Delhi page carries `noindex`; clinic pages are indexable. |
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
2. The keyword names somewhere far (`far_locations`) or another Delhi area
   without a clinic (`other_delhi`): the five-clinic page.
3. Location-neutral keyword ("physiotherapy near me") or a Delhi-wide one
   ("physiotherapy in delhi", `generic_locations`): the clinic nearest the
   person if Google's `loc` id is in `geo-clinics.json`; otherwise the central page. Google's location of interest (`loci`) is recorded but no longer used for routing (dropped 2026-11-26: 32 routed visits, no leads).

**Switch:** `auto_handover` in `routing.json`. `false` (since 2026-11-27, a
test) keeps everyone on the central page; the rules still run and the
would-be clinic is recorded as `route.would` / `route.would_clinic`, which the
dashboard shows under the central page as "hand-over off: would have gone to".
Set it back to `true` and push to restore hand-overs. Keyword pre-selection of
the care area is independent of this switch.

A hand-over carries the ad parameters plus `r` (`geo`, `keyword`, `area`) so
the clinic page knows how the visitor arrived. When someone on the central page
picks a clinic themselves (clinic pills, clinic cards), the link carries the
same parameters with `r=pick`: the clinic page records the arrival as a manual
choice, the lead source becomes `google-ads-delhi-pick-<clinic>`, and the
central page records a `clinic_pick` event. The dashboard's "By page" table
credits each visit once, to the page that did the work: direct arrivals and
automatic hand-overs count for the clinic page; a clinic chosen by hand counts
for the central page as one journey (central time plus clinic page time, with
any booking or call made on the clinic page).

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
   into the page (`scripts/build-clinics.py`); nothing else changes.

### Care area pre-selected from the keyword

Every page (clinic and central) checks the ad keyword against the `conditions`
lists in `routing.json`: `spine` (back, neck, disc, sciatica...), `joint`
(knee, shoulder, arthritis...), `rehab` (surgery, fracture, ACL, sports
injury...) and `other` (nerve, numbness, posture, balance...). A match opens
the page with that care area already selected, so "back pain physiotherapy
near me" lands on the back-or-neck panel and the booking popup is pre-filled.
When several match, `condition_priority` decides (rehab, then spine, joint,
other). A neutral keyword shows the standard page. The matched conditions are
recorded with the visit, so the dashboard's Routing tab can compare lead rates
by condition. To tag a new symptom word, add it to the right list and push.

## Clinic landing pages (one per clinic)

The five clinic pages (`physiotherapy-near-me-saket`, `-greater-kailash`,
`-safdarjung-enclave`, `-vasant-kunj`, `-dwarka`) are built at deploy time by
`scripts/build-clinics.py` from two files:

- `clinic-template/index.html`: the page itself (one file, styles and script
  inline). Placeholders such as `{{SHORT}}` are filled per clinic.
- `clinics.json`: everything that differs per clinic: address, phone, map
  position, locality line, nearby areas, Google rating and review count,
  Google listing id, hero photo, the clinic head and treating physiotherapists
  (names, photos and profile links from cbphysiotherapy.in), and the patient
  reviews shown per care area. The central monitoring team is listed once at
  the top of the file.

What each page carries for search engines: an indexable title and
description, canonical URL, Open Graph tags, and JSON-LD for the clinic
(`MedicalClinic` with address, geo, opening hours, rating, staff, services and
fee offers), an `FAQPage` and breadcrumbs. `sitemap.xml` lists the five pages;
the central Delhi page stays `noindex` as before.

How the page behaves: the first screen is the clinic photo, name and
tagline, then headline, locality with directions, Google rating and the three
actions. Choosing a care area (back or neck, knee or joint, injury or
surgery, other ortho or neuro) rewrites the first-visit plan, the fee note,
the FAQ answer, the reviews and the WhatsApp message. Booking opens a popup
that posts to the same `book-appointment` API with `source`
`google-ads-<clinic>-landing`, `clinic`, `concern` (when chosen) and
`preferred_time`, then offers to send the same request on WhatsApp.

- To change copy on all five pages, edit the template and push.
- To change one clinic's facts, team or reviews, edit `clinics.json` and push.
- To preview locally run `python3 scripts/build-clinics.py` from the
  repository root and open the generated folder; generated folders are not
  committed.
- Reviews in `clinics.json` were taken from the patient reviews published on
  cbphysiotherapy.in (attributed to each clinic or its physiotherapists) and
  chosen per care area. Replace or add from the Google Business Profile when
  that export is available; keep author names as published.

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
so the page itself holds no secret. `?demo=1` shows sample data. It opens on
today's Google traffic (range Today, source google); Yesterday, 7 days and
28 days are one click away.

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

### Spend feed from Windsor.ai (live, no server work)

Google Ads is connected to Windsor.ai (account "CB Physiotherapy Ads",
372-567-7417, under the simplimed Windsor login). The Decisions tab reads it
directly from the browser: paste the Windsor.ai API key once (Windsor.ai,
Settings, API key) into "Windsor.ai API key" on the Decisions tab. The key is
kept in that browser's local storage only, never in the page, the repository
or the server. The dashboard then pulls campaigns, keywords with match type,
search terms and searcher locations for the selected range plus the previous
period, in rupees. Rows are kept only when Windsor reports the CB account ID, and the Jaipur campaign is dropped, so only the Delhi campaigns reach the dashboard. Google keeps
adjusting the last three days, so yesterday's numbers can move slightly.
Order of preference when several sources exist: Windsor.ai key, then the
nightly feed API below, then uploaded reports.

The same feed fills "Maps card and calls" on the Decisions tab: clicks by
click type per campaign (Call taps, message taps, Directions, place-sheet
opens, clicks to our pages) and Google's forwarding-number call count. This
is where most of the Maps-card activity lives, since those people never reach
the website; read the website lead rate next to it, not instead of it.

### Spend feed and change log (Laravel side, second step)

The dashboard's **Decisions** tab joins Google Ads spend with the visits and
leads above, so bids, keywords, negatives, routing rules and landing changes
can be decided from one table. Spend arrives from a Google Ads Script
(`scripts/google-ads-export.js`, installed inside the Google Ads account; the
README header of that file has the steps) and is stored by two more routes.
Until they exist the tab works from Google Ads CSV exports uploaded in the
browser, which never leave that browser.

**Storage** – table `landing_ads`: `id`, `date` (date), `kind` (12: campaign,
keyword, search_term, location), `campaign` (120), `ad_group` (120), `key`
(200: campaign name, keyword text, search term, or Google location ID),
`match_type` (12), `status` (20), `impressions` (int), `clicks` (int), `cost`
(decimal 10,2, INR), `conversions` (decimal 8,2), `updated_at`. Unique index on
(`date`, `kind`, `campaign`, `ad_group`, `key`, `match_type`); index on `date`.

**`POST /api/landing/ads`** – requires `Authorization: Bearer <ADS_FEED_TOKEN>`,
a separate `.env` value given only to the Google Ads Script. Body is JSON:

    {"v":1,"source":"google-ads-script","from":"YYYY-MM-DD","to":"YYYY-MM-DD",
     "rows":[{"date":"YYYY-MM-DD","kind":"keyword","campaign":"…","ad_group":"…",
              "key":"physiotherapy near me","match_type":"phrase","status":"enabled",
              "impressions":120,"clicks":9,"cost":412.5,"conversions":1}]}

Upsert every row on the unique key (the script re-sends the last three days
each night, so later values replace earlier ones). Up to 400 rows per request.
Return `204`. No CORS needed (server to server).

**`GET /api/landing/ads?from=YYYY-MM-DD&to=YYYY-MM-DD[&kind=…]`** – same
`Authorization: Bearer <DASHBOARD_PASSWORD>` and CORS origin as the events
GET. Respond with `{"rows":[…]}` using the columns above, dates inclusive, cap
90 days. Return `404` while the route does not exist; the dashboard then falls
back to uploads.

**Change log** – table `landing_notes`: `id`, `date` (date), `category` (20),
`text` (300), `created_at`. Routes, all with the dashboard password and the
same CORS origin: `GET /api/landing/notes` → `{"notes":[…]}` (newest first,
cap 500); `POST /api/landing/notes` with JSON `{"date","category","text"}` →
`201 {"note":{"id",…}}`; `DELETE /api/landing/notes/{id}` → `204`. Add
`DELETE` and `Content-Type` to the CORS allow lists for this route.

## Google Ads conversions on the pages

Every page loads the Google Ads tag `AW-339021647` next to GA4 and reports:

- **Booking request** (`AW-339021647/nu_0CI6insEdEM-e1KEB`), value 499 INR, fired
  once when the booking form is accepted by the API.
- **Calls from website** (`AW-339021647/ZMmZCOCDnsEdEM-e1KEB`): the page
  passes its own clinic number as `phone_conversion_number`, so for visitors
  who arrived from an ad Google swaps the displayed number for a forwarding
  number and counts calls of 60 seconds or more. Everyone else sees the real
  number. The central page passes the central number.

Both are Primary actions in Google Ads; the dashboard does not depend on them.

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
`clinics.json` (`hours`, `open_hour`, `close_hour`). Change them there and push; every page and the schema pick it up.
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
- No Google Ads conversion tag is on the page yet. Add it (booking sent, call
  tap, WhatsApp send as three conversion actions) and test one conversion per
  saved request, so Smart Bidding can optimise for leads. Keep names, phone numbers, health concerns and
  WhatsApp message text out of analytics.
- Verify the ratings and counts in `clinic-reviews.js` against each Google
  listing. The hero badge shows the Delhi-wide figure from `cbReviewSummary`
  in the same file; keep it in step with the clinic rows.
- Test the live URL with a query string on a phone: four care cards, five map
  pins and clinic selections, fees, the Book Now popup, call and WhatsApp
  links.

## Weekly decisions loop (Decisions tab)

Open the dashboard, pick the last 7 or 28 days, and go to **Decisions**.

1. Check the tiles: spend, clicks, visits that reached our pages, leads, cost
   per lead. If "clicks reaching our pages" is low, the ad final URLs are
   still pointing somewhere else; fix that before trusting the rest.
2. Set the **target cost per lead** once (what a lead is worth to the clinics)
   and the **minimum clicks** before a row earns a suggestion (25 by default;
   fewer clicks is noise). Both are remembered in the browser.
3. Read **Actions to consider this week**, then the Locations, Keywords and
   Search terms tables. Suggestions are prompts: raise or lower a location bid
   adjustment, pause a keyword, add a negative, add a converting search term
   as an exact keyword, map an unmapped Delhi location in `geo-clinics.json`,
   add a routing rule in `routing.json`, or change a page.
4. Make the changes in Google Ads or the repository, and write each one in
   the **Change log** with the date. Next week, read the numbers against it.

Spend data comes from the nightly Google Ads Script once Sohil's `/ads` route
is live; until then export the Keyword, Search terms, User location and
Campaign reports for the same date range from Google Ads and drop them on the
upload button. Uploads stay in the browser (IndexedDB) and are never sent
anywhere; the previous upload of the same report is kept for comparison.
Spend figures must never be committed to this public repository.

## Weekly Google review update

Edit `physiotherapy-near-me-delhi/clinic-reviews.js` and change the rating and
count for each clinic together. Leave both `null` until a clinic has a reliable
figure. The hero badge uses the `cbReviewSummary` line in the same file (the
Delhi-wide rating and review count). If that line is removed, the hero falls
back to the sum of the clinic rows and their count-weighted average rating.
The same figures feed the structured data that search engines read.
