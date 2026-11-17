
!(function () {
  "use strict";
  if (window.__OPM_UNIFIED_TARGETS_V44__) return;
  const e = (a) => String(a ?? "").trim(),
    t = (a) => window.__opmNormalizeId(a),
    n = (a) => {
      const r = t(a);
      return /^\d{14}$/.test(r) ? r : "";
    },
    o = (a) => {
      const r = t(a);
      return /^\d+$/.test(r) && !/^0+$/.test(r) ? r.replace(/^0+(?=\d)/, "") : "";
    },
    s = (a) => e(a).normalize("NFKC").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").toLowerCase(),
    a = /^(?:done|completed|complete|finished|تم التنفيذ|تم التنفيذ وظهرت نتيجة|تم عمل التحليل|تم اجراء التحليل|منفذ|مكتمل|نعم|yes)$/i,
    r = /رفض|رافض|refus|declin/i,
    i = /\bFIT\b/i,
    l = /\bPSA\b/i,
    m = ["targetYear", "requiredYear", "analysisYear", "testRequiredYear", "سنة الاستحقاق", "سنة المستهدف"],
    c = (a) => e(a).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[a]);
  function u(a, r) {
    return ("FIT" === r ? i : l).test(e(a?.required));
  }
  function p(a) {
    const i = e(a);
    if (
      /^(?:pending|in progress|not available|جاري التنفيذ|جارى التنفيذ|قيد التنفيذ|لم تظهر|لم تظهر بعد|لم تظهر النتيجة|لم تظهر النتيجه|تم استلام الكاب|المريض استلم الكاب|تم تسليم الانبوبه|تم استلام الانبوبه)$/i.test(
        s(i),
      )
    )
      return !1;
    if (
      !i ||
      r.test(i) ||
      /^(?:—|-|n\/?a|not done|pending|لم تظهر النتيجة|لم يتم|غير متاح|لا يوجد|قيد التنفيذ|مطلوب|تم تسليم الانبوبة|تم تسليم الأنبوبة|تم سحب العينة)$/i.test(
        i,
      )
    )
      return !1;
    try {
      if (window.isBadLabResult?.(i)) return !1;
    } catch (a) {}
    return !0;
  }
  function _(a) {
    for (const r of m) {
      const i = e(a[r]);
      if (/^20\d\d$/.test(i)) return +i;
    }
    return 0;
  }
  function f(a) {
    const r = e(a);
    let i = r.match(/^((?:19|20)\d\d)[-/]/);
    return i ? +i[1] : ((i = r.match(/^[0-3]?\d[-/][01]?\d[-/]((?:19|20)\d\d)/)), i ? +i[1] : 0);
  }
  function g(a, r) {
    const i = r.toLowerCase();
    return [a[i + "ResultDate"], a[i + "ExecDate"], a[i + "Date"], a.testResultDate, a.resultDate, a.execDate].map(f).find(Boolean) || 0;
  }
  let h = null;
  function y() {
    const a = Array.isArray(window.__ALL_DATA_MASTER) ? window.__ALL_DATA_MASTER : [],
      r = [window.__dataRevision || 0, a.length, a[0], a[a.length - 1]];
    if (h && h.revision[0] === r[0] && h.revision[1] === r[1] && h.revision[2] === r[2] && h.revision[3] === r[3]) return h;
    const i = new Map(),
      l = new Map(),
      m = new Map();
    a.forEach((a, r) => {
      const l = o(a?.sap),
        h = n(a?.nid),
        T = l ? "sap:" + l : h ? "nid:" + h : "row:" + r;
      let F = i.get(T);
      if (
        (F || ((F = { key: T, sap: l, nid: h, name: e(a?.name), rows: [], nids: new Set(), identityConflict: !1 }), i.set(T, F)),
        F.rows.push(a),
        h && F.nids.add(h),
        F.nid || (F.nid = h),
        F.name || (F.name = e(a?.name)),
        l && h)
      ) {
        const a = m.get(h);
        a ? a !== l && m.set(h, "CONFLICT") : m.set(h, l);
      }
    });
    for (const a of i.values()) {
      if ((a.nids.size > 1 && (a.identityConflict = !0), !a.sap && a.nid)) {
        const r = m.get(a.nid);
        if (r && "CONFLICT" !== r && i.has("sap:" + r)) {
          const l = i.get("sap:" + r);
          (l.rows.push(...a.rows), l.nids.add(a.nid), i.delete(a.key));
          continue;
        }
      }
      if (a.nid) {
        const r = m.get(a.nid);
        ("CONFLICT" === r || (a.sap && r && r !== a.sap)) && (a.identityConflict = !0);
      }
    }
    for (const a of i.values())
      if (a.nid) {
        const r = l.get(a.nid);
        r && r !== a ? l.set(a.nid, "CONFLICT") : r || l.set(a.nid, a);
      }
    return ((h = { revision: r, groups: [...i.values()], byKey: i, byNid: l }), h);
  }
  function w(a) {
    const r = y(),
      i = o(a?.sap),
      l = n(a?.nid),
      m = i && r.byKey.get("sap:" + i);
    if (m) return l && m.nids.size && !m.nids.has(l) ? { ...m, identityConflict: !0 } : m;
    const h = l && r.byNid.get(l);
    return !h || "CONFLICT" === h || (i && h.sap && h.sap !== i) ? null : h;
  }
  function b(a, r) {
    const i = window.__opmGoogleAttendanceSource?.(),
      l = window.__OPM_TARGET_V38__?.snapshot?.();
    if (!i?.loaded && !l?.ready) return [];
    const m = o(a?.sap),
      h = n(a?.nid),
      T = i?.loaded ? i.events || [] : l.google || [];
    let F = window.__opmV65SheetIdx;
    if (!F || F.rows !== T) {
      const a = new Map();
      for (const r of T)
        for (const i of [r.sap && "sap:" + o(r.sap), r.nid && "nid:" + n(r.nid)].filter(Boolean)) {
          const l = r.type + "|" + i;
          (a.has(l) || a.set(l, []), a.get(l).push(r));
        }
      ((F = { rows: T, keys: a }), (window.__opmV65SheetIdx = F));
    }
    const q = F.keys,
      C = (m && q.get(r + "|sap:" + m)) || [],
      R = (h && q.get(r + "|nid:" + h)) || [],
      P =
        ((function (a) {
          const r = a && y().byKey.get("sap:" + a);
          !r || r.identityConflict;
        })(m),
        [...new Set([...C, ...R])].filter((a) => (!((m && o(a.sap) && o(a.sap)!==m)||(h && n(a.nid) && n(a.nid)!==h)) && !!((m && o(a.sap)===m)||(h && n(a.nid)===h)))));
    return !m && new Set(P.map((a) => o(a.sap)).filter(Boolean)).size > 1
      ? []
      : P.filter((a) => ["done", "drawn", "started", "refused"].includes(a.stage));
  }
  let T = null;
  function S() {
    const a = window.__mohLab?.info?.(),
      r = [window.__opmLabCommitted ? window.__opmLabCommitted.key() : a?.syncedAt || "", window.__LAB_HANDOVER_REVISION__ || 0];
    if (T?.signature[0] === r[0] && T.signature[1] === r[1]) return T;
    const i = new Map();
    for (const a of window.__opmLabCommitted ? window.__opmLabCommitted.rows() : window.__mohLab?.rows?.() || []) {
      const r = e(a?.type).toUpperCase(),
        l = o(a?._mohSourceSap || a?.sap),
        m = n(a?._mohSourceNid || a?.nid);
      // OPM v150: نتيجة رقمها القومي متعارض (مسجل لأكثر من SAP) لا تُغلق استحقاق أي عامل
      if (!["FIT", "PSA"].includes(r) || !a?.approved || !p(a?.result) || (!l && !m) || "identity-conflict" === a?.matchState) continue;
      const h = { type: r, sap: l, nid: m, source: "نتيجة المعمل المعتمدة", year: f(a?.resultDate || a?.execDate), stage: "done" };
      for (const a of [l && r + "|sap:" + l, m && r + "|nid:" + m].filter(Boolean)) (i.has(a) || i.set(a, []), i.get(a).push(h));
    }
    return (T = { signature: r, map: i });
  }
  function v(a, r) {
    const i = o(a?.sap),
      l = n(a?.nid),
      m = S().map,
      h = (i && m.get(r + "|sap:" + i)) || [],
      T = (l && m.get(r + "|nid:" + l)) || [],
      F = [...new Set([...h, ...T])].filter((a) => !((i && a.sap && a.sap !== i) || (l && a.nid && a.nid !== l)));
    return !i && new Set(F.map((a) => a.sap).filter(Boolean)).size > 1 ? [] : F;
  }
  function A(m, h) {
    const T = [];
    for (const F of m) {
      const m = "FIT" === h ? F.fitResult : F.psaResult,
        q = e("FIT" === h ? F.fitStatus : F.psaStatus),
        C = e(F.labStatus) + " " + e(F.note || ""),
        R = g(F, h) || _(F);
      (p(m)
        ? T.push({ code: "legacy_result", stage: "done", source: "المصفوفة / نتيجة سابقة", year: R })
        : a.test(q) && T.push({ code: "legacy_done", stage: "done", source: "المصفوفة / تم التنفيذ", year: R }),
        r.test(q) || r.test(e(m))
          ? T.push({ code: "legacy_refused", stage: "refused", source: "المصفوفة / رفض التحليل", year: R })
          : r.test(C) &&
            (("FIT" === h && i.test(C) && !l.test(C)) ||
              ("PSA" === h && l.test(C) && !i.test(C)) ||
              (u(F, h) &&
                !u(F, "FIT" === h ? "PSA" : "FIT") &&
                /رفض.*(?:تحليل|عينه|عينة)|رفض عمل/i.test(C) &&
                !/منظار|قولون|عنق الرحم|إشعاع|اشعه/i.test(C))) &&
            T.push({ code: "legacy_refused", stage: "refused", source: "المصفوفة / رفض مخصص للتحليل", year: R }),
        "FIT" === h &&
          "returned" === window.__analysisSemantic?.fitCupStage?.(F) &&
          T.push({
            code: "legacy_fit_returned",
            stage: "done",
            source: "المصفوفة / سلّم عينة FIT",
            year: R || f(F.fitSampleDate || F.fitStartDate || F.labStartDate || F.sampleDate) || 2026,
          }),
        "PSA" === h &&
          (/تم\s*سحب\s*(?:ال)?(?:عينة|عينه|دم|psa)|سحب\s*psa/i.test(s(q)) || /سحب\s*psa/i.test(s(C))) &&
          T.push({ code: "legacy_psa_drawn", stage: "done", source: "المصفوفة / سحب عينة PSA", year: R }));
    }
    return T;
  }
  const F = {
    ministry_fit: "استبعاد FIT لدى فرق الوزارة · PSA مستقل",
    legacy_result: "نتيجة تحليل سابقة",
    legacy_done: "تحليل مكتمل بالمصفوفة",
    legacy_psa_drawn: "سحب PSA بالمصفوفة",
    legacy_fit_returned: "تسليم عينة FIT بالمصفوفة",
    google_fit_done: "تأكيد FIT في Excel_Sync (نعم أو تأكيد الأنبوبة)",
    google_psa_drawn: "سحب PSA في Google Sheets",
    lab_approved: "نتيجة معتمدة بالمعمل",
    google_refused: "رفض في Google Sheets",
    legacy_refused: "رفض بالمصفوفة",
    not_required: "غير مطلوب من الأصل",
    pending: "ما زال مستهدفًا",
    identity_review: "تعارض الهوية – مراجعة",
    new_requirement: "استحقاق أحدث يحتاج متابعة",
  };
  function I(a, r, i) {
    const l = w(a),
      m = i || l?.rows || [a],
      h = !!a?.["FIT" === r ? "fit" : "psa"] || m.some((a) => u(a, r));
    if (!h) return { code: "not_required", label: F.not_required, closed: !1, eligible: !1, state: "excluded", source: "المصفوفة" };
    if (l?.identityConflict) return {code:"identity_review",label:F.identity_review,closed:false,eligible:true,state:"pending",source:"التحقق من الهوية"};
    const T = A(m, r),
      q = b(a, r),
      C = v(a, r);
    for (const a of q)
      T.push({
        code: "refused" === a.stage ? "google_refused" : "FIT" === r ? "google_fit_done" : "google_psa_drawn",
        stage: "refused" === a.stage ? "refused" : "done",
        source: "Google Sheets · Excel_Sync",
        year: Number(a.confirmationYear || 2026),
      });
    for (const a of C) T.push({ code: "lab_approved", stage: "done", source: a.source, year: a.year });
    const R = (function (a, r) {
        const i = a
          .filter((a) => u(a, r))
          .map(_)
          .filter(Boolean);
        return i.length ? Math.max(...i) : 0;
      })(m, r),
      ministry = r === "FIT" && window.OPMQuality.ministryFit(m, a, R),
      ministryEvidence = ministry ? T.push({code:"ministry_fit",stage:"excluded",source:"جهة وحالة FIT بالمصفوفة",year:R}) : 0,
      P = R ? T.filter((a) => a.year >= R) : T,
      N = {
        ministry_fit: 8,
        legacy_result: 1,
        lab_approved: 2,
        google_fit_done: 3,
        google_psa_drawn: 3,
        legacy_done: 4,
        legacy_psa_drawn: 5,
        legacy_fit_returned: 5,
        google_refused: 6,
        legacy_refused: 7,
      };
    P.sort((a, r) => ("done" === a.stage ? 0 : 1) - ("done" === r.stage ? 0 : 1) || (N[a.code] || 9) - (N[r.code] || 9));
    const E = P[0];
    return E
      ? {
          ...E,
          label: F[E.code],
          closed: !0,
          eligible: !0,
          state: E.code === "ministry_fit" ? "excluded" : "refused" === E.stage ? "refused" : "legacy_result" === E.code || "lab_approved" === E.code ? "done" : "completed",
          allReasons: [...new Set(P.map((a) => F[a.code]))],
          requiredYear: R,
        }
      : T.length && R
        ? {
            code: "new_requirement",
            label: F.new_requirement,
            closed: !1,
            eligible: !0,
            state: "pending",
            source: "استحقاق أحدث",
            requiredYear: R,
          }
        : { code: "pending", label: F.pending, closed: !1, eligible: !0, state: "pending", source: "المصفوفة", requiredYear: R };
  }
  function L() {
    const a = y().groups,
      r = [],
      i = { FIT: { required: 0, closed: 0, pending: 0 }, PSA: { required: 0, closed: 0, pending: 0 } };
    for (const l of a.filter((a) => a.rows.some((a) => !1 !== window.__opmRegionMatches?.(a) && !1 !== window.__townMatches?.(a))))
      for (const a of ["FIT", "PSA"]) {
        const m = l.rows.some((r) => u(r, a)),
          h = I({ sap: l.sap, nid: l.nid, fit: "FIT" === a && m, psa: "PSA" === a && m }, a, l.rows);
        (m && (i[a].required++, i[a][h.closed ? "closed" : "pending"]++), r.push({ sap: l.sap, nid: l.nid, name: l.name, type: a, ...h }));
      }
    return { items: r, totals: i };
  }
  let q = "all",
    C = [];
  function $(a) {
    if (!a) return;
    a.querySelector("#opm-v44-audit")?.remove();
    const r = document.createElement("details");
    ((r.id = "opm-v44-audit"), (r.className = "opm-target-audit"), (r.dir = "rtl"));
    const i = L();
    C = i.items;
    const l = i.items.filter((a) => a.eligible),
      m = l.filter((a) => a.closed),
      h = [...new Set(m.map((a) => (a.sap ? "sap:" + a.sap : a.nid ? "nid:" + a.nid : a.name)))].length,
      T = Object.entries(F).filter(([a]) => !["pending", "identity_review", "new_requirement"].includes(a)),
      d = (a) => i.items.filter((r) => r.code === a),
      R = T.map(([a, r]) => {
        const i = d(a),
          l = i.filter((a) => "FIT" === a.type).length,
          m = i.filter((a) => "PSA" === a.type).length;
        return `<tr><td>${c(r)}${"not_required" === a ? "<small>لم يدخل المستهدف من الأصل</small>" : ""}</td><td>${l.toLocaleString("en-US")}</td><td>${m.toLocaleString("en-US")}</td><td><button type="button" data-v44-reason="${a}">عرض ${i.length.toLocaleString("en-US")}</button></td></tr>`;
      }).join("");
    ((r.innerHTML = `<summary>تقرير موحد: أسباب الخروج من المستهدف <b>${m.length.toLocaleString("en-US")} تحليل · ${h.toLocaleString("en-US")} موظف</b></summary><div class="v44-audit-body"><p>الحساب لجميع موظفي النطاق المختار، وليس الحضور فقط. كل موظف يُحسب مرة لكل تحليل، ويُسند لسبب رئيسي واحد مع حفظ باقي الأدلة في التفاصيل. غير المطلوب من الأصل منفصل عن الخارجين من المستهدف.</p><div class="v44-audit-summary"><span>FIT: ${i.totals.FIT.closed} خرج من ${i.totals.FIT.required} مطلوب</span><span>PSA: ${i.totals.PSA.closed} خرج من ${i.totals.PSA.required} مطلوب</span></div><div class="v44-audit-table"><table><thead><tr><th>سبب الاستبعاد</th><th>FIT</th><th>PSA</th><th>عرض الأسماء</th></tr></thead><tbody>${R}</tbody></table></div><div class="v44-audit-toolbar"><strong id="v44AuditLabel">اختر السبب لعرض الموظفين</strong><button type="button" data-v44-reason="closed">كل الخارجين</button><button type="button" data-v44-reason="all">كل الحالات</button><button type="button" data-v44-export>تصدير CSV</button></div><div class="v44-audit-table"><table><thead><tr><th>SAP</th><th>الاسم</th><th>الرقم القومي</th><th>التحليل</th><th>القرار / السبب</th><th>المصدر</th><th>كل أدلة القرار</th></tr></thead><tbody id="v44AuditPeople"></tbody></table></div><small>حالات تعارض الهوية والاستحقاق الأحدث لا تُستبعد تلقائيًا. الربط بالمعمل لا يغلق FIT بمجرد تسجيل المعمل دون نتيجة معتمدة أو دليل إتمام مستقل.</small></div>`),
      a.append(r));
    const u = (a) => {
      const i = r.querySelector("#v44AuditLabel"),
        l = r.querySelector("#v44AuditPeople");
      ((i.textContent = "all" === q ? "كل الحالات" : "closed" === q ? "كل الخارجين من المستهدف" : F[q] || "تفاصيل"),
        (l.innerHTML =
          a
            .slice(0, 150)
            .map(
              (a) =>
                `<tr><td>${c(a.sap || "—")}</td><td>${c(a.name || "—")}</td><td dir="ltr">${c(a.nid || "—")}</td><td>${c(a.type)}</td><td>${c(a.label)}</td><td>${c(a.source || "—")}</td><td>${c((a.allReasons || []).join("، ") || "—")}</td></tr>`,
            )
            .join("") +
            (a.length > 150 ? `<tr><td colspan="7">يُعرض أول 150 سجلًا للسرعة. التصدير يشمل ${a.length} سجلًا كاملًا.</td></tr>` : "") ||
          '<tr><td colspan="7">لا توجد حالات.</td></tr>'));
    };
    let P = [];
    (r.addEventListener("click", async (a) => {
      const r = a.target.closest?.("button");
      if (
        r &&
        (r.hasAttribute("data-v44-reason") &&
          ((q = r.dataset.v44Reason),
          (P = "all" === q ? C : "closed" === q ? C.filter((a) => a.closed) : C.filter((a) => a.code === q)),
          u(P)),
        r.hasAttribute("data-v44-export"))
      ) {
        if (!(await window.__opmPrepareAnalysisExport?.())) return;
        const t = (a) => (/^[=+@\-]/.test(e(a)) ? "'" + e(a) : e(a)),
          a = [
            ["SAP", "الاسم", "الرقم القومي", "التحليل", "الحالة", "السبب", "المصدر", "كل الأدلة"],
            ...P.map((a) => [
              a.sap,
              a.name,
              a.nid,
              a.type,
              a.closed ? "خرج" : a.eligible ? "مستهدف" : "غير مطلوب",
              a.label,
              a.source,
              (a.allReasons || []).join("، "),
            ]),
          ],
          r = "\ufeff" + a.map((a) => a.map((a) => '"' + t(a).replace(/"/g, '""') + '"').join(",")).join("\r\n"),
          i = URL.createObjectURL(new Blob([r], { type: "text/csv;charset=utf-8" })),
          l = document.createElement("a");
        ((l.href = i),
          (l.download = "اسباب_الخروج_من_المستهدف.csv"),
          document.body.append(l),
          l.click(),
          l.remove(),
          setTimeout(() => URL.revokeObjectURL(i), 5e3));
      }
    }),
      (P = C.filter((a) => a.closed)),
      (q = "closed"),
      u(P));
  }
  ((window.__opmTargetV44 = {
    renderAuditDeferred: function (a, r = !1) {
      if (!a) return;
      a.querySelector("#opm-v44-audit")?.remove();
      const i = document.createElement("details");
      ((i.id = "opm-v44-audit"),
        (i.className = "opm-target-audit"),
        (i.dir = "rtl"),
        (i.innerHTML = "<summary>تقرير موحد: أسباب الخروج من المستهدف</summary>"),
        a.append(i));
      let l = !1;
      const s = () => {
        if (l || !i.open) return;
        ((l = !0), window.__OPM_PERF__.run("target-audit", () => $(a)));
        const r = a.querySelector("#opm-v44-audit");
        r && (r.open = !0);
      };
      (i.addEventListener("toggle", s), r && ((i.open = !0), s()));
    },
    required: u,
    decision: I,
    classify: function (a, r) {
      const i = (a || []).filter(Boolean);
      if (!i.length) return "excluded";
      const l = i.some((a) => u(a, r));
      if (!l) return "excluded";
      const m = I({ sap: i[0].sap, nid: i[0].nid, fit: "FIT" === r && l, psa: "PSA" === r && l }, r, i);
      if (m.closed) return m.state;
      try {
        if (i.some((a) => window.__analysisSemantic?.startedBy?.(r, a)) && "identity_review" !== m.code) return "started";
      } catch (a) {}
      return "pending";
    },
    audit: L,
    renderAudit: $,
    groupFor: w,
    codes: F,
    legacyEvidence: A,
    index: y,
    goodResult: p,
  }),
    (window.__OPM_UNIFIED_TARGETS_V44__ = !0));
})();

