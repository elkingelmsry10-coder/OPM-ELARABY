(()=>{
'use strict';
if(window.__OPM_ATTENDANCE_VISUAL_V169__)return;
window.__OPM_ATTENDANCE_VISUAL_V169__=true;
const PREFIX='opm.attendance.visualChanges.v169.';
const dayOf=(date=new Date())=>{
  const t=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{
    timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(date).map(x=>[x.type,x.value]));
  return t.year+'-'+t.month+'-'+t.day;
};
const digest=(source)=>{
  const text=String(source||'');let a=2166136261,b=0x9e3779b9;
  for(let i=0;i<text.length;i++){
    const x=text.charCodeAt(i);a=Math.imul(a^x,16777619)>>>0;
    b=(Math.imul(b^x,2246822519)+3266489917)>>>0;
  }
  return text.length.toString(36)+'-'+a.toString(36)+'-'+b.toString(36);
};
const fallback=new Map();
function load(day){
  try{
    const raw=localStorage.getItem(PREFIX+day),o=raw&&JSON.parse(raw);
    if(o&&o.day===day&&Number.isSafeInteger(o.count)&&o.count>0&&typeof o.hash==='string')return o;
  }catch(_){}
  return fallback.get(day)||null;
}
function save(day,record){
  fallback.set(day,record);
  try{localStorage.setItem(PREFIX+day,JSON.stringify(record));}catch(_){}
}
function isRealSource(a){
  return !!(a&&a.loaded&&!a.loading&&!a.error&&!a.cached&&a.day===dayOf()&&
    Number(a.count)>0&&a.dayVerified!==false&&Array.isArray(a.rows));
}
function track(){
  const a=window.__ATTENDANCE_STATE__;
  // Only a real successful fetch updates the count. Never touch the attendance state.
  if(!isRealSource(a))return;
  if(typeof window.__opmSnapshotSignature!=='function')return;
  const day=dayOf();const hash=digest(window.__opmSnapshotSignature(a.rows));
  const previous=load(day);
  if(previous&&previous.hash===hash)return;
  const now=new Date();const record={day,hash,count:previous?previous.count+1:1,changedAt:now.toISOString()};
  save(day,record);
}
function tinyStamp(iso){
  const d=new Date(iso);if(!Number.isFinite(d.getTime()))return '';
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{
    timeZone:'Africa/Cairo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false
  }).formatToParts(d).map(x=>[x.type,x.value]));
  const h=Number(p.hour);return p.day+'/'+p.month+' · '+String(h%12||12).padStart(2,'0')+':'+p.minute+(h>=12?'م':'ص');
}
let pending=false;
function update(){
  pending=false;
  const bar=document.getElementById('dualRefreshBar');if(!bar)return;
  let el=document.getElementById('attendanceSourceClock');
  if(!el){
    el=document.createElement('span');el.id='attendanceSourceClock';
    el.setAttribute('role','status');el.setAttribute('aria-live','polite');
    el.innerHTML='<span class="attendance-clock-dot" aria-hidden="true"></span><strong></strong>';
    const button=bar.querySelector('#opm-unified-update');
    if(button)button.before(el);else bar.appendChild(el);
  }
  const a=window.__ATTENDANCE_STATE__||{};
  // Loading an existing cache is not a new event. Display the stored history, if any.
  const record=load(dayOf());
  const todayValid=!!a.loaded&&a.day===dayOf()&&Number(a.count)>0&&a.dayVerified!==false;
  const ready=todayValid&&record&&record.changedAt;
  const display=ready?'تحديث الحضور '+record.count+' · '+tinyStamp(record.changedAt):
    a.error?'تعذر تحديث الحضور':'الحضور لم يتوفر بعد';
  const longText=ready?'تحديث الحضور رقم '+record.count+'، آخر اختلاف فعلي '+record.changedAt:
    a.error?'تعذر الوصول إلى بيانات الحضور؛ لم يتم اعتبار ذلك تحديثًا جديدًا':'لم تتوفر بيانات حضور معتمدة حتى الآن';
  el.dataset.state=ready?'ready':a.error?'warning':'waiting';
  const text=el.querySelector('strong');if(text&&text.textContent!==display)text.textContent=display;
  el.title=longText;el.setAttribute('aria-label',longText);
}
function queue(){if(!pending){pending=true;requestAnimationFrame(update)}}
function attendanceEvent(){try{track()}catch(error){console.warn('[attendance visual]',error)}queue()}
document.addEventListener('attendanceUpdated',attendanceEvent);
document.addEventListener('attendanceStatusChanged',attendanceEvent);
document.addEventListener('visibilitychange',queue);
window.addEventListener('storage',event=>{if(event.key?.startsWith(PREFIX))queue()});
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',queue,{once:true}):queue();
})();