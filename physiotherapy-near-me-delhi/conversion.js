(()=>{
 const motion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
 const booking=document.getElementById('booking-dialog'),clinic=document.getElementById('clinic');
 function openDialog(dialog){dialog.showModal();document.body.classList.add('modal-open');}
 document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');});
  if(dialog.id!=='reviews-dialog')dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 });
 document.getElementById('open-reviews').addEventListener('click',()=>document.body.classList.add('modal-open'));
 function openBooking(){if(!clinic.value)clinic.value='help';document.getElementById('request-status').hidden=true;document.getElementById('request-error').hidden=true;const submit=document.getElementById('booking-submit');submit.disabled=false;submit.textContent='Request an appointment →';clinic.dispatchEvent(new Event('change'));openDialog(booking);booking.scrollTop=0;}
 document.addEventListener('click',e=>{const link=e.target.closest('a[href="#book"], [data-select]');if(link){e.preventDefault();openBooking();}});
 document.getElementById('close-booking').addEventListener('click',()=>booking.close());
 if(location.hash==='#book')openBooking();
 // Keep vertical scrolling native; horizontal browsing is deliberate.
 document.querySelectorAll('[data-rail]').forEach(nav=>{
  const rail=document.getElementById(nav.dataset.rail),all=nav.querySelector('[data-rail-all]');
  all.addEventListener('click',()=>{const expanded=rail.classList.toggle('rail-expanded');all.setAttribute('aria-expanded',String(expanded));all.textContent=expanded?'Show fewer':'Show all';nav.querySelectorAll('[data-rail-prev],[data-rail-next],[data-rail-count]').forEach(el=>el.hidden=expanded);});
 });
 clinic.addEventListener('change',()=>{document.getElementById('booking-fee').textContent=clinic.value==='home'?'Home physiotherapy · Fees confirmed by the team':'₹999 · AI-assisted assessment & report';});
 const wa=document.getElementById('whatsapp-dialog'),waClinic=document.getElementById('wa-clinic'),service=document.getElementById('wa-service'),question=document.getElementById('wa-question'),message=document.getElementById('wa-message'),send=document.getElementById('wa-send');
 const intents=()=>[...document.querySelectorAll('input[name="wa-intent"]:checked')].map(e=>e.value);
 function updateLink(){const ready=intents().length>0&&message.value.trim().length>0;send.setAttribute('aria-disabled',String(!ready));send.tabIndex=ready?0:-1;if(ready)send.href='https://wa.me/919821966696?text='+encodeURIComponent(message.value.trim());else send.removeAttribute('href');}
 function compose(){
  const picked=intents(),lines=['Hello CB Physiotherapy, I would like help with:'];
  document.getElementById('wa-service-field').hidden=!picked.includes('service');document.getElementById('wa-question-field').hidden=!picked.includes('other');
  if(picked.includes('appointment'))lines.push('• Booking a physiotherapy assessment. Please share available appointment times.');
  if(picked.includes('pricing'))lines.push('• Clinic fees: ₹999 assessment, ₹999 standard session or ₹1,499 advanced session. Please help me understand the suitable option.');
  if(picked.includes('service'))lines.push('• '+(service.value?'Information about '+service.value+'.':'Understanding which treatment options may be suitable for me.'));
  if(picked.includes('other'))lines.push('• '+(question.value.trim()||'I have another question and would like to speak with your team.'));
  lines.push(waClinic.value?'Preferred option: '+waClinic.selectedOptions[0].text+'.':'Please help me choose a convenient Delhi centre.');
  const concern=document.getElementById('concern');if(concern.value)lines.push('My concern: '+concern.selectedOptions[0].text+'.');
  message.value=picked.length?lines.join('\n'):'';updateLink();
 }
 document.querySelectorAll('[data-open-whatsapp]').forEach(b=>b.addEventListener('click',()=>{waClinic.value=[...waClinic.options].some(o=>o.value===clinic.value)?clinic.value:'';compose();openDialog(wa);}));
 document.getElementById('close-whatsapp').addEventListener('click',()=>wa.close());
 document.querySelectorAll('input[name="wa-intent"]').forEach(c=>c.addEventListener('change',compose));
 waClinic.addEventListener('change',compose);service.addEventListener('change',compose);question.addEventListener('input',compose);message.addEventListener('input',updateLink);
 send.addEventListener('click',e=>{if(send.getAttribute('aria-disabled')==='true')e.preventDefault();});
})();
