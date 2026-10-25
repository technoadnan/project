/* Backend Dev — theme, progress, lesson chrome and animation components. */
(function () {
  "use strict";
  var BD = (window.BD = window.BD || {});
  var doc = document;
  var root = doc.documentElement;
  var NS = "http://www.w3.org/2000/svg";
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var uid = 0;

  /* ---------- small helpers ---------- */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function h(tag, cls, html) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function svg(tag, attrs, parent) {
    var e = doc.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function text(parent, x, y, str, attrs) {
    var t = svg("text", Object.assign({ x: x, y: y }, attrs || {}), parent);
    t.textContent = str;
    return t;
  }
  function resolve(target) { return typeof target === "string" ? $(target) : target; }
  function slug(s) { return s.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function plain(html) { var d = h("div", null, html || ""); return d.textContent || ""; }
  BD.h = h; BD.svg = svg; BD.text = text; BD.reduce = reduce;

  /* ---------- theme ---------- */
  function effectiveTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function paintThemeBtn(btn) {
    var dark = effectiveTheme() === "dark";
    btn.innerHTML = dark ? SUN : MOON;
    btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    btn.title = btn.getAttribute("aria-label");
  }
  function initTheme() {
    var btn = $("#theme-toggle");
    if (!btn) return;
    paintThemeBtn(btn);
    btn.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      store.set("bd-theme", next);
      paintThemeBtn(btn);
    });
  }

  /* ---------- progress ---------- */
  BD.progress = {
    all: function () { try { return JSON.parse(store.get("bd-done") || "[]"); } catch (e) { return []; } },
    has: function (id) { return this.all().indexOf(id) !== -1; },
    set: function (id, on) {
      var s = this.all().filter(function (x) { return x !== id; });
      if (on) s.push(id);
      store.set("bd-done", JSON.stringify(s));
    }
  };

  /* ---------- lesson page chrome ---------- */
  function initLesson() {
    var id = doc.body.dataset.lesson;
    if (!id || !window.BD_LESSONS) return;
    var list = window.BD_LESSONS;
    var idx = list.findIndex(function (l) { return l.id === id; });
    var L = list[idx];
    var main = $("main");

    var crumb = $(".topbar .crumb");
    if (crumb && L) crumb.textContent = "Lesson " + L.no + " of " + list.length;

    // table of contents
    var heads = $$("h2", main);
    var links = [];
    heads.forEach(function (hd) {
      if (!hd.id) hd.id = slug(hd.textContent);
      links.push('<a href="#' + hd.id + '">' + hd.textContent + "</a>");
    });
    var toc = $(".toc");
    if (toc && heads.length) toc.innerHTML = "<h4>On this page</h4>" + links.join("");
    var hero = $(".lesson-hero", main);
    if (hero && heads.length) {
      var det = h("details", "toc-mobile", "<summary>On this page</summary><nav>" + links.join("") + "</nav>");
      hero.appendChild(det);
      det.addEventListener("click", function (e) { if (e.target.tagName === "A") det.open = false; });
    }
    if (toc && "IntersectionObserver" in window) {
      var active = null;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            if (active) active.classList.remove("active");
            active = $('a[href="#' + en.target.id + '"]', toc);
            if (active) active.classList.add("active");
          }
        });
      }, { rootMargin: "-15% 0px -75% 0px" });
      heads.forEach(function (hd) { io.observe(hd); });
    }

    // reading progress
    var bar = $(".topbar .progress-mini");
    if (bar) {
      var onScroll = function () {
        var max = doc.documentElement.scrollHeight - innerHeight;
        bar.style.width = (max > 0 ? Math.min(100, (scrollY / max) * 100) : 0) + "%";
      };
      addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // completion + pager
    var end = h("div", "lesson-end");
    var btn = h("button", "complete-btn", '<span class="box"></span><span class="lbl"></span>');
    btn.type = "button";
    var paint = function () {
      var done = BD.progress.has(id);
      btn.classList.toggle("done", done);
      $(".lbl", btn).textContent = done ? "Completed: nice work" : "Mark this lesson as complete";
    };
    btn.addEventListener("click", function () { BD.progress.set(id, !BD.progress.has(id)); paint(); });
    paint();
    end.appendChild(btn);
    var pager = h("nav", "pager");
    pager.setAttribute("aria-label", "Lesson navigation");
    var prev = list[idx - 1], next = list[idx + 1];
    if (prev) pager.appendChild(h("a", "prev", "<small>← Previous</small><span>" + prev.no + ". " + prev.title + "</span>")).href = prev.file;
    if (next) pager.appendChild(h("a", "next", "<small>Next →</small><span>" + next.no + ". " + next.title + "</span>")).href = next.file;
    else pager.appendChild(h("a", "next", "<small>Finished</small><span>Back to the roadmap</span>")).href = "../index.html";
    end.appendChild(pager);
    main.appendChild(end);
  }

  /* ---------- roadmap (index) ---------- */
  function initRoadmap() {
    var host = $("#roadmap");
    if (!host || !window.BD_LESSONS) return;
    var done = BD.progress.all();
    window.BD_PHASES.forEach(function (p, pi) {
      var items = window.BD_LESSONS.filter(function (l) { return l.phase === p.id; });
      var sec = h("section", "phase");
      sec.id = p.id;
      sec.innerHTML = '<div class="phase-head"><span class="num">Part ' + (pi + 1) + "</span><h2>" + p.title + "</h2><p>" + p.blurb + "</p></div>";
      var grid = h("div", "lesson-grid");
      items.forEach(function (l) {
        var a = h("a", "lesson-card" + (done.indexOf(l.id) !== -1 ? " done" : ""),
          '<div class="top"><span class="no">' + l.no + '</span><span>·</span><span>' + l.dur + '</span><span class="tick" aria-hidden="true"></span></div>' +
          "<h3>" + l.title + "</h3><p>" + l.blurb + "</p>");
        a.href = "lessons/" + l.file;
        grid.appendChild(a);
      });
      sec.appendChild(grid);
      host.appendChild(sec);
    });
    var n = done.filter(function (id) { return window.BD_LESSONS.some(function (l) { return l.id === id; }); }).length;
    var total = window.BD_LESSONS.length;
    var track = $(".overall .track i"), label = $(".overall .label"), cta = $("#continue");
    if (track) setTimeout(function () { track.style.width = (n / total) * 100 + "%"; }, 120);
    if (label) label.textContent = n + " of " + total + " lessons complete";
    if (cta) {
      var nextL = window.BD_LESSONS.find(function (l) { return done.indexOf(l.id) === -1; });
      if (nextL) {
        cta.href = "lessons/" + nextL.file;
        if (n > 0) cta.innerHTML = "Continue with lesson " + nextL.no + " →";
      } else cta.innerHTML = "All done. Start a review →";
    }
  }

  /* ---------- player: shared controls for every animation ---------- */
  function Player(fig, n, opts) {
    var self = this;
    this.n = n; this.opts = opts; this.i = opts.start != null ? opts.start : -1; this.timer = null; this.playing = false;
    this.cap = h("div", "anim-caption", '<span class="n"></span><span class="t"></span>');
    this.ctl = h("div", "anim-controls");
    this.bReset = h("button", null, "↺ <span>Restart</span>");
    this.bPrev = h("button", null, "‹ Back");
    this.bPlay = h("button", "primary", "▶ Play");
    this.bNext = h("button", null, "Next ›");
    this.barI = h("i");
    var bar = h("span", "bar"); bar.appendChild(this.barI);
    this.count = h("span", "count");
    [this.bReset, this.bPrev, this.bPlay, this.bNext].forEach(function (b) { b.type = "button"; self.ctl.appendChild(b); });
    this.ctl.appendChild(bar); this.ctl.appendChild(this.count);
    fig.appendChild(this.cap); fig.appendChild(this.ctl);
    this.bReset.addEventListener("click", function () { self.pause(); self.go(self.opts.start != null ? self.opts.start : -1, false); });
    this.bPrev.addEventListener("click", function () { self.pause(); self.go(self.i - 1, false); });
    this.bNext.addEventListener("click", function () { self.pause(); self.go(self.i + 1, true); });
    this.bPlay.addEventListener("click", function () { self.playing ? self.pause() : self.play(); });
    this.go(this.i, false);
    if (opts.autoplay !== false && !reduce && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { io.disconnect(); setTimeout(function () { if (!self.touched) self.play(); }, 350); }
      }, { threshold: 0.45 });
      io.observe(fig);
    }
    [this.bReset, this.bPrev, this.bNext].forEach(function (b) { b.addEventListener("click", function () { self.touched = true; }); });
  }
  Player.prototype.go = function (i, animate) {
    var min = this.opts.start != null ? this.opts.start : -1;
    i = Math.max(min, Math.min(this.n - 1, i));
    this.i = i;
    this.opts.render(i, animate && !reduce);
    var note = i < 0 ? (this.opts.intro || "Press <b>Play</b> to run the animation, or step through it with <b>Next</b>.") : this.opts.note(i);
    $(".n", this.cap).textContent = i < 0 ? "start" : (i + 1) + "/" + this.n;
    $(".t", this.cap).innerHTML = note || "";
    this.bPrev.disabled = i <= min;
    this.bNext.disabled = i >= this.n - 1;
    this.barI.style.width = ((i + 1) / this.n) * 100 + "%";
    this.count.textContent = Math.max(0, i + 1) + " / " + this.n;
    if (!this.playing) this.bPlay.innerHTML = i >= this.n - 1 ? "↺ Replay" : "▶ Play";
  };
  Player.prototype.delay = function (i) {
    if (this.opts.delay) return this.opts.delay(i);
    var len = plain(this.opts.note(i)).length;
    return Math.min(this.opts.maxDelay || 7000, (this.opts.minDelay || 1700) + len * 32);
  };
  Player.prototype.play = function () {
    var self = this;
    if (this.i >= this.n - 1) this.go(this.opts.start != null ? this.opts.start : -1, false);
    this.playing = true;
    this.bPlay.innerHTML = "❚❚ Pause";
    var tick = function () {
      if (!self.playing) return;
      if (self.i >= self.n - 1) { self.pause(); return; }
      self.go(self.i + 1, true);
      self.timer = setTimeout(tick, self.delay(self.i));
    };
    this.timer = setTimeout(tick, this.i < 0 ? 300 : 900);
  };
  Player.prototype.pause = function () {
    this.playing = false;
    clearTimeout(this.timer);
    this.bPlay.innerHTML = this.i >= this.n - 1 ? "↺ Replay" : "▶ Play";
  };
  BD.Player = Player;

  /* ---------- moving packets ---------- */
  function polyLength(pts) {
    var L = 0, segs = [];
    for (var i = 1; i < pts.length; i++) {
      var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      segs.push(d); L += d;
    }
    return { L: L, segs: segs };
  }
  function pointAt(pts, info, dist) {
    for (var i = 0; i < info.segs.length; i++) {
      if (dist <= info.segs[i] || i === info.segs.length - 1) {
        var r = info.segs[i] ? Math.min(1, dist / info.segs[i]) : 1;
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r];
      }
      dist -= info.segs[i];
    }
    return pts[pts.length - 1];
  }
  function movePackets(layer, lines, opts) {
    opts = opts || {};
    if (layer._raf) cancelAnimationFrame(layer._raf);
    while (layer.firstChild) layer.removeChild(layer.firstChild);
    if (!lines.length || !opts.animate) return;
    var packets = lines.filter(function (pts) { return pts.length > 1; }).map(function (pts) {
      var g = svg("g", { "class": "packet " + (opts.tone || "") }, layer);
      svg("circle", { r: 6 }, g);
      if (opts.label) {
        var w = opts.label.length * 6.6 + 12;
        svg("rect", { x: -w / 2, y: -26, width: w, height: 17, rx: 5 }, g);
        text(g, 0, -14, opts.label, { "text-anchor": "middle" });
      }
      return { g: g, pts: pts, info: polyLength(pts) };
    });
    var maxL = Math.max.apply(null, packets.map(function (p) { return p.info.L; }).concat([1]));
    var dur = Math.max(500, Math.min(opts.max || 1700, maxL / (opts.speed || 0.34)));
    var t0 = performance.now();
    var frame = function (now) {
      var t = Math.min(1, (now - t0) / dur), k = ease(t);
      packets.forEach(function (p) {
        var xy = pointAt(p.pts, p.info, k * p.info.L);
        p.g.setAttribute("transform", "translate(" + xy[0].toFixed(1) + "," + xy[1].toFixed(1) + ")");
      });
      if (t < 1) layer._raf = requestAnimationFrame(frame);
      else setTimeout(function () { packets.forEach(function (p) { p.g.style.transition = "opacity .5s"; p.g.style.opacity = "0"; }); }, opts.linger || 700);
    };
    layer._raf = requestAnimationFrame(frame);
  }
  BD.movePackets = movePackets;

  function makeFigure(fig, scroll) {
    var stage = h("div", "anim-stage" + (scroll ? " scroll" : ""));
    var title = $(".anim-title", fig);
    if (title && title.nextSibling) fig.insertBefore(stage, title.nextSibling); else fig.appendChild(stage);
    return stage;
  }
  function markers(s, id) {
    var defs = svg("defs", {}, s);
    ["muted", "acc", "ok", "bad", "warn"].forEach(function (t) {
      var m = svg("marker", { id: id + "-" + t, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
      svg("path", { d: "M0,0 L10,5 L0,10 z", "class": "mk-" + t }, m);
    });
  }

  /* ---------- sequence diagram ----------
     cfg: { actors: ["Client","Server"], steps: [{ from:0, to:1, label:"GET /", note:"...", ret:true, tone:"ok" }, { over:1, text:"note", note:"..." }] } */
  BD.seq = function (target, cfg) {
    var fig = resolve(target);
    if (!fig) return;
    var A = cfg.actors.length, steps = cfg.steps;
    var stage = makeFigure(fig, A > 3);
    var colW = cfg.colW || 175, rowH = cfg.rowH || 44, top = 70;
    var boxW = cfg.actors.map(function (name) { return Math.min(colW - 18, Math.max(96, name.length * 8 + 26)); });
    var pad = Math.max(cfg.pad || 80, boxW[0] / 2 + 6, boxW[A - 1] / 2 + 6);
    var W = Math.max(cfg.minW || 560, pad * 2 + colW * (A - 1));
    var H = top + steps.length * rowH + 14;
    var X = function (a) { return A === 1 ? W / 2 : pad + a * (W - 2 * pad) / (A - 1); };
    var id = "sq" + (++uid);
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": cfg.aria || "Sequence diagram" }, stage);
    s.style.maxWidth = W + "px";
    markers(s, id);
    cfg.actors.forEach(function (name, a) {
      svg("line", { x1: X(a), y1: 44, x2: X(a), y2: H - 4, "class": "seq-life" }, s);
      var g = svg("g", { "class": "seq-actor" }, s);
      var bw = boxW[a];
      svg("rect", { x: X(a) - bw / 2, y: 6, width: bw, height: 36, rx: 9 }, g);
      text(g, X(a), 29, name, { "text-anchor": "middle" });
    });
    var layer;
    var msgs = steps.map(function (st, i) {
      var y = top + i * rowH + rowH / 2;
      var g = svg("g", { "class": "seq-msg hidden" + (st.ret ? " ret" : "") + (st.tone ? " " + st.tone : "") }, s);
      var line = null, pts = null;
      if (st.over != null) {
        var span = [].concat(st.over), x1 = X(Math.min.apply(null, span)), x2 = X(Math.max.apply(null, span));
        var tw = Math.max(x2 - x1 + 120, st.text.length * 6.4 + 22);
        var ng = svg("g", { "class": "seq-note" }, g);
        svg("rect", { x: (x1 + x2) / 2 - tw / 2, y: y - 14, width: tw, height: 26, rx: 6 }, ng);
        text(ng, (x1 + x2) / 2, y + 4, st.text, { "text-anchor": "middle" });
      } else if (st.from === st.to) {
        var x = X(st.from), sd = st.from === A - 1 && A > 1 ? -1 : 1;
        line = svg("path", { d: "M" + x + "," + (y - 10) + " h" + (34 * sd) + " v18 h" + (-30 * sd) }, g);
        text(g, x + 42 * sd, y + 3, st.label, { "text-anchor": sd > 0 ? "start" : "end" });
        pts = [[x, y - 10], [x + 34 * sd, y - 10], [x + 34 * sd, y + 8], [x + 4 * sd, y + 8]];
      } else {
        var xa = X(st.from), xb = X(st.to), dir = xb > xa ? 1 : -1;
        line = svg("line", { x1: xa + dir * 3, y1: y + 6, x2: xb - dir * 4, y2: y + 6 }, g);
        text(g, (xa + xb) / 2, y - 2, st.label, { "text-anchor": "middle" });
        pts = [[xa, y + 6], [xb - dir * 6, y + 6]];
      }
      return { g: g, line: line, pts: pts };
    });
    layer = svg("g", {}, s);
    var player = new Player(fig, steps.length, {
      intro: cfg.intro,
      autoplay: cfg.autoplay,
      note: function (i) { return steps[i].note; },
      render: function (i, animate) {
        msgs.forEach(function (m, j) {
          m.g.classList.toggle("hidden", j > i);
          m.g.classList.toggle("cur", j === i);
          if (m.line) m.line.setAttribute("marker-end", "url(#" + id + "-" + (j === i ? (steps[j].tone || "acc") : "muted") + ")");
        });
        var cur = msgs[i];
        movePackets(layer, cur && cur.pts ? [cur.pts] : [], { animate: animate, tone: i >= 0 ? steps[i].tone : "", speed: 0.45, max: 900, linger: 250 });
      }
    });
    return player;
  };

  /* ---------- flow / topology diagram ----------
     cfg: { w, h, nodes: { id: { x, y, w, h, label, sub, kind, shape } }, edges: [["a","b",{label,dashed}]],
            steps: [{ path:["a","b"] | [["a","b"],["a","c"]], packet:"GET", tone:"ok", hl:[], ok:[], bad:[], warn:[], dim:[], set:{ id: "sub" }, note }] } */
  BD.flow = function (target, cfg) {
    var fig = resolve(target);
    if (!fig) return;
    var W = cfg.w || 720, H = cfg.h || 300;
    var stage = makeFigure(fig, cfg.scroll);
    if (cfg.minW) stage.classList.add("scroll");
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": cfg.aria || "Animated diagram", "class": cfg.fit ? "fit" : null }, stage);
    if (cfg.minW) s.style.minWidth = cfg.minW + "px";
    s.style.maxWidth = W * 1.1 + "px";
    var nodes = {}, edges = [];
    Object.keys(cfg.nodes).forEach(function (k) {
      var n = Object.assign({ w: 128, h: 54, kind: "server" }, cfg.nodes[k]);
      n.id = k; nodes[k] = n;
    });
    function boundary(n, tx, ty) {
      var dx = tx - n.x, dy = ty - n.y;
      if (!dx && !dy) return [n.x, n.y];
      if (n.shape === "circle") { var r = n.w / 2, d = Math.hypot(dx, dy); return [n.x + dx / d * r, n.y + dy / d * r]; }
      var sx = (n.w / 2) / Math.abs(dx || 1e-9), sy = (n.h / 2) / Math.abs(dy || 1e-9), k = Math.min(sx, sy);
      return [n.x + dx * k, n.y + dy * k];
    }
    var gEdges = svg("g", {}, s);
    (cfg.edges || []).forEach(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]], o = e[2] || {};
      if (!a || !b) return;
      var p1 = boundary(a, b.x, b.y), p2 = boundary(b, a.x, a.y);
      var ln = svg("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], "class": "edge" + (o.dashed ? " dashed" : "") }, gEdges);
      if (o.label) {
        var mx = (p1[0] + p2[0]) / 2 + (o.dx || 0), my = (p1[1] + p2[1]) / 2 + (o.dy != null ? o.dy : -6);
        text(gEdges, mx, my, o.label, { "class": "edge-label", "text-anchor": "middle" });
      }
      edges.push({ a: e[0], b: e[1], el: ln });
    });
    var gNodes = svg("g", {}, s);
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k];
      var g = svg("g", { "class": "node", transform: "translate(" + (n.x - n.w / 2) + "," + (n.y - n.h / 2) + ")" }, gNodes);
      var color = "var(--c-" + n.kind + ", var(--c-server))";
      if (n.shape === "cyl") {
        var e = 8;
        svg("path", { d: "M0," + e + " a" + n.w / 2 + "," + e + " 0 0 0 " + n.w + ",0 v" + (n.h - 2 * e) + " a" + n.w / 2 + "," + e + " 0 0 1 -" + n.w + ",0 z", "class": "n-box" }, g);
        svg("ellipse", { cx: n.w / 2, cy: e, rx: n.w / 2, ry: e, "class": "n-box" }, g);
        svg("ellipse", { cx: n.w / 2, cy: e, rx: n.w / 2 - 1, ry: e - 1, fill: "none", stroke: color, "stroke-width": 1.5, "class": "n-strip" }, g);
      } else if (n.shape === "circle") {
        svg("circle", { cx: n.w / 2, cy: n.h / 2, r: n.w / 2, "class": "n-box" }, g);
        svg("circle", { cx: n.w / 2, cy: n.h / 2, r: n.w / 2 - 4, fill: "none", stroke: color, "stroke-width": 1, opacity: .45, "class": "n-strip" }, g);
      } else {
        svg("rect", { width: n.w, height: n.h, rx: n.shape === "pill" ? n.h / 2 : 11, "class": "n-box" }, g);
        if (n.shape !== "pill") svg("rect", { x: 0, y: 10, width: 4, height: n.h - 20, rx: 2, fill: color, "class": "n-strip" }, g);
      }
      var lines = String(n.label).split("\n");
      var hasSub = n.sub != null;
      var cy = n.h / 2 + (n.shape === "cyl" ? 4 : 0);
      var startY = cy - ((lines.length - 1) * 15) / 2 + (hasSub ? -4 : 4.5);
      lines.forEach(function (ln, li) { text(g, n.w / 2, startY + li * 15, ln, { "class": "n-label", "text-anchor": "middle" }); });
      n.subEl = text(g, n.w / 2, startY + (lines.length - 1) * 15 + 16, n.sub || "", { "class": "n-sub", "text-anchor": "middle" });
      n.g = g;
    });
    var layer = svg("g", {}, s);
    function edgeOn(a, b) {
      edges.forEach(function (e) { if ((e.a === a && e.b === b) || (e.a === b && e.b === a)) e.el.classList.add("on"); });
    }
    var steps = cfg.steps || [];
    var player = new Player(fig, steps.length, {
      intro: cfg.intro,
      autoplay: cfg.autoplay,
      note: function (i) { return steps[i].note; },
      render: function (i, animate) {
        var st = steps[i] || {};
        var subs = {};
        Object.keys(nodes).forEach(function (k) { subs[k] = nodes[k].sub || ""; });
        var from = 0;
        for (var f = 0; f <= i; f++) if (steps[f].fresh) from = f;
        for (var j = from; j <= i; j++) if (steps[j].set) Object.assign(subs, steps[j].set);
        Object.keys(nodes).forEach(function (k) {
          var n = nodes[k];
          n.subEl.textContent = subs[k];
          ["hl", "ok", "bad", "warn", "dim"].forEach(function (c) { n.g.classList.toggle(c, (st[c] || []).indexOf(k) !== -1); });
        });
        edges.forEach(function (e) { e.el.classList.remove("on"); e.el.classList.toggle("dim", (st.dimEdges || false)); });
        var paths = st.path ? (Array.isArray(st.path[0]) ? st.path : [st.path]) : [];
        var lines = paths.map(function (p) {
          for (var q = 1; q < p.length; q++) edgeOn(p[q - 1], p[q]);
          return p.map(function (id, q) {
            var n = nodes[id];
            if (p.length === 1) return [n.x, n.y];
            var other = nodes[p[q === 0 ? 1 : q - 1]];
            if (q === 0 || q === p.length - 1) return boundary(n, other.x, other.y);
            return [n.x, n.y];
          });
        });
        movePackets(layer, lines, { animate: animate, tone: st.tone, label: st.packet, speed: st.speed || 0.34 });
      }
    });
    return player;
  };

  /* ---------- timeline (lanes over time) ----------
     cfg: { lanes:["A","B"], total:10, unit:"s", segs:[{lane:0,s:0,d:2,k:"cpu",t:"label"}], steps:[{to:4,note:"..."}], legend:[{k:"cpu",label:"CPU work"}] } */
  var KIND = { cpu: "var(--accent)", io: "var(--warn)", wait: "var(--faint)", ok: "var(--ok)", bad: "var(--bad)", db: "var(--c-db)", net: "var(--c-net)", cache: "var(--c-cache)", queue: "var(--c-queue)", client: "var(--c-client)", server: "var(--c-server)" };
  BD.timeline = function (target, cfg) {
    var fig = resolve(target);
    if (!fig) return;
    if (cfg.legend) {
      var lg = h("div", "legend", cfg.legend.map(function (l) { return '<span><i style="background:' + (KIND[l.k] || l.k) + '"></i>' + l.label + "</span>"; }).join(""));
      var title = $(".anim-title", fig);
      if (title) fig.insertBefore(lg, title.nextSibling); else fig.appendChild(lg);
    }
    var stage = makeFigure(fig, false);
    var labelW = cfg.labelW || 120, laneH = cfg.laneH || 34, gap = 10, W = cfg.w || 720;
    var H = cfg.lanes.length * (laneH + gap) + 28;
    var trackW = W - labelW - 16;
    var sx = function (t) { return labelW + (t / cfg.total) * trackW; };
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": cfg.aria || "Timeline" }, stage);
    cfg.lanes.forEach(function (name, li) {
      var y = li * (laneH + gap) + 4;
      text(s, labelW - 12, y + laneH / 2 + 4, name, { "class": "tl-lane-label", "text-anchor": "end" });
      svg("rect", { x: labelW, y: y, width: trackW, height: laneH, rx: 7, "class": "tl-track" }, s);
    });
    var segs = cfg.segs.map(function (sg) {
      var y = sg.lane * (laneH + gap) + 4;
      var r = svg("rect", { x: sx(sg.s), y: y + 3, width: 0, height: laneH - 6, rx: 5, fill: KIND[sg.k] || sg.k, "class": "tl-seg" }, s);
      var lbl = sg.t ? text(s, sx(sg.s) + 7, y + laneH / 2 + 4, sg.t, { "class": "tl-seg-label", opacity: 0 }) : null;
      return { sg: sg, r: r, lbl: lbl };
    });
    var axisY = cfg.lanes.length * (laneH + gap) + 16;
    var ticks = cfg.ticks || 5;
    for (var tk = 0; tk <= ticks; tk++) {
      var tv = (cfg.total / ticks) * tk;
      text(s, sx(tv), axisY, (Math.round(tv * 10) / 10) + (cfg.unit || ""), { "class": "tl-axis", "text-anchor": tk === 0 ? "start" : tk === ticks ? "end" : "middle" });
    }
    var head = svg("line", { x1: labelW, x2: labelW, y1: 0, y2: axisY - 10, "class": "tl-head" }, s);
    var now = 0, raf = null;
    function draw(t) {
      now = t;
      segs.forEach(function (o) {
        var vis = Math.max(0, Math.min(o.sg.d, t - o.sg.s));
        o.r.setAttribute("width", Math.max(0, (vis / cfg.total) * trackW));
        if (o.lbl) o.lbl.setAttribute("opacity", vis >= o.sg.d * 0.98 && (o.sg.d / cfg.total) * trackW > o.sg.t.length * 6 + 10 ? 1 : 0);
      });
      head.setAttribute("x1", sx(t)); head.setAttribute("x2", sx(t));
    }
    draw(0);
    var steps = cfg.steps;
    return new Player(fig, steps.length, {
      intro: cfg.intro,
      autoplay: cfg.autoplay,
      note: function (i) { return steps[i].note; },
      delay: function (i) { return Math.max(2200, 1200 + plain(steps[i].note).length * 30); },
      render: function (i, animate) {
        if (raf) cancelAnimationFrame(raf);
        var target = i < 0 ? 0 : steps[i].to;
        if (!animate) { draw(target); return; }
        var from = now, t0 = performance.now(), dur = Math.max(400, Math.min(1800, Math.abs(target - from) / cfg.total * 3000));
        var f = function (ts) {
          var k = Math.min(1, (ts - t0) / dur);
          draw(from + (target - from) * k);
          if (k < 1) raf = requestAnimationFrame(f);
        };
        raf = requestAnimationFrame(f);
      }
    });
  };

  /* ---------- frames stepper: <figure class="anim" data-steps> <div class="frame" data-note="..."> ---------- */
  function initFrames() {
    $$("figure[data-steps]").forEach(function (fig) {
      var frames = $$(".frame", fig);
      if (!frames.length) return;
      var box = h("div", "frames");
      frames[0].parentNode.insertBefore(box, frames[0]);
      frames.forEach(function (f) { box.appendChild(f); });
      new Player(fig, frames.length, {
        start: 0,
        autoplay: fig.dataset.autoplay !== "false",
        minDelay: 2600, maxDelay: 8000,
        note: function (i) { return frames[i].dataset.note || ""; },
        render: function (i) { frames.forEach(function (f, j) { f.classList.toggle("on", j === i); }); }
      });
    });
  }

  /* ---------- tabs: <div class="tabs"><div class="tab" data-label="A">…</div></div> ---------- */
  function initTabs() {
    $$(".tabs").forEach(function (box) {
      var tabs = $$(":scope > .tab", box);
      var bar = h("div", "tab-bar"), body = h("div", "tab-body");
      bar.setAttribute("role", "tablist");
      tabs.forEach(function (t, i) {
        var b = h("button", i === 0 ? "on" : "", t.dataset.label);
        b.type = "button"; b.setAttribute("role", "tab");
        b.addEventListener("click", function () {
          $$("button", bar).forEach(function (x) { x.classList.remove("on"); });
          tabs.forEach(function (x) { x.classList.remove("on"); });
          b.classList.add("on"); t.classList.add("on");
        });
        bar.appendChild(b); body.appendChild(t);
        if (i === 0) t.classList.add("on");
      });
      box.appendChild(bar); box.appendChild(body);
    });
  }

  function init() {
    initTheme();
    initLesson();
    initRoadmap();
    initFrames();
    initTabs();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})();
