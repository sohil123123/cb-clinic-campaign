#!/usr/bin/env python3
"""Build the five clinic landing pages from clinic-template/index.html and clinics.json.

Run at deploy (see .github/workflows/deploy.yml) or locally:
    python3 scripts/build-clinics.py
Writes physiotherapy-near-me-<slug>/index.html for each clinic. Those folders are
generated output and are git-ignored; edit clinics.json or the template instead.
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://book.cbphysiotherapy.in'
ANALYTICS_V = '20261127a'

with open(os.path.join(ROOT, 'clinic-template', 'index.html'), encoding='utf-8') as f:
    TEMPLATE = f.read()
with open(os.path.join(ROOT, 'clinics.json'), encoding='utf-8') as f:
    DATA = json.load(f)

e = html.escape


def fmt_count(n):
    return f'{n:,}'


def hours_label(d):
    return d.get('hours', '9am to 8pm')


def open_label(d):
    h = d.get('open_hour', 9)
    return f'{h}am' if h < 12 else f'{h - 12}pm'


def team_lead(c):
    h = c['head']
    creds = ''.join(f'<li>{e(x)}</li>' for x in h['creds'])
    return (f'<div class="lead"><img src="{e(h["img"])}" alt="{e(h["name"])}" width="600" height="692" loading="lazy" decoding="async">'
            f'<div><h3>{e(h["name"])}</h3><p class="role">{e(h["role"])} at {e(c["short"])}. Oversees every treatment plan here, whichever physiotherapist you see.</p>'
            f'<ul class="creds">{creds}</ul><p class="doc-note" id="doc-note"></p>'
            f'<a href="{e(h["url"])}" target="_blank" rel="noopener" class="small muted">Full profile</a></div></div>')


def team_cards(c):
    out = []
    for m in c['team']:
        out.append(f'<a class="card" href="{e(m["url"])}" target="_blank" rel="noopener"><img src="{e(m["img"])}" alt="{e(m["name"])}" width="600" height="692" loading="lazy" decoding="async"><b>{e(m["name"])}</b><span>{e(m["role"])}</span><small>{e(m["expertise"])}</small></a>')
    return '\n   '.join(out)


def central_cards(d):
    out = []
    for m in d['central_team']:
        out.append(f'<div class="card wide"><img src="{e(m["img"])}" alt="{e(m["name"])}" width="600" height="600" loading="lazy" decoding="async"><b>{e(m["name"])}</b><span>{e(m["role"])}</span><small>{e(m["text"])}</small></div>')
    return '\n   '.join(out)


def other_clinics(d, me):
    out = []
    for c in d['clinics']:
        if c['id'] == me['id']:
            continue
        out.append(f'<a href="/physiotherapy-near-me-{c["slug"]}/">{e(c["short"])}</a>')
    out.append('<a href="/physiotherapy-near-me-delhi/">All five clinics</a>')
    return ''.join(out)


def here_text(c):
    near = c['near']
    nearby = c['nearby']
    return (f'{e(nearby)}. The clinic is {e(c["landmark"].split(" · ")[0].lower())}, and serves {e(", ".join(near[:-1]))} and {e(near[-1])}.'
            if len(near) > 1 else f'{e(nearby)}.')


def jsonld(d, c):
    lat, lng = c['latlng']
    maps_url = f'https://www.google.com/maps?cid={c["cid"]}'
    page = f'{SITE}/physiotherapy-near-me-{c["slug"]}/'
    persons = [{
        '@type': 'Person', 'name': c['head']['name'], 'jobTitle': f'{c["head"]["role"]}, Physiotherapist',
        'url': c['head']['url'], 'image': c['head']['img'], 'worksFor': {'@id': page + '#clinic'}
    }] + [{
        '@type': 'Person', 'name': m['name'], 'jobTitle': m['role'], 'url': m['url'], 'image': m['img'],
        'worksFor': {'@id': page + '#clinic'}
    } for m in c['team']]
    reviews = []
    for r in c['reviews'].get('all', [])[:3]:
        rv = {'@type': 'Review', 'reviewBody': r['text'], 'author': {'@type': 'Person', 'name': r['author']},
              'reviewRating': {'@type': 'Rating', 'ratingValue': 5, 'bestRating': 5}}
        m = re.match(r'(\d{1,2}) (\w{3}) (\d{4})', r.get('date', ''))
        if m:
            months = {'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12}
            rv['datePublished'] = f'{m.group(3)}-{months.get(m.group(2), 1):02d}-{int(m.group(1)):02d}'
        reviews.append(rv)
    clinic = {
        '@type': ['MedicalClinic', 'LocalBusiness'], '@id': page + '#clinic', 'name': c['full'], 'url': page,
        'image': [SITE + c['hero']['src']], 'logo': SITE + '/physiotherapy-near-me-delhi/assets/cb-logo-480.webp',
        'telephone': c['tel'], 'priceRange': '₹499 - ₹1,499', 'currenciesAccepted': 'INR', 'paymentAccepted': 'Cash, Card, UPI',
        'medicalSpecialty': 'Physiotherapy',
        'address': {'@type': 'PostalAddress', 'streetAddress': c['address'].rsplit(', New Delhi', 1)[0], 'addressLocality': 'New Delhi',
                    'addressRegion': 'Delhi', 'postalCode': c['postcode'], 'addressCountry': 'IN'},
        'geo': {'@type': 'GeoCoordinates', 'latitude': lat, 'longitude': lng},
        'hasMap': maps_url, 'sameAs': [c['page'], maps_url],
        'openingHoursSpecification': [{'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                                       'opens': f'{d.get("open_hour", 9):02d}:00', 'closes': f'{d.get("close_hour", 20):02d}:00'}],
        'areaServed': [{'@type': 'Place', 'name': n + ', New Delhi'} for n in [c['short']] + c['near']],
        'aggregateRating': {'@type': 'AggregateRating', 'ratingValue': c['rating'], 'reviewCount': c['count'], 'bestRating': 5},
        'review': reviews,
        'employee': persons,
        'availableService': [{'@type': 'MedicalTherapy', 'name': n} for n in [
            'Back and neck pain physiotherapy', 'Knee, shoulder and joint pain physiotherapy', 'Post-surgery and sports injury rehabilitation',
            'Robotic spinal decompression', 'Class 4 laser therapy', 'TECAR therapy', 'AI-guided physiotherapy assessment']],
        'makesOffer': [{'@type': 'Offer', 'name': 'AI assessment and consultation', 'price': '499', 'priceCurrency': 'INR',
                        'itemOffered': {'@type': 'MedicalProcedure', 'name': 'Physiotherapy assessment with Recovery Plan Report'}},
                       {'@type': 'Offer', 'name': 'Standard physiotherapy session', 'price': '999', 'priceCurrency': 'INR'},
                       {'@type': 'Offer', 'name': 'Advanced physiotherapy session', 'price': '1499', 'priceCurrency': 'INR'}],
        'isPartOf': {'@type': 'MedicalOrganization', 'name': 'CB Physiotherapy', 'url': 'https://cbphysiotherapy.in/'},
    }
    faq = {
        '@type': 'FAQPage', 'mainEntity': [
            {'@type': 'Question', 'name': 'Do I need a doctor\'s referral for physiotherapy at CB Physiotherapy ' + c['short'] + '?',
             'acceptedAnswer': {'@type': 'Answer', 'text': 'No. You can book directly. If you already have a prescription, scans or surgery notes, bring them and your physiotherapist will work from them.'}},
            {'@type': 'Question', 'name': 'Can I get a same-day physiotherapy appointment in ' + c['short'] + '?',
             'acceptedAnswer': {'@type': 'Answer', 'text': f'Usually yes. The clinic is open {hours_label(d)} every day. Call {c["phone_display"]} or request a call back and we will give you the next free slot.'}},
            {'@type': 'Question', 'name': 'How many physiotherapy sessions will I need?',
             'acceptedAnswer': {'@type': 'Answer', 'text': 'You get an estimate at the end of the first visit, in your Recovery Plan Report. Most back, neck and joint problems settle in six to ten sessions; post-surgery rehab follows the surgeon\'s timeline.'}},
            {'@type': 'Question', 'name': 'What does the first physiotherapy visit cost?',
             'acceptedAnswer': {'@type': 'Answer', 'text': 'The first visit is an AI-guided assessment and consultation, currently ₹499 (usual price ₹999). Standard sessions are ₹999 and advanced sessions with laser, TECAR or spinal decompression are ₹1,499.'}},
            {'@type': 'Question', 'name': 'Does CB Physiotherapy ' + c['short'] + ' offer home visits?',
             'acceptedAnswer': {'@type': 'Answer', 'text': 'Yes, for people who cannot travel after surgery or with severe pain. Home visits cost more and have fewer time slots, so mention it when you call.'}},
        ]}
    crumbs = {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'CB Physiotherapy Delhi', 'item': SITE + '/physiotherapy-near-me-delhi/'},
        {'@type': 'ListItem', 'position': 2, 'name': c['full'], 'item': page}]}
    return json.dumps({'@context': 'https://schema.org', '@graph': [clinic, faq, crumbs]}, ensure_ascii=False, separators=(',', ':'))


def build(d, c):
    lat, lng = c['latlng']
    bbox = f'{lng - 0.0068:.4f}%2C{lat - 0.0045:.4f}%2C{lng + 0.0068:.4f}%2C{lat + 0.0045:.4f}'
    hero = c['hero']
    portrait = hero.get('h', 0) > hero.get('w', 1)
    srcset_attr = f' srcset="{e(hero["srcset"])}" sizes="(max-width:720px) 100vw, 680px"' if hero.get('srcset') else ''
    preload = f' imagesrcset="{e(hero["srcset"])}" imagesizes="(max-width:720px) 100vw, 680px"' if hero.get('srcset') else ''
    page = f'{SITE}/physiotherapy-near-me-{c["slug"]}/'
    maps_url = f'https://www.google.com/maps/search/?api=1&query={html.escape(c["full"].replace(", ", " ") + " " + c["where"]).replace(" ", "+")}'
    google_url = f'https://www.google.com/maps?cid={c["cid"]}'
    data = {
        'id': c['id'], 'short': c['short'], 'full': c['full'], 'tel': c['tel'], 'phone_display': c['phone_display'],
        'whatsapp': d['whatsapp'], 'rating': c['rating'], 'count_fmt': fmt_count(c['count']),
        'open_hour': d.get('open_hour', 9), 'close_hour': d.get('close_hour', 20), 'open_label': open_label(d),
        'reviews': c['reviews'],
    }
    metro = f'<p class="small muted">Nearest metro: {e(c["metro"])}.</p>' if c.get('metro') else ''
    repl = {
        'TITLE': e(c['title']), 'DESCRIPTION': e(c['description']), 'CANONICAL': page, 'OG_IMAGE': SITE + hero['src'],
        'HERO_SRC': hero['src'], 'HERO_SRCSET_ATTR': srcset_attr, 'HERO_PRELOAD': preload, 'HERO_W': str(hero.get('w', 800)), 'HERO_H': str(hero.get('h', 600)),
        'HERO_CLASS': 'portrait' if portrait else '', 'FULL': e(c['full']), 'SHORT': e(c['short']), 'ID': c['id'], 'WHERE': e(c['where']),
        'MAPS_URL': maps_url, 'GOOGLE_URL': google_url, 'TEL': c['tel'], 'PHONE_DISPLAY': c['phone_display'], 'RATING': str(c['rating']),
        'COUNT_FMT': fmt_count(c['count']), 'LAT': str(lat), 'LNG': str(lng), 'BBOX': bbox, 'HOURS': hours_label(d),
        'TEAM_LEAD': team_lead(c), 'TEAM_CARDS': team_cards(c), 'CENTRAL_CARDS': central_cards(d), 'HERE_TEXT': here_text(c),
        'ADDRESS': e(c['address']), 'NEAR_LIST': ''.join(f'<li>{e(n)}</li>' for n in c['near']), 'METRO_LINE': metro,
        'OTHER_CLINICS': other_clinics(d, c), 'MAIN_PAGE': c['page'], 'JSONLD': jsonld(d, c),
        'DATA': json.dumps(data, ensure_ascii=False).replace('</', '<\\/'), 'ANALYTICS_V': ANALYTICS_V,
    }
    out = TEMPLATE
    for k, v in repl.items():
        out = out.replace('{{' + k + '}}', v)
    left = re.findall(r'\{\{[A-Z_]+\}\}', out)
    if left:
        raise SystemExit(f'unfilled placeholders for {c["id"]}: {sorted(set(left))}')
    folder = os.path.join(ROOT, f'physiotherapy-near-me-{c["slug"]}')
    os.makedirs(folder, exist_ok=True)
    with open(os.path.join(folder, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(out)
    print(f'wrote physiotherapy-near-me-{c["slug"]}/index.html (clinic={c["id"]}, {len(out)//1024} KB)')


for clinic in DATA['clinics']:
    build(DATA, clinic)
