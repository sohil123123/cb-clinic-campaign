const clinics=[
{id:'gk',latlng:[28.5331683,77.2452026],name:'Greater Kailash II',area:'South Delhi',address:'LG Floor, S-210, 80 Feet Road, Block S, Greater Kailash II, New Delhi 110048',phone:'9818843774'},
{id:'safdarjung',latlng:[28.5681895,77.2006879],name:'Safdarjung Enclave',area:'South Delhi',address:'A-1/295, Basement, near AIIMS Trauma Center, Safdarjung Enclave, New Delhi 110029',phone:'9560762045'},
{id:'saket',latlng:[28.5213449,77.2162732],name:'Saket',area:'South Delhi',address:'J-25, Basement, Mandir Marg, near Hotel Saket 27, Block J, Saket, New Delhi 110017',phone:'7303335605'},
{id:'vasant',latlng:[28.524433,77.154562],name:'Vasant Kunj',area:'South West Delhi',address:'C-31, First Floor – C, Nathu Singh Market, near KL 27 Gym, Masoodpur, New Delhi 110070',phone:'9773664030'},
{id:'dwarka',latlng:[28.594018681288997,77.02574329563622],name:'Dwarka, Sector 17',area:'West Delhi',address:'Plot 7, Basement, near Sarvodya Vidyalya School, Sector 17, Dwarka, New Delhi 110078',phone:'9217683886'}];
const clinicDetails={
gk:{street:'near M Block, GK 2',short:'Greater Kailash',near:['Greater Kailash I','CR Park','Kalkaji','Nehru Place'],page:'https://cbphysiotherapy.in/delhi/physiotherapy-clinic/cb-physiotherapy-greater-kailash',head:'Dr. Monika Bhardwaj',profile:'https://cbphysiotherapy.in/delhi/ortho-physiotherapist/monika-bhardwaj',landmark:'S-210, Lower Ground Floor · GK 2'},
safdarjung:{street:'near AIIMS Trauma Centre',short:'Safdarjung Enclave',near:['Green Park','Hauz Khas','R.K. Puram','Moti Bagh','Chanakyapuri'],page:'https://cbphysiotherapy.in/delhi/physiotherapy-clinic/cb-physiotherapy-clinic-safdarjung-enclave',head:'Dr. Hardika Sood',profile:'https://cbphysiotherapy.in/delhi/sports-physiotherapist/hardik-sood',landmark:'A-1/295, Basement · Near AIIMS Trauma Centre'},
saket:{street:'on Mandir Marg',short:'Saket',near:['Malviya Nagar','Pushp Vihar','Sainik Farms','Mehrauli'],page:'https://cbphysiotherapy.in/delhi/physiotherapy-clinic/cb-physiotherapy-clinic-saket',head:'Dr. Nitish Kumar Srivastava',profile:'https://cbphysiotherapy.in/delhi/ortho-physiotherapist/nitish-kumar-srivastava',landmark:'J-25, Basement · Near Hotel Saket 27'},
vasant:{street:'at Nathu Singh Market, Masoodpur',short:'Vasant Kunj',near:['Vasant Vihar','Mahipalpur','Kishangarh','Ghitorni'],page:'https://cbphysiotherapy.in/delhi/physiotherapy-clinic/cb-physiotherapy-vasant-kunj',head:'Dr. Rahul Dogra',profile:'https://cbphysiotherapy.in/delhi/ortho-physiotherapist/rahul-dogra',landmark:'C-31, First Floor · Nathu Singh Market'},
dwarka:{street:'in Sector 17, near Sarvodaya Vidyalaya',short:'Dwarka',near:['Palam','Dwarka Mor','Uttam Nagar','Najafgarh'],page:'https://cbphysiotherapy.in/delhi/physiotherapy-clinic/cb-physiotherapy-dwarka',head:'Dr. Amit',profile:'https://cbphysiotherapy.in/delhi/ortho-physiotherapist/amit-2',landmark:'Plot 7, Basement · Sector 17'}
};
clinics.forEach(c=>Object.assign(c,clinicDetails[c.id]));
// Opening hours shown on clinic cards, the clinic landing screen and Getting here. Winter timing.
const HOURS='9am–8pm';
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
function bindConcern(link){link.addEventListener('click',()=>{concern.value=link.dataset.concern;syncTreatment();if(link.dataset.careTarget)revealCard(document.getElementById(link.dataset.careTarget));});}
document.querySelectorAll('[data-concern]').forEach(bindConcern);
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
grid.innerHTML=clinics.map(c=>`<article class="clinic-card" id="clinic-${c.id}"><div class="centre-photo"><img class="clinic-cover" src="/physiotherapy-near-me-delhi/assets/clinics/${c.id}.webp" alt="Inside CB Physiotherapy ${c.name}" width="600" height="692" loading="lazy" decoding="async"><span class="centre-region">${c.area}</span></div><div class="clinic-card-content"><h3>${c.name}</h3><a class="centre-rating" href="${googleProfile(c)}" target="_blank" rel="noopener" aria-label="${c.name}: ${clinicReviewText(c.id)}. Open Google profile"><b class="review-summary"><span aria-hidden="true">${hasReview(clinicReviews[c.id]) ? "★★★★★" : ""}</span> ${clinicReviewText(c.id)}</b><small><svg class="google-review-logo" aria-hidden="true" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.02 46.98 31.86 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg> View Google profile ↗</small></a><p class="clinic-lead">Led by <a href="${c.profile}" target="_blank" rel="noopener">${c.head} <span>(PT)</span></a></p><p class="clinic-landmark">${c.landmark}</p><p class="clinic-near"><span>Also near</span>${c.near.join(' · ')}</p><div class="clinic-meta"><span>${HOURS}</span><details><summary>Full address</summary><p>${c.address}</p></details></div><div class="links"><a href="tel:+91${c.phone}" data-call="${c.id}">Call clinic →</a><a href="${directions(c)}" target="_blank" rel="noopener" data-map="${c.id}">Directions →</a></div><button class="button" data-select="${c.id}">Choose this centre <span>→</span></button></div></article>`).join('');
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

