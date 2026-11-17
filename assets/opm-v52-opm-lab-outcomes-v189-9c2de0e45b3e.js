(()=>{'use strict';
 const text=v=>String(v??'').normalize('NFKC').replace(/[٠-٩]/g,x=>'٠١٢٣٤٥٦٧٨٩'.indexOf(x)).replace(/[۰-۹]/g,x=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(x)).replace(/[\u200b-\u200f\uFEFF]/g,'').trim();
 const norm=v=>text(v).replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').toLowerCase();
 function numeric(value){
  let s=text(value).replace(/٬/g,',').replace(/٫/g,'.').replace(/≤/g,'<=').replace(/≥/g,'>=');
  s=s.replace(/\b(?:ng\s*\/\s*m[lL]|[uµμ]g\s*\/\s*[lL])\b/gi,'').trim();
  if(/^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(s))s=s.replace(/,/g,'');else if(/^\d+,\d{1,2}$/.test(s))s=s.replace(',','.');
  const m=s.match(/^(<=|>=|<|>)?\s*(\d+(?:\.\d+)?|\.\d+)$/);return m?{value:Number(m[2]),operator:m[1]||'='}:null;
 }
 function classify(type,row){
  const raw=row?.[type==='FIT'?'fitResult':'psaResult'],s=norm(raw),number=numeric(raw);
  const out=(status,reason,extra={})=>({status,reason,raw:text(raw),...extra});
  if(!s||/^(?:—|-|null|undefined|none|n\/?a|not done|not needed|pending|مطلوب|قيد التنفيذ|جاري التنفيذ|لا يوجد(?: تحليل)?|لم تظهر النتيجه|تم سحب psa)$/.test(s))return out('none','لم تُسجّل نتيجة قابلة للتقييم');
  if(type==='PSA'){
   const kind=norm(row.psaTestType||row.psaKind||'');
   if(/free|ratio|حر|نسبه/.test(kind))return out('review','يحتاج مرجع نوع التحليل؛ لا يُطبّق حد Total PSA على الحر أو النسبة');
   const unit=norm(row.psaUnit||'').replace(/\s/g,'');
   if(unit&&!/^(?:ng\/ml|[uµμ]g\/l)$/.test(unit))return out('review','وحدة PSA غير متوافقة مع حد ng/mL');
  }
  const flag=norm(row?.[type==='FIT'?'fitResultFlag':'psaResultFlag']||row?.[type==='FIT'?'fitFlag':'psaFlag']);
  if(/^(?:h|hh|high|positive|abnormal|مرتفع|ايجابي)$/.test(flag))return out('suspect','علامة ارتفاع أو إيجابية مسجّلة من المعمل',{basis:'lab-flag'});
  if(/^(?:n|normal|negative|سليم|طبيعي|سلبي)$/.test(flag))return out('normal','علامة ضمن المرجع مسجّلة من المعمل',{basis:'lab-flag'});
  if(/^(?:negative|normal|non[- ]?reactive|not positive|سلبي|سلبى|سليم|طبيعي)(?:$|[\s.،,:;])/i.test(s))return out('normal','نتيجة سلبية أو ضمن الطبيعي مسجّلة');
  if(/positive|suspicious|suspicion|abnormal|high|مرتفع|ايجاب|اشتباه|غير طبيعي/.test(s))return out('suspect','نتيجة موصوفة صراحةً بأنها مرتفعة أو إيجابية');
  if(!number)return out('review','النص غير قابل للتقييم؛ لا يُحوّل تلقائيًا إلى سليم');
  const ref=type==='PSA'?numeric(row.psaReferenceHigh):null;
  if(type==='PSA'&&text(row.psaReferenceHigh)&&(!ref||!['=','<','<='].includes(ref.operator)))return out('review','حد مرجع المعمل المسجّل غير قابل للتقييم');
  const limit=type==='FIT'?250:ref?ref.value:4,highInclusive=type==='FIT'||ref?.operator==='<';
  const general=type==='PSA'&&!ref,basis=type==='FIT'?'حد FIT الحالي في النظام: 250':general?'حد فرز عام لـTotal PSA: أكبر من 4 ng/mL؛ مرجع المعمل والعمر لهما الأولوية':'الحد الأعلى المسجّل في مرجع المعمل: '+limit+' ng/mL';
  let status='review';const n=number.value,op=number.operator;
  if(op==='=')status=(highInclusive?n>=limit:n>limit)?'suspect':'normal';
  else if(op==='<')status=n<=limit?'normal':'review';
  else if(op==='<=')status=(highInclusive?n<limit:n<=limit)?'normal':'review';
  else if(op==='>')status=n>=limit?'suspect':'review';
  else if(op==='>=')status=(highInclusive?n>=limit:n>limit)?'suspect':'review';
  return out(status,status==='review'?'النتيجة حدّية بصيغة مقارنة؛ يلزم مرجع أو رقم أوضح':basis,{number:n,operator:op,limit,basis:general?'general-screening':ref?'lab-reference':'existing-fit-rule',general});
 }
 window.__opmLabOutcome=Object.freeze({classify,numeric,revision:189,ruleText:type=>type==='FIT'?'FIT: حد النظام الحالي ≥250، أو علامة إيجابية من المعمل.':'Total PSA: مرجع المعمل أولًا؛ عند غيابه حد فرز عام >4 ng/mL. الارتفاع يحتاج تقييمًا ولا يثبت ورمًا، وقد تختلف الحدود بالعمر.'});
})();
