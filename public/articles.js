/* Pembaca artikel publik: mengambil artikel "published" dari Firestore lalu
   menampilkannya di bagian Berita. Bila Firebase belum dikonfigurasi atau
   belum ada artikel, bagian berita tetap memakai kartu bawaan (fallback). */
(async function () {
  "use strict";
  const BASE_TITLE = document.title;
  const cfg = window.FALAK_FB;
  if (!cfg || !cfg.apiKey) return; // belum dikonfigurasi -> pakai konten statis

  let db, getDocs, collection, query, where;
  try {
    const appMod = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
    const fsMod = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
    const app = appMod.initializeApp(cfg);
    db = fsMod.getFirestore(app);
    collection = fsMod.collection; getDocs = fsMod.getDocs; query = fsMod.query; where = fsMod.where;
  } catch (e) {
    console.warn("Firebase gagal dimuat, memakai artikel bawaan.", e);
    return;
  }

  let arts = [];
  try {
    const snap = await getDocs(query(collection(db, "articles"), where("published", "==", true)));
    snap.forEach((d) => arts.push(Object.assign({ id: d.id }, d.data())));
  } catch (e) {
    console.warn("Gagal memuat artikel:", e);
    return;
  }
  if (!arts.length) return; // tidak ada artikel terbit -> biarkan konten statis
  arts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  injectStyles();
  renderGrid(arts);
  buildModal();

  // Buka artikel langsung bila URL memuat ?artikel=<id> (link yang dibagikan)
  try {
    const wantId = new URLSearchParams(location.search).get("artikel");
    if (wantId) { const a = arts.find((x) => x.id === wantId); if (a) openModal(a); }
  } catch (_) {}

  function fmtDate(a) {
    try {
      const d = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : (a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : null);
      return d ? d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";
    } catch (_) { return ""; }
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  function crescentArt() {
    return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" fill="none">' +
      '<circle cx="300" cy="120" r="70" fill="#0b241d"/>' +
      '<circle cx="270" cy="100" r="72" fill="#d9b44a" opacity="0.9"/>' +
      '<circle cx="255" cy="95" r="66" fill="#0b241d"/>' +
      '<g fill="#f2efe4"><circle cx="80" cy="60" r="1.6"/><circle cx="140" cy="110" r="1.2"/><circle cx="60" cy="160" r="1.8"/><circle cx="180" cy="200" r="1.3"/><circle cx="110" cy="230" r="1.5"/></g>' +
      '<path d="M0 250 Q120 210 240 245 T400 240 V300 H0 Z" fill="#08160f" opacity=".7"/></svg>';
  }

  function renderGrid(list) {
    const grid = document.querySelector(".news-grid");
    if (!grid) return;
    const top = list[0];
    const rest = list.slice(1, 7);
    let html = "";
    const topArt = top.image
      ? '<div class="featured__art" style="background-image:url(' + top.image + ');background-size:cover;background-position:center"></div>'
      : '<div class="featured__art">' + crescentArt() + '</div>';
    html += '<article class="featured art-open" data-id="' + esc(top.id) + '">' + topArt +
      '<div class="featured__body">' +
      '<span class="card__cat">' + esc(top.category || "Artikel") + "</span>" +
      "<h3>" + esc(top.title) + "</h3>" +
      "<p>" + esc(top.summary || (top.body || "").slice(0, 160)) + "</p>" +
      '<span class="art-meta">' + fmtDate(top) + " · Lembaga Falakiyah NU</span>" +
      "</div></article>";
    rest.forEach((a) => {
      const cardTop = a.image
        ? '<div class="card__img" style="background-image:url(' + a.image + ')"></div>'
        : '<div class="card__top"></div>';
      html += '<article class="card art-open" data-id="' + esc(a.id) + '">' + cardTop + '<div class="card__body">' +
        '<span class="card__cat">' + esc(a.category || "Artikel") + "</span>" +
        "<h3>" + esc(a.title) + "</h3>" +
        "<p>" + esc(a.summary || (a.body || "").slice(0, 120)) + "</p>" +
        '<div class="card__meta"><span>' + fmtDate(a) + "</span><span>Lembaga Falakiyah NU</span></div>" +
        "</div></article>";
    });
    grid.innerHTML = html;
    grid.querySelectorAll(".art-open").forEach((el) => {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => openModal(list.find((x) => x.id === el.dataset.id)));
    });
  }

  function buildModal() {
    if (document.getElementById("artModal")) return;
    const m = document.createElement("div");
    m.id = "artModal"; m.className = "art-modal"; m.hidden = true;
    m.innerHTML = '<div class="art-modal__box" role="dialog" aria-modal="true">' +
      '<button class="art-modal__close" aria-label="Tutup">&times;</button>' +
      '<span class="card__cat" id="artModalCat"></span>' +
      '<h2 id="artModalTitle"></h2>' +
      '<div class="art-modal__meta" id="artModalMeta"></div>' +
      '<img class="art-modal__img" id="artModalImg" alt="" hidden>' +
      '<div class="art-modal__body" id="artModalBody"></div>' +
      '<div class="art-share">' +
      '<span class="art-share__lbl">Bagikan:</span>' +
      '<button class="art-share__b native" id="shNative" type="button" hidden>Bagikan…</button>' +
      '<a class="art-share__b wa" id="shWa" target="_blank" rel="noopener">WhatsApp</a>' +
      '<a class="art-share__b fb" id="shFb" target="_blank" rel="noopener">Facebook</a>' +
      '<a class="art-share__b tg" id="shTg" target="_blank" rel="noopener">Telegram</a>' +
      '<a class="art-share__b x" id="shX" target="_blank" rel="noopener">X</a>' +
      '<button class="art-share__b copy" id="shCopy" type="button">Salin link</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(m);
    m.addEventListener("click", (e) => { if (e.target === m || e.target.classList.contains("art-modal__close")) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }
  function openModal(a) {
    if (!a) return;
    document.getElementById("artModalCat").textContent = a.category || "Artikel";
    document.getElementById("artModalTitle").textContent = a.title || "";
    document.getElementById("artModalMeta").textContent = fmtDate(a) + " · Lembaga Falakiyah NU Kota Depok";
    const im = document.getElementById("artModalImg");
    if (a.image) { im.src = a.image; im.hidden = false; } else { im.removeAttribute("src"); im.hidden = true; }
    document.getElementById("artModalBody").textContent = a.body || a.summary || "";

    // ---- Bagikan ke sosial media ----
    const shareUrl = location.origin + location.pathname + "?artikel=" + encodeURIComponent(a.id);
    const title = a.title || "Artikel Lembaga Falakiyah NU Kota Depok";
    const t = encodeURIComponent(title), u = encodeURIComponent(shareUrl), tu = encodeURIComponent(title + " — " + shareUrl);
    document.getElementById("shWa").href = "https://wa.me/?text=" + tu;
    document.getElementById("shFb").href = "https://www.facebook.com/sharer/sharer.php?u=" + u;
    document.getElementById("shTg").href = "https://t.me/share/url?url=" + u + "&text=" + t;
    document.getElementById("shX").href = "https://twitter.com/intent/tweet?text=" + t + "&url=" + u;
    document.getElementById("shCopy").onclick = () => {
      if (navigator.clipboard) navigator.clipboard.writeText(shareUrl).then(() => toast("Link disalin")).catch(() => toast("Gagal menyalin"));
      else toast(shareUrl);
    };
    const nat = document.getElementById("shNative");
    if (navigator.share) { nat.hidden = false; nat.onclick = () => navigator.share({ title: title, text: title, url: shareUrl }).catch(() => {}); }
    else { nat.hidden = true; }
    try { history.replaceState(null, "", shareUrl); } catch (_) {}
    document.title = title + " — Falakiyah NU Depok";

    const m = document.getElementById("artModal"); m.hidden = false; document.body.style.overflow = "hidden";
  }
  function closeModal() {
    const m = document.getElementById("artModal"); if (m) m.hidden = true; document.body.style.overflow = "";
    try { history.replaceState(null, "", location.origin + location.pathname); } catch (_) {}
    document.title = BASE_TITLE;
  }
  function toast(msg) {
    let t = document.getElementById("artToast");
    if (!t) { t = document.createElement("div"); t.id = "artToast"; t.className = "art-toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 1900);
  }

  function injectStyles() {
    const css =
      ".art-meta{margin-top:auto;padding-top:10px;font-size:.78rem;color:var(--faint)}" +
      ".art-open{transition:transform .18s ease,border-color .18s ease}" +
      ".art-modal{position:fixed;inset:0;z-index:200;background:rgba(8,16,25,.62);backdrop-filter:blur(3px);display:flex;align-items:flex-start;justify-content:center;padding:5vh 18px;overflow-y:auto}" +
      ".art-modal[hidden]{display:none}" +
      ".art-share{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}" +
      ".art-share__lbl{font-size:.82rem;font-weight:600;color:var(--muted);margin-right:2px}" +
      ".art-share__b{font-family:inherit;font-size:.82rem;font-weight:600;text-decoration:none;border:1px solid var(--line-strong);color:var(--ink);background:var(--surface-2);padding:.42rem .85rem;border-radius:999px;cursor:pointer;line-height:1;transition:border-color .15s,color .15s}" +
      ".art-share__b:hover{border-color:var(--accent);color:var(--accent)}" +
      ".art-share__b.wa:hover{border-color:#25d366;color:#1a9e4b}" +
      ".art-share__b.native{background:var(--accent);color:#fff;border-color:var(--accent)}" +
      ".art-share__b.native:hover{filter:brightness(1.08);color:#fff}" +
      ".art-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(18px);background:var(--ink);color:var(--bg);font-size:.85rem;font-weight:600;padding:.6rem 1.1rem;border-radius:10px;z-index:300;opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease}" +
      ".art-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}" +
      ".art-modal__box{background:var(--surface);color:var(--ink);max-width:680px;width:100%;border:1px solid var(--line);border-radius:16px;padding:32px 30px 36px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.35)}" +
      ".art-modal__close{position:absolute;top:14px;right:16px;width:38px;height:38px;border-radius:10px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font-size:1.4rem;line-height:1;cursor:pointer}" +
      ".art-modal__close:hover{border-color:var(--accent)}" +
      ".art-modal__box h2{font-family:'Fraunces',serif;font-size:1.7rem;margin:.5rem 0 .4rem;color:var(--ink)}" +
      ".art-modal__meta{font-size:.82rem;color:var(--faint);margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid var(--line)}" +
      ".art-modal__body{white-space:pre-wrap;line-height:1.75;color:var(--ink)}" +
      ".card__img{height:158px;background-size:cover;background-position:center}" +
      ".art-modal__img{width:100%;max-height:340px;object-fit:cover;border-radius:10px;margin-bottom:16px}";
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  }
})();
