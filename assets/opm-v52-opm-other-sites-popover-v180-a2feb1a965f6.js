(()=>{
  'use strict';
  if (window.__OPM_OTHER_SITES_POPOVER_V180__) return;

  const REGION = 'باقي_المواقع';
  const KEY = 'otherRegionSiteFilter';
  const TRIGGER = '.regional-choice[data-region="باقي_المواقع"]';
  const arrow = '<span class="opm-town-caret" aria-hidden="true"><svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 7.5 5 5 5-5"/></svg></span>';
  const escapeHTML = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean = x => String(x ?? '').normalize('NFKC').replace(/[\u200e\u200f\uFEFF]/g, '').replace(/\s+/g, ' ').trim();

  let selected = 'all';
  try { selected = clean(localStorage.getItem(KEY)) || 'all'; } catch (_) {}
  window.__otherRegionSiteFilter = selected;

  // Keep the original region/role filtering intact. This filter only NARROWS
  // records after existing scope checks; it never expands access.
  const originalTownMatches = typeof window.__townMatches === 'function' ? window.__townMatches : (() => true);
  const originalRegionMatches = typeof window.__opmRegionMatches === 'function' ? window.__opmRegionMatches : null;
  let innerScope = null;
  function workplace(row) {
    let name = '';
    try { name = clean(window.__opmSite?.workplace?.(row)); } catch (_) {}
    if (!name) name = clean(row?.workplace || row?.workPlace || row?.workplaceName || row?.location || row?.site || row?.branch);
    if (!name) {
      try {
        const ref = window.__referencePersonByIds?.(row?.sap, row?.nid, row?.workplace);
        name = clean(window.__opmSite?.workplace?.(ref) || ref?.workplace);
      } catch (_) {}
    }
    return name;
  }
  function siteMatches(row) {
    return selected === 'all' || workplace(row) === selected;
  }
  function currentScope() { return window.__dashboardRegion || 'all'; }
  window.__townMatches = function(row) {
    if (!originalTownMatches(row)) return false;
    const scope = innerScope ?? currentScope();
    return scope !== REGION || siteMatches(row);
  };
  if (originalRegionMatches) {
    window.__opmRegionMatches = function(row, region) {
      const scope = ['all','قويسنا','بنها_قليوب',REGION].includes(region) ? region : currentScope();
      const oldScope = innerScope;
      innerScope = scope;
      try {
        return !!originalRegionMatches(row, region) && (scope !== REGION || siteMatches(row));
      } finally { innerScope = oldScope; }
    };
  }
  window.__otherRegionSiteMatches = siteMatches;

  function names() {
const body = document.body.dataset, master = window.__ALL_DATA_MASTER || [];
const oncology = body.checkupsOpen !== "1" && body.activeInitiative !== "chronic" ?
  window.__opmOncologyReference?.rows() || master : master;

    const source = [...(window.__REFERENCE_WORKFORCE__ || []), ...oncology];
    const unique = new Set();
    for (const row of source) {
      if (window.__regionOf?.(row) !== 'other') continue;
      const name = workplace(row);
      if (name) unique.add(name);
    }
    return [...unique].sort((a,b) => a.localeCompare(b,'ar',{numeric:true}));
  }

  const menu = document.createElement('div');
  menu.id = 'opm-other-sites-popover';
  menu.className = 'opm-town-popover opm-other-sites-popover';
  menu.dir = 'rtl';
  menu.setAttribute('role','group');
  menu.setAttribute('aria-label','اختيار موقع من باقي المواقع');
  menu.hidden = true;
  document.body.appendChild(menu);
  let anchor = null;
  const trigger = () => document.querySelector(TRIGGER);

  function sync() {
    document.querySelectorAll(TRIGGER).forEach(button => {
      const title = selected === 'all' ? 'باقي المواقع' : selected;
      if (button.dataset.otherDisplay !== title || !button.querySelector('.opm-town-caret svg')) {
        button.textContent = title;
        button.insertAdjacentHTML('beforeend', arrow);
        button.dataset.otherDisplay = title;
      }
      button.setAttribute('aria-keyshortcuts','Alt+ArrowDown');
      button.setAttribute('aria-haspopup','true');
      button.setAttribute('aria-controls',menu.id);
      button.setAttribute('aria-expanded',String(!menu.hidden && button === anchor));
    });
  }
  function renderMenu() {
    const sites = names();
    // Important: the shared town popover stylesheet hides button <span>s.
    // Site names are direct button text nodes, not hidden spans or counters.
    menu.innerHTML =
      '<button type="button" data-other-site="all" class="'+(selected==='all'?'selected':'')+'">جميعها</button>'+
      (sites.length ? sites.map(name => '<button type="button" data-other-site="'+escapeHTML(name)+'" class="'+(selected===name?'selected':'')+'">'+escapeHTML(name)+'</button>').join(''):
      '<div class="opm-town-empty">لا توجد مواقع متاحة حاليًا</div>');
  }
  function position() {
    if (menu.hidden || !anchor?.isConnected) return;
    const box = anchor.getBoundingClientRect();
    const width = Math.min(184, window.innerWidth - 20);
    const height = Math.min(menu.scrollHeight, 300, window.innerHeight - 24);
    const left = Math.max(10,Math.min(box.right-width,window.innerWidth-width-10));
    const below = box.bottom + 7;
    const above = box.top - height - 7;
    const top = below+height <= window.innerHeight-10 ? below : (above >= 10 ? above : Math.max(10,Math.min(below,window.innerHeight-height-10)));
    Object.assign(menu.style,{width:width+'px',left:left+'px',top:top+'px',maxHeight:Math.max(80,Math.min(300,window.innerHeight-24))+'px'});
  }
  function close() {
    menu.classList.remove('is-open'); menu.hidden = true;
    const prev = anchor; anchor = null;
    if (prev?.isConnected) prev.setAttribute('aria-expanded','false');
  }
  function open(button=trigger()) {
    if (!button?.isConnected || button.disabled || currentScope() !== REGION) return;
    anchor = button;
    renderMenu(); menu.hidden=false; sync(); position();
    requestAnimationFrame(()=>{if(!menu.hidden)menu.classList.add('is-open');});
  }
  function choose(value) {
    const next = clean(value) || 'all';
    // Never accept a forged/nonexistent workplace selection.
    if (next !== 'all' && !names().includes(next)) return;
    selected = next;
    window.__otherRegionSiteFilter = selected;
    try { localStorage.setItem(KEY,selected); } catch (_) {}
    if (currentScope() === REGION) {
      window.__dataRevision = (window.__dataRevision || 0)+1;
      try { window.applyDashboardRegion?.(); } catch(e) { console.warn('Other workplace scope',e); }
      try { window.renderDailyRegionalData?.(); window.renderDailyLab?.(); } catch(e) { console.warn('Other workplace views',e); }
      document.dispatchEvent(new CustomEvent('dashboardRegionChanged',{detail:{region:REGION,source:'other-site-filter'}}));
    }
    sync();
  }
  // Keep region selection on the label, but open the workplace menu ONLY on the arrow.
  function toggleFromArrow(button) {
    if (!menu.hidden && button === anchor) { close(); return; }
    close();
    requestAnimationFrame(()=>{
      // Respect the application's original region/role checks and DOM replacements.
      if(currentScope()===REGION) open(trigger());
    });
  }
  document.addEventListener('click',event=>{
    const button = event.target.closest?.(TRIGGER);
    if (!button) return;
    if (!event.target.closest?.('.opm-town-caret')) { close(); return; }
    toggleFromArrow(button);
  },true);
  // Alt+Down is an accessible arrow-only equivalent from the keyboard.
  document.addEventListener('keydown',event=>{
    const button=event.target.closest?.(TRIGGER);
    if(!button||!event.altKey||event.key!=='ArrowDown')return;
    event.preventDefault();
    if(currentScope()!==REGION)button.click();
    toggleFromArrow(button);
  });
  menu.addEventListener('click',event=>{
    const button = event.target.closest('[data-other-site]');
    if(!button) return;
    event.preventDefault(); event.stopPropagation();
    choose(button.dataset.otherSite);
    close();
    const btn=trigger(); if(btn?.isConnected) btn.focus({preventScroll:true});
  });
  document.addEventListener('pointerdown',event=>{
    if(!menu.hidden && !menu.contains(event.target) && !anchor?.contains(event.target)) close();
  },{passive:true});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && !menu.hidden){const btn=anchor;close();btn?.focus({preventScroll:true});}
  });
  document.addEventListener('dashboardRegionChanged',()=>{if(currentScope()!==REGION)close();sync();});
  document.addEventListener('referenceWorkforceUpdated',()=>{sync();if(!menu.hidden){renderMenu();position();}});
  for(const event of ['dataUpdated','oncologyReferenceUpdated']) document.addEventListener(event,()=>{if(!menu.hidden){renderMenu();position();}});
  window.addEventListener('resize',position,{passive:true});
  window.addEventListener('scroll',position,{passive:true,capture:true});
  window.setOtherRegionSiteFilter=choose;
  window.__OPM_OTHER_SITES_POPOVER_V180__={names,open,close,sync,menu,choose};
  sync();
})();
