(()=>{"use strict";if(window.__OPM_V150__)return;window.__OPM_V150__=true;const esc=v=>String(v??"").replace(/[&<>"']/g,(c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))),num=v=>Number(v||0).toLocaleString("en-US"),$=id=>document.getElementById(id),locked=()=>document.documentElement.classList.contains("el-auth-locked"),canRun=()=>!document.hidden&&!locked()&&navigator.onLine!==false;const W={appliedVer:0,srcVer:0,probe:"",lastProbeAt:0,running:null,timer:0,errors:0,refreshes:0,lastReason:"",pendingSources:[],lastError:"",upgradeRequired:false};let paused=false;/* OPM v191 change watcher: per-tab verification in one batched gateway call, adaptive cadence,
   probe sharing between browser tabs, transient states never counted as failures, sync metrics. */
const entries=()=>[...(window.__opmGatewayRequests||new Map).values()].filter(r=>!r.retired&&(!r.endpoint||r.endpoint===window.OPM_GATEWAY_URL)&&r.source&&r.hash&&!(r.source==="chronic"&&window.__chronicSheet?.state?.mode==="api")&&!/\blimit\s+0\b/i.test(r.params.tq||""));
const ORDER={lab:0,labRefs:1,attendance:2,reference:3,clinical:4,checkup:5,chronic:6};
const PROBE_SHARE="opm-probe-share-v54:",METRIC_KEY="opm-sync-metrics-v5";
let lastInteraction=Date.now();
W.batch=null;W.metrics=(()=>{try{const m=JSON.parse(localStorage.getItem(METRIC_KEY)||"null");if(m&&Array.isArray(m.applied))return{checks:0,batchCalls:0,singleCalls:0,transient:0,failures:0,ticks:0,...m,day:m.day||""}}catch(_){}return{applied:[],checks:0,batchCalls:0,singleCalls:0,transient:0,failures:0,ticks:0,day:""}})();
function metricsDay(){const d=new Date().toLocaleDateString("en-CA",{timeZone:"Africa/Cairo"});if(W.metrics.day!==d){W.metrics={applied:W.metrics.applied.slice(-10),checks:0,batchCalls:0,singleCalls:0,transient:0,failures:0,ticks:0,day:d}}}
function saveMetrics(){try{W.metrics.applied=W.metrics.applied.slice(-30);localStorage.setItem(METRIC_KEY,JSON.stringify(W.metrics))}catch(_){}paintMetrics()}
function recordApplied(source,rev,detectedAt){const now=Date.now();if(!(rev>0))return;const total=now-rev;if(!(total>=0&&total<36e5))return;W.metrics.applied.push({source,at:now,totalMs:total,detectMs:Math.max(0,detectedAt-rev),applyMs:Math.max(0,now-detectedAt)});saveMetrics()}
function summary(){const a=W.metrics.applied.slice(-20),avg=a.length?a.reduce((s,x)=>s+x.totalMs,0)/a.length:0,last=a[a.length-1];return{last,avgMs:Math.round(avg),samples:a.length,checks:W.metrics.checks,batchCalls:W.metrics.batchCalls,singleCalls:W.metrics.singleCalls,transient:W.metrics.transient,failures:W.metrics.failures,ticks:W.metrics.ticks,batch:W.batch,cadenceMs:W.cadence||0}}
function paintMetrics(){const host=document.getElementById("opm-unified-details");if(!host)return;let el=host.querySelector(".opm-sync-metrics");if(!el){el=document.createElement("div");el.className="opm-sync-metrics";el.setAttribute("role","status");el.style.cssText="margin:8px 4px 2px;padding:7px 10px;border-radius:10px;font-size:12px;line-height:1.6;background:color-mix(in srgb,currentColor 6%,transparent);opacity:.92";host.append(el)}const s=summary(),sec=ms=>(ms/1e3).toLocaleString("ar-EG",{maximumFractionDigits:1})+" ث";el.textContent="مراقبة المزامنة: "+(s.last?"آخر تحديث وصل للموقع خلال "+sec(s.last.totalMs)+" · المتوسط "+sec(s.avgMs)+" ("+num(s.samples)+")":"لا توجد تغييرات مطبقة بعد")+" · فحوصات اليوم "+num(s.checks)+(s.batch?" (مجمعة)":"")+" · إخفاقات "+num(s.failures)+(W.lastError?" · "+W.lastError:"")}
["pointerdown","keydown","wheel","touchstart"].forEach(ev=>window.addEventListener(ev,()=>{const idle=Date.now()-lastInteraction>18e4;lastInteraction=Date.now();if(idle&&!W.running)start(800)},{passive:true,capture:true}));
function cadence(){const jitter=Math.floor(Math.random()*1500);if(W.errors)return Math.min(12e4,2e4*2**W.errors)+jitter;const active=Date.now()-lastInteraction<18e4;return(active?6e3:2e4)+jitter}
async function probeBook(book){const key=PROBE_SHARE+encodeURIComponent(String(window.OPM_GATEWAY_URL||""))+":"+book;try{const s=JSON.parse(localStorage.getItem(key)||"null"),age=s?Date.now()-Number(s.at):Infinity;if(s&&age>=0&&age<4e3&&Number(s.srcVer)>0)return{probe:"drive",srcVer:s.srcVer,shared:true}}catch(_){}const p=await window.__opmGatewayProbe(book);if(p?.probe==="drive"&&Number(p.srcVer)>0)try{localStorage.setItem(key,JSON.stringify({at:Date.now(),srcVer:String(p.srcVer)}))}catch(_){}return p}
window.__opmBatchCheck=function(book,list){const endpoint=String(window.OPM_GATEWAY_URL||"");if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))return Promise.reject(Error("بوابة البيانات غير مهيأة."));const url=new URL(endpoint);url.searchParams.set("op","batch");url.searchParams.set("book",book);url.searchParams.set("keys",list.map(r=>r.serverKey).join(","));url.searchParams.set("hashes",list.map(r=>r.hash||"").join(","));return window.__opmReadGvizDirect(url.href,{format:"api",once:true,timeout:9e4,priority:9})};
async function verifyMany(book,list){
 const out=new Map,keyed=list.filter(r=>r.serverKey&&/^[a-z0-9-]{1,40}:[0-9a-f]{32}$/.test(r.serverKey));
 if(W.batch!==false&&keyed.length>=2){
  for(let i=0;i<keyed.length;i+=25){
   if(!canRun())break;
   const chunk=keyed.slice(i,i+25);
   try{
    W.metrics.batchCalls++;
    const reply=await window.__opmBatchCheck(book,chunk);
    if(reply?.batchProtocol===1&&Array.isArray(reply.items)){
     W.batch=true;
     chunk.forEach((r,j)=>{
      const it=reply.items[j];
      // A deferred item means the batch's read budget was used. Issuing the
      // same reads individually here defeats that budget under concurrent load.
      if(it&&it.key===r.serverKey&&it.status==='deferred'){
       out.set(r,{status:'error',errors:[{reason:'busy'}],gw:{...it.gw||{},retryable:true,retryAfter:Math.max(3,Number(it.retryAfter||it.gw?.retryAfter)||3)},readCheckProtocol:1});
      }else if(it&&it.key===r.serverKey&&it.status==='unknown'){
       // An evicted descriptor must be registered again by one ordinary check.
      }else if(it&&it.key===r.serverKey){
       out.set(r,{status:it.status,unchanged:it.unchanged,gw:it.gw,errors:it.errors,readCheckProtocol:1});
      }else out.set(r,{error:Error('استجابة الفحص المجمع غير مكتملة؛ سنعيد الفحص تلقائيًا.')});
     });
    }else if(reply?.errors?.[0]?.reason==='bad_op'||reply?.status==='error'&&/عملية غير معروفة/.test(reply?.errors?.[0]?.message||'')){
     W.batch=false; // Explicitly unsupported old gateways retain the single-check path.
    }else{
     // A quota/source failure is not evidence of an old gateway. Fan-out would
     // multiply the same failure on every browser and bypass source backoff.
     const failed=reply?.status==='error'?{status:'error',errors:reply.errors,gw:reply.gw,readCheckProtocol:1}:{error:Error('تعذر تأكيد الفحص المجمع؛ آخر بيانات سليمة محفوظة.')};
     chunk.forEach(r=>out.set(r,failed));
    }
   }catch(error){chunk.forEach(r=>out.set(r,{error}));}
  }
 }
 const rest=list.filter(r=>!out.has(r));
 for(let i=0;i<rest.length;i+=2){if(!canRun())break;await Promise.allSettled(rest.slice(i,i+2).map(async r=>{W.metrics.singleCalls++;try{out.set(r,await window.__opmCheckGviz(r))}catch(error){out.set(r,{error})}}))}
 return out;
}
async function runTick() {
  if (!canRun() || !window.__opmGatewayProbe) return;
  metricsDay();
  W.metrics.ticks++;
  const requests = entries();
  const books = [...new Set(requests.map(r => r.params.book))];
  const versions = new Map();
  W.lastError = "";
  for (const book of books) {
    try {
      const probe = await probeBook(book);
      W.lastProbeAt = Date.now();
      if (probe?.probe !== "drive" || !(Number(probe.srcVer) > 0)) {
        W.lastError = "تعذر التحقق من تغيير المصدر؛ البيانات السابقة محفوظة.";
        continue;
      }
      const revision = Number(probe.srcVer);
      versions.set(book, revision);
      W.probe = "drive";
      W.srcVer = Math.max(W.srcVer, revision);
    } catch (_) {
      W.lastError = "تعذر فحص تغيير المصدر؛ البيانات السابقة محفوظة.";
    }
  }

  const now = Date.now();
  const checks = requests.filter(r => {
    const rev = versions.get(r.params.book) || 0;
    const seen = Math.max(r.checkedVersion || 0, r.verifiedVersion || 0);
    const audit = now - (r.lastContentCheckedAt || 0) >= (r.source === "reference" ? 36e4 : 18e4);
    return (rev > seen || audit || r.recheckAt && now >= r.recheckAt || r.pendingHash || r.stale) &&
      (!r.watchRetryAt || now >= r.watchRetryAt || rev > (r.retryVersion || 0));
  }).sort((a, b) => (ORDER[a.source] ?? 9) - (ORDER[b.source] ?? 9));
  const groups = new Map();
  for (const request of checks) {
    if (!groups.has(request.source)) groups.set(request.source, {remaining: 0, changed: [], blocked: false});
    groups.get(request.source).remaining++;
  }
  const scheduled = new Set(checks);
  for (const request of requests) {
    const group = groups.get(request.source);
    if (group && !scheduled.has(request) && (request.stale || request.pendingHash || request.checkFailed)) {
      group.blocked = true;
    }
  }

  function defer(request, revision, seconds) {
    W.metrics.transient++;
    request.stale = true;
    request.checkFailed = false;
    request.retryVersion = revision;
    request.watchRetryAt = Date.now() + Math.max(1500, (Number(seconds) || 3) * 1000);
    W.soonest = Math.min(W.soonest || Infinity, request.watchRetryAt);
  }

  async function applyGroup(source, group) {
    if (group.blocked || !group.changed.length || !canRun()) return;
    const sync = window.__opmLiveSync;
    W.lastReason = "content-change";
    W.refreshes++;
    try { await sync?.refreshSource?.(source); }
    catch (_) { /* Check the receipts before reporting success. */ }
    const consumer = sync?.inspectSource?.(source);
    const applied = group.changed.every(({request, hash, rev}) => request.retired ||
      !request.stale && !request.loading && !request.checkFailed &&
      (request.verifiedVersion > rev || request.hash === hash && request.verifiedVersion >= rev));
    if (applied && (!consumer || consumer.status === "ok")) {
      for (const {request, rev} of group.changed) {
        request.checkedVersion = Math.max(request.checkedVersion || 0, rev);
        request.pendingHash = "";
        request.pendingVersion = 0;
      }
      recordApplied(source, Math.max(...group.changed.map(item => item.rev)), group.changed[0].detectedAt);
      return;
    }
    for (const {request, hash, rev} of group.changed) {
      if (request.retired) continue;
      request.pendingHash = hash;
      request.pendingVersion = rev;
      request.retryVersion = rev;
      request.watchRetryAt = Date.now() + 30000;
    }
    W.lastError = "لم يكتمل تطبيق أحد المصادر؛ بقيت النسخة السابقة.";
  }

  for (const book of books) {
    const list = checks.filter(r => r.params.book === book);
    const revision = versions.get(book) || 0;
    for (let offset = 0; offset < list.length && canRun(); offset += 4) {
      const chunk = list.slice(offset, offset + 4);
      const detectedAt = Date.now();
      const replies = await verifyMany(book, chunk);
      const ready = new Set();
      for (const request of chunk) {
        const group = groups.get(request.source);
        if (--group.remaining === 0) ready.add(request.source);
        const reply = replies.get(request);
        if (!reply) { group.blocked = true; continue; }
        W.metrics.checks++;
        try {
          if (reply.error) throw reply.error;
          const gw = reply.gw || {};
          if (reply.status !== "ok") {
            if (reply.errors?.[0]?.reason === "busy" || gw.retryable) {
              defer(request, revision, gw.retryAfter);
              group.blocked = true;
              continue;
            }
            throw Error("تعذر فحص بصمة المصدر؛ النسخة السابقة محفوظة.");
          }
          if (reply.readCheckProtocol !== 1) {
            W.upgradeRequired = true;
            throw Error("فحص التغيير يحتاج إلى إصدار أحدث من البوابة.");
          }
          W.upgradeRequired = false;
          const verified = Number(gw.verifiedSourceVersion);
          if (gw.pendingSourceCheck || gw.refreshing || gw.stale || gw.fresh === false ||
              Number.isFinite(verified) && verified < revision && !gw.journalClean) {
            defer(request, revision, gw.retryAfter || (gw.pendingSourceCheck ? 10 : 3));
            group.blocked = true;
            continue;
          }
          if (!gw.hash || !Number.isFinite(verified)) throw Error("استجابة فحص المصدر غير مكتملة.");
          request.watchFailures = 0;
          request.watchRetryAt = 0;
          request.lastContentCheckedAt = Date.now();
          request.checkFailed = false;
          request.recheckAt = gw.journalClean ? Date.now() + Math.max(5000, (Number(gw.retryAfter) || 60) * 1000) : 0;
          const rev = Math.max(revision, verified);
          if (gw.hash === request.hash || request.verifiedVersion > rev && !request.stale) {
            request.checkedVersion = Math.max(request.checkedVersion || 0, rev);
            request.stale = false;
            request.pendingHash = "";
            request.pendingVersion = 0;
            continue;
          }
          request.pendingHash = gw.hash;
          request.pendingVersion = rev;
          group.changed.push({request, hash: gw.hash, rev, detectedAt});
        } catch (error) {
          group.blocked = true;
          W.metrics.failures++;
          request.checkFailed = true;
          request.watchFailures = Math.min(4, (request.watchFailures || 0) + 1);
          request.retryVersion = revision;
          request.watchRetryAt = Date.now() + Math.max(Number(error.retryAfter || 0) * 1000,
            Math.min(120000, 15000 * 2 ** (request.watchFailures - 1)));
          W.lastError = error.message || "تعذر فحص المصدر.";
        }
      }
      await Promise.allSettled([...ready].map(source => applyGroup(source, groups.get(source))));
    }
  }
  for (const source of groups.keys()) {
    const group = requests.filter(r => !r.retired && r.source === source);
    if (group.every(r => !r.checkFailed && !r.pendingHash && !r.stale && r.lastContentCheckedAt > 0 &&
        Math.max(r.checkedVersion || 0, r.verifiedVersion || 0) >= (versions.get(r.params.book) || 0))) {
      window.__opmLiveSync?.confirmUnchanged?.(source);
    }
  }
  W.pendingSources = [...new Set(requests.filter(r => !r.retired &&
    (r.pendingHash || r.checkFailed || r.stale ||
      (versions.get(r.params.book) || 0) > Math.max(r.checkedVersion || 0, r.verifiedVersion || 0))).map(r => r.source))];
  if (!W.pendingSources.length && versions.size) W.appliedVer = Math.max(...versions.values());
  W.errors = W.lastError ? Math.min(4, W.errors + 1) : 0;
  const pendingNote = !W.lastError && W.pendingSources.length ?
    "جارٍ التحقق من " + W.pendingSources.length + " مصادر؛ آخر بيانات مؤكدة ما زالت معروضة." : "";
  window.__opmLiveSync?.reportWatchStatus?.(W.lastError || pendingNote, W.pendingSources);
  saveMetrics();
}
function tick(){clearTimeout(W.timer);if(paused)return Promise.resolve();if(W.running)return W.running;W.running=runTick().catch(e=>{W.lastError=String(e?.message||e)}).finally(()=>{W.running=null;if(!paused){const c=cadence(),soon=W.soonest&&isFinite(W.soonest)?Math.max(800,W.soonest-Date.now()):Infinity;W.soonest=0;W.cadence=Math.min(c,soon);W.timer=setTimeout(tick,W.cadence)}});return W.running}
function start(delay){clearTimeout(W.timer);if(!paused)W.timer=setTimeout(tick,delay+(delay>=1000?Math.floor(Math.random()*1500):0))}
window.__opmChangeWatcher={state:()=>({...W,running:!!W.running}),metrics:summary,sourceApplied(source){if(W.running||!W.pendingSources.includes(source))return;const consumerState=window.__opmLiveSync?.inspectSource?.(source);if(consumerState&&consumerState.status!=="ok")return;const group=entries().filter(row=>row.source===source);if(!group.length||!group.every(row=>!row.loading&&!row.stale&&!row.checkFailed&&!row.pendingHash&&row.lastContentCheckedAt>0&&row.verifiedVersion>=Math.max(row.retryVersion||0,row.pendingVersion||0)))return;W.pendingSources=W.pendingSources.filter(key=>key!==source);if(!W.pendingSources.length)W.lastError="";window.__opmLiveSync?.reportWatchStatus?.(W.lastError,W.pendingSources)},tick,refreshNow:()=>window.__opmLiveSync?.refreshAll?.(),pause:()=>{paused=true;clearTimeout(W.timer)}};
window.__opmSyncMetrics=summary;
document.addEventListener("visibilitychange",()=>{if(!document.hidden)start(1200)});document.addEventListener("elAuthStateChanged",e=>{if(e.detail&&!e.detail.locked)start(6e3)});window.addEventListener("online",()=>start(2500));document.addEventListener("click",e=>{if(e.target.closest?.("#opm-unified-summary"))requestAnimationFrame(paintMetrics)},true);start(12e3);
function paintClocks(){}function csvDownload(name,rows){const safe=v=>{const w=String(v??"");return/^[=+@\-]/.test(w)?"'"+w:w},csv="\ufeff"+rows.map((r=>r.map((v=>'"'+safe(v).replace(/"/g,'""')+'"')).join(","))).join("\r\n"),url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})),a=document.createElement("a");a.href=url,a.download=name,document.body.append(a),a.click(),a.remove(),setTimeout((()=>URL.revokeObjectURL(url)),4e3)}const PEOPLE_TITLE={all:"تسجيلنا · الأشخاص الفريدون",pending:"بانتظار النتيجة · الأشخاص",published:"النتائج التي ظهرت · الأشخاص"};function openPeople(kind){const api=window.__opmLabCards;if(!api?.ready?.())return void window.uiToast?.("بيانات تسجيلنا والمعمل لم تكتمل بعد.");const list=api.people(kind),fmt=api.fmt||(d=>d||"—"),per=api.period?.()||{};let dlg=$("opm150People");dlg||(dlg=document.createElement("dialog"),dlg.id="opm150People",dlg.dir="rtl",dlg.className="gs37-dialog opm150-people",document.body.append(dlg));const regs=list.reduce(((n,p)=>n+p.registrations.length),0),rowsHtml=q=>list.filter((p=>!q||(p.name+" "+p.sap+" "+p.nid).toLowerCase().includes(q))).slice(0,600).map((p=>`<tr><td><b>${esc(p.name||"—")}</b></td><td dir="ltr">${esc(p.sap||"—")}</td><td dir="ltr">${esc(p.nid||"—")}</td><td>${esc(p.types.join(" + ")||"—")}</td><td>${num(p.registrations.length)}</td><td>${p.registrations.map((r=>`<div class="opm150-reg"><span class="lab78-test ${String(r.type).toLowerCase()}">${esc(r.type)}</span> ${r.oursDate?"تسجيلنا "+esc(fmt(r.oursDate)):""}${r.labDate?" · المعمل "+esc(fmt(r.labDate)):""}${r.lab?" · "+esc(r.lab):""}${r.result?` · <b>النتيجة: ${esc(r.result)}</b>${r.resultDate?" ("+esc(fmt(r.resultDate))+")":""}`:r.note?` · <small>${esc(r.resultStatus)}</small>`:""}</div>`)).join("")}</td></tr>`)).join("")||'<tr><td colspan="6">لا توجد أسماء.</td></tr>';dlg.innerHTML=`<header><strong>${esc(PEOPLE_TITLE[kind]||"الأسماء")}</strong><button type="button" data-opm150-close aria-label="إغلاق">×</button></header><p class="opm150-people-meta">${num(list.length)} شخص · ${num(regs)} ${"all"===kind?"تسجيل":"تحليل"} · الفترة ${esc(fmt(per.from))} — ${esc(fmt(per.to))} · نفس فلاتر الصفحة الحالية</p><div class="opm150-people-tools"><input type="search" data-opm150-search placeholder="بحث بالاسم أو SAP أو الرقم القومي"><button type="button" data-opm150-export>تصدير CSV</button></div><div class="opm150-people-wrap"><table class="daily-table" data-excel-ready="1" data-ux-table="1"><thead><tr><th>الاسم</th><th>SAP</th><th>الرقم القومي</th><th>التحليل</th><th>العدد</th><th>التسجيلات والنتائج</th></tr></thead><tbody>${rowsHtml("")}</tbody></table></div>${list.length>600?"<small>يُعرض أول 600 شخص؛ التصدير يشمل الكل.</small>":""}`;dlg.querySelector("[data-opm150-close]").onclick=()=>dlg.close(),dlg.querySelector("[data-opm150-search]").oninput=e=>dlg.querySelector("tbody").innerHTML=rowsHtml(String(e.target.value||"").trim().toLowerCase()),dlg.querySelector("[data-opm150-export]").onclick=()=>csvDownload((PEOPLE_TITLE[kind]||"الأسماء").replace(/[^\p{L}\p{N}]+/gu,"_")+".csv",[["الاسم","SAP","الرقم القومي","التحليل","تاريخ تسجيلنا","تاريخ المعمل","المعمل","حالة النتيجة","النتيجة","تاريخ النتيجة"],...list.flatMap((p=>p.registrations.map((r=>[p.name,p.sap,p.nid,r.type,r.oursDate,r.labDate,r.lab,r.resultStatus,r.result,r.resultDate]))))]);dlg.showModal?dlg.showModal():dlg.setAttribute("open","")}document.addEventListener("click",(e=>{const b=e.target.closest?.("[data-lab150-people]");b&&(e.preventDefault(),e.stopPropagation(),openPeople(b.dataset.lab150People))}),!0);const PARSE_REASON={missing_date:"لا يوجد تاريخ تنفيذ أو نتيجة صالح في MOH",unknown_status:"حالة غير معروفة في MOH",before_2026:"تاريخ قبل 01/01/2026 (خارج نطاق المتابعة)",future_date:"تاريخ مستقبلي في MOH"};function labTrace(){const out=[],T=window.__opmTargetV44,year=d=>Number(String(d||"").slice(0,4))||0;for(const r of window.__mohLab?.rows?.()||[]){if(!r?.approved)continue;const type=String(r.type||"").toUpperCase(),val=String(r.result??"").trim(),base={type:type,nid:r.nid,sap:r.sap,name:r.name,result:val,execDate:r.execDate,resultDate:r.resultDate||"",lab:r.labLabel||r.lab||""};let reason="",ok=!1;if(!val)reason="معتمدة بدون قيمة في MOH — لا تُخترع نتيجة (مراجعة)";else if(window.isBadLabResult?.(val))reason="القيمة المسجلة لا تصلح كنتيجة";else if("identity-conflict"===r.matchState)reason="تعارض هوية: الرقم القومي مسجل لأكثر من SAP — لم تُربط";else if(!r.sap&&"unmatched"===r.matchState)reason="الرقم القومي غير موجود في العمالة";else{const g=T?.groupFor?.({sap:r.sap,nid:r.nid});if(!g)reason="غير موجود في بيانات المصفوفة";else if(!g.rows.some((x=>T.required(x,type))))reason="ظاهرة · التحليل غير مطلوب لهذا العامل",ok=!0;else{const d=T.decision({sap:g.sap,nid:g.nid,fit:"FIT"===type,psa:"PSA"===type},type,g.rows);d.closed?(ok=!0,reason="lab_approved"===d.code?"ظاهرة وتغلق الاستحقاق":"ظاهرة · الاستحقاق مغلق بدليل آخر: "+(d.label||"")):"identity_review"===d.code?reason="تعارض هوية في المصفوفة — مراجعة":d.requiredYear&&year(r.execDate)<d.requiredYear?reason="النتيجة لدورة أقدم من سنة الاستحقاق "+d.requiredYear:reason="لم تُغلق الاستحقاق — تحتاج مراجعة"}}r.dateFromResult&&(reason+=" · تاريخ التنفيذ غير مسجل فاستُخدم تاريخ النتيجة");out.push({...base,ok:ok,reason:reason,stage:"linking"})}const tr=window.__mohLab?.trace?.()||{rows:[]};for(const t of tr.rows)out.push({type:t.type,nid:t.nid,sap:"",name:t.name,result:t.result,execDate:t.execDate,ok:!1,reason:PARSE_REASON[t.reason]||t.reason,stage:"parse"});return out}function traceHtml(){const rows=labTrace(),info=window.__mohLab?.info?.()||{},ll=info.lossless||{},groups=new Map;for(const r of rows){const g=groups.get(r.reason)||{reason:r.reason,ok:r.ok,FIT:0,PSA:0};g[r.type]=(g[r.type]||0)+1,groups.set(r.reason,g)}const list=[...groups.values()].sort(((a,b)=>Number(a.ok)-Number(b.ok)||b.FIT+b.PSA-(a.FIT+a.PSA))),bad=rows.filter((r=>!r.ok)).length;return`<p>قراءة MOH: <b>${esc("lossless-moh"===info.mode?"مباشرة من الشيت بلا فقد":info.mode?info.mode:"—")}</b>${ll.sourceRows?` · صفوف الشيت ${num(ll.sourceRows)} · مطلوبة للموقع ${num(ll.kept)} · FIT معتمد ${num(ll.fitApproved)} (بلا قيمة ${num(ll.fitApprovedEmpty)}) · PSA معتمد ${num(ll.psaApproved)} (بلا قيمة ${num(ll.psaApprovedEmpty)})${ll.tolerantMatches?` · ${num(ll.tolerantMatches)} صف بحالة مكتوبة بصيغة مختلفة كان يُستبعد سابقًا`:""}`:""}</p><table class="opm-recon-table" data-excel-ready="1" data-ux-table="1"><thead><tr><th>مسار النتيجة المعتمدة</th><th>FIT</th><th>PSA</th></tr></thead><tbody>${list.map((g=>`<tr class="${g.ok?"ok":"warn"}"><td>${g.ok?"✓ ":"⚠ "}${esc(g.reason)}</td><td>${num(g.FIT)}</td><td>${num(g.PSA)}</td></tr>`)).join("")||'<tr><td colspan="3">لا توجد نتائج معتمدة محمّلة.</td></tr>'}</tbody></table><div class="opm-recon-actions"><button type="button" data-opm150-trace-export>تصدير التتبع (${num(rows.length)} صف · ${num(bad)} يحتاج مراجعة)</button></div>`}let traceOpen=!1;function ensureTrace(){const host=document.querySelector("#dailyLabDashboard .gs39-main");if(!host||host.querySelector("#opm150LabTrace"))return;const d=document.createElement("details");d.id="opm150LabTrace",d.className="v50-grades opm-recon opm150-trace",d.innerHTML='<summary><span>تتبع نتائج المعمل: MOH ← البوابة ← المعالجة ← الواجهة</span><b>سبب كل نتيجة لم تظهر</b><span class="v50-caret">⌄</span></summary><div class="opm-recon-body"></div>',d.addEventListener("toggle",(()=>{traceOpen=d.open,d.open&&(d.querySelector(".opm-recon-body").innerHTML=window.__OPM_PERF__?window.__OPM_PERF__.run("lab-trace",traceHtml):traceHtml())})),host.append(d),traceOpen&&(d.open=!0)}document.addEventListener("click",(e=>{e.target.closest?.("[data-opm150-trace-export]")&&(e.preventDefault(),csvDownload("تتبع_نتائج_المعمل.csv",[["التحليل","الاسم","الرقم القومي","SAP","النتيجة","تاريخ التنفيذ","تاريخ النتيجة","المعمل","ظاهرة؟","المرحلة","السبب"],...labTrace().map((r=>[r.type,r.name,r.nid,r.sap,r.result,r.execDate,r.resultDate||"",r.lab||"",r.ok?"نعم":"لا","parse"===r.stage?"قراءة MOH":"الربط والاستحقاق",r.reason]))]))}),!0);window.__opmLabTrace=labTrace;})();
