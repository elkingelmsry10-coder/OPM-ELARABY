/* Pure routing engine for Quesna clinic preview.
 * Assign only to the clinics explicitly listed for a building. All transfers are
 * traceable. Undefined capacity is NOT an assertion of physical availability.
 * No network / DOM / state writes. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.OPM_QNS_BALANCE=api;
})(typeof window!=='undefined'?window:undefined,function(){
 'use strict';
 const zero=()=>({total:0,fit:0,psa:0,both:0,unknown:0});
 function add(s,p){s.total++;if(p?.fit&&p?.psa)s.both++;else if(p?.fit)s.fit++;else if(p?.psa)s.psa++;else s.unknown++;return s;}
 function merge(a,b){for(const k of ['total','fit','psa','both','unknown'])a[k]+=b?.[k]||0;return a;}
 function stats(list){return(list||[]).reduce((s,p)=>add(s,p),zero());}
 function calc(groups,clinics,config={}){
  if(!Array.isArray(groups)||!Array.isArray(clinics))throw Error('Invalid plan input');
  const capacities=config.capacity||{},primaryMap=config.primary||{};
  // Missing activeClinics means all clinics open (backward compatible).
  // An explicitly empty list means every clinic is closed for this local day preview.
  const allClinicIds=new Set(clinics.map(c=>c.id));
  const requested=Array.isArray(config.activeClinics)?config.activeClinics.filter(id=>allClinicIds.has(id)):null;
  const activeIds=new Set(requested===null?clinics.map(c=>c.id):requested);
  const byClinic=new Map(clinics.map(c=>[c.id,{...c,total:0,stats:zero(),buildings:[],active:activeIds.has(c.id),capacity:typeof capacities[c.id]==='number'&&Number.isSafeInteger(capacities[c.id])&&capacities[c.id]>=0?capacities[c.id]:null}]));
  const records=new Map(),transfers=new Map(),unallocated=[],ambiguous=[],baseline=new Map(clinics.map(c=>[c.id,0]));
  const missing=[],unmatched=[],matched=groups.filter(g=>g?.match&&Array.isArray(g.people)&&g.people.length);
  for(const g of groups){if(!g?.people?.length)continue;if(!g.match){missing.push({building:g.building||'بدون مبنى',count:g.people.length,stats:stats(g.people)});unmatched.push(...g.people);}}
  const fixed=matched.filter(g=>g.match.eligible.length===1);
  const shared=matched.filter(g=>g.match.eligible.length>1);
  // First place fixed buildings, then balance flexible buildings using the resulting loads.
  const input=[...fixed,...shared];
  let assigned=0;
  const peopleCount=groups.reduce((n,g)=>n+(g?.people?.length||0),0);
  const allPersons=groups.flatMap(g=>g?.people||[]);
  for(const g of input){
   const official=g.match.eligible.filter(cid=>byClinic.has(cid));
   const officialPrimary=official.includes(primaryMap[g.match.name])?primaryMap[g.match.name]:null;
   const from=officialPrimary||official[0]||null;
   if(from)baseline.set(from,(baseline.get(from)||0)+g.people.length);
   const eligible=official.filter(cid=>activeIds.has(cid));
   if(!eligible.length){
    const reason=official.length?'لا توجد عيادة عاملة اليوم مسموح لها بهذا المبنى':'لا توجد عيادة مسموح بها للمبنى';
    unallocated.push({building:g.match.name,count:g.people.length,stats:stats(g.people),reason});continue;
   }
   if(official.length>1&&!officialPrimary)ambiguous.push(g.match.name);
   const ordered=[...g.people].sort((a,b)=>String(a.sap||a.nid||'').localeCompare(String(b.sap||b.nid||''),'en',{numeric:true}));
   for(const p of ordered){
    const available=eligible.filter(cid=>{
     const item=byClinic.get(cid);
     return item.capacity==null||item.total<item.capacity;
    });
    if(!available.length){
     const last=unallocated[unallocated.length-1];
     if(last?.building===g.match.name&&last.reason==='السعة لا تكفي داخل العيادات المسموح بها'){last.count++;add(last.stats,p);}
     else unallocated.push({building:g.match.name,count:1,stats:add(zero(),p),reason:'السعة لا تكفي داخل العيادات المسموح بها'});
     continue;
    }
    let cid;
    if(officialPrimary&&activeIds.has(from)){
     // A manually chosen open primary remains authoritative, except when full.
     cid=available.includes(from)?from:available.reduce((best,id)=>byClinic.get(id).total<byClinic.get(best).total?id:best,available[0]);
    }else{
     cid=available.reduce((best,id)=>{
      if(!best)return id;
      const c=byClinic.get(id),a=byClinic.get(best);
      const scoreC=c.capacity==null?c.total:c.total/Math.max(1,c.capacity);
      const scoreA=a.capacity==null?a.total:a.total/Math.max(1,a.capacity);
      return scoreC<scoreA-1e-9?id:best;
     },null);
    }
    const clinic=byClinic.get(cid);clinic.total++;add(clinic.stats,p);assigned++;
    const transferred=cid!==from;
    const reason=transferred?(!activeIds.has(from)?'العيادة المرجعية غير عاملة اليوم':officialPrimary?'اكتمال سعة العيادة الأساسية':'موازنة بين العيادات المسموح بها'):(officialPrimary?'اختيار العيادة الأساسية':'توزيع وفق التقسيمة الرسمية');
    const key=g.match.name+'\u0000'+cid;
    if(!records.has(key))records.set(key,{building:g.match.name,clinic:cid,from,count:0,stats:zero(),people:[],split:eligible.length>1,overflow:transferred,reason});
    const rec=records.get(key);rec.count++;add(rec.stats,p);rec.people.push(p);
    if(transferred){const key2=g.match.name+'\u0000'+from+'\u0000'+cid+'\u0000'+reason;
     if(!transfers.has(key2))transfers.set(key2,{building:g.match.name,from,to:cid,count:0,stats:zero(),reason});
     const tr=transfers.get(key2);tr.count++;add(tr.stats,p);
    }
   }
  }
  const rows=[...records.values()].sort((a,b)=>a.building.localeCompare(b.building,'ar')||a.clinic.localeCompare(b.clinic,'ar'));
  for(const r of rows)byClinic.get(r.clinic).buildings.push({building:r.building,count:r.count,stats:r.stats,transferred:r.overflow,from:r.from,reason:r.reason});
  const out=[...byClinic.values()];
  const pending=peopleCount-assigned;
  const transferList=[...transfers.values()].sort((a,b)=>b.count-a.count||a.building.localeCompare(b.building,'ar'));
  const totals=stats(allPersons),assignedStats=rows.reduce((s,r)=>merge(s,r.stats),zero()),missingTotal=missing.reduce((s,r)=>s+r.count,0);
  return {allocated:out,records:rows,transfers:transferList,baseline:Object.fromEntries(baseline),missing,unallocated,ambiguous,
   demand:peopleCount,assigned,pending,matched:peopleCount-missingTotal,other:missingTotal,unallocatedCount:unallocated.reduce((n,r)=>n+r.count,0),
   buildingsWithPeople:matched.length,totals,assignedStats,
   transferCount:transferList.reduce((n,r)=>n+r.count,0),
   fixedOnlyCount:fixed.reduce((n,g)=>n+g.people.length,0),sharedCount:shared.reduce((n,g)=>n+g.people.length,0),
   activeClinics:[...activeIds],activeCount:activeIds.size,
   capacityComplete:out.filter(c=>c.active).every(c=>c.capacity!=null),
   limits:!shared.length?'لا توجد مبانٍ مشتركة لإعادة توزيعها.': 'التوازن محصور في عيادات المباني المسموح بها؛ لا يشمل نقلًا لعيادات أخرى بدون اعتماد.'};
 }
 return {calculate:calc,emptyStats:zero,addStats:merge,statsFromPeople:stats};
});
