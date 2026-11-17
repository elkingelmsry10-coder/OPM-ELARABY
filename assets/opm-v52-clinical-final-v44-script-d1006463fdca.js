!function(){"use strict";var e=[{key:"scope",label:"منظار القولون",short:"أورام القولون",kicker:"الفحص المبكر",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2m6-16h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/><path d="M9 7c4 0 6 1 6 4s-2 4-6 4M15 7c-4 0-6 1-6 4s2 4 6 4M9 19v2M15 19v2"/></svg>',tone:"cyan"},{key:"prostate",label:"أورام البروستاتا",short:"أورام البروستاتا",kicker:"متابعة المسالك",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M9 6h6"/><path d="M8 10c-2.5 1-4 3.5-4 6.5C4 19.5 6 22 9 22h6c3 0 5-2.5 5-5.5 0-3-1.5-5.5-4-6.5"/><circle cx="12" cy="14" r="2.5"/></svg>',tone:"violet"},{key:"cervix",label:"عنق الرحم",short:"عنق الرحم",kicker:"صحة المرأة",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M12 13v5M9 21h6"/><path d="M9 8h6"/></svg>',tone:"rose"},{key:"lung",label:"أشعة الرئة",short:"أشعة الرئة",kicker:"الفحص المبكر",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8c-2.2 0-4 1.8-4 4v5c0 1.7 1.3 3 3 3h1.5c.8 0 1.5-.7 1.5-1.5V15c0-1.1.9-2 2-2h1"/><path d="M18 8c2.2 0 4 1.8 4 4v5c0 1.7-1.3 3-3 3h-1.5c-.8 0-1.5-.7-1.5-1.5V15c0-1.1-.9-2-2-2h-1"/><path d="M12 5v7"/></svg>',tone:"sky"},{key:"smoking",label:"الإقلاع عن التدخين",short:"الإقلاع عن التدخين",kicker:"الفحص الوقائي",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15h9l1.5-2H19"/><path d="M3 19h7"/><path d="M17 7c1.2-1.2 1.2-3.2 0-4.4"/><path d="M19.5 9c1.2-1.2 1.2-3.2 0-4.4"/><path d="M4 4l16 16"/></svg>',tone:"amber"}],t={key:"all",label:"كل الفحوصات الإكلينيكية",short:"النظرة الشاملة",kicker:"إجمالي الفحوصات",icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg>',tone:"mint"},a={requested:"مطلوب",referral:"تحويل لعمل منظار",inprogress:"قيد التنفيذ",done:"مكتمل / سليم",flag:"يستدعي متابعة",refused:"رفض الإجراء",unfit:"غير لائق صحيًا",other:"غير مصنف"},c={origin:"",key:"all",stages:[],site:"",residence:"",q:"",page:0,showAllRes:!1,sites:new Set,residences:new Set};function l(e){return String(e??"").replace(/[&<>"']/g,function(e){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[e]})}function i(e){return String(e??"").trim()}function r(e,t){var a=i(e).normalize("NFKC").replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/\s+/g," ").trim();return a?/رفض|رافض|refus/i.test(a)?"refused":/غير لائق/.test(a)?"unfit":"scope"===t&&/تحويل(?:\s+لعمل)?\s*(?:منظار|المنظار|لمنظار)|تحويل/.test(a)&&!/لم يتم التحويل|لا يوجد تحويل|غير محول/.test(a)?"referral":/جاري|جارٍ|قيد التنفيذ|تحت التنفيذ/.test(a)?"inprogress":/غير مطلوب|ليس مطلوب|مش مطلوب|لم يطلب|لا يحتاج/.test(a)?"other":/^(?:جديد|جديدة)$|مطلوب|جديد/.test(a)?"requested":/suspicion|positive|اشتباه|إيجاب|ايجاب/i.test(a)?"flag":/negative|normal|تم التنفيذ|تم تلقي|مكتمل|تمت|done|تم عمل/i.test(a)?"done":"other":"other"}var w=null;function clinicalSourceValue(value){return !!i(value)&&!/^(?:—|-|0|null|undefined|not needed|غير مطلوب|ليس مطلوب|لا يحتاج)$/i.test(i(value));}
function clinicalOrigin(row,key){return row.__clinicalOrigins?.[key]||'direct';}
function clinicalOriginText(row,key){return row.__clinicalReasons?.[key]||'مسجل ضمن بيانات الفحوصات';}
function s(key){
 const source=typeof DATA!=='undefined'&&Array.isArray(DATA)?DATA:[],rev=window.__dataRevision||0,region=window.__dashboardRegion||'all';
 if(!w||w.source!==source||w.master!==window.__ALL_DATA_MASTER||w.length!==source.length||w.revision!==rev||w.region!==region||w.first!==source[0]||w.last!==source[source.length-1]){
  const buckets=Object.create(null);buckets.all=[];e.forEach(service=>buckets[service.key]=[]);
  for(const original of source){
   const registeredServices=new Set(e.filter(service=>clinicalSourceValue(original[service.key])).map(service=>service.key));
   const outcomes={};
   for(const [service,type,field]of [['scope','FIT','fitResult'],['prostate','PSA','psaResult']])if(i(original[field]))outcomes[service]=window.__opmLabOutcome?.classify(type,original);
   if(!registeredServices.size&&outcomes.scope?.status!=='suspect'&&outcomes.prostate?.status!=='suspect')continue;
   const row={...original,__clinicalOrigins:{},__clinicalReasons:{}};
   for(const [service,type]of [['scope','FIT'],['prostate','PSA']]){
    const registered=registeredServices.has(service);
    const outcome=outcomes[service];
    const textRoute=registered&&new RegExp('(?:بعد|بسبب|نتيجة).*'+type,'i').test(String(original[service]));
    if(outcome?.status==='suspect'||textRoute){
     row.__clinicalOrigins[service]='lab';row.__clinicalReasons[service]=textRoute&&outcome?.status!=='suspect'?'إحالة مرتبطة بـ'+type+' حسب النص المسجل':type+' مرتفع / إيجابي · '+outcome.reason;
     if(!registered){row[service]='مطلوب تقييم بعد نتيجة '+type+' مرتفعة';registeredServices.add(service);}
    }else if(registered){row.__clinicalOrigins[service]='direct';row.__clinicalReasons[service]='مسجل بالفحوصات دون نتيجة '+type+' مرتفعة في البيانات الحالية';}
   }
   let any=false;
   for(const service of e)if(registeredServices.has(service.key)){buckets[service.key].push(row);any=true;}
   if(any)buckets.all.push(row);
  }
  w={source,master:window.__ALL_DATA_MASTER,length:source.length,revision:rev,region,first:source[0],last:source[source.length-1],buckets};
 }
 return w.buckets[key]||[];
}
function o(e){return i(e.workplace)||"غير محدد"}function d(e){try{if("function"==typeof geoValue){var t=geoValue(e,0);if(t&&"—"!==t&&"0"!==t)return String(t).trim()||"غير محدد"}}catch(e){}return"غير محدد"}function u(e){var t=null;try{"function"==typeof window.__referencePersonByIds&&(t=window.__referencePersonByIds(i(e&&e.sap),i(e&&e.nid),i(e&&e.workplace)))}catch(e){}function n(){for(var e=0;e<arguments.length;e++){var t=i(arguments[e]);if(t&&"—"!==t)return t}return"—"}var a="";try{a="function"==typeof __activityOf?__activityOf(e):""}catch(e){}return{activity:n(t&&t.activity,a,e&&e.activity),department:n(t&&t.department,e&&e.department,e&&e["الإدارة"],e&&e["الادارة"]),building:n(t&&t.building,e&&e.building,e&&e["المبنى"],e&&e["المبني"]),group:n(t&&t.group,e&&e.group,e&&e["المجموعة"]),job:n(e&&e.jobAr,e&&e.job,t&&t.job),org:n(e&&e.org,e&&e.org_depth,e&&e.orgDepth,t&&t.org),workplace:n(e&&e.workplace,t&&t.workplace),empStatus:n(e&&e.empStatus,t&&t.status)}}function p(t){return"all"===c.key?e.filter(e=>i(t[e.key])).map(e=>e.key):[c.key]}function g(e){return[...new Set(p(e).map(t=>r(e[t],t)))]}function h(t){const a=p(t);return a.find(e=>c.stages.includes(r(t[e],e)))||a[0]||e[0].key}function v(e,t){return!t.length||g(e).some(e=>t.includes(e))}function f(e){var t={};return e.forEach(function(e){var a=o(e),c=d(e);t[a]||(t[a]={site:a,total:0,residences:{}}),t[a].total++,t[a].residences[c]=(t[a].residences[c]||0)+1}),Object.keys(t).map(function(e){var a=t[e];return a.resList=Object.keys(a.residences).map(function(e){return{name:e,count:a.residences[e]}}).sort(function(e,t){return t.count-e.count}),a}).sort(function(e,t){return t.total-e.total})}function b(){var t="all"===c.key?"كل المتابعات":(e.find(function(e){return e.key===c.key})||{}).label||"فحص",w=Array.isArray(c.stages)?c.stages:[],_=w.length?w.map(function(e){return a[e]||e}).join(" + "):"كل المواقف",S="";return c.sites.size&&(S+=" · مواقع: "+[...c.sites].join("، ")),c.residences.size&&(S+=" · مراكز السكن: "+[...c.residences].join("، ")),t+" — "+_+(c.origin?' · '+(c.origin==='lab'?(c.key==='scope'?'FIT':'PSA')+' مرتفع':'مباشر / مسجل'):'')+S}function paintClinical() {
        if (document.body.dataset.activeTab !== "clinical" || document.body.dataset.activeInitiative === "chronic" || document.body.dataset.checkupsOpen === "1") return window.__clinicalNeedsRefresh = !0, 
        void 0;
        window.__clinicalMOH.ensure();
        var w = document.getElementById("clinicalFollowup");
        if (!w) return;
        const _ = JSON.stringify([ c.key, c.origin, c.stages, [ ...c.sites ], [ ...c.residences ], c.q, c.page, window.__orgFilters?.revision?.("clinical-report") || 0 ]), S = w.querySelector(".cl44-scroll"), x = w.__clinicalViewKey === _ && S ? [ S.scrollTop, S.scrollLeft ] : null;
        w.__clinicalViewKey = _;
        const M = w.querySelector("#cl44stageMulti"), A = !!M?.open, E = M?.querySelector(".cl44-stage-options")?.scrollTop || 0, q = document.activeElement, L = "cl44q" === q?.id, j = L ? q.selectionStart : null;
        var B = s("all"), R = e.map(function(e) {
            var t = s(e.key), a = {};
            t.forEach(function(t) {
                var c = r(t[e.key], e.key);
                a[c] = (a[c] || 0) + 1;
            });
            var c = a.done || 0, w = t.length, _ = w ? Math.round(c / w * 100) : 0;
            return {
                key: e.key,
                label: e.label,
                rows: t,
                st: a,
                count: w,
                done: c,
                pct: _
            };
        }), T = R.reduce(function(e, t) {
            return e + t.done;
        }, 0), C = R.reduce(function(e, t) {
            return e + t.count;
        }, 0), I = C ? Math.round(T / C * 100) : 0, z = B.length, O = ("all" === c.key ? B : s(c.key)).filter(row=>!c.origin||clinicalOrigin(row,c.key)===c.origin), F = function(e) {
            var t = {};
            return e.forEach(e => g(e).forEach(e => t[e] = (t[e] || 0) + 1)), [ "requested", "referral", "inprogress", "done", "flag", "refused", "unfit", "other" ].filter(e => t[e] > 0).map(e => ({
                key: e,
                label: a[e] || e,
                count: t[e]
            }));
        }(O), P = F.map(function(e) {
            return e.key;
        });
        c.stages = (Array.isArray(c.stages) ? c.stages : []).filter(function(e) {
            return -1 !== P.indexOf(e);
        });
        var D = c.stages.slice(), U = O.filter(e => !D.length || v(e, D));
        if (c.q) {
            const t = c.q.toLowerCase();
            U = U.filter(a => [ a.name, a.sap, a.nid, a.workplace, a.empStatus, a.fitResult, a.psaResult, geoValue(a, 1), geoValue(a, 0), window.__clinicalServiceDateText(a, h(a)), ...e.map(e => a[e.key]) ].join(" ").toLowerCase().includes(t));
        }
        const N = window.__orgFilters.apply("clinical-report", U), $ = new Map, H = new Map;
        for (const e of N) c.residences.size && !c.residences.has(d(e)) || $.set(o(e), ($.get(o(e)) || 0) + 1), 
        c.sites.size && !c.sites.has(o(e)) || H.set(d(e), (H.get(d(e)) || 0) + 1);
        U = U.filter(e => (!c.sites.size || c.sites.has(o(e))) && (!c.residences.size || c.residences.has(d(e))));
        var K = U.slice();
        U = window.__orgFilters.apply("clinical-report", U), c.page = Math.max(0, Math.min(c.page || 0, Math.max(0, Math.ceil(U.length / 150) - 1)));
        var W = f(N), J = '<div class="cl44 cl44-simple cl90-executive">', Y = {};
        var opm175MedicalIcons = {
            all: '<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.45" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="8" width="25" height="34" rx="4"/><path d="M19 7h11v6H19z"/><path d="m18 23 2 2 4-4m4 3h4m-14 8 2 2 4-4m4 3h4"/><path class="opm175-icon-detail" d="M34 5v6M31 8h6"/></svg>',
            scope: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 44v-5c0-5 3-8 7-9l5-1c1 0 2-1 2-3V16c0-2-1-3-3-3H16c-2 0-3 1-3 3v16c0 3-1 6-4 6s-4-3-4-6V16C5 9 9 5 16 5h16c7 0 11 4 11 11v10c0 6-3 10-9 11l-4 1c-1 0-2 1-2 3v3"/><path d="m8 38 3 5M5 20h4m-4 8h4m4-20 1 4m9-7v4m9-4-1 4m11 10h-4m4 8h-4m-4 10-1-4"/></svg>',
            prostate: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 7c-5 1-6 6-4 11 2 6 6 10 14 10s12-4 14-10c2-5 1-10-4-11-4-1-6 2-10 2s-6-3-10-2Z"/><path d="M14 5v3m20-3v3"/><path fill="currentColor" fill-opacity=".10" d="M24 29c-5-4-11-1-10 4 1 5 6 7 10 5 4 2 9 0 10-5 1-5-5-8-10-4Z"/><path d="M24 26v18M19 32c1-1 3-1 5 1 2-2 4-2 5-1"/></svg>',
            cervix: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="5" cy="15" rx="3" ry="4"/><ellipse cx="43" cy="15" rx="3" ry="4"/><path d="M8 14c2-6 6-7 10-3m22 3c-2-6-6-7-10-3M8 18c3 0 5-1 7-3m25 3c-3 0-5-1-7-3"/><path d="M15 14c3 3 6 2 9 2s6 1 9-2c1 6-1 12-5 16v4h-8v-4c-4-4-6-10-5-16Z"/><path d="M19 22c3 1 7 1 10 0m-5 0v12"/><rect class="opm188-cervix-detail" x="20" y="33" width="8" height="6" rx="2" fill="currentColor" fill-opacity=".15"/><path d="M20 39v5m8-5v5"/></svg>',
            lung: '<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7v16l-4 4M26 7v16l4 4M22 16l-7-5c-3-1-5 1-7 6-3 7-5 19-1 23 3 3 11 2 15-2V25m4-9 7-5c3-1 5 1 7 6 3 7 5 19 1 23-3 3-11 2-15-2V25"/><path class="opm175-icon-detail" d="M10 31c1-4 4-6 8-7m20 7c-1-4-4-6-8-7"/></svg>',
            smoking: '<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="19"/><path d="M10 38 38 10M11 28h17m4 0h5M15 24h12m5 0h4"/><path class="opm175-icon-detail" d="M28 15c0-2 3-3 3-6m4 10c0-2 3-3 3-6"/></svg>'
        };
        function opm175MedicalIcon(key) {
            return opm175MedicalIcons[key] || opm175MedicalIcons.all;
        }
        function clinicalOriginSelected(origin,key){return c.origin===origin&&c.key===key;}
        function V(e, t, a, c, w, _) {
            var S = Math.max(0, Math.min(100, Number(a) || 0)), r = 44, x = 2 * Math.PI * r, M = (S / 100 * x).toFixed(2) + " " + x.toFixed(2);
            const routes=['scope','prostate'].includes(e.key)?s(e.key):null;
            const wave='<svg class="opm175-medical-wave" viewBox="0 0 220 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 27h55l8-5 5 9 8-21 9 25 8-8h42l9-5 7 6 8-12 7 12h54"/></svg>';
            const card='<div role="button" tabindex="0" aria-label="' + l(e.short || e.label) + "، إجمالي " + Number(t).toLocaleString("en-US") + "، نسبة الإنجاز " + S + '%" class="fx-card cl90-fx-card opm166-clinical-card opm175-clinical-card fx-' + l(e.tone) + (w ? " active" : "") + '" aria-pressed="' + (w ? "true" : "false") + '" data-key="' + l(e.key) + '">' + '<div class="opm166-clinical-heading"><span class="opm166-clinical-icon" aria-hidden="true">' + opm175MedicalIcon(e.key) + '</span><span class="opm166-clinical-title">' + l(e.short || e.label) + "</span></div>" + '<div class="opm166-clinical-data"><strong class="opm166-clinical-total" dir="ltr">' + Number(t).toLocaleString("en-US") + '</strong><div class="opm166-clinical-progress" title="نسبة الإنجاز: ' + S + '%" aria-label="نسبة الإنجاز ' + S + '%"><svg viewBox="0 0 108 108" aria-hidden="true"><circle class="opm166-ring-track" cx="54" cy="54" r="44"/><circle class="opm166-ring-fill" cx="54" cy="54" r="44" stroke-dasharray="' + M + '" transform="rotate(-90 54 54)"/></svg><b dir="ltr">' + S + '%</b></div></div>'+(!routes?wave:'')+'</div>';
 if(!routes)return card;
 const type=e.key==='scope'?'FIT':'PSA';
 return '<div class="opm189-clinical-unit" data-clinical-unit="'+e.key+'">'+card+'<div class="opm189-clinical-routes" role="group" aria-label="مصدر متابعة '+l(e.short||e.label)+'">'+[['direct','مباشر / مسجل'],['lab',type+' مرتفع']].map(([origin,label])=>'<button type="button" data-clinical-origin="'+origin+'" data-clinical-service="'+e.key+'" aria-pressed="'+(clinicalOriginSelected(origin,e.key))+'" title="'+(origin==='direct'?'مسجل بالفحوصات دون تحليل مرتفع حالي؛ سبب الإحالة الأصلي قد لا يكون موثقًا':'مرتفع أو إيجابي حسب قاعدة التقييم، أو إحالة مرتبطة بالتحليل مسجلة صراحة')+'"><span>'+label+'</span><b>'+routes.filter(row=>clinicalOrigin(row,e.key)===origin).length.toLocaleString('en-US')+'</b></button>').join('')+'</div>'+wave+'</div>';
}
        R.forEach(function(e) {
            Object.keys(e.st).forEach(function(t) {
                Y[t] = (Y[t] || 0) + e.st[t];
            });
        }), J += '<div class="fx-grid cl90-fx-grid">', J += V(t, z, I, T, "all" === c.key, Y), 
        R.forEach(function(t) {
            var a = e.find(function(e) {
                return e.key === t.key;
            }) || {
                key: t.key,
                label: t.label,
                short: t.label,
                kicker: "فحص إكلينيكي",
                icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/></svg>',
                tone: "mint"
            };
            J += V(a, t.count, t.pct, t.done, c.key === t.key, t.st);
        }), J += "</div>";
        var G = O.length;
        J += '<div class="cl90-stage-ribbon opm175-status-ribbon" role="group" aria-label="شريط تصفية المواقف الإكلينيكية">', 
        F.forEach(function(e) {
            var t = -1 !== D.indexOf(e.key), a = G ? Math.round(e.count / G * 100) : 0;
            J += '<button type="button" class="cl90-stage-pill stage-' + l(e.key) + (t ? " active" : "") + '" data-ribbon-stage="' + l(e.key) + '"><span>' + l(e.label) + "</span><b>" + e.count.toLocaleString("en-US") + "</b><small>" + a + "%</small></button>";
        }), J += "</div>", J += window.__opmClinicalPlaces(W, c), J += '<div class="cl44-table-wrap"><div class="cl142-sticky">', 
        J += '<div class="cl44-tools fx-tools">', J += '<div class="cl44-tools-title"><b>قائمة الحالات</b><span>' + U.length.toLocaleString("en-US") + " شخص</span></div>", 
        J += '<div class="cl44-tools-row cl44-tools-row--focused">', J += '<label class="cl44-field cl139-search cl139-search--wide"><span>بحث</span><input id="cl44q" type="search" aria-label="البحث في الفحوصات" placeholder="اسم / SAP / رقم قومي / موقع" value="' + l(c.q) + '"/></label>', 
        J += '<div class="cl44-actions">', J += '<button type="button" id="cl44reset" class="cl44-reset">مسح</button>', 
        J += '<button type="button" id="clinicalReportExport" class="ref-clinical-export">تصدير Excel</button>', 
        J += "</div></div></div>";
        const Q = w.querySelector("#cl142Org")?.open, X = Object.values(window.__orgFilters.state("clinical-report")).reduce((e, t) => e + (t?.size || 0), 0);
        const dateState = window.__clinicalMOH.info();
        if (J += `<div class="cl142-filter-row cl142-filter-row--compact cl180-org-panel"><div class="cl180-org-controls"><div class="cl180-org-label">فلترة تنظيمية</div><div id="cl142Org" class="opm171-org-permanent" aria-label="الفلاتر التنظيمية"><div id="cl139Filters"></div></div><div class="cl180-date-action" title="${l(dateState.error || "تحديث تواريخ الفحوصات من MOH")}" data-moh-state="${dateState.error ? "error" : dateState.loading ? "loading" : "ready"}">${window.__clinicalMOH.statusHTML()}</div></div></div>`, 
        J += '<div class="cl44-scroll"><table><thead><tr><th>SAP</th><th>الاسم</th><th>الرقم القومي</th><th>الوظيفة</th><th>المجموعة</th><th>المبنى</th><th>الإدارة</th><th>النشاط</th><th>الدرجة الوظيفية</th><th>Work place</th><th>موقف التشغيل</th><th>رقم التليفون</th><th>مركز السكن</th><th>قرية السكن</th><th title="للمطلوب: أحدث تاريخ AY من صف جديد لنفس الرقم القومي ونفس الفحص في MOH">تاريخ فتح الخدمة</th><th>الإجراء</th><th>الحالة</th><th>FIT</th><th>PSA</th><th>مصدر المتابعة</th></tr></thead><tbody>', 
        U.length) {
            var Z = U.length;
            c.page = Math.max(0, Math.min(c.page || 0, Math.max(0, Math.ceil(Z / 150) - 1))), 
            U.slice(150 * c.page, 150 * (c.page + 1)).forEach(function(e) {
                var t = h(e), c = i(e[t]), w = r(c, t), _ = u(e);
                J += "<tr><td>" + l(e.sap || "—") + "</td><td>" + l(e.name || "—") + "</td><td>" + l(e.nid || "—") + "</td><td>" + l(_.job) + "</td><td>" + l(_.group) + "</td><td>" + l(_.building) + "</td><td>" + l(_.department) + "</td><td>" + l(_.activity) + "</td><td>" + l(_.org) + "</td><td>" + l(_.workplace) + "</td><td>" + l(_.empStatus) + "</td><td>" + l(e.phone || "—") + "</td><td>" + l(d(e)) + "</td><td>" + l("function" == typeof geoValue && geoValue(e, 1) || "غير محدد") + ' </td><td title="' + l(window.__clinicalServiceDateInfo(e, t)) + '">' + l(window.__clinicalServiceDateText(e, t)) + "</td><td>" + l(c || "—") + '</td><td><span class="cl44-stage ' + l(w) + '">' + l(a[w] || w) + "</span></td><td>" + l(e.fitResult || "—") + "</td><td>" + l(e.psaResult || "—") + "</td><td>" + l(clinicalOriginText(e,t)) + "</td></tr>";
            });
        } else J += '<tr><td colspan="20" style="text-align:center;padding:25px!important;color:#718b9c">لا توجد حالات مطابقة.</td></tr>';
        if (J += "</tbody></table></div>", J += '<div class="cl44-pager"><span>' + U.length.toLocaleString("en-US") + " شخص · صفحة " + ((c.page || 0) + 1) + " من " + Math.max(1, Math.ceil(U.length / 150)) + '</span><div><button type="button" id="cl44Prev" ' + (c.page ? "" : "disabled") + '>السابق</button><button type="button" id="cl44Next" ' + (150 * ((c.page || 0) + 1) >= U.length ? "disabled" : "") + ">التالي</button></div></div></div></div>", 
        window.__opmStableView.paint(w, J, ".cl44", {
            viewKey: _
        }), x) {
            const e = w.querySelector(".cl44-scroll");
            e && (e.scrollTop = x[0], e.scrollLeft = x[1]);
        }
        const ee = w.querySelector("#cl44stageMulti");
        if (ee && (ee.open = A, ee.querySelector(".cl44-stage-options").scrollTop = E), 
        L) {
            const e = w.querySelector("#cl44q");
            e.focus({
                preventScroll: !0
            }), null !== j && e.setSelectionRange(j, j);
        }
        document.getElementById("cl44Prev").onclick = () => {
            c.page = Math.max(0, (c.page || 0) - 1), y();
        }, document.getElementById("cl44Next").onclick = () => {
            c.page = (c.page || 0) + 1, y();
        };
        var te = w.querySelector(".cl44-scroll table");
        if (te) {
            window.__orgFilters.bind("clinical-report", te, () => K, y, () => window.exportClinicalReport(te));
            var ne = b(), ie = c.q, re = "بيان المواقع ومراكز السكن — " + b().split(" · ")[0];
            te.setAttribute("data-export-title", "متابعة الفحوصات والإحصائية"), te.__clinicalReport = function() {
                var e = [ [ "SAP", "الاسم", "الرقم القومي", "الوظيفة", "المجموعة", "المبنى", "الإدارة", "النشاط", "الدرجة الوظيفية", "Work place", "موقف التشغيل", "رقم التليفون", "مركز السكن", "قرية السكن", "تاريخ فتح الخدمة", "الإجراء", "الحالة", "FIT", "PSA", "مصدر المتابعة" ] ].concat(U.map(function(e) {
                    var t = i(e[h(e)]), c = window.__clinicalServiceDateText(e, h(e)), w = u(e);
                    return [ e.sap || "—", e.name || "—", e.nid || "—", w.job, w.group, w.building, w.department, w.activity, w.org, w.workplace, w.empStatus, e.phone || "—", d(e), "function" == typeof geoValue && geoValue(e, 1) || "غير محدد", c, t || "—", a[r(t, h(e))] || r(t, h(e)), e.fitResult || "—", e.psaResult || "—", clinicalOriginText(e,h(e)) ];
                }));
                return {
                    title: ne,
                    search: ie,
                    chartTitle: re,
                    people: e,
                    selectedStats: f(U),
                    chartStats: W
                };
            }, te.__exportData = function() {
                return te.__clinicalReport().people;
            };
        }
        w.querySelectorAll('[data-clinical-origin]').forEach(button=>button.onclick=event=>{event.stopPropagation();c.key=button.dataset.clinicalService;c.origin=c.origin===button.dataset.clinicalOrigin?'':button.dataset.clinicalOrigin;c.stages=[];c.page=0;y();});
        w.querySelectorAll("[data-chip-stage]").forEach(function(e) {
            e.onclick = function(t) {
                t.stopPropagation(), c.page = 0, c.key = e.getAttribute("data-chip-key") || "all";
                var a = e.getAttribute("data-chip-stage") || "";
                c.stages = a ? [ a ] : [], y();
            };
        }), w.querySelectorAll(".fx-card,[data-key].cl44-item").forEach(function(e) {
            e.onclick = function(t) {
                t.target.closest("[data-chip-stage]") || (c.page = 0, c.key = e.getAttribute("data-key") || "all", 
                c.origin = "", c.stages = [], c.site = "", c.residence = "", c.sites.clear(), c.residences.clear(), 
                y());
            };
        }), w.querySelectorAll(".opm175-clinical-card").forEach(function(el) {
            el.onkeydown = function(ev) {
                if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    el.click();
                }
            };
        }), w.querySelectorAll("[data-ribbon-stage]").forEach(function(e) {
            e.onclick = function() {
                c.page = 0;
                var t = e.getAttribute("data-ribbon-stage");
                "all" === t || 1 === c.stages.length && c.stages[0] === t ? c.stages = [] : c.stages = [ t ], 
                y();
            };
        }), w.onclick = event => {
            const button = event.target.closest?.("[data-site],[data-res-tier]");
            if (!button || !w.contains(button)) return;
            event.preventDefault();
            c.page = 0;
            if (button.hasAttribute("data-res-tier")) {
                const tier = button.dataset.resTier, names = [ ...H ].filter(([, count]) => (count >= 200 ? "top" : count >= 100 ? "high" : count >= 50 ? "mid" : "low") === tier).map(([name]) => name);
                if (!names.length) return;
                const remove = names.every(name => c.residences.has(name));
                for (const name of names) remove ? c.residences.delete(name) : c.residences.add(name);
            } else {
                const site = button.dataset.site || "", res = button.dataset.res || "";
                if (res) c.residences.has(res) ? c.residences.delete(res) : c.residences.add(res); else {
                    c.sites.has(site) ? c.sites.delete(site) : c.sites.add(site);
                    c.residences.clear();
                }
            }
            c.site = c.sites.size === 1 ? [ ...c.sites ][0] : "";
            c.residence = c.residences.size === 1 ? [ ...c.residences ][0] : "";
            y();
        };
        var ae = document.getElementById("cl90ToggleAllRes");
        ae && (ae.onclick = function() {
            c.showAllRes = !c.showAllRes, y();
        });
        var le = document.getElementById("cl44ClearSite");
        le && (le.onclick = function() {
            c.site = "", c.residence = "", c.sites.clear(), c.residences.clear(), y();
        });
        var se = document.getElementById("cl44q");
        se && (se.oninput = function() {
            c.q = this.value;
            c.page = 0;
            y();
        });
        var oe = document.getElementById("cl44stageMulti");
        oe && oe.querySelectorAll("input[data-stage-value]").forEach(function(e) {
            e.onchange = function() {
                c.page = 0;
                var e = this.getAttribute("data-stage-value");
                if ("all" === e) c.stages = []; else {
                    var t = (Array.isArray(c.stages) ? c.stages : []).slice();
                    this.checked ? -1 === t.indexOf(e) && t.push(e) : t = t.filter(function(t) {
                        return t !== e;
                    }), c.stages = t;
                }
                c.site = "", c.residence = "", c.sites.clear(), c.residences.clear(), y();
                var a = document.getElementById("cl44stageMulti");
                a && (a.open = !0);
            };
        }), window.__opmLocationFilters.mount({
            host: w,
            state: c,
            options: {
                sites: $,
                residences: H
            },
            onChange: () => {
                c.site = c.sites.size === 1 ? [ ...c.sites ][0] : "", c.residence = c.residences.size === 1 ? [ ...c.residences ][0] : "", 
                c.page = 0, y();
            }
        }), window.__clinicalLocationFilters = () => ({
            sites: [ ...c.sites ],
            residences: [ ...c.residences ]
        });
        var ce = document.getElementById("cl44reset");
        ce && (ce.onclick = function() {
            c = {
                key: "all",
                origin: "",
                stages: [],
                site: "",
                residence: "",
                q: "",
                page: 0,
                showAllRes: !1,
                sites: new Set,
                residences: new Set
            }, window.__orgFilters.clear("clinical-report"), window.__opmLocationFilters.close(), 
            y();
        });
    }
 var clinicalFrame=0,clinicalTicket=0,lastClinicalKey='',lastClinicalData=null,lastClinicalLength=-1,clinicalPaints=0,clinicalFailures=0;
 function clinicalActive(){return !document.documentElement.classList.contains('el-auth-locked')&&document.body.dataset.activeTab==='clinical'&&document.body.dataset.activeInitiative!=='chronic'&&document.body.dataset.checkupsOpen!=='1'}
 function clinicalKey(){const m=window.__clinicalMOH?.info?.()||{};return JSON.stringify([c.key,c.origin,c.stages,[...c.sites],[...c.residences],c.q,c.page,window.__dataRevision||0,window.__opmReferenceRevision||0,window.__dashboardRegion||'all',window.__banhaQalyoubSubFilter||'all',window.__orgFilters?.revision?.('clinical-report')||0,m.revision||0,m.loaded,!!m.error])}
 function y(){
  window.__clinicalNeedsRefresh=true;if(!clinicalActive()||clinicalFrame)return;
  const ticket=clinicalTicket;clinicalFrame=requestAnimationFrame(function(){
   clinicalFrame=0;if(ticket!==clinicalTicket||!clinicalActive())return;
   const data=typeof DATA!=='undefined'?DATA:[],key=clinicalKey(),host=document.getElementById('clinicalFollowup');
   if(!host)return;
   if(lastClinicalKey===key&&lastClinicalData===data&&lastClinicalLength===data.length&&host.querySelector('.cl44')){window.__clinicalNeedsRefresh=false;return}
   const started=performance.now();
   try{
    paintClinical();lastClinicalKey=clinicalKey();lastClinicalData=data;lastClinicalLength=data.length;
    clinicalPaints++;window.__clinicalNeedsRefresh=false;host.querySelector('[data-clinical-error]')?.remove();
   }catch(error){
    clinicalFailures++;window.__clinicalNeedsRefresh=true;
    let note=host.querySelector('[data-clinical-error]');if(!note){note=document.createElement('div');note.dataset.clinicalError='';note.setAttribute('role','alert');host.prepend(note)}
    note.textContent='تعذر تحديث عرض الفحوصات؛ آخر عرض متاح محفوظ. أعد التحديث من زر تحديث البيانات.';
    console.warn('Clinical render failed',{name:error.name||'Error'});
   }finally{window.__clinicalPerformance={paints:clinicalPaints,failures:clinicalFailures,lastRenderMs:Math.round(performance.now()-started)}}
  });
 }
 document.addEventListener('dashboardTabChanged',function(){if(!clinicalActive()){clinicalTicket++;if(clinicalFrame)cancelAnimationFrame(clinicalFrame);clinicalFrame=0;window.__clinicalNeedsRefresh=true}else y()});
 document.addEventListener('dashboardRegionChanged',y);
 document.addEventListener('clinicalMohUpdated',y);
 document.addEventListener('elAuthStateChanged',function(e){if(e.detail?.locked){clinicalTicket++;if(clinicalFrame)cancelAnimationFrame(clinicalFrame);clinicalFrame=0;lastClinicalKey='';lastClinicalData=null;lastClinicalLength=-1;const host=document.getElementById('clinicalFollowup');host?.replaceChildren()}else y()});
