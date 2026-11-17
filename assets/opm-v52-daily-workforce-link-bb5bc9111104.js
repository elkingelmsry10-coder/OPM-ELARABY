
!(function () {
  "use strict";
  const e = (r) =>
      String(r ?? "")
        .replace(/[\u200e\u200f\uFEFF]/g, "")
        .trim(),
    t = (r) =>
      e(r)
        .replace(/[٠-٩]/g, (r) => String("٠١٢٣٤٥٦٧٨٩".indexOf(r)))
        .normalize("NFKC")
        .replace(/[أإآ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/ـ/g, "")
        .replace(/\s+/g, " ")
        .toLowerCase(),
    n = (r) =>
      e(r)
        .replace(/[٠-٩]/g, (r) => String("٠١٢٣٤٥٦٧٨٩".indexOf(r)))
        .replace(/[۰-۹]/g, (r) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(r)))
        .replace(/\.0$/, "")
        .replace(/[\s-]/g, "");
  let r = null,
    a = null,
    o = -1,
    i = -1;
  function p(c) {
    const l = window.__dataRevision || 0;
    if (r === c && o === (c || []).length && i === l && a) return a;
    const s = new Map();
    for (const r of c || []) {
      const a = n(r.nid ?? r.nationalId);
      if (!/^\d+$/.test(a)) continue;
      let o = s.get(a);
      o || ((o = { person: r, places: new Map(), employment: new Map(), saps: new Set() }), s.set(a, o));
      const sp = n(r.sap).replace(/^0+(?=\d)/, "");
      /^\d+$/.test(sp) && o.saps.add(sp);
      const i = e(r.workplace),
        c = e(r.empStatus);
      (i && o.places.set(t(i), i), c && o.employment.set(t(c), c));
    }
    return ((r = c), (o = (c || []).length), (i = l), (a = s), s);
  }
  (document.addEventListener("dataUpdated", () => {
    r = null;
  }),
    (window.__dailyWorkforce = {
      join: function (r, a) {
        if (!r || (Array.isArray(r) && 0 === r.length)) return [];
        const o = p(a);
        return (r || []).map((r) => {
          const a0 = o.get(n(r.nid)),
            // OPM v150: نفس الرقم القومي لأكثر من SAP في العمالة → لا يُربط بأي عامل (تعارض هوية)
            refSaps = new Set(((window.__REFERENCE_BY_NID || {})[n(r.nid)] || []).map((x) => n(x.sap).replace(/^0+(?=\d)/, "")).filter(Boolean)),
            idConflict = !!((a0 && a0.saps.size > 1) || refSaps.size > 1 || (a0 && refSaps.size === 1 && a0.saps.size === 1 && ![...refSaps].every((x) => a0.saps.has(x)))),
            a = idConflict ? null : a0,
            i = a ? [...a.places.values()] : [],
            c = a ? [...a.employment.values()] : [],
            l = idConflict ? "identity-conflict" : a ? (i.length > 1 ? "conflict" : i.length ? "matched" : "missing-workplace") : "unmatched",
            s = "matched" === l ? i[0] : "",
            u = a && a.person ? a.person : null;
          let d = null;
          try {
            !idConflict && "function" == typeof window.__referencePersonByIds && (d = window.__referencePersonByIds(u ? e(u.sap) : "", n(r.nid), s));
          } catch (r) {}
          const g = {
            ...r,
            nid: n(r.nid),
            workplace: s,
            workplaceKey: s ? t(s) : "__unassigned__",
            empStatus: 1 === c.length ? c[0] : "غير محدد",
            sap: u ? e(u.sap) : "",
            job: e((d && d.job) || (u && (u.jobAr || u.job)) || ""),
            group: e((d && d.group) || (u && u.group) || ""),
            building: e((d && d.building) || (u && u.building) || ""),
            department: e((d && d.department) || (u && u.department) || ""),
            activity: e((d && d.activity) || (u && u.activity) || ""),
            org: e((d && d.org) || (u && (u.org || u.org_depth)) || ""),
            matchState: l,
          };
          return (
            d &&
              (g.sap || (g.sap = e(d.sap)),
              !g.workplace && d.workplace && ((g.workplace = e(d.workplace)), (g.workplaceKey = t(g.workplace))),
              (g.empStatus && "غير محدد" !== g.empStatus) || !d.status || (g.empStatus = e(d.status))),
            (g.search = t(
              [
                g.name,
                g.nid,
                g.phone,
                g.sap,
                g.job,
                g.group,
                g.building,
                g.department,
                g.activity,
                g.org,
                g.workplace,
                g.empStatus,
                g.center,
                g.governorate,
                g.lab,
                g.provider,
                g.result,
              ].join(" "),
            )),
            g
          );
        });
      },
      region: function (r, a) {
        return window.__opmRegionMatches(r, a);
      },
      norm: t,
      id: n,
    }));
})();

