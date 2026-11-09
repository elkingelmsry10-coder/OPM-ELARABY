/* OPM v174 | Clinical places: view-only responsive presentation.
 * All counts originate in the existing clinical controller. It owns filters.
 * No fetch, storage, authorization, mutation of source data or timers.
 */
(() => {
  'use strict';
  if (window.__OPM_CLINICAL_PLACES_V174__) return;
  window.__OPM_CLINICAL_PLACES_V174__ = true;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const fmt = n => (Number(n)||0).toLocaleString('en-US');
  const pct = (n,d) => d>0 ? (100*n/d).toFixed(1) : '0.0';
  const norm = v => String(v??'').normalize('NFKC').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[\u200b-\u200f\u2060\uFEFF]/g,'').trim().toLowerCase();
  const colors=['#2ac6ae','#5ba6e8','#a48ce9','#e7a246','#e679a4','#6dbdb8','#798cdd','#e1b466','#7db5ba','#b88ee4','#ca9177','#8fd4a4'];
  const ui={search:'',sort:'count',hasPainted:false};
  const nameOf=v=>String(v??'').trim()||'غير محدد';
  const signature=(v)=>String(v??'');

  function ring(sites,total){
    const circumference=2*Math.PI*46;
    let sum=0;
    const arcs=sites.map((s,i)=>{
      const arcLength=total ? s.total/total*circumference:0;
      const mark=`<circle class="opm174-ring-arc ${s.selected?'active':''}" data-site="${esc(s.site)}" data-res="" role="button" tabindex="0" focusable="true" aria-pressed="${s.selected?'true':'false'}" aria-label="${esc(nameOf(s.site))}، ${fmt(s.total)} حالة، ${pct(s.total,total)} بالمائة" cx="60" cy="60" r="46" fill="none" stroke="${colors[i%colors.length]}" stroke-width="12" stroke-dasharray="${arcLength.toFixed(4)} ${(circumference-arcLength).toFixed(4)}" stroke-dashoffset="${(-sum).toFixed(4)}"><title>${esc(nameOf(s.site))}: ${fmt(s.total)} حالة (${pct(s.total,total)}%)</title></circle>`;
      sum+=arcLength;return mark;
    }).join('');
    const selected=sites.filter(s=>s.selected);
    return `<div class="opm174-donut-outer"><div class="opm174-donut" role="group" aria-label="الدائرة التفاعلية لمواقع العمل">
        <svg viewBox="0 0 120 120" aria-label="اختر قطاعًا لعرض الموقع مع إبقاء بقية القطاعات ظاهرة"><circle cx="60" cy="60" r="46" fill="none" stroke="var(--surface-3,#274552)" stroke-width="12"/><g transform="rotate(-90 60 60)">${arcs}</g></svg>
        <div class="opm174-donut-center" aria-live="polite"><b dir="ltr">${fmt(total)}</b><small>${selected.length===1 ? esc(nameOf(selected[0].site)) : 'حالة'}</small></div>
      </div><span class="opm174-donut-caption">${selected.length===1?'الموقع المختار':'إجمالي الحالات'}</span></div>`;
  }

  function siteBars(sites,total){
    const max=Math.max(1,...sites.map(s=>s.total));
    return `<div class="opm174-bars ${sites.some(s=>s.selected)?'has-selection':''}" role="group" aria-label="مواقع العمل كاملة، اضغط على العمود لتصفية الجدول">
      ${sites.map((s,i)=>{
        const perc=pct(s.total,total);
        const height=s.total>0 ? Math.max(2,Math.min(100,100*s.total/max)):0;
        const title=nameOf(s.site);
        return `<button type="button" class="opm174-bar ${s.selected?'active':''}" data-site="${esc(s.site)}" data-res="" aria-pressed="${s.selected?'true':'false'}" aria-label="${esc(title)}، ${fmt(s.total)} حالة، ${perc} بالمائة" title="${esc(title)}: ${fmt(s.total)} حالة (${perc}%)" style="--opm174-color:${colors[i%colors.length]};--opm174-height:${height}%;--opm174-index:${Math.min(i,19)}">
          <strong class="opm174-bar-count" dir="ltr">${fmt(s.total)}</strong>
          <span class="opm174-bar-plot" aria-hidden="true"><i class="opm174-bar-shape"></i></span>
          <span class="opm174-bar-rate" dir="ltr">${perc}%</span>
          <span class="opm174-bar-label" dir="auto">${esc(title)}</span>
        </button>`;
      }).join('') || '<p class="opm174-empty">لا توجد مواقع ضمن البيانات الحالية.</p>'}
    </div>`;
  }

  function levelData(centers){
    return [
      {label:'أقل من 50',labelShort:'أقل من 50',min:0,max:49,theme:'low'},
      {label:'50–99',labelShort:'50–99',min:50,max:99,theme:'mid'},
      {label:'100–199',labelShort:'100–199',min:100,max:199,theme:'high'},
      {label:'200 فأكثر',labelShort:'200 فأكثر',min:200,max:Infinity,theme:'top'}
    ].map(l=>({...l,count:centers.filter(([,count])=>count>=l.min&&count<=l.max).length}));
  }

  function grid(centers,total,active,site){
    const ordered=centers.slice().sort((a,b)=>ui.sort==='name' ? a[0].localeCompare(b[0],'ar',{numeric:true}) : b[1]-a[1]||a[0].localeCompare(b[0],'ar',{numeric:true}));
    const q=norm(ui.search);
    const found=ordered.filter(([n])=>!q||norm(n).includes(q)).length;
    return `<div class="opm174-center-grid" role="group" aria-label="مراكز السكن وعددها ${centers.length}">
      ${ordered.map(([name,count],index)=>{
        const percent=pct(count,total), hidden=!!q&&!norm(name).includes(q),selected=active.has(name);
        const tier=count>=200?'top':count>=100?'high':count>=50?'mid':'low';
        return `<button type="button" class="opm174-center opm174-tier-${tier} ${selected?'active':''}" ${hidden?'hidden':''} data-site="${esc(site||'')}" data-res="${esc(name)}" data-center-lookup="${esc(norm(name))}" data-center-count="${Number(count)||0}" aria-pressed="${selected?'true':'false'}" title="${esc(nameOf(name))}: ${fmt(count)} حالة · ${percent}%" aria-label="${esc(nameOf(name))}، ${fmt(count)} حالة، ${percent} بالمائة">
          <span class="opm174-center-name" dir="auto">${esc(nameOf(name))}</span><strong class="opm174-center-num" dir="ltr">${fmt(count)}</strong><span class="opm174-center-share" dir="ltr">${percent}%</span>
          <span class="opm174-center-track" aria-hidden="true"><i style="width:${total ? Math.max(2,Math.min(100,100*count/Math.max(1,ordered[0]?.[1]||1))) : 0}%"></i></span>
        </button>`;
      }).join('') || '<p class="opm174-empty">لا توجد مراكز سكن.</p>'}
    </div><p class="opm174-no-match" ${found?'hidden':''}>لا يوجد مركز مطابق للبحث.</p>`;
  }

  window.__opmClinicalPlaces=(records,state)=>{
    const sitesFilter=state.sites||new Set(state.site?[state.site]:[]);
    const resFilter=state.residences||new Set(state.residence?[state.residence]:[]);
    const sites=(Array.isArray(records)?records:[]).map(r=>({site:signature(r.site),total:Number(r.total)||0,resList:r.resList||[],selected:sitesFilter.has(signature(r.site))}));
    const total=sites.reduce((sum,s)=>sum+s.total,0);
    const residenceCounts=new Map();
    for (const s of sites){
      if(sitesFilter.size&&!sitesFilter.has(s.site))continue;
      for(const r of s.resList){residenceCounts.set(r.name,(residenceCounts.get(r.name)||0)+(Number(r.count)||0));}
    }
    const centers=[...residenceCounts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'ar'));
    const centerTotal=centers.reduce((sum,[,v])=>sum+v,0);
    const levels=levelData(centers).map(l=>{const names=centers.filter(([,count])=>count>=l.min&&count<=l.max).map(([name])=>name);return {...l,selected:names.length>0&&names.every(name=>resFilter.has(name))}});
    const countFound=ui.search ? centers.filter(([n])=>norm(n).includes(norm(ui.search))).length : centers.length;
    const filterNotice=sitesFilter.size ? ` · موقع محدد: ${[...sitesFilter].map(nameOf).join('، ')}`:'';
    const paintClass=ui.hasPainted?'opm174-repaint':'opm174-intro';
    ui.hasPainted=true;
    return `<section dir="rtl" class="cl141-places opm174-places ${paintClass}" aria-label="المواقع ومراكز السكن">
      <header class="opm174-header"><div class="opm174-header-copy"><h3>المواقع ومراكز السكن</h3><p>التوزيع حسب موقع العمل ومركز السكن · اختر أي عنصر لتصفية جدول الحالات${esc(filterNotice)}</p></div>
        <div class="opm174-header-tools"><span class="opm174-grand-total"><b dir="ltr">${fmt(total)}</b> حالة</span>${sitesFilter.size||resFilter.size?'<button type="button" id="cl44ClearSite" class="opm174-clear-site">إلغاء التحديد</button>':''}</div>
      </header>
      <div class="opm174-overview" role="group" aria-label="توزيع مواقع العمل وإجمالي الحالات">
        <section class="opm174-donut-area"><div class="opm174-section-label"><span class="opm174-signal" aria-hidden="true"></span><h4>إجمالي الحالات</h4></div>${ring(sites,total)}</section>
        <section class="opm174-sites-area"><div class="opm174-sites-head"><h4>مواقع العمل</h4><small>${fmt(sites.length)} موقع · اضغط على عمود أو قطاع من الدائرة</small></div>${siteBars(sites,total)}</section>
      </div>
      <section class="opm174-level-row" aria-label="مستويات مراكز السكن حسب عدد الحالات"><div class="opm174-level-title"><h4>مراكز السكن</h4><span>${fmt(centers.length)} مركز</span></div>
        <div class="opm174-level-list">${levels.map(l=>`<button type="button" data-res-tier="${l.theme}" class="opm174-level opm174-level-${l.theme} " aria-pressed="${l.selected}" ${l.count?"":"disabled"} title="تحديد جميع المراكز: ${esc(l.label)} حالة لكل مركز"><span>${esc(l.labelShort)}</span><b dir="ltr">${fmt(l.count)}</b><small>مركز</small></button>`).join('')}</div>
      </section>
      <section class="opm174-centers-section" aria-label="جميع مراكز السكن"><header class="opm174-centers-heading"><div class="opm174-centers-title"><h4>جميع مراكز السكن</h4><span data-opm174-count>${fmt(countFound)}${ui.search?' من '+fmt(centers.length):''} مركز</span></div>
        <div class="opm174-center-controls"><label class="opm174-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4.5 4.5"/></svg><input type="search" id="opm172CenterSearch" placeholder="ابحث عن مركز سكن" value="${esc(ui.search)}" aria-label="البحث في مراكز السكن" autocomplete="off"></label><label class="opm174-sort"><span>الترتيب</span><select id="opm172CenterOrder" aria-label="ترتيب مراكز السكن"><option value="count" ${ui.sort==='count'?'selected':''}>عدد الحالات</option><option value="name" ${ui.sort==='name'?'selected':''}>الاسم</option></select></label></div>
      </header>${grid(centers,centerTotal,resFilter,state.site)}
        <p class="opm174-footnote">جميع المراكز المعروضة · تُحسب النسب من إجمالي الحالات ضمن نطاق المراكز الحالي</p>
      </section>
    </section>`;
  };

  function search(root){
    if(!root)return;
    const q=norm(ui.search),buttons=root.querySelectorAll('.opm174-center[data-center-lookup]');let shown=0;
    buttons.forEach(el=>{let match=!q||el.dataset.centerLookup.includes(q);el.hidden=!match;if(match)shown++});
    const empty=root.querySelector('.opm174-no-match');if(empty)empty.hidden=shown!==0;
    const badge=root.querySelector('[data-opm174-count]');if(badge)badge.textContent=fmt(shown)+(q?' من '+fmt(buttons.length):'')+' مركز';
  }
  function sort(root){
    const board=root?.querySelector('.opm174-center-grid');if(!board)return;
    const cards=[...board.querySelectorAll('.opm174-center')];
    cards.sort((a,b)=>ui.sort==='name'?a.dataset.centerLookup.localeCompare(b.dataset.centerLookup,'ar',{numeric:true}) : Number(b.dataset.centerCount)-Number(a.dataset.centerCount)||a.dataset.centerLookup.localeCompare(b.dataset.centerLookup,'ar',{numeric:true}));
    board.append(...cards);search(root);
  }
  function focusBySite(root,site,flag){
    if(!root)return;
    root.querySelectorAll('.opm174-bar,.opm174-ring-arc').forEach(el=>{
      el.classList.toggle('opm174-hover',!!flag&&el.dataset.site===site);
    });
  }
  document.addEventListener('input',event=>{
    if(event.target?.id==='opm172CenterSearch'){ui.search=event.target.value||'';search(event.target.closest('.opm174-places'))}
  });
  document.addEventListener('change',event=>{
    if(event.target?.id==='opm172CenterOrder'){ui.sort=event.target.value==='name'?'name':'count';sort(event.target.closest('.opm174-places'))}
  });
  document.addEventListener('pointerover',event=>{
    const item=event.target.closest?.('.opm174-bar,.opm174-ring-arc');if(item)focusBySite(item.closest('.opm174-places'),item.dataset.site,true);
  });
  document.addEventListener('pointerout',event=>{
    const item=event.target.closest?.('.opm174-bar,.opm174-ring-arc');
    if(!item)return;
    const relative=event.relatedTarget?.closest?.('.opm174-bar,.opm174-ring-arc');
    if(relative?.dataset.site===item.dataset.site)return;
    focusBySite(item.closest('.opm174-places'),item.dataset.site,false);
  });
  document.addEventListener('focusin',event=>{
    const item=event.target.closest?.('.opm174-bar,.opm174-ring-arc');if(item)focusBySite(item.closest('.opm174-places'),item.dataset.site,true)
  });
  document.addEventListener('focusout',event=>{
    const item=event.target.closest?.('.opm174-bar,.opm174-ring-arc');if(item)focusBySite(item.closest('.opm174-places'),item.dataset.site,false)
  });
  document.addEventListener('keydown',event=>{
    const el=event.target.closest?.('.opm174-ring-arc');
    if(el&&event.key===' '){event.preventDefault();el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}))}
  });
  document.addEventListener('click',event=>{if(event.target.closest?.('.opm174-places [data-site]'))ui.search=''},true);
})();
