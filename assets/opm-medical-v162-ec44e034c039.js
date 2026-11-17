(()=>{"use strict";const e=s=>document.getElementById(s),t=s=>String(s??"").trim(),n=s=>t(s).replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s])),o=s=>t(s).replace(/[٠-٩]/g,s=>String("٠١٢٣٤٥٦٧٨٩".indexOf(s))).replace(/[۰-۹]/g,s=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(s))),i=s=>o(s).replace(/[\u200e\u200f\ufeff]/g,""),a=s=>i(s).replace(/\D/g,""),s={ready:"ملف مسجل",missing:"لا يوجد ملف",empty:"رقم الملف غير مسجل",duplicate:"رقم ملف مكرر",conflict:"تعارض يحتاج مراجعة",unavailable:"غير متاح في نطاق الحساب"},r={sap:"SAP",name:"الاسم",nid:"الرقم القومي",phone:"التليفون",workplace:"Work place",empStatus:"موقف التشغيل",jobAr:"الوظيفة",job:"الوظيفة بالإنجليزية",org:"التنظيم",org_depth:"المستوى الوظيفي",group:"المجموعة",department:"الإدارة",activity:"النشاط",building:"المبنى",center:"مركز السكن",residenceCenter:"مركز السكن",village:"قرية السكن",residenceVillage:"قرية السكن",residence:"قرية السكن",gender:"النوع",governorate:"المحافظة",status:"الموقف",date:"التاريخ المسجل",required:"التحاليل المطلوبة",fitStatus:"موقف FIT",fitResult:"نتيجة FIT",psaStatus:"موقف PSA",psaResult:"نتيجة PSA",prostate:"متابعة البروستاتا",scope:"المنظار والمتابعة",cervix:"عنق الرحم",lung:"أشعة الرئة",lab:"جهة التحليل",labStatus:"موقف المعمل",labStartDate:"تاريخ بدء التحليل",sampleDate:"تاريخ العينة",smoking:"التدخين",note:"ملاحظات",type:"التحليل",result:"النتيجة",resultDate:"تاريخ النتيجة",visitMode:"طريقة التوجيه",execDate:"تاريخ تسجيل المعمل",provider:"المعمل",labName:"المعمل",handoverDate:"تاريخ تسليم العينة",expectedBy:"المهلة حتى",batchId:"رقم عملية التسليم",approved:"اعتماد النتيجة"};let l,d=0,c=null,f="",u=null,m=[],p=[],h="",w="all",g=30,E=!1,S=0,b=null,_=!1,v=0,y="",C=null,A="",N=null;const x=new Map,k=new Intl.Collator("en",{numeric:!0,sensitivity:"base"});function R(){return document.documentElement.dataset.elAuthRole||""}function P(){return R()==='admin'?'all':R()==='quesna'?'قويسنا':R()==='banha'?'بنها_قليوب':window.__dashboardRegion||'all'}function L(){return R()+"|"+P()+"|"+(window.__singleTown()?window.__banhaQalyoubSubFilter:"")}function I(){return"medicalFiles"===document.body.dataset.activeTab&&"chronic"!==document.body.dataset.activeInitiative&&"1"!==document.body.dataset.checkupsOpen}const D=s=>new Promise(r=>setTimeout(r,s));let T=Promise.resolve(),F=0,de=null;const ce=new Set(["files_auth","files_lookup","files_status","files_snapshot"]),fe=new Map;
// V162: RAM-only, account-scoped previews; fresh reads and verified saves remain authoritative.
const filesLookupCache=new Map, quickFiles=new Map, pendingFileDisplay=new Map;
let searchInputTimer=0,editLookupTimer=0,autoSaveTimer=0,filesLookupGeneration=0;
let quickContext='',quickAt=0,quickJob=null,quickUnsupported=false,quickTimer=0,quickLastAttempt=0;
let editDraftSerial=0,editProbePending=false,autoSavePaused=false,discardFileIntent=false;
const QUICK_PREVIEW_AGE=120000,QUICK_REFRESH_MS=90000;
function indexStatus(message){const node=e('mfIndexStatus');if(node)node.textContent=message}
function clearQuickFiles(){clearTimeout(quickTimer);quickFiles.clear();quickAt=0;quickContext='';quickJob=null;indexStatus('')}
function rememberFiles(items){
 for(const item of items){const clean={...item};delete clean._filesPreview;delete clean._snapshotAt;filesLookupCache.set(JSON.stringify([L(),item.sap]),{at:Date.now(),item:clean})}
 while(filesLookupCache.size>1000)filesLookupCache.delete(filesLookupCache.keys().next().value);
}
function knownFiles(ids){
 const session=c&&c.user===R()&&c.expiresAt>Date.now()+10000?c:retrieveFileCapability();if(!session)return null;
 const context=L(),rows=[];
 for(const sap of ids){
  const saved=filesLookupCache.get(JSON.stringify([context,sap]));
  if(saved&&Date.now()-saved.at<=120000){rows.push({...saved.item});continue}
  if(quickContext!==context||!quickAt||Date.now()-quickAt>QUICK_PREVIEW_AGE||!quickFiles.has(sap))return null;
  rows.push({...quickFiles.get(sap),_filesPreview:true,_snapshotAt:quickAt});
 }
 return rows;
}
function validFileDraft(value){return !!value&&value.length<=40&&!/^[=+@'\-]/.test(value)&&!/[\x00-\x1f\x7f]/.test(value)}
function pendingView(sap){return pendingFileDisplay.get(sap)}
function updateDraftView(){
 if(!b?.canEdit)return;const value=o(e('mfEditNumber').value);
 if(value===b.fileNo&&!x.has(b.sap))pendingFileDisplay.delete(b.sap);
 else if(validFileDraft(value))pendingFileDisplay.set(b.sap,{value,state:_?'queued':'draft'});
 else pendingFileDisplay.delete(b.sap);
 $();
}
function supportsPackedSnapshot(){
 return typeof DecompressionStream==='function'&&typeof Blob==='function'&&typeof TextEncoder==='function'&&typeof TextDecoder==='function'&&typeof atob==='function'&&!!window.crypto?.subtle;
}
async function unpackSnapshot(reply){
 if(reply?.encoding!=='gzip-base64')return reply;
 if(!supportsPackedSnapshot()||typeof reply.payload!=='string'||reply.payload.length>16000000||!/^[a-f0-9]{64}$/.test(reply.payloadHash||''))throw Error('حزمة البحث السريع غير صالحة.');
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(reply.payload));
 const hash=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
 if(hash!==reply.payloadHash)throw Error('لم يكتمل نقل فهرس الملفات.');
 const binary=atob(reply.payload),bytes=new Uint8Array(binary.length);for(let idx=0;idx<binary.length;idx++)bytes[idx]=binary.charCodeAt(idx);
 const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader(),chunks=[];let length=0;
 try{while(true){const part=await reader.read();if(part.done)break;length+=part.value.byteLength;if(length>32000000)throw Error('حجم فهرس الملفات أكبر من المسموح.');chunks.push(part.value)}}catch(error){await reader.cancel().catch(()=>{});throw error}
 const data=new Uint8Array(length);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length}
 const decoded=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(data));
 if(!decoded||!Array.isArray(decoded.rows)||decoded.rows.length!==reply.recordCount)throw Error('عدد صفوف فهرس الملفات غير متطابق.');
 return {...reply,columns:decoded.columns,rows:decoded.rows};
}
function autoSaveFile(){
 discardFileIntent=false;++editDraftSerial;clearTimeout(autoSaveTimer);updateDraftView();
 if(!b?.canEdit||!e('mfEdit').open)return;
 const file=o(e('mfEditNumber').value);
 if(file===b.fileNo&&!x.has(b.sap))return;
 if(_){e('mfEditNote').textContent='التعديل الجديد ظاهر · سيُرسل بعد تأكيد الحفظ الجاري.';return}
 if(x.has(b.sap)){e('mfEditNote').textContent='الحفظ السابق يحتاج تحققًا. اضغط إعادة التحقق بنفس العملية أولًا.';return}
 if(!validFileDraft(file)){e('mfEditNote').textContent='اكتب رقم ملف صحيحًا؛ لا تستخدم معادلة.';return}
 if(editProbePending||!b.revision){e('mfEditNote').textContent='الرقم جاهز للإرسال · جارٍ التحقق من أحدث ملف في Google…';return}
 if(autoSavePaused){e('mfEditNote').textContent='راجع الرقم الحالي، ثم اضغط حفظ لتأكيد التعديل.';return}
 e('mfEditNote').textContent='التعديل ظاهر · سيُحفظ بعد اكتمال الكتابة…';
 autoSaveTimer=setTimeout(()=>{if(e('mfEdit').open&&!_)oe({preventDefault(){},auto:true})},400);
}
async function warmFiles(force=false){
 if(quickUnsupported||document.documentElement.classList.contains('el-auth-locked')||!R())return null;
 const context=L(),epoch=d,generation=filesLookupGeneration;
 if(quickJob&&quickJob.context===context)return quickJob.promise;
 if(!force&&quickContext===context&&quickAt&&Date.now()-quickAt<QUICK_REFRESH_MS)return null;
 if(!force&&Date.now()-quickLastAttempt<15000)return null;
 quickLastAttempt=Date.now();
 const job={context,promise:null};
 job.promise=(async()=>{
  indexStatus('جارٍ تجهيز البحث السريع…');
  try{
   const packed=supportsPackedSnapshot();let reply;
   try{reply=await O('files_snapshot',packed?{encoding:'gzip-base64'}:{})}catch(error){
    if(!packed||error.code!=='FILES_SNAPSHOT_ENCODING'||epoch!==d||context!==L())throw error;
    reply=await O('files_snapshot',{});
   }
   try{reply=await unpackSnapshot(reply)}catch(error){
    if(epoch!==d||context!==L())return null;
    // Older browsers or a damaged compressed reply can retry this read in plain format.
    reply=await O('files_snapshot',{});
   }
   if(epoch!==d||context!==L()||generation!==filesLookupGeneration)return null;
   const required=['sap','fileNo','status','revision','canEdit','name','workplace','nid','referenceMissing','duplicateFile'];
   if(!reply?.success||reply.scope!==P()||reply.complete!==true||reply.truncated!==false||reply.preview!==true||!Array.isArray(reply.columns)||!Array.isArray(reply.rows)||reply.rows.length>60000)throw Error('لم يكتمل تجهيز البحث السريع؛ البحث المباشر متاح.');
   const positions=required.map(key=>reply.columns.indexOf(key));if(positions.some(at=>at<0)||new Set(reply.columns).size!==reply.columns.length)throw Error('مخطط فهرس الملفات غير صالح.');
   const at=Date.parse(reply.snapshotAt);if(!Number.isFinite(at)||at>Date.now()+60000)throw Error('وقت فهرس الملفات غير صالح.');
   const next=new Map;
   for(let idx=0;idx<reply.rows.length;idx++){
    const tuple=reply.rows[idx];if(!Array.isArray(tuple)||tuple.length!==reply.columns.length)throw Error('فهرس الملفات غير مكتمل.');
    const item=Object.fromEntries(required.map((key,j)=>[key,tuple[positions[j]]]));
    if(typeof item.sap!=='string'||!/^\d{1,12}$/.test(item.sap)||next.has(item.sap)||!s[item.status]||item.status==='unavailable'||typeof item.fileNo!=='string'||typeof item.name!=='string'||typeof item.workplace!=='string'||typeof item.nid!=='string'||typeof item.canEdit!=='boolean'||typeof item.referenceMissing!=='boolean'||typeof item.duplicateFile!=='boolean'||typeof item.revision!=='string'||item.revision&&!/^[a-f0-9]{64}$/.test(item.revision))throw Error('فهرس الملفات يحتوي بيانات غير متوافقة.');
    next.set(item.sap,item);
    // Yield while building a 40k map; typing and foreground lookups stay responsive.
    if(idx&&idx%2000===0){await D(0);if(epoch!==d||context!==L()||generation!==filesLookupGeneration)return null}
   }
   if(epoch!==d||context!==L()||generation!==filesLookupGeneration)return null;
   quickFiles.clear();for(const[sap,item]of next)quickFiles.set(sap,item);quickContext=context;quickAt=at;
   indexStatus('البحث السريع جاهز · '+next.size.toLocaleString('ar-EG')+' رقم · آخر قراءة '+new Date(at).toLocaleTimeString('ar-EG'));
   return {records:next.size,snapshotAt:at};
  }catch(error){
   if(epoch!==d||context!==L())return null;
   if(/^(UNSUPPORTED|OLD_BRIDGE)$/.test(error.code||''))quickUnsupported=true;
   indexStatus(quickFiles.size?'آخر فهرس متاح · البحث يتحقق مباشرة من Google.':'البحث المباشر متاح أثناء تجهيز البحث السريع.');return null;
  }finally{if(quickJob===job)quickJob=null}
 })();quickJob=job;return job.promise;
}
function scheduleQuickFiles(){
 clearTimeout(quickTimer);
 if(!I()||document.hidden||document.documentElement.classList.contains('el-auth-locked')||!R())return;
 const jitter=Math.floor(Math.random()*1500);
 quickTimer=setTimeout(async()=>{if(I()&&!document.hidden&&!_)await warmFiles();if(I()&&!document.hidden)quickTimer=setTimeout(scheduleQuickFiles,QUICK_REFRESH_MS+jitter)},500+jitter);
}

