/* OPM quality rules. Pure functions shared by UI and reproducible tests. */
(function (root) {
  'use strict';
  const text = value => String(value ?? '').trim();
  const norm = value => text(value).normalize('NFKC').replace(/[\u200e\u200f\ufeffـًٌٍَُِّْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').toLowerCase();
  const id = value => {
    let s = text(value).normalize('NFKC').replace(/[٠-٩]/g, x => '٠١٢٣٤٥٦٧٨٩'.indexOf(x)).replace(/[۰-۹]/g, x => '۰۱۲۳۴۵۶۷۸۹'.indexOf(x)).replace(/[\s\u200b-\u200f\ufeff]/g, '').replace(/^'/, '').replace(/\.0+$/, '');
    return /^\d+$/.test(s) && !/^0+$/.test(s) ? s.replace(/^0+(?=\d)/, '') : '';
  };
  const cairoDay = value => {
    const d = value instanceof Date ? value : new Date(value ?? Date.now());
    if (!Number.isFinite(+d)) return '';
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone:'Africa/Cairo', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(d).map(x => [x.type,x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  };
  function sameIdentity(a, b) {
    const s = id(a.sap || a.id), t = id(b.sap || b.id), n = id(a.nid), m = id(b.nid);
    if (s && t && s !== t || n && m && n !== m) return false;
    return !!(s && t && s === t || n && m && n === m);
  }
  function ministryFit(rows, person, requiredYear = 0) {
    return rows.some(row => {
      if (!sameIdentity(row, person)) return false;
      if (!/^فرق (?:ال)?وزاره$/.test(norm(row.lab || row.analysisProvider || row['جهة التحليل']))) return false;
      if (!/\bFIT\b/i.test(text(row.required || row.type || row['التحليل']))) return false;
      const status = norm(row.labStatus || row.fitStatus || row['حالة التحليل']);
      if (!/^(?:(?:المريض )?(?:استلم|سلم) (?:الكاب|الكب)|(?:تم )?(?:استلام|تسليم) (?:الكاب|الكب))$/.test(status)) return false;
      const year = Number(row.requiredYear || row.targetYear || row.analysisYear || (text(row.fitDate).match(/^20\d{2}/) || [])[0] || 0);
      return !requiredYear || year > 0 && year >= requiredYear;
    });
  }
  function attendanceRow(values, headers, meta = {}) {
    const hs = headers.map(norm), find = labels => hs.findIndex(h => labels.includes(h));
    const get = labels => {const n = find(labels); return n < 0 ? '' : values[n];};
    return {id:id(values[0]), status:text(values[1]), stamp:text(values[7]),
      nid:id(get(['الرقم القومي','national id','nid'])),
      date:get(['تاريخ الحضور','attendance date','work date','تاريخ البصمه','التاريخ','date']),
      attendanceTime:(()=>{const v=get(['وقت الحضور','وقت البصمه','attendance time','time']);return Array.isArray(v)?v.slice(0,3).map(x=>String(x).padStart(2,'0')).join(':'):v})(),
      timestamp:get(['attendance timestamp','توقيت الحضور','توقيت البصمه']),
      sourceDay:meta.day || ''};
  }
  function resolveAttendance(rows, day, parseDay, siteCodes, sourceDay = '') {
    const groups = new Map(), conflicts = [], invalid = [], nidSaps=new Map();
    const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
    const parts=ms=>Object.fromEntries(formatter.formatToParts(new Date(ms)).map(x=>[x.type,x.value]));
    const wallUTC=Date.parse(day+'T12:00:00Z'),offsets=new Set([-24,0,24].map(h=>{const ms=wallUTC+h*3600000,p=parts(ms);return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second)-ms;}));
    const localTimes=new Map();
    function localEpoch(h,m,s){const key=[h,m,s].join(':');if(localTimes.has(key))return localTimes.get(key);const wall=Date.parse(day+'T'+[h,m,s].map(x=>String(x).padStart(2,'0')).join(':')+'Z'),matches=[];
      for(const offset of offsets){const candidate=wall-offset,p=parts(candidate);if(`${p.year}-${p.month}-${p.day}`===day&&+p.hour===h&&+p.minute===m&&+p.second===s)matches.push(candidate);}
      const value=matches.length===1?matches[0]:null;localTimes.set(key,value);return value;
    }
    for (const row of rows || []) {
      const sap = id(row.id || row.sap), nid = id(row.nid);
      if (!sap || !/^(حضور|حاضر|present|p|1|نعم|true)$/i.test(text(row.status).replace(/\s/g, ''))) continue;
      const dated = row.date || row.timestamp || row.sourceDay || sourceDay;
      const actualDay = parseDay(dated);
      if (actualDay !== day) {invalid.push({sap, reason:actualDay ? 'previous-day' : 'missing-date'});continue;}
      if(row.timestamp&&parseDay(row.timestamp)&&parseDay(row.timestamp)!==actualDay){invalid.push({sap,reason:'conflicting-date'});continue;}
      const codes = [...siteCodes(row.stamp)];
      const site = codes.length === 1 ? codes[0] : codes.length ? '' : norm(row.stamp) ? 'OTHER:'+norm(row.stamp) : '';
      let time = null;
      const ts = text(row.timestamp);
      if (/T\d{2}:\d{2}.*(?:Z|[+-]\d\d:\d\d)$/.test(ts) && Number.isFinite(Date.parse(ts))) time = Date.parse(ts);
      else {const t = text(row.attendanceTime).match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|ص|م)?$/i); if(t&&+t[2]<60&&+(t[3]||0)<60){let h=+t[1];if(t[4]&&h>=1&&h<=12)h=h%12+(/PM|م/i.test(t[4])?12:0);else if(t[4])h=-1;if(h>=0&&h<24)time=localEpoch(h,+t[2],+(t[3]||0));}}
      const list=groups.get(sap)||[];list.push({row,sap,nid,site,time});groups.set(sap,list);
      if(nid){const ids=nidSaps.get(nid)||new Set();ids.add(sap);nidSaps.set(nid,ids);}
    }
    const accepted = [], ids = new Set(), stampCodesBySap = new Map(), stampTextBySap = new Map();
    for(const [sap,list] of groups) {
      const nids = new Set(list.map(x=>x.nid).filter(Boolean));
      const sites = new Set(list.map(x=>x.site));
      let chosen;
      const identityConflict=nids.size>1||[...nids].some(n=>nidSaps.get(n).size>1);
      if(identityConflict || sites.has('')) {conflicts.push({sap,reason:identityConflict?'identity-conflict':'missing-site'});continue;}
      if(sites.size===1) chosen=list.reduce((a,b)=>(b.time??-1)>(a.time??-1)?b:a);
      else if(list.some(x=>x.time===null)) {conflicts.push({sap,reason:'missing-time'});continue;}
      else {
        const last=Math.max(...list.map(x=>x.time)), top=list.filter(x=>x.time===last);
        if(new Set(top.map(x=>x.site)).size!==1){conflicts.push({sap,reason:'equal-time'});continue;}
        chosen=top[0];
      }
      ids.add(sap);accepted.push(chosen.row);
      stampCodesBySap.set(sap,new Set(chosen.site.startsWith('OTHER:')?[]:[chosen.site]));
      stampTextBySap.set(sap,[chosen.row.stamp]);
    }
    return {accepted,ids,stampCodesBySap,stampTextBySap,conflicts,invalid,count:ids.size};
  }
  function attendanceSnapshot(state,day,parseDay,siteCodes){
    const rows=Array.isArray(state.rows)?state.rows:[],receipt=state.receipt;
    const resolved=resolveAttendance(rows,day,parseDay,siteCodes,receipt?.day===day&&receipt?.committed?day:'');
    const parsed=resolved.accepted.filter(row=>siteCodes(row.stamp).size).length;
    const verified=resolved.accepted.length>0||rows.some(row=>parseDay(row.date||row.timestamp||row.sourceDay)===day)||receipt?.day===day&&receipt?.committed===true;
    return {...state,day,rows,ids:resolved.ids,allIds:resolved.ids,count:resolved.count,stampCodesBySap:resolved.stampCodesBySap,stampTextBySap:resolved.stampTextBySap,conflicts:resolved.conflicts,invalidRows:resolved.invalid,stampRows:resolved.accepted.filter(row=>row.stamp).length,parsedStampRows:parsed,stampAvailable:parsed>0||state.confirmedEmpty===true,dayVerified:!!verified,cacheSchema:164};
  }
  function attendanceStatus(state, day) {
    if(state.error || state.cached) return {kind:'warning',label:'تعذّر التحقق من حضور اليوم'+(state.loaded?' · نسخة محفوظة':'')};
    if(state.loading) return {kind:'waiting',label:'جارٍ التحقق من حضور اليوم'};
    if(!state.loaded || state.day!==day || state.dayVerified===false) return {kind:'waiting',label:'حضور اليوم لم يصل بعد'};
    const r=state.receipt;
    const proven = r && (!state.sourceHash || r.hash===state.sourceHash) && r.count===state.count && r.day===day && r.committed===true && r.hash && Number.isInteger(r.sequence) && r.sequence>0 && Number.isFinite(Date.parse(r.completedAt)) && cairoDay(r.completedAt)===day;
    if(state.count===0 && state.confirmedEmpty && proven) return {kind:'ready',label:'حضور اليوم: 0 (مؤكَّد)'};
    if(state.count===0) return {kind:'warning',label:'لا توجد سجلات حضور صالحة · يلزم التحقق'};
    if(proven) return {kind:'ready',label:`الحضور محدَّث · التحديث ${r.sequence} · `+new Date(r.completedAt).toLocaleTimeString('ar-EG',{timeZone:'Africa/Cairo',hour:'2-digit',minute:'2-digit'})};
    return {kind:'ready',label:'حضور اليوم متاح · ترتيب التحديث غير موثَّق'};
  }
  function checkupCategory(p) {
    const keys=[p.needPeriodic===true?'P':'',p.needInitiative===true?'I':'',p.needHearing===true?'H':''].join('');
    return ['PI','PH','IH','PIH'].includes(keys)?keys:'';
  }
  function checkupMulti(p,selection=[]){const pending={periodic:p.needPeriodic===true,initiative:p.needInitiative===true,hearing:p.needHearing===true};return p.present===true&&Object.values(pending).filter(Boolean).length>=2&&[...selection].every(key=>pending[key]===true);}
  const stampLabel = value => /^(?:مكان الختم|مكان البصمه|مكان البصمة|موقع البصمه|موقع البصمة|stamp location)$/i.test(norm(value));
  function exportAOA(aoa, trustedCapability) {
    if(!aoa.length)return [];
    // DOM/localStorage roles never grant this sensitive export capability.
    const allowed=trustedCapability?.verified===true && trustedCapability?.role==='central' && trustedCapability?.permissions?.includes('export:stamp') && trustedCapability?.expiresAt>Date.now();
    const keep=aoa[0].map((h,i)=>!stampLabel(h)||allowed?i:-1).filter(i=>i>=0);
    return aoa.map(row=>keep.map(i=>row[i]??''));
  }
  function surveyPeople(rows, isDone, parseDay) {
    const groups=new Map(), nidSaps=new Map();
    for(const row of rows){const sap=id(row.sap),nid=id(row.nid);if(sap&&nid){const s=nidSaps.get(nid)||new Set();s.add(sap);nidSaps.set(nid,s);}}
    rows.forEach((r,i)=>{const s=id(r.sap),n=id(r.nid),linked=!s&&n&&nidSaps.get(n)?.size===1?[...nidSaps.get(n)][0]:s;
      const key=linked?'s:'+linked:n?'n:'+n:'row:'+i,list=groups.get(key)||[];list.push(r);groups.set(key,list);});
    return [...groups].map(([key,rs])=>{
      const nids=new Set(rs.map(x=>id(x.nid)).filter(Boolean));
      const conflict=nids.size>1 || rs.some(x=>id(x.nid)&&nidSaps.get(id(x.nid))?.size>1);
      const dated=rs.map(r=>({r,date:parseDay(r.date||r.surveyDate||r.serviceOpenDate)})).sort((a,b)=>b.date.localeCompare(a.date));
      const completed=rs.some(isDone),row=dated[0]?.r||rs[0];
      return {...row,key,rows:rs,surveyCompleted:completed,identityReview:conflict,
        completedDate:dated.filter(x=>isDone(x.r)).map(x=>x.date).find(Boolean)||'',
        surveyState:conflict?'review':completed?'done':rs.some(x=>/مؤجل وله تحاليل/.test(x.status)||/مطلوب استبيان & تحاليل/.test(x.note))?'deferredLabs':rs.some(x=>/مؤجل/.test(x.status))?'deferred':'open'};
    });
  }
  root.OPMQuality=Object.freeze({text,norm,id,cairoDay,sameIdentity,ministryFit,attendanceRow,resolveAttendance,attendanceSnapshot,attendanceStatus,checkupCategory,checkupMulti,exportAOA,surveyPeople});
})(typeof window==='object'?window:globalThis);
