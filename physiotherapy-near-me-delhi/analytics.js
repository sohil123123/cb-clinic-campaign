// First-party, anonymous action tracking for the book.cbphysiotherapy.in pages.
// Small batches of events go to the endpoint named in <meta name="cb-analytics-endpoint">.
// Nothing personal is recorded: no names, phone numbers, form values or message text.
// Set localStorage.cb_debug = "1" to see events in the console.
(()=>{
 const meta=document.querySelector('meta[name="cb-analytics-endpoint"]'),endpoint=meta&&meta.content||'';
 const debug=(()=>{try{return localStorage.getItem('cb_debug')==='1';}catch(_){return false;}})();
 if(navigator.webdriver&&!debug)return; // automated browsers (tests, crawlers) are not visitors
 const uid=()=>crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36);
 const remember=(storage,key)=>{try{let v=storage.getItem(key);if(!v){v=uid();storage.setItem(key,v);}return v;}catch(_){return uid();}};
 const visitor=remember(localStorage,'cb_vid'),session=remember(sessionStorage,'cb_sid');
 const params=new URLSearchParams(location.search);
 let referrer='';try{referrer=document.referrer?new URL(document.referrer).hostname:'';}catch(_){}
 const ctx={page:location.pathname.replace(/index\.html$/,''),area:document.body.dataset.area||'delhi',area_source:document.body.dataset.areaSource||'',device:innerWidth<=700?'mobile':'desktop',referrer,
  utm_source:params.get('utm_source')||'',utm_medium:params.get('utm_medium')||'',utm_campaign:params.get('utm_campaign')||'',utm_term:params.get('utm_term')||'',utm_content:params.get('utm_content')||'',gclid:params.has('gclid')?1:0};

 // ---- transport: batch, then beacon ----
 const queue=[];let timer=null;
 function flush(final){
  if(!queue.length)return;
  const batch=queue.splice(0,25),body=JSON.stringify({v:1,visitor,session,sent_at:new Date().toISOString(),events:batch});
  if(debug)console.log('[cb-analytics]',batch);
  if(!endpoint)return;
  if(final&&navigator.sendBeacon&&navigator.sendBeacon(endpoint,body))return; // text/plain: no preflight
  fetch(endpoint,{method:'POST',body,keepalive:true,mode:'cors',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'}}).catch(()=>{});
  if(queue.length)flush(final);
 }
 function track(event,props){queue.push({event,ts:new Date().toISOString(),...ctx,props:props||{}});clearTimeout(timer);timer=setTimeout(()=>flush(false),2500);}
 window.cbTrack=track;

 // ---- engagement: active time and scroll depth ----
 let active=0,since=document.hidden?null:Date.now(),maxScroll=0,sent50=false,sent90=false;
 const activeSeconds=()=>Math.round((active+(since?Date.now()-since:0))/1000);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(since){active+=Date.now()-since;since=null;}flush(true);}else since=Date.now();});
 addEventListener('scroll',()=>{const h=document.documentElement,pct=Math.round((scrollY+innerHeight)/h.scrollHeight*100);if(pct>maxScroll)maxScroll=Math.min(100,pct);if(!sent50&&maxScroll>=50){sent50=true;track('scroll_50');}if(!sent90&&maxScroll>=90){sent90=true;track('scroll_90');}},{passive:true});
 // ---- which sections are actually seen (layout input) ----
 const SECTIONS=['care','advanced-care','team','central','pricing','reviews','clinics','book','precision-recovery','faq','final-cta'];let lastSection='hero';
 if('IntersectionObserver' in window){const seen=new Set();const io=new IntersectionObserver(entries=>{entries.forEach(en=>{if(!en.isIntersecting)return;const id=en.target.id||en.target.className.split(' ')[0];lastSection=id;if(seen.has(id))return;seen.add(id);track('section_seen',{section:id});});},{threshold:0.25});
  SECTIONS.forEach(id=>{const el=document.getElementById(id)||document.querySelector('.'+id);if(el)io.observe(el);});}
 addEventListener('pagehide',()=>{track('page_leave',{seconds:activeSeconds(),max_scroll:maxScroll,last_section:lastSection});flush(true);});

 // ---- events the page already announces (booking sent/failed, clinic selected, other clinics shown) ----
 const loadedAt=performance.now();
 const forward=e=>{if(!e||typeof e!=='object'||!e.event)return;if(['clinic_call_click','clinic_directions_click'].includes(e.event))return;if(e.event==='clinic_selected'&&performance.now()-loadedAt<1500)return;const {event,...rest}=e;track(event,rest);};
 const dl=window.dataLayer=window.dataLayer||[];dl.forEach(forward);const push=dl.push.bind(dl);dl.push=function(){for(const a of arguments)forward(a);return push.apply(null,arguments);};

 // ---- clicks ----
 const placement=el=>el.closest('header')?'header':el.closest('.quick-actions')?'floating':el.closest('.local-card')?'landing_card':el.closest('.getting-here')?'getting_here':el.closest('.clinic-card')?'clinic_card':el.closest('.clinic-popup')?'map':el.closest('#booking-dialog')?'booking_form':el.closest('#whatsapp-dialog')?'whatsapp_dialog':el.closest('.final-cta')?'final_cta':el.closest('.price-card')?'pricing':el.closest('.hero')?'hero':el.closest('.faq-section')?'faq':'page';
 document.addEventListener('click',e=>{
  const a=e.target.closest('a,button');if(!a)return;const where=placement(a);
  if(a.matches('a[href^="tel:"]'))return track('call_click',{number:(a.getAttribute('href')||'').replace(/\D/g,''),placement:where,clinic:a.dataset.call||''});
  if(a.matches('a[href*="google.com/maps/search"]'))return track('directions_click',{clinic:a.dataset.map||'',placement:where});
  if(a.matches('a[href*="google.com/maps?cid"]'))return track('google_profile_click',{placement:where});
  if(a.matches('[data-open-whatsapp]'))return track('whatsapp_open',{placement:where});
  if(a.id==='wa-send'){if(a.getAttribute('aria-disabled')==='true')return;return track('whatsapp_send',{intent:[...document.querySelectorAll('input[name="wa-intent"]:checked')].map(i=>i.value).join(',')||'none',clinic:(document.getElementById('wa-clinic')||{}).value||''});}
  if(a.id==='booking-whatsapp')return track('whatsapp_send',{intent:'after_booking'});
  if(a.matches('.care-shortcuts [data-concern]'))return track('concern_selected',{concern:a.dataset.concern,placement:'hero'});
  if(a.matches('.pathway-cta'))return track('concern_selected',{concern:a.dataset.concern,placement:'care_card'});
  if(a.matches('a[href="#book"],[data-select],[data-book]'))return track('booking_opened',{placement:a.dataset.place||where,clinic:a.dataset.select||''});
  if(a.matches('a[href*="wa.me"]'))return track('whatsapp_send',{intent:a.dataset.intent||'direct',clinic:document.body.dataset.area||''});
  if(a.matches('[data-reviews]'))return track('reviews_opened',{});
  if(a.id==='open-reviews')return track('reviews_opened',{});
  if(a.matches('#location-links a'))return track('clinic_pill_click',{clinic:a.dataset.showClinic||''});
  if(a.matches('#map-legend button'))return track('map_pin_click',{clinic:a.dataset.showClinic||''});
  if(a.id==='show-all-clinics'||a.id==='show-other-clinics')return track('other_clinics_opened',{});
  if(a.matches('a[href*="cbphysiotherapy.in/delhi/"]'))return track('outbound_click',{to:a.pathname});
 },true);
 document.querySelectorAll('.faq details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)track('faq_opened',{question:((d.querySelector('summary')||{}).textContent||'').trim().slice(0,80)});}));

 // Google Ads ValueTrack values from the account tracking template (loc = searcher's physical location id,
 // loci = location of interest, kw/mt = keyword and match type, net = network, dev = Google's device, cid/agid = ids).
 const ad={};[['loc','loc'],['loci','loci'],['utm_term','kw'],['mt','mt'],['net','net'],['dev','dev'],['utm_content','creative'],['cid','cid'],['agid','agid']].forEach(([q,k])=>{const v=params.get(q);if(v&&!/^\{.*\}$/.test(v))ad[k]=v.slice(0,80);});
 track('page_view',{title:document.title,ad,route:window.cbRoute||null,layout:document.body.dataset.layout||'hero1'});
})();
