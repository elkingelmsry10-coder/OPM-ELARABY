(()=>{"use strict";const $=e=>document.getElementById(e),e=["قويسنا","بنها_قليوب","باقي_المواقع","unknown"],o={"قويسنا":"قويسنا","بنها_قليوب":"بنها وقليوب","باقي_المواقع":"باقي المواقع",unknown:"غير مربوط بمنطقة",all:"الإجمالي"},text=e=>String(e??"").trim(),norm=e=>text(e).normalize("NFKC").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").toLowerCase(),id=e=>window.__opmNormalizeId(e),day=e=>window.__opmDate.parse(e,"dmy"),esc=e=>text(e).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[e])),num=e=>e===null||e===void 0?"—":Number(e).toLocaleString("en-US"),pct=(e,o)=>o?Math.min(100,e/o*100):0,percent=(e,o)=>o?pct(e,o).toLocaleString("en-US",{maximumFractionDigits:1})+"%":"—",fmt=e=>e?e.split("-").reverse().join("/"):"—",today=()=>{const e=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Cairo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date).map(e=>[e.type,e.value]));return e.year+"-"+e.month+"-"+e.day};let t=null,a=0,n=!1,i=!0,s=!1,d=null;const c=[];function inputs(){const e=window.chronicGetAllRows,o=window.chronicRowCount?.()||0;return d&&d.revision===a&&d.getter===e&&d.count===o||(d={revision:a,getter:e,count:o,rows:e?.()||c,headers:window.chronicGetHeaders?.()||c}),{reference:window.__REFERENCE_WORKFORCE__||c,referenceReady:!!window.__REFERENCE_WORKFORCE_READY__,master:window.__ALL_DATA_MASTER||c,sources:window.__CHECKUP_EXECUTION_STATE__||{},snapshot:window.__opmLabExecutive?.snapshot(),labs:window.__mohLab?.rows?.()||c,labInfo:window.__mohLab?.info?.()||{},chron:d.rows,headers:d.headers}}function facts(){const o=inputs(),n=[o.reference,o.reference.length,o.referenceReady,window.__opmReferenceRevision,o.master,o.master.length,window.__dataRevision,o.sources,o.snapshot?.key,o.labs,o.chron,o.headers,a,window.__regionBasis,window.__banhaQalyoubSubFilter,window.__dashboardRegion,today()];if(t&&n.every((e,o)=>e===t.sig[o]))return t;const i=new Map,r=new Map,s=new Map,d=new WeakMap,l=new WeakMap,c=[],p=[],u=today();function addIndex(e,o,t){if(!o)return;let a=e.get(o);a||e.set(o,a=[]),a.push(t)}for(let e=0;e<o.master.length;e++){const t=o.master[e],a=id(t.sap||t.SAP),n=id(t.nid||t.nationalId||t["الرقم القومي"]),d=a||n?a+"|"+n:"row:"+e;let l=s.get(d);l||(l={...t,sap:a,nid:n,surveyDates:new Set},s.set(d,l),addIndex(i,a,l),addIndex(r,n,l)),!l.workplace&&t.workplace&&(l.workplace=t.workplace);const c=day(t.date||t["تاريخ الاستبيان"]||t["التاريخ"]||t.surveyDate||t.survey_date);c&&c<=u&&(typeof window.done!=="function"||window.done(t))&&l.surveyDates.add(c)}for(const[e,o]of[...s]){const t=o.sap&&!o.nid?(i.get(o.sap)||[]).filter(e=>e.nid):o.nid&&!o.sap?(r.get(o.nid)||[]).filter(e=>e.sap):[];if(t.length===1){const a=t[0];for(const e of o.surveyDates)a.surveyDates.add(e);a.workplace||(a.workplace=o.workplace),s.delete(e)}}i.clear(),r.clear();for(const e of s.values())addIndex(i,e.sap,e),addIndex(r,e.nid,e);const f=new Map,g=new Map,w=new Map;if(o.referenceReady)for(let e=0;e<o.reference.length;e++){const t=o.reference[e],a=id(t.sap||t.SAP),n=id(t.nid||t.nationalId),i=a?"s:"+a:n?"n:"+n:"row:"+e,r=w.get(i);r?r.nid&&n&&r.nid!==n&&(r.identityConflict=!0):w.set(i,{...t,sap:a,nid:n})}for(const e of w.values())addIndex(f,e.sap,e),addIndex(g,e.nid,e);function resolve(o,t="oncology"){const a=t==="reference",n=a?l:d,s=a?f:i,c=a?g:r;if(n.has(o))return n.get(o);const p=id(o.sap||o.SAP),u=id(o.nid||o.nationalId),w=p&&s.get(p)||[],v=u&&c.get(u)||[],m=(p?w:v).filter(e=>(!p||e.sap===p)&&(!u||!e.nid||e.nid===u)),y=m.length===1?m[0]:null,b=w.some(e=>e.identityConflict)||p&&u&&(w.some(e=>e.nid&&e.nid!==u)||v.some(e=>e.sap&&e.sap!==p)),h=y&&!b?{...y,...Object.fromEntries(Object.entries(o).filter(([,e])=>e!==""&&e!=null))}:o,_=text(h.workplace||h.workPlace||h["موقع العمل"]),k=text(h.empStatus);let x=_||"emp"===window.__regionBasis&&k?window.__regionOf(h):"unknown";x==="other"&&(x="باقي_المواقع"),e.includes(x)||(x="unknown");const E=!window.__singleTown?.()||x!=="بنها_قليوب"||!1!==window.__townMatches?.(h),P={region:x,town:E,person:h,linked:!!y,conflict:!!b};return n.set(o,P),P}function record(e,o,t,a,n={}){if(t=day(t),!t||t>u)return;const i=resolve(o,["periodic","initiative","periodicBooking","repeat","otherBooking","initiativeBooking"].includes(e)?"reference":"oncology");i.town&&(c.push({kind:e,region:i.region,date:t,key:a,personKey:window.__opmPersonKey?.(o)||"",inWorkforce:i.linked,...n}),p.push({date:t,region:n.region||i.region}))}const v=new Map;for(const[e,o]of s){const t=resolve(o);if(!t.town)continue;const a=o.sap?"s:"+o.sap:o.nid?"n:"+o.nid:e,n=v.get(a);n?((n.region!==t.region||n.nid&&o.nid&&n.nid!==o.nid)&&(n.region="unknown"),n.people.push(o)):v.set(a,{key:a,region:t.region,nid:o.nid,people:[o]})}const m=[...w].map(([e,o])=>({key:e,...resolve(o,"reference")})).filter(e=>e.town),y=[...v.values()].map(({key:e,region:o})=>({key:e,region:o}));for(const e of v.values())for(const o of e.people)for(const t of o.surveyDates)record("surveys",o,t,e.key,{region:e.region});const b=o.sources;for(const e of["periodic","initiative"]){for(const[o,t]of b[e]?.dateCounts||[])for(const a of t)record(e,{sap:id(a)},o,id(a));if(e==="periodic")for(const[e,o]of b.periodic?.bookingProtocolDates||[])for(const t of["periodic","repeat","other"])for(const a of o[t]||[]){const o=id(text(a).replace(/^s:/,""));record(t==="periodic"?"periodicBooking":t==="repeat"?"repeat":"otherBooking",{sap:o},e,o+"|"+e)}else for(const[e,o]of b.initiative?.bookingDateCounts||[])for(const t of o){const o=id(text(t).replace(/^s:/,""));record("initiativeBooking",{sap:o},e,o+"|"+e)}}const col=e=>o.headers.findIndex(o=>e.some(e=>norm(e)===norm(o))),h={sap:col(["sap","الساب"]),nid:col(["الرقم القومي","nationalId","nid"]),date:col(["التاريخ","date","تاريخ الزيارة","تاريخ الكشف"]),site:col(["الموقع","موقع العمل","مكان العمل","workplace"]),user:col(["اليوزر","user"])};o.chron.forEach((e,o)=>{const t={sap:e[h.sap],nid:e[h.nid],workplace:e[h.site]||e[h.user]};record("chronic",t,e[h.date],(id(t.sap)||id(t.nid)||"row:"+o)+"|"+day(e[h.date]))});const _=new Map,k=new Map,x=new Set((o.snapshot?.events||[]).filter(e=>["done","drawn"].includes(e.stage)).map(e=>[e.type,id(e.sap),id(e.nid),day(e.date)].join("|")));for(const e of o.snapshot?.events||[]){const o=[e.type,id(e.sap),id(e.nid),day(e.date)].join("|");if(["done","drawn"].includes(e.stage)||x.has(o))continue;const t=e.stage==="refused"?k:_,a=t.get(o);a&&e.stage!=="started"||t.set(o,e)}for(const[e,o]of _)record(o.stage==="started"?"started":"tubes",o,o.date,e);for(const[e,o]of k)record("refused",o,o.date,e);const E=new Map;for(const e of o.snapshot?.labs||[]){const o=[e.type,id(e.sap),id(e.nid),e.date].join("|")+(id(e.sap)||id(e.nid)?"":"|row:"+e.index),t=!!window.__opmLabExecutive.hasApprovedResult(e),a=E.get(o);a&&!t||E.set(o,{lab:e,approved:t})}for(const[e,{lab:o,approved:t}]of E)record("lab",o.raw?{...o.raw,sap:o.sap,nid:o.nid}:o,o.date,e,{type:o.type,approved:t});const P={reference:o.referenceReady,master:o.master.length>0,periodic:!!b.periodic?.ready,initiative:!!b.initiative?.ready,chronic:!!window.chronicIsLoaded?.(),ours:!!o.snapshot,lab:!!o.snapshot};return t={sig:n,input:o,population:y,referencePopulation:m,events:c,dates:p,ready:P,resolve:resolve,reports:new Map},t}function latest(e=$("dailyOpRegion")?.value||"all"){return facts().dates.filter(o=>e==="all"||o.region===e).reduce((e,o)=>o.date>e?o.date:e,"")}const p=["referencePopulation","population","surveys","surveyCumulative","periodic","periodicCumulative","periodicBooking","repeat","periodicTotal","otherBooking","initiative","initiativeCumulative","initiativeBooking","chronic","ours","oursFit","oursPsa","tubes","started","refused","lab","labFit","labPsa","approved","pending","matched","missing","conflicts"];function aggregate(o,t){const a=facts(),n=t||today(),i=o||"0000-01-01",r=i+"|"+n;if(a.reports.has(r))return a.reports.get(r);const inside=e=>e>=i&&e<=n,s=Object.fromEntries(e.map(e=>[e,Object.fromEntries(p.map(e=>[e,new Set]))]));for(const e of a.population)s[e.region].population.add(e.key);for(const e of a.referencePopulation)s[e.region].referencePopulation.add(e.key);for(const e of a.events){const o=s[e.region];e.date<=n&&(e.kind==="surveys"||e.inWorkforce&&["periodic","initiative"].includes(e.kind))&&o[e.kind==="surveys"?"surveyCumulative":e.kind+"Cumulative"].add(e.key),inside(e.date)&&(o[e.kind]?.add(e.key),e.kind==="lab"&&(o[e.type==="FIT"?"labFit":"labPsa"].add(e.key),o[e.approved?"approved":"pending"].add(e.key)))}const d=window.__opmLabExecutive?.compare(i,n)||[];for(const e of d){const o=e.excel;if(!o||!inside(o.doneDate||o.date))continue;const t=a.resolve(o);if(!t.town)continue;const n=s[t.region],i=[o.type,id(o.sap),id(o.nid),o.doneDate||o.date].join("|");n.ours.add(i),n[o.type==="FIT"?"oursFit":"oursPsa"].add(i),n[e.lab?"matched":"missing"].add(i),e.identityWarning&&n.conflicts.add(i)}const l={};for(const o of e)l[o]=Object.fromEntries(p.map(e=>[e,s[o][e].size]));l.all=Object.fromEntries(p.map(o=>[o,e.reduce((e,t)=>e+l[t][o],0)]));for(const e of Object.values(l))e.periodicTotal=e.periodicBooking+e.repeat,e.labs=e.lab,e.fit=e.labFit,e.psa=e.labPsa;const c={regions:l,ready:a.ready,input:a.input,from:o,to:t};return a.reports.size>=40&&a.reports.delete(a.reports.keys().next().value),a.reports.set(r,c),c}function chosenKeys(o,t){return t==="all"?e.filter(e=>e!=="unknown"||p.some(t=>o.regions[e][t])):[t]}function render() {
  const panel = $("dailyRegionalOperationsPanel");
  if (!panel || document.body.dataset.activeTab !== "regionalDaily") return;
  const region = $("dailyOpRegion").value || "all", from = $("dailyOpDateFrom"), to = $("dailyOpDateTo");
  if (i) from.value = to.value = latest(region);
  if (from.value && to.value && from.value > to.value) [from.value, to.value] = [to.value, from.value];
  const report = aggregate(from.value, to.value);
  const {regions, ready, input} = report, counts = regions[region] || regions.all;
  const value = (key, source = key, data = counts) => ready[source] ? data[key] : null;
  const dateLabel = from.value === to.value ? fmt(from.value) :
    (from.value ? fmt(from.value) : "بداية البيانات") + " — " + fmt(to.value || today());
  $("dailyRegionalLastDay").textContent = i && !from.value ? "لا يوجد يوم عمل مسجل" :
    from.value || to.value ? dateLabel + (i ? " · آخر يوم عمل" : "") : "كل الفترات";

  const stale = !!(input.sources.cached || input.sources.error || input.snapshot?.info && !input.snapshot.info.fresh) ||
    [...window.__opmGatewayRequests?.values() || []].some(request => !request.retired &&
      (!request.endpoint || request.endpoint === window.OPM_GATEWAY_URL) &&
      ["checkup", "reference", "lab", "labRefs", "chronic"].includes(request.source) &&
      (request.stale || request.checkFailed));
  const complete = Object.values(ready).every(Boolean);
  const sourceLabel = complete ? stale ? "آخر بيانات مؤكدة" : "المصادر متاحة" : "بعض المصادر قيد التحميل أو التحقق";
  $("dailyRegionalSourceState").innerHTML =
    `<span class="executive-source-badge${!complete || stale ? " pending" : ""}">${sourceLabel}</span>` +
    `<span>التغطية حتى <bdi>${fmt(to.value || today())}</bdi></span>`;

  const kpis = [
    {label:"حجوزات الدوري والتردد", main:value("periodicTotal","periodic"), tone:"blue",
      parts:[["دوري",value("periodicBooking","periodic")],["تردد",value("repeat","periodic")],["منفّذ",value("periodic")]]},
    {label:"حجوزات المبادرة", main:value("initiativeBooking","initiative"), tone:"violet",
      parts:[["مسجلون",value("initiative")],["كشف المزمنة",value("chronic")]]},
    {label:"الاستبيانات المنفّذة", main:value("surveys","master"), tone:"teal",
      parts:[["التغطية",ready.master ? percent(counts.surveyCumulative,counts.population) : "—"],["العمالة",value("population","master")]]},
    {label:"عيناتنا المؤكّدة", main:value("ours"), tone:"amber",
      parts:[["FIT",value("oursFit","ours")],["PSA",value("oursPsa","ours")]]},
    {label:"تسجيل المعمل", main:value("lab"), tone:"blue",
      parts:[["معتمدة",value("approved","lab")],["نسبة الاعتماد",ready.lab ? percent(counts.approved,counts.lab) : "—"]]}
  ];
  $("ex143Kpis").innerHTML = kpis.map(({label,main,tone,parts}) =>
    `<article class="executive-kpi" data-series="${tone}"><h3>${label}</h3><strong dir="ltr">${num(main)}</strong>` +
    `<dl>${parts.map(([name,amount]) => `<div><dt>${name}</dt><dd dir="ltr">${typeof amount === "string" ? esc(amount) : num(amount)}</dd></div>`).join("")}</dl></article>`
  ).join("");

  const followups = [
    ["عينات تحتاج تسجيل المعمل", value("missing","ours")],
    ["نتائج تنتظر الاعتماد", value("pending","lab")],
    ["موظفون متبقون للاستبيانات", ready.master ? Math.max(0, counts.population - counts.surveyCumulative) : null]
  ];
  $("regionalDecision").innerHTML = followups.map(([label,amount]) =>
    `<div><span>${label}</span><strong dir="ltr"${amount > 0 ? ' class="attention"' : ""}>${num(amount)}</strong></div>`
  ).join("");

  $("ex143Population").textContent =
    "الأورام " + num(value("population","master")) + " · الدوري والمبادرة " + num(value("referencePopulation","reference"));
  const measures = [
    ["الاستبيانات", "teal", counts.surveyCumulative, counts.population, ready.master],
    ["الدوري", "blue", counts.periodicCumulative, counts.referencePopulation, ready.periodic && ready.reference],
    ["المبادرة", "violet", counts.initiativeCumulative, counts.referencePopulation, ready.initiative && ready.reference]
  ];
  $("ex143Coverage").innerHTML = measures.map(([label,tone,done,target,available]) =>
    measure(label, available ? percent(done,target) : "—", tone,
      available ? num(done) + " / " + num(target) : "", available ? pct(done,target) : 0)
  ).join("");

  $("ex143MatchRate").innerHTML = ready.ours ? "المطابقة <bdi>" + percent(counts.matched,counts.ours) + "</bdi>" : "بانتظار بيانات العينات";
  const journey = [
    ["تسجيلنا المؤكّد", "teal", counts.ours, 100, "عينات في الفترة"],
    ["مسجل بالمعمل", "teal", counts.matched, pct(counts.matched,counts.ours), "عينات في الفترة"],
    ["تسليم أنابيب FIT", "blue", counts.tubes, null, "عدد الأنابيب"]
  ];
  $("ex143Journey").innerHTML = journey.map(([label,tone,amount,progress,detail]) =>
    measure(label, num(ready.ours ? amount : null), tone, detail,
      progress === null ? null : ready.ours && counts.ours ? progress : 0)
  ).join("");

  function cell(amount, detail = "") {
    return `<td><strong dir="ltr">${num(amount)}</strong>${detail ? `<small>${detail}</small>` : ""}</td>`;
  }
  $("drpMatrixRows").innerHTML = chosenKeys(report, region).concat(region === "all" ? ["all"] : []).map(key => {
    const data = regions[key];
    const get = (field, source) => value(field, source, data);
    const regionLabel = key === "all" || region !== "all" ? esc(o[key]) :
      `<button type="button" data-ex-region="${key}" title="عرض ${esc(o[key])}">${esc(o[key])}</button>`;
    const population = `أورام <bdi>${num(get("population","master"))}</bdi> · مرجعية <bdi>${num(get("referencePopulation","reference"))}</bdi>`;
    return `<tr${key === "all" ? ' class="total"' : ""}><th scope="row">${regionLabel}<small>${population}</small></th>` +
      cell(get("periodicTotal","periodic"), `دوري ${num(get("periodicBooking","periodic"))} · تردد ${num(get("repeat","periodic"))}`) +
      cell(get("periodic")) +
      cell(get("initiativeBooking","initiative"), "مسجلون " + num(get("initiative"))) +
      cell(get("surveys","master")) +
      cell(get("ours"), `<bdi>FIT ${num(get("oursFit","ours"))}</bdi> · <bdi>PSA ${num(get("oursPsa","ours"))}</bdi>`) +
      cell(get("lab"), "مطابق " + num(get("matched","ours"))) +
      cell(get("approved","lab"), ready.lab ? percent(data.approved,data.lab) : "") + "</tr>";
  }).join("");
  $("ex143Table").__exportData = () => exportData(report, region);
  window.__dailyRegionalSummary = regions;
  window.__opmExecutiveReport = {...report, scope: region};
}

function measure(label, amount, tone, detail, progress) {
  return `<div class="executive-measure" data-series="${tone}"><span>${label}</span><strong dir="ltr">${esc(amount)}</strong>` +
    `<small dir="auto">${detail || "بانتظار المصدر"}</small>` +
    (progress === null ? "" : `<div class="executive-track" aria-hidden="true"><i style="inline-size:${progress}%"></i></div>`) +
    "</div>";
}

function exportData(e,t){const{ready:a,regions:n}=e,i=[["population","master"],["surveys","master"],["periodic","periodic"],["periodicBooking","periodic"],["repeat","periodic"],["periodicTotal","periodic"],["initiative","initiative"],["initiativeBooking","initiative"],["chronic","chronic"],["ours","ours"],["oursFit","ours"],["oursPsa","ours"],["lab","lab"],["approved","lab"],["pending","lab"],["matched","ours"],["missing","ours"],["referencePopulation","reference"]];return[["المنطقة","عمالة الأورام","الاستبيانات في الفترة","الدوري SAP","حجز دوري","تردد","إجمالي الدوري والتردد","المبادرة SAP","حجز المبادرة","كشف المزمنة","عيناتنا المؤكدة","FIT عندنا","PSA عندنا","المعمل في الفترة","معتمد","غير معتمد","مطابق لعيناتنا","يحتاج تسجيل المعمل","عمالة الدوري والمبادرة","من","إلى"],...chosenKeys(e,t).concat(t==="all"?["all"]:[]).map(t=>[o[t],...i.map(([e,o])=>a[o]?n[t][e]:"غير متاح"),e.from||"بداية البيانات",e.to||today()])]}function schedule(){n||(n=!0,requestAnimationFrame(()=>{n=!1,render()}))}function setPreset(e){i=e==="latest",window.__dailyRegionalFollowLatest=i;const o=today(),t=e==="month"?o.slice(0,8)+"01":e==="week"?(()=>{const e=new Date(o+"T12:00:00Z");return e.setUTCDate(e.getUTCDate()-(e.getUTCDay()+1)%7),e.toISOString().slice(0,10)})():e==="today"?o:"";i||($("dailyOpDateFrom").value=t,$("dailyOpDateTo").value=e==="all"?"":o),document.querySelectorAll("[data-daily-preset]").forEach(o=>o.setAttribute("aria-pressed",String(o.dataset.dailyPreset===e))),render()}async function ensure(){if(!s&&document.body.dataset.activeTab==="regionalDaily"){s=!0;try{const e=[];window.__REFERENCE_WORKFORCE_READY__||e.push(Promise.resolve().then(()=>window.loadLookupSheet?.(!1))),window.__CHECKUP_EXECUTION_STATE__?.loaded||e.push(Promise.resolve().then(()=>window.loadCheckupSourceSheets?.(!1))),window.__opmLabExecutive?.snapshot()||e.push(Promise.resolve().then(()=>window.__opmEnsureLabSources?.())),await Promise.allSettled(e)}finally{s=!1,schedule()}}}function init(){const o=$("dailyRegionalOperationsPanel");if(!o)return;const t=$("dailyOpRegion");t.value=e.includes(window.__dashboardRegion)?window.__dashboardRegion:"all",o.addEventListener("click",e=>{const o=e.target.closest("[data-daily-preset]");o&&setPreset(o.dataset.dailyPreset);const n=e.target.closest("[data-ex-region]");n&&(t.value=n.dataset.exRegion,render(),t.focus())});for(const e of[$("dailyOpDateFrom"),$("dailyOpDateTo")])e.addEventListener("change",()=>{e.validity.valid&&(i=!1,window.__dailyRegionalFollowLatest=!1,document.querySelectorAll("[data-daily-preset]").forEach(e=>e.setAttribute("aria-pressed","false")),render())});t.addEventListener("change",render),$("ex143Export").addEventListener("click",async()=>{const e=window.__opmExecutiveReport;if(e)try{await(window.__ensureExportLibraries?.());const o=XLSX.utils.book_new();XLSX.utils.book_append_sheet(o,XLSX.utils.aoa_to_sheet(exportData(e,e.scope)),"الموقف التنفيذي"),await window.__downloadReadyExcel(o,"الموقف_التنفيذي_"+(e.to||today())+".xlsx")}catch(e){window.uiToast?.("تعذر تجهيز التقرير: "+e.message)}});for(const e of["dataUpdated","referenceWorkforceUpdated","lookupUpdated","checkupSourcesUpdated","mohLabUpdated","chronicDataUpdated","opmLabSnapshotUpdated"])document.addEventListener(e,()=>{a++,schedule()});document.addEventListener("opmGatewaySettled",schedule),document.addEventListener("dashboardRegionChanged",()=>{const o=window.__dashboardRegion||"all";t.value=e.includes(o)?o:"all",a++,schedule()}),new MutationObserver(()=>{document.body.dataset.activeTab==="regionalDaily"&&(schedule(),ensure())}).observe(document.body,{attributes:!0,attributeFilter:["data-active-tab"]}),setPreset("latest"),ensure()}window.__opmLatestWorkDay=latest,window.setDailyRegionalPreset=setPreset,window.renderDailyRegionalData=render,window.__opmExecutive={facts:facts,aggregate:aggregate,latest:latest,exportData:exportData},document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init,{once:!0}):init()})();
