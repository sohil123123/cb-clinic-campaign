(()=>{
 const motion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
 document.querySelectorAll('[data-rail]').forEach(nav=>{
  const rail=document.getElementById(nav.dataset.rail),cards=[...rail.children];
  const prev=nav.querySelector('[data-rail-prev]'),next=nav.querySelector('[data-rail-next]'),count=nav.querySelector('[data-rail-count]');
  const current=()=>{let best=0,delta=Infinity;cards.forEach((card,i)=>{const d=Math.abs(card.getBoundingClientRect().left-rail.getBoundingClientRect().left);if(d<delta){delta=d;best=i;}});return best;};
  const update=()=>{const last=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-5;prev.disabled=rail.scrollLeft<5;next.disabled=last;count.textContent=`${current()+1} / ${cards.length}`;};
  const move=dir=>{const step=cards[0].getBoundingClientRect().width+parseFloat(getComputedStyle(rail).gap);rail.scrollBy({left:step*dir,behavior:motion()});};
  prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));rail.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();
  rail.addEventListener('keydown',e=>{if(e.target===rail&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
 });
 const form=document.getElementById('booking-form'),clinic=document.getElementById('clinic'),home=document.getElementById('home-area'),area=document.getElementById('home-area-field');
 const button=document.getElementById('booking-submit'),error=document.getElementById('request-error'),status=document.getElementById('request-status');
 const homeState=()=>{const selected=clinic.value==='home';area.hidden=!selected;home.required=selected;};
 clinic.addEventListener('change',homeState);
 document.getElementById('choose-home').addEventListener('click',()=>{clinic.value='home';clinic.dispatchEvent(new Event('change'));home.focus();});
 // Booking requests are saved by the CB Physiotherapy site API (data-endpoint on the form).
 // Thank-you is shown only after the API confirms the lead was saved.
 const endpoint=form.dataset.endpoint,defaultLabel='Request an appointment →',care=document.getElementById('concern');
 const utmKeys=['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
 let sending=false;
 function showError(text){error.textContent=text;error.hidden=false;error.scrollIntoView({behavior:motion(),block:'center'});}
 function setSending(on){sending=on;button.disabled=on;button.setAttribute('aria-busy',String(on));button.textContent=on?'Sending your request…':defaultLabel;}
 function failureMessage(res,data){
  if(res.status===422){const first=data&&data.errors&&Object.values(data.errors).flat().find(Boolean);return first||(data&&data.message)||'Please check your details and try again.';}
  if(res.status===429)return 'Too many requests from your connection. Please wait a minute and try again, or call us on 011 4084 6393.';
  if(res.status===403)return 'This form could not be verified from this page. Please call us on 011 4084 6393 or use WhatsApp.';
  if(res.status===502&&data&&data.message)return data.message;
  return 'We could not save your request right now. Please call us on 011 4084 6393 or try again shortly.';
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(sending||!form.reportValidity())return;
  const name=document.getElementById('patient-name').value.trim();
  const phone=document.getElementById('patient-phone').value.trim();
  const normalized=phone.replace(/[\s()-]/g,'').replace(/^(\+91|0091)/,'').replace(/^91(?=\d{10}$)/,'');
  error.hidden=true;status.hidden=true;
  if(!/^[6-9]\d{9}$/.test(normalized)){showError('Please enter a valid 10-digit Indian mobile number.');return;}
  const params=new URLSearchParams(location.search);
  const payload={name,phone:normalized,clinic:clinic.value,website:document.getElementById('website').value,source:'google-ads-delhi-landing',landing_url:location.href.slice(0,2000)};
  if(care.value)payload.concern=care.value;
  if(clinic.value==='home')payload.homeArea=home.value.trim();
  utmKeys.forEach(k=>{const v=params.get(k);if(v)payload[k]=v.slice(0,200);});
  setSending(true);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  let res=null,data=null;
  try{
   res=await fetch(endpoint,{method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload),signal:controller.signal});
   try{data=await res.json();}catch(_){data=null;}
  }catch(_){res=null;}
  clearTimeout(timer);
  setSending(false);
  if(res&&res.ok&&data&&data.success===true){
   const centre=clinic.options[clinic.selectedIndex].text;
   document.getElementById('request-confirmation').textContent=`Thank you, ${name}. We have received your request for ${centre} and our team will call ${phone} to confirm a time.`;
   const message=`Hello CB Physiotherapy, I just sent an appointment request from your website. Name: ${name}. Mobile: ${phone}. Care: ${care.selectedOptions[0].text}. Preferred option: ${centre}${clinic.value==='home'?' ('+home.value.trim()+')':''}.`;
   document.getElementById('booking-whatsapp').href='https://wa.me/919821966696?text='+encodeURIComponent(message);
   status.hidden=false;status.focus({preventScroll:true});status.scrollIntoView({behavior:motion(),block:'center'});
   button.disabled=true;button.textContent='Request sent ✓';
   form.addEventListener('input',()=>{button.disabled=false;button.textContent=defaultLabel;},{once:true});
   track('booking_request_sent',{clinic_id:clinic.value});
   return;
  }
  showError(res?failureMessage(res,data):'We could not reach our booking service. Please check your connection and try again, or call us on 011 4084 6393.');
  track('booking_request_failed',{reason:res?String(res.status):'network'});
 });
 const dialog=document.getElementById('reviews-dialog');
 document.getElementById('review-clinic-links').innerHTML=clinics.map(c=>`<a href="${googleProfile(c)}" target="_blank" rel="noopener"><span>${c.name}</span><span>View on Google ↗</span></a>`).join('');
 document.getElementById('open-reviews').addEventListener('click',()=>dialog.showModal());
 document.getElementById('close-reviews').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 homeState();
})();
