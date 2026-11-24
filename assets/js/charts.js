/* ==========================================================================
   KROWN admin — small SVG chart helpers (no dependencies)
   Single series use the KROWN green. Multi-series use the validated
   categorical order (blue, orange, aqua, yellow, magenta) on the dark surface.
   ========================================================================== */
(function () {
  "use strict";
  var F = window.KROWN, esc = F.fmt.esc;
  var C = {}, mounts = [], tip = null;
  var INK = "#a9a9a3", GRID = "rgba(255,255,255,.07)", GREEN = "#d6aa48";

  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement("div"); tip.className = "ctip"; tip.setAttribute("role", "tooltip"); tip.hidden = true;
    document.body.appendChild(tip); return tip;
  }
  function place(x, y) {
    var t = ensureTip(), w = t.offsetWidth, h = t.offsetHeight;
    var left = Math.min(Math.max(8, x + 16), window.innerWidth - w - 8), top = y - h - 14;
    if (top < 8) top = y + 20;
    t.style.left = left + "px"; t.style.top = top + "px";
  }
  document.addEventListener("mouseover", function (e) {
    var el = e.target.closest ? e.target.closest("[data-tip]") : null;
    if (!el) return;
    var t = ensureTip(); t.innerHTML = el.getAttribute("data-tip"); t.hidden = false; place(e.clientX, e.clientY);
    var svg = el.closest("svg"), cx = el.getAttribute("data-cx");
    if (svg && cx !== null) {
      var xh = svg.querySelector(".xh"); if (xh) { xh.setAttribute("x1", cx); xh.setAttribute("x2", cx); xh.style.display = ""; }
      var ys = (el.getAttribute("data-cy") || "").split(",");
      svg.querySelectorAll(".xd").forEach(function (d, i) { if (ys[i] !== undefined && ys[i] !== "") { d.setAttribute("cx", cx); d.setAttribute("cy", ys[i]); d.style.display = ""; } });
    }
  });
  document.addEventListener("mousemove", function (e) { if (tip && !tip.hidden) place(e.clientX, e.clientY); });
  document.addEventListener("mouseout", function (e) {
    var el = e.target.closest ? e.target.closest("[data-tip]") : null;
    if (!el) return;
    if (tip) tip.hidden = true;
    var svg = el.closest("svg");
    if (svg) { var xh = svg.querySelector(".xh"); if (xh) xh.style.display = "none"; svg.querySelectorAll(".xd").forEach(function (d) { d.style.display = "none"; }); }
  });
  document.addEventListener("focusin", function (e) {
    var el = e.target.closest ? e.target.closest("[data-tip]") : null;
    if (!el || !el.getBoundingClientRect) return;
    var r = el.getBoundingClientRect(), t = ensureTip(); t.innerHTML = el.getAttribute("data-tip"); t.hidden = false; place(r.left + r.width / 2, r.top);
  });
  document.addEventListener("focusout", function () { if (tip) tip.hidden = true; });

  function render(m) {
    if (!document.body.contains(m.el)) return false;
    m.el.innerHTML = m.fn(Math.max(240, Math.floor(m.el.clientWidth))); return true;
  }
  C.mount = function (el, fn) { var m = { el: el, fn: fn }; mounts.push(m); render(m); };
  C.reset = function () { mounts = []; if (tip) tip.hidden = true; };
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { mounts = mounts.filter(render); }, 120);
  });

  function niceMax(v) {
    if (v <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }
  C.niceMax = niceMax;

  function srTable(caption, heads, rows) {
    return '<table class="sr"><caption>' + esc(caption) + "</caption><thead><tr>" + heads.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
  }

  /* series: [{name,color,pts:[{l,v}]}]; all series share the same labels */
  C.line = function (series, w, o) {
    var opt = o || {}, h = opt.h || 250, pl = 48, pr = 12, pt = 12, pb = 28, yf = opt.yFmt || F.fmt.num;
    var n = series[0].pts.length, max = 0, i, s;
    series.forEach(function (x) { x.pts.forEach(function (p) { if (p.v > max) max = p.v; }); });
    max = niceMax(max * 1.05);
    var pw = w - pl - pr, ph = h - pt - pb, step = n > 1 ? pw / (n - 1) : pw;
    var X = function (k) { return pl + k * step; }, Y = function (v) { return pt + ph - (v / max) * ph; };
    var out = '<svg class="chart" viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + esc(opt.label || "Line chart") + '">';
    for (i = 0; i <= 4; i++) {
      var gy = pt + ph - (i / 4) * ph;
      out += '<line x1="' + pl + '" x2="' + (w - pr) + '" y1="' + gy + '" y2="' + gy + '" stroke="' + GRID + '"/><text x="' + (pl - 8) + '" y="' + (gy + 4) + '" text-anchor="end" fill="' + INK + '" font-size="11">' + esc(yf(max * i / 4)) + "</text>";
    }
    var every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(pw / 90))));
    for (i = 0; i < n; i += every) out += '<text x="' + X(i) + '" y="' + (h - 8) + '" text-anchor="' + (i === 0 ? "start" : "middle") + '" fill="' + INK + '" font-size="11">' + esc(series[0].pts[i].l) + "</text>";
    series.forEach(function (x, si) {
      var d = x.pts.map(function (p, k) { return (k ? "L" : "M") + X(k).toFixed(1) + " " + Y(p.v).toFixed(1); }).join("");
      var gid = "lg" + Math.floor(Math.random() * 1e6);
      if (opt.area !== false && series.length === 1) {
        out += '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + x.color + '" stop-opacity=".28"/><stop offset="1" stop-color="' + x.color + '" stop-opacity="0"/></linearGradient></defs><path d="' + d + "L" + X(n - 1) + " " + (pt + ph) + "L" + X(0) + " " + (pt + ph) + 'Z" fill="url(#' + gid + ')"/>';
      }
      out += '<path d="' + d + '" fill="none" stroke="' + x.color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
      out += '<circle cx="' + X(n - 1) + '" cy="' + Y(x.pts[n - 1].v) + '" r="4" fill="' + x.color + '" stroke="#0e0d0c" stroke-width="2"/>';
    });
    out += '<line class="xh" y1="' + pt + '" y2="' + (pt + ph) + '" stroke="rgba(255,255,255,.35)" style="display:none"/>';
    series.forEach(function (x) { out += '<circle class="xd" r="5" fill="' + x.color + '" stroke="#0e0d0c" stroke-width="2" style="display:none"/>'; });
    for (i = 0; i < n; i++) {
      var tipHtml = "<b>" + esc(series[0].pts[i].full || series[0].pts[i].l) + "</b>" + series.map(function (x) { return '<div><i style="background:' + x.color + '"></i>' + esc(x.name) + ": <b>" + esc(yf(x.pts[i].v)) + "</b></div>"; }).join("");
      out += '<rect class="band" x="' + (X(i) - step / 2) + '" y="' + pt + '" width="' + step + '" height="' + ph + '" fill="transparent" data-tip="' + esc(tipHtml) + '" data-cx="' + X(i) + '" data-cy="' + series.map(function (x) { return Y(x.pts[i].v); }).join(",") + '"/>';
    }
    out += "</svg>";
    if (opt.table !== false) out += srTable(opt.label || "Chart data", ["Date"].concat(series.map(function (x) { return x.name; })), series[0].pts.map(function (p, k) { return [p.full || p.l].concat(series.map(function (x) { return yf(x.pts[k].v); })); }));
    return out;
  };

  /* months: [{l, vals:{key:v}}], keys: [{k,n,c}] */
  C.stack = function (months, keys, w, o) {
    var opt = o || {}, h = opt.h || 260, pl = 54, pr = 8, pt = 12, pb = 28, yf = opt.yFmt || F.fmt.eur;
    var max = 0;
    months.forEach(function (m) { var t = 0; keys.forEach(function (k) { t += m.vals[k.k] || 0; }); m.total = t; if (t > max) max = t; });
    max = niceMax(max * 1.05);
    var pw = w - pl - pr, ph = h - pt - pb, slot = pw / months.length, bw = Math.min(46, slot * 0.62);
    var out = '<svg class="chart" viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + esc(opt.label || "Stacked bar chart") + '">', i;
    for (i = 0; i <= 4; i++) {
      var gy = pt + ph - (i / 4) * ph;
      out += '<line x1="' + pl + '" x2="' + (w - pr) + '" y1="' + gy + '" y2="' + gy + '" stroke="' + GRID + '"/><text x="' + (pl - 8) + '" y="' + (gy + 4) + '" text-anchor="end" fill="' + INK + '" font-size="11">' + esc(F.fmt.compact(max * i / 4)) + "</text>";
    }
    months.forEach(function (m, mi) {
      var x = pl + mi * slot + (slot - bw) / 2, y = pt + ph;
      var tipHtml = "<b>" + esc(m.full || m.l) + "</b>" + keys.map(function (k) { return '<div><i style="background:' + k.c + '"></i>' + esc(k.n) + ": <b>" + esc(yf(m.vals[k.k] || 0)) + "</b></div>"; }).join("") + "<div>Total: <b>" + esc(yf(m.total)) + "</b></div>";
      out += '<g tabindex="0" data-tip="' + esc(tipHtml) + '" aria-label="' + esc(m.l + ": " + yf(m.total)) + '">';
      keys.forEach(function (k) {
        var v = m.vals[k.k] || 0; if (v <= 0) return;
        var hh = Math.max(1, (v / max) * ph - 2);
        y -= hh + 2;
        out += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + hh + '" rx="2" fill="' + k.c + '"/>';
      });
      out += '<rect x="' + (pl + mi * slot) + '" y="' + pt + '" width="' + slot + '" height="' + ph + '" fill="transparent"/>';
      out += '<text x="' + (x + bw / 2) + '" y="' + (h - 8) + '" text-anchor="middle" fill="' + INK + '" font-size="11">' + esc(m.l) + "</text></g>";
    });
    out += "</svg>";
    out += srTable(opt.label || "Chart data", ["Month"].concat(keys.map(function (k) { return k.n; })), months.map(function (m) { return [m.full || m.l].concat(keys.map(function (k) { return yf(m.vals[k.k] || 0); })); }));
    return out;
  };

  /* items: [{label, v, color, text, tip, href}] */
  C.hbars = function (items, w, o) {
    var opt = o || {}, rh = opt.rh || 36, lw = Math.min(opt.lw || 150, Math.floor(w * 0.38)), vw = 78, max = 0;
    items.forEach(function (it) { if (it.v > max) max = it.v; });
    max = max || 1;
    var h = items.length * rh + 4, bwMax = w - lw - vw - 8;
    var out = '<svg class="chart" viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + esc(opt.label || "Bar chart") + '">';
    items.forEach(function (it, i) {
      var y = i * rh + 4, bw = Math.max(3, (it.v / max) * bwMax);
      out += '<g tabindex="0" data-tip="' + esc(it.tip || ("<b>" + it.label + "</b><div>" + (it.text || it.v) + "</div>")) + '" aria-label="' + esc(it.label + ": " + (it.text || it.v)) + '">' +
        '<rect x="0" y="' + y + '" width="' + w + '" height="' + rh + '" fill="transparent"/>' +
        '<text x="0" y="' + (y + rh / 2 + 4) + '" fill="#e9e9e8" font-size="13">' + esc(it.label.length > 22 ? it.label.slice(0, 21) + "…" : it.label) + "</text>" +
        '<rect x="' + lw + '" y="' + (y + 8) + '" width="' + bw + '" height="' + (rh - 16) + '" rx="4" fill="' + (it.color || GREEN) + '"/>' +
        '<text x="' + (lw + bw + 8) + '" y="' + (y + rh / 2 + 4) + '" fill="' + INK + '" font-size="12" font-weight="600">' + esc(it.text || it.v) + "</text></g>";
    });
    return out + "</svg>" + srTable(opt.label || "Chart data", ["Name", "Value"], items.map(function (it) { return [it.label, it.text || it.v]; }));
  };

  /* items: [{label, v, color}] */
  C.donut = function (items, size, o) {
    var opt = o || {}, r = size / 2 - 14, c = 2 * Math.PI * r, tot = 0, off = 0;
    items.forEach(function (it) { tot += it.v; });
    var out = '<svg class="chart" viewBox="0 0 ' + size + " " + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="' + esc(opt.label || "Donut chart") + '"><g transform="rotate(-90 ' + size / 2 + " " + size / 2 + ')">';
    items.forEach(function (it) {
      var len = tot ? (it.v / tot) * c : 0, gap = items.length > 1 && len > 3 ? 2 : 0;
      out += '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + it.color + '" stroke-width="22" stroke-dasharray="' + Math.max(0, len - gap) + " " + (c - Math.max(0, len - gap)) + '" stroke-dashoffset="' + -off + '" tabindex="0" data-tip="' + esc("<b>" + it.label + "</b><div>" + (opt.fmt ? opt.fmt(it.v) : it.v) + " (" + (tot ? Math.round(it.v / tot * 100) : 0) + "%)</div>") + '" aria-label="' + esc(it.label + ": " + (opt.fmt ? opt.fmt(it.v) : it.v)) + '"/>';
      off += len;
    });
    out += "</g>";
    if (opt.center) out += '<text x="50%" y="46%" text-anchor="middle" fill="#fff" font-size="' + (size > 170 ? 24 : 18) + '" font-weight="800" font-style="italic">' + esc(opt.center) + '</text><text x="50%" y="58%" text-anchor="middle" fill="' + INK + '" font-size="11">' + esc(opt.sub || "") + "</text>";
    return out + "</svg>" + srTable(opt.label || "Chart data", ["Name", "Value"], items.map(function (it) { return [it.label, opt.fmt ? opt.fmt(it.v) : it.v]; }));
  };

  C.spark = function (vals, w, h, color) {
    var wd = w || 96, ht = h || 30, mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals), rg = (mx - mn) || 1;
    var d = vals.map(function (v, i) { return (i ? "L" : "M") + (i / (vals.length - 1) * (wd - 4) + 2).toFixed(1) + " " + (ht - 3 - ((v - mn) / rg) * (ht - 6)).toFixed(1); }).join("");
    return '<svg class="spark" viewBox="0 0 ' + wd + " " + ht + '" width="' + wd + '" height="' + ht + '" aria-hidden="true"><path d="' + d + '" fill="none" stroke="' + (color || GREEN) + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  };

  F.charts = C;
})();
