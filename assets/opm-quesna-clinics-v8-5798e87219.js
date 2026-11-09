(function(){
'use strict';
if(window.__OPM_QNS_UI_V8__)return;
const core=window.OPM_QNS_CORE,balance=window.OPM_QNS_BALANCE;if(!core||!balance)return;
window.__OPM_QNS_UI_V8__=true;
const by=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>x==null?'—':Number(x).toLocaleString('en-US');
const adapter=window.OPM_QNS_ADAPTER||null;
const CFG_KEY='opm:quesna:clinic:v4:local:preferences';
const DAY_KEY='opm:quesna:clinic:active:v8:local:day:';
const ICONS={
  admin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="M6 20V8l6-4 6 4v12"/><path d="M9 12h.01M15 12h.01M9 16h.01M15 16h.01"/></svg>',
  vision:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  panels:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m13 2-7 12h5l-1 8 8-13h-5l0-7Z"/></svg>',
  laundry:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 7h.01M12 7h.01"/></svg>',
  ac:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M4 12h16M6 6l12 12M18 6 6 18"/></svg>',
  fridge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M7 11h10M10 6v2M10 14v2"/></svg>',
  heater:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1.6 2.1 2.4 3.8 2.4 5.3A3.4 3.4 0 1 1 7.7 9c0-1.8 1-3.7 3.1-6"/><path d="M8 15c.6-1.2 1.7-2.2 4-3.5 2.4 1.3 3.4 2.3 4 3.5A4.1 4.1 0 0 1 12 21a4.1 4.1 0 0 1-4-6Z"/></svg>',
  hub:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.8 4.8l2.2 2.2M17 17l2.2 2.2M19.2 4.8 17 7M7 17l-2.2 2.2"/></svg>',
  lab:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6L4.5 20a1 1 0 0 0 .9 1.5h13.2a1 1 0 0 0 .9-1.5L14 9V3"/><path d="M8 14h8"/></svg>',
  export:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>',
  refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6v5h-5"/><path d="M4 18v-5h5"/><path d="M6.5 9A7 7 0 0 1 18 6l2 2M17.5 15A7 7 0 0 1 6 18l-2-2"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  route:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h4v4H5zM15 15h4v4h-4z"/><path d="M9 7h4a3 3 0 0 1 3 3v5"/></svg>'
};
function icon(id){return ICONS[id]||ICONS.hub}
function region(){return String(window.__dashboardRegion||document.documentElement.dataset.dashboardRegion||'all')}
function today(){return window.__opmDate?.today?.()||new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function role(){try{return JSON.parse(sessionStorage.getItem('opm:session:v154')||'null')?.role||''}catch(_){return ''}}
function authorized(){return adapter?['admin','manager','doctor','allocator'].includes(state.serverRole):['admin','quesna','qc'].includes(role())}
const state={open:false,locked:false,serverRole:'',role:'',ready:false,loading:false,basis:'',people:[],sourceVersion:'',attendanceDay:'',plan:null,config:{capacity:{},primary:{}},selectedClinic:'',query:'',all:false,revision:'',message:'',preview:true,published:false,tryId:0,serviceFilter:'all',compareOpen:false,attendanceVerified:false,peopleOpen:false,peopleScope:'assigned',peoplePage:0,peopleQuery:'',activeClinics:core.clinics.map(c=>c.id),activeDay:'',clinicPickerOpen:false,localShiftModified:false};
function emptyStats(){return {total:0,fit:0,psa:0,both:0}}
function addPersonStats(stats,p){stats.total++;const fit=!!p?.fit,psa=!!p?.psa;if(fit&&psa)stats.both++;else if(fit)stats.fit++;else if(psa)stats.psa++;return stats}
function addStats(a,b){a.total+=(b?.total||0);a.fit+=(b?.fit||0);a.psa+=(b?.psa||0);a.both+=(b?.both||0);return a}
function statsFromPeople(people){const s=emptyStats();(people||[]).forEach(p=>addPersonStats(s,p));return s}
function statsValue(stats,kind){stats=stats||emptyStats();return kind==='fit'?stats.fit:kind==='psa'?stats.psa:kind==='both'?stats.both:stats.total}
function filterLabel(kind){return kind==='fit'?'FIT فقط':kind==='psa'?'PSA فقط':kind==='both'?'FIT + PSA':'الكل'}
function excelText(v){const t=String(v??'');return /^[=+@\-]/.test(t)?"'"+t:t}
function loadPref(){try{const v=JSON.parse(localStorage.getItem(CFG_KEY)||'{}');if(v&&typeof v==='object'){state.config.capacity=v.capacity||{};state.config.primary=v.primary||{}}}catch(_){} }
function savePref(){try{localStorage.setItem(CFG_KEY,JSON.stringify(state.config))}catch(_){} }
// Daily selection is local-only: never interpreted as an approved central shift plan.
function syncDayClinics(){
 const day=today();if(state.activeDay===day)return;
 state.activeDay=day;
 const all=core.clinics.map(c=>c.id);
 try{
  const saved=JSON.parse(localStorage.getItem(DAY_KEY+day)||'null');
  if(Array.isArray(saved?.ids)){
   const allowed=new Set(all);state.activeClinics=[...new Set(saved.ids.filter(id=>allowed.has(id)))];state.localShiftModified=true;
  }else{state.activeClinics=all;state.localShiftModified=false;}
 }catch(_){state.activeClinics=all;state.localShiftModified=false;}
 state.selectedClinic='';state.peopleOpen=false;state.peoplePage=0;
}
function applyClinicDay(ids){
 syncDayClinics();const known=new Set(core.clinics.map(c=>c.id));
 state.activeClinics=[...new Set(ids.filter(id=>known.has(id)))];
 state.localShiftModified=true;
 try{localStorage.setItem(DAY_KEY+state.activeDay,JSON.stringify({ids:state.activeClinics}))}catch(_){ }
 if(state.selectedClinic&&!state.activeClinics.includes(state.selectedClinic)){state.selectedClinic='';state.peopleOpen=false;}
 state.peoplePage=0;state.all=false;
 if(state.ready){state.plan=makePlan(state.people)}
 render();
 const count=state.activeClinics.length;
 showNotice('عيادات اليوم: '+count+' من 7 · تم إعادة حساب التوزيع محليًا فقط. التوجيه غير معتمد أو مشترك بين الأجهزة.');
}
function renderShift(){
 const b=by('qnsShiftToggle'),panel=by('qnsShiftPanel'),count=state.activeClinics.length;
 if(!b||!panel)return;
 b.querySelector('[data-qns-active-count]').textContent=fmt(count)+'/7';
 b.setAttribute('aria-expanded',String(!!state.clinicPickerOpen));
 b.classList.toggle('qns8-limited',count!==core.clinics.length);
 panel.hidden=!state.clinicPickerOpen;
 if(panel.hidden)return;
 panel.querySelector('#qnsShiftChoices').innerHTML=core.clinics.map(c=>{
  const on=state.activeClinics.includes(c.id);
  return `<button type="button" data-qns-active="${c.id}" aria-pressed="${on}" class="qns8-shift-chip${on?' is-on':''}"><span class="qns8-check" aria-hidden="true">${on?'✓':'–'}</span><span>${esc(c.name)}</span></button>`;
 }).join('');
 by('qnsShiftMeta').textContent=count===7?'كل العيادات تعمل في المعاينة الحالية':count===0?'لا توجد عيادات مختارة؛ ستظهر الأعداد كلها في يحتاج مراجعة':`${fmt(count)} عيادات تعمل · الأخرى خارج توزيع اليوم`;
}
function idOf(p){return String(p?.sap||p?.SAP||p?.nid||p?.key||'').trim()}
function normalized(v){return core.norm(v).replace(/^مبن[ىي]\s+/, '').replace(/^ال(?:مبني|مبنى)\s+/, '').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
const catalog=new Map(core.buildings.map(b=>[normalized(b.name),b]));
function officialBuilding(p){let value=p?.building||p?.['المبنى']||p?.['المبني']||'';
 if(!value&&window.__referencePersonByIds&&p?.sap){
  try{const ref=window.__referencePersonByIds(p.sap,p.nid,p.workplace);if(ref&&(window.__opmNormalizeId?window.__opmNormalizeId(ref.sap)===window.__opmNormalizeId(p.sap):String(ref.sap||'')===String(p.sap||'')))value=ref.building||''}catch(_){ }
 }
 const key=normalized(value);return {raw:String(value||'').trim(),match:catalog.get(key)||null};
}
function clinicLeadership(person){
 const raw=String(person?.org||person?.org_depth||person?.orgDepth||'').normalize('NFKC').replace(/[\s_\-\u200b-\u200f\uFEFF]/g,'').toUpperCase();
 return /^(?:N|N1|N2|N3|BOD|ADVISORS|SHAREHOLDERS?)$/.test(raw)||/قياد|مساهم/.test(raw);
}
function canonicalData(){
 const a=window.__ATTENDANCE_STATE__||{},same=String(a.day||'')===today();
 const fresh=same&&a.loaded===true&&!a.loading&&!a.error&&!a.cached;
 const empty=fresh&&a.ids instanceof Set&&a.ids.size===0&&Number(a.count||0)===0&&Array.isArray(a.rows)&&a.rows.length===0;
 if(empty)return {ready:true,people:[],basis:'actual',basisLabel:'حضور قويسنا اليوم: صفر',attendanceReady:true,sourceCount:0,excludedLeadership:0,warning:''};
 // Never carry a plan from a previous attendance snapshot through a failed/partial read.
 if((a.loaded||state.basis==='actual')&&!fresh)return {ready:false,message:a.loading?'جارٍ التحقق من حضور اليوم؛ خطة الأسماء السابقة مخفية.':'حضور اليوم غير متحقق حاليًا؛ لا توجد خطة أسماء قابلة للاستخدام أو التصدير.'};
 if(role()==='qc'&&!fresh)return {ready:false,message:'بانتظار تأكيد حضور اليوم؛ لن تُعرض أسماء من نسخة سابقة.'};
 const api=window.__V50_TEST__;
 if(!api||typeof api.population!=='function')return {ready:false,message:'جارٍ تجهيز مستهدف التحاليل…'};
 const target=api.population('wp');
 if(!target?.ready?.ok)return {ready:false,message:'مستهدف التحاليل غير جاهز.'};
 let population=target,basis='target',verified=false;
 if(fresh){
  const att=api.population('wp_att');
  if(a.dayVerified===false||!att?.ready?.ok)return {ready:false,message:'تعذر تأكيد ربط حضور اليوم بمواقع البصمة؛ خطة الأسماء السابقة مخفية.'};
  population=att;basis='actual';verified=true;
 }
 const all=population.targets||[],people=all.filter(person=>!clinicLeadership(person));
 return {ready:true,people,basis,basisLabel:verified?'الحضور الفعلي اليوم · قويسنا':'مستهدف تحاليل قويسنا · بدون شرط الحضور',attendanceReady:verified,sourceCount:all.length,excludedLeadership:all.length-people.length,warning:verified?'':'سيتم استخدام حضور اليوم عند التحقق منه؛ القيادات والمساهمون خارج توزيع العيادات.'};
}


function makePlan(people){
 const grouped=new Map(),unknown=new Map(),seen=new Set();
 for(let i=0;i<people.length;i++){
  const person=people[i],identity=idOf(person)||'row-'+i;
  if(seen.has(identity))continue;seen.add(identity);
  const b=officialBuilding(person),key=b.match?.name||b.raw||'بدون مبنى',target=b.match?grouped:unknown;
  if(!target.has(key))target.set(key,{building:key,match:b.match||null,people:[]});
  target.get(key).people.push(person);
 }
 return balance.calculate([...grouped.values(),...unknown.values()],core.clinics,{...state.config,activeClinics:state.activeClinics});
}
function hasSite(){return region()==='قويسنا'}
function navSync(){const el=by('opmQnsOpen');if(!el)return;const allowed=hasSite()&&authorized();el.hidden=!allowed;if(!allowed&&state.open&&!state.locked)close(false)}
function status(msg,warning=false){const el=by('qnsNotice');if(!el)return;el.textContent=msg;el.dataset.warning=warning?'yes':'no'}
/* Interface V6. Source acquisition and balancing remain delegated to the original engines. */
const serviceLabels={all:'كل المستهدف',fit:'FIT فقط',psa:'PSA فقط',both:'FIT + PSA'};
function getClinic(id){return core.clinics.find(c=>c.id===id)}
function sv(stats){return statsValue(stats,state.serviceFilter)}
function planReady(){return !!(state.ready&&state.plan)}
function resetFilters(){state.selectedClinic='';state.query='';state.serviceFilter='all';state.all=false;state.peoplePage=0;state.peopleQuery='';state.peopleOpen=false;by('qnsSearch')&&(by('qnsSearch').value='');by('qnsPeopleSearch')&&(by('qnsPeopleSearch').value='');render()}
function renderHeader(){
 const ready=planReady(),source=by('qnsMode');
 source.textContent=!ready?(state.loading?'جارٍ التحقق من المصدر':'المصدر غير متحقق'):state.basis==='actual'?(state.plan?.demand===0?'حضور قويسنا اليوم · صفر':'حضور قويسنا اليوم'):'مستهدف التحاليل بدون حضور';
 source.dataset.live=ready&&state.basis==='actual'?'yes':'no';
 by('qnsExport').disabled=!ready||state.loading||state.activeClinics.length===0||(state.basis==='actual'&&!state.attendanceVerified);
 by('qnsNotice').hidden=ready&&!(state.basis==='actual'&&!state.attendanceVerified);
 if(!ready)status(state.message||'بانتظار تحميل بيانات مستهدف التحاليل…');
 else if(state.basis==='actual'&&!state.attendanceVerified)status('تعذر التحقق من تحديث الحضور الحالي: لم يتم تصدير خطة قديمة على أنها محدثة. أعد المحاولة.',true);
 const p=state.plan;
 const kpis=[['qnsKpiTarget',p?.demand,'مستهدف التحاليل'],['qnsKpiAssigned',p?.assigned,'تم توجيههم'],['qnsKpiPending',p?.pending,'يحتاج مراجعة']];
 for(const [id,value] of kpis){const e=by(id);e.querySelector('strong').textContent=ready?fmt(value):'—';}
 by('qnsKpiPending').dataset.warning=ready&&p.pending>0?'yes':'no';
 by('qnsSourceDescription').textContent=ready?(state.basis==='actual'?(state.plan?.demand===0?'لا يوجد حضور مستهدف للتوزيع؛ لا تُستخدم أسماء من نسخة سابقة.':'التوزيع من حضور قويسنا المؤكد اليوم. القائمتان لا تُجمعان.'):'يُستخدم المستهدف غير المعتمد على الحضور حتى يصل حضور قويسنا المؤكد.'):'التوزيع مخفي حتى التحقق من المصادر؛ لا تُستخدم خطة أسماء سابقة.';
 if(ready&&state.excludedLeadership)by('qnsSourceDescription').textContent+=' · استُبعد '+fmt(state.excludedLeadership)+' من القيادات والمساهمين.';const changed=by('qnsLiveChange');if(!changed.textContent)changed.hidden=true;
 by('qnsExport').querySelector('span').textContent=state.peopleOpen?'Excel الأسماء':'Excel التوزيع والأسماء';
}
function renderServices(){
 const p=state.plan;
 by('qnsServiceTabs').innerHTML=[['all','الكل'],['fit','FIT فقط'],['psa','PSA فقط'],['both','FIT + PSA']].map(([id,label])=>`<button type="button" class="qns6-filter${state.serviceFilter===id?' is-active':''}" data-service="${id}" aria-pressed="${state.serviceFilter===id}"><span>${label}</span><strong>${planReady()?fmt(statsValue(p.totals,id)):'—'}</strong></button>`).join('');
}
function renderCards(){
 const p=state.plan;
 by('qnsCards').innerHTML=core.clinics.map(c=>{
  const item=p?.allocated.find(a=>a.id===c.id),total=item?.total||0;
  const selected=state.selectedClinic===c.id;
  const active=state.activeClinics.includes(c.id);
  const b=item?.stats||emptyStats(),shown=sv(b);
  const cap=item?.capacity;
  const capLabel=cap==null?'سعة العيادة غير محددة':`السعة: ${fmt(cap)}`;
  const pct=cap==null?null:cap===0?100:Math.min(100,Math.round(total/cap*100));
  return `<div class="qns7-clinic${selected?' is-selected':''}${active?'':' qns8-closed'}" data-qns-card="${c.id}">
    <button type="button" class="qns7-clinic-main" data-clinic="${c.id}" ${active?'':'disabled'} aria-label="عرض أسماء ${esc(c.name)} (${fmt(shown)} شخص)">
     <span class="qns7-clinic-title">${icon(c.id)} <b>${esc(c.name)}</b>${active?'':'<em class="qns8-closed-tag">خارج التشغيل</em>'}</span>
     <span class="qns7-clinic-total"><strong>${planReady()?fmt(shown):'—'}</strong><small>${state.serviceFilter==='all'?'شخص موجه':serviceLabels[state.serviceFilter]}</small></span>
    </button>
    <div class="qns7-clinic-types" aria-label="أنواع التحاليل">
     <button type="button" data-qns-kind="fit" data-qns-clinic="${c.id}" ${active?'':'disabled'} title="أسماء FIT فقط">FIT <b>${fmt(b.fit)}</b></button>
     <button type="button" data-qns-kind="psa" data-qns-clinic="${c.id}" ${active?'':'disabled'} title="أسماء PSA فقط">PSA <b>${fmt(b.psa)}</b></button>
     <button type="button" data-qns-kind="both" data-qns-clinic="${c.id}" ${active?'':'disabled'} title="أسماء FIT وPSA معًا">الاثنين <b>${fmt(b.both)}</b></button>
    </div>
    ${pct==null?'':`<span class="qns7-capacity" title="${esc(capLabel)}"><i style="width:${pct}%"></i></span>`}
   </div>`;
 }).join('');
}
function routeRows(){
 const p=state.plan;if(!p)return[];
 return p.records.filter(r=>(!state.selectedClinic||r.clinic===state.selectedClinic)&&(!state.query||normalized(r.building).includes(normalized(state.query)))&&sv(r.stats)>0)
 .sort((a,b)=>sv(b.stats)-sv(a.stats)||a.building.localeCompare(b.building,'ar'));
}
function renderTable(){
 const rows=routeRows(),limit=state.all||state.query||state.selectedClinic?rows.length:12,shown=rows.slice(0,limit);
 const clinicName=getClinic(state.selectedClinic)?.name||'كل العيادات';
 by('qnsRowCount').textContent=`${fmt(rows.length)} صف توزيع · ${serviceLabels[state.serviceFilter]} · ${clinicName}`;
 by('qnsTableBody').innerHTML=shown.map(r=>{
  const c=getClinic(r.clinic),from=getClinic(r.from);
  const note=r.overflow?`من ${esc(from?.name||'العيادة المرجعية')}`:r.split?'مبنى مشترك':'مباشر';
  const selected=sv(r.stats);
  return `<tr><td class="qns6-td-building"><strong>${esc(r.building)}</strong></td>
    <td><span class="qns6-clinic-cell">${icon(r.clinic)}<span>${esc(c?.name||'')}</span></span></td>
    <td class="qns6-number qns6-accent">${fmt(selected)}</td>
    <td class="qns8-service-summary">FIT <b>${fmt(r.stats.fit)}</b> · PSA <b>${fmt(r.stats.psa)}</b> · الاثنين <b>${fmt(r.stats.both)}</b></td>
    <td class="qns6-reason">${note}</td></tr>`;
 }).join('')||'<tr><td colspan="5" class="qns6-empty">لا توجد أعداد مطابقة للاختيار الحالي.</td></tr>';
 by('qnsShowAll').hidden=shown.length===rows.length;
 const missing=state.plan?.missing||[],unallocated=state.plan?.unallocated||[];
 const review=by('qnsReview');
 if(!missing.length&&!unallocated.length&&!state.plan?.totals?.unknown){review.hidden=true;review.innerHTML='';}
 else {review.hidden=false;review.innerHTML=`<summary>مراجعة البيانات غير الموزعة · ${fmt(state.plan.pending)} شخص</summary><div class="qns6-review-lines">${missing.map(m=>`<div><b>${esc(m.building)}</b><span>${fmt(m.count)} · اسم مبنى غير مطابق للمصدر</span></div>`).join('')}${unallocated.map(m=>`<div><b>${esc(m.building)}</b><span>${fmt(m.count)} · ${esc(m.reason)}</span></div>`).join('')}${state.plan?.totals?.unknown?`<div><b>تصنيف الخدمة</b><span>${fmt(state.plan.totals.unknown)} شخص دون FIT أو PSA واضح</span></div>`:''}</div>`;}
}
function renderSelectedClinic(){
 const p=state.plan,selected=state.selectedClinic,host=by('qnsSelectedDetail');
 if(!p){host.innerHTML='';return;}
 if(!selected){host.hidden=true;host.innerHTML='';return;}host.hidden=false;
 const clinic=p.allocated.find(c=>c.id===selected),records=p.records.filter(r=>r.clinic===selected).sort((a,b)=>b.count-a.count);
 const moved=records.filter(r=>r.overflow).reduce((n,r)=>n+r.count,0);
 host.innerHTML=`<div class="qns6-selected-head"><strong>${esc(clinic?.name||'العيادة')} · مصدر التوزيع</strong><button type="button" data-clear-clinic aria-label="إلغاء اختيار العيادة">إظهار كل العيادات</button></div>
 <div class="qns6-selected-meta"><b>${fmt(clinic?.total||0)}</b> شخص من <b>${fmt(new Set(records.map(r=>r.building)).size)}</b> مبانٍ${moved?` · <b>${fmt(moved)}</b> حصة موازنة مقترحة`:''}</div>
 <div class="qns6-source-list">${records.map(r=>`<div><span>${esc(r.building)}${r.overflow?'<em>حصة موازنة</em>':''}</span><b>${fmt(r.count)}</b><small>FIT ${fmt(r.stats.fit)} · PSA ${fmt(r.stats.psa)} · الاثنين ${fmt(r.stats.both)}</small></div>`).join('')||'<p>لا يوجد مستهدف من المباني لهذه العيادة.</p>'}</div>`;
}
function renderLookup(){
 const q=(state.query||'').trim(),host=by('qnsLookupResult');if(!q){host.hidden=true;host.innerHTML='';return;}
 const matches=core.buildings.filter(b=>normalized(b.name).includes(normalized(q))).slice(0,5);
 host.hidden=false;
 host.innerHTML=matches.length?matches.map(b=>{
  const records=state.plan?.records.filter(r=>r.building===b.name)||[];
  return `<button type="button" data-building="${esc(b.name)}"><b>${esc(b.name)}</b><span>${records.length?records.map(r=>`${esc(getClinic(r.clinic)?.name||'')}: ${fmt(sv(r.stats))}`).join(' · '):'لا يوجد مستهدف حاليًا للمبنى'}</span></button>`;
 }).join(''):'<p>اسم المبنى غير موجود في التقسيمة الرسمية.</p>';
}
function renderBalance(){
 const p=state.plan,host=by('qnsBalanceArea'),btn=by('qnsRebalance');
 btn.setAttribute('aria-expanded',String(!!state.compareOpen));btn.textContent=state.compareOpen?'إخفاء المقارنة':'مراجعة التوازن';
 host.hidden=!state.compareOpen;if(!p){host.innerHTML='';return;}
 // The baseline is a mathematical reference: all workers assigned to the first eligible clinic.
 // It is not a previously approved or executed distribution.
 const lines=p.allocated.map(c=>{const base=p.baseline[c.id]||0,diff=c.total-base;
  return `<div class="qns6-compare-row"><span>${esc(c.name)}</span><small>${fmt(base)} قبل</small><strong>${fmt(c.total)} بعد</strong><em class="${diff>0?'qns6-plus':diff<0?'qns6-minus':''}">${diff>0?'+':''}${fmt(diff)}</em></div>`;
 }).join('');
 const transfers=p.transfers||[];
 host.innerHTML=`<div class="qns6-balance-intro"><strong>مقارنة قبل / بعد الموازنة</strong><p>«قبل» مرجع حسابي بوضع كل مبنى في أول عيادة مسموح بها؛ ليس خطة تشغيل معتمدة. المقترح يوازن المباني المشتركة فقط ويلتزم بالسعات التي أُدخلت.</p></div>
 <div class="qns6-compare-grid">${lines}</div><div class="qns6-balance-title"><b>حصص الموازنة المقترحة: ${fmt(p.transferCount)} شخص</b><small>${fmt(transfers.length)} مسار من مبانٍ مشتركة</small></div>
 <div class="qns6-transfer-list">${transfers.length?transfers.map(t=>`<div class="qns6-transfer-item"><span><b>${esc(t.building)}</b><small>${esc(getClinic(t.from)?.name||'')} ← ${esc(getClinic(t.to)?.name||'')}</small></span><strong>${fmt(t.count)}</strong><small>FIT ${fmt(t.stats.fit)} · PSA ${fmt(t.stats.psa)} · الاثنين ${fmt(t.stats.both)}</small><em>${esc(t.reason)}</em></div>`).join(''):'<p>لا توجد حصص لإعادة توزيعها في التقسيمة الحالية.</p>'}</div>
 <p class="qns6-balance-foot">التوزيع هنا اقتراح محلي وليس اعتمادًا ميدانيًا، ولا يمكن ضمان توازن الإشغال الحقيقي دون إدخال السعات المعتمدة للعيادات.</p>`;
}
// Person-level detail uses the exact people assigned by the unchanged balancing engine.
// It does not infer assignments from aggregate numbers or recompute FIT/PSA flags.
function uniqueSourcePeople(){
 const seen=new Set(),out=[];
 for(let i=0;i<state.people.length;i++){
  const p=state.people[i],identity=idOf(p)||'row-'+i;
  if(seen.has(identity))continue;seen.add(identity);out.push(p);
 }
 return out;
}
function serviceKind(p){return p?.fit&&p?.psa?'both':p?.fit?'fit':p?.psa?'psa':'unknown'}
function personLabel(p){return String(p?.name||p?.employeeName||p?.['الاسم']||p?.['اسم الموظف']||'—')}
function personSap(p){return String(p?.sap||p?.SAP||p?.['رقم SAP']||'')}
function personNid(p){return String(p?.nid||p?.nationalId||p?.['الرقم القومي']||'')}
function personRows(){
 if(!state.plan)return[];
 const records=state.plan.records||[],assigned=[],assignedPeople=new Set();
 for(const r of records){for(const p of r.people||[]){assigned.push({p,building:r.building,clinic:r.clinic,reason:r.overflow?'موازنة من '+(getClinic(r.from)?.name||'عيادة مرجعية'):r.split?'مبنى مشترك':'مباشر',status:'موجه'});assignedPeople.add(p)}}
 const pending=[];
 for(const p of uniqueSourcePeople())if(!assignedPeople.has(p)){
  const building=officialBuilding(p);
  const unallocated=state.plan.unallocated?.find(u=>u.building===building.match?.name);
  pending.push({p,building:building.match?.name||building.raw||'غير محدد',clinic:'',reason:building.match?(unallocated?.reason||'التوجيه غير متاح حاليًا'):'مبنى يحتاج مطابقة',status:'بحاجة لمراجعة'});
 }
 let people=state.peopleScope==='all'?[...assigned,...pending]:state.peopleScope==='pending'?pending:assigned;
 if(state.selectedClinic)people=people.filter(r=>r.clinic===state.selectedClinic);
 if(state.serviceFilter!=='all')people=people.filter(r=>serviceKind(r.p)===state.serviceFilter);
 const q=normalized(state.peopleQuery||'');if(q)people=people.filter(r=>normalized([personLabel(r.p),personSap(r.p),personNid(r.p),r.building,getClinic(r.clinic)?.name||''].join(' ')).includes(q));
 return people;
}
function openPeople(scope='assigned',clinic='',kind='all'){
 if(!planReady())return;
 state.peopleOpen=true;state.peopleScope=scope;state.selectedClinic=clinic;state.serviceFilter=kind;state.peoplePage=0;state.peopleQuery='';
 const search=by('qnsPeopleSearch');if(search)search.value='';
 render();
 const holder=by('qnsPeople');if(holder&&!holder.hidden){
  holder.scrollIntoView?.({block:'nearest',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
}
function renderPeople(){
 const host=by('qnsPeople');if(!host)return;
 host.hidden=!state.peopleOpen||!planReady();if(host.hidden){by('qnsPeopleBody')?.replaceChildren();return;}
 const rows=personRows(),pages=Math.max(1,Math.ceil(rows.length/50)),page=Math.max(0,Math.min(pages-1,state.peoplePage));state.peoplePage=page;
 const subset=rows.slice(page*50,page*50+50);
 const scope=state.peopleScope==='pending'?'غير الموزعين':state.peopleScope==='all'?'كل المستهدفين':'الموجّهين';
 const clinic=state.selectedClinic?(getClinic(state.selectedClinic)?.name||''):'كل العيادات';
 by('qnsPeopleTitle').textContent=`أسماء الأشخاص · ${clinic}`;
 by('qnsPeopleInfo').textContent=`${fmt(rows.length)} شخص · ${scope} · ${filterLabel(state.serviceFilter)}`;
 by('qnsPeopleBody').innerHTML=subset.map(r=>{
  const p=r.p,k=serviceKind(p);
  return `<tr><td class="qns7-personname">${esc(personLabel(p))}</td><td dir="ltr">${esc(personSap(p))}</td><td dir="ltr">${esc(role()==='qc'?'':personNid(p))}</td><td>${esc(r.building)}</td><td>${esc(getClinic(r.clinic)?.name||'غير موزع')}</td><td>${k==='both'?'FIT + PSA':k==='fit'?'FIT فقط':k==='psa'?'PSA فقط':'غير مصنف'}</td><td>${esc(r.reason)}</td></tr>`;
 }).join('')||'<tr><td colspan="7" class="qns7-empty">لا توجد أسماء مطابقة للاختيار الحالي.</td></tr>';
 by('qnsPeoplePageInfo').textContent=`صفحة ${fmt(page+1)} من ${fmt(pages)}`;
 by('qnsPeoplePrev').disabled=page===0;by('qnsPeopleNext').disabled=page>=pages-1;
}
function render(){if(!state.open)return;renderShift();renderHeader();renderServices();renderCards();renderPeople();renderTable();renderSelectedClinic();renderLookup();}
function showNotice(message,warning=false){const el=by('qnsNotice');el.hidden=false;status(message,warning);}
async function refresh(){
 syncDayClinics();if(state.loading)return;state.loading=true;const previous=state.basis;showNotice('جارٍ قراءة مستهدف التحاليل والتأكد من حضور قويسنا…');
 try{
  const data=canonicalData();
  if(!data.ready){state.ready=false;state.plan=null;state.people=[];state.attendanceVerified=false;state.peopleOpen=false;state.excludedLeadership=0;state.message=data.message||'المصدر غير جاهز';render();return;}
  state.people=data.people||[];state.excludedLeadership=data.excludedLeadership||0;state.basis=data.basis;state.attendanceVerified=!!data.attendanceReady;state.ready=true;state.message=data.warning||data.basisLabel||'';
  state.plan=makePlan(state.people);state.peoplePage=0;if(state.basis==='actual')state.attendanceDay=today();
  const changed=by('qnsLiveChange');changed.textContent=previous&&previous!==state.basis?'تغير مصدر التوزيع إلى '+(state.basis==='actual'?'حضور قويسنا الفعلي':'المستهدف غير المشروط بالحضور')+'. تمت إعادة الحساب دون جمع المصدرين.':'';
  changed.hidden=!changed.textContent;
  render();
 }catch(e){state.ready=false;state.plan=null;state.people=[];state.attendanceVerified=false;state.peopleOpen=false;state.message='تعذر قراءة بيانات التوزيع. أعد المحاولة من زر التحديث.';showNotice(state.message,true);render();}
 finally{state.loading=false;if(state.open)render();}
}
function excelText(v){const s=String(v??'');return /^[=+@\-]/.test(s)?"'"+s:s}
async function exportExcel(){
 const p=state.plan;if(!p||state.loading||state.activeClinics.length===0||(state.basis==='actual'&&!state.attendanceVerified))return;
 if(role()==='qc'){
  const list=personRows(),rows=[['الاسم','SAP','المبنى','العيادة','التحليل المطلوب','التوجيه'],...list.map(row=>[personLabel(row.p),personSap(row.p),row.building,getClinic(row.clinic)?.name||'غير موزع',serviceKind(row.p)==='both'?'FIT + PSA':serviceKind(row.p)==='fit'?'FIT':'PSA',row.reason])];
  const quote=value=>'"'+String(/^[\s]*[=+@-]/.test(String(value??''))?"'"+String(value):value??'').replace(/"/g,'""')+'"';
  const csv='\uFEFF'+rows.map(row=>row.map(quote).join(',')).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='عيادات_قويسنا_'+today()+'.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);return;
 }
 const src=state.basis==='actual'?'حضور قويسنا الفعلي اليوم':'مستهدف التحاليل بدون حضور';
 const sheet1=[['العيادة','حالة التشغيل اليوم','الموجّه','FIT فقط','PSA فقط','FIT + PSA','غير مصنف','السعة المدخلة','المرجع قبل الموازنة','مصدر العدد'],...p.allocated.map(c=>[c.name,c.active?'تعمل':'متوقفة محليًا',c.total,c.stats.fit,c.stats.psa,c.stats.both,c.stats.unknown,c.capacity??'غير محددة',p.baseline[c.id]||0,src])];
 const sheet2=[['المبنى','العيادة','الإجمالي','FIT فقط','PSA فقط','FIT + PSA','غير مصنف','العيادة المرجعية','حصة الموازنة','السبب','المصدر'],...p.records.map(r=>[r.building,getClinic(r.clinic)?.name||'',r.count,r.stats.fit,r.stats.psa,r.stats.both,r.stats.unknown,getClinic(r.from)?.name||'',r.overflow?'نعم':'لا',r.reason,src])];
 const sheet3=[['المبنى المصدر','العيادة المرجعية','العيادة المستقبلة','العدد','FIT فقط','PSA فقط','FIT + PSA','السبب'],...(p.transfers||[]).map(t=>[t.building,getClinic(t.from)?.name||'',getClinic(t.to)?.name||'',t.count,t.stats.fit,t.stats.psa,t.stats.both,t.reason])];
 const sheet4=[['المبنى غير المطابق','الإجمالي','FIT فقط','PSA فقط','FIT + PSA','سبب المراجعة'],...(p.missing||[]).map(m=>[m.building,m.count,m.stats.fit,m.stats.psa,m.stats.both,'مراجعة اسم المبنى'])];
 const sheet5=[['المبنى','الإجمالي غير الموزع','FIT فقط','PSA فقط','FIT + PSA','السبب'],...(p.unallocated||[]).map(m=>[m.building,m.count,m.stats.fit,m.stats.psa,m.stats.both,m.reason])];
 const names=state.peopleOpen?personRows():(()=>{const cl=state.selectedClinic,filter=state.serviceFilter,scope=state.peopleScope,query=state.peopleQuery;state.selectedClinic='';state.serviceFilter='all';state.peopleScope='all';state.peopleQuery='';const rows=personRows();state.selectedClinic=cl;state.serviceFilter=filter;state.peopleScope=scope;state.peopleQuery=query;return rows;})();
 const sheetNames=[['اسم الموظف','SAP','الرقم القومي','المبنى','العيادة','التحليل المطلوب','موقف التوجيه','سبب التوجيه','مصدر العدد'],...names.map(r=>[personLabel(r.p),personSap(r.p),personNid(r.p),r.building,getClinic(r.clinic)?.name||'غير موزع',serviceKind(r.p)==='both'?'FIT + PSA':serviceKind(r.p)==='fit'?'FIT فقط':serviceKind(r.p)==='psa'?'PSA فقط':'غير مصنف',r.status,r.reason,src])];
 const shiftSheet=[['التاريخ','عدد العيادات العاملة','العيادات المختارة','موقف الاعتماد'],[today(),state.activeClinics.length,state.activeClinics.map(id=>getClinic(id)?.name||id).join('، '),'اختيار محلي تجريبي غير معتمد مركزيًا']];
 if(role()==='qc')for(const row of sheetNames)row.splice(2,1);
 const sheets=[[sheetNames,'أسماء الأشخاص'],[shiftSheet,'عيادات اليوم'],[sheet1,'ملخص العيادات'],[sheet2,'توزيع المباني'],[sheet3,'حصص الموازنة'],[sheet4,'مباني للمراجعة'],[sheet5,'غير موزع']];
 const name='Quesna_Clinics_Preview_'+(state.basis==='actual'?'Attendance_':'Target_')+today();
 try{
  if(window.XLSX?.utils?.aoa_to_sheet&&typeof window.XLSX.writeFile==='function'){
   const book=window.XLSX.utils.book_new();for(const [rows,title] of sheets){const safe=rows.map(row=>row.map(v=>typeof v==='number'?v:excelText(v))),sheet=window.XLSX.utils.aoa_to_sheet(safe);sheet['!cols']=safe[0].map((_,i)=>({wch:Math.min(39,Math.max(13,...safe.slice(0,70).map(r=>String(r[i]??'').length+2)))}));window.XLSX.utils.book_append_sheet(book,sheet,title);}
   await Promise.resolve(window.XLSX.writeFile(book,name+'.xlsx'));
   showNotice(`تم تصدير ${fmt(names.length)} شخص في ورقة الأسماء، مع ملخص التوزيع والتحويلات.`,false);return;
  }
  // Fail visibly rather than silently exporting a reduced CSV when Excel is requested.
  showNotice('مكتبة Excel غير جاهزة. أعد تحميل الموقع ثم حاول مرة أخرى.',true);
 }catch(e){showNotice('تعذر تصدير الملف. حاول مرة أخرى.',true);}
}
function configRender(){const wrap=by('qnsConfigBody');if(!wrap)return;
 wrap.innerHTML='<p class="qns6-config-note">هذه تفضيلات محلية للتجربة وليست سعات أو تحويلات معتمدة للخادم.</p>'+core.clinics.map(c=>`<label><span>${esc(c.name)} · سعة اختيارية</span><input data-cap="${c.id}" type="number" min="0" max="1000000" value="${esc(state.config.capacity[c.id]??'')}" placeholder="غير محددة"></label>`).join('')+core.buildings.filter(b=>b.eligible.length>1).map(b=>`<label><span>${esc(b.name)} · العيادة الأساسية</span><select data-primary="${esc(b.name)}"><option value="">التوزيع بين العيادات الرسمية</option>${b.eligible.map(id=>`<option value="${id}" ${state.config.primary[b.name]===id?'selected':''}>${esc(getClinic(id)?.name||id)}</option>`).join('')}</select></label>`).join('');
}
function applyConfig(){const next={capacity:{},primary:{}};
 by('qnsConfigBody').querySelectorAll('[data-cap]').forEach(el=>{const v=el.value.trim();if(v){const n=core.nonnegative(v,1000000);if(n!==null)next.capacity[el.dataset.cap]=n;}});
 by('qnsConfigBody').querySelectorAll('[data-primary]').forEach(el=>{if(el.value)next.primary[el.dataset.primary]=el.value;});
 state.config=next;savePref();state.plan=makePlan(state.people);render();by('qnsConfig').open=false;showNotice('تم تطبيق إعدادات المعاينة المحلية وحساب التوزيع من جديد. لم يتم اعتماد خطة على الخادم.');
}
function open(){if(!hasSite()||!authorized())return;syncDayClinics();if(typeof window.openDashboardTab==='function')window.openDashboardTab('tests');state.open=true;by('opmQnsPanel').hidden=false;document.body.classList.add('qns-page');by('opmQnsOpen')?.classList.add('active');refresh();}
function close(goBack=true){if(state.locked)return;state.open=false;by('opmQnsPanel').hidden=true;document.body.classList.remove('qns-page');by('opmQnsOpen')?.classList.remove('active');if(goBack&&typeof window.openDashboardTab==='function')window.openDashboardTab('tests');}
function bind(){
 by('opmQnsOpen')?.addEventListener('click',open);by('qnsClose')?.addEventListener('click',()=>close(true));
 by('qnsRefresh')?.addEventListener('click',refresh);by('qnsExport')?.addEventListener('click',exportExcel);
 by('qnsShiftToggle')?.addEventListener('click',()=>{state.clinicPickerOpen=!state.clinicPickerOpen;renderShift();});
 by('qnsShiftPanel')?.addEventListener('click',e=>{
  const b=e.target.closest('[data-qns-active]');
  if(b){const id=b.dataset.qnsActive;applyClinicDay(state.activeClinics.includes(id)?state.activeClinics.filter(x=>x!==id):[...state.activeClinics,id]);return;}
  if(e.target.closest('[data-qns-all-on]'))applyClinicDay(core.clinics.map(c=>c.id));
 });
 by('qnsCards')?.addEventListener('click',e=>{
  const chip=e.target.closest('[data-qns-kind]');if(chip){openPeople('assigned',chip.dataset.qnsClinic,chip.dataset.qnsKind);return;}
  const btn=e.target.closest('[data-clinic]');if(btn)openPeople('assigned',btn.dataset.clinic,state.serviceFilter);
 });
 by('qnsServiceTabs')?.addEventListener('click',e=>{const btn=e.target.closest('[data-service]');if(btn)openPeople('all','',btn.dataset.service);});
 by('qnsPeopleSearch')?.addEventListener('input',e=>{state.peopleQuery=e.target.value;state.peoplePage=0;renderPeople();});
 by('qnsNurseLogout')?.addEventListener('click',()=>document.getElementById('el-auth-logout')?.click());
 by('qnsQuickSearch')?.addEventListener('input',e=>{state.peopleOpen=true;state.peopleScope='all';state.selectedClinic='';state.peopleQuery=e.target.value;state.peoplePage=0;if(by('qnsPeopleSearch'))by('qnsPeopleSearch').value=e.target.value;renderPeople();renderCards();});
 by('qnsQuickClear')?.addEventListener('click',()=>{by('qnsQuickSearch').value='';resetFilters();});
 by('qnsPeoplePrev')?.addEventListener('click',()=>{state.peoplePage--;renderPeople();});
 by('qnsPeopleNext')?.addEventListener('click',()=>{state.peoplePage++;renderPeople();});
 by('qnsPeopleClose')?.addEventListener('click',()=>{state.peopleOpen=false;state.selectedClinic='';state.serviceFilter='all';render();});
 by('qnsSearch')?.addEventListener('input',e=>{state.query=e.target.value;state.all=!!state.query;renderTable();renderLookup();});
 by('qnsLookupResult')?.addEventListener('click',e=>{const btn=e.target.closest('[data-building]');if(!btn)return;state.query=btn.dataset.building;by('qnsSearch').value=state.query;state.all=true;renderTable();renderLookup();});
 by('qnsSelectedDetail')?.addEventListener('click',e=>{if(e.target.closest('[data-clear-clinic]')){state.selectedClinic='';render();}});
 by('qnsClear')?.addEventListener('click',resetFilters);
 by('qnsShowAll')?.addEventListener('click',()=>{state.all=true;renderTable();});
 by('qnsRebalance')?.addEventListener('click',()=>{state.compareOpen=!state.compareOpen;renderBalance();});
 by('qnsKpiTarget')?.addEventListener('click',()=>openPeople('all','', 'all'));
 by('qnsKpiAssigned')?.addEventListener('click',()=>openPeople('assigned','','all'));
 by('qnsKpiPending')?.addEventListener('click',()=>openPeople('pending','','all'));
 by('qnsConfig')?.addEventListener('toggle',()=>{if(by('qnsConfig').open)configRender();});by('qnsApply')?.addEventListener('click',applyConfig);
 document.addEventListener('click',e=>{if(e.target.closest?.('#dashTabs [data-dashboard-tab]')&&state.open&&!state.locked)close(false);},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.open&&!state.locked)close();});
 new MutationObserver(navSync).observe(document.documentElement,{attributes:true,attributeFilter:['data-dashboard-region']});
 document.addEventListener('dashboardRegionChanged',navSync);document.addEventListener('elAuthStateChanged',event=>{if(event.detail?.locked){state.locked=false;close(false);state.plan=null;state.people=[];state.ready=false;state.attendanceVerified=false;state.peopleOpen=false;for(const id of ['qnsPeopleBody','qnsCards','qnsTableBody'])if(by(id))by(id).replaceChildren();if(by('qnsQuickSearch'))by('qnsQuickSearch').value='';}navSync();if(!event.detail?.locked&&role()==='qc'){state.locked=true;open();}});
 let queued=false;const auto=()=>{if(queued||!state.open||state.loading)return;queued=true;requestAnimationFrame(()=>{queued=false;if(state.open)refresh();});};
 ['attendanceUpdated','attendanceStatusChanged','referenceWorkforceUpdated','dataUpdated','opmExcelSyncUpdated','dashboardRegionChanged'].forEach(ev=>document.addEventListener(ev,auto));
}
function bootstrap(){const tabs=by('dashTabs'),parent=tabs?.querySelector('[data-dashboard-tab="tests"]');if(!tabs||!parent)return;
 const nav=document.createElement('button');nav.id='opmQnsOpen';nav.type='button';nav.className='dash-tab qns-subnav';nav.hidden=true;
 nav.innerHTML=`<span class="qns6-navbranch" aria-hidden="true"></span><svg class="qns6-clinic-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M10 21v-5h4v5M10 9h4m-2-2v4M8 13h1m6 0h1"/></svg><span class="qns6-navtext">عيادات قويسنا</span>`;nav.setAttribute('aria-label','توزيع عيادات قويسنا');nav.title='عيادات قويسنا';parent.after(nav);
 const panel=document.createElement('section');panel.id='opmQnsPanel';panel.hidden=true;panel.setAttribute('aria-label','لوحة توزيع عيادات قويسنا');
 panel.innerHTML=`<div class="qns7-shell">
  <header class="qns7-header"><div class="qns7-heading"><span>التحاليل / قويسنا</span><h2>توزيع عيادات قويسنا</h2></div><div class="qns7-actions"><span id="qnsMode" class="qns6-mode">جارٍ تحميل المصدر</span><button id="qnsRefresh" type="button" class="qns6-btn" title="تحديث بيانات التحاليل">${ICONS.refresh}تحديث</button><button id="qnsExport" type="button" class="qns6-btn qns6-primary" disabled>${ICONS.export}<span>Excel التوزيع والأسماء</span></button><button id="qnsNurseLogout" type="button" class="qns6-btn qns190-nurse-only">خروج</button><button id="qnsClose" type="button" class="qns6-btn qns6-return">العودة للتحاليل</button></div></header>
  <div id="qnsNotice" class="qns6-notice" role="status" aria-live="polite">جارٍ تحميل التوزيع…</div><div id="qnsLiveChange" class="qns6-notice qns6-update" aria-live="polite" hidden></div>
  <section class="qns7-overview" aria-label="ملخص التوزيع"><button id="qnsKpiTarget" type="button"><span>المستهدف الحالي</span><strong>—</strong><small>عرض الأسماء</small></button><button id="qnsKpiAssigned" type="button"><span>تم توجيههم</span><strong>—</strong><small>أسماء الموجّهين</small></button><button id="qnsKpiPending" type="button"><span>يحتاج مراجعة</span><strong>—</strong><small>أسماء غير الموزعين</small></button><div class="qns7-source"><b>مصدر العدد</b><span id="qnsSourceDescription">من صفحة التحاليل</span><small>من مستهدف التحاليل وحضور اليوم</small></div></section>
  <div class="qns190-quick"><label for="qnsQuickSearch">ابحث عن العامل لمعرفة عيادته</label><input id="qnsQuickSearch" type="search" autocomplete="off" placeholder="الاسم أو رقم SAP" aria-label="بحث عن عيادة العامل"><button id="qnsQuickClear" type="button" class="qns6-btn">مسح</button></div><section id="qnsPeople" class="qns7-people" hidden><div class="qns7-people-head"><div><h3 id="qnsPeopleTitle">أسماء الأشخاص</h3><small id="qnsPeopleInfo">—</small></div><div class="qns7-people-actions"><input id="qnsPeopleSearch" type="search" autocomplete="off" placeholder="بحث بالاسم أو SAP أو المبنى" aria-label="بحث في الأشخاص"><button id="qnsPeopleClose" type="button" class="qns6-btn">إغلاق الأسماء</button></div></div><div class="qns7-people-scroll"><table data-person-schema="manual"><thead><tr><th>الاسم</th><th>SAP</th><th>الرقم القومي</th><th>المبنى</th><th>العيادة</th><th>التحليل</th><th>الموقف</th></tr></thead><tbody id="qnsPeopleBody"></tbody></table></div><div class="qns7-people-footer"><span>التصدير العلوي يشمل جميع الأسماء المطابقة، وليس الصفحة الظاهرة فقط.</span><div class="qns7-pager"><button id="qnsPeoplePrev" type="button">السابق</button><span id="qnsPeoplePageInfo"></span><button id="qnsPeopleNext" type="button">التالي</button></div></div></section>
  <section class="qns7-clinics-section"><div class="qns7-sectionbar"><div class="qns8-sectiontitle"><h3>العيادات</h3><button id="qnsShiftToggle" class="qns8-shift-toggle" type="button" aria-controls="qnsShiftPanel" aria-expanded="false"><span>عيادات اليوم</span><b data-qns-active-count>7/7</b><span aria-hidden="true">⌄</span></button></div><div id="qnsServiceTabs" class="qns6-filtergroup" aria-label="أنواع التحاليل"></div></div>
   <div id="qnsShiftPanel" class="qns8-shift-panel" hidden><div class="qns8-shift-row"><strong>حدّد العيادات اللي هتشتغل النهارده</strong><button type="button" data-qns-all-on class="qns8-all-on">تشغيل الكل</button></div><div id="qnsShiftChoices" class="qns8-shift-choices"></div><small id="qnsShiftMeta"></small><p>الاختيار محفوظ لهذا اليوم على هذا الجهاز فقط؛ ليس خطة مشتركة مع التمريض حتى الربط بالخادم.</p></div>
   <div id="qnsCards" class="qns7-clinics"></div><p class="qns7-tip">اضغط على رقم العيادة أو FIT أو PSA لعرض الأسماء ثم تصديرها.</p></section>

  <details id="qnsExtra" class="qns7-extra"><summary><b>مصدر توزيع المباني</b><span>اختياري</span></summary><div class="qns7-extra-content qns8-extra-content">
   <div class="qns8-extra-tools"><div class="qns8-extra-tools-title"><b>مسارات المباني</b><small>يعرض المباني العاملة ومسارات تحويل الأعداد</small></div><div class="qns7-more-actions"><button id="qnsClear" type="button" class="qns6-btn">الكل</button></div><div class="qns6-searchinput">${ICONS.search}<input id="qnsSearch" type="search" placeholder="بحث بمبنى" aria-label="بحث بالمبنى" autocomplete="off"></div></div>
   <div id="qnsLookupResult" class="qns6-searchresults" hidden></div>
   <div id="qnsSelectedDetail" class="qns8-clinicfeed" hidden></div>

   <div id="qnsTable" class="qns6-tablepanel"><div class="qns8-table-title"><b>المباني الموجّهة</b><small id="qnsRowCount">—</small></div><div class="qns6-tablewrap qns8-tablewrap"><table class="qns6-table qns8-table"><thead><tr><th>المبنى</th><th>العيادة</th><th>الأشخاص</th><th>نوع التحاليل</th><th>المسار</th></tr></thead><tbody id="qnsTableBody"><tr><td colspan="5">جارٍ التحميل…</td></tr></tbody></table></div><button id="qnsShowAll" type="button" class="qns6-showall" hidden>عرض باقي المباني</button><details id="qnsReview" class="qns6-review" hidden></details></div>

  </div></details><p class="qns7-foot">التوزيع حسب الحضور المؤكد. اختيار عيادات اليوم محفوظ على هذا الجهاز فقط.</p>
 </div>`;
 (document.querySelector('main.wrap')||document.body).appendChild(panel);loadPref();bind();
 if(adapter){if(typeof adapter.getSession!=='function'){nav.hidden=true;return;}adapter.getSession().then(s=>{state.serverRole=['admin','manager','doctor','allocator'].includes(s?.role)?s.role:'';navSync();if(state.serverRole==='allocator'&&hasSite()){state.locked=true;document.documentElement.classList.add('qns-locked');open();by('qnsClose').hidden=true;}}).catch(()=>{state.serverRole='';navSync();});}
 else {navSync();if(role()==='qc'){state.locked=true;open();}}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootstrap,{once:true});else bootstrap();
window.OPM_QNS_UI={open,close,refresh,getState:()=>({source:state.basis,verified:state.ready&&state.attendanceVerified,plan:state.plan,preview:true,serviceFilter:state.serviceFilter})};
})();
