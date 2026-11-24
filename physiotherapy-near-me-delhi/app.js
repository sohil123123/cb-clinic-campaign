const clinics=[
{id:'gk',latlng:[28.5331683,77.2452026],name:'Greater Kailash II',area:'South Delhi',address:'LG Floor, S-210, 80 Feet Road, Block S, Greater Kailash II, New Delhi 110048',phone:'9818843774'},
{id:'safdarjung',latlng:[28.5681895,77.2006879],name:'Safdarjung Enclave',area:'South Delhi',address:'A-1/295, Basement, near AIIMS Trauma Center, Safdarjung Enclave, New Delhi 110029',phone:'9560762045'},
{id:'saket',latlng:[28.5213449,77.2162732],name:'Saket',area:'South Delhi',address:'J-25, Basement, Mandir Marg, near Hotel Saket 27, Block J, Saket, New Delhi 110017',phone:'7303335605'},
{id:'vasant',latlng:[28.524433,77.154562],name:'Vasant Kunj',area:'South West Delhi',address:'C-31, First Floor – C, Nathu Singh Market, near KL 27 Gym, Masoodpur, New Delhi 110070',phone:'9773664030'},
{id:'dwarka',latlng:[28.594018681288997,77.02574329563622],name:'Dwarka, Sector 17',area:'West Delhi',address:'Plot 7, Basement, near Sarvodya Vidyalya School, Sector 17, Dwarka, New Delhi 110078',phone:'9217683886'}];
const clinicDetails={
gk:{short:'Greater Kailash',near:['Greater Kailash I','CR Park','Kalkaji','Nehru Place'],page:'https://cbphysiotherapy.in/delhi/physiotherapy-clinic/cb-physiotherapy-greater-kailash',head:'Dr. Monika Bhardwaj',profile:'https://cbphysiotherapy.in/delhi/ortho-physiotherapist/monika-bhardwaj',landmark:'S-210, Lower Ground Floor · GK II'},
safdarjung:{short:'Safdarjung Enclave',near:['Green Park','Hauz Khas','R.K. Puram','Moti Bagh','Chanakyapuri'],page:'https://cbphysiotherapy.in/delhi/physiotherapy-clinic/cb-physiotherapy-clinic-safdarjung-enclave',head:'Dr. Hardika Sood',profile:'https://cbphysiotherapy.in/delhi/sports-physiotherapist/hardik-sood',landmark:'A-1/295, Basement · Near AIIMS Trauma Centre'},
saket:{short:'Saket',near:['Malviya Nagar','Pushp Vihar','Sainik Farms','Mehrauli'],page:'https://cbphysiotherapy.in/delhi/physiotherapy-clinic/cb-physiotherapy-clinic-saket',head:'Dr. Nitish Kumar Srivastava',profile:'https://cbphysiotherapy.in/delhi/ortho-physiotherapist/nitish-kumar-srivastava',landmark:'J-25, Basement · Near Hotel Saket 27'},
vasant:{short:'Vasant Kunj',near:['Vasant Vihar','Mahipalpur','Kishangarh','Ghitorni'],page:'https://cbphysiotherapy.in/delhi/physiotherapy-clinic/cb-physiotherapy-vasant-kunj',head:'Dr. Rahul Dogra',profile:'https://cbphysiotherapy.in/delhi/ortho-physiotherapist/rahul-dogra',landmark:'C-31, First Floor · Nathu Singh Market'},
dwarka:{short:'Dwarka',near:['Palam','Dwarka Mor','Uttam Nagar','Najafgarh'],page:'https://cbphysiotherapy.in/delhi/physiotherapy-clinic/cb-physiotherapy-dwarka',head:'Dr. Amit',profile:'https://cbphysiotherapy.in/delhi/ortho-physiotherapist/amit-2',landmark:'Plot 7, Basement · Sector 17'}
};
clinics.forEach(c=>Object.assign(c,clinicDetails[c.id]));
const select=document.getElementById('clinic');
const concern=document.getElementById('concern');
const concernLabels={spine:'back or neck pain',knee:'knee pain',shoulder:'shoulder pain',joint:'joint pain',injury:'injury rehabilitation',surgery:'post-surgery rehabilitation',rehab:'injury / surgery rehabilitation',other:'other ortho / neuro issues'};
function syncTreatment(){document.querySelectorAll('.care-shortcuts [data-concern]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.concern===concern.value)));}
// Scroll a card into view so its action button is visible: top under the sticky header when it fits,
// otherwise bottom-aligned just above the mobile quick-action bar. Also slides horizontal rails to the card.
function revealCard(card){
 const smooth=matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
 const rail=card.parentElement;if(rail&&rail.scrollWidth>rail.clientWidth+4)rail.scrollTo({left:card.offsetLeft-rail.offsetLeft,behavior:smooth});
 const header=document.querySelector('header'),bar=document.querySelector('.quick-actions');
 const top=(header?header.getBoundingClientRect().height:0)+10;
 const barH=bar&&innerWidth<=700?bar.getBoundingClientRect().height:0;
 const r=card.getBoundingClientRect(),avail=innerHeight-top-barH-10;
 const y=r.height<=avail?scrollY+r.top-top:scrollY+r.bottom-(innerHeight-barH-10);
 scrollTo({top:Math.max(0,y),behavior:smooth});
}
document.querySelectorAll('[data-concern]').forEach(link=>link.addEventListener('click',()=>{concern.value=link.dataset.concern;syncTreatment();if(link.dataset.careTarget)revealCard(document.getElementById(link.dataset.careTarget));}));
concern.addEventListener('change',syncTreatment);
const track=(event,detail={})=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,...detail});};
const grid=document.getElementById('clinic-grid');
const directions=c=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('CB Physiotherapy '+c.name+' '+c.address);
// Published CB clinic-page review snapshots. Google counts are tracked separately.
const clinicReviews = window.cbClinicReviews || {};
function hasReview(r) {
  return r && Number.isInteger(r.count) && r.count > 0 && Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5;
}
function clinicReviewText(id) {
  const r = clinicReviews[id];
  return hasReview(r) ? r.rating.toFixed(1) + ' / 5 · ' + r.count.toLocaleString('en-IN') + ' Google reviews' : 'Read Google reviews';
}
const reviewRows = clinics.map(c => clinicReviews[c.id]);
let summary = window.cbReviewSummary;
if (!hasReview(summary) && reviewRows.every(hasReview)) {
  const total = reviewRows.reduce((sum, r) => sum + r.count, 0);
  summary = { count: total, rating: reviewRows.reduce((sum, r) => sum + r.rating * r.count, 0) / total };
}
if (hasReview(summary)) {
  const label = summary.rating.toFixed(1) + ' / 5 · ' + summary.count.toLocaleString('en-IN') + ' Google reviews';
  document.querySelector('#open-reviews strong').textContent = label;
  document.querySelector('#open-reviews').setAttribute('aria-label', label + '. Read reviews by clinic.');
}
const googleListingIds = {
  gk: '17518812248637208086',
  safdarjung: '519412980264603946',
  saket: '3568327738796298549',
  vasant: '14031998325875161603',
  dwarka: '2587984129367049804',
};
const googleProfile = c => 'https://www.google.com/maps?cid=' + googleListingIds[c.id];
// Structured data so search engines can discover each clinic (name, address, phone, rating, clinic page).
(function addStructuredData() {
  const postcode = a => (a.match(/\b(1\d{5})\b/) || [])[1];
  const graph = clinics.map(c => {
    const r = clinicReviews[c.id];
    const item = {
      '@type': 'Physiotherapy', name: 'CB Physiotherapy ' + c.name, url: c.page, telephone: '+91' + c.phone,
      image: location.origin + '/physiotherapy-near-me-delhi/assets/clinics/' + c.id + '.webp',
      address: { '@type': 'PostalAddress', streetAddress: c.address.replace(/,\s*New Delhi\s*\d{6}$/, ''), addressLocality: 'New Delhi', addressRegion: 'Delhi', postalCode: postcode(c.address), addressCountry: 'IN' },
      geo: { '@type': 'GeoCoordinates', latitude: c.latlng[0], longitude: c.latlng[1] },
      areaServed: [c.name].concat(c.near), hasMap: googleProfile(c), parentOrganization: { '@type': 'Organization', name: 'CB Physiotherapy', url: 'https://cbphysiotherapy.in/', telephone: '+911140846393' }
    };
    if (hasReview(r)) item.aggregateRating = { '@type': 'AggregateRating', ratingValue: r.rating, reviewCount: r.count, bestRating: 5 };
    return item;
  });
  const script = document.createElement('script'); script.type = 'application/ld+json';
  script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  document.head.appendChild(script);
})();
grid.innerHTML=clinics.map(c=>`<article class="clinic-card" id="clinic-${c.id}"><div class="centre-photo"><img class="clinic-cover" src="/physiotherapy-near-me-delhi/assets/clinics/${c.id}.webp" alt="Inside CB Physiotherapy ${c.name}" width="600" height="692" loading="lazy" decoding="async"><span class="centre-region">${c.area}</span></div><div class="clinic-card-content"><h3>${c.name}</h3><a class="centre-rating" href="${googleProfile(c)}" target="_blank" rel="noopener" aria-label="${c.name}: ${clinicReviewText(c.id)}. Open Google profile"><b class="review-summary"><span aria-hidden="true">${hasReview(clinicReviews[c.id]) ? "★★★★★" : ""}</span> ${clinicReviewText(c.id)}</b><small><svg class="google-review-logo" aria-hidden="true" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.02 46.98 31.86 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> View Google profile ↗</small></a><p class="clinic-lead">Led by <a href="${c.profile}" target="_blank" rel="noopener">${c.head} <span>(PT)</span></a></p><p class="clinic-landmark">${c.landmark}</p><p class="clinic-near"><span>Also near</span>${c.near.join(' · ')}</p><div class="clinic-meta"><span>8am–8pm</span><details><summary>Full address</summary><p>${c.address}</p></details></div><div class="links"><a href="tel:+91${c.phone}" data-call="${c.id}">Call clinic →</a><a href="${directions(c)}" target="_blank" rel="noopener" data-map="${c.id}">Directions →</a></div><button class="button" data-select="${c.id}">Choose this centre <span>→</span></button></div></article>`).join('');
function updateClinic(){const c=clinics.find(c=>c.id===select.value),call=document.getElementById('clinic-call');call.href=c?'tel:+91'+c.phone:'tel:+911140846393';call.textContent=c?'Or call '+c.name+' →':'Prefer to call? Speak to our team →';if(c)track('clinic_selected',{clinic_id:c.id});}
select.addEventListener('change',updateClinic);
document.addEventListener('click',e=>{const b=e.target.closest('[data-select]');if(b){select.value=b.dataset.select;updateClinic();}const call=e.target.closest('[data-call]');if(call)track('clinic_call_click',{clinic_id:call.dataset.call});const map=e.target.closest('[data-map]');if(map)track('clinic_directions_click',{clinic_id:map.dataset.map});});
document.getElementById('clinic-call').addEventListener('click',()=>track('clinic_call_click',{clinic_id:select.value||'central'}));
document.getElementById('year').textContent=new Date().getFullYear();