function k(){var e=document.getElementById("clinicalPanel");if(e){var t=e.querySelector(":scope > h2");t&&(t.textContent="متابعة الفحوصات"),y()}}function m(){try{var e=document.querySelector('[data-dashboard-pane="clinical"]');e&&(e.classList.contains("active")||"block"===e.style.display)?y():window.__clinicalNeedsRefresh=!0}catch(e){}}document.addEventListener("dataUpdated",function(){w=null;y()}),window.renderClinical=y,window.__renderClinicalLocked=y,window.__clinicalFilter=function(e,t){c.page=0,c.key=e||"all",c.stages=t&&"all"!==t?[t]:[],c.site="",c.residence="",y()},document.addEventListener("click",e=>{const t=document.getElementById("cl44stageMulti");t?.open&&!e.composedPath().includes(t)&&(t.open=!1)}),document.addEventListener("keydown",e=>{if("Escape"===e.key){const e=document.getElementById("cl44stageMulti");e?.open&&(e.open=!1,e.querySelector("summary").focus())}}),document.addEventListener("referenceWorkforceUpdated",m),document.addEventListener("lookupUpdated",function(e){e.detail&&!1===e.detail.loaded||m()}),"loading"===document.readyState?document.addEventListener("DOMContentLoaded",k):k(),setTimeout(k,100)}();