/* ==========================================================================
   KROWN — site shell: header, footer, tab bar, modals, toasts, helpers
   ========================================================================== */
(function () {
  "use strict";
  var F = window.KROWN, CFG = F.config, S = F.store, esc = F.fmt.esc, icon = F.icon;
  var BASE = document.body.getAttribute("data-base") || "";
  var PAGE = document.body.getAttribute("data-page") || "home";
  var isExt = function (u) { return /^https?:\/\//i.test(u); };
  var APP_EXT = isExt(CFG.appUrl);

  document.documentElement.classList.add("js");

  var NAV = [
    { k: "home", t: "Home", h: "index.html", i: "home" },
    { k: "events", t: "Events", h: "events.html", i: "calendar" },
    { k: "fighters", t: "Fighters", h: "fighters.html", i: "glove" },
    { k: "photos", t: "Photos", h: "photos.html", i: "image" },
    { k: "bts", t: "BTS", h: "bts.html", i: "clapper" },
    { k: "team", t: "The Team", h: "team.html", i: "users" },
    { k: "live", t: "Live", h: "live.html", i: "broadcast", live: true },
    { k: "contact", t: "Contact", h: "contact.html", i: "mail" },
    { k: "app", t: "App", h: APP_EXT ? CFG.appUrl : "app.html", i: "phone", ext: APP_EXT },
    { k: "social", t: "Social Media", h: CFG.instagram, i: "instagram", ext: true }
  ];
  var TABS = [
    { k: "home", t: "Home", h: "index.html", i: "home" },
    { k: "live", t: "Live", h: "live.html", i: "broadcast" },
    { k: "events", t: "Tickets", h: "events.html", i: "ticket" },
    { k: "bts", t: "Media", h: "bts.html", i: "playbox" },
    { k: "fighters", t: "Fighters", h: "fighters.html", i: "user" }
  ];
  var ACTIVE = PAGE === "fighter" ? "fighters" : PAGE;

  function href(h) { return isExt(h) ? h : BASE + h; }
  function navLink(n, cls) {
    var cur = n.k === ACTIVE ? ' aria-current="page"' : "";
    var ext = n.ext ? ' target="_blank" rel="noopener noreferrer"' : "";
    var extra = n.ext ? icon("external") : "";
    var dot = n.live ? '<i class="dot"></i>' : "";
    return '<a' + (cls ? ' class="' + cls + (n.live ? " nav__live" : "") + '"' : (n.live ? ' class="nav__live"' : "")) + ' href="' + esc(href(n.h)) + '"' + cur + ext + (n.k === "social" ? ' aria-label="Social Media: opens KROWN on Instagram in a new tab"' : "") + ">" + dot + esc(n.t) + extra + "</a>";
  }

  /* ---------- shell ---------- */
  function buildShell() {
    var main = document.getElementById("main");
    var hdr = document.createElement("header");
    hdr.className = "hdr"; hdr.id = "hdr";
    hdr.innerHTML = '<div class="wrap hdr__in"><a href="' + BASE + 'index.html" aria-label="KROWN home">' + F.art.logo() + '</a>' +
      '<nav class="nav" aria-label="Main">' + NAV.map(function (n) { return navLink(n); }).join("") + '</nav>' +
      '<button class="hdr__menu" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">' + icon("menu") + '</button></div>';
    var drawer = document.createElement("div");
    drawer.className = "drawer"; drawer.id = "drawer"; drawer.setAttribute("aria-label", "Menu");
    drawer.innerHTML = '<div class="drawer__top"><a href="' + BASE + 'index.html">' + F.art.logo() + '</a><button class="hdr__menu" id="menuClose" aria-label="Close menu" style="display:inline-flex">' + icon("close") + '</button></div>' +
      NAV.map(function (n) { return navLink(n, "dl").replace(/<svg[^>]*>.*?<\/svg>/, "") .replace("</a>", icon(n.ext ? "external" : "arrow") + "</a>"); }).join("");
    var tabs = document.createElement("nav");
    tabs.className = "tabbar"; tabs.setAttribute("aria-label", "Quick navigation");
    tabs.innerHTML = TABS.map(function (n) {
      return '<a href="' + BASE + n.h + '"' + (n.k === ACTIVE ? ' aria-current="page"' : "") + ">" + icon(n.i) + "<span>" + n.t + "</span></a>";
    }).join("");
    var skip = document.createElement("a");
    skip.className = "skip"; skip.href = "#main"; skip.textContent = "Skip to content";
    document.body.insertBefore(skip, document.body.firstChild);
    document.body.insertBefore(hdr, main);
    document.body.insertBefore(drawer, main);
    main.setAttribute("tabindex", "-1");
    document.body.appendChild(buildFooter());
    document.body.appendChild(tabs);

    var open = function (v) {
      drawer.classList.toggle("open", v);
      document.getElementById("menuBtn").setAttribute("aria-expanded", v ? "true" : "false");
      document.body.style.overflow = v ? "hidden" : "";
    };
    document.getElementById("menuBtn").addEventListener("click", function () { open(true); });
    document.getElementById("menuClose").addEventListener("click", function () { open(false); });
    drawer.addEventListener("click", function (e) { if (e.target.closest("a")) open(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") open(false); });
    var onScroll = function () { hdr.classList.toggle("solid", window.scrollY > 24); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }

  function socialBlock() {
    var s = '<a href="' + esc(CFG.instagram) + '" target="_blank" rel="noopener noreferrer">' + icon("instagram") + "Instagram" + icon("external") + "</a>";
    s += CFG.tiktok ? '<a href="' + esc(CFG.tiktok) + '" target="_blank" rel="noopener noreferrer">' + icon("tiktok") + "TikTok" + icon("external") + "</a>"
      : '<span>' + icon("tiktok") + 'TikTok<span class="chip chip--soon">Coming soon</span></span>';
    s += CFG.whatsapp ? '<a href="' + esc(CFG.whatsapp) + '" target="_blank" rel="noopener noreferrer">' + icon("whatsapp") + "WhatsApp Community" + icon("external") + "</a>"
      : '<span>' + icon("whatsapp") + 'WhatsApp Community<span class="chip chip--soon">Coming soon</span></span>';
    return s;
  }
  F.socialBlock = socialBlock;

  function buildFooter() {
    var f = document.createElement("footer");
    f.className = "ftr";
    f.innerHTML = '<div class="wrap"><div class="ftr__grid">' +
      '<div>' + F.art.logo() + '<p class="blurb">Boxing promotion built around the fighters. Big nights, hungry talent and a community that shows up.</p></div>' +
      '<div><h4>Explore</h4><ul>' + [["events.html", "Events"], ["fighters.html", "Fighters"], ["photos.html", "Photos"], ["bts.html", "Behind the Scenes"], ["live.html", "Live PPV"]].map(function (l) { return '<li><a href="' + BASE + l[0] + '">' + l[1] + "</a></li>"; }).join("") + '</ul></div>' +
      '<div><h4>KROWN</h4><ul>' + [["team.html", "The Team"], ["contact.html#sponsor", "Sponsor KROWN"], ["contact.html#fight", "Fight for KROWN"], ["contact.html#collab", "Collaborate"], [CFG.appUrl, "KROWN App"]].map(function (l) { return '<li><a href="' + (isExt(l[0]) ? l[0] : BASE + l[0]) + '">' + l[1] + "</a></li>"; }).join("") + '</ul></div>' +
      '<div><h4>Follow KROWN</h4><div class="soc">' + socialBlock() + '</div></div></div>' +
      '<div class="ftr__bot"><span>© ' + new Date().getFullYear() + ' KROWN Boxing Promotions. All rights reserved.</span>' +
      '<a href="' + BASE + 'admin/">Admin</a></div></div>';
    return f;
  }

  /* ---------- UI helpers ---------- */
  var ui = {};
  var toastEl, toastT;
  ui.toast = function (msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.innerHTML = icon("check") + "<span>" + esc(msg) + "</span>";
    toastEl.classList.add("show"); clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 3600);
  };

  var modalEl, lastFocus, onModalClose;
  ui.modal = function (html, o) {
    var opts = o || {};
    if (!modalEl) {
      modalEl = document.createElement("div"); modalEl.className = "modal"; modalEl.setAttribute("role", "dialog"); modalEl.setAttribute("aria-modal", "true");
      modalEl.addEventListener("mousedown", function (e) { if (e.target === modalEl) ui.close(); });
      document.addEventListener("keydown", function (e) {
        if (!modalEl.classList.contains("open")) return;
        if (e.key === "Escape") ui.close();
        if (e.key === "Tab") {
          var f = modalEl.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
          if (!f.length) return;
          var a = f[0], z = f[f.length - 1];
          if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
          else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
        }
      });
      document.body.appendChild(modalEl);
    }
    lastFocus = document.activeElement; onModalClose = opts.onClose || null;
    modalEl.setAttribute("aria-label", opts.label || "Dialog");
    modalEl.innerHTML = '<div class="modal__box' + (opts.wide ? " modal__box--wide" : "") + (opts.lg ? " modal__box--lg" : "") + '"><button class="modal__x" aria-label="Close" type="button">' + icon("close") + "</button>" + html + "</div>";
    modalEl.querySelector(".modal__x").addEventListener("click", ui.close);
    modalEl.classList.add("open"); document.body.style.overflow = "hidden";
    var first = modalEl.querySelector("input,select,textarea,.btn");
    setTimeout(function () { (first || modalEl.querySelector(".modal__x")).focus(); }, 30);
    return modalEl;
  };
  ui.close = function () {
    if (!modalEl) return;
    modalEl.classList.remove("open"); modalEl.innerHTML = ""; document.body.style.overflow = "";
    if (onModalClose) { onModalClose(); onModalClose = null; }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  /* countdown: returns [d, h, m, s] strings, and ticks every second into the element */
  ui.countdown = function (el, date, done) {
    if (!el) return;
    function tick() {
      var diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) { el.innerHTML = done || ""; return false; }
      var v = [Math.floor(diff / 864e5), Math.floor(diff % 864e5 / 36e5), Math.floor(diff % 36e5 / 6e4), Math.floor(diff % 6e4 / 1e3)];
      var l = ["Days", "Hrs", "Mins", "Secs"];
      el.innerHTML = v.map(function (n, i) { return "<div><b>" + String(n).padStart(2, "0") + "</b><small>" + l[i] + "</small></div>"; }).join("");
      return true;
    }
    if (tick()) { var id = setInterval(function () { if (!document.body.contains(el) || !tick()) clearInterval(id); }, 1000); }
  };

  /* ---------- ticket checkout (demo) ---------- */
  ui.tickets = function (eventId, fighterId) {
    var ev = S.event(eventId);
    if (!ev) { ui.toast("Tickets for this event will be released soon."); return; }
    var fighter = fighterId ? S.fighter(fighterId) : null;
    var link = (fighter && fighter.nextFight && fighter.nextFight.eventId === eventId && fighter.nextFight.ticketUrl) || ev.ticketUrl;
    if (link) { if (fighter) S.track("tickets", fighter.id); window.open(link, "_blank", "noopener"); return; }
    var tiers = CFG.ticketTiers, sel = 0, qty = 2;
    var html = '<h3 class="d">Buy tickets</h3><p class="modal__sub">' + esc(ev.title) + " &middot; " + esc(F.fmt.date(ev.date)) + " &middot; " + esc(ev.venue) + "</p>" +
      '<form id="tkForm" novalidate>' + tiers.map(function (t, i) {
        return '<label class="tier"><input type="radio" name="tier" value="' + i + '"' + (i === 0 ? " checked" : "") + '><span><b>' + esc(t.name) + "</b><small>" + esc(t.blurb) + '</small></span><span class="price">' + F.fmt.eur(t.price) + "</span></label>";
      }).join("") +
      '<div class="qty"><button type="button" id="qm" aria-label="Fewer tickets">&minus;</button><output id="qv" aria-live="polite">2</output><button type="button" id="qp" aria-label="More tickets">+</button><span class="mut">tickets</span></div>' +
      '<div class="field" id="tkEmailF"><label for="tkEmail">Email for your tickets <span class="req">*</span></label><input id="tkEmail" type="email" autocomplete="email" placeholder="you@example.com" required><div class="err" id="tkErr"></div></div>' +
      '<div class="total"><span class="mut">Total</span><b id="tkTotal"></b></div>' +
      '<button class="btn btn--block" type="submit">' + icon("ticket") + "Confirm order</button>" +
      (CFG.demoMode ? '<p class="demo-note">' + icon("info") + "Demo checkout. No payment is taken and no tickets are issued. Orders appear in the KROWN admin area on this device.</p>" : "") + "</form>";
    var m = ui.modal(html, { label: "Buy tickets" });
    function upd() { m.querySelector("#qv").textContent = qty; m.querySelector("#tkTotal").textContent = F.fmt.eur(tiers[sel].price * qty); }
    m.querySelectorAll('input[name="tier"]').forEach(function (r) { r.addEventListener("change", function () { sel = +r.value; upd(); }); });
    m.querySelector("#qm").addEventListener("click", function () { qty = Math.max(1, qty - 1); upd(); });
    m.querySelector("#qp").addEventListener("click", function () { qty = Math.min(10, qty + 1); upd(); });
    m.querySelector("#tkForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var em = m.querySelector("#tkEmail");
      if (!em.validity.valid || !em.value) { m.querySelector("#tkEmailF").classList.add("bad"); m.querySelector("#tkErr").textContent = "Please enter a valid email address."; em.focus(); return; }
      var t = tiers[sel], ref = fighterId || S.getRef();
      S.addTransaction({ source: "events", amount: t.price * qty, qty: qty, eventId: ev.id, fighterId: ref || "", desc: t.name + " tickets (web)" });
      if (ref) S.track("tickets", ref);
      ui.close(); ui.toast("Order confirmed: " + qty + " x " + t.name + (CFG.demoMode ? " (demo)" : ""));
    });
    upd();
  };

  /* ---------- calendar file ---------- */
  ui.ics = function (ev) {
    var d = new Date(ev.date), e = new Date(d.getTime() + 3 * 36e5);
    var z = function (x) { return x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
    var txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//KROWN//Events//EN", "BEGIN:VEVENT", "UID:" + ev.id + "@krown", "DTSTAMP:" + z(new Date()), "DTSTART:" + z(d), "DTEND:" + z(e),
      "SUMMARY:" + ev.title, "LOCATION:" + ev.venue + ", " + ev.city, "DESCRIPTION:" + String(ev.description || "").replace(/\n/g, " "), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/calendar" }));
    a.download = ev.id + ".ics"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  };

  ui.reveal = function (root) {
    var els = (root || document).querySelectorAll(".rv:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
  };

  /* delegated actions: data-act="tickets" data-event="" data-fighter="" */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act]");
    if (!t) return;
    var act = t.getAttribute("data-act");
    if (act === "tickets") { e.preventDefault(); ui.tickets(t.getAttribute("data-event"), t.getAttribute("data-fighter")); }
    if (act === "ics") { e.preventDefault(); var ev = S.event(t.getAttribute("data-event")); if (ev) ui.ics(ev); }
  });

  F.ui = ui; F.BASE = BASE; F.PAGE = PAGE; F.isExt = isExt;

  function boot() {
    if (PAGE === "admin") return;
    buildShell();
    S.track("view");
    var main = document.getElementById("main");
    var render = F.pages && F.pages[PAGE];
    if (render) render(main);
    ui.reveal(document);
    if (location.hash && document.getElementById(location.hash.slice(1))) {
      setTimeout(function () { var el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }, 60);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