let clinicMap;const markers={};
// Leaflet (150 KB) is fetched only when the map is about to be seen or a clinic pin is requested.
let leafletLoading=null;
function loadLeaflet(){
 if(window.L)return Promise.resolve();
 if(leafletLoading)return leafletLoading;
 leafletLoading=new Promise((resolve,reject)=>{
  const base='/physiotherapy-near-me-delhi/vendor/leaflet/';let pending=2;const done=()=>{if(--pending===0)resolve();};
  const css=document.createElement('link');css.rel='stylesheet';css.href=base+'leaflet.css';css.onload=done;css.onerror=done;document.head.appendChild(css);
  const js=document.createElement('script');js.src=base+'leaflet.js';js.async=true;js.onload=done;js.onerror=()=>reject(new Error('leaflet'));document.head.appendChild(js);
 });
 return leafletLoading;
}
function initMap(){
 if(clinicMap)return Promise.resolve();
 return loadLeaflet().then(()=>{
  if(clinicMap||!window.L)return;
  clinicMap=L.map('clinic-map',{scrollWheelZoom:false,dragging:!L.Browser.mobile});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,referrerPolicy:'strict-origin-when-cross-origin',attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(clinicMap);
  clinics.forEach((c,i)=>{const marker=L.marker(c.latlng,{title:c.name,alt:c.name,icon:L.divIcon({className:'clinic-pin',html:`<span aria-hidden="true" style="--pin-label:'${i+1}'">${i+1}</span>`,iconSize:[32,40],iconAnchor:[16,40],popupAnchor:[0,-38]})}).addTo(clinicMap);
  marker.bindPopup(`<div class="clinic-popup"><strong>${c.name}</strong><p>${c.address}</p><a href="${directions(c)}" target="_blank" rel="noopener">Directions →</a><a href="tel:+91${c.phone}">Call clinic →</a><button type="button" class="button" data-select="${c.id}">Choose this centre →</button></div>`,{maxWidth:245});markers[c.id]=marker;marker.on('click',()=>highlightClinic(c.id));});
  fitClinics();
 },()=>{document.getElementById('clinic-map').textContent='Map unavailable. Use the clinic directions links below.';});
}
function fitClinics(){if(clinicMap)clinicMap.fitBounds(clinics.map(c=>c.latlng),{padding:[35,45]});}
function highlightClinic(id){const card=document.getElementById('clinic-'+id);if(card)grid.scrollTo({left:card.offsetLeft-grid.offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});document.querySelectorAll('.clinic-card').forEach(c=>c.classList.toggle('selected',c.id==='clinic-'+id));}
function showClinic(id){highlightClinic(id);initMap().then(()=>{if(clinicMap&&markers[id])markers[id].openPopup();});}
document.getElementById('map-legend').innerHTML=clinics.map((c,i)=>`<button type="button" data-show-clinic="${c.id}"><b>${i+1}</b>${c.name}</button>`).join('');
document.querySelectorAll('[data-show-clinic]').forEach(b=>{if(b.closest('#location-links'))return;b.addEventListener('click',()=>showClinic(b.dataset.showClinic));});
document.getElementById('show-all-clinics').addEventListener('click',()=>{highlightClinic('');initMap().then(()=>{if(clinicMap){clinicMap.closePopup();fitClinics();}});});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){initMap();observer.disconnect();}},{rootMargin:'400px'});observer.observe(document.getElementById('clinic-map'));}else initMap();

