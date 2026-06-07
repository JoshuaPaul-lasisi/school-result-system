/* Debbyfield Schools — public website shared behaviour */
(function(){
  const burger=document.querySelector('.nav-burger');
  const links=document.querySelector('.nav-links');
  if(burger&&links){
    burger.addEventListener('click',()=>links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));
  }
  const path=location.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'');
  document.querySelectorAll('.nav-links a[data-path]').forEach(a=>{
    if(a.dataset.path===path||(path==='/'&&a.dataset.path==='/'))a.classList.add('active');
  });
})();

const SUPABASE_URL="https://gacjyhcuwizswjqauljb.supabase.co";
const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhY2p5aGN1d2l6c3dqcWF1bGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MzU4NTksImV4cCI6MjA5NTMxMTg1OX0.YdoCCOR0zaVs8ZF3h0TCn6NDwamk4xu4dZLSqf8P-Vw";
let _siteDb=null;
function siteDb(){
  if(_siteDb)return _siteDb;
  if(window.supabase)_siteDb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
  return _siteDb;
}

function escHtml(s){
  return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function fmtDate(d){
  try{return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}catch(e){return d}
}

/* ── News & Events: renders into #site-news-list (used on home + news page) ── */
async function loadSiteNews(limit){
  const el=document.getElementById('site-news-list');
  if(!el)return;
  const db=siteDb();
  if(!db){ el.innerHTML='<div class="empty-note">News will appear here once the site is connected.</div>'; return; }
  let q=db.from('site_news').select('id,title,body,image_url,published_at').eq('published',true).order('published_at',{ascending:false});
  if(limit)q=q.limit(limit);
  const {data,error}=await q;
  if(error||!data||!data.length){ el.innerHTML='<div class="empty-note">No announcements yet — check back soon.</div>'; return; }
  el.innerHTML=data.map(n=>`
    <div class="card news-card">
      ${n.image_url?`<img src="${escHtml(n.image_url)}" alt="">`:''}
      <div class="body">
        <div class="news-date"><i class="ti ti-calendar"></i> ${fmtDate(n.published_at)}</div>
        <h3>${escHtml(n.title)}</h3>
        <p>${escHtml(n.body).slice(0,160)}${n.body&&n.body.length>160?'…':''}</p>
      </div>
    </div>`).join('');
}

/* ── Gallery: renders into #site-gallery-grid ── */
async function loadSiteGallery(limit){
  const el=document.getElementById('site-gallery-grid');
  if(!el)return;
  const db=siteDb();
  if(!db){ el.innerHTML='<div class="empty-note">Gallery photos will appear here once the site is connected.</div>'; return; }
  let q=db.from('site_gallery').select('id,image_url,caption,category').order('sort_order',{ascending:true});
  if(limit)q=q.limit(limit);
  const {data,error}=await q;
  if(error||!data||!data.length){ el.innerHTML='<div class="empty-note">Photos from school life will be added here soon.</div>'; return; }
  el.innerHTML=data.map(g=>`
    <div class="gal-item">
      <img src="${escHtml(g.image_url)}" alt="${escHtml(g.caption||'')}" loading="lazy">
      ${g.caption?`<div class="gal-cap">${escHtml(g.caption)}</div>`:''}
    </div>`).join('');
}

/* ── Contact form: writes to site_messages table ── */
async function submitContactForm(ev){
  ev.preventDefault();
  const form=ev.target;
  const btn=form.querySelector('button[type="submit"]');
  const note=form.querySelector('.form-note');
  const payload={
    name:form.name.value.trim(),
    email:form.email.value.trim(),
    phone:form.phone.value.trim(),
    subject:form.subject.value.trim(),
    message:form.message.value.trim(),
  };
  if(!payload.name||!payload.message){ if(note){note.textContent='Please fill in your name and message.';note.style.color='var(--burg)'} return; }
  btn.disabled=true; btn.textContent='Sending…';
  const db=siteDb();
  let ok=false;
  if(db){ const {error}=await db.from('site_messages').insert(payload); ok=!error; }
  btn.disabled=false; btn.textContent='Send message';
  if(note){
    note.style.color=ok?'#16a34a':'var(--burg)';
    note.textContent=ok?'Thank you — your message has been received. We will get back to you shortly.':'Could not send your message right now — please call or email us directly.';
  }
  if(ok)form.reset();
}
