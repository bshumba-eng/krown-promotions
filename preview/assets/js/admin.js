/* ==========================================================================
   KROWN admin — login, dashboard, calendar, fighters, payments, stats, requests
   Demo build: data lives in this browser (see assets/js/store.js).
   ========================================================================== */
(function () {
  "use strict";
  var F = window.KROWN, S = F.store, fm = F.fmt, esc = fm.esc, icon = F.icon, C = F.charts, ui = F.ui, art = F.art;
  var root = document.getElementById("root");

  /* Credential check. Only a salted SHA-256 hash is stored here, never the password itself.
     This is a demo gate for a static site: replace with real authentication (Supabase) for production. */
  var SALT = "krown-2026";
  var DEMO_HASH = "5c28c4245dbc2472dc8ca3fe0e184ce019b5dc3d002cb8f1107cb0365d30f62a"; /* public demo login: admin / admin */
  var SESSION_KEY = "krown.admin.session", LOCK_KEY = "krown.admin.lock";

  var SRCS = [
    { k: "events", n: "Events", c: "#3987e5" }, { k: "website", n: "Website", c: "#d95926" }, { k: "ppv", n: "PPV", c: "#199e70" },
    { k: "fighters", n: "Fighters", c: "#c98500" }, { k: "sponsors", n: "Sponsors", c: "#d55181" }
  ];
  var TYPES = { fight: "Fight night", press: "Press conference", weighin: "Weigh-in", training: "Training day" };
  var NAV = [["dashboard", "Dashboard", "grid"], ["calendar", "Calendar", "calendar"], ["fighters", "Fighters", "glove"], ["payments", "Payments", "euro"], ["stats", "Stats", "chart"], ["requests", "Requests", "inbox"]];
  var GREEN = "#d6aa48";

  /* ---------- auth ---------- */
  function sha(s) {
    if (!window.crypto || !window.crypto.subtle) return Promise.reject(new Error("secure context required"));
    return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, "0"); }).join(""); });
  }
  function authed() { try { var v = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); return !!(v && v.exp > Date.now()); } catch (e) { return false; } }
  function lockInfo() { try { return JSON.parse(localStorage.getItem(LOCK_KEY) || "{}"); } catch (e) { return {}; } }
  function setLock(o) { try { localStorage.setItem(LOCK_KEY, JSON.stringify(o)); } catch (e) { /* ignore */ } }

  function renderLogin() {
    document.title = "Admin sign in | KROWN";
    root.innerHTML = '<div class="login"><div class="login__box"><div class="login__logo">' + art.logo("logo--lg") + '</div><h1 class="d">Admin sign in</h1><p class="sub">KROWN demo admin. Demo login: <b>admin</b> / <b>admin</b></p>' +
      '<form id="lf" novalidate><div class="field"><label for="lu">Username</label><input id="lu" name="lu" autocomplete="username" autocapitalize="none" spellcheck="false" required></div>' +
      '<div class="field"><label for="lp">Password</label><div class="pw"><input id="lp" name="lp" type="password" autocomplete="current-password" required><button type="button" id="lt" aria-label="Show password">Show</button></div></div>' +
      '<button class="btn" type="submit">' + icon("lock") + 'Sign in</button><div class="login__err" id="le" role="alert" aria-live="assertive"></div></form>' +
      '<p class="login__foot"><a class="link" href="../index.html">' + icon("left") + "Back to website</a></p></div></div>";
    var f = root.querySelector("#lf"), err = root.querySelector("#le");
    root.querySelector("#lt").addEventListener("click", function (e) { var p = root.querySelector("#lp"), show = p.type === "password"; p.type = show ? "text" : "password"; e.target.textContent = show ? "Hide" : "Show"; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var lk = lockInfo();
      var u = f.elements.lu.value.trim().toLowerCase(), p = f.elements.lp.value;
      if (!u || !p) { err.textContent = "Enter your username and password."; return; }
      sha(SALT + ":" + u + ":" + p).then(function (h) {
        /* the public demo login is never locked out, so visitors can always get in */
        var locked = lk.until && lk.until > Date.now() && h !== DEMO_HASH;
        if (locked) { err.textContent = "Too many attempts. Try again in " + Math.ceil((lk.until - Date.now()) / 1000) + " seconds."; return; }
        if (h === DEMO_HASH) {
          setLock({}); sessionStorage.setItem(SESSION_KEY, JSON.stringify({ exp: Date.now() + 8 * 36e5 }));
          location.hash = "#/dashboard"; start();
        } else {
          var n = (lk.n || 0) + 1; setLock({ n: n >= 5 ? 0 : n, until: n >= 5 ? Date.now() + 60000 : 0 });
          err.textContent = n >= 5 ? "Too many attempts. Locked for 60 seconds." : "Incorrect username or password.";
          f.elements.lp.value = ""; f.elements.lp.focus();
        }
      }).catch(function () { err.textContent = "Sign in needs a secure (https) connection."; });
    });
    root.querySelector("#lu").focus();
  }

  function logout() { sessionStorage.removeItem(SESSION_KEY); C.reset(); location.hash = ""; renderLogin(); }

  /* ---------- calculations ---------- */
  var DAY = 864e5;
  function tx() { return S.get().transactions; }
  function sum(list, key) { return list.reduce(function (a, t) { return a + (key ? t[key] : t.amount) || 0; }, 0); }
  function bySource(list) { var o = {}; SRCS.forEach(function (s) { o[s.k] = 0; }); list.forEach(function (t) { o[t.source] = (o[t.source] || 0) + t.amount; }); return o; }
  function income() { return sum(tx()); }
  function expenses() { return sum(S.get().expenses); }
  function payouts(status) { return S.get().payouts.filter(function (p) { return !status || p.status === status; }); }
  function balance() { return S.get().openingBalance + income() - expenses() - sum(payouts("paid")); }
  function eventName(id) { var e = S.event(id); return e ? e.title : "Not linked to an event"; }
  function fighterName(id) { var f = S.fighter(id); return f ? f.name : "KROWN"; }
  function lastEvent() {
    var past = S.past().filter(function (e) { return e.type === "fight" && tx().some(function (t) { return t.eventId === e.id; }); });
    return past[0] || null;
  }
  function inRange(ts, days) { return new Date(ts).getTime() >= Date.now() - days * DAY; }
  function monthSeries(n) {
    var out = [], now = new Date(), i, data = tx();
    for (i = n - 1; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1), key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
      var vals = bySource(data.filter(function (t) { return t.ts.slice(0, 7) === key; }));
      out.push({ l: d.toLocaleDateString("en-IE", { month: "short" }), full: d.toLocaleDateString("en-IE", { month: "long", year: "numeric" }), vals: vals });
    }
    return out;
  }
  function trafficSum(days, offset) {
    var arr = S.trafficRange(days + (offset || 0)), part = offset ? arr.slice(0, days) : arr, t = 0;
    part.forEach(function (d) { t += d.views; }); return t;
  }
  function delta(cur, prev) {
    if (!prev) return '<span class="delta">No earlier data</span>';
    var p = (cur - prev) / prev * 100;
    return '<span class="delta ' + (p >= 0 ? "up" : "down") + '">' + (p >= 0 ? "▲ " : "▼ ") + Math.abs(p).toFixed(1) + "% vs previous 30 days</span>";
  }
  function fighterRows(range) {
    var st = S.get(), cut = range === "30";
    return S.fighters(true).map(function (f) {
      var mine = tx().filter(function (t) { return t.fighterId === f.id && (!cut || inRange(t.ts, 30)); });
      var fs = st.fighterStats[f.id] || { views: 0, bio: 0, tickets: 0, train: 0, l30: {} }, v = cut ? (fs.l30 || {}) : fs;
      var bs = bySource(mine);
      return { f: f, revenue: sum(mine), tickets: sum(mine.filter(function (t) { return t.source === "events"; }), "qty"), ppv: sum(mine.filter(function (t) { return t.source === "ppv"; }), "qty"), views: v.views || 0, bio: v.bio || 0, train: v.train || 0, clicks: v.tickets || 0, bySrc: bs };
    });
  }
  function dayLabel(iso) { return new Date(iso + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short" }); }
  function trafficPts(days) { return S.trafficRange(days).map(function (d) { return { l: dayLabel(d.date), full: new Date(d.date + "T12:00:00").toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "long" }), v: d.views }; }); }
  function mailto(rq, subj) { return "mailto:" + encodeURIComponent(rq.email).replace("%40", "@") + "?subject=" + encodeURIComponent(subj); }

  /* ---------- shared pieces ---------- */
  function top(title, sub, acts) { return '<div class="top"><div><h1 class="d" tabindex="-1">' + title + "</h1>" + (sub ? '<p class="top__sub">' + sub + "</p>" : "") + '</div><div class="top__acts">' + (acts || "") + "</div></div>"; }
  function kpi(label, value, extra, ico, spark) { return '<div class="card kpi"><small>' + label + "</small><b>" + value + "</b>" + (extra || "") + (ico ? '<span class="kpi__ico">' + icon(ico) + "</span>" : "") + (spark || "") + "</div>"; }
  function legend(items) { return '<div class="legend">' + items.map(function (i) { return '<span><i style="background:' + i.c + '"></i>' + esc(i.n) + (i.v !== undefined ? "<b>" + i.v + "</b>" : "") + "</span>"; }).join("") + "</div>"; }
  function miniFighter(f) { return '<span class="mini">' + art.fighter(f, { badge: false }) + "</span>"; }
  function evType(e) { return e.type || "fight"; }
  function eventsByDate() { var m = {}; S.events(true).forEach(function (e) { var k = fm.iso(e.date); (m[k] = m[k] || []).push(e); }); return m; }
  function monthMatrix(y, m) {
    var first = new Date(y, m, 1), off = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(), cells = [], i;
    for (i = 0; i < off; i++) cells.push({ d: new Date(y, m, 1 - off + i), out: true });
    for (i = 1; i <= days; i++) cells.push({ d: new Date(y, m, i), out: false });
    while (cells.length % 7) cells.push({ d: new Date(y, m + 1, cells.length - off - days + 1), out: true });
    return cells;
  }
  function miniMonth(y, m, byDate) {
    var today = fm.iso(new Date()), h = ["M", "T", "W", "T", "F", "S", "S"].map(function (x) { return '<span class="h">' + x + "</span>"; }).join("");
    return '<div class="mc" role="grid">' + h + monthMatrix(y, m).map(function (c) {
      var k = fm.iso(c.d), evs = c.out ? [] : (byDate[k] || []), cl = [];
      if (c.out) cl.push("out"); if (k === today) cl.push("today");
      if (evs.length) { cl.push("has", "t-" + evType(evs[0])); if (new Date(evs[0].date) < new Date()) cl.push("past"); }
      return '<span class="' + cl.join(" ") + '"' + (evs.length ? ' title="' + esc(evs.map(function (e) { return e.title; }).join(", ")) + '"' : "") + ">" + c.d.getDate() + "</span>";
    }).join("") + "</div>";
  }
  function typeLegend() { return legend([{ n: "Fight night", c: GREEN }, { n: "Press", c: "#3987e5" }, { n: "Weigh-in", c: "#c98500" }, { n: "Training", c: "#d55181" }]); }
  function relDays(date) {
    var d = Math.ceil((new Date(date) - Date.now()) / DAY);
    return d > 1 ? "in " + d + " days" : (d === 1 ? "tomorrow" : (d === 0 ? "today" : Math.abs(d) + " days ago"));
  }
  function statusPill(s) { return '<span class="st st--' + s + '">' + { new: "New", contacted: "Contacted", closed: "Closed" }[s] + "</span>"; }
  function newCount() { return S.get().requests.filter(function (r) { return r.status === "new"; }).length; }

  /* ======================= DASHBOARD ======================= */
  function dashboard(v) {
    var next = S.nextFightNight(), rev30 = sum(tx().filter(function (t) { return inRange(t.ts, 30); })), revPrev = sum(tx().filter(function (t) { return inRange(t.ts, 60) && !inRange(t.ts, 30); }));
    var tr30 = trafficSum(30), trPrev = trafficSum(30, 30), months = monthSeries(9), sold = next ? S.ticketsSold(next.id) : 0, cap = next ? next.capacity : 0;
    var byD = eventsByDate(), now = new Date(), upcoming = S.upcoming().slice(0, 4), reqs = S.get().requests.slice().sort(function (a, b) { return new Date(b.ts) - new Date(a.ts); }).slice(0, 3);
    var owed = sum(payouts("owed")), rows = fighterRows("all").sort(function (a, b) { return b.revenue - a.revenue; }).slice(0, 4);
    var inc = bySource(tx());
    v.innerHTML = top("Dashboard", "Welcome back. Here is how KROWN is doing, " + fm.date(new Date()) + ".", '<span class="demo-badge">Demo data</span><a class="btn btn--ghost btn--sm" href="../index.html" target="_blank" rel="noopener">' + icon("external") + "View website</a>") +
      '<div class="grid g4">' +
      kpi("Total income", fm.eur(income()), '<span class="delta">Since KROWN began</span>', "euro", C.spark(months.map(function (m) { return Object.keys(m.vals).reduce(function (a, k) { return a + m.vals[k]; }, 0); }))) +
      kpi("Income, last 30 days", fm.eur(rev30), delta(rev30, revPrev), "trend") +
      kpi("Website views, 30 days", fm.num(tr30), delta(tr30, trPrev), "globe", C.spark(S.trafficRange(30).map(function (d) { return d.views; }))) +
      kpi("Next event tickets", fm.num(sold) + " / " + fm.num(cap), '<div class="progress"><i style="width:' + Math.min(100, cap ? sold / cap * 100 : 0) + '%"></i></div><span class="delta">' + (cap ? Math.round(sold / cap * 100) : 0) + "% of capacity</span>", "ticket") + "</div>" +
      '<div class="grid g21"><div class="card"><h2>Website traffic <small>Page views, last 30 days</small></h2><div id="cTraffic"></div></div>' +
      '<div class="card"><h2>Next fight night</h2>' + (next ? '<div class="d" style="font-size:26px;line-height:1.05">' + esc(next.title) + '</div><p class="mut" style="margin:6px 0 12px">' + esc(fm.day(next.date)) + " &middot; " + esc(fm.time(next.date)) + "<br>" + esc(next.venue) + ", " + esc(next.city) + '</p><span class="chip chip--g">' + relDays(next.date) + '</span><div class="progress" style="margin-top:18px"><i style="width:' + Math.min(100, cap ? sold / cap * 100 : 0) + '%"></i></div><p class="note-s">' + fm.num(sold) + " of " + fm.num(cap) + " tickets sold &middot; " + fm.num(S.card(next.id).length) + ' fighters on the card</p><div class="top__acts" style="margin-top:16px"><button class="btn btn--sm" data-a="edit-event" data-id="' + next.id + '">' + icon("edit") + 'Edit event</button><a class="btn btn--ghost btn--sm" href="#/calendar">Open calendar</a></div>' : '<div class="empty-s">No upcoming fight night. Add one in the calendar.</div><a class="btn btn--sm" href="#/calendar">Open calendar</a>') + "</div></div>" +
      '<div class="grid g12"><div class="card"><h2>' + now.toLocaleDateString("en-IE", { month: "long", year: "numeric" }) + ' <a class="link" href="#/calendar">Full calendar ' + icon("arrow") + "</a></h2>" + miniMonth(now.getFullYear(), now.getMonth(), byD) + typeLegend() + "</div>" +
      '<div class="card"><h2>Upcoming events <a class="link" href="#/calendar">Manage ' + icon("arrow") + '</a></h2><div class="ulist">' + (upcoming.length ? upcoming.map(urow).join("") : '<div class="empty-s">Nothing scheduled.</div>') + "</div></div></div>" +
      '<div class="grid g3"><div class="card"><h2>Income by source</h2><div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap"><div id="cDonut"></div><div style="flex:1;min-width:160px">' + legend(SRCS.map(function (s) { return { n: s.n, c: s.c, v: fm.eur(inc[s.k]) }; })).replace('class="legend"', 'class="legend" style="flex-direction:column;margin:0"') + "</div></div></div>" +
      '<div class="card"><h2>New requests <a class="link" href="#/requests">View all ' + icon("arrow") + "</a></h2>" + (reqs.length ? reqs.map(function (r) { return '<div style="display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid var(--line)"><div><b>' + esc(r.name) + '</b><small class="mut" style="display:block">' + esc({ sponsor: "Wants to sponsor", fight: "Wants to fight", collab: r.fields && r.fields.interest === "Join the team" ? "Wants to join the team" : "Collaboration" }[r.type]) + "</small></div>" + statusPill(r.status) + "</div>"; }).join("") : '<div class="empty-s">No requests yet.</div>') + "</div>" +
      '<div class="card"><h2>Top earners <a class="link" href="#/stats">Stats ' + icon("arrow") + '</a></h2><div class="tw"><table class="t" style="min-width:0"><tbody>' + rows.map(function (r, i) { return '<tr><td><span class="rank rank--' + (i + 1) + '">' + (i + 1) + '</span></td><td><div class="who">' + miniFighter(r.f) + esc(r.f.name) + '</div></td><td class="num">' + fm.eur(r.revenue) + "</td></tr>"; }).join("") + '</tbody></table></div><p class="note-s" style="margin-top:12px">Fighters owed: <b style="color:#fff">' + fm.eur(owed) + '</b> <a class="link" style="font-size:11px" href="#/payments">Payments</a></p></div></div>' +
      '<div class="card"><h2>Demo tools</h2><p class="note-s" style="margin-bottom:12px">This build stores its data in this browser. Reset to restore the original demo content, or switch to Supabase for shared live data.</p><button class="btn btn--danger btn--xs" data-a="reset">Reset demo data</button></div>';
    C.mount(v.querySelector("#cTraffic"), function (w) { return C.line([{ name: "Page views", color: GREEN, pts: trafficPts(30) }], w, { h: 240, label: "Page views over the last 30 days" }); });
    C.mount(v.querySelector("#cDonut"), function () { return C.donut(SRCS.map(function (s) { return { label: s.n, v: inc[s.k], color: s.c }; }), 150, { fmt: fm.eur, center: fm.compact(income()), sub: "income", label: "Income by source" }); });
  }

  function urow(e) {
    var d = new Date(e.date);
    return '<div class="urow"><div class="dd"><b>' + d.getDate() + "</b><span>" + d.toLocaleDateString("en-IE", { month: "short" }) + '</span></div><div><h3>' + esc(e.title) + "</h3><p>" + esc(TYPES[evType(e)]) + " &middot; " + esc(fm.time(e.date)) + " &middot; " + esc(e.venue) + (e.published ? "" : " &middot; Draft") + '</p></div><div class="acts"><button class="ib" data-a="edit-event" data-id="' + e.id + '" aria-label="Edit ' + esc(e.title) + '">' + icon("edit") + '</button><button class="ib ib--del" data-a="del-event" data-id="' + e.id + '" aria-label="Delete ' + esc(e.title) + '">' + icon("trash") + "</button></div></div>";
  }

  /* ======================= CALENDAR ======================= */
  var cal = { view: "upcoming", y: new Date().getFullYear(), m: new Date().getMonth() };
  function calendar(v) {
    var byD = eventsByDate(), title;
    var bar = function (t, prev, next) { return '<div class="calbar"><div class="nav2"><button class="ib" data-a="' + prev + '" aria-label="Previous">' + icon("left") + '</button><h2 class="d">' + t + '</h2><button class="ib" data-a="' + next + '" aria-label="Next">' + icon("right") + '</button><button class="btn btn--ghost btn--xs" data-a="cal-today">Today</button></div></div>'; };
    var body = "";
    if (cal.view === "month") {
      title = new Date(cal.y, cal.m, 1).toLocaleDateString("en-IE", { month: "long", year: "numeric" });
      var today = fm.iso(new Date());
      body = bar(title, "m-prev", "m-next") + '<div class="card"><div class="cal" role="grid" aria-label="' + esc(title) + '">' + ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(function (d) { return '<div class="cal__h">' + d + "</div>"; }).join("") +
        monthMatrix(cal.y, cal.m).map(function (c) {
          var k = fm.iso(c.d), evs = byD[k] || [];
          return '<div class="cal__d' + (c.out ? " out" : "") + (k === today ? " today" : "") + '" data-date="' + k + '" role="gridcell"><span class="cal__n">' + c.d.getDate() + '</span><button class="sr" data-a="add-event" data-date="' + k + '">Add event on ' + esc(fm.date(c.d)) + "</button>" +
            evs.map(function (e) { return '<button class="ev ev--' + evType(e) + (new Date(e.date) < new Date() ? " ev--past" : "") + '" data-a="edit-event" data-id="' + e.id + '" title="' + esc(e.title + " " + fm.time(e.date)) + '">' + esc(fm.time(e.date)) + " " + esc(e.title) + "</button>"; }).join("") + (evs.length ? '<i class="dot-e"></i>' : "") + "</div>";
        }).join("") + "</div>" + typeLegend() + '<p class="note-s" style="margin-top:12px">Click an event to edit it. Click an empty day to add an event on that date.</p></div>';
    } else if (cal.view === "year") {
      body = bar(String(cal.y), "y-prev", "y-next") + '<div class="ycal">' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (m) {
        var n = S.events(true).filter(function (e) { var d = new Date(e.date); return d.getFullYear() === cal.y && d.getMonth() === m; }).length;
        return '<button class="card" data-a="open-month" data-m="' + m + '" aria-label="Open ' + new Date(cal.y, m, 1).toLocaleDateString("en-IE", { month: "long" }) + '"><h3>' + new Date(cal.y, m, 1).toLocaleDateString("en-IE", { month: "long" }) + (n ? "<small>" + n + (n === 1 ? " event" : " events") + "</small>" : "") + "</h3>" + miniMonth(cal.y, m, byD) + "</button>";
      }).join("") + "</div>" + typeLegend();
    } else {
      var up = S.events(true).filter(function (e) { return new Date(e.date) >= new Date(); }), past = S.events(true).filter(function (e) { return new Date(e.date) < new Date(); }).reverse();
      body = '<div class="card"><h2>Upcoming events <small>' + up.length + " scheduled</small></h2><div class=\"ulist\">" + (up.length ? up.map(urow).join("") : '<div class="empty-s">Nothing scheduled. Add your first event.</div>') + '</div></div><div class="card" style="margin-top:16px"><h2>Earlier events <small>' + past.length + '</small></h2><div class="ulist">' + past.map(urow).join("") + "</div></div>";
    }
    v.innerHTML = top("Calendar", "View upcoming events, see the whole year and edit events. Changes appear on the public website straight away.", '<div class="seg" role="group" aria-label="Calendar view">' + [["upcoming", "Upcoming"], ["month", "Month"], ["year", "Year"]].map(function (x) { return '<button data-a="cal-view" data-v="' + x[0] + '" aria-pressed="' + (cal.view === x[0]) + '">' + x[1] + "</button>"; }).join("") + '</div><button class="btn btn--sm" data-a="add-event">' + icon("plus") + "Add event</button>") + body;
  }

  function eventForm(id, preDate) {
    var e = id ? S.event(id) : null, isNew = !e;
    e = e || { title: "", type: "fight", date: (preDate || fm.iso(new Date(Date.now() + 30 * DAY))) + "T15:00", venue: "Ashbourne House Hotel, Frederick Street", city: "Ashbourne, Co. Meath", capacity: 1000, ppv: false, published: true, description: "", ticketUrl: "", parentId: "" };
    var fights = S.events(true).filter(function (x) { return x.type === "fight" && x.id !== e.id; });
    var m = ui.modal('<h3 class="d">' + (isNew ? "Add event" : "Edit event") + '</h3><p class="modal__sub">' + (isNew ? "Create a new event for the calendar and website." : "Update the details below, then save.") + '</p><form id="ef" novalidate>' +
      '<div class="field"><label for="e-title">Event name <span class="req">*</span></label><input id="e-title" name="title" value="' + esc(e.title) + '" required><div class="err"></div></div>' +
      '<div class="fgrid2"><div class="field"><label for="e-type">Type</label><select id="e-type" name="type">' + Object.keys(TYPES).map(function (k) { return '<option value="' + k + '"' + (e.type === k ? " selected" : "") + ">" + TYPES[k] + "</option>"; }).join("") + '</select></div>' +
      '<div class="field"><label for="e-date">Date and time <span class="req">*</span></label><input id="e-date" name="date" type="datetime-local" value="' + esc(String(e.date).slice(0, 16)) + '" required><div class="err"></div></div>' +
      '<div class="field"><label for="e-venue">Venue</label><input id="e-venue" name="venue" value="' + esc(e.venue) + '"></div><div class="field"><label for="e-city">City</label><input id="e-city" name="city" value="' + esc(e.city) + '"></div>' +
      '<div class="field"><label for="e-cap">Capacity</label><input id="e-cap" name="capacity" type="number" min="0" value="' + esc(e.capacity) + '"></div>' +
      '<div class="field"><label for="e-parent">Part of fight night</label><select id="e-parent" name="parentId"><option value="">None</option>' + fights.map(function (x) { return '<option value="' + x.id + '"' + (e.parentId === x.id ? " selected" : "") + ">" + esc(x.title) + "</option>"; }).join("") + "</select></div></div>" +
      '<div class="field"><label for="e-url">Ticket link (optional)</label><input id="e-url" name="ticketUrl" type="url" placeholder="https://" value="' + esc(e.ticketUrl || "") + '"><div class="err"></div></div>' +
      '<div class="field"><label for="e-desc">Description</label><textarea id="e-desc" name="description">' + esc(e.description || "") + '</textarea></div>' +
      '<label class="chk"><input type="checkbox" name="ppv"' + (e.ppv ? " checked" : "") + '> Available on pay-per-view</label><label class="chk"><input type="checkbox" name="published"' + (e.published ? " checked" : "") + '> Published on the website</label>' +
      '<div class="formacts">' + (isNew ? "" : '<button type="button" class="btn btn--danger btn--sm l" id="e-del">' + icon("trash") + "Delete</button>") + '<button type="button" class="btn btn--ghost btn--sm" id="e-cancel">Cancel</button><button class="btn btn--sm" type="submit">Save event</button></div></form>', { label: isNew ? "Add event" : "Edit event" });
    m.querySelector("#e-cancel").addEventListener("click", ui.close);
    var del = m.querySelector("#e-del"); if (del) del.addEventListener("click", function () { ui.close(); confirmDelete(e.id); });
    m.querySelector("#ef").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = ev.target, ok = true, setErr = function (name, msg) { var b = f.elements[name].closest(".field"); b.classList.toggle("bad", !!msg); b.querySelector(".err").textContent = msg || ""; if (msg) ok = false; };
      setErr("title", f.elements.title.value.trim() ? "" : "Enter an event name.");
      setErr("date", f.elements.date.value ? "" : "Choose a date and time.");
      setErr("ticketUrl", !f.elements.ticketUrl.value || /^https?:\/\/\S+\.\S+/.test(f.elements.ticketUrl.value) ? "" : "Enter a full link starting with https://");
      if (!ok) return;
      var o = { id: e.id, title: f.elements.title.value.trim(), type: f.elements.type.value, date: f.elements.date.value, venue: f.elements.venue.value.trim(), city: f.elements.city.value.trim(), capacity: +f.elements.capacity.value || 0, parentId: f.elements.parentId.value, ticketUrl: f.elements.ticketUrl.value.trim(), description: f.elements.description.value.trim(), ppv: f.elements.ppv.checked, published: f.elements.published.checked, featured: e.featured };
      if (!o.parentId) delete o.parentId;
      S.saveEvent(o); ui.close(); ui.toast(isNew ? "Event added." : "Event saved."); refresh();
    });
  }
  function confirmDelete(id) {
    var e = S.event(id); if (!e) return;
    var m = ui.modal('<h3 class="d">Delete event?</h3><p class="modal__sub">' + esc(e.title) + " on " + esc(fm.date(e.date)) + ' will be removed from the calendar and the website. This cannot be undone.</p><div class="formacts"><button class="btn btn--ghost btn--sm" id="d-no">Keep event</button><button class="btn btn--danger btn--sm" id="d-yes">' + icon("trash") + "Delete</button></div>", { label: "Confirm delete" });
    m.querySelector("#d-no").addEventListener("click", ui.close);
    m.querySelector("#d-yes").addEventListener("click", function () { S.deleteEvent(id); ui.close(); ui.toast("Event deleted."); refresh(); });
  }

  /* ======================= FIGHTERS ======================= */
  function fighters(v) {
    var list = S.fighters(true), q = "";
    v.innerHTML = top("Fighters", "View and edit every fighter profile. Changes show on the public website straight away.", '<button class="btn btn--sm" data-a="add-fighter">' + icon("plus") + "Add fighter</button>") +
      '<div class="card"><div class="tools"><div class="field--search"><label class="sr" for="fq">Search</label>' + icon("search") + '<input id="fq" type="search" placeholder="Search fighters"></div><span class="note-s">' + list.length + ' fighters</span></div><div class="tw"><table class="t"><thead><tr><th scope="col">Fighter</th><th scope="col">Weight class</th><th scope="col">Record</th><th scope="col">Next fight</th><th scope="col">Status</th><th scope="col"><span class="sr">Actions</span></th></tr></thead><tbody id="fb"></tbody></table></div></div>';
    function draw() {
      v.querySelector("#fb").innerHTML = list.filter(function (f) { return !q || (f.name + f.nickname + f.weightClass).toLowerCase().indexOf(q) > -1; }).map(function (f) {
        var e = f.nextFight && f.nextFight.eventId ? S.event(f.nextFight.eventId) : null;
        return '<tr><td><div class="who">' + miniFighter(f) + "<div>" + esc(f.name) + '<small class="mut" style="display:block;font-weight:500">&ldquo;' + esc(f.nickname) + '&rdquo; &middot; ' + esc(f.hometown) + "</small></div></div></td><td>" + esc(f.weightClass) + "</td><td>" + f.record.w + "-" + f.record.l + "-" + f.record.d + ' <span class="mut">(' + f.record.ko + " KO)</span></td><td>" + (e ? esc(f.nextFight.opponent) + '<small class="mut" style="display:block">' + esc(fm.dateShort(e.date)) + "</small>" : '<span class="mut">To be announced</span>') + "</td><td>" + (f.published ? '<span class="st st--paid">Published</span>' : '<span class="st st--closed">Hidden</span>') + '</td><td><div class="acts" style="display:flex;gap:8px"><button class="ib" data-a="edit-fighter" data-id="' + f.id + '" aria-label="Edit ' + esc(f.name) + '">' + icon("edit") + '</button><a class="ib" href="../fighter.html?id=' + encodeURIComponent(f.id) + '" target="_blank" rel="noopener" aria-label="View ' + esc(f.name) + ' on the website">' + icon("external") + "</a></div></td></tr>";
      }).join("") || '<tr><td colspan="6" class="empty-s">No fighters match.</td></tr>';
    }
    v.querySelector("#fq").addEventListener("input", function (e) { q = e.target.value.trim().toLowerCase(); draw(); });
    draw();
  }

  function fighterForm(id) {
    var old = id ? S.fighter(id) : null, isNew = !old;
    var f = old ? F.clone(old) : { id: "", name: "", nickname: "", number: S.fighters(true).length + 1, weightClass: "Welterweight", record: { w: 0, l: 0, d: 0, ko: 0 }, age: 22, height: "", reach: "", stance: "Orthodox", hometown: "", gloves: "#d6aa48", published: true, photo: "", bio: "", nextFight: { eventId: "", opponent: "", slot: "Undercard", weight: "", rounds: 6, ticketUrl: "" }, previousFights: [], training: { venue: "", address: "", days: "", time: "", note: "" } };
    var classes = ["Featherweight", "Super Featherweight", "Lightweight", "Super Lightweight", "Welterweight", "Super Welterweight", "Middleweight", "Light Heavyweight", "Cruiserweight", "Heavyweight"];
    if (classes.indexOf(f.weightClass) < 0) classes.push(f.weightClass);
    var evs = S.events(true).filter(function (e) { return e.type === "fight"; });
    var slots = ["Main event", "Co-main event", "Chief supporting bout", "Featured bout", "Undercard", "To be announced"];
    var inp = function (n, l, val, extra) { return '<div class="field"><label for="f-' + n + '">' + l + "</label><input id=\"f-" + n + '" name="' + n + '" value="' + esc(val) + '" ' + (extra || "") + "></div>"; };
    var prow = function (p) {
      return '<div class="prevrow"><input type="date" name="p-date" aria-label="Fight date" value="' + esc(p.date || "") + '"><input name="p-opp" aria-label="Opponent" placeholder="Opponent" value="' + esc(p.opponent || "") + '"><select name="p-res" aria-label="Result">' + ["W", "L", "D"].map(function (r) { return "<option" + (p.result === r ? " selected" : "") + ">" + r + "</option>"; }).join("") + '</select><input name="p-method" aria-label="Method" placeholder="UD 8" value="' + esc(p.method || "") + '"><input name="p-event" aria-label="Event" placeholder="Event" value="' + esc(p.event || "") + '"><button type="button" class="ib ib--del" data-rm aria-label="Remove fight">' + icon("trash") + "</button></div>";
    };
    var m = ui.modal('<h3 class="d">' + (isNew ? "Add fighter" : "Edit " + esc(f.name)) + '</h3><p class="modal__sub">Profile details shown on the website.</p><form id="ff" novalidate>' +
      '<div class="fgrid2">' + '<div class="field"><label for="f-name">Full name <span class="req">*</span></label><input id="f-name" name="name" value="' + esc(f.name) + '" required><div class="err"></div></div>' + inp("nickname", "Nickname", f.nickname) + "</div>" +
      '<div class="fgrid4"><div class="field"><label for="f-wc">Weight class</label><select id="f-wc" name="weightClass">' + classes.map(function (c) { return "<option" + (c === f.weightClass ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select></div>" + inp("age", "Age", f.age, 'type="number" min="16" max="60"') + inp("height", "Height", f.height, 'placeholder="5\'11&quot;"') + inp("reach", "Reach", f.reach) + "</div>" +
      '<div class="fgrid4"><div class="field"><label for="f-st">Stance</label><select id="f-st" name="stance">' + ["Orthodox", "Southpaw", "Switch"].map(function (c) { return "<option" + (c === f.stance ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select></div>" + inp("hometown", "Hometown", f.hometown) + inp("number", "Card number", f.number, 'type="number" min="1"') +
      '<div class="field"><label for="f-gl">Glove colour (artwork)</label><select id="f-gl" name="gloves"><option value="#d6aa48"' + (f.gloves === "#d6aa48" ? " selected" : "") + '>Green</option><option value="#ffffff"' + (f.gloves === "#ffffff" ? " selected" : "") + ">White</option></select></div></div>" +
      '<div class="fgrid4">' + inp("w", "Wins", f.record.w, 'type="number" min="0"') + inp("l", "Losses", f.record.l, 'type="number" min="0"') + inp("d", "Draws", f.record.d, 'type="number" min="0"') + inp("ko", "Knockouts", f.record.ko, 'type="number" min="0"') + "</div>" +
      '<div class="field"><label for="f-photo">Photo link (optional, replaces the generated artwork)</label><input id="f-photo" name="photo" type="url" placeholder="https://" value="' + esc(f.photo || "") + '"></div>' +
      '<div class="field"><label for="f-bio">Bio</label><textarea id="f-bio" name="bio" style="min-height:150px">' + esc(f.bio) + "</textarea></div>" +
      '<div class="fsec">Next fight</div><div class="fgrid2"><div class="field"><label for="n-ev">Event</label><select id="n-ev" name="n-ev"><option value="">To be announced</option>' + evs.map(function (e) { return '<option value="' + e.id + '"' + (f.nextFight.eventId === e.id ? " selected" : "") + ">" + esc(e.title + " (" + fm.dateShort(e.date) + ")") + "</option>"; }).join("") + "</select></div>" + inp("n-opp", "Opponent", f.nextFight.opponent) + "</div>" +
      '<div class="fgrid4"><div class="field"><label for="n-slot">Slot on card</label><select id="n-slot" name="n-slot">' + slots.map(function (c) { return "<option" + (c === f.nextFight.slot ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select></div>" + inp("n-weight", "Weight", f.nextFight.weight) + inp("n-rounds", "Rounds", f.nextFight.rounds, 'type="number" min="1" max="12"') + inp("n-url", "Ticket link (optional)", f.nextFight.ticketUrl || "", 'type="url" placeholder="https://"') + "</div>" +
      '<div class="fsec">Previous fights</div><div id="prev">' + f.previousFights.map(prow).join("") + '</div><button type="button" class="btn btn--ghost btn--xs" id="addprev">' + icon("plus") + "Add fight</button>" +
      '<div class="fsec">Where to watch them train</div><div class="fgrid2">' + inp("t-venue", "Gym or venue", f.training.venue) + inp("t-address", "Address", f.training.address) + inp("t-days", "Days", f.training.days) + inp("t-time", "Time", f.training.time) + "</div>" + '<div class="field"><label for="t-note">Visitor note</label><textarea id="t-note" name="t-note" style="min-height:80px">' + esc(f.training.note) + "</textarea></div>" +
      '<label class="chk"><input type="checkbox" name="published"' + (f.published ? " checked" : "") + "> Published on the website</label>" +
      '<div class="formacts"><button type="button" class="btn btn--ghost btn--sm" id="f-cancel">Cancel</button><button class="btn btn--sm" type="submit">Save fighter</button></div></form>', { lg: true, label: isNew ? "Add fighter" : "Edit fighter" });
    m.querySelector("#f-cancel").addEventListener("click", ui.close);
    m.querySelector("#addprev").addEventListener("click", function () { m.querySelector("#prev").insertAdjacentHTML("beforeend", prow({ result: "W" })); });
    m.querySelector("#prev").addEventListener("click", function (e) { var b = e.target.closest("[data-rm]"); if (b) b.closest(".prevrow").remove(); });
    m.querySelector("#ff").addEventListener("submit", function (e) {
      e.preventDefault();
      var fm2 = e.target, name = fm2.elements.name.value.trim(), fld = fm2.elements.name.closest(".field");
      if (!name) { fld.classList.add("bad"); fld.querySelector(".err").textContent = "Enter the fighter's name."; fm2.elements.name.focus(); return; }
      var rows = Array.prototype.map.call(m.querySelectorAll(".prevrow"), function (r) { return { date: r.querySelector('[name="p-date"]').value, opponent: r.querySelector('[name="p-opp"]').value.trim(), result: r.querySelector('[name="p-res"]').value, method: r.querySelector('[name="p-method"]').value.trim(), event: r.querySelector('[name="p-event"]').value.trim() }; }).filter(function (r) { return r.opponent && r.date; }).sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      var n = function (k) { return Math.max(0, +fm2.elements[k].value || 0); };
      var o = { id: f.id || name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), name: name, nickname: fm2.elements.nickname.value.trim(), number: n("number") || 1, weightClass: fm2.elements.weightClass.value, record: { w: n("w"), l: n("l"), d: n("d"), ko: n("ko") }, age: n("age"), height: fm2.elements.height.value.trim(), reach: fm2.elements.reach.value.trim(), stance: fm2.elements.stance.value, hometown: fm2.elements.hometown.value.trim(), gloves: fm2.elements.gloves.value, published: fm2.elements.published.checked, photo: fm2.elements.photo.value.trim(), bio: fm2.elements.bio.value.trim(),
        nextFight: { eventId: fm2.elements["n-ev"].value, opponent: fm2.elements["n-opp"].value.trim() || "Opponent to be announced", slot: fm2.elements["n-slot"].value, weight: fm2.elements["n-weight"].value.trim() || fm2.elements.weightClass.value, rounds: n("n-rounds") || 6, ticketUrl: fm2.elements["n-url"].value.trim() },
        previousFights: rows, training: { venue: fm2.elements["t-venue"].value.trim(), address: fm2.elements["t-address"].value.trim(), days: fm2.elements["t-days"].value.trim(), time: fm2.elements["t-time"].value.trim(), note: fm2.elements["t-note"].value.trim() } };
      if (isNew && S.fighter(o.id)) o.id += "-" + Date.now().toString(36).slice(-3);
      S.saveFighter(o); ui.close(); ui.toast(isNew ? "Fighter added." : "Fighter saved."); refresh();
    });
  }

  /* ======================= PAYMENTS ======================= */
  var payFilter = "all";
  function payments(v) {
    var le = lastEvent(), leInc = le ? sum(tx().filter(function (t) { return t.eventId === le.id; })) : 0, leExp = le ? sum(S.get().expenses.filter(function (x) { return x.eventId === le.id; })) : 0;
    var inc = bySource(tx()), tot = income(), owed = payouts("owed"), owedTotal = sum(owed), today = fm.iso(new Date());
    var overdue = sum(owed.filter(function (p) { return p.due < today; }));
    var months = monthSeries(12);
    var evRows = S.events(true).filter(function (e) { return e.type === "fight" && tx().some(function (t) { return t.eventId === e.id; }); }).sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).map(function (e) {
      var b = bySource(tx().filter(function (t) { return t.eventId === e.id; })), total = Object.keys(b).reduce(function (a, k) { return a + b[k]; }, 0), cost = sum(S.get().expenses.filter(function (x) { return x.eventId === e.id; })) + sum(payouts().filter(function (p) { return p.eventId === e.id; }));
      return { e: e, b: b, total: total, cost: cost };
    });
    v.innerHTML = top("Payments", "How much KROWN is making, what the last event earned and who is owed.", '<button class="btn btn--sm" data-a="add-tx">' + icon("plus") + "Record income</button>") +
      '<div class="grid g4">' + kpi("Total income", fm.eur(tot), '<span class="delta">All sources</span>', "euro") +
      kpi("Last event made", fm.eur(leInc), '<span class="delta">' + (le ? esc(le.title) + " &middot; profit " + fm.eur(leInc - leExp - sum(payouts().filter(function (p) { return p.eventId === le.id; }))) : "No completed event yet") + "</span>", "ticket") +
      kpi("Current balance", fm.eur(balance()), '<span class="delta">Opening balance + income − costs − payouts paid</span>', "shield") +
      kpi("Fighters owed", fm.eur(owedTotal), '<span class="delta ' + (overdue ? "down" : "") + '">' + (overdue ? fm.eur(overdue) + " overdue" : "Nothing overdue") + "</span>", "glove") + "</div>" +
      '<div class="grid g21"><div class="card"><h2>Income by month <small>Last 12 months</small></h2><div id="cMonths"></div>' + legend(SRCS) + '</div><div class="card"><h2>Where the money is made</h2>' + SRCS.map(function (s) { var pct = tot ? inc[s.k] / tot * 100 : 0; return '<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:14px"><span style="display:inline-flex;gap:8px;align-items:center"><i style="width:10px;height:10px;border-radius:3px;background:' + s.c + '"></i>' + s.n + "</span><b>" + fm.eur(inc[s.k]) + ' <span class="mut" style="font-weight:500">' + pct.toFixed(1) + '%</span></b></div><div class="progress" style="margin:6px 0 0"><i style="width:' + pct + "%;background:" + s.c + ';box-shadow:none"></i></div></div>'; }).join("") + "</div></div>" +
      '<div class="card" style="margin-bottom:16px"><h2>Fighters owed <small>' + fm.eur(owedTotal) + " in total</small></h2>" + (owed.length ? '<div class="tw"><table class="t"><thead><tr><th scope="col">Fighter</th><th scope="col">Event</th><th scope="col">Due</th><th scope="col" class="num">Amount</th><th scope="col">Status</th><th scope="col"><span class="sr">Action</span></th></tr></thead><tbody>' + owed.sort(function (a, b) { return a.due < b.due ? -1 : 1; }).map(function (p) {
        var f = S.fighter(p.fighterId), st = p.due < today ? ["over", "Overdue"] : ["due", "Upcoming"];
        return '<tr><td><div class="who">' + (f ? miniFighter(f) : "") + esc(fighterName(p.fighterId)) + "</div></td><td>" + esc(eventName(p.eventId)) + "</td><td>" + esc(fm.dateShort(p.due)) + '</td><td class="num"><b>' + fm.eur(p.amount) + '</b></td><td><span class="st st--' + st[0] + '">' + st[1] + '</span></td><td><button class="btn btn--ghost btn--xs" data-a="paid" data-id="' + p.id + '">' + icon("check") + "Mark paid</button></td></tr>";
      }).join("") + "</tbody></table></div>" : '<div class="empty-s">Every fighter has been paid.</div>') + '<p class="note-s" style="margin-top:12px">Paid out so far: <b style="color:#fff">' + fm.eur(sum(payouts("paid"))) + "</b></p></div>" +
      '<div class="card" style="margin-bottom:16px"><h2>Event earnings</h2><div class="tw"><table class="t"><thead><tr><th scope="col">Event</th><th scope="col" class="num">Tickets</th><th scope="col" class="num">PPV</th><th scope="col" class="num">Fighters</th><th scope="col" class="num">Sponsors</th><th scope="col" class="num">Income</th><th scope="col" class="num">Costs and purses</th><th scope="col" class="num">Net</th></tr></thead><tbody>' + evRows.map(function (r) { return "<tr><td><b>" + esc(r.e.title) + '</b><small class="mut" style="display:block">' + esc(fm.dateShort(r.e.date)) + '</small></td><td class="num">' + fm.eur(r.b.events) + '</td><td class="num">' + fm.eur(r.b.ppv) + '</td><td class="num">' + fm.eur(r.b.fighters) + '</td><td class="num">' + fm.eur(r.b.sponsors) + '</td><td class="num"><b>' + fm.eur(r.total) + '</b></td><td class="num">' + fm.eur(r.cost) + '</td><td class="num"><b style="color:' + (r.total - r.cost >= 0 ? "var(--g)" : "#ff8d8d") + '">' + fm.eur(r.total - r.cost) + "</b></td></tr>"; }).join("") + '</tbody></table></div><p class="note-s" style="margin-top:12px">Upcoming events show income so far against purses already booked.</p></div>' +
      '<div class="card"><h2>Recent transactions</h2><div class="bar" id="txBar" style="margin-bottom:14px"></div><div class="tw"><table class="t"><thead><tr><th scope="col">Date</th><th scope="col">Description</th><th scope="col">Source</th><th scope="col">Fighter</th><th scope="col" class="num">Amount</th></tr></thead><tbody id="txb"></tbody></table></div></div>';
    C.mount(v.querySelector("#cMonths"), function (w) { return C.stack(months, SRCS, w, { h: 270, label: "Income by month and source" }); });
    var bar = v.querySelector("#txBar");
    [["all", "All"]].concat(SRCS.map(function (s) { return [s.k, s.n]; })).forEach(function (s) {
      var b = document.createElement("button"); b.className = "pill"; b.type = "button"; b.textContent = s[1]; b.setAttribute("aria-pressed", String(payFilter === s[0]));
      b.addEventListener("click", function () { payFilter = s[0]; bar.querySelectorAll(".pill").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); drawTx(); }); bar.appendChild(b);
    });
    function drawTx() {
      var list = tx().filter(function (t) { return payFilter === "all" || t.source === payFilter; }).sort(function (a, b) { return a.ts < b.ts ? 1 : -1; }).slice(0, 14);
      v.querySelector("#txb").innerHTML = list.map(function (t) { var s = SRCS.filter(function (x) { return x.k === t.source; })[0]; return "<tr><td>" + esc(fm.dateShort(t.ts)) + "</td><td>" + esc(t.desc) + (t.eventId ? '<small class="mut" style="display:block">' + esc(eventName(t.eventId)) + "</small>" : "") + '</td><td><span class="legend" style="margin:0"><span><i style="background:' + (s ? s.c : "#888") + '"></i>' + (s ? s.n : esc(t.source)) + "</span></span></td><td>" + (t.fighterId ? esc(fighterName(t.fighterId)) : '<span class="mut">None</span>') + '</td><td class="num"><b>' + fm.eur(t.amount) + "</b></td></tr>"; }).join("") || '<tr><td colspan="5" class="empty-s">No transactions.</td></tr>';
    }
    drawTx();
  }
  function txForm() {
    var m = ui.modal('<h3 class="d">Record income</h3><p class="modal__sub">Add income that happened outside the website, such as a sponsor payment or cash sales.</p><form id="tf" novalidate><div class="fgrid2"><div class="field"><label for="t-src">Source</label><select id="t-src" name="source">' + SRCS.map(function (s) { return '<option value="' + s.k + '">' + s.n + "</option>"; }).join("") + '</select></div><div class="field"><label for="t-amt">Amount (EUR) <span class="req">*</span></label><input id="t-amt" name="amount" type="number" min="1" step="0.01" required><div class="err"></div></div></div><div class="field"><label for="t-desc">Description <span class="req">*</span></label><input id="t-desc" name="desc" required><div class="err"></div></div><div class="fgrid2"><div class="field"><label for="t-ev">Event (optional)</label><select id="t-ev" name="eventId"><option value="">None</option>' + S.events(true).filter(function (e) { return e.type === "fight"; }).map(function (e) { return '<option value="' + e.id + '">' + esc(e.title) + "</option>"; }).join("") + '</select></div><div class="field"><label for="t-f">Fighter (optional)</label><select id="t-f" name="fighterId"><option value="">None</option>' + S.fighters(true).map(function (f) { return '<option value="' + f.id + '">' + esc(f.name) + "</option>"; }).join("") + '</select></div></div><div class="formacts"><button type="button" class="btn btn--ghost btn--sm" id="t-c">Cancel</button><button class="btn btn--sm" type="submit">Save</button></div></form>', { label: "Record income" });
    m.querySelector("#t-c").addEventListener("click", ui.close);
    m.querySelector("#tf").addEventListener("submit", function (e) {
      e.preventDefault(); var f = e.target, ok = true;
      [["amount", +f.elements.amount.value > 0 ? "" : "Enter an amount above zero."], ["desc", f.elements.desc.value.trim() ? "" : "Enter a description."]].forEach(function (c) { var b = f.elements[c[0]].closest(".field"); b.classList.toggle("bad", !!c[1]); b.querySelector(".err").textContent = c[1]; if (c[1]) ok = false; });
      if (!ok) return;
      S.addTransaction({ source: f.elements.source.value, amount: Math.round(+f.elements.amount.value * 100) / 100, qty: 0, eventId: f.elements.eventId.value, fighterId: f.elements.fighterId.value, desc: f.elements.desc.value.trim() });
      ui.close(); ui.toast("Income recorded."); refresh();
    });
  }

  /* ======================= STATS ======================= */
  var stat = { range: "all", sort: "revenue", dir: -1 };
  function stats(v) {
    var rows = fighterRows(stat.range), byRev = rows.slice().sort(function (a, b) { return b.revenue - a.revenue; });
    var best = function (k) { return rows.slice().sort(function (a, b) { return b[k] - a[k]; })[0]; };
    var worst = byRev[byRev.length - 1], topE = byRev[0], topT = best("views"), topB = best("bio");
    var card = function (label, r, val, ico) { return r ? '<div class="card kpi kpi--s"><small>' + label + '</small><div class="who" style="margin:10px 0 4px;font-size:18px">' + miniFighter(r.f) + esc(r.f.name) + "</div><b>" + val + '</b><span class="kpi__ico">' + icon(ico) + "</span></div>" : ""; };
    var sorted = rows.slice().sort(function (a, b) { return (a[stat.sort] - b[stat.sort]) * stat.dir; });
    var maxOf = function (k) { return Math.max.apply(null, rows.map(function (r) { return r[k]; })) || 1; };
    var th = function (k, l, num) { return '<th scope="col"' + (num ? ' class="num"' : "") + (stat.sort === k ? ' aria-sort="' + (stat.dir < 0 ? "descending" : "ascending") + '"' : "") + '><button data-a="sort" data-k="' + k + '">' + l + (stat.sort === k ? (stat.dir < 0 ? " ▼" : " ▲") : "") + "</button></th>"; };
    var cell = function (r, k, fmt) { return '<td class="num"><div>' + fmt(r[k]) + '</div><div class="progress" style="margin:5px 0 0;height:5px"><i style="width:' + (r[k] / maxOf(k) * 100) + '%"></i></div></td>'; };
    var src = [["Instagram", .38], ["Direct", .24], ["Search", .16], ["YouTube", .13], ["Other", .09]], tv = trafficSum(stat.range === "30" ? 30 : 90), cols = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181"];
    v.innerHTML = top("Stats", "Which fighters are making KROWN money, driving traffic and getting the most clicks.", '<div class="seg" role="group" aria-label="Time range"><button data-a="range" data-v="all" aria-pressed="' + (stat.range === "all") + '">All time</button><button data-a="range" data-v="30" aria-pressed="' + (stat.range === "30") + '">Last 30 days</button></div>') +
      '<div class="grid g4">' + card("Making KROWN the most money", topE, fm.eur(topE.revenue), "euro") + card("Bringing in the most traffic", topT, fm.num(topT.views) + " profile views", "trend") + card("Most bio clicks", topB, fm.num(topB.bio) + " bio opens", "users") + card("Bringing in the least", worst, fm.eur(worst.revenue), "alert") + "</div>" +
      '<div class="grid g2"><div class="card"><h2>Money brought in <small>Tickets, PPV, website and fighter sales attributed to each fighter</small></h2><div id="cRev"></div></div><div class="card"><h2>Bio and profile clicks <small>Profile views and full bio opens</small></h2><div id="cBio"></div>' + legend([{ n: "Profile views", c: GREEN }, { n: "Bio opens", c: "#7cc4ff" }]) + "</div></div>" +
      '<div class="card" style="margin-bottom:16px"><h2>Fighter league table <small>Click a column to sort</small></h2><div class="tw"><table class="t" style="min-width:820px"><thead><tr><th scope="col">Rank</th><th scope="col">Fighter</th>' + th("revenue", "Money in", 1) + th("tickets", "Event sales (tickets)", 1) + th("ppv", "PPV buys", 1) + th("views", "Website views", 1) + th("bio", "Bio clicks", 1) + th("train", "Training clicks", 1) + "</tr></thead><tbody>" +
      sorted.map(function (r, i) { return '<tr><td><span class="rank rank--' + (i + 1) + '">' + (i + 1) + '</span></td><td><div class="who">' + miniFighter(r.f) + esc(r.f.name) + "</div></td>" + cell(r, "revenue", fm.eur) + cell(r, "tickets", fm.num) + cell(r, "ppv", fm.num) + cell(r, "views", fm.num) + cell(r, "bio", fm.num) + cell(r, "train", fm.num) + "</tr>"; }).join("") + '</tbody></table></div><p class="note-s" style="margin-top:12px">Ticket and PPV sales are credited to the fighter whose page the buyer visited last. Views and clicks are counted on the public fighter pages.</p></div>' +
      '<div class="grid g3"><div class="card"><h2>Event sales <small>Tickets sold</small></h2><div id="cT"></div></div><div class="card"><h2>Pay-per-view <small>PPV buys</small></h2><div id="cP"></div></div><div class="card"><h2>Website <small>Profile views</small></h2><div id="cW"></div></div></div><div class="card"><h2>Where website visitors come from <small>Estimated share of views</small></h2><div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap"><div id="cSrc"></div><div style="flex:1;min-width:150px">' + legend(src.map(function (s, i) { return { n: s[0], c: cols[i], v: fm.num(tv * s[1]) }; })).replace('class="legend"', 'class="legend" style="flex-direction:column;margin:0"') + "</div></div></div>";
    C.mount(v.querySelector("#cRev"), function (w) { return C.hbars(byRev.map(function (r) { return { label: r.f.name, v: r.revenue, text: fm.eur(r.revenue), tip: "<b>" + esc(r.f.name) + "</b>" + SRCS.filter(function (s) { return r.bySrc[s.k]; }).map(function (s) { return '<div><i style="background:' + s.c + '"></i>' + s.n + ": <b>" + fm.eur(r.bySrc[s.k]) + "</b></div>"; }).join("") }; }), w, { label: "Money brought in by fighter" }); });
    C.mount(v.querySelector("#cBio"), function (w) { return C.hbars(rows.slice().sort(function (a, b) { return b.bio - a.bio; }).map(function (r) { return { label: r.f.name, v: r.bio, text: fm.num(r.bio) + " bios", color: "#7cc4ff", tip: "<b>" + esc(r.f.name) + "</b><div>Profile views: <b>" + fm.num(r.views) + "</b></div><div>Bio opens: <b>" + fm.num(r.bio) + "</b></div><div>Training clicks: <b>" + fm.num(r.train) + "</b></div>" }; }), w, { label: "Bio opens by fighter" }); });
    [["#cT", "tickets", "#3987e5", " tickets", "Tickets sold by fighter"], ["#cP", "ppv", "#199e70", " buys", "PPV buys by fighter"], ["#cW", "views", "#d95926", " views", "Website profile views by fighter"]].forEach(function (c) {
      C.mount(v.querySelector(c[0]), function (w) {
        return C.hbars(rows.slice().sort(function (a, b) { return b[c[1]] - a[c[1]]; }).map(function (r) { return { label: r.f.name, v: r[c[1]], text: fm.num(r[c[1]]) + c[3], color: c[2] }; }), w, { label: c[4], lw: 118, rh: 32 });
      });
    });
    C.mount(v.querySelector("#cSrc"), function () { return C.donut(src.map(function (s, i) { return { label: s[0], v: Math.round(tv * s[1]), color: cols[i] }; }), 170, { fmt: fm.num, center: fm.compact(tv), sub: "views", label: "Website visitors by source" }); });
  }

  /* ======================= REQUESTS ======================= */
  var rqs = { tab: "sponsor", status: "all", q: "" };
  var LBL = { budget: "Budget", interest: "Interest", weight: "Weight class", record: "Record", gym: "Gym", age: "Age", nickname: "Nickname", video: "Footage", role: "Role", link: "Link" };
  function requests(v) {
    var all = S.get().requests, count = function (t) { return all.filter(function (r) { return r.type === t && r.status === "new"; }).length; };
    var tabs = [["sponsor", "Who wants to sponsor", "star"], ["fight", "Who wants to fight", "glove"], ["collab", "Join the team and collabs", "users"]];
    v.innerHTML = top("Requests", "Sponsor, fighter and team enquiries from the website contact forms.") +
      '<div class="tabs" role="tablist" aria-label="Request type">' + tabs.map(function (t) { var n = count(t[0]); return '<button class="tab" role="tab" aria-selected="' + (rqs.tab === t[0]) + '" data-a="rq-tab" data-v="' + t[0] + '">' + icon(t[2]) + t[1] + (n ? ' <span class="badge" style="background:' + (rqs.tab === t[0] ? "#090909" : "var(--g)") + ";color:" + (rqs.tab === t[0] ? "var(--g)" : "#090909") + ';padding:1px 8px;border-radius:99px;font-size:12px;font-family:var(--body);font-style:normal">' + n + "</span>" : "") + "</button>"; }).join("") + "</div>" +
      '<div class="callout">' + icon("info") + "<span>In this demo, enquiries sent from the public contact forms are saved in the browser they were sent from. With the Supabase version, every enquiry from every visitor lands here.</span></div>" +
      '<div class="tools"><div class="field--search"><label class="sr" for="rq-q">Search requests</label>' + icon("search") + '<input id="rq-q" type="search" placeholder="Search requests" value="' + esc(rqs.q) + '"></div><label class="sr" for="rq-s">Status</label><select id="rq-s" style="width:auto;padding-right:40px"><option value="all">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></div><div id="rql"></div>';
    v.querySelector("#rq-s").value = rqs.status;
    function draw() {
      var list = all.filter(function (r) { return r.type === rqs.tab && (rqs.status === "all" || r.status === rqs.status) && (!rqs.q || JSON.stringify(r).toLowerCase().indexOf(rqs.q) > -1); }).sort(function (a, b) { return new Date(b.ts) - new Date(a.ts); });
      v.querySelector("#rql").innerHTML = list.length ? list.map(function (r) {
        var label = r.type === "collab" && r.fields && r.fields.interest ? r.fields.interest : { sponsor: "Sponsor", fight: "Fighter", collab: "Collaboration" }[r.type];
        return '<article class="rq"><div class="rq__top"><div><b>' + esc(r.name) + (r.org ? ' <span class="mut" style="font-weight:500">&middot; ' + esc(r.org) + "</span>" : "") + "</b><small>" + esc(fm.date(r.ts)) + " at " + esc(fm.time(r.ts)) + '</small></div><div style="display:flex;gap:8px;align-items:center"><span class="chip chip--g">' + esc(label) + "</span>" + statusPill(r.status) + '</div></div><div class="rq__f"><span><em>Email</em><a href="mailto:' + esc(r.email) + '">' + esc(r.email) + "</a></span>" + (r.phone ? "<span><em>Phone</em>" + esc(r.phone) + "</span>" : "") + Object.keys(r.fields || {}).map(function (k) { return "<span><em>" + esc(LBL[k] || k) + "</em>" + esc(r.fields[k]) + "</span>"; }).join("") + "</div><p>" + esc(r.message) + '</p><div class="rq__acts"><a class="btn btn--sm" href="' + esc(mailto(r, "KROWN: " + label)) + '">' + icon("mail") + 'Reply by email</a><label class="sr" for="st-' + r.id + '">Status</label><select id="st-' + r.id + '" data-a="rq-status" data-id="' + r.id + '"><option value="new"' + (r.status === "new" ? " selected" : "") + '>New</option><option value="contacted"' + (r.status === "contacted" ? " selected" : "") + '>Contacted</option><option value="closed"' + (r.status === "closed" ? " selected" : "") + '>Closed</option></select><button class="ib ib--del" data-a="rq-del" data-id="' + r.id + '" aria-label="Delete request from ' + esc(r.name) + '">' + icon("trash") + "</button></div></article>";
      }).join("") : '<div class="empty">No requests in this view yet.</div>';
    }
    v.querySelector("#rq-q").addEventListener("input", function (e) { rqs.q = e.target.value.trim().toLowerCase(); draw(); });
    v.querySelector("#rq-s").addEventListener("change", function (e) { rqs.status = e.target.value; draw(); });
    draw();
  }

  /* ======================= router & actions ======================= */
  var VIEWS = { dashboard: dashboard, calendar: calendar, fighters: fighters, payments: payments, stats: stats, requests: requests };
  var current = "dashboard";
  function route() {
    var r = (location.hash.replace(/^#\/?/, "") || "dashboard").split("?")[0];
    current = VIEWS[r] ? r : "dashboard";
    var v = document.getElementById("view"); if (!v) return;
    C.reset(); v.innerHTML = ""; VIEWS[current](v);
    document.title = NAV.filter(function (n) { return n[0] === current; })[0][1] + " | KROWN Admin";
    document.querySelectorAll(".side a[data-r]").forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("data-r") === current ? "page" : "false"); if (a.getAttribute("data-r") !== current) a.removeAttribute("aria-current"); });
    var b = document.getElementById("reqBadge"); if (b) { var n = newCount(); b.textContent = n; b.hidden = !n; }
    window.scrollTo(0, 0);
  }
  function refresh() { var y = window.scrollY; route(); window.scrollTo(0, y); }

  function shell() {
    root.innerHTML = '<div class="adm"><aside class="side"><div class="side__logo">' + art.logo() + '</div><div class="side__tag">Admin</div>' +
      NAV.map(function (n) { return '<a href="#/' + n[0] + '" data-r="' + n[0] + '">' + icon(n[2]) + n[1] + (n[0] === "requests" ? '<span class="badge" id="reqBadge" hidden></span>' : "") + "</a>"; }).join("") +
      '<div class="side__sp"></div><a href="../index.html" target="_blank" rel="noopener">' + icon("external") + 'View website</a><button class="sl" id="logout" type="button">' + icon("logout") + 'Logout</button><div class="side__user">' + icon("user") + "<div><b>KROWN Admin</b>Signed in</div></div></aside><main class=\"main\" id=\"view\" tabindex=\"-1\"></main></div>";
    root.querySelector("#logout").addEventListener("click", logout);
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-a]"); if (!t || !root.contains(t)) return;
    var a = t.getAttribute("data-a"), id = t.getAttribute("data-id");
    if (a === "edit-event") eventForm(id);
    else if (a === "add-event") eventForm(null, t.getAttribute("data-date"));
    else if (a === "del-event") confirmDelete(id);
    else if (a === "cal-view") { cal.view = t.getAttribute("data-v"); refresh(); }
    else if (a === "m-prev") { cal.m--; if (cal.m < 0) { cal.m = 11; cal.y--; } refresh(); }
    else if (a === "m-next") { cal.m++; if (cal.m > 11) { cal.m = 0; cal.y++; } refresh(); }
    else if (a === "y-prev") { cal.y--; refresh(); }
    else if (a === "y-next") { cal.y++; refresh(); }
    else if (a === "cal-today") { cal.y = new Date().getFullYear(); cal.m = new Date().getMonth(); refresh(); }
    else if (a === "open-month") { cal.m = +t.getAttribute("data-m"); cal.view = "month"; refresh(); }
    else if (a === "edit-fighter") fighterForm(id);
    else if (a === "add-fighter") fighterForm(null);
    else if (a === "paid") { S.markPaid(id); ui.toast("Marked as paid."); refresh(); }
    else if (a === "add-tx") txForm();
    else if (a === "range") { stat.range = t.getAttribute("data-v"); refresh(); }
    else if (a === "sort") { var k = t.getAttribute("data-k"); if (stat.sort === k) stat.dir *= -1; else { stat.sort = k; stat.dir = -1; } refresh(); }
    else if (a === "rq-tab") { rqs.tab = t.getAttribute("data-v"); refresh(); }
    else if (a === "rq-del") { var q = S.get().requests.filter(function (r) { return r.id === id; })[0]; var m = ui.modal('<h3 class="d">Delete request?</h3><p class="modal__sub">The request from ' + esc(q ? q.name : "this person") + ' will be removed. This cannot be undone.</p><div class="formacts"><button class="btn btn--ghost btn--sm" id="x-no">Keep</button><button class="btn btn--danger btn--sm" id="x-yes">' + icon("trash") + "Delete</button></div>", { label: "Confirm delete" }); m.querySelector("#x-no").addEventListener("click", ui.close); m.querySelector("#x-yes").addEventListener("click", function () { S.deleteRequest(id); ui.close(); ui.toast("Request deleted."); refresh(); }); }
    else if (a === "reset") { var m2 = ui.modal('<h3 class="d">Reset demo data?</h3><p class="modal__sub">All edits, requests and test orders in this browser will be replaced with the original demo content.</p><div class="formacts"><button class="btn btn--ghost btn--sm" id="r-no">Cancel</button><button class="btn btn--danger btn--sm" id="r-yes">Reset</button></div>', { label: "Confirm reset" }); m2.querySelector("#r-no").addEventListener("click", ui.close); m2.querySelector("#r-yes").addEventListener("click", function () { S.reset(); ui.close(); ui.toast("Demo data reset."); refresh(); }); }
  });
  document.addEventListener("change", function (e) {
    var t = e.target.closest("[data-a=rq-status]"); if (!t) return;
    S.setRequestStatus(t.getAttribute("data-id"), t.value); ui.toast("Status updated."); refresh();
  });
  window.addEventListener("hashchange", function () { if (authed() && document.getElementById("view")) route(); });

  function start() {
    if (!authed()) { renderLogin(); return; }
    shell(); route();
  }
  start();
})();
