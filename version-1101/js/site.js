
(function(){
const menuBtn=document.querySelector('[data-menu-toggle]');
const params=new URLSearchParams(window.location.search);
const initialQuery=params.get('q')||'';
const mobileMenu=document.querySelector('[data-mobile-menu]');
if(menuBtn&&mobileMenu){menuBtn.addEventListener('click',()=>mobileMenu.classList.toggle('open'));}
const slides=[...document.querySelectorAll('.hero-slide')];
const dots=[...document.querySelectorAll('.hero-dots button')];
let current=0,timer=null;
function show(i){if(!slides.length)return;current=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle('active',n===current));dots.forEach((d,n)=>d.classList.toggle('active',n===current));}
function play(){if(slides.length>1){timer=setInterval(()=>show(current+1),5200);}}
dots.forEach((d,i)=>d.addEventListener('click',()=>{show(i);clearInterval(timer);play();}));
document.querySelectorAll('[data-hero-prev]').forEach(b=>b.addEventListener('click',()=>{show(current-1);clearInterval(timer);play();}));
document.querySelectorAll('[data-hero-next]').forEach(b=>b.addEventListener('click',()=>{show(current+1);clearInterval(timer);play();}));
show(0);play();
document.querySelectorAll('[data-search-scope]').forEach(scope=>{
 const input=scope.querySelector('[data-search-input]');
 const buttons=[...scope.querySelectorAll('[data-filter]')];
 const cards=[...scope.querySelectorAll('[data-card]')];
 const empty=scope.querySelector('[data-empty]');
 let filter='all';
 function apply(){const q=(input&&input.value||'').trim().toLowerCase();let visible=0;cards.forEach(card=>{const text=(card.getAttribute('data-search-text')||'').toLowerCase();const passText=!q||text.indexOf(q)>-1;const passFilter=filter==='all'||text.indexOf(filter)>-1;const on=passText&&passFilter;card.classList.toggle('card-hidden',!on);if(on)visible++;});if(empty)empty.style.display=visible?'none':'block';}
 if(input){if(initialQuery){input.value=initialQuery;}input.addEventListener('input',apply);}
 buttons.forEach(btn=>btn.addEventListener('click',()=>{filter=btn.getAttribute('data-filter')||'all';buttons.forEach(b=>b.classList.toggle('active',b===btn));apply();}));
 apply();
});
})();
