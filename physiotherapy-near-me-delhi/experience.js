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
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const name=document.getElementById('patient-name').value.trim();
  const phone=document.getElementById('patient-phone').value.trim();
  const normalized=phone.replace(/[\s()-]/g,'').replace(/^(\+91|0091)/,'').replace(/^91(?=\d{10}$)/,'');
  error.hidden=true;status.hidden=true;
  if(!/^[6-9]\d{9}$/.test(normalized)){error.textContent='Please enter a valid 10-digit Indian mobile number.';error.hidden=false;return;}
  document.getElementById('request-confirmation').textContent=`Thank you, ${name}. Your details are ready. You can also continue on WhatsApp below.`;
  const centre=clinic.options[clinic.selectedIndex].text;
  const care=document.getElementById('concern').selectedOptions[0].text;
  const message=`Hello CB Physiotherapy, I would like to enquire about an appointment. Name: ${name}. Mobile: ${phone}. Care: ${care}. Preferred option: ${centre}${clinic.value==='home'?' ('+home.value.trim()+')':''}. Please help with availability and assessment fees.`;
  document.getElementById('booking-whatsapp').href='https://wa.me/919821966696?text='+encodeURIComponent(message);
  status.hidden=false;status.focus({preventScroll:true});status.scrollIntoView({behavior:motion(),block:'center'});button.textContent='Submit another request →';
 });
 const dialog=document.getElementById('reviews-dialog');
 document.getElementById('review-clinic-links').innerHTML=clinics.map(c=>`<a href="${googleProfile(c)}" target="_blank" rel="noopener"><span>${c.name}</span><span>View on Google ↗</span></a>`).join('');
 document.getElementById('open-reviews').addEventListener('click',()=>dialog.showModal());
 document.getElementById('close-reviews').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 homeState();
})();
