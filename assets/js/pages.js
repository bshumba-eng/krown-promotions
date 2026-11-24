/* ==========================================================================
   KROWN — page renderers
   ========================================================================== */
(function () {
  "use strict";
  var F = window.KROWN, CFG = F.config, S = F.store, esc = F.fmt.esc, icon = F.icon, art = F.art, fm = F.fmt;
  var P = {};
  var TYPE = { fight: "Fight Night", press: "Press Conference", weighin: "Weigh-In", training: "Training Day" };
  var SLOT_ORDER = ["Main event", "Co-main event", "Chief supporting bout", "Featured bout", "Undercard"];

  function url(p) { return F.BASE + p; }
  function fUrl(f) { return url("fighter.html?id=" + encodeURIComponent(f.id)); }
  function recStr(f) { return f.record.w + "-" + f.record.l + "-" + f.record.d; }
  function mapUrl(t) { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(t.venue + ", " + t.address); }
  function phead(eyebrow, title, lead) {
    return '<section class="phead"><div class="wrap rv"><span class="eyebrow">' + esc(eyebrow) + '</span><h1 class="d">' + title + "</h1>" + (lead ? '<p class="lead">' + lead + "</p>" : "") + "</div></section>";
  }
  function setTitle(t, d) {
    document.title = t + " | KROWN Boxing Promotions";
    if (d) { var m = document.querySelector('meta[name="description"]'); if (m) m.setAttribute("content", d); }
  }
  function sortCard(list) {
    return list.slice().sort(function (a, b) {
      var x = SLOT_ORDER.indexOf(a.nextFight.slot), y = SLOT_ORDER.indexOf(b.nextFight.slot);
      return (x < 0 ? 99 : x) - (y < 0 ? 99 : y);
    });
  }
  function fcard(f, i) {
    var nf = f.nextFight && f.nextFight.eventId ? S.event(f.nextFight.eventId) : null;
    return '<a class="fcard rv d' + ((i || 0) % 4) + '" href="' + fUrl(f) + '" aria-label="' + esc(f.name) + ', ' + esc(f.weightClass) + '">' + art.fighter(f) +
      '<span class="fcard__rec">' + recStr(f) + "</span>" + (nf ? '<span class="fcard__nextbar chip chip--g">Next: ' + esc(fm.dateShort(nf.date).replace(/ \d{4}$/, "")) + "</span>" : "") +
      '<div class="fcard__body"><div class="fcard__nick">&ldquo;' + esc(f.nickname) + '&rdquo;</div><div class="fcard__name">' + esc(f.name) + '</div><div class="fcard__meta"><span class="chip">' + esc(f.weightClass) + '</span><span class="chip chip--g">' + f.record.ko + " KOs</span></div></div></a>";
  }
  function bouts(list) {
    if (!list.length) return '<div class="empty">The full card will be announced soon.</div>';
    return sortCard(list).map(function (f) {
      var o = f.nextFight;
      return '<div class="bout rv"><div class="bout__slot">' + esc(o.slot) + " &middot; " + esc(o.weight) + " &middot; " + o.rounds + ' rounds</div><div class="bout__name"><a href="' + fUrl(f) + '">' + esc(f.name) + "</a><small>" + recStr(f) + " &middot; " + esc(f.hometown).toUpperCase() + '</small></div><div class="bout__vs">VS</div><div class="bout__name">' + esc(o.opponent) + "<small>Opponent</small></div></div>";
    }).join("");
  }

  /* ======================= HOME ======================= */
  P.home = function (main) {
    setTitle("Home", "KROWN Boxing Promotions: Irish fight nights, championship ambition, tickets, live coverage and fight culture.");
    var ev = S.nextFightNight(), fighters = S.fighters();
    var card = ev ? sortCard(S.card(ev.id)) : [];
    var kids = ev ? S.children(ev.id) : [];
    var tileEvents = kids.concat(ev ? [ev] : []).sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
    var fig = function (f, cap) { return f ? '<figure class="slide__fig">' + art.fighter(f, { badge: false }) + "<figcaption><small>" + esc(cap) + "</small>" + esc(f.name) + "</figcaption></figure>" : '<div class="slide__fig"></div>'; };
    var pick = function (a, b) { return [fighters[a] || fighters[0], fighters[b] || fighters[0]]; };
    var h = card.length >= 2 ? [card[0], card[1]] : pick(0, 1), p2 = pick(3, 4), p3 = pick(2, 5);
    var title = ev ? ev.title.replace(/^KROWN\s+/i, "") : "Fight Night", numeral = (title.match(/\s+([IVXL]+)$/) || [])[1] || "";
    title = title.replace(/\s+[IVXL]+$/, "");
    var slides = [
      '<div class="slide on" data-slide="0">' + fig(h[0], "Main event") + '<div class="slide__mid"><span class="slide__kicker">KROWN' + (numeral ? " " + esc(numeral) : "") + '</span><h1 class="d slide__title">' + esc(title) + "</h1>" +
        (ev ? '<span class="datetag datetag--lg">' + esc(fm.monthDay(ev.date)) + '</span><p class="slide__sub">' + esc(ev.venue) + ", " + esc(ev.city) + '</p><div class="cd" id="heroCd" aria-label="Countdown to fight night"></div>' : '<p class="slide__sub">The next card will be announced soon.</p>') + "</div>" + fig(h[1], "Co-main event") + "</div>",
      '<div class="slide" data-slide="1" aria-hidden="true">' + fig(p2[0], "Live on KROWN") + '<div class="slide__mid"><span class="slide__kicker">KROWN Pay-Per-View</span><h2 class="d slide__title">Watch<br>Live</h2><span class="datetag datetag--lg">' + fm.eur(CFG.ppvPrice) + ' PER NIGHT</span><p class="slide__sub">Every fight night, live on your phone, tablet or TV. One payment, no subscription.</p></div>' + fig(p2[1], "Live on KROWN") + "</div>",
      '<div class="slide" data-slide="2" aria-hidden="true">' + fig(p3[0], "Fight camp") + '<div class="slide__mid"><span class="slide__kicker">KROWN Behind The Scenes</span><h2 class="d slide__title">Inside<br>KROWN</h2><span class="datetag datetag--lg">NEW EPISODES</span><p class="slide__sub">Camps, venues and the work that happens long before the first bell.</p></div>' + fig(p3[1], "Fight camp") + "</div>"
    ].join("");
    var tiles = tileEvents.map(function (e, i) {
      var icn = e.type === "press" ? "mic" : (e.type === "weighin" ? "dumbbell" : "glove");
      var nm = e.type === "fight" ? "Fight Night" : e.title;
      return '<a class="tile tile--event rv d' + i + '" href="' + url("events.html#" + e.id) + '">' + art.scene(e.type === "press" ? "mic" : (e.type === "weighin" ? "scale" : "ring"), 3 + i * 7) + '<span class="tile__t">' + esc(nm) + '</span><span class="datetag">' + esc(fm.monthDay(e.date)) + "</span></a>";
    }).join("");
    var explore = [["calendar", "Upcoming Events", "events.html", "ring", 4], ["broadcast", "Live PPV", "live.html", "spot", 8], ["clapper", "Behind The Scenes", "bts.html", "gloves", 12], ["mic", "Press Conferences", "events.html?type=press", "mic", 16], ["playbox", "Previous Fights", "events.html#past", "crowd", 20], ["users", "KROWN Fighters", "fighters.html", "spot", 24]].map(function (t, i) {
      return '<a class="tile tile--explore rv d' + (i % 3) + '" href="' + url(t[2]) + '">' + art.scene(t[3], t[4]) + '<span class="tile__ico">' + icon(t[0]) + '</span><span class="tile__t">' + t[1].replace(/ (\S+)$/, "<br>$1") + "</span></a>";
    }).join("");
    main.innerHTML =
      '<section class="hero"><div class="hero__bg"></div><div class="wrap"><div class="hero__logo">' + art.logo("logo--lg") + '</div>' +
      '<div class="slides" id="slides" role="region" aria-roledescription="carousel" aria-label="Featured at KROWN">' + slides + '</div><div class="dots" id="dots" role="group" aria-label="Choose slide"></div>' +
      '<div class="hero__cta"><button class="btn btn--block" data-act="tickets" data-event="' + (ev ? ev.id : "") + '">' + icon("ticket") + 'Buy Tickets</button><a class="btn btn--ghost btn--block" href="' + url("live.html") + '">' + icon("play") + "Watch PPV</a></div></div></section>" +
      '<section class="sec sec--tight"><div class="wrap"><div class="tiles tiles--3">' + tiles + "</div></div></section>" +
      '<section class="sec sec--tight"><div class="wrap"><h2 class="h-rule rv">Explore KROWN</h2><div class="tiles tiles--6 mt">' + explore + "</div></div></section>" +
      '<div class="ticker" aria-hidden="true"><div class="ticker__in">' + [0, 1].map(function () { return '<span>Championships</span><span>Prizefighter</span><span>Live events</span><span>Irish boxing</span>'; }).join("").repeat(2) + "</div></div>" +
      '<section class="sec"><div class="wrap"><div class="sec__head"><div class="rv"><span class="eyebrow">The card</span><h2 class="d sec__title">' + esc(ev ? ev.title : "Next card") + '</h2></div>' + (ev ? '<a class="link rv" href="' + url("events.html#" + ev.id) + '">Event details' + icon("arrow") + "</a>" : "") + "</div>" + bouts(card) + "</div></section>" +
      '<section class="sec sec--alt"><div class="wrap"><div class="sec__head"><div class="rv"><span class="eyebrow">KROWN fighters</span><h2 class="d sec__title">Meet the <span class="g">roster</span></h2></div><a class="link rv" href="' + url("fighters.html") + '">All fighters' + icon("arrow") + '</a></div><div class="fgrid">' + fighters.slice(0, 4).map(fcard).join("") + "</div></div></section>" +
      '<section class="sec sec--alt"><div class="wrap" style="text-align:center"><span class="eyebrow">Join the community</span><h2 class="d sec__title">Follow the <span class="g">journey</span></h2><p class="sec__lead" style="margin-inline:auto">Fight night updates, behind the scenes and first looks at every card.</p><div class="soc" style="max-width:420px;margin:30px auto 0">' + F.socialBlock() + "</div></div></section>";

    /* slider */
    var sl = main.querySelectorAll(".slide"), dots = main.querySelector("#dots"), idx = 0, timer;
    sl.forEach(function (s, i) { var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Show slide " + (i + 1)); b.addEventListener("click", function () { go(i); play(); }); dots.appendChild(b); });
    function go(i) {
      idx = (i + sl.length) % sl.length;
      sl.forEach(function (s, k) { s.classList.toggle("on", k === idx); s.setAttribute("aria-hidden", k === idx ? "false" : "true"); });
      dots.querySelectorAll("button").forEach(function (b, k) { b.setAttribute("aria-current", k === idx ? "true" : "false"); });
    }
    function play() { clearInterval(timer); if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(function () { go(idx + 1); }, 6500); }
    go(0); play();
    var sw = main.querySelector("#slides"); sw.addEventListener("mouseenter", function () { clearInterval(timer); }); sw.addEventListener("mouseleave", play);
    if (ev) F.ui.countdown(main.querySelector("#heroCd"), ev.date, '<div><b>LIVE</b><small>Tonight</small></div>');
  };

  /* ======================= EVENTS ======================= */
  P.events = function (main) {
    setTitle("Events", "Upcoming KROWN fight nights, press conferences, weigh-ins and training days.");
    var params = new URLSearchParams(location.search), type = params.get("type") || "all";
    main.innerHTML = phead("Calendar", 'Upcoming <span class="g">events</span>', "Fight nights, press conferences, weigh-ins and open training days. Add any event to your calendar.") +
      '<section class="sec sec--tight"><div class="wrap"><div class="bar" id="evBar" role="group" aria-label="Filter events"></div><div id="evFeat"></div><div id="evUp"></div><h2 class="h-rule" id="past" style="margin:56px 0 22px">Previous events</h2><div id="evPast"></div></div></section>';
    var bar = main.querySelector("#evBar");
    [["all", "All"], ["fight", "Fight nights"], ["press", "Press conferences"], ["weighin", "Weigh-ins"], ["training", "Training days"]].forEach(function (t) {
      var b = document.createElement("button"); b.className = "pill"; b.type = "button"; b.textContent = t[1]; b.setAttribute("aria-pressed", String(type === t[0]));
      b.addEventListener("click", function () { type = t[0]; bar.querySelectorAll(".pill").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); draw(); });
      bar.appendChild(b);
    });
    function ecard(e, past) {
      var d = new Date(e.date), free = e.type !== "fight";
      var acts = "";
      if (!past) {
        acts += e.type === "fight" ? '<button class="btn btn--sm" data-act="tickets" data-event="' + e.id + '">' + icon("ticket") + "Buy tickets</button>" : '<span class="chip chip--g">Free entry</span>';
        if (e.ppv) acts += '<a class="btn btn--ghost btn--sm" href="' + url("live.html") + '">' + icon("play") + "Watch PPV</a>";
        acts += '<button class="btn btn--ghost btn--sm" data-act="ics" data-event="' + e.id + '" aria-label="Add ' + esc(e.title) + ' to calendar">' + icon("calendar") + "Add</button>";
      } else acts = '<span class="chip">Completed</span>';
      return '<article class="ecard rv' + (past ? " ecard--past" : "") + '" id="' + e.id + '"><div class="ecard__date"><b>' + d.getDate() + "</b><span>" + d.toLocaleDateString("en-IE", { month: "short" }) + " " + d.getFullYear() + '</span></div><div><span class="chip' + (free ? "" : " chip--g") + '" style="margin-bottom:8px">' + TYPE[e.type] + '</span><h3 class="ecard__title">' + esc(e.title) + '</h3><div class="ecard__meta"><span>' + icon("clock") + esc(fm.time(e.date)) + "</span><span>" + icon("pin") + esc(e.venue) + ", " + esc(e.city) + "</span></div></div><div class=\"ecard__acts\">" + acts + "</div></article>";
    }
    function draw() {
      var ok = function (e) { return type === "all" || e.type === type; };
      var up = S.upcoming().filter(ok), past = S.past().filter(ok);
      var next = S.nextFightNight(), feat = main.querySelector("#evFeat");
      if (next && (type === "all" || type === "fight")) {
        var kids = S.children(next.id);
        feat.innerHTML = '<div class="featured rv" id="feat" style="margin-bottom:26px"><div class="featured__art">' + art.scene("ring", 5) + '</div><div class="featured__body"><span class="chip chip--g" style="align-self:flex-start">Next fight night</span><h2 class="d">' + esc(next.title) + '</h2><span class="datetag" style="align-self:flex-start">' + esc(fm.monthDay(next.date)) + "</span>" +
          '<div class="kv"><span>' + icon("clock") + esc(fm.time(next.date)) + '</span><span>' + icon("pin") + esc(next.venue) + ", " + esc(next.city) + "</span></div><p class=\"mut\">" + esc(next.description) + '</p><div class="cd" id="evCd"></div><div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn" data-act="tickets" data-event="' + next.id + '">' + icon("ticket") + 'Buy tickets</button>' + (next.ppv ? '<a class="btn btn--ghost" href="' + url("live.html") + '">' + icon("play") + "Watch PPV</a>" : "") + "</div>" +
          (kids.length ? '<div class="kv">' + kids.map(function (k) { return "<span>" + icon("calendar") + esc(k.title) + ": " + esc(fm.monthDay(k.date).toLowerCase().replace(/(^|\s)\S/g, function (c) { return c.toUpperCase(); })) + "</span>"; }).join("") + "</div>" : "") + "</div></div>";
        F.ui.countdown(feat.querySelector("#evCd"), next.date, "");
      } else feat.innerHTML = "";
      var list = up.filter(function (e) { return !(next && e.id === next.id && (type === "all" || type === "fight")); });
      main.querySelector("#evUp").innerHTML = list.length || feat.innerHTML ? '<div class="elist">' + list.map(function (e) { return ecard(e, false); }).join("") + "</div>" : '<div class="empty">No upcoming events in this category yet. Follow KROWN on Instagram for announcements.</div>';
      main.querySelector("#evPast").innerHTML = past.length ? '<div class="elist">' + past.map(function (e) { return ecard(e, true); }).join("") + "</div>" : '<div class="empty">Nothing here yet.</div>';
      F.ui.reveal(main);
    }
    draw();
  };

  /* ======================= FIGHTERS ======================= */
  P.fighters = function (main) {
    setTitle("Fighters", "Meet every KROWN fighter: bios, records, next fights and where to watch them train.");
    var all = S.fighters(), classes = ["All"].concat(all.map(function (f) { return f.weightClass; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
    var cls = "All", q = "";
    main.innerHTML = phead("The roster", 'KROWN <span class="g">fighters</span>', "Every fighter on the KROWN roster. Open a profile for their bio, record, next fight, previous fights and where to watch them train.") +
      '<section class="sec sec--tight"><div class="wrap"><div class="bar"><div id="fBar" class="bar" style="margin:0" role="group" aria-label="Filter by weight class"></div><div class="field--search"><label class="sr" for="fq">Search fighters</label>' + icon("search") + '<input id="fq" type="search" placeholder="Search fighters" autocomplete="off"></div></div><div class="fgrid" id="fGrid"></div></div></section>';
    var bar = main.querySelector("#fBar");
    classes.forEach(function (c) {
      var b = document.createElement("button"); b.className = "pill"; b.type = "button"; b.textContent = c; b.setAttribute("aria-pressed", String(c === cls));
      b.addEventListener("click", function () { cls = c; bar.querySelectorAll(".pill").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); draw(); });
      bar.appendChild(b);
    });
    main.querySelector("#fq").addEventListener("input", function (e) { q = e.target.value.trim().toLowerCase(); draw(); });
    function draw() {
      var list = all.filter(function (f) { return (cls === "All" || f.weightClass === cls) && (!q || (f.name + " " + f.nickname + " " + f.hometown).toLowerCase().indexOf(q) > -1); });
      main.querySelector("#fGrid").innerHTML = list.length ? list.map(fcard).join("") : '<div class="empty" style="grid-column:1/-1">No fighters match your search.</div>';
      F.ui.reveal(main);
    }
    draw();
  };

  /* ======================= FIGHTER DETAIL ======================= */
  P.fighter = function (main) {
    var id = new URLSearchParams(location.search).get("id"), f = id && S.fighter(id);
    if (!f || !f.published) {
      setTitle("Fighter not found");
      main.innerHTML = phead("Fighters", 'Fighter <span class="g">not found</span>', "We could not find that fighter. They may have moved on, or the link may be wrong.") + '<section class="sec sec--tight"><div class="wrap"><a class="btn" href="' + url("fighters.html") + '">View all fighters</a></div></section>';
      return;
    }
    S.setRef(f.id); S.track("views", f.id);
    setTitle(f.name, f.bio.slice(0, 150));
    var ev = f.nextFight && f.nextFight.eventId ? S.event(f.nextFight.eventId) : null, nf = f.nextFight || {};
    var list = S.fighters(), i = list.findIndex(function (x) { return x.id === f.id; });
    var prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
    var short = f.bio.length > 240, shortBio = short ? f.bio.slice(0, 240).replace(/\s+\S*$/, "") + "..." : f.bio;
    var nextHtml = ev ?
      '<div class="nextfight"><span class="chip chip--g" style="justify-self:start">' + esc(nf.slot || "Fight") + '</span><div class="nextfight__vs">' + esc(f.name) + " <span>vs</span> " + esc(nf.opponent) + '</div><div class="kv"><span>' + icon("calendar") + esc(fm.day(ev.date)) + " " + new Date(ev.date).getFullYear() + "</span><span>" + icon("clock") + esc(fm.time(ev.date)) + "</span><span>" + icon("pin") + esc(ev.venue) + ", " + esc(ev.city) + "</span><span>" + icon("glove") + esc(nf.weight) + ", " + nf.rounds + ' rounds</span></div><div class="cd" id="fCd"></div><div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn" data-act="tickets" data-event="' + ev.id + '" data-fighter="' + f.id + '">' + icon("ticket") + "Buy tickets</button>" + (ev.ppv ? '<a class="btn btn--ghost" href="' + url("live.html") + '">' + icon("play") + "Watch PPV</a>" : "") + '<button class="btn btn--ghost" data-act="ics" data-event="' + ev.id + '">' + icon("calendar") + "Add to calendar</button></div></div>" :
      '<div class="nextfight"><div class="nextfight__vs">Next fight <span>to be announced</span></div><p class="mut">' + esc(f.name) + " is not yet confirmed for a date. Follow KROWN to hear first.</p><a class=\"btn btn--ghost\" style=\"justify-self:start\" href=\"" + esc(CFG.instagram) + '" target="_blank" rel="noopener noreferrer">' + icon("instagram") + "Follow on Instagram</a></div>";
    var rows = f.previousFights.map(function (p) {
      return '<tr><td><span class="res res--' + p.result + '" title="' + { W: "Win", L: "Loss", D: "Draw" }[p.result] + '">' + p.result + "</span></td><td><b>" + esc(p.opponent) + "</b></td><td>" + esc(p.method) + "</td><td>" + esc(p.event) + "</td><td>" + esc(fm.dateShort(p.date)) + "</td></tr>";
    }).join("");
    var t = f.training;
    main.innerHTML = '<section class="phead" style="padding-bottom:0;border:0"><div class="wrap"><a class="link" href="' + url("fighters.html") + '">' + icon("left") + 'All fighters</a></div></section>' +
      '<section class="sec sec--tight" style="padding-top:26px"><div class="wrap fd"><div class="fd__fig rv">' + art.fighter(f) + '</div><div>' +
      '<span class="eyebrow">' + esc(f.weightClass) + "</span><h1 class=\"d\">" + esc(f.name) + '</h1><div class="fd__nick">&ldquo;' + esc(f.nickname) + '&rdquo;</div>' +
      '<div class="stats"><div class="stat stat--rec"><small>Record</small><b>' + recStr(f) + '</b></div><div class="stat"><small>Knockouts</small><b>' + f.record.ko + '</b></div><div class="stat"><small>Age</small><b>' + f.age + '</b></div><div class="stat"><small>Height</small><b>' + esc(f.height) + '</b></div><div class="stat"><small>Reach</small><b>' + esc(f.reach) + '</b></div><div class="stat"><small>Stance</small><b>' + esc(f.stance) + "</b></div></div>" +
      '<div class="blk" style="margin-top:0"><h2 class="h-rule">Bio</h2><p class="prose" id="bio">' + esc(shortBio) + "</p>" + (short ? '<button class="link" id="bioBtn" style="background:none;border:0;border-bottom:1px solid transparent;margin-top:12px;cursor:pointer" aria-expanded="false">Read full bio</button>' : "") + '<div class="kv" style="margin-top:14px"><span>' + icon("pin") + esc(f.hometown) + "</span></div></div>" +
      '<div class="blk"><h2 class="h-rule">Next fight</h2>' + nextHtml + "</div>" +
      '<div class="blk"><h2 class="h-rule">Previous fights</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">Result</th><th scope="col">Opponent</th><th scope="col">Method</th><th scope="col">Event</th><th scope="col">Date</th></tr></thead><tbody>' + rows + "</tbody></table></div></div>" +
      '<div class="blk"><h2 class="h-rule">Where to watch them train</h2><div class="train"><h3>' + esc(t.venue) + '</h3><div class="kv"><span>' + icon("pin") + esc(t.address) + "</span><span>" + icon("calendar") + esc(t.days) + "</span><span>" + icon("clock") + esc(t.time) + '</span></div><p class="note">' + esc(t.note) + '</p><a class="btn btn--ghost btn--sm" style="justify-self:start" data-track="train" href="' + esc(mapUrl(t)) + '" target="_blank" rel="noopener noreferrer">' + icon("pin") + "Get directions" + "</a></div></div>" +
      "</div></div>" +
      '<div class="wrap fnav"><a class="btn btn--ghost btn--sm" href="' + fUrl(prev) + '">' + icon("left") + esc(prev.name) + '</a><a class="btn btn--ghost btn--sm" href="' + fUrl(next) + '">' + esc(next.name) + icon("right") + "</a></div></section>";
    var bb = main.querySelector("#bioBtn");
    if (bb) bb.addEventListener("click", function () { var open = bb.getAttribute("aria-expanded") === "true"; main.querySelector("#bio").textContent = open ? shortBio : f.bio; bb.textContent = open ? "Read full bio" : "Show less"; bb.setAttribute("aria-expanded", String(!open)); if (!open) S.track("bio", f.id); });
    main.querySelectorAll("[data-track]").forEach(function (a) { a.addEventListener("click", function () { S.track(a.getAttribute("data-track"), f.id); }); });
    if (ev) F.ui.countdown(main.querySelector("#fCd"), ev.date, "");
  };

  /* ======================= PHOTOS ======================= */
  P.photos = function (main) {
    setTitle("Photos", "Photo gallery from KROWN fight nights, weigh-ins, training camps and press conferences.");
    var photos = F.seed.photos, cats = ["All"].concat(photos.map(function (p) { return p.cat; }).filter(function (v, i, a) { return a.indexOf(v) === i; })), cat = "All", cur = [];
    main.innerHTML = phead("Gallery", 'KROWN <span class="g">photos</span>', "Fight nights, weigh-ins, camps and crowds. Tap any image to view it full size.") + '<section class="sec sec--tight"><div class="wrap"><div class="bar" id="pBar" role="group" aria-label="Filter photos"></div><div class="mgrid mgrid--masonry" id="pGrid"></div></div></section>';
    var bar = main.querySelector("#pBar");
    cats.forEach(function (c) { var b = document.createElement("button"); b.className = "pill"; b.type = "button"; b.textContent = c; b.setAttribute("aria-pressed", String(c === cat)); b.addEventListener("click", function () { cat = c; bar.querySelectorAll(".pill").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); draw(); }); bar.appendChild(b); });
    function media(p) { return p.src ? '<img class="art art--photo" src="' + esc(p.src) + '" alt="' + esc(p.title) + '" loading="lazy">' : art.scene(p.scene, p.seed); }
    function draw() {
      cur = photos.filter(function (p) { return cat === "All" || p.cat === cat; });
      main.querySelector("#pGrid").innerHTML = cur.map(function (p, i) { return '<button class="mitem rv" data-i="' + i + '" aria-label="View ' + esc(p.title) + '">' + media(p) + '<span class="mitem__tag chip chip--g">' + esc(p.cat) + '</span><span class="mitem__cap"><b>' + esc(p.title) + "</b></span></button>"; }).join("");
      F.ui.reveal(main);
    }
    function open(i) {
      i = (i + cur.length) % cur.length; var p = cur[i];
      var m = F.ui.modal('<div class="lb"><div class="lb__img">' + media(p) + '</div><button class="lb__nav lb__nav--l" aria-label="Previous photo" type="button">' + icon("left") + '</button><button class="lb__nav lb__nav--r" aria-label="Next photo" type="button">' + icon("right") + '</button><div class="lb__cap"><b>' + esc(p.title) + '</b><span class="chip chip--g">' + esc(p.cat) + "</span><span class=\"mut\">" + (i + 1) + " / " + cur.length + "</span></div></div>", { wide: true, label: p.title });
      m.querySelector(".lb__nav--l").addEventListener("click", function () { open(i - 1); }); m.querySelector(".lb__nav--r").addEventListener("click", function () { open(i + 1); });
      m.setAttribute("data-lb", i);
    }
    main.querySelector("#pGrid").addEventListener("click", function (e) { var b = e.target.closest(".mitem"); if (b) open(+b.getAttribute("data-i")); });
    document.addEventListener("keydown", function (e) { var m = document.querySelector(".modal.open[data-lb]"); if (!m) return; var i = +m.getAttribute("data-lb"); if (e.key === "ArrowLeft") open(i - 1); if (e.key === "ArrowRight") open(i + 1); });
    draw();
  };

  /* ======================= BTS ======================= */
  P.bts = function (main) {
    setTitle("Behind The Scenes", "Behind the scenes at KROWN: fight preparation, choosing locations and event set-ups.");
    var vids = F.seed.videos, cats = ["All"].concat(vids.map(function (v) { return v.cat; }).filter(function (v, i, a) { return a.indexOf(v) === i; })), cat = "All";
    main.innerHTML = phead("BTS", 'Behind the <span class="g">scenes</span>', "Preparing for fights, choosing locations and building the event. See the work that goes into every KROWN night.") +
      '<section class="sec sec--tight"><div class="wrap"><div class="bar" id="vBar" role="group" aria-label="Filter videos"></div><div class="mgrid" id="vGrid"></div>' +
      '<div class="formcard mt" style="display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap"><div><h3 class="d" style="font-size:28px">More on the way</h3><p class="mut">New episodes land on Instagram first. Follow KROWN so you never miss one.</p></div><a class="btn" href="' + esc(CFG.instagram) + '" target="_blank" rel="noopener noreferrer">' + icon("instagram") + "Follow on Instagram</a></div></div></section>";
    var bar = main.querySelector("#vBar");
    cats.forEach(function (c) { var b = document.createElement("button"); b.className = "pill"; b.type = "button"; b.textContent = c; b.setAttribute("aria-pressed", String(c === cat)); b.addEventListener("click", function () { cat = c; bar.querySelectorAll(".pill").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); draw(); }); bar.appendChild(b); });
    function draw() {
      main.querySelector("#vGrid").innerHTML = vids.filter(function (v) { return cat === "All" || v.cat === cat; }).map(function (v) {
        return '<button class="mitem rv" data-id="' + v.id + '" aria-label="Play ' + esc(v.title) + '">' + art.scene(v.scene, v.seed) + '<span class="mitem__tag chip chip--g">' + esc(v.cat) + '</span><span class="mitem__len">' + esc(v.length) + '</span><span class="mitem__play">' + icon("play") + '</span><span class="mitem__cap"><b>' + esc(v.title) + "</b><span>" + esc(v.blurb) + "</span></span></button>";
      }).join("");
      F.ui.reveal(main);
    }
    main.querySelector("#vGrid").addEventListener("click", function (e) {
      var b = e.target.closest(".mitem"); if (!b) return;
      var v = vids.filter(function (x) { return x.id === b.getAttribute("data-id"); })[0];
      var body = v.youtubeId ? '<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.youtubeId) + '?autoplay=1&rel=0" title="' + esc(v.title) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>' :
        '<div class="player">' + art.scene(v.scene, v.seed) + '<div class="stage__in" style="position:absolute;inset:0"><div><span class="chip chip--g">Coming soon</span><h3 class="d" style="font-size:34px">' + esc(v.title) + '</h3><p class="mut">This episode is being edited. Follow KROWN on Instagram to see it first.</p></div></div></div>';
      F.ui.modal(body, { wide: true, label: v.title });
    });
    draw();
  };

  /* ======================= TEAM ======================= */
  P.team = function (main) {
    setTitle("The Team", "Meet the KROWN team, the people behind the team, and the event team.");
    var T = F.seed.team, bi = ["dumbbell", "shield", "camera", "heart"];
    var tc = function (m) { return '<article class="tcard rv"><div class="avatar" aria-hidden="true">' + esc(fm.initials(m.name)) + "</div><h3>" + esc(m.name) + '</h3><div class="role">' + esc(m.role) + "</div><p>" + esc(m.bio) + "</p></article>"; };
    main.innerHTML = phead("The Team", 'Meet the <span class="g">team</span>', "Behind every KROWN night is a team building something for the fighters and the fans. Meet the people behind KROWN.") +
      '<section class="sec sec--tight" id="meet-the-team"><div class="wrap"><h2 class="h-rule rv">Meet the team</h2><div class="tgrid mt">' + T.leadership.map(tc).join("") + "</div></div></section>" +
      '<section class="sec sec--alt" id="behind-the-team"><div class="wrap"><div class="story"><div class="rv"><span class="eyebrow">Behind the team</span><h2 class="d sec__title">Own the <span class="g">night</span></h2><p class="sec__lead">KROWN Boxing Promotions builds fight nights around ambition, atmosphere and athletes who refuse to be ordinary.</p></div><div class="story__art rv">' + art.scene("gloves", 77) + '</div></div><div class="behind mt" style="margin-top:36px">' +
      T.behind.map(function (b, i) { return '<article class="tcard rv">' + icon(bi[i]) + "<h3>" + esc(b.name) + "</h3><p style=\"margin-top:8px\">" + esc(b.text) + "</p></article>"; }).join("") + "</div></div></section>" +
      '<section class="sec sec--tight" id="event-team"><div class="wrap"><h2 class="h-rule rv">Meet the event team</h2><p class="sec__lead rv" style="margin-bottom:26px">The crew that turns an empty hall into fight night.</p><div class="tgrid tgrid--3">' + T.events.map(tc).join("") + "</div></div></section>" +
      '<section class="sec" id="partners"><div class="wrap">' +
      '<h3 class="h-rule rv" style="margin:50px 0 18px">KROWN partners</h3><div class="sponsors rv">' + F.seed.sponsors.map(function (s) { return "<span><small>" + esc(s.tier) + "</small>" + esc(s.name) + "</span>"; }).join("") + "</div></div></section>";
  };

  /* ======================= LIVE ======================= */
  P.live = function (main) {
    setTitle("Live", "Watch KROWN fight nights live on pay-per-view for " + fm.eur(CFG.ppvPrice) + ".");
    var ev = S.upcoming().filter(function (e) { return e.ppv; })[0] || S.nextFightNight();
    var yt = CFG.liveYouTubeId;
    main.innerHTML = phead("KROWN Live", 'Watch <span class="g">live</span>', "Every KROWN fight night, live on any screen. One payment of " + fm.eur(CFG.ppvPrice) + ", no subscription.") +
      '<section class="sec sec--tight"><div class="wrap"><div id="stage"></div><div class="perks"><div class="perk rv">' + icon("broadcast") + "<b>Live and HD</b><p>Watch every fight, live, from the first bell to the final result.</p></div><div class=\"perk rv d1\">" + icon("phone") + "<b>Any screen</b><p>Phone, tablet, laptop or TV. If it plays YouTube, it plays KROWN.</p></div><div class=\"perk rv d2\">" + icon("euro") + "<b>" + fm.eur(CFG.ppvPrice) + " per night</b><p>A single payment unlocks the full broadcast. No subscription.</p></div></div>" +
      '<h2 class="h-rule" style="margin:54px 0 22px">How it works</h2><ol class="features" style="counter-reset:s"><li>' + icon("check") + "<div><b>1. Unlock</b><span>Pay " + fm.eur(CFG.ppvPrice) + " securely on this page.</span></div></li><li>" + icon("check") + "<div><b>2. Come back on fight night</b><span>Return to this page when the event starts. The broadcast appears automatically.</span></div></li><li>" + icon("check") + "<div><b>3. Watch</b><span>Use full screen or cast to your TV with the player controls.</span></div></li></ol></div></section>";
    var stage = main.querySelector("#stage");
    function draw() {
      var acc = S.ppvAccess();
      var bg = art.scene("ring", 9), when = ev ? esc(ev.title) + " &middot; " + esc(fm.day(ev.date)) + ", " + esc(fm.time(ev.date)) : "Next broadcast to be announced";
      if (acc && yt) {
        stage.innerHTML = '<div class="stage"><iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(yt) + '?autoplay=1&rel=0" title="KROWN live broadcast" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
      } else if (acc) {
        stage.innerHTML = '<div class="stage">' + bg + '<div class="stage__in"><div><span class="badge-live" style="background:rgba(214,170,72,.12);border-color:var(--line-g)"><i style="background:var(--g);box-shadow:0 0 10px var(--g)"></i>Access unlocked</span><h2 class="d" style="font-size:clamp(30px,5vw,56px)">You are in</h2><p class="mut">' + when + '</p><div class="cd" id="stCd"></div><p class="note">The broadcast appears here when KROWN goes live.</p></div></div></div>';
        if (ev) F.ui.countdown(stage.querySelector("#stCd"), ev.date, "<div><b>LIVE</b><small>Stand by</small></div>");
      } else {
        stage.innerHTML = '<div class="stage">' + bg + '<div class="stage__in"><div><div class="stage__lock">' + icon("lock") + '</div><span class="eyebrow">Pay-per-view</span><div class="price-big">' + fm.eur(CFG.ppvPrice) + '</div><p class="mut">' + when + '</p><button class="btn" id="unlock">' + icon("play") + "Unlock live stream</button>" + (CFG.demoMode ? '<p class="demo-note" style="justify-content:center">' + icon("info") + "Demo mode: payment is simulated and no money is taken.</p>" : "") + "</div></div></div>";
        stage.querySelector("#unlock").addEventListener("click", pay);
      }
    }
    function pay() {
      var m = F.ui.modal('<h3 class="d">Unlock KROWN Live</h3><p class="modal__sub">' + (ev ? esc(ev.title) : "KROWN live broadcast") + " &middot; " + fm.eur(CFG.ppvPrice) + ' one-off payment</p><form id="payF" novalidate><div class="field" id="payEF"><label for="payE">Email <span class="req">*</span></label><input id="payE" type="email" autocomplete="email" placeholder="you@example.com" required><div class="err" id="payErr"></div></div><div class="total"><span class="mut">Total</span><b>' + fm.eur(CFG.ppvPrice) + '</b></div><button class="btn btn--block" type="submit">' + icon("lock") + "Pay " + fm.eur(CFG.ppvPrice) + "</button>" + (CFG.demoMode && !CFG.stripePaymentLink ? '<p class="demo-note">' + icon("info") + "Demo checkout. No card is requested and no money is taken.</p>" : "") + "</form>", { label: "Unlock live stream" });
      m.querySelector("#payF").addEventListener("submit", function (e) {
        e.preventDefault();
        var em = m.querySelector("#payE");
        if (!em.value || !em.validity.valid) { m.querySelector("#payEF").classList.add("bad"); m.querySelector("#payErr").textContent = "Please enter a valid email address."; em.focus(); return; }
        if (CFG.stripePaymentLink) { window.open(CFG.stripePaymentLink + (CFG.stripePaymentLink.indexOf("?") > -1 ? "&" : "?") + "prefilled_email=" + encodeURIComponent(em.value), "_blank", "noopener"); return; }
        S.addTransaction({ source: "ppv", amount: CFG.ppvPrice, qty: 1, eventId: ev ? ev.id : "", fighterId: S.getRef(), desc: "Pay-per-view access (web)" });
        if (S.getRef()) S.track("tickets", S.getRef());
        S.grantPpv(em.value, ev ? ev.id : "");
        F.ui.close(); draw(); F.ui.toast("Access unlocked. Enjoy the show.");
      });
    }
    draw();
  };

  /* ======================= CONTACT ======================= */
  var FORMS = {
    sponsor: { title: "Sponsor KROWN", icon: "star", lead: "Put your brand in front of fight fans. Tell us about your business and what you have in mind.", type: "sponsor", fields: [
      { n: "name", l: "Full name", t: "text", r: 1, ac: "name" }, { n: "org", l: "Company", t: "text", r: 1, ac: "organization" },
      { n: "email", l: "Email", t: "email", r: 1, ac: "email" }, { n: "phone", l: "Phone", t: "tel", ac: "tel" },
      { n: "interest", l: "What would you like to sponsor?", t: "select", r: 1, o: ["Fight night title sponsor", "Fighter sponsorship", "Product or in-kind partnership", "Media partnership", "Something else"] },
      { n: "budget", l: "Budget range", t: "select", o: ["Under €1,000", "€1,000 to €5,000", "€5,000 to €10,000", "€10,000 or more", "Not sure yet"] },
      { n: "message", l: "Message", t: "textarea", r: 1, full: 1 }] },
    fight: { title: "Fight for KROWN", icon: "glove", lead: "Think you belong on an KROWN card? Send us your details and a link to your fights.", type: "fight", fields: [
      { n: "name", l: "Full name", t: "text", r: 1, ac: "name" }, { n: "nickname", l: "Nickname", t: "text" },
      { n: "email", l: "Email", t: "email", r: 1, ac: "email" }, { n: "phone", l: "Phone", t: "tel", ac: "tel" },
      { n: "age", l: "Age", t: "number", r: 1, min: 16, max: 60 }, { n: "weight", l: "Weight class", t: "select", r: 1, o: ["Featherweight", "Super Featherweight", "Lightweight", "Welterweight", "Super Welterweight", "Middleweight", "Light Heavyweight", "Cruiserweight", "Heavyweight", "Other"] },
      { n: "record", l: "Record (wins-losses-draws)", t: "text", r: 1, ph: "e.g. 8-1-0", pat: "^\\d{1,3}-\\d{1,3}-\\d{1,3}$", perr: "Use the format 8-1-0." }, { n: "gym", l: "Gym and trainer", t: "text", r: 1 },
      { n: "video", l: "Link to fight footage", t: "url", ph: "https://", full: 1 }, { n: "message", l: "Tell us about yourself", t: "textarea", r: 1, full: 1 }] },
    collab: { title: "Collaborate", icon: "users", lead: "Want to work with KROWN or join the team? Media, content, event crew, coaching and more.", type: "collab", fields: [
      { n: "name", l: "Full name", t: "text", r: 1, ac: "name" }, { n: "org", l: "Business or channel", t: "text", ac: "organization" },
      { n: "email", l: "Email", t: "email", r: 1, ac: "email" }, { n: "phone", l: "Phone", t: "tel", ac: "tel" },
      { n: "interest", l: "I want to", t: "select", r: 1, o: ["Join the team", "Collaborate", "Offer media or content", "Something else"] }, { n: "role", l: "Role or area", t: "text", r: 1, ph: "e.g. Video editor, ring crew, podcast" },
      { n: "link", l: "Portfolio or social link", t: "url", ph: "https://", full: 1 }, { n: "message", l: "Message", t: "textarea", r: 1, full: 1 }] }
  };
  P.contact = function (main) {
    setTitle("Contact", "Contact KROWN to sponsor, fight or collaborate.");
    var keys = ["sponsor", "fight", "collab"], cur = keys.indexOf(location.hash.slice(1)) > -1 ? location.hash.slice(1) : "sponsor";
    main.innerHTML = phead("Contact", 'Get in <span class="g">touch</span>', "Three ways to work with KROWN. Pick the one that fits and we will get back to you.") +
      '<section class="sec sec--tight"><div class="wrap"><div class="tabs" role="tablist" aria-label="Contact type">' + keys.map(function (k) { return '<button class="tab" role="tab" id="tab-' + k + '" aria-controls="panel" data-k="' + k + '" type="button">' + icon(FORMS[k].icon) + FORMS[k].title + "</button>"; }).join("") + '</div>' +
      '<div class="contact"><div class="formcard" id="panel" role="tabpanel"></div><div class="aside"><div class="info">' + icon("mail") + '<div><b>Email</b><p>' + esc(CFG.contactEmail) + '</p></div></div><div class="info">' + icon("instagram") + '<div><b>Instagram</b><p><a class="link" style="font-size:12px" href="' + esc(CFG.instagram) + '" target="_blank" rel="noopener noreferrer">@krownboxingpromotion ' + icon("external") + '</a></p></div></div><div class="info">' + icon("shield") + "<div><b>Your details</b><p>We only use what you send to reply to your enquiry.</p></div></div></div></div></div></section>";
    var panel = main.querySelector("#panel");
    function field(f, form) {
      var id = form + "-" + f.n, req = f.r ? ' required aria-required="true"' : "";
      var inner;
      if (f.t === "select") inner = '<select id="' + id + '" name="' + f.n + '"' + req + '><option value="">Choose one</option>' + f.o.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select>";
      else if (f.t === "textarea") inner = '<textarea id="' + id + '" name="' + f.n + '"' + req + ' maxlength="2000"></textarea>';
      else inner = '<input id="' + id + '" name="' + f.n + '" type="' + f.t + '"' + req + (f.ac ? ' autocomplete="' + f.ac + '"' : "") + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : "") + (f.min ? ' min="' + f.min + '" max="' + f.max + '"' : "") + (f.pat ? ' pattern="' + f.pat + '"' : "") + ">";
      return '<div class="field' + (f.full ? " full" : "") + '" data-n="' + f.n + '"><label for="' + id + '">' + esc(f.l) + (f.r ? ' <span class="req" aria-hidden="true">*</span>' : "") + "</label>" + inner + '<div class="err" id="' + id + '-e" aria-live="polite"></div></div>';
    }
    function show(k) {
      cur = k; var cfg = FORMS[k];
      main.querySelectorAll(".tab").forEach(function (t) { t.setAttribute("aria-selected", String(t.getAttribute("data-k") === k)); t.setAttribute("tabindex", t.getAttribute("data-k") === k ? "0" : "-1"); });
      panel.setAttribute("aria-labelledby", "tab-" + k);
      var halves = cfg.fields.map(function (f) { return field(f, k); });
      /* pair non-full fields into two-column rows */
      var html = "", buf = [];
      cfg.fields.forEach(function (f, i) {
        if (f.full) { if (buf.length) { html += '<div class="frow">' + buf.join("") + "</div>"; buf = []; } html += halves[i]; }
        else { buf.push(halves[i]); if (buf.length === 2) { html += '<div class="frow">' + buf.join("") + "</div>"; buf = []; } }
      });
      if (buf.length) html += '<div class="frow">' + buf.join("") + "</div>";
      panel.innerHTML = '<h2 class="d" style="font-size:clamp(28px,4vw,40px)">' + cfg.title + '</h2><p class="mut" style="margin:8px 0 24px">' + cfg.lead + '</p><form id="cf" novalidate>' + html + '<div class="hp" aria-hidden="true"><label>Leave this empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div><button class="btn" type="submit">' + icon("arrow") + "Send message</button>" +
        (CFG.demoMode && !CFG.formEndpoint ? '<p class="demo-note">' + icon("info") + "Demo mode: enquiries are saved in this browser and appear in the KROWN admin area on this device only.</p>" : "") + "</form>";
      panel.querySelector("#cf").addEventListener("submit", function (e) { e.preventDefault(); submit(k, e.target); });
      history.replaceState(null, "", "#" + k);
    }
    function submit(k, form) {
      var cfg = FORMS[k], ok = true, first = null, data = { type: cfg.type, fields: {} };
      if (form.elements.website.value) return;
      cfg.fields.forEach(function (f) {
        var el = form.elements[f.n], v = (el.value || "").trim(), box = el.closest(".field"), err = box.querySelector(".err"), msg = "";
        if (f.r && !v) msg = "This field is required.";
        else if (v && f.t === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Enter a valid email address.";
        else if (v && f.t === "url" && !/^https?:\/\/\S+\.\S+/.test(v)) msg = "Enter a full link starting with https://";
        else if (v && f.pat && !new RegExp(f.pat).test(v)) msg = f.perr;
        else if (v && f.t === "number" && (+v < f.min || +v > f.max)) msg = "Enter an age between " + f.min + " and " + f.max + ".";
        box.classList.toggle("bad", !!msg); err.textContent = msg;
        if (msg) { ok = false; if (!first) first = el; }
        if (["name", "org", "email", "phone", "message"].indexOf(f.n) > -1) data[f.n] = v; else if (v) data.fields[f.n] = v;
      });
      if (!ok) { first.focus(); return; }
      data.org = data.org || ""; data.phone = data.phone || "";
      S.addRequest(data);
      panel.innerHTML = '<div class="success">' + icon("check") + '<h3 class="d">Message sent</h3><p class="mut">Thank you, ' + esc(data.name.split(" ")[0]) + '. We have your ' + (k === "sponsor" ? "sponsorship enquiry" : (k === "fight" ? "fighter application" : "message")) + ' and will be in touch.</p><div class="mt"><button class="btn btn--ghost" id="again" type="button">Send another</button></div></div>';
      panel.querySelector("#again").addEventListener("click", function () { show(k); });
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    main.querySelector(".tabs").addEventListener("click", function (e) { var b = e.target.closest(".tab"); if (b) show(b.getAttribute("data-k")); });
    main.querySelector(".tabs").addEventListener("keydown", function (e) {
      var i = keys.indexOf(cur); if (e.key === "ArrowRight") i = (i + 1) % 3; else if (e.key === "ArrowLeft") i = (i + 2) % 3; else return;
      show(keys[i]); main.querySelector("#tab-" + keys[i]).focus();
    });
    window.addEventListener("hashchange", function () { var h = location.hash.slice(1); if (keys.indexOf(h) > -1 && h !== cur) show(h); });
    show(cur);
  };

  /* ======================= APP ======================= */
  P.app = function (main) {
    setTitle("App", "The KROWN app: tickets, live pay-per-view, fighters, press conferences and behind the scenes in your pocket.");
    var ev = S.nextFightNight();
    var go = F.isExt(CFG.appUrl) ? '<a class="btn" href="' + esc(CFG.appUrl) + '" target="_blank" rel="noopener noreferrer">' + icon("phone") + 'Open the KROWN app</a>' : '<span class="chip chip--g">App launching soon</span>';
    main.innerHTML = phead("KROWN App", 'KROWN in your <span class="g">pocket</span>', "Tickets, live pay-per-view, fighters and every moment from fight week, all in one place.") +
      '<section class="sec sec--tight"><div class="wrap apphero"><div class="rv"><ul class="features">' +
      [["ticket", "Tickets in seconds", "Buy and store your tickets for every KROWN fight night."], ["broadcast", "Live pay-per-view", "Watch fight night live on your phone or cast it to the big screen."], ["users", "Every fighter", "Bios, records, next fights and where to watch them train."], ["clapper", "Behind the scenes", "Press conferences, weigh-ins and fight camp footage."]].map(function (f) { return "<li>" + icon(f[0]) + "<div><b>" + f[1] + "</b><span>" + f[2] + "</span></div></li>"; }).join("") +
      '</ul><div class="stores">' + go + '<a class="btn btn--ghost" href="' + url("index.html") + '">' + icon("globe") + "Keep browsing the website</a></div></div>" +
      '<div class="rv d1"><div class="phone" aria-label="Preview of the KROWN app home screen" role="img"><div class="phone__scr"><div style="display:flex;justify-content:center;padding-top:8px">' + art.logo() + '</div><div class="pbanner"><div class="d">KROWN<br>' + esc(ev ? ev.title.replace(/^KROWN\s+/i, "") : "Fight Night") + '</div><span class="datetag">' + esc(ev ? fm.monthDay(ev.date) : "COMING SOON") + '</span></div><div class="pbtns"><span>Buy Tickets</span><span>Watch PPV</span></div><div class="pgrid">' +
      [["calendar", "Upcoming Events"], ["broadcast", "Live PPV"], ["clapper", "Behind The Scenes"], ["mic", "Press Conferences"], ["playbox", "Previous Fights"], ["users", "KROWN Fighters"]].map(function (t) { return "<span>" + icon(t[0]) + t[1] + "</span>"; }).join("") +
      '</div></div><div class="ptab"><span class="on">' + icon("home") + 'Home</span><span>' + icon("broadcast") + 'Live</span><span>' + icon("ticket") + 'Tickets</span><span>' + icon("playbox") + 'Media</span><span>' + icon("user") + "Profile</span></div></div></div></div></section>";
  };

  P.notfound = function (main) {
    setTitle("Page not found");
    main.innerHTML = phead("Error 404", "Out of the <span class=\"g\">ring</span>", "That page could not be found. It may have moved, or the link may be wrong.") + "<section class=\"sec sec--tight\"><div class=\"wrap\" style=\"display:flex;gap:12px;flex-wrap:wrap\"><a class=\"btn\" href=\"" + url("index.html") + "\">Back to home</a><a class=\"btn btn--ghost\" href=\"" + url("events.html") + "\">See events</a></div></section>";
  };

  F.pages = P;
})();
