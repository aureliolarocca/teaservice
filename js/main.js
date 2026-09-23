/* TEA Service – Quartarone Antonio · script del sito (nessuna dipendenza) */
(function () {
  "use strict";
  var doc = document;
  doc.documentElement.className = doc.documentElement.className.replace(/\bno-js\b/, "js");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Menu mobile ---------- */
  var menuBtn = doc.querySelector(".menu-btn");
  var nav = doc.getElementById("menu");
  if (menuBtn && nav) {
    var setMenu = function (open) {
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
      nav.classList.toggle("is-open", open);
    };
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuBtn.focus();
      }
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
  }

  /* ---------- Comparsa morbida delle sezioni ---------- */
  var reveals = doc.querySelectorAll(".reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
    }
  }

  /* ---------- Lightbox ---------- */
  var dlg = doc.getElementById("lightbox");
  var lb = null;
  if (dlg && typeof dlg.showModal === "function") {
    lb = {
      img: dlg.querySelector(".lightbox__img"),
      cap: dlg.querySelector(".lightbox__cap"),
      count: dlg.querySelector(".lightbox__count"),
      prev: dlg.querySelector(".lightbox__prev"),
      next: dlg.querySelector(".lightbox__next"),
      close: dlg.querySelector(".lightbox__close"),
      items: [], i: 0, opener: null
    };
    lb.show = function (i) {
      var n = lb.items.length;
      lb.i = (i + n) % n;
      var it = lb.items[lb.i];
      lb.img.src = it.getAttribute("data-full");
      lb.img.alt = it.getAttribute("data-alt") || "";
      lb.cap.textContent = it.getAttribute("data-alt") || "";
      lb.count.textContent = (lb.i + 1) + " / " + n;
      lb.prev.hidden = lb.next.hidden = n < 2;
    };
    lb.prev.addEventListener("click", function () { lb.show(lb.i - 1); });
    lb.next.addEventListener("click", function () { lb.show(lb.i + 1); });
    lb.close.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || e.target.classList.contains("lightbox__stage") || e.target.classList.contains("lightbox__inner")) dlg.close();
    });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); lb.show(lb.i - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); lb.show(lb.i + 1); }
    });
    dlg.addEventListener("close", function () {
      lb.img.removeAttribute("src");
      if (lb.opener) lb.opener.focus();
    });
    // scorrimento con swipe sul telefono
    var tx = null;
    dlg.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener("touchend", function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) lb.show(lb.i + (dx < 0 ? 1 : -1));
      tx = null;
    }, { passive: true });

    doc.querySelectorAll("[data-lightbox-group]").forEach(function (group) {
      var items = Array.prototype.slice.call(group.querySelectorAll("[data-lightbox]"));
      items.forEach(function (it, idx) {
        it.addEventListener("click", function () {
          lb.items = items;
          lb.opener = it;
          lb.show(idx);
          dlg.showModal();
        });
      });
    });
  }

  /* ---------- Carosello ---------- */
  function initCarousel(root) {
    var track = root.querySelector(".carousel__track");
    var slides = Array.prototype.slice.call(track.children);
    var dotsBox = root.querySelector(".carousel__dots");
    var prev = root.querySelector(".carousel__prev");
    var next = root.querySelector(".carousel__next");
    var dots = [];
    var current = 0;

    slides.forEach(function (s, i) {
      var d = doc.createElement("button");
      d.type = "button";
      d.className = "carousel__dot";
      d.setAttribute("aria-label", "Vai alla foto " + (i + 1) + " di " + slides.length);
      d.addEventListener("click", function () { goTo(i); });
      dotsBox.appendChild(d);
      dots.push(d);
    });

    function goTo(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      var s = slides[i];
      var left = s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2;
      track.scrollTo({ left: left, behavior: reduceMotion ? "auto" : "smooth" });
    }
    function update() {
      var mid = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestD = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      current = best;
      dots.forEach(function (d, i) {
        if (i === best) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
      });
      var max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    }
    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", update);
    if (prev) prev.addEventListener("click", function () { goTo(current - 1); });
    if (next) next.addEventListener("click", function () { goTo(current + 1); });

    // trascinamento con il mouse (su touch il browser scorre da solo)
    var down = false, moved = false, startX = 0, startL = 0;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startL = track.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add("is-dragging"); }
      if (moved) track.scrollLeft = startL - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      track.classList.remove("is-dragging");
      window.setTimeout(function () { moved = false; }, 0);
    });
    track.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(current + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1); }
    });
    update();
  }
  doc.querySelectorAll(".carousel").forEach(initCarousel);

  /* ---------- Form → messaggio WhatsApp ---------- */
  var form = doc.getElementById("wa-form");
  if (form) {
    var number = form.getAttribute("data-wa");
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get("servizio");
    if (wanted && form.elements.servizio) {
      Array.prototype.forEach.call(form.elements.servizio.options, function (o) {
        if (o.value === wanted) form.elements.servizio.value = wanted;
      });
    }
    var fmtDate = function (v) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || "");
      return m ? m[3] + "/" + m[2] + "/" + m[1] : v;
    };
    var clean = function (v) { return (v || "").replace(/\s+/g, " ").trim(); };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["nome", "servizio"].forEach(function (name) {
        var el = form.elements[name];
        var field = el.closest(".field");
        var bad = !clean(el.value);
        field.classList.toggle("has-error", bad);
        el.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) return;
      var f = form.elements;
      var lines = ["Buongiorno, vorrei richiedere un preventivo."];
      lines.push("");
      lines.push("Servizio: " + clean(f.servizio.value));
      lines.push("Nome: " + clean(f.nome.value));
      if (clean(f.telefono.value)) lines.push("Telefono: " + clean(f.telefono.value));
      if (clean(f.partenza.value)) lines.push("Città di partenza: " + clean(f.partenza.value));
      if (clean(f.arrivo.value)) lines.push("Città di destinazione: " + clean(f.arrivo.value));
      if (f.data.value) lines.push("Data indicativa: " + fmtDate(f.data.value));
      if (clean(f.messaggio.value)) { lines.push(""); lines.push(f.messaggio.value.trim()); }
      var url = "https://wa.me/" + number + "?text=" + encodeURIComponent(lines.join("\n"));
      var w = window.open(url, "_blank", "noopener");
      if (!w) window.location.href = url;
    });
    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field && field.classList.contains("has-error") && clean(e.target.value)) {
        field.classList.remove("has-error");
        e.target.setAttribute("aria-invalid", "false");
      }
    });
  }
})();
