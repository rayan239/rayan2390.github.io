/* ============================================================
   Rayan Hossain — site interactions
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme ---------- */
  var root = document.documentElement;
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
  }
  (function initTheme() {
    var saved;
    try { saved = localStorage.getItem("theme"); } catch (e) {}
    if (saved) { root.setAttribute("data-theme", saved); }
    else {
      var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", dark ? "dark" : "light");
    }
  })();
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-theme-toggle]");
    if (!t) return;
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    if (window.__latticeReset) window.__latticeReset();
  });

  /* ---------- nav scroll state ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 12); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var menu = document.querySelector(".mobile-menu");
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-menu-open]")) { menu && menu.classList.add("open"); }
    if (e.target.closest("[data-menu-close]") || e.target.closest(".mobile-menu a")) {
      menu && menu.classList.remove("open");
    }
  });

  /* ---------- scroll reveal ---------- */
  var revs = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revs.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revs.forEach(function (el) { io.observe(el); });
  }

  /* ---------- current year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ============================================================
     SIGNATURE: attention-map lattice
     A grid of cells that ambiently breathe through the viridis
     colormap; cells near the cursor spike their "activation"
     (an attention query following the pointer). Directly nods to
     the CBAM / attention-mechanism research on the CV.
     ============================================================ */
  var canvas = document.getElementById("lattice");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  // viridis stops (r,g,b)
  var VIR = [
    [68, 1, 84], [59, 74, 137], [38, 130, 142],
    [31, 158, 137], [53, 183, 121], [109, 205, 89],
    [180, 222, 44], [253, 231, 37]
  ];
  function viridis(t) {
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var x = t * (VIR.length - 1), i = Math.floor(x), f = x - i;
    var a = VIR[i], b = VIR[Math.min(i + 1, VIR.length - 1)];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  }

  var cells = [], cols = 0, rows = 0, cw = 0, ch = 0, W = 0, H = 0, dpr = 1;
  var mouse = { x: -9999, y: -9999, on: false };
  var isDark = function () { return root.getAttribute("data-theme") === "dark"; };

  function build() {
    var rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width; H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var target = W < 640 ? 34 : 52;         // approx cell size
    cols = Math.ceil(W / target) + 1;
    rows = Math.ceil(H / target) + 1;
    cw = W / (cols - 1); ch = H / (rows - 1);
    cells = [];
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        cells.push({
          x: c * cw, y: r * ch,
          phase: Math.random() * Math.PI * 2,
          freq: 0.4 + Math.random() * 0.5,
          base: 0.12 + Math.random() * 0.18,
          act: 0
        });
      }
    }
  }
  window.__latticeReset = build;

  canvas.parentElement.addEventListener("pointermove", function (e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; mouse.on = true;
  });
  canvas.parentElement.addEventListener("pointerleave", function () { mouse.on = false; });

  var t0 = performance.now();
  function frame(now) {
    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    var dark = isDark();
    var R = Math.min(W, H) * 0.34;          // attention radius
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      // ambient breathing
      var breathe = cell.base + 0.10 * (0.5 + 0.5 * Math.sin(t * cell.freq + cell.phase));
      // attention spike near pointer
      var targetAct = 0;
      if (mouse.on) {
        var dx = cell.x - mouse.x, dy = cell.y - mouse.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < R) { var f = 1 - d / R; targetAct = f * f; }
      }
      cell.act += (targetAct - cell.act) * 0.12;
      var v = breathe + cell.act * 0.9;
      if (v > 1) v = 1;

      var col = viridis(v);
      var rr = cw * (0.16 + v * 0.30);
      var alpha = (dark ? 0.14 : 0.10) + v * (dark ? 0.55 : 0.42);

      ctx.beginPath();
      ctx.fillStyle = "rgba(" + (col[0] | 0) + "," + (col[1] | 0) + "," + (col[2] | 0) + "," + alpha.toFixed(3) + ")";
      ctx.arc(cell.x, cell.y, rr, 0, Math.PI * 2);
      ctx.fill();

      // thin connective lines to right & down neighbour when active
      if (cell.act > 0.12) {
        var right = cells[i + 1], down = cells[i + cols];
        ctx.strokeStyle = "rgba(" + (col[0] | 0) + "," + (col[1] | 0) + "," + (col[2] | 0) + "," + (cell.act * 0.28).toFixed(3) + ")";
        ctx.lineWidth = 1;
        if (right && (i % cols) !== cols - 1) { ctx.beginPath(); ctx.moveTo(cell.x, cell.y); ctx.lineTo(right.x, right.y); ctx.stroke(); }
        if (down) { ctx.beginPath(); ctx.moveTo(cell.x, cell.y); ctx.lineTo(down.x, down.y); ctx.stroke(); }
      }
    }
    raf = requestAnimationFrame(frame);
  }

  var raf;
  function start() { build(); if (!reduce) { raf = requestAnimationFrame(frame); } else { drawStatic(); } }
  function drawStatic() {
    // reduced-motion: one calm static pass
    ctx.clearRect(0, 0, W, H);
    var dark = isDark();
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i], v = cell.base + 0.05;
      var col = viridis(v);
      ctx.beginPath();
      ctx.fillStyle = "rgba(" + (col[0] | 0) + "," + (col[1] | 0) + "," + (col[2] | 0) + "," + ((dark ? 0.16 : 0.12) + v * 0.3).toFixed(3) + ")";
      ctx.arc(cell.x, cell.y, cw * (0.16 + v * 0.28), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { if (raf) cancelAnimationFrame(raf); start(); }, 180);
  });
  start();
})();
