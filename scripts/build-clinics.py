#!/usr/bin/env python3
"""Build the clinic landing pages and the central Delhi page from clinic-template/index.html and clinics.json.

Run at deploy (see .github/workflows/deploy.yml) or locally:
    python3 scripts/build-clinics.py
Writes physiotherapy-near-me-<slug>/index.html for each clinic (generated, git-ignored) and
physiotherapy-near-me-delhi/index.html (the central page, committed for visibility).

The central page carries the routing rules from routing.json and geo-clinics.json inline: when an
ad click names a clinic area (keyword alias), or the keyword is neutral or Delhi-wide and Google places the visitor near a clinic (loc / loci),
the page hands over to that clinic's page with the ad parameters plus r=<decision>&rk=<keyword class>.
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://book.cbphysiotherapy.in'
ANALYTICS_V = '20261127b'
CENTRAL_TEL = '+911140846393'
CENTRAL_DISPLAY = '011 4084 6393'
PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-7.2-7-12a7 7 0 0 1 14 0c0 4.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>'
PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3 4 4c-2 6 10 18 16 16l1-3-5-3-2 2c-3-1-5-3-6-6l2-2z"/></svg>'

with open(os.path.join(ROOT, 'clinic-template', 'index.html'), encoding='utf-8') as f:
    TEMPLATE = f.read()
with open(os.path.join(ROOT, 'clinics.json'), encoding='utf-8') as f:
    DATA = json.load(f)
with open(os.path.join(ROOT, 'routing.json'), encoding='utf-8') as f:
    ROUTING = json.load(f)
with open(os.path.join(ROOT, 'geo-clinics.json'), encoding='utf-8') as f:
    GEO = json.load(f)

e = html.escape
fmt_count = lambda n: f'{n:,}'
hours_label = lambda d: d.get('hours', '9am to 8pm')


def open_label(d):
    h = d.get('open_hour', 9)
    return f'{h}am' if h < 12 else f'{h - 12}pm'


def maps_url(c):
    return 'https://www.google.com/maps/search/?api=1&query=' + html.escape((c['full'].replace(', ', ' ') + ' ' + c['where'])).replace(' ', '+')


def google_url(c):
    return f'https://www.google.com/maps?cid={c["cid"]}'


def page_url(c):
    return f'{SITE}/physiotherapy-near-me-{c["slug"]}/'


# ---------- shared fragments ----------
def central_cards(d):
    return '\n   '.join(f'<div class="card wide"><img src="{e(m["img"])}" alt="{e(m["name"])}" width="600" height="600" loading="lazy" decoding="async"><b>{e(m["name"])}</b><span>{e(m["role"])}</span><small>{e(m["text"])}</small></div>' for m in d['central_team'])


def review_date(s):
    m = re.match(r'(\d{1,2}) (\w{3}) (\d{4})', s or '')
    if not m:
        return None
    months = {'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12}
    return f'{m.group(3)}-{months.get(m.group(2), 1):02d}-{int(m.group(1)):02d}'


def review_ld(rows):
    out = []
    for r in rows[:3]:
        rv = {'@type': 'Review', 'reviewBody': r['text'], 'author': {'@type': 'Person', 'name': r['author']},
              'reviewRating': {'@type': 'Rating', 'ratingValue': 5, 'bestRating': 5}}
        dt = review_date(r.get('date'))
        if dt:
            rv['datePublished'] = dt
        out.append(rv)
    return out


def faq_ld(d, place, phone_display):
    return {'@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': f'Do I need a doctor\'s referral for physiotherapy at CB Physiotherapy {place}?',
         'acceptedAnswer': {'@type': 'Answer', 'text': 'No. You can book directly. If you already have a prescription, scans or surgery notes, bring them and your physiotherapist will work from them.'}},
        {'@type': 'Question', 'name': f'Can I get a same-day physiotherapy appointment in {place}?',
         'acceptedAnswer': {'@type': 'Answer', 'text': f'Usually yes. The clinics are open {hours_label(d)} every day. Call {phone_display} or request a call back and we will give you the next free slot.'}},
        {'@type': 'Question', 'name': 'How many physiotherapy sessions will I need?',
         'acceptedAnswer': {'@type': 'Answer', 'text': 'You get an estimate at the end of the first visit, in your Recovery Plan Report. Most back, neck and joint problems settle in six to ten sessions; post-surgery rehab follows the surgeon\'s timeline.'}},
        {'@type': 'Question', 'name': 'What does the first physiotherapy visit cost?',
         'acceptedAnswer': {'@type': 'Answer', 'text': 'The first visit is an AI-guided assessment and consultation, currently ₹499 (usual price ₹999). Standard sessions are ₹999 and advanced sessions with laser, TECAR or spinal decompression are ₹1,499.'}},
        {'@type': 'Question', 'name': f'Does CB Physiotherapy {place} offer home visits?',
         'acceptedAnswer': {'@type': 'Answer', 'text': 'Yes, for people who cannot travel after surgery or with severe pain. Home visits cost more and have fewer time slots, so mention it when you call.'}},
    ]}


SERVICES = ['Back and neck pain physiotherapy', 'Knee, shoulder and joint pain physiotherapy', 'Post-surgery and sports injury rehabilitation',
            'Robotic spinal decompression', 'Class 4 laser therapy', 'TECAR therapy', 'AI-guided physiotherapy assessment']
OFFERS = [{'@type': 'Offer', 'name': 'AI assessment and consultation', 'price': '499', 'priceCurrency': 'INR',
           'itemOffered': {'@type': 'MedicalProcedure', 'name': 'Physiotherapy assessment with Recovery Plan Report'}},
          {'@type': 'Offer', 'name': 'Standard physiotherapy session', 'price': '999', 'priceCurrency': 'INR'},
          {'@type': 'Offer', 'name': 'Advanced physiotherapy session', 'price': '1499', 'priceCurrency': 'INR'}]


def clinic_ld(d, c, with_staff=True):
    lat, lng = c['latlng']
    page = page_url(c)
    node = {
        '@type': ['MedicalClinic', 'LocalBusiness'], '@id': page + '#clinic', 'name': c['full'], 'url': page,
        'image': [SITE + c['hero']['src']], 'logo': SITE + '/physiotherapy-near-me-delhi/assets/cb-logo-480.webp',
        'telephone': c['tel'], 'priceRange': '₹499 - ₹1,499', 'currenciesAccepted': 'INR', 'paymentAccepted': 'Cash, Card, UPI',
        'medicalSpecialty': 'Physiotherapy',
        'address': {'@type': 'PostalAddress', 'streetAddress': c['address'].rsplit(', New Delhi', 1)[0], 'addressLocality': 'New Delhi',
                    'addressRegion': 'Delhi', 'postalCode': c['postcode'], 'addressCountry': 'IN'},
        'geo': {'@type': 'GeoCoordinates', 'latitude': lat, 'longitude': lng},
        'hasMap': google_url(c), 'sameAs': [c['page'], google_url(c)],
        'openingHoursSpecification': [{'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                                       'opens': f'{d.get("open_hour", 9):02d}:00', 'closes': f'{d.get("close_hour", 20):02d}:00'}],
        'areaServed': [{'@type': 'Place', 'name': n + ', New Delhi'} for n in [c['short']] + c['near']],
        'aggregateRating': {'@type': 'AggregateRating', 'ratingValue': c['rating'], 'reviewCount': c['count'], 'bestRating': 5},
        'isPartOf': {'@type': 'MedicalOrganization', 'name': 'CB Physiotherapy', 'url': 'https://cbphysiotherapy.in/'},
    }
    if with_staff:
        node['review'] = review_ld(c['reviews'].get('all', []))
        node['employee'] = [{'@type': 'Person', 'name': c['head']['name'], 'jobTitle': f'{c["head"]["role"]}, Physiotherapist', 'url': c['head']['url'],
                             'image': c['head']['img'], 'worksFor': {'@id': page + '#clinic'}}] + \
                           [{'@type': 'Person', 'name': m['name'], 'jobTitle': m['role'], 'url': m['url'], 'image': m['img'], 'worksFor': {'@id': page + '#clinic'}} for m in c['team']]
        node['availableService'] = [{'@type': 'MedicalTherapy', 'name': n} for n in SERVICES]
        node['makesOffer'] = OFFERS
    return node


def fill(repl, out_path, label):
    out = TEMPLATE
    for k, v in repl.items():
        out = out.replace('{{' + k + '}}', v)
    left = re.findall(r'\{\{[A-Z_]+\}\}', out)
    if left:
        raise SystemExit(f'unfilled placeholders for {label}: {sorted(set(left))}')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(out)
    print(f'wrote {os.path.relpath(out_path, ROOT)} ({label}, {len(out)//1024} KB)')


def common(d, hero, data, lat, lng):
    srcset_attr = f' srcset="{e(hero["srcset"])}" sizes="(max-width:720px) 100vw, 680px"' if hero.get('srcset') else ''
    preload = f' imagesrcset="{e(hero["srcset"])}" imagesizes="(max-width:720px) 100vw, 680px"' if hero.get('srcset') else ''
    return {
        'HERO_SRC': hero['src'], 'HERO_SRCSET_ATTR': srcset_attr, 'HERO_PRELOAD': preload, 'HERO_W': str(hero.get('w', 800)), 'HERO_H': str(hero.get('h', 600)),
        'HERO_CLASS': 'portrait' if hero.get('h', 0) > hero.get('w', 1) else '', 'LAT': str(lat), 'LNG': str(lng), 'HOURS': hours_label(d),
        'CENTRAL_CARDS': central_cards(d), 'DATA': json.dumps(data, ensure_ascii=False).replace('</', '<\\/'), 'ANALYTICS_V': ANALYTICS_V,
    }


# ---------- clinic pages ----------
def build_clinic(d, c):
    lat, lng = c['latlng']
    page = page_url(c)
    h = c['head']
    team_section = (
        f'<h2>Your care team at {e(c["short"])}</h2>'
        f'<div class="lead"><img src="{e(h["img"])}" alt="{e(h["name"])}" width="600" height="692" loading="lazy" decoding="async">'
        f'<div><h3>{e(h["name"])}</h3><p class="role">{e(h["role"])} at {e(c["short"])}. Oversees every treatment plan here, whichever physiotherapist you see.</p>'
        f'<ul class="creds">{"".join(f"<li>{e(x)}</li>" for x in h["creds"])}</ul><p class="doc-note" id="doc-note"></p>'
        f'<a href="{e(h["url"])}" target="_blank" rel="noopener" class="small muted">Full profile</a></div></div>'
        f'<p class="sub-line">Treating physiotherapists at {e(c["short"])}</p>'
        f'<div class="slider" aria-label="{e(c["short"])} physiotherapists">' +
        ''.join(f'<a class="card" href="{e(m["url"])}" target="_blank" rel="noopener"><img src="{e(m["img"])}" alt="{e(m["name"])}" width="600" height="692" loading="lazy" decoding="async"><b>{e(m["name"])}</b><span>{e(m["role"])}</span><small>{e(m["expertise"])}</small></a>' for m in c['team']) +
        '</div>')
    near = c['near']
    here_text = f'{e(c["nearby"])}. The clinic is {e(c["landmark"].split(" · ")[0].lower())}, and serves {e(", ".join(near[:-1]))} and {e(near[-1])}.'
    bbox = f'{lng - 0.0068:.4f}%2C{lat - 0.0045:.4f}%2C{lng + 0.0068:.4f}%2C{lat + 0.0045:.4f}'
    metro = f'<p class="small muted">Nearest metro: {e(c["metro"])}.</p>' if c.get('metro') else ''
    here_section = (
        f'<h2>Getting here</h2><p>{here_text}</p><div class="here">'
        f'<p class="addr"><b>{e(c["full"])}</b><br>{e(c["address"])}<br>Open {hours_label(d)}, every day. Phone <a href="tel:{c["tel"]}" data-call="{c["id"]}">{c["phone_display"]}</a>.</p>'
        f'<div class="map"><iframe title="Map of {e(c["full"])}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.openstreetmap.org/export/embed.html?bbox={bbox}&layer=mapnik&marker={lat}%2C{lng}"></iframe></div>'
        f'<p class="small muted">Also serving</p><ul class="near">{"".join(f"<li>{e(n)}</li>" for n in near)}</ul>{metro}'
        f'<a class="btn quiet" href="{maps_url(c)}" target="_blank" rel="noopener" data-map="{c["id"]}">{PIN}Open in Google Maps</a></div>')
    others = ''.join(f'<a href="/physiotherapy-near-me-{o["slug"]}/">{e(o["short"])}</a>' for o in d['clinics'] if o['id'] != c['id']) + '<a href="/physiotherapy-near-me-delhi/?r=all">All five clinics</a>'
    data = {'mode': 'clinic', 'id': c['id'], 'short': c['short'], 'full': c['full'], 'wa_name': c['full'], 'at': 'at ' + c['short'], 'rv_at': c['short'],
            'tel': c['tel'], 'phone_display': c['phone_display'], 'whatsapp': d['whatsapp'], 'rating': c['rating'], 'count_fmt': fmt_count(c['count']),
            'open_hour': d.get('open_hour', 9), 'close_hour': d.get('close_hour', 20), 'open_label': open_label(d), 'reviews': c['reviews'], 'clinic_names': {}}
    ld = {'@context': 'https://schema.org', '@graph': [clinic_ld(d, c), faq_ld(d, c['short'], c['phone_display']),
          {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'CB Physiotherapy Delhi', 'item': SITE + '/physiotherapy-near-me-delhi/'},
                                                           {'@type': 'ListItem', 'position': 2, 'name': c['full'], 'item': page}]}]}
    repl = common(d, c['hero'], data, lat, lng)
    repl.update({
        'HEAD_SCRIPT': '', 'ROBOTS': 'index, follow, max-image-preview:large', 'PLACENAME': e(c['short'] + ', New Delhi'), 'AREA_META': c['id'],
        'TITLE': e(c['title']), 'DESCRIPTION': e(c['description']), 'CANONICAL': page, 'OG_IMAGE': SITE + c['hero']['src'],
        'FULL': e(c['full']), 'SHORT': e(c['short']), 'ID': c['id'], 'TEL': c['tel'], 'PHONE_DISPLAY': c['phone_display'],
        'PLACE_LINE': f'<p class="where"><a href="{maps_url(c)}" target="_blank" rel="noopener" data-map="{c["id"]}">{PIN}<b>{e(c["where"])}</b><span>Directions</span></a></p>',
        'RATING': str(c['rating']), 'COUNT_FMT': fmt_count(c['count']), 'RATING_SUFFIX': '', 'GOOGLE_URL': google_url(c),
        'TEAM_SECTION': team_section, 'REVIEWS_SUB': f'From the clinic\'s patient reviews. <a href="{google_url(c)}" target="_blank" rel="noopener" data-reviews>Read all {fmt_count(c["count"])} on Google</a>.',
        'HERE_SECTION': here_section, 'OTHERS_BLOCK': f'<p class="sub-line">Other CB Physiotherapy clinics in Delhi</p><div class="others">{others}</div>',
        'FOOTER_LINE': f'<b>{e(c["full"])}</b>, {e(c["address"])}. Open {hours_label(d)}, every day. Phone <a href="tel:{c["tel"]}">{c["phone_display"]}</a>. Central line <a href="tel:{CENTRAL_TEL}">{CENTRAL_DISPLAY}</a>. One of five CB Physiotherapy clinics in Delhi. <a href="{e(c["page"])}" rel="noopener">Clinic profile on cbphysiotherapy.in</a>.',
        'CLINIC_FIELD': '', 'SOURCE': f'google-ads-{c["id"]}-landing', 'JSONLD': json.dumps(ld, ensure_ascii=False, separators=(',', ':')),
    })
    fill(repl, os.path.join(ROOT, f'physiotherapy-near-me-{c["slug"]}', 'index.html'), f'clinic={c["id"]}')


# ---------- central Delhi page ----------
def routing_script(d):
    geo = {}
    for cid, ids in GEO['clinics'].items():
        for gid in ids:
            geo[gid] = cid
    slugs = {c['id']: c['slug'] for c in d['clinics']}
    rules = {'clinics': ROUTING['clinics'], 'far': ROUTING['far_locations'], 'generic': ROUTING['generic_locations'], 'other': ROUTING.get('other_delhi', []), 'geo': geo, 'slugs': slugs}
    js = """<script>(function(){try{
var R=%s;var q=new URLSearchParams(location.search);if(q.get('r')==='all')return;
var off=false;try{off=sessionStorage.getItem('cb_geo_off')==='1';}catch(_){}
var words=function(s){return ' '+String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()+' ';};
var has=function(t,p){return t.indexOf(' '+p.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()+' ')>=0;};
var longest=function(t,list){var b='';for(var i=0;i<list.length;i++){if(has(t,list[i])&&list[i].length>b.length)b=list[i];}return b;};
var kw=q.get('utm_term')||q.get('kw')||'';if(/^\\{.*\\}$/.test(kw))kw='';var area=q.get('area')||'';var t=words(kw+' '+area.replace(/-/g,' '));
var clinic='',best='';for(var id in R.clinics){var m=longest(t,R.clinics[id]);if(m&&m.length>best.length){best=m;clinic=id;}}
var far=longest(t,R.far),gen=longest(t,R.generic),oth=longest(t,R.other);
var cls=clinic?'locality':far?'far':oth?'other-delhi':gen?'generic':(kw?'neutral':'none');
var dec='',slug='';
if(clinic){slug=R.slugs[clinic];dec=area&&!kw?'area':'keyword';}
else if(cls==='far'||cls==='other-delhi'){}
else if(!off&&R.geo[q.get('loc')||'']){slug=R.slugs[R.geo[q.get('loc')]];dec='geo';}
else if(!off&&R.geo[q.get('loci')||'']){slug=R.slugs[R.geo[q.get('loci')]];dec='interest';}
window.__cbr={kw_class:cls,decision:(cls==='generic'||cls==='far'||cls==='other-delhi')?cls:'none'};
if(!slug)return;q.delete('area');q.set('r',dec);q.set('rk',cls);
location.replace('/physiotherapy-near-me-'+slug+'/?'+q.toString()+location.hash);
}catch(e){}})();</script>
"""
    return js % json.dumps(rules, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def build_central(d):
    cs = d['clinics']
    total = sum(c['count'] for c in cs)
    rating = round(sum(c['rating'] * c['count'] for c in cs) / total, 1)
    lat = sum(c['latlng'][0] for c in cs) / len(cs)
    lng = sum(c['latlng'][1] for c in cs) / len(cs)
    hero = {'src': '/physiotherapy-near-me-delhi/assets/reception-800.webp', 'srcset': '/physiotherapy-near-me-delhi/assets/reception-800.webp 800w, /physiotherapy-near-me-delhi/assets/reception-1200.webp 1200w', 'w': 1200, 'h': 675}
    page = SITE + '/physiotherapy-near-me-delhi/'
    # Delhi-wide reviews: the strongest from different clinics for each area
    reviews = {}
    for area in ['all', 'spine', 'joint', 'rehab', 'ortho']:
        rows = []
        for c in cs:
            if c['reviews'].get(area):
                r = dict(c['reviews'][area][0])
                r['author'] = f'{r["author"]} ({c["short"]})'
                rows.append(r)
        rows.sort(key=lambda r: -len(r['text']))
        reviews[area] = rows[:3]
    heads = ''.join(f'<a class="card" href="/physiotherapy-near-me-{c["slug"]}/"><img src="{e(c["head"]["img"])}" alt="{e(c["head"]["name"])}" width="600" height="692" loading="lazy" decoding="async"><b>{e(c["head"]["name"])}</b><span>{e(c["head"]["role"])}, {e(c["short"])}</span><small>{e(", ".join(c["head"]["creds"][:2]))}</small></a>' for c in cs)
    team_section = (f'<h2>Clinic heads across Delhi</h2><p class="muted" style="margin-top:6px">Each clinic is led by a senior physiotherapist who oversees every treatment plan there, whichever physiotherapist you see. Tap a clinic to see its full team.</p>'
                    f'<div class="slider" aria-label="Clinic heads">{heads}</div><p class="doc-note sr" id="doc-note"></p>')
    cards = ''.join(
        f'<div class="cl"><h3>{e(c["short"])}</h3><span class="pg"><a href="/physiotherapy-near-me-{c["slug"]}/">Clinic page</a></span>'
        f'<p class="w">{e(c["where"])}. {e(c["nearby"])}. Also serving {e(", ".join(c["near"][:3]))}.</p>'
        f'<div class="acts"><a class="call" href="tel:{c["tel"]}" data-call="{c["id"]}">{PHONE}Call {c["phone_display"]}</a><a href="{maps_url(c)}" target="_blank" rel="noopener" data-map="{c["id"]}">{PIN}Directions</a><a href="{google_url(c)}" target="_blank" rel="noopener" data-reviews>★ {c["rating"]} · {fmt_count(c["count"])}</a></div></div>'
        for c in cs)
    here_section = (f'<h2>Five clinics across Delhi</h2><p>All open {hours_label(d)}, every day, with the same fees, the same assessment and the same central monitoring. Not sure which is closest? Call <a href="tel:{CENTRAL_TEL}">{CENTRAL_DISPLAY}</a> and we will tell you.</p>'
                    f'<div class="clist">{cards}</div>')
    clinic_field = ('<div class="field"><label>Which clinic?</label><div class="pick clinics" role="group" aria-label="Clinic">' +
                    ''.join(f'<button type="button" data-clinic="{c["id"]}" aria-pressed="false">{e(c["short"])}</button>' for c in cs) +
                    '<button type="button" data-clinic="help" aria-pressed="false">Nearest to me</button></div></div>\n  ')
    data = {'mode': 'central', 'id': 'delhi', 'short': 'Delhi', 'full': 'CB Physiotherapy, Delhi', 'wa_name': 'CB Physiotherapy in Delhi', 'at': 'across our five Delhi clinics', 'rv_at': 'our Delhi clinics',
            'tel': CENTRAL_TEL, 'phone_display': CENTRAL_DISPLAY, 'whatsapp': d['whatsapp'], 'rating': rating, 'count_fmt': fmt_count(total),
            'open_hour': d.get('open_hour', 9), 'close_hour': d.get('close_hour', 20), 'open_label': open_label(d), 'reviews': reviews,
            'clinic_names': {c['id']: c['short'] for c in cs}}
    org = {'@type': 'MedicalOrganization', '@id': page + '#org', 'name': 'CB Physiotherapy Delhi', 'url': page, 'logo': SITE + '/physiotherapy-near-me-delhi/assets/cb-logo-480.webp',
           'telephone': CENTRAL_TEL, 'medicalSpecialty': 'Physiotherapy', 'areaServed': {'@type': 'City', 'name': 'New Delhi'},
           'aggregateRating': {'@type': 'AggregateRating', 'ratingValue': rating, 'reviewCount': total, 'bestRating': 5},
           'department': [{'@id': page_url(c) + '#clinic'} for c in cs], 'sameAs': ['https://cbphysiotherapy.in/']}
    ld = {'@context': 'https://schema.org', '@graph': [org] + [clinic_ld(d, c, with_staff=False) for c in cs] + [faq_ld(d, 'Delhi', CENTRAL_DISPLAY)]}
    repl = common(d, hero, data, round(lat, 5), round(lng, 5))
    repl.update({
        'HEAD_SCRIPT': routing_script(d), 'ROBOTS': 'noindex, follow', 'PLACENAME': 'New Delhi', 'AREA_META': 'delhi',
        'TITLE': 'Best Physiotherapy Near You in Delhi | CB Physiotherapy', 'DESCRIPTION': 'Physiotherapy in Delhi for back, neck, knee and shoulder pain, injuries and post-surgery rehab at five CB Physiotherapy clinics: Saket, Greater Kailash, Safdarjung Enclave, Vasant Kunj and Dwarka. Same-day appointments, ₹499 first assessment.',
        'CANONICAL': page, 'OG_IMAGE': SITE + hero['src'], 'FULL': 'CB Physiotherapy, Delhi', 'SHORT': 'Delhi', 'ID': 'delhi', 'TEL': CENTRAL_TEL, 'PHONE_DISPLAY': CENTRAL_DISPLAY,
        'PLACE_LINE': f'<p class="where"><a href="#clinics">{PIN}<b>5 clinics in South &amp; West Delhi</b><span>Nearest</span></a></p>',
        'RATING': str(rating), 'COUNT_FMT': fmt_count(total), 'RATING_SUFFIX': ', 5 clinics', 'GOOGLE_URL': '#clinics',
        'TEAM_SECTION': team_section, 'REVIEWS_SUB': 'From patient reviews published for each clinic. Ratings and all reviews are on each clinic\'s Google profile below.',
        'HERE_SECTION': here_section, 'OTHERS_BLOCK': '', 'CLINIC_FIELD': clinic_field, 'SOURCE': 'google-ads-delhi-landing',
        'FOOTER_LINE': f'<b>CB Physiotherapy, Delhi</b>. Five clinics: ' + ', '.join(f'<a href="/physiotherapy-near-me-{c["slug"]}/">{e(c["short"])}</a>' for c in cs) + f'. Open {hours_label(d)}, every day. Central line <a href="tel:{CENTRAL_TEL}">{CENTRAL_DISPLAY}</a>. <a href="https://cbphysiotherapy.in/" rel="noopener">cbphysiotherapy.in</a>.',
        'JSONLD': json.dumps(ld, ensure_ascii=False, separators=(',', ':')),
    })
    fill(repl, os.path.join(ROOT, 'physiotherapy-near-me-delhi', 'index.html'), 'central')


for clinic in DATA['clinics']:
    build_clinic(DATA, clinic)
build_central(DATA)