/* v158 — Store ONLY the server-issued, expiring files capability in this tab.
   No password is saved. The server remains authoritative on token validity/scope.
   This is a refresh continuity fix, not a substitute for server-side authorization. */
const FILES_CAP_KEY="opm:files-capability:v158", FILES_CAP_MAX_AGE=8*60*60*1000;
function discardFileCapability(){try{sessionStorage.removeItem(FILES_CAP_KEY)}catch(_){}}
function storeFileCapability(s){
  if(!s||typeof s.token!=="string"||!s.token||typeof s.user!=="string"||!Number.isFinite(s.expiresAt))return;
  const now=Date.now();
  if(s.user!==R()||s.expiresAt<=now+10000)return;
  try{sessionStorage.setItem(FILES_CAP_KEY,JSON.stringify({v:1,user:s.user,token:s.token,expiresAt:s.expiresAt,issuedAt:now}))}catch(_){}
}
function retrieveFileCapability(){
  if(document.documentElement.classList.contains("el-auth-locked")||!R())return null;
  let s=null;try{s=JSON.parse(sessionStorage.getItem(FILES_CAP_KEY)||"null")}catch(_){}
  const now=Date.now();
  if(!s||s.v!==1||typeof s.token!=="string"||!s.token||s.user!==R()||
      !Number.isFinite(s.expiresAt)||!Number.isFinite(s.issuedAt)||s.issuedAt>now||
      now-s.issuedAt>=FILES_CAP_MAX_AGE||s.expiresAt<=now+10000){discardFileCapability();return null}
  return {user:s.user,token:s.token,expiresAt:s.expiresAt};
}
// Files authorization is obtained with the primary sign-in; no second password dialog.
function filesReauthRequired(){return Object.assign(new Error("جلسة خدمة الملفات غير مفعلة. سجّل الدخول للموقع مرة واحدة لتفعيل البحث والحفظ."),{code:"FILES_REAUTH_REQUIRED"})}
function M(s){return/BUSY|SERVICE_BUSY|LOCK_TIMEOUT|TOO_MANY_REQUESTS|RESOURCE_EXHAUSTED/i.test(String(s?.code||""))||/مشغول|مشغولة|busy|temporarily unavailable|service invoked too many times|too many requests|rate limit|lock timeout/i.test(String(s?.message||""))}function filesChanged(){const s=new Error("تم تغيير الحساب أو الموقع؛ أعد البحث في النطاق الحالي.");return s.code="FILES_CONTEXT_CHANGED",s}function U(s,r,l=6e4){
 const epoch=d,context=s==='files_auth'?null:L(),read=ce.has(s),key=read?JSON.stringify([epoch,context,s,r.saps||r.operationId||r.user||'snapshot',!!r.fresh,r.encoding||'']):null;
 if(key&&fe.has(key))return fe.get(key);
 function current(){if(epoch!==d||context&&context!==L())throw filesChanged()}
 const execute=async()=>{
  current();if(typeof navigator!=='undefined'&&navigator.onLine===false)throw Object.assign(new Error('بدون اتصال؛ آخر نتيجة مؤكدة محفوظة حتى عودة الشبكة.'),{code:'FILES_OFFLINE'});if(!window.__EH_SERVICE__)throw Error('خدمة Google غير متاحة.');
  for(let attempt=0;attempt<(read?3:1);attempt++){
   current();try{const result=await window.__EH_SERVICE__.request(s,r,{timeout:l});current();return result}
   catch(error){current();if(!read||!M(error)||attempt===2)throw error;await D((attempt===0?1000:2400)+Math.floor(Math.random()*600))}
  }
 };
 // Saves stay ordered. Exact reads start immediately and do not queue behind old searches.
 const task=s==='files_save'?T.catch(()=>{}).then(execute):Promise.resolve().then(execute);
 if(s==='files_save')T=task.then(()=>{},()=>{});
 if(key){fe.set(key,task);task.then(()=>{if(fe.get(key)===task)fe.delete(key)},()=>{if(fe.get(key)===task)fe.delete(key)})}
 return task;
}
function filesSession(){
  if(c&&c.user===R()&&c.expiresAt>Date.now()+1e4)return Promise.resolve(c);
  if(u)return u;
  const restored=retrieveFileCapability();
  if(restored){c=restored;return Promise.resolve(c)}
  const epoch=d,role=R();
  const l=Promise.resolve().then(async()=>{
    const creds=de&&de.user===role?de:null;
    if(!creds)throw filesReauthRequired();
    if(epoch!==d||role!==R())throw filesChanged();
    const result=await U("files_auth",{user:creds.user,password:creds.password},2e4);
    if(epoch!==d||role!==R())throw filesChanged();
    if(!result?.token||result.user!==creds.user||!Number.isFinite(result.expiresAt)||result.expiresAt<=Date.now())throw Error("استجابة خدمة الملفات غير مكتملة.");
    c=result;f="";storeFileCapability(result);return c;
  }).catch(err=>{
    if(epoch===d){c=null;f=["UNSUPPORTED","FILES_SETUP_REQUIRED"].includes(err.code)?"خدمة الملفات تحتاج تحديث كود Google.":err.message||"تعذر الاتصال بخدمة الملفات."}
    throw err;
  }).finally(()=>{if(u===l)u=null;/* Erase plaintext password as soon as the attempt finishes. */if(epoch===d)de=null});
  u=l;return l;
}async function O(s,r){const l=d,f=P(),u=L(),m=ce.has(s);if(await filesSession(),l!==d||u!==L())throw filesChanged();try{return await U(s,{...r,token:c.token,scope:f},s==='files_snapshot'?45e3:m?25e3:6e4)}catch(p){if(!/^(TOKEN_EXPIRED|SESSION_EXPIRED|INVALID_TOKEN|FILES_SESSION|FILES_AUTH_REQUIRED|AUTH_REQUIRED|UNAUTHENTICATED)$/.test(String(p.code||"")))throw p;if(l!==d||u!==L())throw filesChanged();if(c=null,discardFileCapability(),!m)throw p;if(await filesSession(),l!==d||u!==L())throw filesChanged();return U(s,{...r,token:c.token,scope:f},25e3)}}function G(s,r=!1){e("mfNotice").textContent=s,e("mfNotice").style.color=r?"var(--bad,#b74747)":""}function B(s){const r=o(s).split(/[\s,;،؛]+/).filter(Boolean),l=r.filter(s=>!/^\d{1,12}$/.test(s)),d=[...new Set(r.filter(s=>/^\d{1,12}$/.test(s)))];return{saps:d,invalid:l,duplicates:r.length-l.length-d.length}}function H(s){return null==s||""===s?"":s instanceof Set?[...s].join("، "):Array.isArray(s)?s.join("، "):"boolean"==typeof s?s?"نعم":"لا":String(s)}function j(s,l=Object.keys(s||{}),d=r){return'<div class="mf-fields">'+l.filter(r=>d[r]&&""!==H(s?.[r])).map(r=>'<div class="mf-field"><small>'+n(d[r])+"</small><b>"+n(H(s[r]))+"</b></div>").join("")+"</div>"}function q(s,r,l="",d=!1){return'<details class="mf-section"'+(d?" open":"")+"><summary>"+n(s)+(l?"<small>"+n(l)+"</small>":"")+"</summary>"+r+"</details>"}function V(s){return'<p class="mf-source-note">'+n(s)+"</p>"}function X(s,r){const l=new Map;for(const d of s){const s=r(d);if(!s)continue;const c=l.get(s)||[];c.push(d),l.set(s,c)}return l}function W(s,r){return!a(s.nid)||!a(r.nid)||a(s.nid)===a(r.nid)}function K(r){if(!r)return V("اختر عاملًا لعرض ملفه.");if("unavailable"===r.status)return'<div class="mf-empty"><b>SAP '+n(r.sap)+"</b><p>غير موجود ضمن البيانات المتاحة لهذا الحساب والموقع.</p></div>";const l=function(){if(N)return N;const s=window.__REFERENCE_WORKFORCE__||[],r=window.__mohLab?.rows?.()||[],l=window.__LAB_HANDOVER_ROWS__||[],d=window.__ALL_DATA_MASTER||[],c=window.chronicGetHeaders?.()||[],f=window.chronicGetAllRows?.()||[],u=c.findIndex(s=>/^(sap|الساب|ساب|رقم الساب)$/i.test(t(s))),m=c.findIndex(s=>/^(الرقم القومي|الرقم القومى|nid|national id)$/i.test(t(s)));return N={nidOwners:X([...s,...d],s=>a(s.nid)),ref:X(s,s=>i(s.sap)),onc:X(d,s=>i(s.sap)),lab:X(r,s=>i(s.sap)),labByNid:X(r.filter(s=>!i(s.sap)),s=>a(s.nid)),handover:X(l,s=>i(s.sap)),handoverByNid:X(l.filter(s=>!i(s.sap)),s=>a(s.nid)),chronic:X(f,s=>i(s[u])),chHeaders:c,chNid:m}}(),d=l.ref.get(r.sap)||[],c=l.onc.get(r.sap)||[],f={...c.find(s=>W(s,r))||{},...d[0],sap:r.sap,name:r.name||d[0]?.name||c[0]?.name||"اسم غير متاح",nid:r.nid||d[0]?.nid||"",workplace:r.workplace||d[0]?.workplace||""},u=[];r.referenceMissing&&u.push("هذا SAP غير موجود في البيانات المرجعية؛ المعلومات الشخصية والموقع تحتاج استكمالًا من المصدر."),"duplicate"===r.status&&u.push("رقم الملف مستخدم لشخص آخر أيضًا. راجع الرقم قبل الاعتماد عليه."),"conflict"===r.status&&u.push("يوجد تعارض في SAP أو الهوية. لن ندمج السجلات الطبية أو نسمح بتعديل الملف حتى تُراجع بيانات المصدر.");let m='<div class="mf-file-head mf-enter"><div><small>رقم الملف الطبي</small><strong class="mf-file-number" dir="ltr">'+n(r.fileNo||"—")+"</strong><h3>"+n(f.name)+'</h3><p>SAP <b dir="ltr">'+n(r.sap)+"</b> · "+n(f.workplace||"الموقع غير محدد")+'</p><span class="mf-badge">'+n(s[r.status])+'</span></div><button type="button" data-mf-edit="'+n(r.sap)+'"'+(r.canEdit?"":" disabled")+">"+(r.fileNo?"تعديل الملف":"إضافة رقم الملف")+"</button></div>";if(m+=u.map(s=>'<p class="mf-warning">'+n(s)+"</p>").join(""),m+=q("بيانات العامل",j(f,["sap","nid","phone","workplace","empStatus","department","group","activity","building","jobAr","job","org","org_depth","center","residenceCenter","village","residenceVillage","residence","gender","governorate"]),"البيانات المرجعية",!0),"conflict"===r.status)return m;let p="",h=0;for(const s of c)W(s,f)?p+='<div class="mf-subrecord">'+j(s,["status","date","required","fitStatus","fitResult","psaStatus","psaResult","prostate","scope","cervix","lung","lab","labStatus","labStartDate","sampleDate","smoking","note"])+"</div>":h++;h&&(p+=V(h+" سجل أورام له SAP مطابق ورقم قومي مختلف؛ يحتاج مراجعة الهوية.")),m+=q("الأورام والمتابعة",p||V(window.__ALL_DATA_MASTER?.length?"لا توجد سجلات لهذا SAP في مصدر الأورام.":"بيانات الأورام لم تكتمل بعد."),c.length+" سجل");const w=(l.nidOwners.get(a(f.nid))||[]).every(s=>!i(s.sap)||i(s.sap)===r.sap),g=l.labByNid.get(a(f.nid))||[],E=l.handoverByNid.get(a(f.nid))||[],S=[...l.lab.get(r.sap)||[],...w?g:[]],b=[...l.handover.get(r.sap)||[],...w?E:[]];p="";for(const[s,r]of[[S,"تسجيل المعمل"],[b,"تسليم العينة عندنا"]])for(const l of s)W(l,f)?p+='<div class="mf-subrecord"><strong>'+r+"</strong>"+j({...l,type:l.type||l.testType,provider:l.labLabel||l.lab||l.labName||l.provider},["type","result","status","approved","execDate","resultDate","handoverDate","expectedBy","provider","visitMode","batchId"])+"</div>":p+=V(r+": اختلاف في الرقم القومي يحتاج مراجعة.");w||!g.length&&!E.length||(p+=V("توجد سجلات بالرقم القومي مرتبطة بأكثر من SAP؛ يلزم مراجعة الهوية قبل ضمّها.")),(window.__mohLab?.info?.().error||window.__labReviewModel?.sourceInfo?.().error)&&(p+=V("تعذّر آخر تحديث لأحد مصدري المعمل؛ المعروض آخر بيانات متاحة.")),window.__mohLab?.info?.().loaded&&window.__labReviewModel?.sourceInfo?.().loaded||(p+=V("أحد مصدري المعمل لم يكتمل؛ لا تعتبر غياب السجل تأكيدًا لعدم التسجيل.")),m+=q("المعمل وتسليم العينات",p||V("لا توجد سجلات مرتبطة بهذا SAP في مصادر المعمل المحمّلة."),S.length+b.length+" سجل");const _=l.chronic.get(r.sap)||[];p="";for(const s of _){if(l.chNid>=0&&a(s[l.chNid])&&a(f.nid)&&a(s[l.chNid])!==a(f.nid)){p+=V("سجل مزمنة برقم قومي مختلف؛ يحتاج مراجعة الهوية.");continue}const r={},d={};l.chHeaders.forEach((l,c)=>{r[c]=s[c],d[c]=l}),p+='<div class="mf-subrecord">'+j(r,Object.keys(r),d)+"</div>"}m+=q("الأمراض المزمنة",p||V(window.chronicIsLoaded?.()?"لا توجد زيارات لهذا SAP في مصدر المزمنة.":"بيانات المزمنة لم تكتمل بعد."),_.length+" زيارة");const v=window.__CHECKUP_EXECUTION_STATE__||{};p="";for(const[s,l]of[["periodic","الكشف الدوري"],["initiative","مبادرة الصحة"],["hearing","السمعيات"]]){const d=v[s],c=d?.bySap?.get(r.sap)||("initiative"===s&&f.nid?d?.byNid?.get(f.nid):null);p+='<div class="mf-subrecord"><strong>'+l+"</strong>"+(c?j(c,["done","date","dates","raw","statuses"],{done:"تم التنفيذ",date:"آخر تاريخ تنفيذ",dates:"تواريخ التنفيذ",raw:"الموقف المسجل",statuses:"المواقف المسجلة"}):V(d?.ready?"لا يوجد تنفيذ مسجل في المصدر المحمّل.":"لم تكتمل قراءة هذا المصدر."))+"</div>"}return m+=q("الدوري والمبادرة والسمعيات",p,"مصادر التنفيذ"),m}function Y(){return p.filter(s=>"all"===w||"ready"===w&&"ready"===s.status||"missing"===w&&["missing","empty"].includes(s.status)||"review"===w&&["duplicate","conflict","unavailable"].includes(s.status)).sort((s,r)=>!s.fileNo-!r.fileNo||k.compare(s.fileNo,r.fileNo)||k.compare(s.sap,r.sap))}function $(){
 if(!e('medicalFilesPanel'))return;
 const rows=Y(),has=p.length>0;
 e('mfWorkspace').hidden=!has;e('mfStats').hidden=!has;e('mfEmpty').hidden=has;
 e('mfExport').disabled=!p.some(item=>item.status!=='unavailable')||E;e('mfRefresh').disabled=!m.length||E;
 e('mfSearchGo').disabled=false;e('mfSearchGo').textContent=E?'جارٍ التحقق…':'⌕ بحث';e('mfSearchForm').setAttribute('aria-busy',String(E));
 e('mfStats').textContent=p.length+' نتيجة · '+p.filter(item=>item.status==='ready').length+' ملف مسجل · '+p.filter(item=>!['ready','unavailable'].includes(item.status)).length+' للمراجعة';
 e('mfPeople').innerHTML=rows.slice(0,g).map(item=>{
  const pending=pendingView(item.sap),number=pending?.value??item.fileNo;
  const label=pending?(pending.state==='error'?'التعديل لم يُحفظ':pending.state==='uncertain'?'بانتظار تأكيد Google':pending.state==='draft'?'تعديل قيد الإرسال':'جارٍ الحفظ'):(item._filesPreview?'آخر نسخة متاحة':item.status!=='ready'?s[item.status]:'');
  return '<div class="mf-person'+(item.sap===h?' active':'')+(pending?' mf-save-pending':'')+'"'+(pending?' aria-busy="true"':'')+'><button type="button" class="mf-open" data-mf-person="'+n(item.sap)+'" aria-label="عرض ملف '+n(item.name||item.sap)+'"><strong dir="ltr">'+n(number||'—')+'</strong><span><b>'+n(item.name||'SAP '+item.sap)+'</b><small dir="ltr">SAP '+n(item.sap)+'</small>'+(label?'<em>'+n(label)+'</em>':'')+'</span><i>التفاصيل ←</i></button><button type="button" data-mf-edit="'+n(item.sap)+'" aria-label="تعديل ملف SAP '+n(item.sap)+'" title="تعديل رقم الملف"'+(item.canEdit?'':' disabled')+'>✎</button></div>';
 }).join('')||V('لا توجد نتائج في هذا الاختيار.');
 e('mfMore').hidden=rows.length<=g;
 if(e('mfView').open){const states=[...e('mfDossier').querySelectorAll('.mf-section')].map(node=>node.open);e('mfDossier').innerHTML=K(p.find(item=>item.sap===h));e('mfDossier').querySelectorAll('.mf-section').forEach((node,idx)=>{if(idx<states.length)node.open=states[idx]})}
}