// ---- Clinic landing mode ----
// A generated folder (see areas.json) carries <meta name="cb-area" content="saket">; ?area=saket or a
// nearby locality (?area=malviya-nagar) also works. The page then leads with that clinic.
(function applyArea(){
 const slug=((document.querySelector('meta[name="cb-area"]')||{}).content||new URLSearchParams(location.search).get('area')||'').toLowerCase().trim();
 if(!slug)return;
 const norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-');
 const c=clinics.find(x=>x.id===slug)||clinics.find(x=>norm(x.name)===slug||norm(x.short)===slug||x.near.some(n=>norm(n)===slug));
 if(!c)return;
 document.body.classList.add('area-mode');document.body.dataset.area=c.id;
 const tel='tel:+91'+c.phone,smooth=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
 // Hero + strip
 const h1=document.querySelector('h1');if(h1)h1.innerHTML='Best Physiotherapy<br>Near You in '+c.short+'.';
 const count=document.getElementById('location-count');if(count)count.textContent='Other Physio Clinics in Delhi';
 document.querySelectorAll('#location-links a[data-show-clinic="'+c.id+'"]').forEach(x=>x.remove());
 // Clinic section: this clinic first, others behind a link
 const heading=document.querySelector('#clinics .section-heading');
 if(heading){heading.querySelector('.eyebrow').textContent='YOUR NEAREST CB CENTRE';heading.querySelector('h2').innerHTML='CB Physiotherapy '+c.short+'.<br>Minutes from '+c.near.slice(0,2).join(' and ')+'.';heading.querySelector('p').textContent='Led by '+c.head+' (PT). Also serving '+c.near.join(', ')+'. Open 8am–8pm.';}
 const card=document.getElementById('clinic-'+c.id);if(card){grid.prepend(card);card.classList.add('selected');}
 const others=[...grid.children].filter(el=>el!==card);others.forEach(el=>el.hidden=true);
 const nav=document.querySelector('[data-rail="clinic-grid"]'),toolbar=document.querySelector('.clinic-rail-wrap .rail-toolbar');
 if(nav)nav.hidden=true;if(toolbar)toolbar.hidden=true;
 const mapTitle=document.querySelector('.map-heading h3');if(mapTitle)mapTitle.textContent='Find us in '+c.short+'.';
 const showAll=document.getElementById('show-all-clinics');if(showAll)showAll.textContent='Show all five';
 document.querySelectorAll('#map-legend button').forEach(b=>{if(b.dataset.showClinic!==c.id)b.hidden=true;});
 const reveal=document.createElement('p');reveal.className='area-others';
 reveal.innerHTML='<button type="button" id="show-other-clinics">Not near '+c.short+'? See our other '+others.length+' Delhi centres <span aria-hidden="true">→</span></button>';
 grid.parentElement.insertBefore(reveal,nav||null);
 function expand(){others.forEach(el=>el.hidden=false);if(nav)nav.hidden=false;if(toolbar)toolbar.hidden=false;document.querySelectorAll('#map-legend button').forEach(b=>b.hidden=false);reveal.remove();document.body.classList.remove('area-single');if(clinicMap){clinicMap.closePopup();fitClinics();}track('area_other_clinics_shown',{clinic_id:c.id});}
 document.body.classList.add('area-single');
 reveal.querySelector('button').addEventListener('click',()=>{expand();grid.scrollIntoView({behavior:smooth(),block:'start'});});
 if(showAll)showAll.addEventListener('click',expand);
 const strip=document.getElementById('location-links');if(strip)strip.addEventListener('click',e=>{if(e.target.closest('a[data-show-clinic]')&&document.body.classList.contains('area-single'))expand();},true);
 // Map: zoom to this clinic until the visitor asks for all
 const originalFit=fitClinics;
 fitClinics=function(){if(document.body.classList.contains('area-single')&&clinicMap){clinicMap.setView(c.latlng,14);if(markers[c.id]&&innerWidth>700)markers[c.id].openPopup();}else originalFit();};
 // Booking, calls, WhatsApp, lead source
 select.value=c.id;updateClinic();
 document.querySelectorAll('a.header-call, a.qa-call').forEach(x=>{x.href=tel;x.dataset.call=c.id;x.setAttribute('aria-label','Call CB Physiotherapy '+c.short+' on '+c.phone);});
 const form=document.getElementById('booking-form');if(form)form.dataset.source='google-ads-'+c.id+'-landing';
 const cta=document.querySelector('.final-cta h2');if(cta)cta.innerHTML='Find the right care.<br>At our '+c.short+' clinic.';
 document.title=document.title.replace('in Delhi','in '+c.short);
})();
