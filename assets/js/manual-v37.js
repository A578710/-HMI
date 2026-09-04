(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const sidebar = $('#sidebar');
  const menuButton = $('#menuButton');
  const drawerOverlay = $('#drawerOverlay');
  const tocNav = $('#tocNav');
  const searchInput = $('#searchInput');
  const searchResults = $('#searchResults');
  const headerSearchButton = $('#headerSearchButton');
  const printButton = $('#printButton');
  const currentSectionLabel = $('#currentSectionLabel');
  const scrollTopButton = $('#scrollTop');
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxClose = $('.lightbox-close');
  const toast = $('#toast');
  const STORAGE_KEY = 'hmi-manual-toc-open-v3';
  const MOBILE_BP = 900;
  let lastActiveId = '';

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function normalizeText(value = '') {
    return value
      .toLocaleLowerCase('uk')
      .replace(/режим\s+сну/g, ' sleep ')
      .replace(/спляч\w*\s+режим\w*/g, ' sleep ')
      .replace(/\bsleep\b/g, ' sleep ')
      .replace(/перетворювач\w*\s+частот\w*/g, ' пч ')
      .replace(/частотник\w*/g, ' пч ')
      .replace(/[’'`]/g, '')
      .replace(/[^a-zа-яіїєґ0-9]+/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function openDrawer() {
    sidebar?.classList.add('open');
    if (drawerOverlay) drawerOverlay.hidden = false;
    menuButton?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');
  }

  function closeDrawer() {
    sidebar?.classList.remove('open');
    if (drawerOverlay) drawerOverlay.hidden = true;
    menuButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
  }

  menuButton?.addEventListener('click', () => {
    if (sidebar?.classList.contains('open')) closeDrawer(); else openDrawer();
  });
  drawerOverlay?.addEventListener('click', closeDrawer);

  function getOpenState() {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
    catch { return new Set(); }
  }
  function saveOpenState() {
    const open = $$('.toc-node.has-children.expanded', tocNav).map(node => node.dataset.id);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(open)); } catch {}
  }

  function tocHeadings() {
    return $$('[data-toc="true"][data-toc-level][id]');
  }

  function buildTreeData() {
    const items = tocHeadings().map(h => ({
      id: h.id,
      title: h.textContent.trim(),
      level: Number(h.dataset.tocLevel || 1),
      heading: h,
      children: []
    }));
    const roots = [];
    const stack = [];
    items.forEach(item => {
      while (stack.length && stack[stack.length - 1].level >= item.level) stack.pop();
      if (stack.length) stack[stack.length - 1].children.push(item); else roots.push(item);
      stack.push(item);
    });
    return { roots, items };
  }

  const treeData = buildTreeData();
  const persisted = getOpenState();

  function makeNode(item) {
    const li = document.createElement('li');
    li.className = `toc-node level-${item.level}`;
    li.dataset.id = item.id;
    const row = document.createElement('div');
    row.className = 'toc-row';

    if (item.children.length) {
      li.classList.add('has-children');
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'toc-toggle';
      toggle.setAttribute('aria-label', `Розгорнути ${item.title}`);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span aria-hidden="true">›</span>';
      row.appendChild(toggle);
      toggle.addEventListener('click', () => {
        const expanded = li.classList.toggle('expanded');
        toggle.setAttribute('aria-expanded', String(expanded));
        saveOpenState();
      });
    } else {
      const spacer = document.createElement('span');
      spacer.className = 'toc-toggle-spacer';
      row.appendChild(spacer);
    }

    const a = document.createElement('a');
    a.className = 'toc-link';
    a.href = `#${item.id}`;
    a.textContent = item.title;
    a.dataset.headingId = item.id;
    row.appendChild(a);
    li.appendChild(row);

    if (item.children.length) {
      const ul = document.createElement('ul');
      ul.className = 'toc-children';
      item.children.forEach(child => ul.appendChild(makeNode(child)));
      li.appendChild(ul);
      if (persisted.has(item.id)) {
        li.classList.add('expanded');
        $('.toc-toggle', li)?.setAttribute('aria-expanded', 'true');
      }
    }
    return li;
  }

  if (tocNav) {
    tocNav.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'toc-tree';
    treeData.roots.forEach(item => ul.appendChild(makeNode(item)));
    tocNav.appendChild(ul);
  }

  function expandAncestors(node) {
    let parent = node?.parentElement;
    while (parent && parent !== tocNav) {
      if (parent.classList?.contains('toc-node') && parent.classList.contains('has-children')) {
        parent.classList.add('expanded');
        $('.toc-toggle', parent)?.setAttribute('aria-expanded', 'true');
      }
      parent = parent.parentElement;
    }
  }

  function setActiveHeading(id) {
    if (!id || id === lastActiveId) return;
    lastActiveId = id;
    $$('.toc-link.active', tocNav).forEach(a => { a.classList.remove('active'); a.removeAttribute('aria-current'); });
    $$('.toc-node.active-branch', tocNav).forEach(n => n.classList.remove('active-branch'));
    const link = $(`.toc-link[data-heading-id="${CSS.escape(id)}"]`, tocNav);
    if (link) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'location');
      const node = link.closest('.toc-node');
      expandAncestors(node);
      let p = node;
      while (p && p !== tocNav) {
        if (p.classList?.contains('toc-node')) p.classList.add('active-branch');
        p = p.parentElement;
      }
      const navRect = tocNav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      if (linkRect.top < navRect.top + 34 || linkRect.bottom > navRect.bottom - 34) {
        link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
    const heading = document.getElementById(id);
    if (heading && currentSectionLabel) currentSectionLabel.textContent = heading.textContent.trim();
  }

  tocNav?.addEventListener('click', event => {
    const link = event.target.closest('.toc-link');
    if (!link) return;
    setActiveHeading(link.dataset.headingId);
    if (window.innerWidth <= MOBILE_BP) closeDrawer();
  });

  // Scroll spy: heading closest to the top below sticky header wins.
  const observedHeadings = tocHeadings();
  const observer = new IntersectionObserver(entries => {
    const candidates = entries.filter(e => e.isIntersecting);
    if (!candidates.length) return;
    candidates.sort((a, b) => Math.abs(a.boundingClientRect.top - 76) - Math.abs(b.boundingClientRect.top - 76));
    setActiveHeading(candidates[0].target.id);
  }, { rootMargin: '-66px 0px -70% 0px', threshold: [0, 1] });
  observedHeadings.forEach(h => observer.observe(h));

  // Deep link activation on load/hash change.
  function activateHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (target) {
      setActiveHeading(id);
      const node = $(`.toc-link[data-heading-id="${CSS.escape(id)}"]`, tocNav)?.closest('.toc-node');
      expandAncestors(node);
    }
  }
  window.addEventListener('hashchange', activateHash);
  activateHash();

  // Add copy-link buttons to H2/H3.
  $$('h2[id],h3[id]').forEach(h => {
    if (h.querySelector('.copy-anchor')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'copy-anchor';
    b.setAttribute('aria-label', `Скопіювати посилання на ${h.textContent.trim()}`);
    b.textContent = '#';
    b.addEventListener('click', async event => {
      event.preventDefault();
      event.stopPropagation();
      const url = `${location.origin}${location.pathname}#${h.id}`;
      try { await navigator.clipboard.writeText(url); showToast('Посилання скопійовано'); }
      catch { location.hash = h.id; }
    });
    h.appendChild(b);
  });

  // Local TOC for large chapters.
  $$('section[id]').forEach(section => {
    const chapter = section.querySelector(':scope > .section-head h1[data-toc="true"]');
    if (!chapter) return;
    const local = $$('h2[data-toc="true"],h3[data-toc="true"]', section);
    if (local.length < 2) return;
    const box = document.createElement('nav');
    box.className = 'local-toc';
    box.setAttribute('aria-label', `У цьому розділі: ${chapter.textContent.trim()}`);
    box.innerHTML = '<strong>У цьому розділі</strong>';
    const list = document.createElement('ul');
    local.forEach(h => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.textContent = h.childNodes[0]?.textContent?.trim() || h.textContent.trim();
      li.appendChild(a); list.appendChild(li);
    });
    box.appendChild(list);
    section.querySelector(':scope > .section-head')?.insertAdjacentElement('afterend', box);
  });

  // Previous / next between numbered top-level chapters.
  const chapters = $$('section[id]').map(section => ({
    section,
    heading: section.querySelector(':scope > .section-head h1[data-toc="true"]')
  })).filter(x => x.heading && /^\d+\./.test(x.heading.textContent.trim()));
  chapters.forEach((item, index) => {
    const nav = document.createElement('nav');
    nav.className = 'chapter-nav';
    nav.setAttribute('aria-label', 'Перехід між розділами');
    const prev = chapters[index - 1];
    const next = chapters[index + 1];
    nav.innerHTML = `
      ${prev ? `<a class="chapter-prev" href="#${prev.heading.id}"><span>← Попередній розділ</span><strong>${prev.heading.textContent.trim()}</strong></a>` : '<span></span>'}
      ${next ? `<a class="chapter-next" href="#${next.heading.id}"><span>Наступний розділ →</span><strong>${next.heading.textContent.trim()}</strong></a>` : '<span></span>'}
    `;
    item.section.appendChild(nav);
  });

  // Search index from headings/sections + interactive HMI registry.
  const searchIndex = [];
  tocHeadings().forEach(h => {
    const section = h.closest('section');
    const title = h.textContent.replace('#', '').trim();
    const text = section ? section.innerText.replace(/\s+/g, ' ').trim() : title;
    searchIndex.push({ type: 'doc', id: h.id, title, text, normalized: normalizeText(`${title} ${text}`) });
  });

  if (window.HMIExplorerData) {
    Object.entries(window.HMIExplorerData).forEach(([screenKey, screen]) => {
      (screen.objects || []).forEach(obj => {
        const text = [screen.title, obj.title, obj.summary, obj.purpose, obj.operator, obj.impact, obj.access].filter(Boolean).join(' ');
        searchIndex.push({
          type: 'hmi', id: 'interactive-hmi', title: `HMI — ${obj.title}`, text,
          normalized: normalizeText(text), screenKey, objectId: obj.id
        });
      });
    });
  }

  function snippet(text, rawQuery) {
    const clean = text.replace(/\s+/g, ' ').trim();
    const terms = normalizeText(rawQuery).split(' ').filter(Boolean);
    const low = normalizeText(clean);
    let index = -1;
    for (const term of terms) { index = low.indexOf(term); if (index >= 0) break; }
    if (index < 0 || clean.length <= 180) return clean.slice(0, 180) + (clean.length > 180 ? '…' : '');
    const start = Math.max(0, index - 70);
    return `${start ? '…' : ''}${clean.slice(start, start + 190)}${start + 190 < clean.length ? '…' : ''}`;
  }

  function renderSearch() {
    if (!searchInput || !searchResults) return;
    const raw = searchInput.value.trim();
    const q = normalizeText(raw);
    searchResults.innerHTML = '';
    if (!q) { searchResults.hidden = true; return; }
    const terms = q.split(' ').filter(Boolean);
    const matches = searchIndex
      .filter(item => terms.every(term => item.normalized.includes(term)))
      .sort((a, b) => Number(b.title.toLocaleLowerCase('uk').includes(raw.toLocaleLowerCase('uk'))) - Number(a.title.toLocaleLowerCase('uk').includes(raw.toLocaleLowerCase('uk'))))
      .slice(0, 12);
    if (!matches.length) {
      const empty = document.createElement('div'); empty.className = 'search-empty'; empty.textContent = 'Нічого не знайдено'; searchResults.appendChild(empty);
    } else {
      matches.forEach(item => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'search-result';
        b.innerHTML = `<strong>${item.title}</strong><small>${snippet(item.text, raw)}</small>`;
        b.addEventListener('click', () => {
          searchResults.hidden = true;
          if (item.type === 'hmi') {
            location.hash = 'interactive-hmi';
            setTimeout(() => {
              window.HMIExplorerAPI?.setScreen(item.screenKey);
              window.HMIExplorerAPI?.selectObject(item.objectId);
            }, 80);
          } else {
            location.hash = item.id;
            const target = document.getElementById(item.id);
            target?.classList.add('search-hit');
            setTimeout(() => target?.classList.remove('search-hit'), 1800);
          }
          if (window.innerWidth <= MOBILE_BP) closeDrawer();
          searchInput.blur();
        });
        searchResults.appendChild(b);
      });
    }
    searchResults.hidden = false;
  }
  searchInput?.addEventListener('input', renderSearch);
  searchInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') $('.search-result', searchResults)?.click();
  });
  document.addEventListener('click', event => {
    if (searchResults && searchInput && !searchResults.contains(event.target) && event.target !== searchInput) searchResults.hidden = true;
  });

  headerSearchButton?.addEventListener('click', () => {
    if (window.innerWidth <= MOBILE_BP) openDrawer();
    setTimeout(() => searchInput?.focus(), 40);
  });

  // Keyboard shortcuts / Escape.
  document.addEventListener('keydown', event => {
    if (event.key === '/' && document.activeElement !== searchInput && !/input|textarea/i.test(document.activeElement?.tagName || '')) {
      event.preventDefault();
      if (window.innerWidth <= MOBILE_BP) openDrawer();
      setTimeout(() => searchInput?.focus(), 20);
    }
    if (event.key === 'Escape') {
      if (lightbox?.open) lightbox.close();
      closeDrawer();
      if (searchResults) searchResults.hidden = true;
    }
  });

  // Lightbox.
  function openLightbox(img) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || '';
    lightbox.showModal();
  }
  $$('[data-lightbox]').forEach(img => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `${img.alt || 'Зображення'} — відкрити збільшено`);
    img.addEventListener('click', () => openLightbox(img));
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(img); } });
  });
  lightboxClose?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });

  // Print mode: open all details temporarily.
  let detailState = [];
  function beforePrint() {
    detailState = $$('details').map(d => d.open);
    $$('details').forEach(d => d.open = true);
  }
  function afterPrint() { $$('details').forEach((d, i) => d.open = Boolean(detailState[i])); }
  window.addEventListener('beforeprint', beforePrint);
  window.addEventListener('afterprint', afterPrint);
  printButton?.addEventListener('click', () => window.print());

  // Scroll-to-top.
  function updateScrollTop() { scrollTopButton?.classList.toggle('visible', window.scrollY > 700); }
  window.addEventListener('scroll', updateScrollTop, { passive: true });
  updateScrollTop();
  scrollTopButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Mobile resize hygiene.
  window.addEventListener('resize', () => { if (window.innerWidth > MOBILE_BP) closeDrawer(); });

  // PWA remains static-host compatible.
  // v3.1: the manual deliberately does not use a persistent service worker.
  // Older releases used cache-first PWA caches, which could mix stale HTML/CSS/JS after GitHub Pages updates.
  window.addEventListener('load', async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg => reg.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => /hmi|manual/i.test(k)).map(k => caches.delete(k)));
      }
    } catch (_) {}
  }, { once:true });

})();
