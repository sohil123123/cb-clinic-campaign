const clinics=[
{id:'gk',latlng:[28.5331683,77.2452026],name:'Greater Kailash II',area:'South Delhi',address:'LG Floor, S-210, 80 Feet Road, Block S, Greater Kailash II, New Delhi 110048',phone:'9818843774'},
{id:'safdarjung',latlng:[28.5681895,77.2006879],name:'Safdarjung Enclave',area:'South Delhi',address:'A-1/295, Basement, near AIIMS Trauma Center, Safdarjung Enclave, New Delhi 110029',phone:'9560762045'},
{id:'saket',latlng:[28.5213449,77.2162732],name:'Saket',area:'South Delhi',address:'J-25, Basement, Mandir Marg, near Hotel Saket 27, Block J, Saket, New Delhi 110017',phone:'7303335605'},
{id:'vasant',latlng:[28.524433,77.154562],name:'Vasant Kunj',area:'South West Delhi',address:'C-31, First Floor – C, Nathu Singh Market, near KL 27 Gym, Masoodpur, New Delhi 110070',phone:'9773664030'},
{id:'dwarka',latlng:[28.594018681288997,77.02574329563622],name:'Dwarka, Sector 17',area:'West Delhi',address:'Plot 7, Basement, near Sarvodya Vidyalya School, Sector 17, Dwarka, New Delhi 110078',phone:'9217683886'}];
const clinicDetails={
gk:{head:'Dr. Monika Bhardwaj',profile:'https://cbphysiotherapy.in/delhi/ortho-physiotherapist/monika-bhardwaj',landmark:'S-210, Lower Ground Floor · GK II'},
safdarjung:{head:'Dr. Hardika Sood',profile:'https://cbphysiotherapy.in/delhi/sports-physiotherapist/hardik-sood',landmark:'A-1/295, Basement · Near AIIMS Trauma Centre'},
saket:{head:'Dr. Nitish Kumar Srivastava',profile:'https://cbphysiotherapy.in/delhi/ortho-physiotherapist/nitish-kumar-srivastava',landmark:'J-25, Basement · Near Hotel Saket 27'},
vasant:{head:'Dr. Rahul Dogra',profile:'https://cbphysiotherapy.in/delhi/ortho-physiotherapist/rahul-dogra',landmark:'C-31, First Floor · Nathu Singh Market'},
dwarka:{head:'Dr. Amit',profile:'https://cbphysiotherapy.in/delhi/ortho-physiotherapist/amit-2',landmark:'Plot 7, Basement · Sector 17'}
};
clinics.forEach(c=>Object.assign(c,clinicDetails[c.id]));
const select=document.getElementById('clinic');
const concern=document.getElementById('concern');
const concernLabels={spine:'back or neck pain',knee:'knee pain',shoulder:'shoulder pain',joint:'joint pain',injury:'injury rehabilitation',surgery:'post-surgery rehabilitation',rehab:'injury / surgery rehabilitation',other:'other ortho / neuro issues'};
function syncTreatment(){document.querySelectorAll('.care-shortcuts [data-concern]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.concern===concern.value)));}
document.querySelectorAll('[data-concern]').forEach(link=>link.addEventListener('click',()=>{concern.value=link.dataset.concern;syncTreatment();if(link.dataset.careTarget)document.getElementById(link.dataset.careTarget).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}));
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
if (reviewRows.every(hasReview)) {
  const total = reviewRows.reduce((sum, r) => sum + r.count, 0);
  const average = reviewRows.reduce((sum, r) => sum + r.rating * r.count, 0) / total;
  const label = average.toFixed(1) + ' / 5 · ' + total.toLocaleString('en-IN') + ' Google reviews';
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
grid.innerHTML=clinics.map(c=>`<article class="clinic-card" id="clinic-${c.id}"><div class="centre-photo"><img class="clinic-cover" src="/physiotherapy-near-me-delhi/assets/clinics/${c.id}.webp" alt="Inside CB Physiotherapy ${c.name}" loading="lazy"><span class="centre-region">${c.area}</span></div><div class="clinic-card-content"><h3>${c.name}</h3><a class="centre-rating" href="${googleProfile(c)}" target="_blank" rel="noopener" aria-label="${c.name}: ${clinicReviewText(c.id)}. Open Google profile"><b class="review-summary"><span aria-hidden="true">${hasReview(clinicReviews[c.id]) ? "★★★★★" : ""}</span> ${clinicReviewText(c.id)}</b><small><svg class="google-review-logo" aria-hidden="true" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.02 46.98 31.86 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> View Google profile ↗</small></a><p class="clinic-lead">Led by <a href="${c.profile}" target="_blank" rel="noopener">${c.head} <span>(PT)</span></a></p><p class="clinic-landmark">${c.landmark}</p><div class="clinic-meta"><span>8am–8pm</span><details><summary>Full address</summary><p>${c.address}</p></details></div><div class="links"><a href="tel:+91${c.phone}" data-call="${c.id}">Call clinic →</a><a href="${directions(c)}" target="_blank" rel="noopener" data-map="${c.id}">Directions →</a></div><button class="button" data-select="${c.id}">Choose this centre <span>→</span></button></div></article>`).join('');
function updateClinic(){const c=clinics.find(c=>c.id===select.value),call=document.getElementById('clinic-call');call.href=c?'tel:+91'+c.phone:'tel:+919821966696';call.textContent=c?'Or call '+c.name+' →':'Prefer to call? Speak to our team →';if(c)track('clinic_selected',{clinic_id:c.id});}
select.addEventListener('change',updateClinic);
document.addEventListener('click',e=>{const b=e.target.closest('[data-select]');if(b){select.value=b.dataset.select;updateClinic();}const call=e.target.closest('[data-call]');if(call)track('clinic_call_click',{clinic_id:call.dataset.call});const map=e.target.closest('[data-map]');if(map)track('clinic_directions_click',{clinic_id:map.dataset.map});});
document.getElementById('clinic-call').addEventListener('click',()=>track('clinic_call_click',{clinic_id:select.value||'central'}));
document.getElementById('year').textContent=new Date().getFullYear();

let clinicMap;const markers={};
function initMap(){
 if(clinicMap)return;
 if(!window.L){document.getElementById('clinic-map').textContent='Map unavailable. Use the clinic directions links below.';return;}
 clinicMap=L.map('clinic-map',{scrollWheelZoom:false,dragging:!L.Browser.mobile});
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,referrerPolicy:'strict-origin-when-cross-origin',attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(clinicMap);
 clinics.forEach((c,i)=>{const marker=L.marker(c.latlng,{title:c.name,alt:c.name,icon:L.divIcon({className:'clinic-pin',html:`<span aria-hidden="true" style="--pin-label:'${i+1}'">${i+1}</span>`,iconSize:[32,40],iconAnchor:[16,40],popupAnchor:[0,-38]})}).addTo(clinicMap);
 marker.bindPopup(`<div class="clinic-popup"><strong>${c.name}</strong><p>${c.address}</p><a href="${directions(c)}" target="_blank" rel="noopener">Directions →</a><a href="tel:+91${c.phone}">Call clinic →</a><button type="button" class="button" data-select="${c.id}">Choose this centre →</button></div>`,{maxWidth:245});markers[c.id]=marker;marker.on('click',()=>highlightClinic(c.id));});
 fitClinics();
}
function fitClinics(){if(clinicMap)clinicMap.fitBounds(clinics.map(c=>c.latlng),{padding:[35,45]});}
function highlightClinic(id){const card=document.getElementById('clinic-'+id);if(card)grid.scrollTo({left:card.offsetLeft-grid.offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});document.querySelectorAll('.clinic-card').forEach(c=>c.classList.toggle('selected',c.id==='clinic-'+id));}
function showClinic(id){initMap();if(clinicMap){markers[id].openPopup();highlightClinic(id);}}
document.getElementById('map-legend').innerHTML=clinics.map((c,i)=>`<button type="button" data-show-clinic="${c.id}"><b>${i+1}</b>${c.name}</button>`).join('');
document.querySelectorAll('[data-show-clinic]').forEach(b=>b.addEventListener('click',()=>showClinic(b.dataset.showClinic)));
document.getElementById('show-all-clinics').addEventListener('click',()=>{initMap();if(clinicMap){clinicMap.closePopup();fitClinics();highlightClinic('');}});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){initMap();observer.disconnect();}},{rootMargin:'150px'});observer.observe(document.getElementById('clinic-map'));}else initMap();
