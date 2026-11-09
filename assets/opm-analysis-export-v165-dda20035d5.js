/* V165 analysis-only column projection. UI session policy is not server authorization. */
(function(){
 'use strict';
 const norm=v=>String(v??'').normalize('NFKC').replace(/[\u200e\u200f\ufeffـًٌٍَُِّْ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,' ').trim().toLowerCase();
 const screenPrivate=new Set(['المعمل','حالة FIT','حالة PSA','مكان البصمة','مكان الختم','موقع البصمة','جهة التحليل','حالة التحليل','موقف التحليل','حالة FIT الخاصة','عدد الأيام','المدة','متأخر','stamp location','analysis provider','analysis status','days','late'].map(norm));
 const exportPrivate=new Set([...screenPrivate,...['نتيجة FIT','نتيجة PSA','FIT نتيجة','PSA نتيجة','FIT result','PSA result','النتيجة'].map(norm)]);
 const headers=['الاسم','رقم التليفون','النشاط','القسم','المدير','SAP','الرقم القومي','الوظيفة','الدرجة الوظيفية','موقف التشغيل','موقع العمل','مكان البصمة','التحليل المطلوب','نتيجة FIT','نتيجة PSA','جهة التحليل','حالة التحليل','المدة'];

 // Task 4: only the combined analyses table uses this scope-aware projection.
 // No data source, person model, role policy, or all-sites export is modified.
 const compactRegions=new Set(['قويسنا','بنها_قليوب','باقي_المواقع']);
 const compactExcluded=new Set(['مكان البصمة','مكان الختم','نتيجة FIT','نتيجة PSA','جهة التحليل','حالة التحليل','المدة','عدد الأيام'].map(norm));
 const compactScope=()=>compactRegions.has(window.__dashboardRegion||'all');
 const compactKeep=label=>!compactExcluded.has(norm(label));
 const compactHeaders=Object.freeze(headers.filter(compactKeep));
 function scopedRowHTML(html,columns=headers){
  if(!compactScope())return rowHTML(html,columns);
  let i=0;
  const reduced=html.replace(/<(td|th)\b[^>]*>[\s\S]*?<\/\1>/g,cell=>compactKeep(columns[i++])?cell:'');
  return rowHTML(reduced,columns===headers?compactHeaders:columns.filter(compactKeep));
 }
 function scopedAoA(rows){
  if(!compactScope()||!Array.isArray(rows)||!Array.isArray(rows[0]))return aoa(rows);
  const keep=rows[0].map(compactKeep);
  const reduced=rows.map(row=>Array.isArray(row)?row.filter((_,i)=>keep[i]):row);
  return aoa(reduced);
 }

 function central(){try{const s=JSON.parse(sessionStorage.getItem('opm:session:v154')||'null'),now=Date.now();return !!s&&s.role==='admin'&&s.version===1&&Number.isFinite(s.issuedAt)&&Number.isFinite(s.lastActive)&&s.issuedAt<=s.lastActive&&s.lastActive<=now&&now-s.lastActive<15*60*1000&&s.expiresAt===s.issuedAt+8*60*60*1000&&s.expiresAt>now&&document.body?.dataset.elAuthRole==='admin'&&!document.documentElement.classList.contains('el-auth-locked');}catch(_){return false}}
 function aoa(rows){if(central()||!Array.isArray(rows))return rows;const head=rows.findIndex(r=>Array.isArray(r)&&r.some(v=>exportPrivate.has(norm(v))));if(head<0)return rows;const drop=new Set(rows[head].map((h,i)=>exportPrivate.has(norm(h))?i:-1).filter(i=>i>=0));return rows.map(row=>row.filter((_,i)=>!drop.has(i)))}
 function object(row){return central()?row:Object.fromEntries(Object.entries(row).filter(([key])=>!exportPrivate.has(norm(key))))}
 function rowHTML(html,cols=headers){if(central())return html;let i=0;return html.replace(/<(td|th)\b[^>]*>[\s\S]*?<\/\1>/g,cell=>screenPrivate.has(norm(cols[i++]))?'':cell)}
 function analysisSheet(rows,name){return /^(?:FIT|PSA|التحاليل)$/i.test(String(name))||rows.slice(0,8).some(row=>row.some(v=>/^(?:نتيجه\s*(?:fit|psa)|حاله\s*(?:fit|psa)|التحليل(?: المطلوب)?)$/.test(norm(v))))}
 function sanitizeBook(book){if(central()||!window.XLSX?.utils?.sheet_to_json)return book;for(const name of book.SheetNames||[]){const rows=XLSX.utils.sheet_to_json(book.Sheets[name],{header:1,defval:''});if(!analysisSheet(rows,name))continue;const safe=aoa(rows);if(safe===rows)continue;const sheet=XLSX.utils.aoa_to_sheet(safe);window.__prepareExcelSheet?.(sheet,safe);sheet['!views']=[{RTL:true}];book.Sheets[name]=sheet}return book}
 window.__opmAnalysisColumns=Object.freeze({central,aoa,object,rowHTML,headers,compactHeaders,compactScope,scopedRowHTML,scopedAoA,privateLabel:v=>exportPrivate.has(norm(v))});
 window.__opmExportPolicy=Object.freeze({sanitizeBook});
 function init(){const native=window.__downloadReadyExcel;if(native&&!native.__opm165Policy){const wrapped=function(book,...args){sanitizeBook(book);return native.call(this,book,...args)};wrapped.__opm165Policy=true;window.__downloadReadyExcel=wrapped}const writer=window.__opmWriteWorkbook;if(writer&&!writer.__opm165Policy){const wrapped=function(book,...args){sanitizeBook(book);return writer.call(this,book,...args)};wrapped.__opm165Policy=true;window.__opmWriteWorkbook=wrapped;if(window.XLSX?.__nativeOPM)window.XLSX.writeFile=wrapped}}
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
