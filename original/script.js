const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ticketUrl='https://www.eventbrite.ie/e/krown-road-to-glory-tickets-1998809885173';
const octoberUrl='https://www.eventbrite.ie/e/krown-boxing-promotions-october-madness-tickets-1998419811452';
const krownIG='https://www.instagram.com/krownboxingpromotion/';
const jordanIG='https://www.instagram.com/jordan_burnett96/?hl=en';
const siteUrl=()=>window.location.href.split('#')[0];

// Navigation
const nav=$('#siteNav'), toggle=$('.nav-toggle'), links=$('#navLinks');
toggle?.addEventListener('click',()=>{const open=links.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});
$$('#navLinks a, #navLinks button').forEach(x=>x.addEventListener('click',()=>links.classList.remove('open')));
window.addEventListener('scroll',()=>{nav.classList.toggle('scrolled',scrollY>20);const h=document.documentElement.scrollHeight-innerHeight;$('.scroll-progress').style.width=(h>0?scrollY/h*100:0)+'%'});

// Reveal motion
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.14});
$$('.reveal').forEach(e=>io.observe(e));

// Countdown
const cd=$('[data-countdown]');
function tick(){if(!cd)return;const diff=new Date(cd.dataset.countdown)-new Date();if(diff<=0){$$('[data-days],[data-hours],[data-minutes],[data-seconds]',cd).forEach(x=>x.textContent='00');return}const d=Math.floor(diff/864e5),h=Math.floor(diff/36e5)%24,m=Math.floor(diff/6e4)%60,s=Math.floor(diff/1e3)%60;$('.countdown [data-days]').textContent=String(d).padStart(2,'0');$('.countdown [data-hours]').textContent=String(h).padStart(2,'0');$('.countdown [data-minutes]').textContent=String(m).padStart(2,'0');$('.countdown [data-seconds]').textContent=String(s).padStart(2,'0')}
tick();setInterval(tick,1000);

// Calendar file
$('#addCalendar')?.addEventListener('click',()=>{const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//KROWN Boxing Promotions//EN','BEGIN:VEVENT','UID:krown-road-to-glory-2026@krown','DTSTAMP:20261108T000000Z','DTSTART:20261205T150000Z','DTEND:20261205T230000Z','SUMMARY:KROWN Road To Glory','LOCATION:Ashbourne House Hotel, Frederick Street, Ashbourne, Co. Meath, Ireland','DESCRIPTION:KROWN Boxing Promotions — 8-man Prizefighter tournament, 15+ fights and 6 championship title fights.','URL:'+ticketUrl,'END:VEVENT','END:VCALENDAR'].join('\r\n');const blob=new Blob([ics],{type:'text/calendar'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='krown-road-to-glory.ics';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)});
$('#shareEvent')?.addEventListener('click',async()=>{if(navigator.share){await navigator.share({title:'KROWN Road To Glory',text:'KROWN Road To Glory — 5 December 2026',url:ticketUrl})}else{await navigator.clipboard?.writeText(ticketUrl);alert('KROWN ticket link copied.')}});

// Tickets / live
$$('[data-ticket]').forEach(b=>b.addEventListener('click',()=>window.open(ticketUrl,'_blank','noopener')));
$('#streamLaunch')?.addEventListener('click',()=>document.querySelector('#live').scrollIntoView({behavior:'smooth'}));

// QR modal
let qr;
const qrModal=$('#qrModal'), qrc=$('#qrcode'), qrLabel=$('#qrLabel');
function openQR(type){let url=siteUrl(),label='Scan to open the KROWN website.';if(type==='ticket'){url=ticketUrl;label='Scan to open KROWN Road To Glory tickets.'}if(type==='october'){url=octoberUrl;label='Scan to open the October Madness event page.'}if(type==='site'){url=siteUrl();label='Scan to open the KROWN website.'}qrc.innerHTML='';qr=new QRCode(qrc,{text:url,width:190,height:190,colorDark:'#050505',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});qrLabel.textContent=label;qrModal.classList.add('open');qrModal.setAttribute('aria-hidden','false')}
$$('[data-qr]').forEach(b=>b.addEventListener('click',()=>openQR(b.dataset.qr)));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>{b.closest('.modal')?.classList.remove('open');b.closest('.modal')?.setAttribute('aria-hidden','true')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.modal.open').forEach(m=>m.classList.remove('open'))});
$('#downloadQR')?.addEventListener('click',()=>{const canvas=$('#qrcode canvas');if(!canvas)return;const a=document.createElement('a');a.download='krown-qr.png';a.href=canvas.toDataURL('image/png');a.click()});

// Support modal
const support=$('#supportModal');$('#supportBtn')?.addEventListener('click',()=>{support.classList.add('open');support.setAttribute('aria-hidden','false')});

// Subscribe: static-site friendly. Stores a local opt-in and provides a confirmation UI; connect to Mailchimp/ConvertKit/etc later.
$('#subscribeForm')?.addEventListener('submit',e=>{e.preventDefault();const email=$('#subEmail').value.trim();localStorage.setItem('krown_subscriber',email);$('#subNote').textContent='You’re on the KROWN list for this browser. Connect your preferred email platform to collect submissions centrally.';$('#subEmail').value='' });

// Contact form opens user's email client without inventing an official KROWN email address.
$('#contactForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);const topic=f.get('topic');const subject=encodeURIComponent('KROWN Enquiry — '+topic);const body=encodeURIComponent(`Name: ${f.get('name')}\nEmail: ${f.get('email')}\nTopic: ${topic}\n\n${f.get('message')}`);window.location.href=`mailto:?subject=${subject}&body=${body}`;$('#contactNote').textContent='Your email app should now open with the enquiry prepared. Add KROWN’s approved receiving address before sending.'});
