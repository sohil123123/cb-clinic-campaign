(()=>{
const links=document.getElementById('location-links');if(!links)return;
function update(){const max=links.scrollWidth-links.clientWidth;links.parentElement.classList.toggle('has-more',links.scrollLeft<max-2);links.parentElement.classList.toggle('has-previous',links.scrollLeft>2);document.getElementById('location-count').textContent=links.querySelectorAll('a').length+' Clinics Across Delhi';}
links.addEventListener('scroll',update,{passive:true});
links.addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;const items=[...links.querySelectorAll('a')],i=items.indexOf(document.activeElement);if(i<0)return;e.preventDefault();items[Math.max(0,Math.min(items.length-1,i+(e.key==='ArrowRight'?1:-1)))].focus();});
new ResizeObserver(update).observe(links);new MutationObserver(update).observe(links,{childList:true});update();
})();
