// Top clinic strip: a slow, continuously scrolling ticker of the five Delhi clinics.
// Links point at the real clinic pages (crawlable); clicking on this page shows the clinic on the map instead.
// Pauses on hover, touch and keyboard focus. With "reduce motion" it becomes a plain swipeable row.
(()=>{
const links=document.getElementById('location-links');if(!links)return;
const frame=links.parentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),motion=()=>reduce.matches?'auto':'smooth';
const track=document.createElement('div');track.className='location-track';
const group=document.createElement('div');group.className='location-group';[...links.children].forEach(a=>group.appendChild(a));
track.appendChild(group);links.appendChild(track);
let copies=[];
function build(){
 copies.forEach(c=>c.remove());copies=[];
 const ticker=!reduce.matches;links.classList.toggle('location-ticker',ticker);
 if(!ticker){links.style.removeProperty('--ticker-distance');links.style.removeProperty('--ticker-duration');update();return;}
 const gap=parseFloat(getComputedStyle(track).gap)||8,width=group.getBoundingClientRect().width;
 const needed=Math.max(1,Math.ceil(links.clientWidth/(width+gap)))+1;
 for(let i=0;i<needed;i++){const c=group.cloneNode(true);c.setAttribute('aria-hidden','true');c.querySelectorAll('a').forEach(a=>a.tabIndex=-1);track.appendChild(c);copies.push(c);}
 links.style.setProperty('--ticker-distance',(width+gap)+'px');
 links.style.setProperty('--ticker-duration',Math.max(14,(width+gap)/38).toFixed(1)+'s');
 frame.classList.add('has-more','has-previous');
}
function update(){if(links.classList.contains('location-ticker'))return;const max=links.scrollWidth-links.clientWidth;frame.classList.toggle('has-more',links.scrollLeft<max-2);frame.classList.toggle('has-previous',links.scrollLeft>2);}
links.addEventListener('scroll',update,{passive:true});
links.addEventListener('click',e=>{
 const a=e.target.closest('a[data-show-clinic]');if(!a)return;
 e.preventDefault();
 document.getElementById('clinics').scrollIntoView({behavior:motion(),block:'start'});
 if(a.closest('[aria-hidden="true"]')&&typeof showClinic==='function')showClinic(a.dataset.showClinic);
});
// Keyboard users get a static, scrollable row so focused links stay in view; pointer and touch keep the ticker (paused while hovering/touching).
let keyboard=false;
document.addEventListener('keydown',e=>{if(e.key==='Tab')keyboard=true;});
document.addEventListener('pointerdown',()=>{keyboard=false;},{capture:true,passive:true});
links.addEventListener('focusin',()=>links.classList.toggle('is-keyboard',keyboard));
links.addEventListener('focusout',e=>{if(!links.contains(e.relatedTarget))links.classList.remove('is-keyboard');});
let touchTimer;links.addEventListener('touchstart',()=>{links.classList.add('is-paused');clearTimeout(touchTimer);},{passive:true});
links.addEventListener('touchend',()=>{touchTimer=setTimeout(()=>links.classList.remove('is-paused'),2500);},{passive:true});
links.addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;const items=[...group.querySelectorAll('a')],i=items.indexOf(document.activeElement);if(i<0)return;e.preventDefault();items[Math.max(0,Math.min(items.length-1,i+(e.key==='ArrowRight'?1:-1)))].focus();});
let frameWidth=0;new ResizeObserver(()=>{const w=links.clientWidth;if(Math.abs(w-frameWidth)<2)return;frameWidth=w;build();}).observe(links);
reduce.addEventListener?reduce.addEventListener('change',build):reduce.addListener(build);
build();
})();
