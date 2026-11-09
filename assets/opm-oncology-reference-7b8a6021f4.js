(() => {
  "use strict";

  const book = "1zUal4mM2_m9HKDkku0Efk_zKNbIK5QI65xHt2a3xHP8";
  const sheet = "البيانات المرجعية 2";
  const query = "select A,D,E,F,G,I,J,K,M,O,P,Q,R";
  const mode = "lossless-oncology-reference";
  const fields = ["workplace", "group", "department", "activity", "section", "job", "building", "manager", "org", "center", "residence"];
  const aliases = {
    workplace: ["workPlace", "مكان العمل", "موقع العمل"], group: ["المجموعة"],
    department: ["الادارة", "الإدارة"], job: ["jobAr"], building: ["المبني", "المبنى"],
    org: ["org_depth", "orgDepth"], center: ["مركز السكن"], residence: ["village", "قرية السكن"]
  };
  const keys = ["sap", "nid", ...fields];
  const mark = Symbol("oncologySupplement");
  let source = null, hash = "", projection = null, job = null, timer = 0;
  let session = 0, retryAt = 0, failures = 0, checkedAt = "", error = "";

  function text(value) {
    const s = String(value ?? "").trim();
    return /^(?:0+|٠+|۰+|—|-|غير محدد|غير مسجل|غير متاح|null|undefined|nan|#N\/A|#REF!|#VALUE!)?$/i.test(s) ? "" : s;
  }

  function identifier(value, national = false) {
    if (typeof value === "string" && /^[1-9]\d*$/.test(value)) {
      return (national ? value.length === 14 : value.length <= 12) ? value : "";
    }
    const clean = String(value ?? "").normalize("NFKC")
      .replace(/[٠-٩]/g, digit => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
      .replace(/[۰-۹]/g, digit => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
      .replace(/[\u200e\u200f\uFEFF]/g, "").trim().replace(/^'/, "").replace(/\.0+$/, "");
    if (!/^\d+$/.test(clean) || /^0+$/.test(clean)) return "";
    if (national) return clean.length === 14 ? clean : "";
    const sap = clean.replace(/^0+(?=\d)/, "");
    return sap.length <= 12 ? sap : "";
  }

  function authorized() {
    const root = document.documentElement;
    return !root.classList.contains("el-auth-locked") && root.dataset.elAuthRole !== "qc";
  }

  function oncologyVisible() {
    const {activeInitiative, checkupsOpen} = document.body?.dataset || {};
    return authorized() && !document.hidden && activeInitiative !== "chronic" && checkupsOpen !== "1";
  }

  function eligible() {
    return oncologyVisible() && navigator.onLine !== false && !!window.__REFERENCE_WORKFORCE_READY__ &&
      !!window.__ALL_DATA_MASTER?.length;
  }

  function indexRows(table) {
    if (!Array.isArray(table?.rows) || !Array.isArray(table?.cols)) throw Error("استجابة مرجعية الأورام غير صالحة");
    const labels = table.cols.map(column => column.id || column.label);
    const positions = keys.map(key => {
      const position = labels.indexOf(key);
      if (position < 0 || position !== labels.lastIndexOf(key)) throw Error("أعمدة مرجعية الأورام غير مطابقة");
      return position;
    });
    const records = new Map();
    let invalid = 0;
    for (const row of table.rows) {
      const values = positions.map(position => text(row?.c?.[position]?.v));
      const sap = identifier(values[0]), nid = identifier(values[1], true);
      if ((!sap && !nid) || (values[0] && !sap) || (values[1] && !nid)) {
        invalid++;
        continue;
      }
      const key = sap + "|" + nid;
      if (!records.has(key)) records.set(key, {sap, nid, values: {}});
      const record = records.get(key);
      fields.forEach((field, index) => {
        const value = values[index + 2];
        if (!value) return;
        if (record.values[field] && record.values[field] !== value) record.conflict = true;
        else record.values[field] = value;
      });
    }
    if (table.rows.length && !records.size) throw Error("لا توجد هويات صالحة في مرجعية الأورام");
    const bySap = new Map(), byNid = new Map();
    function add(index, key, record) {
      if (key) index.set(key, index.has(key) ? null : record);
    }
    for (const record of records.values()) {
      add(bySap, record.sap, record);
      add(byNid, record.nid, record);
    }
    return {bySap, byNid, count: table.rows.length, invalid};
  }

  function fill(row, values) {
    const patch = {};
    for (const field of fields) {
      if (values[field] && !text(row[field]) && !aliases[field]?.some(alias => text(row[alias]))) patch[field] = values[field];
    }
    if (!Object.keys(patch).length) return row;
    if (patch.job) patch.jobAr = patch.job;
    if (patch.group) patch["المجموعة"] = patch.group;
    if (patch.department) patch["الادارة"] = patch["الإدارة"] = patch.department;
    if (patch.building) patch["المبني"] = patch["المبنى"] = patch.building;
    return {...row, ...patch, [mark]: source};
  }

  function rows() {
    const master = window.__ALL_DATA_MASTER || [];
    if (!source || !authorized() || !window.__REFERENCE_WORKFORCE_READY__ || !master.length) return master;
    const reference = window.__opmReferenceRevision || 0;
    if (projection?.master === master && projection.length === master.length && projection.reference === reference) return projection.rows;

    const primarySap = window.__REFERENCE_BY_SAP || {}, primaryNid = window.__REFERENCE_BY_NID || {};
    const matches = new Map();
    let conflicts = 0;
    for (let index = 0; index < master.length; index++) {
      const row = master[index];
      const sap = identifier(row.sap || row.SAP), nid = identifier(row.nid || row.nationalId, true);
      const bySap = source.bySap.get(sap), byNid = source.byNid.get(nid);
      if (bySap === null || byNid === null || bySap && byNid && bySap !== byNid) {
        conflicts++;
        continue;
      }
      const record = byNid || bySap;
      if (!record) continue;
      if (record.conflict || sap && record.sap && sap !== record.sap || nid && record.nid && nid !== record.nid) {
        conflicts++;
        continue;
      }
      if (primarySap[sap]?.length || primarySap[record.sap]?.length ||
          primaryNid[nid]?.length || primaryNid[record.nid]?.length) continue;
      matches.set(record, matches.has(record) ? -1 : index);
    }
    let result = master, matched = 0, enriched = 0;
    const matchedRecords = new Set();
    for (const [record, index] of matches) {
      if (index < 0) {
        conflicts++;
        continue;
      }
      matched++;
      matchedRecords.add(record);
      const original = master[index], updated = fill(original, record.values);
      if (original === updated) continue;
      if (result === master) result = master.slice();
      result[index] = updated;
      enriched++;
    }
    projection = {master, length: master.length, reference, rows: result, matched, enriched, conflicts, matchedRecords};
    return result;
  }

  // The analysis page also has derived groups. Enrich its display records only
  // after their identity was confirmed in the original oncology population.
  function apply(list) {
    if (!source || !authorized() || !window.__REFERENCE_WORKFORCE_READY__) return list;
    rows();
    if (!projection?.matchedRecords.size) return list;
    return list.map(row => {
      const sap = identifier(row.sap || row.SAP), nid = identifier(row.nid || row.nationalId, true);
      const bySap = source.bySap.get(sap), byNid = source.byNid.get(nid);
      const record = byNid || bySap;
      if (!projection.matchedRecords.has(record) || bySap === null || byNid === null ||
          bySap && byNid && bySap !== byNid ||
          sap && record.sap && sap !== record.sap || nid && record.nid && nid !== record.nid) return row;
      return fill(row, record.values);
    });
  }

  function status() {
    return {
      ready: !!source, loading: !!job, rows: source?.count || 0, invalid: source?.invalid || 0,
      matched: projection?.matched || 0, enriched: projection?.enriched || 0, conflicts: projection?.conflicts || 0,
      checkedAt, error
    };
  }

  function changed() {
    projection = null;
    document.dispatchEvent(new Event("oncologyReferenceUpdated"));
  }

  function schedule() {
    if (!eligible()) {
      clearTimeout(timer);
      timer = 0;
      return;
    }
    if (timer || job) return;
    timer = setTimeout(() => {
      timer = 0;
      refresh(false);
    }, Math.max(1500, retryAt - Date.now()));
  }

  function refresh(fresh = false) {
    if (!eligible()) return Promise.resolve(status());
    if (job) return job;
    clearTimeout(timer);
    timer = 0;
    const currentSession = session;
    job = Promise.resolve().then(async () => {
      const endpoint = String(window.OPM_GATEWAY_URL || "");
      if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)) {
        throw Error("رابط بوابة مرجعية الأورام غير مهيأ");
      }
      const url = new URL(endpoint);
      const params = {op: "q", book, sheet, headers: "1", tq: query};
      if (hash) params.ifHash = hash;
      if (fresh) params.fresh = "1";
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
      const reply = await window.__opmReadGviz(url.href, {format: "api", priority: 7, timeout: 18000});
      if (session !== currentSession || !authorized()) return;
      const gw = reply?.gw;
      if (reply?.status !== "ok" || !gw?.hash || gw.stale || gw.refreshing || gw.pendingSourceCheck || gw.mode !== mode) {
        throw Error("تعذر التحقق من مرجعية الأورام");
      }
      if (!source || hash !== gw.hash) {
        const next = indexRows(reply.table);
        if (!next.count && !gw.confirmedEmpty) throw Error("النسخة الفارغة لم تتأكد من المصدر");
        source = next;
        hash = gw.hash;
        changed();
      }
      checkedAt = gw.checkedAt || new Date().toISOString();
      error = "";
      failures = 0;
      retryAt = Date.now() + 120000;
    }).catch(cause => {
      if (session !== currentSession) return;
      error = String(cause?.message || "تعذر التحقق من مرجعية الأورام");
      retryAt = Date.now() + Math.min(120000, 15000 * 2 ** Math.min(3, failures++));
    }).finally(() => {
      job = null;
      schedule();
    }).then(status);
    return job;
  }

  window.__opmOncologyReference = {
    rows, apply, refresh, status,
    contains: row => !!source && authorized() && row?.[mark] === source
  };
  for (const event of ["dataUpdated", "referenceWorkforceUpdated", "dashboardTabChanged", "visibilitychange"]) {
    document.addEventListener(event, schedule);
  }
  document.addEventListener("elAuthStateChanged", event => {
    if (event.detail?.locked || !authorized()) {
      session++;
      source = null;
      hash = checkedAt = error = "";
      retryAt = failures = 0;
      changed();
    }
    schedule();
  });
  window.addEventListener("online", () => { retryAt = 0; schedule(); });
  window.addEventListener("offline", schedule);
  if (document.body) new MutationObserver(schedule).observe(document.body, {
    attributes: true, attributeFilter: ["data-active-initiative", "data-checkups-open"]
  });
  schedule();
})();
