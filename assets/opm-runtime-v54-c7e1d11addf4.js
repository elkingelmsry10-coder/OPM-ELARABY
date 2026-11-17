/* OPM v186: one MutationObserver on main.wrap shared by the table decorators (no body/documentElement subtree). Subscribers receive the same records, in subscription (= former creation) order, in the same microtask. */window.__opmTableHub=window.__opmTableHub||(()=>{"use strict";const subs=[];let mo=null,target=null,calls=0;const deliver=list=>{calls++;for(const fn of subs.slice())try{fn(list)}catch(e){console.warn("[opm table hub]",e)}};const ensure=()=>{const main=document.querySelector("main.wrap");const next=main||document.body;if(!next)return!1;if(next===target)return!0;mo&&mo.disconnect();target=next;mo=new MutationObserver(deliver);mo.observe(next,main?{childList:!0,subtree:!0}:{childList:!0});return!!main};return Object.freeze({subscribe(fn){subs.push(fn);ensure()||document.addEventListener("DOMContentLoaded",ensure,{once:!0});return()=>{const i=subs.indexOf(fn);i>=0&&subs.splice(i,1)}},stats:()=>({subscribers:subs.length,calls,target:target?target.id||target.tagName:""})})})();window.__opmBumpDataRevision=window.__opmBumpDataRevision||(()=>window.__dataRevision=(window.__dataRevision||0)+1);!function(){"use strict";const e=t=>String(t??"").trim().replace(/[\u200e\u200f\uFEFF]/g,"").replace(/[٠-٩]/g,(t=>"٠١٢٣٤٥٦٧٨٩".indexOf(t))).replace(/[۰-۹]/g,(t=>"۰۱۲۳۴۵۶۷۸۹".indexOf(t))),t=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Cairo",year:"numeric",month:"2-digit",day:"2-digit"});function r(t,a,s){const c=new Date(Date.UTC(t,a-1,s));return t>=1990&&t<=2100&&c.getUTCFullYear()===t&&c.getUTCMonth()===a-1&&c.getUTCDate()===s?`${t}-${String(a).padStart(2,"0")}-${String(s).padStart(2,"0")}`:""}function n(a){if(!Number.isFinite(+a))return"";const s=Object.fromEntries(t.formatToParts(a).map((t=>[t.type,t.value])));return r(+s.year,+s.month,+s.day)}function o(t,a="dmy"){if(t instanceof Date)return n(t);const s=e(t);if(!s)return"";if("number"==typeof t||/^\d{5}(?:\.\d+)?$/.test(s)){const a=Number(t);if(!Number.isFinite(a)||a<=2e4||a>=8e4)return"";const s=new Date(Date.UTC(1899,11,30)+864e5*Math.floor(a));return r(s.getUTCFullYear(),s.getUTCMonth()+1,s.getUTCDate())}let c=s.match(/^Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})(?:,\s*\d+)*\)$/);if(c)return r(+c[1],+c[2]+1,+c[3]);if(c=s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/),c)return!r(+c[1],+c[2],+c[3])||+c[4]>23||+c[5]>59||+(c[6]||0)>59?"":n(new Date(s));if(c=s.match(/^(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.](?:\d{4}|\d{2}))[ T](\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:\s*(AM|PM|ص|م))?$/i),c){const t=+c[2],s=c[5];return+c[3]>59||+(c[4]||0)>59||(s?t<1||t>12:t>23)?"":o(c[1],a)}if(c=s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/),c)return r(+c[1],+c[2],+c[3]);if(c=s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/),c){const t=+c[3]+(2===c[3].length?2e3:0);return"mdy"===a?r(t,+c[1],+c[2]):"dmy"===a?r(t,+c[2],+c[1]):""}return""}window.__opmDate=Object.freeze({parse:o,valid:r,today:()=>n(new Date),format:t=>{const a=o(t);return a?`${a.slice(8)}/${a.slice(5,7)}/${a.slice(0,4)}`:"غير محدد"}}),window.__opmIdentityMatch=(t,a)=>{if(!t||!a)return!1;const n=t=>e(t).replace(/\s/g,"").replace(/\.0+$/,""),s=n(a.sap),c=n(a.nid),f=n(t.sap),l=n(t.nid);return s&&f?!(s!==f||c&&l&&c!==l):!(!c||!l||c!==l)},window.__opmNormalizeId=(()=>{const memo=new Map,raw=t=>{let a=String(t??"").normalize("NFKC").replace(/[٠-٩]/g,(t=>"٠١٢٣٤٥٦٧٨٩".indexOf(t))).replace(/[۰-۹]/g,(t=>"۰۱۲۳۴۵۶۷۸۹".indexOf(t))).replace(/[\s\u200b-\u200f\u2060\uFEFF]/g,"").replace(/^'/,"");if(/^\d{1,3}(?:,\d{3})+(?:\.0+)?$/.test(a)&&(a=a.replace(/,/g,"")),/^\d+(?:\.\d+)?e[+-]?\d+$/i.test(a)){const t=Number(a);if(!Number.isSafeInteger(t)||t<0)return"";a=String(t)}return a=a.replace(/\.0+$/,""),/^\d+$/.test(a)&&!/^0+$/.test(a)?a.replace(/^0+(?=\d)/,""):""};return t=>{if(typeof t==="string"&&/^[1-9]\d*$/.test(t))return t;const k=typeof t==="string"?"s"+t:typeof t==="number"?"n"+t:null;if(k===null)return raw(t);let v=memo.get(k);if(v===void 0){v=raw(t);if(memo.size>=2e5)memo.clear();memo.set(k,v)}return v}})();const a=[],s=Object.create(null);function i(t,c){a.push({name:t,ms:Math.round(10*c)/10,at:Date.now()}),a.length>100&&a.shift(),s[t]=(s[t]||0)+1}window.__OPM_PERF__={version:46,run(t,a){const s=performance.now();try{return a()}finally{i(t,performance.now()-s)}},record:i,snapshot:()=>({counts:{...s},measures:a.slice()}),clear(){a.length=0;for(const t of Object.keys(s))delete s[t]}}}(),(()=>{"use strict";const t=new Map;let a=0;const r=()=>new DOMException("تم إلغاء الاتصال","AbortError");function __opmContentHash(input){const str=typeof input==="string"?input:JSON.stringify(input??"");let h1=3735928559^str.length,h2=1103547991^str.length;for(let i=0,ch;i<str.length;i++){ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677)}h1=Math.imul(h1^h1>>>16,2246822507)^Math.imul(h2^h2>>>13,3266489909);h2=Math.imul(h2^h2>>>16,2246822507)^Math.imul(h1^h1>>>13,3266489909);return"h"+(h2>>>0).toString(16).padStart(8,"0")+(h1>>>0).toString(16).padStart(8,"0")+"_"+str.length}window.__opmContentHash=__opmContentHash;window.__opmReadGvizDirect=function(s,c={}){const f=new URL(s),l="api"===c.format;if(l&&f.origin+f.pathname===String(window.OPM_GATEWAY_URL||window.OPM_CONFIG.gateway||"")&&f.searchParams.get("op")==="q"&&window.__opmTransport52.has("compactCellsV1"))f.searchParams.set("transport","cells-v1");if("https:"!==f.protocol||(l?"script.google.com"!==f.hostname||!/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(f.pathname):"docs.google.com"!==f.hostname||!/\/spreadsheets\/d\/[^/]+\/gviz\/tq$/.test(f.pathname)))return Promise.reject(Error("مصدر Google Sheets غير صالح."));["_","_t","_r","t","cachebust","nocache","tqx","callback"].forEach((t=>f.searchParams.delete(t)));const dedupeUrl=new URL(f);dedupeUrl.searchParams.sort();const w=dedupeUrl.origin+dedupeUrl.pathname+"?"+dedupeUrl.searchParams.toString(),g=l?f.origin+f.pathname:f.hostname,stepTimeout=c.timeout||28e3;function d(t,s){const c=new URL(f);return l?("jsonp"===t&&c.searchParams.set("callback",s),c.searchParams.set("nocache","1")):c.searchParams.set("tqx","jsonp"===t?"out:json;responseHandler:"+s:"out:json"),c.searchParams.set("_t",String(Date.now())),c.searchParams.set("_r",String(++a)),c.href}function u(t,s){return!1===navigator.onLine?Promise.reject(Error("بدون اتصال · سنعيد المحاولة عند عودة الشبكة.")):s?.aborted?Promise.reject(r()):new Promise(((f,w)=>{const g=new AbortController,_="__opm_read_"+Date.now()+"_"+ ++a;let y=null,b=!1;const v=setTimeout((()=>p(Error("الاتصال بطيء أو غير متاح؛ جارٍ تجربة مسار آخر."))),stepTimeout),h=()=>p(r());function p(t,a){if(!b)if(b=!0,clearTimeout(v),s?.removeEventListener("abort",h),g.abort(),y&&(y.onerror=null,y.remove(),window[_]=()=>{},setTimeout((()=>{delete window[_]}),6e4)),t)w(t);else try{if(l)a=window.__opmTransport52.decode(a);f(l?a&&"object"==typeof a?a:(()=>{throw Error("استجابة غير صالحة من المصدر")})():(t=>{if(!t||"error"===t.status||!t.table||!Array.isArray(t.table.rows))throw Error("لم تصل بيانات صالحة من المصدر.");return t})(a))}catch(t){w(t)}}s?.addEventListener("abort",h,{once:!0}),"jsonp"===t?(y=document.createElement("script"),y.async=!0,window[_]=t=>p(null,t),y.onerror=()=>p(Error("تعذر الاتصال المباشر بالشيت.")),y.src=d("jsonp",_),document.head.append(y)):(window.__ehNativeFetch||window.fetch.bind(window))(d("fetch"),{method:"GET",cache:"no-store",credentials:"omit",mode:"cors",redirect:"follow",signal:g.signal}).then((async t=>{if(!t.ok)throw Error("HTTP "+t.status);const a=await t.text(),s=a.indexOf("{"),c=a.lastIndexOf("}");if(s<0||c<s||/^\s*</.test(a))throw Error("المصدر أعاد صفحة غير صالحة للبيانات.");p(null,JSON.parse(a.slice(s,c+1)))})).catch((t=>p(t)))}))}const m=async a=>{const s=t.get(g)||"jsonp";let f;for(const l of[s,"jsonp"===s?"fetch":"jsonp"]){if(a?.aborted)throw r();try{const s=await u(l,a);return t.set(g,l),s}catch(t){if(f=t,!1===navigator.onLine||a?.aborted)throw t;if(c.once)break}}throw f};return window.__ehRequest?window.__ehRequest("gviz:live:"+w+"|wire:"+String(c.once===true)+":"+stepTimeout,m,{retries:0,timeout:c.once?stepTimeout+5e3:2*stepTimeout+5e3,priority:c.priority??3}):m()},function(){const DB="opm-gateway-payloads-v150",STORE="kv",MAX_ENTRIES=60;let dbp=null;const open=()=>dbp||(dbp=new Promise(((res,rej)=>{try{if(!("indexedDB"in window))return rej(Error("no idb"));const r=indexedDB.open(DB,1),to=setTimeout((()=>rej(Error("idb timeout"))),4e3);r.onupgradeneeded=()=>r.result.objectStoreNames.contains(STORE)||r.result.createObjectStore(STORE);r.onsuccess=()=>(clearTimeout(to),res(r.result));r.onerror=()=>(clearTimeout(to),rej(r.error||Error("idb")));r.onblocked=()=>(clearTimeout(to),rej(Error("idb blocked")))}catch(e){rej(e)}})).catch((e=>(dbp=null,Promise.reject(e)))));const mem=window.__opmGatewayMemCache||(window.__opmGatewayMemCache=new Map);const hydrating=new Map;window.__opmGatewayHydrate=function(key){if(!key)return Promise.resolve(0);if(mem.has(key))return Promise.resolve(1);if(hydrating.has(key))return hydrating.get(key);const task=open().then((db=>new Promise((resolve=>{try{const tx=db.transaction(STORE,"readonly");const req=tx.objectStore(STORE).get(key);req.onsuccess=()=>{const saved=req.result;if(saved&&saved.serverHash&&saved.payload!=null&&!mem.has(key)){mem.set(key,{...saved,restored:true})}resolve(saved?1:0)};req.onerror=()=>resolve(0);tx.onabort=()=>resolve(0)}catch(_){resolve(0)}})))).catch((()=>0)).finally((()=>hydrating.delete(key)));hydrating.set(key,task);return task};window.__opmGatewayPersist=function(key,entry){open().then((db=>{const tx=db.transaction(STORE,"readwrite"),st=tx.objectStore(STORE);st.put({serverHash:entry.serverHash,clientHash:entry.clientHash,payload:entry.payload,at:entry.at,gw:entry.gw||null},key);try{const k="opm-gateway-cache-keys-v154";const recent=JSON.parse(localStorage.getItem(k)||"[]");const ordered=(Array.isArray(recent)?recent:[]).filter((x=>x!==key&&typeof x==="string"));ordered.push(key);while(ordered.length>MAX_ENTRIES){const oldest=ordered.shift();st.delete(oldest);mem.delete(oldest)}localStorage.setItem(k,JSON.stringify(ordered))}catch(_){const keys=[...mem.entries()].sort(((a,b)=>(a[1].at||0)-(b[1].at||0)));for(let i=0;i<keys.length-MAX_ENTRIES;i++)st.delete(keys[i][0]),mem.delete(keys[i][0])}})).catch((()=>{}))}}(),window.__opmGatewayProbe=function(book){const l=String(window.OPM_GATEWAY_URL||"");if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(l))return Promise.reject(Error("gateway not configured"));const u=new URL(l);u.searchParams.set("op","probe"),u.searchParams.set("book",book);return window.__opmReadGvizDirect(u.href,{format:"api",priority:9,once:!0,timeout:15e3})},window.__opmReadGviz = async function (input, options = {}) {
  const send = window.__opmReadGvizDirect;
  if (options.format) return send(input, options);
  let url;
  try { url = new URL(input); }
  catch { throw Error("رابط مصدر غير صالح"); }

  const match = url.hostname === "docs.google.com" &&
    url.pathname.match(/^\/spreadsheets\/d\/([^/]+)\/gviz\/tq$/);
  if (!match) return send(input, options);

  const endpoint = String(window.OPM_GATEWAY_URL || "");
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)) {
    throw Error("بوابة قراءة البيانات غير مهيأة؛ آخر نسخة سليمة محفوظة.");
  }

  const params = {book: match[1]};
  for (const key of ["gid", "sheet", "headers", "tq", "range"]) {
    if (url.searchParams.has(key)) params[key] = url.searchParams.get(key);
  }
  const csv = /out:csv/i.test(url.searchParams.get("tqx") || "");
  if (csv) params.fmt = "csv";
  const reqKey = JSON.stringify([endpoint, params]);
  const mem = window.__opmGatewayMemCache || (window.__opmGatewayMemCache = new Map());
  const reads = window.__opmGatewayReads || (window.__opmGatewayReads = new Map());
  const requests = window.__opmGatewayRequests || (window.__opmGatewayRequests = new Map());
  const sourceKey = params.book + ":" + (params.gid || params.sheet || "default");
  const label = params.sheet || (params.gid === "129733076" ? "MOH" :
    params.gid === "1641178878" ? "المرجعية" : "gid " + (params.gid || ""));
  const source = params.book === "1_q8i1s7o0tFvi-FYMDUnfiYi0Dsx8zqOanjIwsJdvSw" ? "chronic" :
    params.sheet === "Excel_Sync" ? "labRefs" : params.sheet === "SAP_حضور_اليوم" ? "attendance" :
    params.gid === "1641178878" ? "reference" :
    params.gid === "129733076" ? (/\bAY\b/.test(params.tq || "") ? "clinical" : "lab") :
    ["1431183742", "1004543563", "1247029273", "502748916"].includes(params.gid) ? "checkup" : "";
  let request = requests.get(reqKey);
  if (!request) {
    request = {key: reqKey, endpoint, source, params, hash: "", verifiedVersion: 0, checkedVersion: 0};
    requests.set(reqKey, request);
  }
  request.lastRequestedAt = Date.now();
  request.retired = false;

  // A source can have several requests (attendance fallback, reference pages).
  // Only the last started request may report the source's visual status.
  const flight = (reads.get(sourceKey)?.flight || 0) + 1;
  const sequence = (request.sequence || 0) + 1;
  request.sequence = sequence;
  request.loading = true;
  function status(state, extra = {}) {
    if (request.sequence === sequence) request.loading = state === "loading";
    if ((reads.get(sourceKey)?.flight || 0) > flight) return;
    reads.set(sourceKey, {...reads.get(sourceKey), state, label, flight, checkedAt: Date.now(), error: "", ...extra});
    document.dispatchEvent(new Event("opmGatewaySettled"));
  }
  function publishStatus(gw) {
    const stale = isProvisional(gw);
    if (request.sequence === sequence) request.stale = stale;
    status(stale ? "stale" : "ok", {
      version: String(gw.version || ""), cached: !!gw.cached, hash: String(gw.hash || ""),
      age: Number(gw.age) || 0, serverCheckedAt: Date.parse(gw.checkedAt) || 0,
      changedAt: Date.parse(gw.changedAt) || 0, srcModifiedAt: Date.parse(gw.srcModifiedAt) || 0,
      probe: String(gw.probe || ""), stale, refreshing: !!gw.refreshing,
      pendingSourceCheck: !!gw.pendingSourceCheck, verifiedSourceVersion: Number(gw.verifiedSourceVersion) || 0,
      reason: stale ? String(gw.reason || "") : "", rows: gw.rows, unchanged: !!gw.unchanged
    });
  }
  function applyReceipt(gw) {
    if (gw.key) request.serverKey = String(gw.key);
    if (!gw.hash) return;
    if (source === "attendance") {
      for (const other of requests.values()) {
        if (other !== request && other.endpoint === endpoint && other.source === source) other.retired = true;
      }
    }
    request.hash = String(gw.hash);
    request.verifiedVersion = Number(gw.verifiedSourceVersion) || 0;
    request.lastContentCheckedAt = Date.now();
    request.checkedVersion = Math.max(request.checkedVersion || 0, request.verifiedVersion);
    request.checkFailed = false;
    const pendingRevision = Number(request.pendingVersion) || 0;
    if (request.pendingHash === request.hash && request.verifiedVersion >= pendingRevision ||
        pendingRevision > 0 && request.verifiedVersion > pendingRevision) {
      request.pendingHash = "";
      request.pendingVersion = 0;
    }
  }
  const isProvisional = gw => !!(gw?.stale || gw?.refreshing || gw?.pendingSourceCheck || gw?.fresh === false);
  function retryable(message, gw) {
    return Object.assign(Error(message), {
      retryable: !!gw?.retryable || isProvisional(gw),
      retryAfter: Math.max(0, Number(gw?.retryAfter) || 0),
      reasonCode: gw?.reasonCode || ""
    });
  }
  function deliver(payload, gw) {
    publishStatus(gw);
    if (isProvisional(gw) && (csv || ["attendance", "clinical", "chronic", "reference"].includes(source))) {
      throw retryable("لم تتأكد أحدث نسخة من المصدر بعد؛ آخر بيانات سليمة محفوظة.", gw);
    }
    return csv ? payload : {...payload, gw};
  }

  status("loading");
  try {
    if (!mem.has(reqKey) && window.__opmGatewayHydrate) {
      let timer;
      try {
        await Promise.race([
          window.__opmGatewayHydrate(reqKey),
          new Promise(resolve => { timer = setTimeout(resolve, 1500); })
        ]);
      } finally { clearTimeout(timer); }
    }
    const target = new URL(endpoint);
    target.searchParams.set("op", "q");
    for (const [key, value] of Object.entries(params)) target.searchParams.set(key, value);
    if ((options.fresh || options.force) &&
        !(request.hash && !request.stale && !request.checkFailed &&
          Date.now() - (request.lastContentCheckedAt || 0) < 20000)) {
      target.searchParams.set("fresh", "1");
    }

    const prev = mem.get(reqKey);
    const sentHash = prev?.payload != null ? String(prev.serverHash || "") : "";
    if (sentHash) target.searchParams.set("ifHash", sentHash);
    const fetchReply = () => send(target.href, {...options, format: "api"});
    let reply = await fetchReply();
    // Treat an invalid conditional reply as a missing copy, with one recovery.
    const validUnchanged = () => reply?.status === "ok" && reply?.unchanged === true &&
      sentHash && reply.gw?.hash === sentHash && target.searchParams.has("ifHash");
    if (reply?.status === "ok" && reply.unchanged === true && !validUnchanged()) {
      target.searchParams.delete("ifHash");
      reply = await fetchReply();
    }
    if (reply?.status !== "ok") {
      throw retryable("تعذرت قراءة المصدر من البوابة؛ آخر نسخة سليمة محفوظة.", reply?.gw);
    }

    const unchanged = validUnchanged();
    const payload = unchanged ? prev.payload : csv ? reply.csv : reply;
    if (reply.unchanged === true && !unchanged ||
        (csv ? typeof payload !== "string" : !Array.isArray(payload?.table?.rows)) ||
        !csv && reply.gw?.rows != null && Number(reply.gw.rows) !== payload.table.rows.length) {
      throw Error("استجابة مصدر غير مكتملة؛ آخر نسخة سليمة محفوظة.");
    }

    const gw = {...reply.gw};
    const current = mem.get(reqKey);
    const currentGw = current?.gw || current?.payload?.gw;
    const revision = Number(gw.verifiedSourceVersion) || 0;
    const currentRevision = Number(currentGw?.verifiedSourceVersion) || 0;
    const checkedAt = Date.parse(gw.checkedAt) || 0;
    const currentCheckedAt = Date.parse(currentGw?.checkedAt) || 0;
    const older = current && (current === prev
      ? revision > 0 && revision < currentRevision && checkedAt <= currentCheckedAt
      : currentRevision > revision || currentCheckedAt > checkedAt ||
        currentCheckedAt === checkedAt && request.appliedSequence > sequence);
    if (older) return deliver(current.payload, {...currentGw, unchanged: !current.restored});

    if (isProvisional(gw)) {
      // Keep the last verified copy and its receipt. Expose the retry state to
      // all consumers, including attendance, without promoting it to fresh.
      const retained = current || prev;
      return deliver(retained?.payload ?? payload, {
        ...gw, stale: true, fresh: false, unchanged: false,
        hash: retained?.serverHash || gw.hash,
        verifiedSourceVersion: retained?.gw?.verifiedSourceVersion ?? gw.verifiedSourceVersion
      });
    }

    const serverHash = String(gw.hash || "");
    const clientHash = unchanged ? prev.clientHash : __opmContentHash(csv ? payload : payload.table);
    const same = !!prev && !prev.restored && (unchanged ||
      !!serverHash && prev.serverHash === serverHash || prev.clientHash === clientHash);
    const verified = {...gw, hash: serverHash || clientHash, unchanged: same,
      restoredLocal: unchanged && prev.restored || undefined};
    const data = csv ? payload : {...payload, gw: verified};
    const entry = {serverHash, clientHash, payload: data, at: Date.now(), gw: verified};
    mem.set(reqKey, entry);
    request.appliedSequence = sequence;
    // Save a full snapshot when its receipt changes. An unchanged response
    // only needs to update the in-memory verification clock.
    if (serverHash && (!current || current.serverHash !== serverHash)) {
      window.__opmGatewayPersist?.(reqKey, entry);
    }
    applyReceipt(verified);
    return deliver(data, verified);
  } catch (error) {
    if (request.sequence === sequence && error.retryable) request.stale = true;
    if (!(reads.get(sourceKey)?.flight === flight && reads.get(sourceKey)?.state === "stale")) {
      status(error.retryable ? "stale" : "error", {error: String(error.message || error)});
    }
    throw error;
  }
},
window.__opmCheckGviz=function(request){const endpoint=String(window.OPM_GATEWAY_URL||"");if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))return Promise.reject(Error("بوابة البيانات غير مهيأة."));const url=new URL(endpoint);url.searchParams.set("op","check");url.searchParams.set("verify","1");for(const[name,value]of Object.entries(request.params))url.searchParams.set(name,value);if(request.hash)url.searchParams.set("ifHash",request.hash);return window.__opmReadGvizDirect(url.href,{format:"api",once:true,timeout:9e4,priority:9})},window.__opmReadApiJSON=(t,a)=>{const s="1"===new URL(t).searchParams.get("forceSync");return window.__opmReadGviz(t,{format:"api",priority:5,once:s,timeout:s?a||9e4:45e3})}})();
window.__opmTransport52.init();
