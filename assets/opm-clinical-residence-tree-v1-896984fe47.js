/* OPM Clinical Residence Tree V1 | presentation-only extension to clinical places V174.
   Uses the existing clinical controller's counts and data-site/data-res event contract.
   No network requests, writes, cache, permissions, dataset mutation or timers. */
(()=>{
  'use strict';
  if (window.__OPM_CLINICAL_RESIDENCE_TREE_V1__) return;
  const renderOriginal = window.__opmClinicalPlaces;
  if (typeof renderOriginal !== 'function') return;
  window.__OPM_CLINICAL_RESIDENCE_TREE_V1__ = true;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const digits = v => (Number(v)||0).toLocaleString('en-US');
  const normalize = v => String(v??'').normalize('NFKC').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[\u200b-\u200f\u2060\uFEFF]/g,'').trim().toLowerCase();
  const ui={search:'',sort:'count'};
  const CLASS='clrt-tree';
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let redrawFrame=0;
  let observed=null;
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(()=>scheduleDraw()) : null;
  function currentRoot(){return document.querySelector('#clinicalFollowup .'+CLASS);}
  function scheduleDraw(){if(redrawFrame)return;redrawFrame=requestAnimationFrame(()=>{redrawFrame=0; drawConnectors()});}
  function attachObserver(){
    const root=currentRoot();if(!root||!resizeObserver)return;
    if(observed!==root){resizeObserver.disconnect();resizeObserver.observe(root);observed=root;}
  }
  function tier(count){return count>=200?'top':count>=100?'high':count>=50?'mid':'low';}
  function asItem(el){
    const name=el.dataset.res||'';
    const count=Math.max(0,Number(el.dataset.centerCount)||0);
    const site=el.dataset.site||'';
    const ratio=el.querySelector('.opm174-center-share')?.textContent?.trim()||'0.0%';
    return {name,site,count,ratio,lookup:normalize(name),selected:el.getAttribute('aria-pressed')==='true'};
  }
  function branch(it,max){
    const ratio=max>0 ? Math.min(100,Math.max(2,100*it.count/max)) : 0;
    return `<button type="button" class="clrt-branch clrt-tier-${tier(it.count)}${it.selected?' active':''}" 
        data-site="${esc(it.site)}" data-res="${esc(it.name)}" data-center-count="${it.count}" data-center-lookup="${esc(it.lookup)}"
        aria-pressed="${it.selected}" aria-label="${esc(it.name||'غير محدد')}، ${digits(it.count)} حالة، ${esc(it.ratio)}" title="${esc(it.name||'غير محدد')}: ${digits(it.count)} حالة (${esc(it.ratio)})"
        style="--clrt-fill:${ratio.toFixed(2)}%">
        <span class="clrt-name" dir="auto">${esc(it.name||'غير محدد')}</span>
        <span class="clrt-meta" dir="ltr">${digits(it.count)} <small>حالة</small></span>
        <span class="clrt-meter" aria-hidden="true"><i></i></span>
        <strong class="clrt-rate" dir="ltr">${esc(it.ratio)}</strong>
      </button>`;
  }
  function sortItems(items){return items.sort((a,b)=>ui.sort==='name' ? a.name.localeCompare(b.name,'ar',{numeric:true}) : b.count-a.count||a.name.localeCompare(b.name,'ar',{numeric:true}));}
  function replaceCenters(original){
    const host=document.createElement('template');host.innerHTML=original;
    const sect=host.content.querySelector('.opm174-centers-section');
    const oldGrid=sect?.querySelector('.opm174-center-grid');
    if(!sect||!oldGrid)return original;
    const all=Array.from(oldGrid.querySelectorAll('.opm174-center')).map(asItem);
    const max=Math.max(1,...all.map(x=>x.count));
    const total=all.reduce((v,x)=>v+x.count,0);
    const title=sect.querySelector('.opm174-centers-title h4');
    if(title)title.textContent='خريطة فروع مراكز السكن';
    const field=sect.querySelector('#opm172CenterSearch');if(field){field.id='clrtCenterSearch';field.value=ui.search;field.setAttribute('placeholder','ابحث عن مركز سكن...')}
    const order=sect.querySelector('#opm172CenterOrder');if(order){order.id='clrtCenterSort';order.value=ui.sort;}
    const tree=document.createElement('div');tree.className=CLASS;
    tree.setAttribute('role','region');tree.setAttribute('aria-label','المخطط الشجري لمراكز السكن، اختر أي فرع لتصفية قائمة الحالات');
    tree.innerHTML=`<div class="clrt-stage" data-clrt-stage dir="rtl">
      <svg class="clrt-connectors" aria-hidden="true" focusable="false"></svg>
      <div class="clrt-side clrt-side-right" data-clrt-side="right"></div>
      <div class="clrt-hub-wrap"><div class="clrt-hub" aria-live="polite">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21V7l7-4 7 4v14M17 11h4v10M7 9h2m-2 4h2m-2 4h2m4-8h2m-2 4h2m-2 4h2M2 21h20"/></svg>
        <span>مراكز السكن</span><strong data-clrt-visible-count>${digits(all.length)}</strong>
        <small><b data-clrt-visible-total>${digits(total)}</b> حالة</small>
      </div></div>
      <div class="clrt-side clrt-side-left" data-clrt-side="left"></div>
    </div><p class="clrt-help">اختر مركزًا أو أكثر لعرض حالاتهم معًا في الجدول؛ اضغط مرة أخرى لإلغاء اختياره. النسبة من إجمالي الحالات؛ طول الشريط مقارنة بأعلى مركز.</p>`;
    oldGrid.replaceWith(tree);
    const data=document.createElement('script');data.type='application/json';data.className='clrt-data';
    // The JSON payload is encoded as non-executable text; prevent closing script tags.
    data.textContent=JSON.stringify({all,max}).replace(/</g,'\\u003c');
    tree.append(data);
    // Initial render uses the same data as the previous clinical view.
    populate(tree,all,max);
    const badge=sect.querySelector('[data-opm174-count]');if(badge)badge.textContent=digits(all.length)+' مركز';
    return host.innerHTML;
  }
  function getData(root){
    try{return JSON.parse(root?.querySelector('.clrt-data')?.textContent||'{}');}catch(_){return {all:[],max:1};}
  }
  function populate(root,items,max){
    const sorted=sortItems(items.slice());
    const q=normalize(ui.search);
    const filtered=sorted.filter(x=>!q||x.lookup.includes(q));
    const mid=Math.ceil(filtered.length/2);
    const right=root.querySelector('[data-clrt-side="right"]'), left=root.querySelector('[data-clrt-side="left"]');
    if(!right||!left)return;
    right.innerHTML=filtered.slice(0,mid).map(x=>branch(x,max)).join('');
    left.innerHTML=filtered.slice(mid).map(x=>branch(x,max)).join('');
    const stage=root.querySelector('[data-clrt-stage]');
    stage.dataset.layout=filtered.length===0?'empty':filtered.length===1?'single':filtered.length===2?'double':'multiple';
    const count=root.querySelector('[data-clrt-visible-count]');if(count)count.textContent=digits(filtered.length);
    const total=root.querySelector('[data-clrt-visible-total]');if(total)total.textContent=digits(filtered.reduce((v,x)=>v+x.count,0));
    let empty=root.querySelector('.clrt-no-match');
    if(!empty){empty=document.createElement('p');empty.className='clrt-no-match';empty.textContent='لا توجد مراكز مطابقة للبحث.';root.insertBefore(empty,root.querySelector('.clrt-help'));}
    empty.hidden=filtered.length!==0;
    const badge=root.closest('.opm174-centers-section')?.querySelector('[data-opm174-count]');
    if(badge)badge.textContent=digits(filtered.length)+(q?' من '+digits(items.length):'')+' مركز';
    scheduleDraw();
  }
  function drawConnectors(){
    const root=currentRoot();if(!root)return;
    attachObserver();
    const stage=root.querySelector('[data-clrt-stage]'),svg=root.querySelector('.clrt-connectors'),hub=root.querySelector('.clrt-hub');
    if(!stage||!svg||!hub)return;
    const bounds=stage.getBoundingClientRect(),hb=hub.getBoundingClientRect();
    const items=[...stage.querySelectorAll('.clrt-branch')];
    if(bounds.width<840||items.length===0||!hb.width){svg.replaceChildren();return;}
    const W=bounds.width,H=bounds.height;
    if(!(W>0&&H>0))return;
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('preserveAspectRatio','none');
    const cy=hb.top-bounds.top+hb.height/2, cx=hb.left-bounds.left+hb.width/2;
    const hr=hb.width/2;
    const tags=[];
    items.forEach((el,i)=>{
      const r=el.getBoundingClientRect();if(!r.width)return;
      const rcx=r.left-bounds.left+r.width/2, y=r.top-bounds.top+r.height/2;
      const direction=rcx>cx?1:-1;
      const x1=cx+direction*hr*.97;
      const x2=direction===1?r.left-bounds.left:r.right-bounds.left;
      if(Math.abs(x2-x1)<6)return;
      // Anchor the hub vertically toward the row instead of sending all paths to one point.
      const angle=Math.atan2(y-cy,Math.abs(x2-cx));
      const hubY=cy+Math.max(-hr*.65,Math.min(hr*.65,Math.sin(angle)*hr*.77));
      const spread=Math.abs(x2-x1);
      const bend=Math.min(62,spread*.5);
      const d=`M ${x1.toFixed(2)} ${hubY.toFixed(2)} C ${(x1+direction*bend).toFixed(2)} ${hubY.toFixed(2)}, ${(x2-direction*bend).toFixed(2)} ${y.toFixed(2)}, ${x2.toFixed(2)} ${y.toFixed(2)}`;
      const active=el.classList.contains('active');
      const stroke=el.classList.contains('clrt-tier-top')?'#4ecbaf':el.classList.contains('clrt-tier-high')?'#55a9d0':'#3cb4ab';
      tags.push(`<path class="clrt-link${active?' active':''}" data-clrt-res="${esc(el.dataset.res)}" d="${d}" stroke="${stroke}" />`);
      tags.push(`<circle class="clrt-endpoint${active?' active':''}" cx="${x2.toFixed(2)}" cy="${y.toFixed(2)}" r="2.5" fill="${stroke}"/>`);
    });
    svg.innerHTML=tags.join('');
  }
  window.__opmClinicalPlaces=function(records,state){
    const html=renderOriginal(records,state);
    return replaceCenters(html);
  };
  document.addEventListener('input',event=>{
    if(event.target?.id!=='clrtCenterSearch')return;
    ui.search=event.target.value||'';
    const root=event.target.closest('.opm174-places')?.querySelector('.'+CLASS);
    if(!root)return;
    const {all,max}=getData(root);populate(root,all||[],max||1);
  });
  document.addEventListener('change',event=>{
    if(event.target?.id!=='clrtCenterSort')return;
    ui.sort=event.target.value==='name'?'name':'count';
    const root=event.target.closest('.opm174-places')?.querySelector('.'+CLASS);
    if(!root)return;
    const {all,max}=getData(root);populate(root,all||[],max||1);
  });
  document.addEventListener('pointerover',event=>{
    const item=event.target?.closest?.('.clrt-branch');if(!item)return;
    const root=item.closest('.'+CLASS);
    root.querySelectorAll('.clrt-link').forEach(link=>link.classList.toggle('hover',link.getAttribute('data-clrt-res')===item.dataset.res));
  });
  document.addEventListener('pointerout',event=>{
    const item=event.target?.closest?.('.clrt-branch');if(!item)return;
    if(event.relatedTarget?.closest?.('.clrt-branch')===item)return;
    item.closest('.'+CLASS).querySelectorAll('.clrt-link.hover').forEach(el=>el.classList.remove('hover'));
  });
  document.addEventListener('focusin',event=>{
    const item=event.target?.closest?.('.clrt-branch');if(!item)return;
    item.closest('.'+CLASS).querySelectorAll('.clrt-link').forEach(link=>link.classList.toggle('hover',link.getAttribute('data-clrt-res')===item.dataset.res));
  });
  document.addEventListener('focusout',event=>{
    const item=event.target?.closest?.('.clrt-branch');if(!item)return;
    item.closest('.'+CLASS).querySelectorAll('.clrt-link.hover').forEach(el=>el.classList.remove('hover'));
  });
  const obs=new MutationObserver(()=>{if(currentRoot())scheduleDraw()});
  document.addEventListener('DOMContentLoaded',()=>{
    const panel=document.getElementById('clinicalFollowup');
    if(panel)obs.observe(panel,{childList:true});
    scheduleDraw();
  },{once:true});
  window.addEventListener('resize',scheduleDraw,{passive:true});
})();