async function Q(s=!1){if(C)return C;const r=[];return!s&&window.__REFERENCE_WORKFORCE_READY__||!window.loadLookupSheet||r.push(Promise.resolve().then(()=>window.loadLookupSheet(s))),!s&&window.chronicIsLoaded?.()||!window.__chronicSheet||r.push(Promise.resolve().then(()=>window.__chronicSheet.load(s)).then(s=>{s.unchanged||(window.chronicApplyFreshData?.(s.headers,s.rows,s.updatedAt),window.__chronicSheet.commit?.(s))})),!s&&window.__mohLab?.info?.().loaded||r.push(Promise.resolve().then(()=>window.__mohLab?.refresh?.())),!s&&window.__labReviewModel?.sourceInfo?.().loaded||r.push(Promise.resolve().then(()=>window.__labReviewModel?.refresh?.())),!s&&window.__CHECKUP_EXECUTION_STATE__?.loaded||r.push(Promise.resolve().then(()=>window.loadCheckupSourceSheets?.(s))),C=Promise.allSettled(r).then(()=>{N=null,I()&&$()}).finally(()=>{C=null})}async function z(force=false){
 clearTimeout(searchInputTimer);
 const query=B(e('mfSearch').value);
 if(query.invalid.length)return G('صحّح القيم غير الصالحة: '+query.invalid.slice(0,5).join('، ')+'. المطلوب أرقام SAP فقط.',true);
 if(!query.saps.length||query.saps.length>500)return G('اكتب من 1 إلى 500 رقم SAP.',true);
 const ticket=++S,context=L(),generation=filesLookupGeneration;
 A=context;m=query.saps;E=true;
 const previous=knownFiles(query.saps);
 p=previous?previous.filter(window.__townMatches):[];
 h=p.some(item=>item.sap===h)?h:p[0]?.sap||'';w='all';e('mfFilter').value=w;g=30;
 G(previous?(previous.some(item=>item._filesPreview)?'رقم الملف من آخر قراءة ظاهر الآن · جارٍ التحقق من Google…':'آخر نتيجة مؤكدة ظاهرة الآن · جارٍ التحقق من Google…'):'جارٍ جلب رقم الملف…');$();
 try{
  const rows=[],batch=500;let checkedAt='';
  // Each group is independent. Keep at most three lookups in flight for large pastes.
  const groups=[];for(let at=0;at<query.saps.length;at+=batch)groups.push(query.saps.slice(at,at+batch));
  const received=new Array(groups.length);let next=0,serverSnapshot=false;
  async function worker(){while(next<groups.length){const at=next++,ids=groups[at];if(ticket!==S||context!==L()||generation!==filesLookupGeneration)return;
   const reply=await O('files_lookup',{saps:ids,fresh:true});
   if(ticket!==S||context!==L()||generation!==filesLookupGeneration)return;
   if(!reply?.success||!Array.isArray(reply.rows)||reply.rows.length!==ids.length||new Set(reply.rows.map(item=>String(item.sap))).size!==ids.length||reply.rows.some(item=>!ids.includes(String(item.sap))||!s[item.status]))throw Error('الرد غير مكتمل؛ لم نعتمد نتائج ناقصة.');
   received[at]=reply.rows;checkedAt=reply.checkedAt||checkedAt;serverSnapshot=serverSnapshot||reply.performance?.indexCache==='hit'||reply.performance?.referenceCache==='hit';
  }}
  await Promise.all(Array.from({length:Math.min(3,groups.length)},worker));
  if(ticket!==S||context!==L()||generation!==filesLookupGeneration)return;
  for(const group of received)rows.push(...group);
  if(rows.length!==query.saps.length||new Set(rows.map(item=>item.sap)).size!==query.saps.length)throw Error('نتائج البحث غير مكتملة؛ أعد المحاولة.');
  rememberFiles(rows);p=rows.filter(window.__townMatches);h=p.some(item=>item.sap===h)?h:p[0]?.sap||'';N=null;
  G((serverSnapshot?'تم تحميل آخر نسخة محفوظة للخدمة: ':'تم التحقق من ')+p.length+' رقم ملف'+(checkedAt?' · '+new Date(checkedAt).toLocaleTimeString('ar-EG'):'')+(query.duplicates?' · تجاهل '+query.duplicates+' تكرار SAP':''));
 }catch(error){if(ticket===S&&context===L()&&generation===filesLookupGeneration){if(/^(FILES_SESSION|FILES_REAUTH_REQUIRED|FILES_AUTH|TOKEN_EXPIRED|SESSION_EXPIRED|INVALID_TOKEN)$/.test(error.code||'')){filesLookupCache.clear();clearQuickFiles();p=[]}G((M(error)?'الخدمة مشغولة مؤقتًا؛ آخر نتائج مؤكدة متاحة.':error.message)+(p.length?' · المعروض آخر نتيجة مؤكدة.':''),true)}}
 finally{if(ticket===S){E=false;$()}}
}
function J(){
 clearTimeout(searchInputTimer);clearTimeout(editLookupTimer);clearTimeout(autoSaveTimer);e('mfView').close();++S;p=[];m=[];h='';N=null;E=false;A=L();e('mfSearch').value='';e('mfFilter').value=w='all';$();G('الحفظ مباشرة في Google Sheet.');
}
function resetFilesContext(){
 clearTimeout(autoSaveTimer);clearTimeout(editLookupTimer);++v;b=null;editProbePending=false;autoSavePaused=false;discardFileIntent=false;
 e('mfEdit').close();pendingFileDisplay.clear();J();clearQuickFiles();
}
function Z(){
 clearTimeout(autoSaveTimer);clearTimeout(editLookupTimer);
 if(_)return;
 if(b&&!x.has(b.sap))pendingFileDisplay.delete(b.sap);
 e('mfEdit').close();++v;b=null;editProbePending=false;autoSavePaused=false;discardFileIntent=false;$();
}
function ee(item,preserveDraft=false){
 const draft=e('mfEditNumber').value;b=item;const pending=x.get(item.sap);
 e('mfEditSap').value=item.sap;e('mfEditNumber').value=preserveDraft?draft:pending?pending.fileNo:item.fileNo||'';
 e('mfEditSap').disabled=!!pending;e('mfEditNumber').disabled=false;
 e('mfEditTitle').textContent=item.fileNo?'تحديث رقم الملف':'إضافة رقم ملف';
 e('mfEditPerson').textContent=(item.name||'الاسم غير متاح')+' · SAP '+item.sap+' · '+(item.workplace||'الموقع غير محدد')+' · الملف الحالي'+(item._filesPreview?' في آخر قراءة':'')+': '+(item.fileNo||'غير مسجل');
 e('mfSave').disabled=!item.canEdit||!item.revision||editProbePending;
 e('mfSave').textContent=pending?'إعادة التحقق بنفس العملية':'حفظ والتحقق من Google';
 e('mfEditNote').textContent=pending?'عملية لم يصل تأكيدها: '+pending.operationId:item._filesPreview?'يمكنك كتابة التعديل الآن أثناء التحقق من أحدث رقم.':item.status==='duplicate'?'رقم الملف الحالي مكرر؛ أدخل الرقم الصحيح بعد المراجعة.':item.referenceMissing?'SAP غير موجود في البيانات المرجعية؛ سيظهر للمركزي فقط حتى يُحدد موقعه في المصدر.':'';
}
function te(sap){
 if(_)return;clearTimeout(autoSaveTimer);const item=p.find(row=>row.sap===sap);b=null;++v;++editDraftSerial;editProbePending=false;autoSavePaused=false;discardFileIntent=false;
 e('mfEditForm').reset();e('mfEditSap').disabled=false;e('mfEditNumber').disabled=false;e('mfEditTitle').textContent='إضافة / تحديث ملف';e('mfEditNote').textContent='';e('mfEditPerson').textContent='اكتب SAP للتعرف على العامل ورقم ملفه الحالي.';e('mfSave').disabled=true;
 if(item)ee(item);e('mfEdit').showModal();e(item?'mfEditNumber':'mfEditSap').focus();
 if(item?._filesPreview||item&&!item.revision)ne();
}
async function ne(options={}){
 const sap=i(e('mfEditSap').value),ticket=++v,context=L(),epoch=d,serial=editDraftSerial,keep=options.preserveDraft===true;
 const oldDraft=e('mfEditNumber').value;b=null;e('mfSave').disabled=true;editProbePending=false;
 if(!/^\d{1,12}$/.test(sap)){if(sap)e('mfEditNote').textContent='اكتب رقم SAP صحيحًا.';return}
 e('mfEditPerson').textContent='جارٍ التحقق من العامل…';editProbePending=true;
 try{
  const cached=knownFiles([sap]);if(cached){ee(cached[0],keep);e('mfEditNote').textContent='رقم الملف ظاهر · جارٍ التحقق من أحدث رقم في Google…'}
  const reply=await O('files_lookup',{saps:[sap],fresh:true});
  if(ticket!==v||context!==L()||epoch!==d||!e('mfEdit').open)return;
  const item=reply.rows?.[0];if(reply.rows?.length!==1||item?.sap!==sap||!s[item.status]||typeof item.revision!=='string'&&item.status!=='unavailable')throw Error('لم يكتمل التحقق من العامل.');
  if(!window.__townMatches(item))throw Error('العامل خارج الموقع المختار. غيّر الاختيار من أعلى للبحث عنه.');
  rememberFiles([item]);editProbePending=false;
  const typed=editDraftSerial!==serial||keep;
  ee(item,typed);if(keep&&editDraftSerial===serial)e('mfEditNumber').value=oldDraft;
  if(typed&&o(e('mfEditNumber').value)!==item.fileNo){
   if(autoSavePaused)e('mfEditNote').textContent='تغيّر رقم الملف. القيمة الحالية ظاهرة أعلاه؛ راجع التعديل ثم اضغط حفظ.';
   else autoSaveFile();
  }
 }catch(error){if(ticket===v&&epoch===d){editProbePending=false;e('mfSave').disabled=true;e('mfEditNote').textContent=error.message}}
}
async function oe(event){
 const automatic=event.auto===true;event.preventDefault();clearTimeout(autoSaveTimer);
 if(automatic&&discardFileIntent)return;
 if(_||!b?.canEdit)return;
 if(editProbePending||!b.revision){e('mfEditNote').textContent='جارٍ التحقق من أحدث رقم قبل الحفظ…';return}
 if(automatic&&autoSavePaused)return;if(!automatic)autoSavePaused=false;
 const draft=o(e('mfEditNumber').value);
 if(!validFileDraft(draft)){e('mfEditNote').textContent='اكتب رقم ملف صحيحًا؛ لا تستخدم معادلة.';return}
 if(draft===b.fileNo&&!x.has(b.sap)){pendingFileDisplay.delete(b.sap);e('mfEditNote').textContent='رقم الملف محفوظ بالفعل.';$();return}
 filesLookupGeneration++;++S;E=false;
 const sap=b.sap,context=L(),epoch=d;
 const operation=x.get(sap)||{sap,fileNo:draft,revision:b.revision,operationId:'file_'+crypto.randomUUID().replace(/-/g,'')};
 x.set(sap,operation);_=true;pendingFileDisplay.set(sap,{value:draft,state:'saving'});
 e('mfSave').disabled=true;e('mfEditClose').disabled=true;e('mfCancel').disabled=true;e('mfEditSap').disabled=true;
 // Keep the number editable. A later complete draft is coalesced after this receipt is verified.
 e('mfEditNumber').disabled=false;e('mfEditNote').textContent='جارٍ الحفظ والتحقق الفعلي من Google…';$();
 let confirmed=false,reviewRequired=false;
 try{
  const reply=await O('files_save',operation);
  if(context!==L()||epoch!==d)return;
  if(!reply.success||!reply.verified||reply.operationId!==operation.operationId||reply.item?.sap!==operation.sap||reply.item?.fileNo!==operation.fileNo||!reply.item.revision)throw Error('لم يكتمل التحقق من الحفظ. أعد التحقق بنفس رقم العملية.');
  // Reads started DURING this write may still contain its pre-commit value.
  // Fence them again at the receipt, not only when the write was sent.
  filesLookupGeneration++;++S;E=false;
  confirmed=true;x.delete(sap);filesLookupCache.forEach((entry,key)=>{if(entry.item.sap===sap)filesLookupCache.delete(key)});rememberFiles([reply.item]);
  // Do not let an in-flight full snapshot replace a newer confirmed write.
  if(quickContext===context)quickFiles.set(sap,{...reply.item});
  b=reply.item;y=reply.operationId;e('mfReceiptId').textContent=y;e('mfReceipt').hidden=false;e('mfReceiptStatus').textContent='تم حفظ رقم الملف والتحقق من قراءته في Google.';
  const idx=p.findIndex(item=>item.sap===sap);if(idx>=0)p[idx]=reply.item;else if(m.length>=500){p=[reply.item];m=[sap]}else{p.unshift(reply.item);m=[...new Set([sap,...m])];e('mfSearch').value=m.join('\n')}
  h=sap;N=null;
  const latest=o(e('mfEditNumber').value),more=latest!==operation.fileNo;
  if(more)pendingFileDisplay.set(sap,{value:latest,state:'queued'});else pendingFileDisplay.delete(sap);
  G('✓ تم حفظ رقم الملف '+operation.fileNo+' في Google Sheet والتحقق منه.');
  if(automatic||more){ee(reply.item,true);e('mfEditNote').textContent=more?'تم تأكيد الحفظ السابق · جارٍ إرسال آخر تعديل.':'تم الحفظ والتحقق من Google · '+new Date().toLocaleTimeString('ar-EG')}
  else e('mfEdit').close();$();
 }catch(error){
  if(context!==L()||epoch!==d)return;
  const definitive=['FILES_STALE','FILES_NUMBER_USED','FILES_FORMULA','FILES_SCOPE','INVALID_FILE','REQUEST_CONFLICT','FILES_CHANGED_AFTER_SAVE'].includes(error.code);
  if(definitive){x.delete(sap);autoSavePaused=true;reviewRequired=error.code==='FILES_STALE';if(reviewRequired)b=null}
  pendingFileDisplay.set(sap,{value:o(e('mfEditNumber').value),state:definitive?'error':'uncertain'});
  e('mfEditNote').textContent=error.message+' · رقم العملية: '+operation.operationId;e('mfSave').textContent=x.has(sap)?'إعادة التحقق بنفس العملية':'راجع الرقم ثم احفظ';$();
 }finally{
  if(epoch!==d)return;
  _=false;e('mfEditClose').disabled=false;e('mfCancel').disabled=false;e('mfSave').disabled=!b?.canEdit;e('mfEditSap').disabled=x.has(sap);e('mfEditNumber').disabled=false;
  if(context!==L())return;
  if(reviewRequired&&e('mfEdit').open)ne({preserveDraft:true});
  else if(confirmed&&e('mfEdit').open&&b&&o(e('mfEditNumber').value)!==b.fileNo)autoSaveFile();
 }
}

