(() => {
  const sidebar = document.getElementById('sidebar');
  const menuButton = document.getElementById('menuButton');
  const overlay = document.getElementById('overlay');
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const sections = [...document.querySelectorAll('section[id]')];
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const toast = document.getElementById('toast');
  const shareButton = document.getElementById('shareButton');
  const installButton = document.getElementById('installButton');
  const statusDot = document.getElementById('statusDot');
  const connectionText = document.getElementById('connectionText');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.querySelector('.lightbox-close');
  let deferredPrompt = null;

  function showToast(message){
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function openMenu(){
    sidebar.classList.add('open');
    overlay.hidden = false;
  }
  function closeMenu(){
    sidebar.classList.remove('open');
    overlay.hidden = true;
  }
  menuButton?.addEventListener('click', openMenu);
  overlay?.addEventListener('click', closeMenu);
  navLinks.forEach(a => a.addEventListener('click', () => {
    if (window.innerWidth <= 820) closeMenu();
  }));

  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin:'-25% 0px -62% 0px', threshold:[0,.15,.4] });
  sections.forEach(s => observer.observe(s));

  const searchable = [...document.querySelectorAll('.searchable')].map(el => ({
    el,
    title: el.dataset.title || el.querySelector('h2,h1')?.textContent || '',
    text: (el.innerText || '').replace(/\s+/g,' ').trim()
  }));
  function performSearch(){
    const q = searchInput.value.trim().toLocaleLowerCase('uk');
    if (!q){ searchResults.hidden = true; searchResults.innerHTML=''; return; }
    const tokens = q.split(/\s+/).filter(Boolean);
    const matches = searchable.filter(item => tokens.every(t => (`${item.title} ${item.text}`).toLocaleLowerCase('uk').includes(t))).slice(0,8);
    searchResults.innerHTML = '';
    if (!matches.length){
      const b=document.createElement('button'); b.disabled=true; b.textContent='Нічого не знайдено'; searchResults.appendChild(b);
    } else {
      matches.forEach(item => {
        const b=document.createElement('button');
        b.innerHTML = `<strong>${item.title}</strong><small>${item.text.slice(0,115)}${item.text.length>115?'…':''}</small>`;
        b.addEventListener('click',()=>{
          item.el.scrollIntoView({behavior:'smooth',block:'start'});
          searchResults.hidden=true;
          searchInput.blur();
          if(window.innerWidth<=820) closeMenu();
        });
        searchResults.appendChild(b);
      });
    }
    searchResults.hidden = false;
  }
  searchInput.addEventListener('input', performSearch);
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== searchInput){ e.preventDefault(); searchInput.focus(); }
    if (e.key === 'Escape'){ searchResults.hidden=true; closeMenu(); if(lightbox.open) lightbox.close(); }
  });
  document.addEventListener('click', e => {
    if(!searchResults.contains(e.target) && e.target !== searchInput) searchResults.hidden = true;
  });

  function updateOnline(){
    const online = navigator.onLine;
    statusDot.className = `status-dot ${online ? 'online':'offline'}`;
    connectionText.textContent = online ? 'Онлайн' : 'Офлайн — інструкція доступна з кешу';
  }
  window.addEventListener('online', updateOnline); window.addEventListener('offline', updateOnline); updateOnline();

  shareButton?.addEventListener('click', async () => {
    const data = { title: document.title, text:'Інструкція оператора HMI насосної групи 3 × 5,5 кВт', url: location.href };
    try{
      if(navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(location.href); showToast('Посилання скопійовано'); }
    }catch(e){ if(e.name!=='AbortError') showToast('Не вдалося поділитися'); }
  });

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt=e; installButton.hidden=false; });
  installButton?.addEventListener('click', async()=>{
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt=null; installButton.hidden=true;
  });

  document.querySelectorAll('[data-lightbox]').forEach(img => img.addEventListener('click',()=>{
    lightboxImg.src=img.src; lightboxImg.alt=img.alt; lightbox.showModal();
  }));
  lightboxClose?.addEventListener('click',()=>lightbox.close());
  lightbox?.addEventListener('click',e=>{ if(e.target===lightbox) lightbox.close(); });

  if('serviceWorker' in navigator){
    window.addEventListener('load',()=> navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }
})();
