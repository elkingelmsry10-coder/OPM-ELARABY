!function(){"use strict";
let activitySource=null, activityRef=-1, activityMap=null;
let scopeInput=null, scopeRows=null, scopeKey="", scopeRevision="", scopeDirty=false;
let unspecifiedTown=null;
function canPaint() {
  return !document.hidden && !document.documentElement.classList.contains("el-auth-locked") &&
    document.body?.dataset.checkupsOpen !== "1";
}
if(!window.__RADICAL_NAV_V1__){window.__RADICAL_NAV_V1__=!0;var e=["all","قويسنا","بنها_قليوب","باقي_المواقع"],t={all:"كل المواقع","قويسنا":"قويسنا","بنها_قليوب":"بنها + قليوب","باقي_المواقع":"باقي المواقع"},a=null,i=-1;window.__dataRevision=window.__dataRevision||0;
document.addEventListener("oncologyReferenceUpdated", () => {
  window.__dataRevision++;
  scopeDirty=true;
  if (canPaint() && l === "oncology") T();
});
document.addEventListener("visibilitychange", () => {
  if (!canPaint()) return;
  if (scopeDirty && l === "oncology") T();
  else L();
});
var o=Object.create(null),r=0,d=!1,c="overview",l="oncology",s=!1,E=null;window.setDashboardRegion=S,window.applyDashboardRegion=T,window.openDashboardTab=function(e){m(e),L()},window.showTab=window.openDashboardTab,window.setDashboardInitiative=_,document.addEventListener("dataUpdated",function(){window.__clinicalDatesNormalized=!1,window.__dataRevision++,a=null,o=Object.create(null),s=!1,E=null,T()}),"loading"===document.readyState?document.addEventListener("DOMContentLoaded",D,{once:!0}):D()}function u(e){"function"==typeof requestIdleCallback?requestIdleCallback(e,{timeout:220}):setTimeout(e,0)}function v(e){return"function"==typeof window[e]?window[e]:null}function y(e){return function(e){return String(e??"").trim()}(e).replace(/[\u200f\u200e\uFEFF]/g,"").toLowerCase()}function w(e){return"araby menofya"===e||-1!==e.indexOf("araby menofya")||"قويسنا"===e}function f(e){return"araby qalyoubia"===e||-1!==e.indexOf("araby qalyoubia")||"بنها"===e||"قليوب"===e}function b(source) {
  const revision = [window.__dataRevision, window.__opmReferenceRevision || 0, window.__regionBasis || "workplace", source.length].join("|");
  if (a === source && i === revision && o.all) return;
  a = source;
  i = revision;
  o = {all:source, "قويسنا":[], "بنها_قليوب":[], "باقي_المواقع":[]};
  unspecifiedTown = null;
  for (const row of source) {
    const region = window.__regionOf(row);
    const fallback = region ? "" : y(row && row.workplace);
    const key = region === "قويسنا" || w(fallback) ? "قويسنا"
      : region === "بنها_قليوب" || f(fallback) ? "بنها_قليوب" : "باقي_المواقع";
    o[key].push(row);
  }
}function A(region) {
  const master = Array.isArray(window.__ALL_DATA_MASTER) && window.__ALL_DATA_MASTER.length
    ? window.__ALL_DATA_MASTER : typeof ALL_DATA !== "undefined" && Array.isArray(ALL_DATA) ? ALL_DATA : [];
  const reference = window.__opmReferenceRevision || 0;
  if (activitySource !== master || activityRef !== reference || activityMap !== window.ACTIVITY_BY_SAP) {
    try { window.__ensureActivityRows?.(master); } catch (_) {}
    activitySource = master;
    activityRef = reference;
    activityMap = window.ACTIVITY_BY_SAP;
  }
  const source = master === window.__ALL_DATA_MASTER ? window.__opmOncologyReference?.rows() || master : master;
  b(source);
  const available = o[region] || o.all;
  const town = region === "بنها_قليوب" && window.__singleTown?.() ? window.__banhaQalyoubSubFilter : "";
  const site = region === "باقي_المواقع" && window.__otherRegionSiteFilter !== "all" ? window.__otherRegionSiteFilter : "";
  const key = region + "|" + (town || "") + "|" + (site || "");
  const reused = scopeInput === available && scopeKey === key && scopeRevision === i;
  if (!reused) {
    scopeInput = available;
    scopeKey = key;
    scopeRevision = i;
    scopeRows = town || site ? available.filter(window.__townMatches) : available;
    window.__opmScopedRevision = (window.__opmScopedRevision || 0) + 1;
  }
  const target = typeof DATA !== "undefined" && Array.isArray(DATA) ? DATA : null;
  if (target && (!reused || target.length !== scopeRows.length || target[0] !== scopeRows[0] ||
                 target[target.length - 1] !== scopeRows[scopeRows.length - 1])) {
    target.length = 0;
    for (const row of scopeRows) target.push(row);
  }
  window.DATA = target || scopeRows;
  scopeDirty = false;
  return scopeRows.length;
}function h(region) {
  const host = document.getElementById("regionalSwitcher");
  if (!host) return;
  for (const button of host.querySelectorAll("[data-region]")) {
    const selected = button.getAttribute("data-region") === region;
    button.classList.toggle("active", selected);
    const value = String(selected);
    if (button.getAttribute("aria-selected") !== value) button.setAttribute("aria-selected", value);
    if (button.getAttribute("aria-pressed") !== value) button.setAttribute("aria-pressed", value);
  }
  const meta = document.getElementById("regionalSwitcherMeta");
  if (meta) {
    let note = "";
    if (region === "بنها_قليوب" && window.__singleTown?.()) {
      if (unspecifiedTown === null) {
        unspecifiedTown = (o[region] || []).filter(row => !window.__townOf(row)).length;
      }
      if (unspecifiedTown) note = " · " + unspecifiedTown.toLocaleString("en-US") + " سجل بالمنطقة بدون فرع مؤكد";
    }
    if (region === "باقي_المواقع" && o.all?.length && !o[region]?.length) {
      note = " · لا توجد مواقع أخرى في مصدر Work Place الحالي";
    }
    const count = typeof DATA !== "undefined" && Array.isArray(DATA) ? DATA.length : 0;
    const label = region === "all" ? "يعرض الداشبورد الأساسي كاملًا"
      : "نطاق " + (t[region] || region) + " — " + count.toLocaleString("en-US") + " موظف";
    if (meta.textContent !== label + note) meta.textContent = label + note;
  }
  if (document.documentElement.getAttribute("data-dashboard-region") !== region) {
    document.documentElement.setAttribute("data-dashboard-region", region);
  }
  if (document.body.getAttribute("data-active-region") !== region) document.body.setAttribute("data-active-region", region);
  const daily = document.querySelector('[data-dashboard-tab="regionalDaily"]');
  if (daily) {
    if (daily.hidden) daily.hidden = false;
    if (daily.getAttribute("aria-hidden") !== "false") daily.setAttribute("aria-hidden", "false");
    if (daily.style.display) daily.style.removeProperty("display");
  }
}function g(){if(!s){var e={overview:["overviewPanel"],survey:["surveyProductionPanel"],tests:[],clinical:["clinicalPanel"],performance:["orgPanel"],labs:["labPanel"],dailyLab:["dailyLabPanel"],regionalDaily:["dailyRegionalOperationsPanel"],details:["opsPanel"]};Object.keys(e).forEach(function(t){(e[t]||[]).forEach(function(e){var a=document.getElementById(e);a&&(a.setAttribute("data-dashboard-pane",t),a.classList.add("tab-pane"))})});var t={survey:["1) العمالة والاستبيانات","📊 إحصائيات إنتاج الاستبيانات","الإجمالي العام","الأداء حسب موقع العمل"],tests:["إجمالي التحاليل","التحاليل","FIT","FIT ≥ 250 + المنظار","PSA"],performance:["5) التوقع لنهاية 2026","6) التحليل الشهري","التوزيع حسب المستوى الوظيفي"],clinical:["متابعة الفحوصات"],labs:["الأداء حسب جهة التحليل"],dailyLab:["موقف المعمل اليومي"],details:["لوحة المتابعة التفاعلية للحالات","الحالات والأسماء"]};Object.keys(t).forEach(function(e){t[e].forEach(function(t){var a=function(e){return Array.from(document.querySelectorAll("main.wrap > .panel")).find(function(t){var a=t.querySelector(":scope > h2");return a&&a.textContent.trim()===e})}(t);a&&(a.setAttribute("data-dashboard-pane",e),a.classList.add("tab-pane"))})}),document.querySelectorAll('main.wrap > [data-dashboard-pane="tests"], main.wrap > .tests-fit-psa-row, main.wrap > .combined-tests-panel').forEach(function(e){e.getAttribute("data-dashboard-pane")||e.setAttribute("data-dashboard-pane","tests"),e.classList.add("tab-pane")});var a=Array.from(document.querySelectorAll("main.wrap > .panel")).find(function(e){return e.querySelector("#highfit")});a&&(a.setAttribute("data-dashboard-pane","tests"),a.classList.add("tab-pane")),s=!0,E=Array.from(document.querySelectorAll("main.wrap>[data-dashboard-pane]"))}}function p(){return g(),Array.from(document.querySelectorAll("main.wrap>[data-dashboard-pane]"))}function m(e){if(document.documentElement.dataset.elAuthRole==="qc")e="tests";const previousCheckup=document.body.dataset.checkupsOpen==="1",previousChronic=document.body.dataset.activeInitiative==="chronic";
 if(document.body.dataset.checkupsOpen==='1')window.closeCheckupOperations?.();
 if(document.body.dataset.activeInitiative==='chronic'){
  l='oncology';document.body.dataset.activeInitiative='oncology';document.documentElement.dataset.dashboardInitiative='oncology';
  const old=document.getElementById('chronicPanel');if(old){old.hidden=true;old.classList.remove('active');old.style.display='none'}
 }
"regionalDaily"===e&&"all"!==(window.__dashboardRegion||"all")&&(e="overview"),g(),["overview","survey","tests","clinical","dailyLab","medicalFiles","regionalDaily"].includes(e)||(e="overview"),(c!==e||previousChronic||previousCheckup)&&window.__resetPrimaryWorkspace?.(e),
c=e||"overview";
if(scopeDirty)A(window.__dashboardRegion||"all");
if(document.body.dataset.activeTab!==c)document.body.setAttribute("data-active-tab",c);

for(const pane of p()){
  const active=pane.getAttribute("data-dashboard-pane")===c, hidden=String(!active);
  if(pane.classList.contains("active")!==active)pane.classList.toggle("active",active);
  if(pane.getAttribute("aria-hidden")!==hidden)pane.setAttribute("aria-hidden",hidden);
  if(pane.hidden===active)pane.hidden=!active;
  const display=active?"block":"none";
  if(pane.style.display!==display)pane.style.display=display;
  if(active){
    if(pane.style.visibility!=="visible")pane.style.visibility="visible";
    if(pane.style.opacity!=="1")pane.style.opacity="1";
    if(pane.style.pointerEvents!=="auto")pane.style.pointerEvents="auto";
  }
}
for(const button of document.querySelectorAll("[data-dashboard-tab]")){
  const active=button.getAttribute("data-dashboard-tab")===c;
  if(button.classList.contains("active")!==active)button.classList.toggle("active",active);
  if(button.getAttribute("aria-selected")!==String(active))button.setAttribute("aria-selected",String(active));
  const current=active?"page":"false";
  if(button.getAttribute("aria-current")!==current)button.setAttribute("aria-current",current);
}
document.dispatchEvent(new CustomEvent("dashboardTabChanged",{detail:{tab:c}})),"overview"!==c&&window.scrollTo(0,0)}function _(e){if("oncology"===e||"chronic"===e){document.body.removeAttribute("data-checkups-open");var t=document.getElementById("ckuBtn");t&&(t.classList.remove("active"),t.setAttribute("aria-pressed","false"))}var a="oncology"==(l="chronic"===e?"chronic":"oncology");document.body.setAttribute("data-active-initiative",l),document.documentElement.setAttribute("data-dashboard-initiative",l);try{localStorage.setItem("activeInitiative",l)}catch(e){}for(var i=document.querySelectorAll("#initiativeSwitcher .initiative-choice"),o=0;o<i.length;o++){var r=i[o].getAttribute("data-initiative")===l;i[o].classList.toggle("active",r),i[o].setAttribute("aria-pressed",r?"true":"false")}var d=document.getElementById("dashTabs");d&&(d.style.display=a?"":"none");for(var s=p(),E=0;E<s.length;E++){var R=a&&s[E].getAttribute("data-dashboard-pane")===c;s[E].style.display=R?"block":"none",s[E].hidden=!R,s[E].classList.toggle("active",R)}var k=document.getElementById("chronicPanel");if(k&&(k.hidden=a,k.style.display=a?"none":"block",k.classList.toggle("active",!a),k.style.visibility="visible",k.style.opacity="1",k.style.pointerEvents="auto",k.setAttribute("aria-hidden",String(a))),a)m("overview");else try{"function"==typeof window.chronicApplyRegionalScope&&window.chronicApplyRegionalScope(),"function"==typeof window.loadChronic&&window.__chronicLoadedFlag}catch(e){}window.scrollTo(0,0)}function L(){!canPaint()||(++r,d||(d=!0,function(e){"function"==typeof requestAnimationFrame?requestAnimationFrame(e):setTimeout(e,0)}(function(){d=!1,function(e){if(e===r&&canPaint())if("oncology"===l){var t=c;u(function(){if(e===r&&canPaint()&&document.body.dataset.activeTab===t&&document.body.dataset.activeInitiative!=="chronic")try{if("overview"===t)return void window.__opmRenderOverview?.();if("survey"===t){var a=v("renderSurveyProduction");a&&a();var i=v("renderSurveyTotals");i&&i();var o=v("render");if(o)try{o()}catch(e){}return}if("tests"===t){if("function"==typeof window.__scheduleTestsRender)window.__scheduleTestsRender();else{var d=v("renderAnalysisPage");d&&(d("FIT"),u(function(){e===r&&d("PSA")}))}return}if("clinical"===t){var c=window.__renderClinicalLocked||v("renderClinical");return void(c&&c())}if("dailyLab"===t){try{if("function"==typeof window.renderDailyLab)window.renderDailyLab();else{var l=v("render");l&&l()}}catch(e){console.warn(e)}return}if("details"===t){var s=v("renderOps");s&&s()}}catch(e){console.warn("Navigation render",e)}})}else try{"function"==typeof window.chronicApplyRegionalScope?window.chronicApplyRegionalScope():"function"==typeof window.renderChronic&&window.renderChronic()}catch(e){console.warn("chronic region render",e)}}(r)})))}function S(region) {
  if (e.indexOf(region) < 0) region = "all";
  const previous = window.__dashboardRegion || "all", revision = window.__opmScopedRevision;
  window.__dashboardRegion = region;
  try { localStorage.setItem("dashboardRegion", region); } catch (_) {}
  const count = A(region);
  h(region);
  if (previous !== region || revision !== window.__opmScopedRevision) {
    L();
    return count;
  }
}function T(){var e=window.__dashboardRegion||"all";A(e),h(e),L()}function D(){try{!function(){var e=document.getElementById("initiativeSwitcher"),t=document.getElementById("dashTabs");if(e&&t){n(e,"[data-region],.initiative-choice"),n(t,"[data-dashboard-tab]"),document.getElementById("regionalSwitcher").addEventListener("click",function(e){var t=e.target.closest&&e.target.closest("[data-region]");t&&"1"!==this.dataset.r73Bound&&S(t.getAttribute("data-region"))}),e.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest(".initiative-choice");t&&"ckuBtn"!==t.id&&t.hasAttribute("data-initiative")&&_(t.getAttribute("data-initiative"))}),t.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest("[data-dashboard-tab]");if(t){e.preventDefault();var a=t.getAttribute("data-dashboard-tab")||"overview";a!==c?(m(a),L()):m(a)}});var a=document.querySelector("[data-dashboard-tab].active");c=a?a.getAttribute("data-dashboard-tab"):"overview",l="chronic"===document.body.getAttribute("data-active-initiative")?"chronic":"oncology"}function n(e,t){for(var a=e.querySelectorAll(t),i=0;i<a.length;i++){var o=a[i],r=o.cloneNode(!0);r.removeAttribute("onclick"),r.removeAttribute("data-root-tab-bound"),r.removeAttribute("data-root-init-bound"),o.parentNode.replaceChild(r,o)}}}();var e=window.__dashboardRegion||"all";A(e),h(e),"oncology"===l?m(c):_("chronic"),L()}catch(e){console.warn("Radical navigation boot",e)}}document.addEventListener("elAuthStateChanged",function(e){e.detail&&!e.detail.locked&&(scopeDirty&&l==="oncology"?T():L())})}();