(()=>{"use strict";
const clean=v=>String(v??"").normalize("NFKC").replace(/[٠-٩]/g,c=>"٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/[۰-۹]/g,c=>"۰۱۲۳۴۵۶۷۸۹".indexOf(c)).replace(/[\u200e\u200f\ufeff]/g,"").replace(/[\u064b-\u065f\u0670\u0640]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/\s+/g," ").trim().toLowerCase();
const sap=v=>{const s=clean(v).replace(/^['"]+|['"]+$/g,"").replace(/\.0+$/,"");return /^\d{1,12}$/.test(s)?s.replace(/^0+(?=\d)/,""):""};
let cache=null;
function index(){
 const refs=window.__REFERENCE_WORKFORCE__||[], rev=window.__opmReferenceRevision||0;
 if(cache?.refs===refs&&cache.length===refs.length&&cache.rev===rev)return cache;
 const people=new Map(),explicit=new Map();
 for(const row of refs){
  const id=sap(row.sap??row.SAP),name=clean(row.name),nid=clean(row.nid);
  if(id){let p=people.get(id);if(!p)people.set(id,p={names:new Set(),nids:new Set()});if(name)p.names.add(name);if(nid)p.nids.add(nid);}
  const mid=sap(row.managerSap??row.managerSAP??row.managerId??row.manager_sap??row["SAP المدير"]??row["رقم ساب المدير"]);
  if(mid&&row.manager){let names=explicit.get(mid);if(!names)explicit.set(mid,names=new Set());names.add(clean(row.manager));}
 }
 return cache={refs,length:refs.length,rev,people,explicit};
}
function namesForSap(value){
 const id=sap(value);if(!id)return null;
 const {people,explicit}=index(),out=new Set(explicit.get(id)||[]),person=people.get(id);
 if(person?.names.size===1&&person.nids.size<=1)person.names.forEach(n=>out.add(n));
 return out;
}
window.__opmManagerSearch={normalize:clean,namesForSap,matches:(name,query)=>!clean(query)||clean(name).includes(clean(query))||!!namesForSap(query)?.has(clean(name))};
})();