async function ie(){
 if(!y)return;const context=L(),epoch=d,operationId=y;e('mfVerify').disabled=true;
 function current(){return context===L()&&epoch===d&&operationId===y}
 try{
  const receipt=await O('files_status',{operationId});if(!current())return;
  e('mfReceiptStatus').textContent=receipt.verified?receipt.currentMatches?'إيصال Google مؤكد، ورقم الملف الحالي مطابق.':'إيصال Google مؤكد، لكن رقم الملف تغيّر بعد هذه العملية. حدّث البحث.':'العملية لم تُعتمد بعد. أعد التحقق بنفس العملية قبل اعتبارها محفوظة.';
 }catch(error){if(current())e('mfReceiptStatus').textContent=error.message}
 finally{if(current())e('mfVerify').disabled=false}
}
async function ae(r=!1){if(e("mfExportFull").disabled)return;e("mfExportFull").disabled=!0;const l=Y().filter(s=>"unavailable"!==s.status);if(!l.length)return void(e("mfExportFull").disabled=!1);const d=L();e("mfExport").disabled=!0;const c=e("mfExport").textContent;e("mfExport").textContent="جارٍ تجهيز Excel…";try{if(r&&await Q(),await(window.__ensureExportLibraries?.()),d!==L())return;const c=XLSX.utils.book_new(),f=[["SAP","رقم الملف","الاسم","الرقم القومي","Work place","موقف الملف"]],u=[["SAP","رقم الملف","القسم","التسلسل","البيان","القيمة"]];for(const d of l){if(f.push([d.sap,d.fileNo,d.name,d.nid,d.workplace,s[d.status]]),!r)continue;const l=document.createElement("div");l.innerHTML=K(d);for(const[s,r]of[...l.querySelectorAll(".mf-section")].entries()){const s=r.querySelector("summary")?.firstChild?.textContent||"";for(const[l,c]of[...r.querySelectorAll(".mf-field")].entries())u.push([d.sap,d.fileNo,s,String(l+1),c.querySelector("small").textContent,c.querySelector("b").textContent]);for(const l of r.querySelectorAll(".mf-source-note"))u.push([d.sap,d.fileNo,s,"","ملاحظة المصدر",l.textContent])}}for(const[s,l]of r?[["الملفات",f],["السجل المجمع",u]]:[["أرقام الملفات",f]]){const r=XLSX.utils.aoa_to_sheet(l);window.__prepareExcelSheet?.(r,l),r["!views"]=[{RTL:!0}],XLSX.utils.book_append_sheet(c,r,s)}await window.__downloadReadyExcel(c,"الملفات_الطبية.xlsx")}catch(s){G("تعذر التصدير: "+s.message,!0)}finally{e("mfExportFull").disabled=!1,e("mfExport").textContent=c,e("mfExport").disabled=E||!p.length}}function se(){N=null,clearTimeout(l),l=setTimeout(()=>{I()&&p.length&&$()},150)}function re(){window.closeCheckupOperations?.(),"chronic"===document.body.dataset.activeInitiative&&window.setDashboardInitiative?.("oncology"),window.openDashboardTab("medicalFiles"),e("novaCloseNav")?.click()}function le(){const s=document.createElement("button");s.id="mfPageShortcut",s.type="button",s.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 6h7l2 3h9v12H3zM3 9h18M12 12v6M9 15h6"/></svg><span>الملفات الطبية</span>',document.querySelector("#uiSidebar .ui-sidebar-bottom").before(s),s.onclick=re,e("mfSearchForm").onsubmit=s=>{s.preventDefault(),z()},e("mfRefresh").onclick=()=>z(true),e("mfClear").onclick=J,e("mfFilter").onchange=s=>{w=s.target.value,g=30,$()},e("mfPeople").onclick=s=>{const r=s.target.closest("[data-mf-edit]"),l=s.target.closest("[data-mf-person]");var d;r?te(r.dataset.mfEdit):l&&(d=l.dataset.mfPerson,h=d,e("mfDossier").innerHTML="",e("mfView").showModal(),$(),Q())},e("mfMore").onclick=()=>{g+=30,$()},e("mfDossier").onclick=s=>{const r=s.target.closest("[data-mf-edit]");r&&te(r.dataset.mfEdit)},e("mfAdd").onclick=()=>te(),e("mfEditClose").onclick=e("mfCancel").onclick=Z,["mfEditClose","mfCancel"].forEach(id=>e(id).addEventListener("pointerdown",()=>{discardFileIntent=true;clearTimeout(autoSaveTimer)})),e("mfEdit").addEventListener("cancel",s=>{s.preventDefault();Z()}),e("mfEditSap").oninput=()=>{++v;++editDraftSerial;b=null;editProbePending=false;autoSavePaused=false;clearTimeout(editLookupTimer);clearTimeout(autoSaveTimer);e("mfEditNumber").value="";e("mfSave").disabled=true;const ids=B(e("mfEditSap").value);if(ids.saps.length===1&&knownFiles(ids.saps))ne();else editLookupTimer=setTimeout(ne,200)},e("mfEditSap").onblur=()=>{clearTimeout(editLookupTimer);ne()},e("mfEditNumber").oninput=autoSaveFile,e("mfEditNumber").onblur=event=>{clearTimeout(autoSaveTimer);if(discardFileIntent||["mfCancel","mfEditClose","mfSave"].includes(event?.relatedTarget?.id))return;if(!_&&b?.canEdit&&!editProbePending&&b.revision&&!autoSavePaused&&!x.has(b.sap)&&o(e("mfEditNumber").value)!==b.fileNo)oe({preventDefault(){},auto:true})},e("mfEditForm").onsubmit=oe,e("mfVerify").onclick=ie,e("mfExport").onclick=()=>ae(),e("mfExportFull").onclick=()=>ae(!0),e("mfViewClose").onclick=()=>e("mfView").close(),e("mfSearch").oninput=()=>{clearTimeout(searchInputTimer);const query=B(e("mfSearch").value);if(!query.invalid.length&&query.saps.length===1){if(knownFiles(query.saps))z();else searchInputTimer=setTimeout(()=>z(),220)}},e("mfSearch").onkeydown=s=>{s.ctrlKey&&"Enter"===s.key&&(s.preventDefault(),z())},new MutationObserver(()=>{A&&A!==L()&&resetFilesContext(),e("mfPageShortcut").setAttribute("aria-current",I()?"page":"false");scheduleQuickFiles()}).observe(document.body,{attributes:!0,attributeFilter:["data-active-tab","data-active-region","data-active-initiative","data-checkups-open"]}),A=L();scheduleQuickFiles()}window.__medicalSignIn=(user,password)=>{
 ++d;c=null;f='';u=null;discardFileCapability();filesLookupCache.clear();clearQuickFiles();quickUnsupported=false;quickLastAttempt=0;pendingFileDisplay.clear();x.clear();_=false;b=null;editProbePending=false;autoSavePaused=false;clearTimeout(autoSaveTimer);clearTimeout(editLookupTimer);clearTimeout(searchInputTimer);e('mfEdit')?.close();if(e('mfVerify'))e('mfVerify').disabled=false;y='';if(e('mfReceipt'))e('mfReceipt').hidden=true;de={user:String(user),password:String(password)};
 return filesSession().then(session=>{scheduleQuickFiles();return session}).catch(error=>{f=error.message||'تعذر تفعيل خدمة الملفات';console.warn('OPM files sign-in',{code:error.code||'SERVICE_ERROR'});return null});
},document.addEventListener("elAuthStateChanged",s=>{s.detail?.locked&&(++d,c=null,f="",u=null,de=null,discardFileCapability(),filesLookupCache.clear(),clearQuickFiles(),pendingFileDisplay.clear(),editProbePending=false,autoSavePaused=false,clearTimeout(autoSaveTimer),clearTimeout(searchInputTimer),clearTimeout(editLookupTimer),x.clear(),y="",++v,_=!1,b=null,e("mfEdit")?.close(),e("mfSearch")&&(J(),e("mfReceipt").hidden=!0))});for(const s of["dataUpdated","referenceWorkforceUpdated","lookupUpdated","mohLabUpdated","labHandoverUpdated","labReviewSourceUpdated","checkupSourcesUpdated","chronicDataUpdated"])document.addEventListener(s,se);document.addEventListener("dashboardRegionChanged",()=>{A&&A!==L()&&resetFilesContext();scheduleQuickFiles()}),document.addEventListener("visibilitychange",scheduleQuickFiles);window.addEventListener?.("beforeunload",event=>{if(_||x.size||pendingFileDisplay.size){event.preventDefault();event.returnValue=""}});window.__medicalFiles={enter:re,search:z,parse:B,refresh:()=>z(true),dossier:K,scope:P,request:O,cacheInfo:()=>({entries:filesLookupCache.size,scope:P(),quickEntries:quickFiles.size,quickAt,quickContext,writing:_,pending:x.size}),warm:()=>warmFiles(true)},"loading"===document.readyState?document.addEventListener("DOMContentLoaded",le,{once:!0}):le()})();
