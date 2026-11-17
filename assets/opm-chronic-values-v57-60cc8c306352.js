/* Validate clinical cell types without changing or guessing source values. */
(() => {
  'use strict';
  const digits = value => String(value ?? '').normalize('NFKC')
    .replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)))
    .replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))
    .replace(/[\u200e\u200f\ufeff]/g,'').trim();
  const key = value => digits(value).toLowerCase().replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[^\p{L}\p{N}]/gu,'');
  const measurements = new Set([
    'creatinine','creat','serum creatinine','كرياتينين','الكرياتينين',
    'hba','hba1c','السكر التراكمي','egfr','gfr','hdl','ldl','tg','tc',
    'cholesterol','cholesterol (TC)','total cholesterol','triglycerides',
    'سكر عشوائي','السكر العشوائي','random blood sugar','rbs',
    'الضغط الانقباضي','الضغط الانبساطي','systolic','diastolic','urea','uric acid'
  ].map(key));
  function isMeasurement(header) { return measurements.has(key(header)); }
  function isDate(value) {
    if (Object.prototype.toString.call(value) === '[object Date]') return true;
    const text=digits(value);
    return /^Date\s*\(/i.test(text) || /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}(?:[T\s]|$)/.test(text) ||
      /^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}(?:[T\s]|$)/.test(text) ||
      /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s/i.test(text);
  }
  function number(value) {
    if (isDate(value)) return NaN;
    let text=digits(value).replace(/٫/g,'.').replace(/٬/g,',');
    text=/^[<>≤≥]?\s*[-+]?\d+,\d{1,2}(?:\s*(?:%|mg\/dl|mmol\/l|mmhg))?$/i.test(text)
      ?text.replace(',','.') :text.replace(/,(?=\d{3}(?:\D|$))/g,'');
    const match=text.match(/^[<>≤≥]?\s*([-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?)\s*(?:%|mg\s*\/\s*d[lL]|mmol\s*\/\s*[lL]|mg\s*\/\s*[lL]|mmhg)?$/i);
    return match && Number.isFinite(Number(match[1])) ? Number(match[1]) : NaN;
  }
  function inspect(value,header) {
    const invalid=isMeasurement(header)&&isDate(value);
    return {invalid,value:invalid?'':value,raw:value,
      message:invalid?'ورد تاريخ في عمود '+String(header)+' بدل قراءة تحليل: '+digits(value)+' · راجع القيمة في المصدر.':''};
  }
  function exportData(headers,rows) {
    let hasInvalid=false;
    const entries=rows.map(row=>{
      const notes=[];
      const values=row.map((value,index)=>{
        const cell=inspect(value,headers[index]);
        if(cell.invalid){hasInvalid=true;notes.push(cell.message);}
        return cell.value;
      });
      return {values,notes};
    });
    return [hasInvalid?[...headers,'مراجعة قيم المصدر']:[...headers],
      ...entries.map(({values,notes})=>hasInvalid?[...values,notes.join(' | ')]:values)];
  }
  window.__opmChronicValues=Object.freeze({isMeasurement,isDate,number,inspect,exportData});
})();
