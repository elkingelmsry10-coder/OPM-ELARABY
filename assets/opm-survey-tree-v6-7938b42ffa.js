/* OPM Survey Tree V6 — presentation-only extension of the original survey page.
   Deliberately leaves DATA, data readers, Gateway, authentication, cache, writes,
   permissions, and the original names/export/detail actions untouched. */
(() => {
  'use strict';
  if (window.__OPM_SURVEY_TREE_V2__) return;
  const ID = 'opmSurveyTreeV2';
  const $ = id => document.getElementById(id);
  const safe = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = n => Number(n || 0).toLocaleString('en-US');
  const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const modes = {all:'جميع الحالات',surveyDone:'المنفذ',surveyPending:'المتبقي',surveyOpen:'الخدمة مفتوحة',deferred:'مؤجل فقط',deferredLabs:'مؤجل وله تحاليل'};
  const state = {sites:new Set(),term:'',sort:'coverage',mode:'all',peopleMode:null,peoplePage:1,peopleSearch:'',peopleVisible:false,scheduled:false,ready:false,model:null,firstPaint:true};
  let resizeObs=null, lineFrame=0;

  function rows() {
    try { return typeof DATA !== 'undefined' && Array.isArray(DATA) ? DATA : []; }
    catch (_) { return []; }
  }
  function doneStatus(row) {return typeof done === 'function' ? !!done(row) : String(row.status || '').includes('تم عمل استبيان');}
  function deferredStatus(row) {return typeof isDeferred === 'function' ? !!isDeferred(row) : String(row.status || '').includes('مؤجل');}
  function labsStatus(row) {return typeof isDeferredLabs === 'function' ? !!isDeferredLabs(row) : String(row.status || '').includes('مؤجل وله تحاليل');}
  function siteName(row) {return String(row?.workplace || '').trim() || 'غير محدد';}
  function dateISO(row) {
    let d=row?.date;
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0,10);
    if (d && typeof window.__opmDate?.parse === 'function') {const v=window.__opmDate.parse(d);return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:'';}
    return '';
  }
  function egyptToday() {
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  function chosenDate() {
    const d=$('surveyProdDate')?.value || '';
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : egyptToday();
  }
  function empFiltered(all) {
    const sel=$('surveyProdEmpStatus');
    const value=sel && !sel.disabled ? sel.value : '';
    return value ? all.filter(r=>String(r.empStatus || '')===value) : all;
  }
  function tally(data) {
    let done=0,open=0,deferred=0,labs=0;
    for(const row of data) {
      if(doneStatus(row)) done++;
      else if(labsStatus(row)) labs++;
      else if(deferredStatus(row)) deferred++;
      else open++;
    }
    const total=data.length;
    return {total,done,pending:total-done,open,deferred,labs,ratio:total?100*done/total:0};
  }
  function makeModel() {
    const all=empFiltered(rows());
    const sitesMap=new Map();
    for(const r of all) {
      const name=siteName(r);
      if(!sitesMap.has(name))sitesMap.set(name,{name,total:0,done:0});
      const v=sitesMap.get(name);v.total++;if(doneStatus(r))v.done++;
    }
    let sites=Array.from(sitesMap.values()).map(s=>({...s,pending:s.total-s.done,ratio:s.total?100*s.done/s.total:0}));
    sites.sort((a,b)=>state.sort==='name'?a.name.localeCompare(b.name,'ar'):
      state.sort==='pending'?b.pending-a.pending||a.name.localeCompare(b.name,'ar'):
      b.ratio-a.ratio||b.total-a.total||a.name.localeCompare(b.name,'ar'));
    for(const name of [...state.sites])if(!sitesMap.has(name))state.sites.delete(name);
    const scoped=state.sites.size?all.filter(r=>state.sites.has(siteName(r))):all;
    const sum=tally(scoped);
    const date=chosenDate(), year=date.slice(0,4), idx=Number(date.slice(5,7))-1;
    const months=Array.from({length:12},(_,i)=>({index:i,name:monthNames[i],count:0}));
    let undated=0,daily=0;
    for(const r of scoped) {
      if(!doneStatus(r)) continue;
      const v=dateISO(r);
      if(!v) {undated++;continue;}
      if(v===date)daily++;
      if(v.startsWith(year+'-')){
        const i=Number(v.slice(5,7))-1;
        if(i>=0&&i<12)months[i].count++;
      }
    }
    const current=months[idx]?.count || 0;
    return {all,scoped,sites,sum,date,year,idx,months,daily,current,undated,baseTotal:all.length,
      chosenSites:sites.filter(s=>state.sites.has(s.name))};
  }
  function tone(ratio){return ratio>=90?'good':ratio>=70?'mid':'needs';}
  function monthMarkup(m){
    const max=Math.max(1,...m.months.map(x=>x.count));
    const currentYear=egyptToday().slice(0,4);
    const futureCurrent=egyptToday().slice(0,7);
    return m.months.map(x=>{
      const height=x.count>0?Math.max(3,Math.round(x.count/max*100)):0;
      const active=x.index===m.idx;
      const iso=`${m.year}-${String(x.index+1).padStart(2,'0')}`;
      const future=(m.year===currentYear&&iso>futureCurrent)||m.year>currentYear;
      return `<button type="button" class="svt-month ${active?'active':''} ${future?'future':''}" data-month="${x.index}"
        title="${safe(x.name)} ${safe(m.year)}: ${number(x.count)} استبيان" aria-pressed="${active}"
        aria-label="${safe(x.name)} ${safe(m.year)}، ${number(x.count)} استبيان؛ اضغط لتحديد الشهر">
        <span class="svt-month-number">${x.count?number(x.count):'—'}</span>
        <span class="svt-month-column-track"><span class="svt-month-column" style="height:${height}%"></span></span>
        <span class="svt-month-label">${safe(x.name)}</span></button>`;
    }).join('');
  }
  function sitePill(s,i) {
    const active=state.sites.has(s.name), pct=s.ratio.toFixed(1), names=safe(s.name);
    return `<button type="button" data-site="${names}" class="svt-branch ${tone(s.ratio)} ${active?'selected':''}" aria-pressed="${active}" title="${names}: ${pct}% · ${number(s.done)} من ${number(s.total)} · اضغط للإضافة أو الإزالة">
      <span class="svt-branch-name">${names}</span>
      <span class="svt-branch-count" dir="ltr">${number(s.done)} / ${number(s.total)}</span>
      <span class="svt-branch-meter" aria-hidden="true"><i style="width:${Math.min(100,s.ratio)}%"></i></span>
      <strong dir="ltr">${pct}%</strong></button>`;
  }
  // True radial connectors: every branch uses a curved, measured path to its hub.
  // Only SVG strokes occupy the gutter; site rows remain legible at every width.
  function drawConnections() {
    const host=$('svtTree'),svg=$('svtConnectors'),hub=$('svtHub');
    if(!host||!svg||!hub)return;
    const stage=host.getBoundingClientRect(),h=hub.getBoundingClientRect();
    if(stage.width<540||!h.width||!host.isConnected){svg.replaceChildren();return;}
    const W=stage.width,H=stage.height,cx=h.left-stage.left+h.width/2,cy=h.top-stage.top+h.height/2;
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
    const nodes=[...host.querySelectorAll('.svt-side .svt-branch')];
    let path='';
    const f=n=>Number(n.toFixed(2));
    nodes.forEach((btn,i)=>{
      const b=btn.getBoundingClientRect(),mid=b.left-stage.left+b.width/2;
      const sign=mid<cx?-1:1;
      const edge=sign<0?b.right-stage.left:b.left-stage.left;
      const y=b.top-stage.top+b.height/2;
      const R=h.width/2-3;
      const dy=Math.max(-R*.79,Math.min(R*.79,(y-cy)*.38));
      const sy=cy+dy,sx=cx+sign*Math.sqrt(Math.max(0,R*R-dy*dy));
      const delta=Math.max(10,Math.abs(edge-sx));
      const c1x=sx+sign*delta*.42,c2x=edge-sign*delta*.38;
      const d=`M ${f(sx)} ${f(sy)} C ${f(c1x)} ${f(sy)} ${f(c2x)} ${f(y)} ${f(edge)} ${f(y)}`;
      const active=state.sites.has(btn.dataset.site),needs=btn.classList.contains('needs');
      const cls=`svt-wire svt-wire-curved${active?' selected':''}${needs?' needs':''}`;
      path+=`<path class="${cls}" data-line-site="${safe(btn.dataset.site)}" d="${d}"/>`;
      if(active)path+=`<path class="svt-wire-energy" data-line-site="${safe(btn.dataset.site)}" d="${d}"/>`;
      path+=`<circle class="svt-wire-node${active?' selected':''}" cx="${f(edge)}" cy="${f(y)}" r="2.5"/>`;
    });
    svg.innerHTML=path;
  }
  function layoutConnectors(){if(lineFrame)cancelAnimationFrame(lineFrame);lineFrame=requestAnimationFrame(()=>{lineFrame=0;drawConnections();});}
  function active() {
    const body = document.body?.dataset;
    return body?.activeTab === "survey" && body.activeInitiative !== "chronic" &&
      body.checkupsOpen !== "1" && !document.hidden && !document.documentElement.classList.contains("el-auth-locked");
  }
  let modelReceipt = null;
  function render(){
    state.scheduled=false;
    if(!$(ID)||!active())return;
    const data=rows();
    const receipt=[data,data.length,data[0],data[data.length-1],window.__opmScopedRevision||0,
      window.__dataRevision||0,window.__opmReferenceRevision||0,chosenDate(),$("surveyProdEmpStatus")?.value||"",
      !!$("surveyProdEmpStatus")?.disabled,state.sort,[...state.sites].sort().join("|")];
    if(!state.model||!modelReceipt||!receipt.every((value,index)=>value===modelReceipt[index])){
      state.model=makeModel();
      modelReceipt=receipt;
    }
    const m=state.model;
    const pct=m.sum.total?m.sum.ratio.toFixed(1)+'%':'—';
    const loading=rows().length===0;
    $('svtScope').textContent=state.sites.size?`${number(state.sites.size)} موقع محدد`:'جميع مواقع العمل';
    // The current-scope and source controls are the only visible toolbar metadata.
    $('svtCoverPct').textContent=pct;
    $('svtDone').textContent=m.sum.total?number(m.sum.done):'—';
    $('svtTarget').textContent=m.sum.total?number(m.sum.total):'—';
    $('svtPending').textContent=m.sum.total?number(m.sum.pending):'—';
    $('svtCoverFill').style.width=Math.max(0,Math.min(100,m.sum.ratio))+'%';
    $('svtMonthCount').textContent=number(m.current);
    $('svtDayCount').textContent=number(m.daily);
    $('svtMonthDate').textContent=monthNames[m.idx]+' '+m.year;
    $('svtDayDate').textContent=Number(m.date.slice(8))+' '+monthNames[m.idx];
    $('svtYear').textContent='يناير – ديسمبر '+m.year;
    const maxMonth=Math.max(0,...m.months.map(x=>x.count));
    $('svtMaxValue').textContent=number(maxMonth);
    $('svtHalfValue').textContent=number(Math.round(maxMonth/2));
    $('svtMonthBars').innerHTML=monthMarkup(m);
    $('svtActiveMonthLabel').textContent=monthNames[m.idx]+' '+m.year;
    $('svtActiveMonthCount').textContent=number(m.current);
    $('svtChartMessage').textContent=m.undated?
      'الأعمدة تحسب الاستبيانات المؤرخة فقط؛ توجد استبيانات بلا تاريخ صالح. اضغط على شهر لعرض تفاصيله.':
      'اضغط على الشهر لتحديده، ثم اختر عرض الأسماء إن أردت.';
    const filtered=m.sites.filter(s=>s.name.toLocaleLowerCase('ar').includes(state.term.toLocaleLowerCase('ar')));
    $('svtSitesCount').textContent=filtered.length===m.sites.length?number(m.sites.length):`${number(filtered.length)} / ${number(m.sites.length)}`;
    $('svtHubCount').textContent=number(filtered.length);
    const visibleTotal=filtered.reduce((n,s)=>n+s.total,0);
    const visibleDone=filtered.reduce((n,s)=>n+s.done,0);
    $('svtHubPct').textContent=visibleTotal?(visibleDone/visibleTotal*100).toFixed(1)+'%':'—';
    const half=Math.ceil(filtered.length/2);
    const tree=$('svtTree');tree.classList.toggle('svt-tree--single',filtered.length===1);
    tree.classList.toggle('svt-tree--few',filtered.length>=2&&filtered.length<=4);
    tree.classList.toggle('svt-tree--empty',filtered.length===0);
    tree.dataset.visibleSites=String(filtered.length);
    $('svtLeft').innerHTML=filtered.slice(0,half).map(sitePill).join('');
    $('svtRight').innerHTML=filtered.slice(half).map(sitePill).join('');
    $('svtTreeEmpty').hidden=filtered.length!==0;
    $('svtClearSite').hidden=!state.sites.size;
    $('svtSelectCount').textContent=state.sites.size?`${number(state.sites.size)} من ${number(m.sites.length)} موقع محدد`:'اضغط لتحديد موقع أو عدة مواقع';
    const summary=m.sum;
    $('svtCompletedSum').textContent=number(summary.done);
    $('svtCompletedPct').textContent=summary.total?summary.ratio.toFixed(1)+'%':'—';
    $('svtCompletedFill').style.width=Math.max(0,Math.min(100,summary.ratio))+'%';
    $('svtPendingSum').textContent=number(summary.pending);
    const valueMap={surveyOpen:summary.open,deferred:summary.deferred,deferredLabs:summary.labs};
    for (const [key,value] of Object.entries(valueMap)) {
      const tile=$('svtPending_'+key);tile.querySelector('b').textContent=number(value);
      tile.querySelector('i').style.width=(summary.pending?value/summary.pending*100:0)+'%';
    }
    $('svtRoot').dataset.loading=String(loading);
    if(state.peopleVisible)renderPeople();
    if(state.firstPaint){state.firstPaint=false;$('svtRoot').classList.add('svt-ready');}
    layoutConnectors();
  }
  function schedule(){if(!state.ready||state.scheduled||!active())return;state.scheduled=true;requestAnimationFrame(render);}
  function setSelectedSite(name){
    if(name){if(state.sites.has(name))state.sites.delete(name);else state.sites.add(name);}
    else state.sites.clear();
    state.peoplePage=1;
    $('svtRoot').classList.remove('svt-selection-pulse');void $('svtRoot').offsetWidth;$('svtRoot').classList.add('svt-selection-pulse');
    schedule();
  }
  function allowedPeople(mode,model,skipOrganization=false){
    const d=model||state.model||makeModel();
    let scoped=d.scoped;
    if(mode==='total'||mode==='month'||mode==='day')scoped=scoped.filter(doneStatus);
    else if(mode==='surveyPending')scoped=scoped.filter(r=>!doneStatus(r));
    else if(mode==='surveyOpen')scoped=scoped.filter(r=>!doneStatus(r)&&!deferredStatus(r)&&!labsStatus(r));
    else if(mode==='deferred')scoped=scoped.filter(r=>!doneStatus(r)&&deferredStatus(r)&&!labsStatus(r));
    else if(mode==='deferredLabs')scoped=scoped.filter(r=>!doneStatus(r)&&labsStatus(r));
    if(mode==='month')scoped=scoped.filter(r=>dateISO(r).slice(0,7)===d.date.slice(0,7));
    if(mode==='day')scoped=scoped.filter(r=>dateISO(r)===d.date);
    // The filter toolbar must read the entire current-scope mode dataset, not an already filtered subset.
    if(skipOrganization)return scoped;
    // Reuse the original independent survey-production/survey-sites organizational filter states.
    const key=(mode==='total'||mode==='month'||mode==='day')?'survey-production':'survey-sites';
    if(typeof window.__orgFilters?.apply==='function') {
      try {const restricted=window.__orgFilters.apply(key,scoped);if(Array.isArray(restricted))scoped=restricted;}
      catch(e){console.warn('Survey organizational filter unavailable',e);return [];}
    }
    const q=state.peopleSearch.trim().toLocaleLowerCase('ar');
    if(q)scoped=scoped.filter(r=>[r.name,r.sap,r.nid,r.workplace,r.empStatus,r.status,r.jobAr||r.job].some(v=>String(v??'').toLocaleLowerCase('ar').includes(q)));
    return scoped;
  }
  function renderPeople(){
    const host=$('svtPeopleHost');if(!host||!state.peopleVisible||!state.peopleMode)return;
    const mode=state.peopleMode;
    const heading={total:'المنفذ منذ البداية',month:'المنفذ خلال الشهر',day:'المنفذ في اليوم المحدد',surveyPending:'جميع المتبقين',surveyOpen:'الخدمة مفتوحة',deferred:'مؤجل فقط',deferredLabs:'مؤجل وله تحاليل'}[mode]||'الأشخاص';
    const list=allowedPeople(mode);
    const pages=Math.max(1,Math.ceil(list.length/60));state.peoplePage=Math.min(Math.max(1,state.peoplePage),pages);
    const from=(state.peoplePage-1)*60;
    const view=list.slice(from,from+60);
    const columns=[['name','الاسم'],['sap','SAP'],['workplace','موقع العمل'],['group','المجموعة'],['building','المبنى'],['department','الإدارة'],['activity','النشاط'],['empStatus','موقف التشغيل'],['date','التاريخ'],['job','الوظيفة'],['status','حالة الاستبيان']];
    const orgField=(row,key)=>{try{return window.__orgFilters?.value?.(row,key)||row[key]||'—';}catch(_){return row[key]||'—';}};
    host.hidden=false;
    host.innerHTML=`<div class="svt-people-heading"><div><h3>أسماء العاملين — ${heading}</h3><p>${number(list.length)} اسم مطابق · ${state.sites.size?`${number(state.sites.size)} موقع مختار`:'كل المواقع'} · عرض من البيانات الحالية</p></div><div class="svt-people-actions"><button type="button" id="svtPeopleClose">إغلاق التفاصيل</button></div></div>
       <div class="svt-people-tools"><label class="svt-search-combo"><span aria-hidden="true">⌕</span><input id="svtPeopleSearch" type="search" placeholder="بحث بالاسم أو رقم SAP..." value="${safe(state.peopleSearch)}" aria-label="بحث في أسماء العاملين" autocomplete="off"></label><span class="svt-people-page-info">صفحة ${number(state.peoplePage)} من ${number(pages)}</span></div>
       <div class="svt-people-table-wrap sv3-table-scroll"><table class="svt-people-table" id="svtPeopleTable" data-person-schema-v3="1" data-excel-ready="1" data-export-title="الاستبيانات"><thead><tr>${columns.map(([k,label])=>`<th data-person-field="${k}">${label}</th>`).join('')}</tr></thead><tbody>${view.map(r=>`<tr>${columns.map(([k])=>`<td>${safe(k==='job'?(r.jobAr||r.job||'—'):k==='date'?(dateISO(r)||'—'):['group','building','department','activity'].includes(k)?orgField(r,k):(r[k]||'—'))}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${columns.length}">لا توجد أسماء مطابقة لهذا الاختيار.</td></tr>`}</tbody></table></div>
       <div class="svt-people-pager"><button type="button" id="svtPeoplePrev" ${state.peoplePage===1?'disabled':''}>السابق</button><span>${number(from+(view.length?1:0))} – ${number(from+view.length)} من ${number(list.length)}</span><button type="button" id="svtPeopleNext" ${state.peoplePage===pages?'disabled':''}>التالي</button></div>`;
    const table=$('svtPeopleTable');if(table){
      table.__exportRows=list;
      const org=window.__orgFilters;
      if(typeof org?.bind==='function'){
        const key=(mode==='total'||mode==='month'||mode==='day')?'survey-production':'survey-sites';
        const orgSource=()=>allowedPeople(state.peopleMode,state.model,true);
        const orgRender=()=>{state.peoplePage=1;renderPeople();};
        const orgExport=()=>{const current=$('svtPeopleTable');if(current&&current.__exportRows?.length&&typeof window.exportAnyTableToExcel==='function')window.exportAnyTableToExcel(current,'الاستبيانات');};
        org.bind(key,table,orgSource,orgRender,orgExport);
        // The native organizational toolbar is mounted on the next animation frame.
        // Move our single search control only after the toolbar exists; never clone it.
        const attachSearch=()=>{
          const brand=host.querySelector('.psf-toolbar .psf-shell .psf-brand');
          const searchTools=host.querySelector(':scope > .svt-people-tools');
          if(!brand||!searchTools)return false;
          brand.insertBefore(searchTools,brand.querySelector('.psf-result')||null);
          return true;
        };
        if(!attachSearch()){
          const watcher=new MutationObserver(()=>{if(attachSearch())watcher.disconnect();});
          watcher.observe(host,{childList:true,subtree:true});
          setTimeout(()=>watcher.disconnect(),1000);
        }
      }
    }
  }
  function showPeople(mode){
    state.peopleMode=mode;state.peoplePage=1;state.peopleSearch='';state.peopleVisible=true;
    renderPeople();
  }
  function showPending(which){showPeople(which);}
  function onClick(e){
    const target=e.target;
    const site=target.closest('[data-site]');if(site){setSelectedSite(site.dataset.site);return;}
    const m=target.closest('[data-month]');if(m){
      const date=$('surveyProdDate');if(!date)return;
      const year=chosenDate().slice(0,4),month=String(Number(m.dataset.month)+1).padStart(2,'0');
      const oldDay=Number(chosenDate().slice(8))||1;
      const finalDay=new Date(Number(year),Number(month),0).getDate();
      date.value=`${year}-${month}-${String(Math.min(oldDay,finalDay)).padStart(2,'0')}`;
      date.dispatchEvent(new Event('change',{bubbles:true}));
      schedule();return; // Month selection is a local visual state, not an automatic navigation action.
    }
    if(target.closest('#svtShowMonthPeople')){showPeople('month');return;}
    const kpi=target.closest('[data-svt-open-people]');if(kpi){showPeople(kpi.dataset.svtOpenPeople);return;}
    const pending=target.closest('[data-svt-pending]');if(pending){showPending(pending.dataset.svtPending);return;}
    if(target.closest('#svtClearSite')){setSelectedSite('');return;}
    if(target.closest('#svtHub')){setSelectedSite('');return;}
    if(target.closest('#svtPeopleClose')){state.peopleVisible=false;state.peopleMode=null;$('svtPeopleHost').hidden=true;return;}
    if(target.closest('#svtPeoplePrev')){state.peoplePage--;renderPeople();return;}
    if(target.closest('#svtPeopleNext')){state.peoplePage++;renderPeople();return;}
  }
  function init(){
    if(state.ready)return true;
    const shell=$('surveyWorkspaceShell'),production=$('surveyProductionPanel'),sitePanel=$('surveySitePanel');
    if(!shell||!production||!sitePanel||!$('surveyProdKpis'))return false;
    if($(ID))return true;
    const root=document.createElement('section');root.id=ID;root.className='svt-wrap';root.dir='rtl';
    root.innerHTML=`<div id="svtRoot" class="svt-root" data-loading="true">
      <div class="svt-filterbar" aria-label="فلاتر الاستبيانات والنطاق الحالي"><h2 class="svt-sr">الاستبيانات</h2><div id="svtOriginalFilters" class="svt-original-filters"></div><div id="svtSourceSlot" class="svt-source-slot"></div><div class="svt-filter-scope"><span>النطاق الحالي</span><strong class="svt-scope" id="svtScope">جميع مواقع العمل</strong></div></div>
      <div class="svt-kpis">
        <button type="button" class="svt-coverage" data-svt-open-people="total" aria-label="عرض بيانات الاستبيانات المنفذة منذ البداية"><div class="svt-cover-heading">التغطية الإجمالية منذ البداية</div><div class="svt-cover-core"><b id="svtCoverPct">—</b><span><b id="svtDone">—</b> منفذ من <b id="svtTarget">—</b> موظف</span></div><span class="svt-meter"><i id="svtCoverFill"></i></span></button>
        <button type="button" class="svt-kpi" data-svt-open-people="month"><small>الشهر المحدد</small><b id="svtMonthCount">—</b><span id="svtMonthDate">—</span></button>
        <button type="button" class="svt-kpi" data-svt-open-people="day"><small>التاريخ المحدد</small><b id="svtDayCount">—</b><span id="svtDayDate">—</span></button>
        <button type="button" class="svt-kpi svt-kpi-pending" data-svt-pending="surveyPending"><small>المتبقي</small><b id="svtPending">—</b><span>اضغط لعرض الأشخاص</span></button>
      </div>
      <section class="svt-chart" aria-label="التنفيذ الشهري"><div class="svt-panel-title"><h3>التنفيذ الشهري للاستبيانات</h3><div class="svt-chart-aside"><span id="svtYear">يناير – ديسمبر</span><span class="svt-legend"><i></i> المنفذ</span></div></div>
        <div class="svt-chart-plot"><div class="svt-chart-y"><span id="svtMaxValue">—</span><span id="svtHalfValue">—</span><span>0</span></div><div id="svtMonthBars" class="svt-months"></div></div>
        <div class="svt-chart-footer"><div class="svt-month-selection" aria-live="polite"><span>الشهر المختار</span><strong id="svtActiveMonthLabel">—</strong><b id="svtActiveMonthCount">—</b><button type="button" id="svtShowMonthPeople">عرض أسماء الشهر</button></div><span id="svtChartMessage">اختر شهرًا لمتابعة التنفيذ</span></div>
      </section>
      <section class="svt-sites" aria-label="مخطط فروع مواقع العمل">
        <div class="svt-panel-title"><h3>خريطة مواقع العمل <em id="svtSitesCount"></em></h3><div class="svt-site-actions"><span id="svtSelectCount" class="svt-select-count">اضغط لتحديد موقع أو عدة مواقع</span><label class="svt-search-label"><span class="svt-sr">بحث عن موقع</span><input id="svtSearch" type="search" placeholder="بحث عن موقع عمل..." autocomplete="off"></label><label class="svt-sort-label">ترتيب حسب <select id="svtSort"><option value="coverage">نسبة الإنجاز</option><option value="pending">الأكثر متبقيًا</option><option value="name">اسم الموقع</option></select></label><button type="button" id="svtClearSite" hidden>مسح المواقع المختارة</button></div></div>
        <div id="svtTree" class="svt-tree"><svg id="svtConnectors" class="svt-connectors" aria-hidden="true" preserveAspectRatio="none"></svg>
          <div id="svtLeft" class="svt-side left"></div>
          <button id="svtHub" type="button" class="svt-hub" title="العودة إلى جميع المواقع" aria-label="عرض جميع المواقع"><span class="svt-hub-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="9" height="13" rx="1"/><rect x="13" y="4" width="7" height="17" rx="1"/><path d="M7 11h2m-2 4h2m-2 3h2m9-11h1m-1 4h1m-1 4h1M2 21h20"/></svg></span><span>مواقع العمل</span><strong id="svtHubCount">—</strong><small id="svtHubPct">—</small></button>
          <div id="svtRight" class="svt-side right"></div><p id="svtTreeEmpty" class="svt-empty" hidden>لا توجد مواقع مطابقة للبحث</p>
        </div>
      </section>
      <section class="svt-pending" aria-label="ملخص التنفيذ والمتبقي"><div class="svt-pending-title"><strong>تفاصيل المتبقي</strong><b id="svtPendingSum">—</b></div>
        <button type="button" class="svt-pending-item svt-completed-item" id="svtCompletedTile" data-svt-open-people="total" aria-label="عرض الأشخاص المنفذ لهم الاستبيان"><span>المنفذة</span><b id="svtCompletedSum">—</b><small>نسبة الإنجاز <strong id="svtCompletedPct">—</strong></small><span class="svt-pending-meter"><i id="svtCompletedFill"></i></span></button>
        <button class="svt-pending-item" id="svtPending_surveyOpen" type="button" data-svt-pending="surveyOpen"><span>الخدمة مفتوحة</span><b>—</b><span class="svt-pending-meter"><i></i></span></button>
        <button class="svt-pending-item" id="svtPending_deferred" type="button" data-svt-pending="deferred"><span>مؤجل فقط</span><b>—</b><span class="svt-pending-meter"><i></i></span></button>
        <button class="svt-pending-item" id="svtPending_deferredLabs" type="button" data-svt-pending="deferredLabs"><span>مؤجل وله تحاليل</span><b>—</b><span class="svt-pending-meter"><i></i></span></button>
      </section><div id="svtPeopleHost" hidden></div>
    </div>`;
    shell.insertBefore(root,production);
    const filter=production.querySelector('.survey-prod-filters');
    if(filter)$('svtOriginalFilters').append(filter); // Retains original controls and their bindings.
    const source=$('surveyWorkspaceNav')?.querySelector('.survey-source-link')||$('surveyProductionPanel')?.querySelector('.survey-source-link');
    if(source){source.classList.add('svt-source-link');source.title='فتح مصدر توزيع الاستبيان';source.setAttribute('aria-label','مصدر توزيع الاستبيان');const label=source.querySelector('span');if(label)label.textContent='مصدر توزيع الاستبيان';$('svtSourceSlot').append(source);}
    const people=$('surveyProdPeople')?.closest('.survey-people-box');
    if(people)$('svtPeopleHost').append(people);
    const originalDetail=$('surveySitePanel');if(originalDetail)originalDetail.classList.remove('svt-detail-visible');
    // Keep original site table/filter/export actions and the original survey panel in the DOM.
    root.addEventListener('click',onClick);
    root.addEventListener('input',e=>{if(e.target.id==='svtPeopleSearch'){const node=e.target;state.peopleSearch=node.value;state.peoplePage=1;const pos=node.selectionStart;renderPeople();const next=$('svtPeopleSearch');if(next){next.focus({preventScroll:true});next.setSelectionRange(pos,pos);}}});
    root.addEventListener('pointerover',e=>{const b=e.target.closest('[data-site]');if(!b||!root.contains(b))return;root.querySelectorAll('.svt-wire').forEach(p=>p.classList.toggle('hovered',p.dataset.lineSite===b.dataset.site));});
    root.addEventListener('pointerout',e=>{const b=e.target.closest('[data-site]');if(!b||b.contains(e.relatedTarget))return;root.querySelectorAll('.svt-wire.hovered').forEach(p=>p.classList.remove('hovered'));});
    $('svtSearch').addEventListener('input',e=>{state.term=e.target.value.trim();schedule();});
    $('svtSort').addEventListener('change',e=>{state.sort=e.target.value;schedule();});
    $('surveyProdDate')?.addEventListener('change',schedule);
    $('surveyProdEmpStatus')?.addEventListener('change',schedule);
    $('surveyProdToday')?.addEventListener('click',()=>requestAnimationFrame(schedule));
    for(const evt of ['dataUpdated','dashboardRegionChanged','referenceWorkforceUpdated','oncologyReferenceUpdated','dashboardTabChanged','visibilitychange'])document.addEventListener(evt,schedule);
    const sourceKpis=$('surveyProdKpis');if(sourceKpis){new MutationObserver(schedule).observe(sourceKpis,{childList:true});}
    const oldSites=$('sv98LocationList');if(oldSites){new MutationObserver(schedule).observe(oldSites,{childList:true,subtree:true});}
    if(window.ResizeObserver){resizeObs=new ResizeObserver(layoutConnectors);resizeObs.observe($('svtTree'));}
    else window.addEventListener('resize',layoutConnectors,{passive:true});
    state.ready=true;window.__OPM_SURVEY_TREE_V2__=Object.freeze({version:'6.0',readonly:true,refresh:schedule});
    if(active())window.renderSurveyProduction?.();
    schedule();return true;
  }
  const start=()=>{
    if(init())return;
    const mo=new MutationObserver(()=>{if(init())mo.disconnect();});
    const host=document.querySelector('main.wrap');mo.observe(host||document.body,host?{childList:true,subtree:true}:{childList:true});
    window.addEventListener('pagehide',()=>mo.disconnect(),{once:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
