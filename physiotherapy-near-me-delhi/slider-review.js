
(()=>{
const root=document.querySelector('.care-slider');if(!root)return;
const slides=[...root.querySelectorAll('.care-slide')],dots=[...root.querySelectorAll('[data-slide]')],stage=root.querySelector('.slider-stage'),pause=root.querySelector('#slide-pause');
let index=0,timer=null,playing=false,hovered=false,focused=false,visible=true;
function render(manual=false){slides.forEach((s,i)=>s.hidden=i!==index);dots.forEach((b,i)=>b.setAttribute('aria-current',String(i===index)));root.querySelector('#slide-count').textContent=String(index+1).padStart(2,'0')+' / 05';if(manual)root.querySelector('#slide-announcement').textContent=slides[index].querySelector('h2').textContent;}
function schedule(){clearInterval(timer);timer=null;pause.setAttribute('aria-label',playing?'Pause slideshow':'Play slideshow');pause.textContent=playing?'Ⅱ':'▷';if(playing&&!hovered&&!focused&&visible&&!document.hidden)timer=setInterval(()=>{index=(index+1)%slides.length;render();},6500);}
function go(next){index=(next+slides.length)%slides.length;playing=false;render(true);schedule();}
dots.forEach((b,i)=>b.addEventListener('click',()=>go(i)));
root.querySelector('#slide-prev').addEventListener('click',()=>go(index-1));root.querySelector('#slide-next').addEventListener('click',()=>go(index+1));pause.addEventListener('click',()=>{playing=!playing;if(playing){focused=false;hovered=false;}schedule();});
stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(index+(e.key==='ArrowRight'?1:-1));}});
root.addEventListener('mouseenter',()=>{hovered=true;schedule();});root.addEventListener('mouseleave',()=>{hovered=false;schedule();});root.addEventListener('focusin',()=>{focused=true;schedule();});root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget)){focused=false;schedule();}});
document.addEventListener('visibilitychange',schedule);
let start=null;stage.addEventListener('touchstart',e=>{if(e.touches.length===1)start={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});stage.addEventListener('touchend',e=>{if(!start)return;const x=e.changedTouches[0].clientX-start.x,y=e.changedTouches[0].clientY-start.y;if(Math.abs(x)>45&&Math.abs(x)>Math.abs(y))go(index+(x<0?1:-1));start=null;},{passive:true});
if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.25}).observe(root);schedule();
})();
