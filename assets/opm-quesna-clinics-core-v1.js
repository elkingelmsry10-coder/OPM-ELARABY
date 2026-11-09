/* OPM Quesna Clinics — deterministic, dependency-free calculation core.
   No network, storage or DOM operations. Source snapshots remain immutable. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.OPM_QNS_CORE=api;
})(typeof window!=="undefined"?window:undefined,function(){
"use strict";
const clinics=[
{id:"admin",name:"عيادة الإدارة",emoji:"🏢",buildings:["ورشة صيانة السيارات","مركز خدمة الـ 14","مبنى اللمبات","الأمن","مبنى المكونات","مبنى الزجاج","شئون إدارية","سلامة وصحة مهنية","مبنى الفوم","مبنى الحركة","مبنى التكييف","مبنى بلاستيك التكييف"]},
{id:"vision",name:"عيادة المرأية",emoji:"👁️",buildings:["مبنى مخازن الإنتاج التام","TEVP","مبنى الـ 50"]},
{id:"panels",name:"عيادة اللوحات",emoji:"⚡",buildings:["مبنى بلاستيك الهندسية","مبنى تجاميع اللوحات","مبنى الغسالة","مبنى الغسالة - الفندق","مبنى الغسالة B"]},
{id:"laundry",name:"عيادة الغسالة",emoji:"🧺",buildings:["مبنى الغسالة","مبنى الغسالة - الفندق","مبنى الغسالة B","مبنى بلاستيك الهندسية","مبنى تجاميع اللوحات"]},
{id:"ac",name:"عيادة التكييف",emoji:"❄️",buildings:["مبنى التكييف","مبنى بلاستيك التكييف"]},
{id:"fridge",name:"عيادة الثلاجة",emoji:"🧊",buildings:["مبنى الثلاجة الجديدة","مبنى الثلاجة القديمة","مبنى الموارد البشرية","المدرسة","مبنى السخان"]},
{id:"heater",name:"عيادة السخان",emoji:"🔥",buildings:["مبنى السخان","المؤسسة"]}
];
const byId=new Map(clinics.map(c=>[c.id,c]));
function norm(x){return String(x??"").normalize("NFKC").toLowerCase().replace(/[\u064b-\u065f\u0670\u0640\u200e\u200f\ufeff]/g,"").replace(/[إأآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/\s+/g," ").trim()}
const names = new Map();
for(const c of clinics)for(const name of c.buildings){
  const key=norm(name);
  if(!names.has(key))names.set(key,{name,eligible:[]});
  if(!names.get(key).eligible.includes(c.id))names.get(key).eligible.push(c.id);
}
const buildings=[...names.values()].map(b=>Object.freeze({name:b.name,eligible:Object.freeze([...b.eligible])}));
function nonnegative(x,max=1000000){
 if(x===null||x===undefined||x==="")return null;
 if(typeof x==="string"&&!/^\s*[0-9]+\s*$/.test(x))return null;
 const n=Number(x);return Number.isSafeInteger(n)&&n>=0&&n<=max?n:null;
}
function defaultConfig(){return {capacities:Object.fromEntries(clinics.map(c=>[c.id,null])),primary:{},neighbors:Object.fromEntries(clinics.map(c=>[c.id,[]]))}}
function sanitizeConfig(value){
 const v=value||{},clean=defaultConfig();
 for(const c of clinics){
  clean.capacities[c.id]=nonnegative(v.capacities?.[c.id],100000);
  const ns=v.neighbors?.[c.id];
  clean.neighbors[c.id]=Array.isArray(ns)?[...new Set(ns.filter(id=>byId.has(id)&&id!==c.id))]:[];
 }
 for(const b of buildings){
  const choice=v.primary?.[b.name];
  if(b.eligible.includes(choice))clean.primary[b.name]=choice;
 }
 return clean;
}
function sanitizeData(rows){
 if(!Array.isArray(rows))throw new Error("مصدر التوزيع لا يحتوي على قائمة مبانٍ صالحة");
 const data=new Map(),errors=[];
 for(const r of rows){
  const rawName=String(r?.name??r?.building??r?.["المبنى"]??"").trim();
  const b=names.get(norm(rawName));
  if(!b){errors.push("مبنى غير مطابق للتقسيمة: "+rawName);continue}
  const key=norm(b.name);
  if(data.has(key)){errors.push("تكرار مبنى في المصدر: "+b.name);continue}
  const av=r?.attendance??r?.["الحضور الفعلي"],tv=r?.target??r?.["المستهدف"];
  const attendance=nonnegative(av),target=nonnegative(tv);
  if(av!==undefined&&av!==null&&av!==""&&attendance===null)errors.push("حضور غير صالح: "+b.name);
  if(tv!==undefined&&tv!==null&&tv!==""&&target===null)errors.push("مستهدف غير صالح: "+b.name);
  data.set(key,{name:b.name,attendance,target});
 }
 return {data,errors};
}
function calculate(rawRows,rawConfig){
 const config=sanitizeConfig(rawConfig),{data,errors}=sanitizeData(rawRows);
 const left=Object.fromEntries(clinics.map(c=>[c.id,config.capacities[c.id]]));
 const clinicsTotal=Object.fromEntries(clinics.map(c=>[c.id,0]));
 const report={demand:0,allocated:0,unallocated:0,actual:0,fallback:0,missing:0,ambiguous:0,unmapped:errors.length};
 const rows=[];
 for(const b of buildings){
  const rec=data.get(norm(b.name));
  let source="غير متوفر",qty=null;
  if(rec){
   if(rec.attendance!==null&&rec.attendance>0){qty=rec.attendance;source="الحضور الفعلي"}
   else if(rec.target!==null){qty=rec.target;source=rec.attendance===0?"المستهدف (الحضور = 0)":"المستهدف (لم يسجل حضور)"}
  }
  const primary=config.primary[b.name]||(b.eligible.length===1?b.eligible[0]:null);
  const row={building:b.name,qty,source,primary,eligible:[...b.eligible],routes:[],unallocated:0,reason:""};
  if(qty===null){report.missing++;row.reason="لم تتوفر بيانات المستهدف أو الحضور";rows.push(row);continue}
  report.demand+=qty;
  if(source==="الحضور الفعلي")report.actual+=qty;else report.fallback+=qty;
  if(qty===0){row.reason="لا يوجد عدد للتوجيه";rows.push(row);continue}
  if(!primary){report.ambiguous++;row.reason="مبنى مشترك يحتاج اعتماد العيادة الأساسية";row.unallocated=qty;report.unallocated+=qty;rows.push(row);continue}
  let unallocated=qty,from=1;
  // Deterministic route order; only explicitly approved adjacent clinics are used.
  const choices=[primary,...config.neighbors[primary]];
  for(const id of choices){
   const room=left[id];if(room===null||unallocated===0)continue;
   const take=Math.min(room,unallocated);
   if(take<=0)continue;
   row.routes.push({clinic:id,qty:take,from,to:from+take-1,overflow:id!==primary});
   left[id]-=take;clinicsTotal[id]+=take;from+=take;unallocated-=take;
  }
  row.unallocated=unallocated;report.allocated+=qty-unallocated;report.unallocated+=unallocated;
  row.reason=unallocated?"فائض غير موزع؛ لا توجد سعة/عيادة بديلة معتمدة":row.routes.some(r=>r.overflow)?"تم ترحيل الفائض إلى عيادة بديلة معتمدة":"العيادة الأساسية";
  rows.push(row);
 }
 const blocked=report.unallocated>0||report.missing>0||report.unmapped>0;
 return {rows,config,clinicsTotal,left,report,errors,blocked,
  buildingsCount:buildings.length,clinicsCount:clinics.length};
}
return {clinics,buildings,norm,nonnegative,defaultConfig,sanitizeConfig,sanitizeData,calculate};
});