// Google Ads location ids -> clinic (generated from geo-clinics.json; keep both in step)
const GEO_CLINIC={"9182620":"saket","9061645":"saket","9198016":"saket","9183503":"saket","9061644":"saket","9300870":"saket","9061722":"saket","9061643":"saket","9303471":"saket","9198262":"gk","9061657":"gk","9181926":"gk","9061658":"gk","9185112":"gk","9198107":"gk","9061656":"gk","9061655":"gk","9061654":"gk","9061661":"gk","9061651":"gk","9061652":"gk","9246654":"gk","9242829":"gk","9061647":"safdarjung","9181894":"safdarjung","9250881":"safdarjung","9061721":"safdarjung","9061646":"safdarjung","9197871":"safdarjung","9061718":"safdarjung","9181766":"safdarjung","9061716":"safdarjung","9061717":"safdarjung","9300305":"safdarjung","9061720":"safdarjung","9061650":"safdarjung","9219093":"safdarjung","9061648":"safdarjung","9197996":"vasant","9061723":"vasant","9198348":"vasant","9184591":"vasant","9061719":"vasant","9240746":"vasant","9061713":"vasant","9261983":"vasant","9061725":"vasant","9234981":"vasant","9210565":"vasant","9182825":"dwarka","9061709":"dwarka","9061710":"dwarka","9061708":"dwarka","9183333":"dwarka","9061704":"dwarka","9061712":"dwarka","9061699":"dwarka","9212818":"dwarka","9061705":"dwarka","9061706":"dwarka","9061698":"dwarka","9061688":"dwarka","9061697":"dwarka","9061707":"dwarka"};
const ROUTING={"version":"2026-11-25","generic_locations":["delhi","new delhi","south delhi","south west delhi","west delhi","north delhi","east delhi","central delhi","ncr","delhi ncr","india","dilli"],"far_locations":["gurgaon","gurugram","noida","greater noida","faridabad","ghaziabad","sonipat","bahadurgarh","indirapuram","vaishali","sahibabad","manesar","sohna","kundli"],"clinics":{"saket":["saket","saket metro","malviya nagar","pushp vihar","sainik farms","mehrauli","chhatarpur","chattarpur","chhattarpur","neb sarai","saiyad ul ajaib","khirki","ignou","sheikh sarai","panchsheel","tughlakabad","madangir","khanpur","dakshinpuri","ambedkar nagar","deoli","sangam vihar"],"gk":["greater kailash","greater kailash 2","greater kailash ii","greater kailash 1","gk","gk 2","gk2","gk ii","gk 1","gk1","gk i","cr park","c r park","chittaranjan park","kalkaji","nehru place","east of kailash","lajpat nagar","defence colony","alaknanda","govindpuri","okhla","jamia nagar","jamia","nizamuddin","jangpura","jasola","sarita vihar","new friends colony","friends colony","maharani bagh","amar colony","garhi","south extension","south ex"],"safdarjung":["safdarjung","safdarjung enclave","safdarjung development area","hauz khas","green park","sda","r k puram","rk puram","r.k. puram","moti bagh","chanakyapuri","munirka","aiims","bhikaji cama","sarojini nagar","gulmohar park","lodhi road","lodi road","jor bagh","khan market","kidwai nagar","netaji nagar","nanakpura","anand niketan","shanti niketan","hauz khas village","iit delhi","iit","gautam nagar","yusuf sarai","kailash colony"],"vasant":["vasant kunj","vasant vihar","mahipalpur","kishangarh","ghitorni","aya nagar","rangpuri","masoodpur","jnu","vk","sultanpur","sector a vasant kunj","sector b vasant kunj","sector c vasant kunj","sector d vasant kunj","nelson mandela marg","airport","igi airport","rajokri","samalkha","satbari","dera"],"dwarka":["dwarka","dwarka mor","dwarka sector","palam","uttam nagar","najafgarh","janakpuri","bijwasan","tilak nagar","hari nagar","vikaspuri","dabri","mahavir enclave","sagarpur","kakrola","nawada","matiala","chhawla","dwarka expressway","sector 17 dwarka","sector 10 dwarka","sector 12 dwarka","sector 7 dwarka","sector 6 dwarka","raj nagar palam","om vihar","mohan garden","bindapur"]},"conditions":{"spine":["back pain","lower back","lower back pain","backache","back ache","slip disc","slipped disc","disc","sciatica","spine","spinal","cervical","neck","neck pain","lumbar","spondylitis","spondylosis","spondylolisthesis","scoliosis","herniated"],"joint":["knee","knee pain","shoulder","frozen shoulder","joint","joint pain","arthritis","osteoarthritis","hip","ankle","elbow","wrist","heel","plantar","tennis elbow","rheumatoid","gout"],"rehab":["sports","sports injury","injury","post surgery","post-surgery","post operative","acl","fracture","rehab","rehabilitation","ligament","meniscus","knee replacement","hip replacement","surgery","cpm","cpm machine","total knee replacement","tkr","thr"],"other":["pelvic","pelvic floor","neuro","neurological","stroke","paralysis","parkinson","parkinsons","pediatric","paediatric","child","children","bells palsy","bell's palsy","vertigo","cerebral palsy","ms","multiple sclerosis","geriatric","old age","postural","posture","tmj","jaw","vestibular","balance","postpartum","post partum","diastasis recti","prenatal","antenatal","pregnancy","kids","chest","gait","gait training","developmental delay","autism","down syndrome","nerve","neuropathy","facial palsy","face"]},"services":{"chiropractic":["chiropractic","chiropractor","chiro","bone setting","spine adjustment","chiropractors","chiropathy","chirotherapy","chiropractitioner","chiropractic adjustment"],"cupping":["cupping","cup therapy","hijama"],"dry_needling":["dry needling","needling","acupuncture","needle therapy"],"laser":["laser","class 4 laser","high intensity laser"],"tecar":["tecar"],"shockwave":["shockwave","shock wave"],"cryotherapy":["cryotherapy","cryo"],"robotic":["robotic","robotic spinal decompression","spinal decompression","decompression"],"electrotherapy":["ift","tens","ultrasound therapy","electrotherapy","ultrasonic","ultrasonic therapy","interferential"],"home_visit":["home visit","at home","home physiotherapy","home physio","home service","home care","home physiotherapist"],"female":["female physiotherapist","lady physiotherapist","female physio","women physiotherapist","female","lady","ladies","woman","women"],"price":["fees","fee","cost","price","charges","cheap","affordable","rate","rates","within budget"],"manual_therapy":["massage","myofascial","myofascial release","manual therapy","mobilization","mobilisation","wax therapy","wax","hot wax","taping","kinesio"]},"irrelevant":["job","jobs","vacancy","vacancies","salary","course","courses","college","colleges","admission","internship","bpt","mpt","degree","hiring","recruitment","syllabus","exam","what is","meaning","definition","pdf","assistant job","walk in"],"other_delhi":["connaught place","cp","cannaught place","model town","rohini","pitampura","pitam pura","shalimar bagh","laxmi nagar","mayur vihar","preet vihar","karol bagh","paschim vihar","rajouri garden","punjabi bagh","ashok nagar","civil lines","mukherjee nagar","kamla nagar","rajendra nagar","patel nagar","moti nagar","kirti nagar","naraina","vikas puri","dilshad garden","vasundhara enclave","yamuna vihar","burari","narela","bawana","mundka","nangloi","peeragarhi","shahdara","anand vihar","ip extension","patparganj","nirman vihar","daryaganj","chandni chowk","paharganj","old delhi","north campus","gtb nagar","azadpur","wazirabad","jahangirpuri","badli","sultanpuri","mangolpuri","madhuban chowk","ashok vihar","tri nagar","shakti nagar","delhi cantt","delhi cantonment","sadar bazar","inderlok","pandav nagar","vinod nagar","ghazipur","kondli","kalyanpuri","trilokpuri","seelampur","welcome","jaffrabad","gokulpuri","karawal nagar","bhajanpura"]};
// ---- Clinic landing mode ----
// A generated folder (see areas.json) carries <meta name="cb-area" content="saket">; ?area=saket or a nearby
// locality (?area=malviya-nagar) also works. The page then leads with that clinic and says each fact once:
// landing screen (who, where, book, call) -> care -> advanced care -> fees -> getting here (map, address, other clinics).
(function applyArea(){
 const q=new URLSearchParams(location.search);
 let slug=((document.querySelector('meta[name="cb-area"]')||{}).content||q.get('area')||'').toLowerCase().trim(),guess='';
 // Central page: pick a clinic from the ad click. What the person searched for (keyword, then loci = location of
 // interest) beats where they are standing (loc = physical location). An unknown place leaves the page as it is.
 let geoOff=false;try{geoOff=sessionStorage.getItem('cb_geo_off')==='1';}catch(_){}
 const norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-');
 // Classify the matched keyword with the rules in routing.json (synced into ROUTING).
 const words=s=>' '+String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()+' ';
 const has=(text,phrase)=>text.includes(' '+phrase.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()+' ');
 const longest=(text,list)=>list.filter(p=>has(text,p)).sort((x,y)=>y.length-x.length)[0]||'';
 function classify(kw){
  const t=words(kw),out={kw_class:kw?'neutral':'none',clinic:'',alias:'',conditions:[],services:[],irrelevant:false,generic:'',far:''};
  if(!kw)return out;
  let best='';for(const [id,aliases] of Object.entries(ROUTING.clinics)){const m=longest(t,aliases);if(m&&m.length>best.length){best=m;out.clinic=id;out.alias=m;}}
  out.far=longest(t,ROUTING.far_locations);out.generic=longest(t,ROUTING.generic_locations);out.other=longest(t,ROUTING.other_delhi||[]);
  out.kw_class=out.clinic?'locality':out.far?'far':out.other?'other-delhi':out.generic?'generic':'neutral';
  for(const [c,ph] of Object.entries(ROUTING.conditions))if(longest(t,ph))out.conditions.push(c);
  for(const [s,ph] of Object.entries(ROUTING.services))if(longest(t,ph))out.services.push(s);
  out.irrelevant=!!longest(t,ROUTING.irrelevant);
  return out;
 }
 const kwText=q.get('utm_term')||q.get('kw')||'';const cls=classify(/^\{.*\}$/.test(kwText)?'':kwText);
 window.cbRoute={kw_class:cls.kw_class,conditions:cls.conditions,services:cls.services,irrelevant:cls.irrelevant,decision:'none',clinic:'',loc:q.get('loc')||'',loci:q.get('loci')||''};
 if(!slug&&!geoOff){
  // 1. the keyword names a clinic area: that clinic, wherever the person is
  if(cls.clinic){slug=cls.clinic;guess='keyword';}
  // 2. the keyword names Delhi as a whole, or somewhere far: stay on the central page
  else if(cls.kw_class==='generic'||cls.kw_class==='far'||cls.kw_class==='other-delhi'){guess='';}
  // 3. location-neutral: the clinic nearest the person, if Google places them near one; then Google's location of interest
  else if(GEO_CLINIC[q.get('loc')||'']){slug=GEO_CLINIC[q.get('loc')];guess='geo';}
  else if(GEO_CLINIC[q.get('loci')||'']){slug=GEO_CLINIC[q.get('loci')];guess='interest';}
 }
 window.cbRoute.decision=guess||(slug?'page':['generic','far','other-delhi'].includes(cls.kw_class)?cls.kw_class:'none');window.cbRoute.clinic=slug||'';
 // Pre-select the concern and the home option from the keyword, on every page
 const concernFor={spine:'spine',joint:'joint',rehab:'rehab',other:'other'};
 if(cls.conditions.length&&concern&&!concern.value){concern.value=concernFor[cls.conditions[0]]||'';syncTreatment();}
 if(cls.services.includes('home_visit')&&select&&!select.value){select.value='home';select.dispatchEvent(new Event('change'));}
 if(!slug)return;
 const geoGuess=!!guess;
 const c=clinics.find(x=>x.id===slug)||clinics.find(x=>norm(x.name)===slug||norm(x.short)===slug||x.near.some(n=>norm(n)===slug));
 if(!c)return;
 document.body.classList.add('area-mode','area-single');document.body.dataset.area=c.id;document.body.dataset.areaSource=guess||'page';
 const P='/physiotherapy-near-me-delhi/assets/',tel='tel:+91'+c.phone;
 const r=clinicReviews[c.id],rating=hasReview(r)?r.rating.toFixed(1)+' / 5 · '+r.count.toLocaleString('en-IN')+' Google reviews':'Read Google reviews';
 const phoneText=c.phone.replace(/^(\d{5})(\d{5})$/,'$1 $2');
 const mark=c.landmark.split(' · ').pop(),streetLine=c.street.charAt(0).toUpperCase()+c.street.slice(1)+(c.street.toLowerCase().includes(mark.toLowerCase())?'':', '+mark.replace(/^(Near|Opposite|Behind|Beside) /,m=>m.toLowerCase()))+'.';
 const g='<svg class="google-review-logo" aria-hidden="true" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.02 46.98 31.86 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
 const phoneIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3 4 4c-2 6 10 18 16 16l1-3-5-3-2 2c-3-1-5-3-6-6l2-2z"/></svg>';
 const pinIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-7.2-7-12a7 7 0 0 1 14 0c0 4.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>';

 // 1. Landing screen: who and where, said once. Photo card carries only the actions.
 const heroMeta=document.querySelector('meta[name="cb-hero"]');
 const heroImg=heroMeta&&heroMeta.content?{src:heroMeta.content,srcset:heroMeta.dataset.srcset||'',sizes:heroMeta.dataset.sizes||'',w:heroMeta.dataset.width||'',h:heroMeta.dataset.height||''}:{src:P+'clinics/'+c.id+'.webp',srcset:'',sizes:'',w:600,h:692};
 const clockIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
 const hero=document.querySelector('.hero');
 if(hero){
  hero.classList.add('local-hero');
  hero.innerHTML=`<div class="hero-copy">
   <span class="eyebrow">${c.short.toUpperCase()} · ${c.area.toUpperCase()}</span>
   <h1>Best Physiotherapy<br>Near You in ${c.short}.</h1>
   <p class="precision-line">${streetLine}</p>
   <p class="local-line">Recovery led by <a href="${c.profile}" target="_blank" rel="noopener">${c.head} (PT)</a>, with AI Precision.</p>
   <div class="care-shortcuts" aria-label="Choose your treatment">
    <button type="button" data-concern="spine" data-care-target="back-neck" aria-pressed="false">Back / Neck<span aria-hidden="true">→</span></button>
    <button type="button" data-concern="joint" data-care-target="joint-care" aria-pressed="false">Knee / Joint<span aria-hidden="true">→</span></button>
    <button type="button" data-concern="rehab" data-care-target="injury-care" aria-pressed="false">Injury / Surgery<span aria-hidden="true">→</span></button>
    <button type="button" data-concern="other" data-care-target="other-care" aria-pressed="false">Other Issues<span aria-hidden="true">→</span></button>
   </div>
   <div class="hero-actions">
    <button class="reviews-strip rating-badge" type="button" id="open-reviews" aria-haspopup="dialog" aria-label="${rating} for the ${c.short} clinic. Read reviews.">${g}<span class="rating-copy"><span class="rating-top"><span class="rating-stars" aria-hidden="true">★★★★★</span><strong>${rating}</strong></span><span class="rating-bottom"><span>${c.short} clinic</span><span class="rating-read">Read reviews ↗</span></span></span></button>
   </div>
  </div>
  <div class="hero-right local-card">
   <figure class="local-photo"><img src="${heroImg.src}"${heroImg.srcset?` srcset="${heroImg.srcset}" sizes="${heroImg.sizes}"`:''} alt="Inside CB Physiotherapy ${c.name}" width="${heroImg.w}" height="${heroImg.h}" fetchpriority="high" decoding="async"><span class="local-hours">${clockIcon}Open ${HOURS}</span><figcaption>CB Physiotherapy ${c.name}</figcaption></figure>
   <div class="local-ctas"><a class="button" href="#book" aria-haspopup="dialog">Book at ${c.short}<span aria-hidden="true">→</span></a><a class="button ghost" href="${tel}" data-call="${c.id}">${phoneIcon}Call ${phoneText}</a><a class="text-link local-directions" href="${directions(c)}" target="_blank" rel="noopener" data-map="${c.id}">${pinIcon}Directions</a></div>
  </div>`;
  hero.querySelectorAll('[data-concern]').forEach(bindConcern);syncTreatment();
 }

 // 2. Advanced care: the carousel's message as four still photographs, after the care cards.
 const care=document.getElementById('care');
 if(care){
  const tiles=[
   ['slider/spine',450,'Robotic spinal decompression','Computer-controlled traction for disc and nerve-related back and neck pain.'],
   ['slider/laser',533,'Class 4 Laser and TECAR','Deep-tissue therapy to settle pain and inflammation sooner.'],
   ['slider/exercise',600,'Guided strength and movement','Exercise built around what you need to do again, with your physio beside you.'],
   ['precision-strength-testing',450,'Measured, AI-assisted assessment','Digital strength testing and tracked progress, reviewed by your physiotherapist.']];
  const adv=document.createElement('section');adv.className='wrap advanced-care';adv.id='advanced-care';
  adv.innerHTML=`<div class="advanced-head"><h2>Advanced care.<br>At every CB clinic.</h2><p class="advanced-voice">What you will find in ${c.short}, as in all five Delhi centres.</p></div>
   <ul class="advanced-grid">${tiles.map(([img,h,t,d])=>`<li><img src="${P}${img}-800.webp" srcset="${P}${img}-800.webp 800w, ${P}${img}-1200.webp 1200w" sizes="(max-width:700px) 50vw, 25vw" alt="" loading="lazy" decoding="async" width="800" height="${h}"><h3>${t}</h3><p>${d}</p></li>`).join('')}</ul>`;
  care.insertAdjacentElement('afterend',adv);
 }

 // 3. Fees come before the map on a clinic page: location is already settled, price is the next question.
 const pricing=document.getElementById('pricing'),clinicsSec=document.getElementById('clinics');
 if(pricing&&clinicsSec)clinicsSec.insertAdjacentElement('beforebegin',pricing);

 // 4. Getting here: map + the full address and facts, once. Other clinics sit at the end of this block.
 const heading=clinicsSec&&clinicsSec.querySelector('.section-heading');
 if(heading){heading.querySelector('.eyebrow').textContent='GETTING HERE';heading.querySelector('h2').innerHTML='Getting to the<br>'+c.short+' clinic.';heading.querySelector('p').textContent='The address, the landmark and directions. Our other Delhi centres are listed below if '+c.short+' is not your closest.';}
 const explorer=document.querySelector('.clinic-explorer'),railWrap=document.querySelector('.clinic-rail-wrap'),legend=document.getElementById('map-legend');
 if(railWrap)railWrap.hidden=true;if(legend)legend.hidden=true;
 const mapTitle=document.querySelector('.map-heading h3');if(mapTitle)mapTitle.textContent='CB Physiotherapy '+c.short;
 const showAll=document.getElementById('show-all-clinics');if(showAll)showAll.textContent='Show all five centres';
 const note=document.querySelector('.map-note');if(note)note.textContent='Tap the pin for directions.';
 const here=document.createElement('div');here.className='getting-here';
 here.innerHTML=`<address>
   <p class="gh-address">${c.address}</p>
   <p class="gh-mark">${mark}</p>
   <dl class="gh-facts">
    <div><dt>Open</dt><dd>${HOURS}</dd></div>
    <div><dt>Phone</dt><dd><a href="${tel}" data-call="${c.id}">${phoneText}</a></dd></div>
    <div><dt>Physiotherapist</dt><dd><a href="${c.profile}" target="_blank" rel="noopener">${c.head} (PT)</a></dd></div>
    <div><dt>Also serving</dt><dd>${c.near.join(', ')}</dd></div>
   </dl>
   <div class="gh-ctas"><a class="button" href="${directions(c)}" target="_blank" rel="noopener" data-map="${c.id}">${pinIcon}Get directions</a><a class="button ghost" href="${tel}" data-call="${c.id}">${phoneIcon}Call the clinic</a></div>
   <a class="gh-google" href="${googleProfile(c)}" target="_blank" rel="noopener">${g}<span>${rating} · Google profile ↗</span></a>
  </address>`;
 if(explorer&&railWrap)explorer.insertBefore(here,railWrap);
 const stripSection=document.querySelector('.locations-strip');
 if(stripSection&&clinicsSec){stripSection.classList.add('strip-inline');clinicsSec.appendChild(stripSection);}
 const count=document.getElementById('location-count');if(count)count.textContent='Not near '+c.short+'? Our other CB clinics in Delhi';
 document.querySelectorAll('#location-links a[data-show-clinic="'+c.id+'"]').forEach(x=>x.remove());

 // Clinic cards stay available: this clinic first, the rest appear when the visitor asks for other centres.
 const card=document.getElementById('clinic-'+c.id);if(card){grid.prepend(card);card.classList.add('selected');}
 const others=[...grid.children].filter(el=>el!==card);others.forEach(el=>el.hidden=true);
 const originalFit=fitClinics;
 function expand(){
  if(!document.body.classList.contains('area-single'))return;
  document.body.classList.remove('area-single');
  others.forEach(el=>el.hidden=false);if(railWrap)railWrap.hidden=false;if(legend)legend.hidden=false;
  if(clinicMap){clinicMap.closePopup();originalFit();}
  track('area_other_clinics_shown',{clinic_id:c.id});
 }
 if(showAll)showAll.addEventListener('click',expand);
 const strip=document.getElementById('location-links');if(strip)strip.addEventListener('click',e=>{if(e.target.closest('a[data-show-clinic]'))expand();},true);
 fitClinics=function(){if(document.body.classList.contains('area-single')&&clinicMap){clinicMap.setView(c.latlng,14);if(markers[c.id]&&innerWidth>700)markers[c.id].openPopup();}else originalFit();};

 // Booking, calls, WhatsApp, lead source, title
 select.value=c.id;updateClinic();
 const waClinic=document.getElementById('wa-clinic');if(waClinic)waClinic.value=c.id;
 const waIntro=document.querySelector('.wa-intro');if(waIntro)waIntro.textContent='Choose a topic and we will prepare your message to the '+c.short+' clinic. You can add details if you wish.';
 const waSummary=document.querySelector('.wa-optional>summary');if(waSummary)waSummary.innerHTML='Add more details <span>Optional</span>';
 document.querySelectorAll('a.header-call, a.qa-call').forEach(x=>{x.href=tel;x.dataset.call=c.id;x.setAttribute('aria-label','Call CB Physiotherapy '+c.short+' on '+c.phone);});
 const form=document.getElementById('booking-form');if(form)form.dataset.source=geoGuess?'google-ads-delhi-'+guess+'-'+c.id:'google-ads-'+c.id+'-landing';
 if(geoGuess&&hero){const note=document.createElement('div');note.className='geo-note wrap';note.innerHTML='<p>Showing our <strong>'+c.short+'</strong> clinic'+(guess==='geo'?', the nearest to you':'')+'. <button type="button" id="geo-all">Not right? See all five centres</button></p>';hero.insertAdjacentElement('beforebegin',note);
  note.querySelector('#geo-all').addEventListener('click',()=>{try{sessionStorage.setItem('cb_geo_off','1');}catch(_){}track('geo_guess_dismissed',{clinic_id:c.id,how:guess});const u=new URL(location.href);['loc','loci'].forEach(k=>u.searchParams.delete(k));location.replace(u.toString());});}
 const cta=document.querySelector('.final-cta h2');if(cta)cta.innerHTML='Find the right care.<br>At our '+c.short+' clinic.';
 document.title=document.title.replace('in Delhi','in '+c.short+', Delhi');
 document.documentElement.classList.add('area-ready');
})();
