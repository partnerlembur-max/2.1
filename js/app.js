(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
const tamu = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 60);

let D, timer, opened = false, bound = false, tk = 0, gs = [], gi = 0, wishes = [], shown = 6, resume = false;

/* ───────── util ───────── */
const img = (s, alt = '', eager = 0) => s ? `<img src="${esc(s)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onerror="this.removeAttribute('src')">` : '';
const IC = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/>',
  couple: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14.2c2.6.2 4.5 2.4 4.5 5.1"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.5 7.5 8.5 6 8.5-6"/>',
  gift: '<rect x="3.5" y="9" width="17" height="11" rx="1.5"/><path d="M12 9v11M3 9h18"/><path d="M12 9C9 9 7.5 7.5 8 6s3-1.2 4 3c1-4.2 3.5-4.5 4-3s-1 3-4 3z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  save: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/>',
  live: '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="m16 10.5 5-3v9l-5-3z"/>'
};
const svg = (k, w = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
const MU = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect class="bar" x="5" y="6" width="3" height="12" rx="1.5"/><rect class="bar" x="10.5" y="3" width="3" height="18" rx="1.5"/><rect class="bar" x="16" y="8" width="3" height="8" rx="1.5"/><path class="slash" d="M4 4l16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

const copy = async t => {
  try { await navigator.clipboard.writeText(t); return true; } catch {
    const a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch {} a.remove(); return ok;
  }
};
const ago = t => {
  const d = new Date(t); if (isNaN(d)) return '';
  const s = (Date.now() - d) / 1e3, r = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
  if (s < 60) return 'baru saja';
  if (s < 3600) return r.format(-Math.floor(s / 60), 'minute');
  if (s < 86400) return r.format(-Math.floor(s / 3600), 'hour');
  if (s < 2592000) return r.format(-Math.floor(s / 86400), 'day');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* ───────── tema & font ───────── */
const FW = { 'Cinzel': 'wght@400;600', 'Cormorant Garamond': 'ital,wght@0,400;0,600;1,400', 'Montserrat': 'wght@300;400;600', 'Playfair Display': 'ital,wght@0,400;0,600;1,400', 'Fraunces': 'ital,wght@0,400;0,600;1,400', 'Lora': 'ital,wght@0,400;0,600;1,400' };
const fontsDone = new Set(['Bodoni Moda', 'Plus Jakarta Sans', 'Reenie Beanie', 'DSEG7']);
function loadFonts() {
  [D.fontScript, D.fontSerif, D.fontTulis].map(s => (String(s || '').match(/'([^']+)'/) || [])[1]).filter(f => f && !fontsDone.has(f)).forEach(f => {
    fontsDone.add(f);
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + f.replace(/ /g, '+') + (FW[f] ? ':' + FW[f] : '') + '&display=swap';
    document.head.appendChild(l);
  });
}
function theme() {
  const r = document.documentElement.style, set = (k, v) => v ? r.setProperty(k, v) : r.removeProperty(k);
  set('--ink', D.warna); set('--paper', D.warnaBg); set('--accent', D.warnaAksen); set('--accent-2', D.warnaAksen2);
  set('--card', D.warnaCard); set('--display', D.fontScript); set('--body', D.fontSerif); set('--hand', D.fontTulis);
  set('--dark', D.warnaDark);
  const th = $('meta[name=theme-color]'); if (th && D.warnaBg) th.content = D.warnaBg;
}

/* ───────── templat ───────── */
const names = (W, P, cls = '') => `<span class="a">${W}</span><span class="b"><i>&amp;</i>${P}</span>`;
const stampText = () => { const m = String(D.tanggalISO || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]} ${m[2]} ${m[1].slice(2)}` : ''; };

function storyHTML() {
  const K = (D.kisah || []).filter(k => k && (k.teks || k.judul));
  if (!K.length) return '';
  const ch = (k, i) => `<article class="ch"><h3 class="ch-t">${esc(k.judul)}</h3>
    ${k.foto ? `<button class="ch-ph" data-i="${i}" style="--pos:${esc(k.posisi || '50% 50%')}" aria-label="Perbesar foto: ${esc(k.judul)}"><figure class="print ${k.polos ? 'raw' : ''} dev">${img(k.foto, k.judul)}</figure></button>` : ''}
    <p class="ch-p">${String(k.teks || '').trim().split(/\s+/).map(w => `<span class="w">${esc(w)}</span>`).join(' ')}</p></article>`;
  return `<section class="story" id="kisah"><h2 class="hd">${esc(D.kisahJudul || 'Perjalanan kami')}</h2>${D.kisahSub ? `<p class="sub">${esc(D.kisahSub)}</p>` : ''}
    <div style="height:clamp(34px,9cqi,52px)"></div>
    ${K.map((k, i) => ch(k, i) + (i < K.length - 1 ? '<div class="tl-gap" aria-hidden="true"><i></i></div>' : '')).join('')}</section>`;
}

const okHex = c => /^#[0-9a-f]{3,8}$/i.test(String(c || ''));
function dressHTML() {
  const X = D.dresscode || {}, W = (X.warna || []).filter(w => w && okHex(w.hex));
  if (X.aktif === false || !W.length) return '';
  return `<div class="dress"><h3>${esc(X.judul || 'Dress code')}</h3>${X.teks ? `<p>${esc(X.teks)}</p>` : ''}
    <div class="chips" role="list">${W.map(w => `<div class="chip" role="listitem"><i style="background:${esc(w.hex)}"></i>${esc(w.nama)}</div>`).join('')}</div></div>`;
}

function formHTML(v = {}) {
  const R = D.rsvp || {}, on = R.aktif !== false, max = Math.min(10, Math.max(1, R.maksTamu || 4)), A = D.acara || [], j = Math.min(max, Math.max(1, +v.j || 1));
  const tdk = v.h === 'Tidak hadir';
  return `<form id="fr" novalidate>
    <p class="hp" aria-hidden="true"><label>Situs web<input name="web" tabindex="-1" autocomplete="off"></label></p>
    <div class="fld"><label for="f-n">Nama</label><input class="in" id="f-n" name="n" autocomplete="name" maxlength="60" value="${esc(v.n ?? tamu)}" required></div>
    ${on ? `<fieldset class="fld"><legend>Apakah Anda akan hadir?</legend><div class="seg">
        <label><input type="radio" name="h" value="Hadir" ${tdk ? '' : 'checked'}><span>Insya Allah hadir</span></label>
        <label><input type="radio" name="h" value="Tidak hadir" ${tdk ? 'checked' : ''}><span>Mohon maaf, berhalangan</span></label></div></fieldset>
      <div id="hadir-only" style="display:grid;gap:20px" ${tdk ? 'hidden' : ''}>
        ${A.length > 1 ? `<fieldset class="fld"><legend>Acara yang akan dihadiri</legend><div class="opts">
          ${['Semua acara', ...A.map(a => a.nama)].map((n, i) => `<label class="opt"><input type="radio" name="a" value="${esc(n)}" ${(v.a ? v.a === n : i === 0) ? 'checked' : ''}><span>${esc(n)}</span></label>`).join('')}</div></fieldset>` : ''}
        <div class="fld"><span id="jl" style="font-size:13.5px;font-weight:600">Jumlah tamu, termasuk Anda</span>
          <div class="step" role="group" aria-labelledby="jl"><button type="button" id="jm" aria-label="Kurangi jumlah tamu">−</button><output id="jv" aria-live="polite">${j}</output><button type="button" id="jp" aria-label="Tambah jumlah tamu">+</button></div>
          <input type="hidden" name="j" value="${j}"></div>
      </div>` : ''}
    <div class="fld"><label for="f-u">Ucapan &amp; doa${on ? ' <span class="mute" style="font-weight:400">(boleh dikosongkan)</span>' : ''}</label><textarea class="in" id="f-u" name="u" rows="3" maxlength="500" placeholder="Tulis ucapan dan doa untuk kedua mempelai">${esc(v.u || '')}</textarea></div>
    <button class="btn" id="kirim" type="submit">${on ? 'Kirim konfirmasi' : 'Kirim ucapan'}</button>
    <p class="status" id="st" role="status" aria-live="polite"></p></form>`;
}

function render(data) {
  D = data;
  document.title = D.judul || 'Undangan Pernikahan';
  theme(); loadFonts();
  const W = esc(D.wanita.panggilan), P = esc(D.pria.panggilan), T = esc(D.tanggalTeks), L = D.lokasi || {};
  const C = { judul: 'Undangan pernikahan', sub: '', tombol: 'Buka undangan', ...D.cover };
  const R = D.rsvp || {}, S = D.streaming || {}, gal = D.fotoGaleri || [], heroFoto = D.fotoHero || gal[0] || D.fotoUtama;
  const to = tamu || 'Bapak/Ibu/Saudara/i';
  const dock = [['beranda', 'Beranda', 'home'], ['mempelai', 'Mempelai', 'couple'], ['acara', 'Acara', 'cal'], ['rsvp', 'RSVP', 'mail'], ['hadiah', 'Hadiah', 'gift']];

  $('#app').innerHTML = `
  <aside class="side" aria-hidden="true"><div class="side-in"><div class="side-wrap"><p class="names">${names(W, P)}</p><p class="side-date">${T}</p></div>
    <figure class="print raw">${img(D.fotoUtama)}</figure></div></aside>

  <div class="col"><main>
    <section class="hero" id="beranda">
      <h1 class="names">${names(W, P)}</h1>
      <figure class="print ${D.fotoHeroBingkai ? '' : 'raw'} hero-print dev">${img(heroFoto, `${D.wanita.panggilan} dan ${D.pria.panggilan}`, 1)}<span class="stamp" aria-hidden="true">${stampText()}</span></figure>
      <p class="hero-date">${T}</p>
      <p class="hero-loc">${esc(L.nama)}</p>
    </section>

    <section class="salam" id="salam">
      ${D.salamPembuka ? `<p class="ass">${esc(D.salamPembuka)}</p>` : ''}
      <p>${esc(D.salam)}</p>
      ${D.cerita ? `<p class="cerita">${esc(D.cerita)}</p>` : ''}
    </section>

    ${D.ayat && D.ayat.teks ? `<section class="dark ayat"><div class="rule"></div><blockquote><p>“${esc(D.ayat.teks)}”</p><cite>${esc(D.ayat.sumber)}</cite></blockquote></section>` : ''}

    <section id="mempelai">
      <h2 class="hd">Mempelai</h2>
      <div class="pair"><div class="arch">${img(D.fotoWanita, D.wanita.lengkap)}</div>
        <div class="who"><p class="role">Mempelai wanita</p><h3>${esc(D.wanita.lengkap)}</h3><p>${esc(D.wanita.orangtua)}</p></div></div>
      <div class="pair flip"><div class="arch">${img(D.fotoPria, D.pria.lengkap)}</div>
        <div class="who"><p class="role">Mempelai pria</p><h3>${esc(D.pria.lengkap)}</h3><p>${esc(D.pria.orangtua)}</p></div></div>
    </section>

    ${storyHTML()}

    <section class="tint" id="acara">
      <h2 class="hd">Waktu &amp; tempat</h2>
      <p class="sub">${T}</p>
      <div class="cd" role="timer" aria-label="Hitung mundur menuju hari pernikahan">
        <div><b id="cd-d">00</b>hari</div><div><b id="cd-h">00</b>jam</div><div><b id="cd-m">00</b>menit</div><div><b id="cd-s">00</b>detik</div></div>
      <ul class="agenda">${(D.acara || []).map(a => `<li><b>${esc(a.nama)}</b><span>${esc(a.waktu)}</span></li>`).join('')}</ul>
      <div class="venue"><h3>${esc(L.nama)}</h3><p>${esc(L.alamat)}</p>
        <div class="acts"><a class="btn" href="${esc(L.maps)}" target="_blank" rel="noopener">${svg('pin', 1.9)}Buka di Google Maps</a>
          <button class="btn line" id="cal" type="button">${svg('save', 1.9)}Simpan ke kalender</button>
          ${S.url ? `<a class="btn line" href="${esc(S.url)}" target="_blank" rel="noopener">${svg('live', 1.9)}${esc(S.teks || 'Tonton siaran langsung')}</a>` : ''}</div></div>
      ${dressHTML()}
    </section>

    ${gal.length ? `<section class="galeri" id="galeri"><div class="head"><h2 class="hd">Momen kami</h2></div>
      <div class="strip" role="list" aria-label="Galeri foto">${gal.map((f, i) => `<button class="g" role="listitem" data-i="${i}" aria-label="Perbesar foto ${i + 1}">${img(f)}</button>`).join('')}</div>
      <p class="hint">Geser untuk melihat foto lainnya.</p></section>` : ''}

    <section class="tint rsvp" id="rsvp">
      <h2 class="hd">${R.aktif === false ? 'Ucapan &amp; doa' : 'Konfirmasi kehadiran'}</h2>
      ${R.batas && R.aktif !== false ? `<p class="sub">${esc(R.batas)}</p>` : ''}
      <div id="rsvp-box"></div>
      <div class="wishes"><h3>Ucapan &amp; doa</h3><div id="ws"></div></div>
    </section>

    <section id="hadiah">
      <h2 class="hd">Tanda kasih</h2>
      <p class="sub">Doa restu Anda adalah hadiah terbaik bagi kami. Bila ingin memberi tanda kasih, dapat melalui:</p>
      ${(D.hadiah || []).map(h => `<div class="bank"><b>${esc(h.bank)}</b><button type="button" data-c="${esc(h.norek)}">Salin nomor</button><div class="no">${esc(h.norek)}</div><div class="an">a.n. ${esc(h.atasNama)}</div></div>`).join('')}
      ${D.alamatKado ? `<div class="kado"><p>Kado fisik dapat dikirim ke:</p><b>${esc(D.alamatKado)}</b><button type="button" class="btn line" data-c="${esc(D.alamatKado)}">Salin alamat</button></div>` : ''}
    </section>

    <section class="dark tutup">
      <p>${esc(D.penutup)}</p><p class="dari mute">Kami yang berbahagia,</p><p class="nm">${W} <i>&amp;</i> ${P}</p>
      ${D.kredit && D.kredit.teks ? `<p class="kredit">${D.kredit.url ? `<a href="${esc(D.kredit.url)}" target="_blank" rel="noopener">${esc(D.kredit.teks)}</a>` : esc(D.kredit.teks)}</p>` : ''}
    </section>
  </main></div>

  <nav id="dock" aria-label="Navigasi undangan">${dock.map(([id, t, ic]) => `<a href="#${id}" data-s="${id}">${svg(ic)}<span>${t}</span></a>`).join('')}</nav>

  <div id="cover" class="${opened ? 'open nt' : ''}" role="dialog" aria-modal="true" aria-label="Sampul undangan" ${opened ? 'inert' : ''}>
    <div class="cv-in">
      <p class="cv-k">${esc(C.judul)}</p>
      <figure class="print raw cv-print">${img(D.fotoUtama, '', 1)}<div class="to"><span>untuk ${esc(to)}</span></div></figure>
      <div class="cv-txt">
        <p class="cv-names">${W} <i>&amp;</i> ${P}</p>
        <p class="cv-date">${T}</p>
        <button class="btn" id="buka" type="button">${esc(C.tombol)}</button>
        <p class="cv-hint" aria-hidden="true">atau geser ke atas</p>
      </div>
    </div>
  </div>

  <div id="lb" hidden role="dialog" aria-modal="true" aria-label="Foto"><img alt=""><button id="lbx" aria-label="Tutup">✕</button><button id="lbp" aria-label="Sebelumnya">‹</button><button id="lbn" aria-label="Berikutnya">›</button></div>`;

  if (opened) { document.body.classList.remove('lock'); document.body.classList.add('opened'); }
  wire();
}

/* ───────── perilaku ───────── */
function play() {
  const au = $('#au'), mu = $('#mu');
  if (!au.getAttribute('src')) return;
  au.play().then(() => setMu(true)).catch(() => setMu(false));
  mu.hidden = false;
}
function setMu(on) { const mu = $('#mu'); mu.classList.toggle('playing', on); mu.setAttribute('aria-pressed', on); }

function buka() {
  const c = $('#cover'); if (!c || c.classList.contains('open')) return;
  opened = true; c.style.transform = '';
  c.classList.add('open'); c.inert = true;
  document.body.classList.remove('lock'); document.body.classList.add('opened');
  scrollTo(0, 0); startParticles(D.animasi); play();
  setTimeout(upd, rm ? 0 : 750);
}

function wire() {
  const au = $('#au'), mu = $('#mu');
  const src = D.musik || '';
  if (au.getAttribute('src') !== src) { if (src) au.src = src; else au.removeAttribute('src'); }
  au.onerror = () => { mu.hidden = true; };
  mu.innerHTML = MU; mu.hidden = !src; setMu(!au.paused && !!src);
  mu.onclick = () => {
    if (au.paused) au.play().then(() => setMu(true)).catch(() => {});
    else { au.pause(); setMu(false); }
  };

  $('#buka').onclick = buka;
  const c = $('#cover'); let y0 = null, dy = 0;
  c.onpointerdown = e => { if (e.target.closest('button')) return; y0 = e.clientY; dy = 0; c.style.transition = 'none'; c.setPointerCapture(e.pointerId); };
  c.onpointermove = e => { if (y0 == null) return; dy = Math.min(0, e.clientY - y0); if (dy < -12) c.style.transform = `translateY(${dy}px)`; };
  c.onpointerup = c.onpointercancel = () => {
    if (y0 == null) return; y0 = null; c.style.transition = ''; c.style.transform = '';
    if (dy < -110) buka();
  };
  c.onwheel = e => { if (e.deltaY > 60) buka(); };

  $$('[data-c]').forEach(b => b.onclick = async () => {
    const old = b.textContent, ok = await copy(b.dataset.c);
    b.textContent = ok ? 'Tersalin' : 'Gagal menyalin'; b.classList.toggle('ok', ok);
    setTimeout(() => { b.textContent = old; b.classList.remove('ok'); }, 2200);
  });
  $('#cal').onclick = saveCal;

  /* hitung mundur */
  clearInterval(timer);
  const t = new Date(D.tanggalISO).getTime(), p = n => String(Math.floor(n)).padStart(2, '0');
  const tick = () => {
    if (document.hidden) return;
    const left = t - Date.now();
    if (!(left > 0)) { const cd = $('.cd'); if (cd) cd.outerHTML = '<p class="cd-done">Hari bahagia telah tiba</p>'; clearInterval(timer); return; }
    const d = left / 1000;
    [['d', d / 86400], ['h', d % 86400 / 3600], ['m', d % 3600 / 60], ['s', d % 60]].forEach(([i, v]) => { const e = $('#cd-' + i); if (e) e.textContent = p(v); });
  };
  if (!isNaN(t)) { tick(); timer = setInterval(tick, 1000); } else { const cd = $('.cd'); if (cd) cd.remove(); }

  /* galeri & lightbox */
  const lb = $('#lb');
  const L = i => { gi = (i + gs.length) % gs.length; $('#lb img').src = gs[gi]; };
  const show = (list, i) => { gs = list; L(i); lb.hidden = false; $('#lbx').focus(); };
  $$('.g').forEach(b => b.onclick = () => show(D.fotoGaleri || [], +b.dataset.i));
  const K = (D.kisah || []).filter(k => k && (k.teks || k.judul));
  $$('.ch-ph').forEach(b => b.onclick = () => show(K.map(k => k.foto || ''), +b.dataset.i));
  $('#lbx').onclick = () => { lb.hidden = true; };
  $('#lbp').onclick = () => L(gi - 1); $('#lbn').onclick = () => L(gi + 1);
  let lx; lb.onclick = e => { if (e.target === lb) lb.hidden = true; };
  lb.onpointerdown = e => { lx = e.clientX; };
  lb.onpointerup = e => { const d = e.clientX - lx; if (Math.abs(d) > 50) L(gi + (d < 0 ? 1 : -1)); };

  rsvpInit();

  if (!bound) {
    bound = true;
    const sched = () => { tk || (tk = requestAnimationFrame(upd)); };
    addEventListener('scroll', sched, { passive: true }); addEventListener('resize', sched);
    addEventListener('keydown', e => {
      const lb = $('#lb'); if (!lb || lb.hidden) return;
      if (e.key === 'Escape') lb.hidden = true;
      if (e.key === 'ArrowRight') L(gi + 1);
      if (e.key === 'ArrowLeft') L(gi - 1);
    });
    document.addEventListener('visibilitychange', () => {
      const au = $('#au');
      if (document.hidden) { if (!au.paused) { au.pause(); resume = true; setMu(false); } }
      else if (resume) { resume = false; au.play().then(() => setMu(true)).catch(() => {}); }
    });
  }
  upd();
}

/* ───────── efek scroll ───────── */
const IDS = ['beranda', 'mempelai', 'acara', 'rsvp', 'hadiah'];
function upd() {
  tk = 0;
  const vh = innerHeight;
  $$('.tl-gap').forEach(g => { const r = g.getBoundingClientRect(), f = Math.min(1, Math.max(0, (vh * .82 - r.top) / r.height)); g.style.setProperty('--f', f.toFixed(3)); g.classList.toggle('full', f >= .98); });
  $$('.ch-p').forEach(p => {
    const r = p.getBoundingClientRect(), n = p.children.length, f = r.bottom < 0 ? 1 : Math.min(1, Math.max(0, (vh * .9 - r.top) / (r.height + vh * .2))), k = Math.round(f * n);
    if (p._k === k) return; p._k = k; for (let i = 0; i < n; i++) p.children[i].classList.toggle('lit', i < k);
  });
  if (opened) $$('.dev:not(.go)').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < vh * .88 && r.bottom > 0) el.classList.add('go'); });
  let cur = IDS[0];
  IDS.forEach(id => { const e = document.getElementById(id); if (e && e.getBoundingClientRect().top <= vh * .45) cur = id; });
  $$('#dock a').forEach(a => a.setAttribute('aria-current', a.dataset.s === cur));
}

/* ───────── partikel ───────── */
function startParticles(cfg) {
  const old = $('#particles'); if (old) old.remove();
  if (rm) return;
  const type = cfg && cfg.jenis || 'none'; if (type === 'none') return;
  const n = cfg.jumlah || 14, base = cfg.durasi || 8, p = document.createElement('div');
  p.id = 'particles'; p.setAttribute('aria-hidden', 'true'); document.body.appendChild(p);
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'particle-item ' + type; s.style.left = Math.random() * 100 + 'vw';
    s.style.animationDuration = (base * .7 + Math.random() * base * .6) + 's'; s.style.animationDelay = Math.random() * 5 + 's';
    if (type === 'hearts') { s.textContent = '♡'; s.style.fontSize = (12 + Math.random() * 14) + 'px'; }
    else if (type === 'sparkles') { s.textContent = '✦'; s.style.fontSize = (10 + Math.random() * 12) + 'px'; }
    else if (type === 'confetti') { s.style.width = (6 + Math.random() * 6) + 'px'; s.style.height = (10 + Math.random() * 10) + 'px'; s.style.background = ['var(--accent)', 'var(--accent-2)', '#e8d7b8', 'var(--ink)'][i % 4]; }
    else { s.style.width = (10 + Math.random() * 10) + 'px'; s.style.height = (14 + Math.random() * 12) + 'px'; }
    p.appendChild(s);
  }
}

/* ───────── simpan ke kalender (.ics) ───────── */
function saveCal() {
  const s = new Date(D.tanggalISO); if (isNaN(s)) return;
  const e = new Date(s.getTime() + 4 * 36e5), f = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''), x = v => String(v || '').replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n');
  const L = D.lokasi || {}, ttl = `Pernikahan ${D.wanita.panggilan} & ${D.pria.panggilan}`;
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Undangan Digital//ID', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${f(s)}-${Math.random().toString(36).slice(2)}@undangan`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(s)}`, `DTEND:${f(e)}`,
    `SUMMARY:${x(ttl)}`, `LOCATION:${x([L.nama, L.alamat].filter(Boolean).join(', '))}`, `DESCRIPTION:${x((D.acara || []).map(a => `${a.nama}: ${a.waktu}`).join('\n'))}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${x('Besok: ' + ttl)}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' })); a.download = 'pernikahan.ics';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* ───────── RSVP & ucapan ───────── */
const key = () => 'rsvp_' + D.judul, wkey = () => 'ucapan_' + D.judul;
const ls = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

function rsvpInit() {
  const prev = ls.get(key(), null);
  prev ? showDone(prev) : showForm();
  loadWishes();
}
function setSt(m, err) { const e = $('#st'); if (!e) return; e.textContent = m; e.classList.toggle('err', !!err); }

function showForm(v) {
  $('#rsvp-box').innerHTML = formHTML(v);
  const fm = $('#fr'), max = Math.min(10, Math.max(1, (D.rsvp || {}).maksTamu || 4));
  const jm = $('#jm'), jp = $('#jp'), jv = $('#jv');
  if (jm) {
    const set = n => { n = Math.min(max, Math.max(1, n)); jv.textContent = n; fm.j.value = n; jm.disabled = n <= 1; jp.disabled = n >= max; };
    jm.onclick = () => set(+jv.textContent - 1); jp.onclick = () => set(+jv.textContent + 1); set(+jv.textContent);
  }
  $$('input[name=h]', fm).forEach(r => r.onchange = () => { $('#hadir-only').hidden = fm.h.value !== 'Hadir'; });
  fm.onsubmit = kirim;
}

function showDone(f) {
  const hadir = f.h === 'Hadir';
  const msg = !(D.rsvp && D.rsvp.aktif !== false) ? 'Ucapan dan doa Anda sudah kami terima.' :
    hadir ? `Kehadiran Anda tercatat: ${f.j} orang${f.a ? ', ' + f.a : ''}. Sampai jumpa di hari bahagia kami.` : 'Terima kasih sudah memberi kabar. Doa Anda sangat berarti bagi kami.';
  $('#rsvp-box').innerHTML = `<div class="done" role="status"><h3>Terima kasih, ${esc(f.n)}</h3><p>${esc(f.wa ? 'Pesan konfirmasi sudah dibuka di WhatsApp. Tekan Kirim di sana agar sampai kepada kami.' : msg)}</p><button class="btn line" id="ubah" type="button">${D.rsvp && D.rsvp.aktif === false ? 'Kirim ucapan lain' : 'Ubah konfirmasi'}</button></div>`;
  $('#ubah').onclick = () => { showForm({ ...f, u: '' }); $('#f-n').focus(); };
}

const waUrl = f => {
  const W = D.wanita.panggilan, P = D.pria.panggilan;
  const isi = f.h === 'Hadir' ? `insya Allah hadir (${f.j} orang${f.a ? ', ' + f.a : ''})` : f.h === 'Tidak hadir' ? 'mohon maaf belum bisa hadir' : 'ingin menyampaikan ucapan';
  return `https://wa.me/${String(D.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Assalamu’alaikum, saya ${f.n} ${isi} di pernikahan ${W} & ${P}.${f.u ? '\n\n' + f.u : ''}`)}`;
};

async function kirim(e) {
  e.preventDefault();
  const fm = e.target, btn = $('#kirim'), f = Object.fromEntries(new FormData(fm)), on = (D.rsvp || {}).aktif !== false, U = (D.backend || {}).url;
  if (f.web) return;                                   // jebakan bot: kolom tersembunyi terisi
  delete f.web; f.n = (f.n || '').trim(); f.u = (f.u || '').trim();
  if (!f.n) { setSt('Isi nama Anda terlebih dahulu.', 1); fm.n.focus(); return; }
  if (on) { if (f.h !== 'Hadir') { f.j = '0'; f.a = ''; } }
  else { if (!f.u) { setSt('Tulis ucapan Anda terlebih dahulu.', 1); $('#f-u').focus(); return; } f.h = ''; f.j = ''; f.a = 'Ucapan & Doa'; }

  const done = extra => {
    const rec = { ...f, ...extra };
    if (on) ls.set(key(), rec);
    if (f.u) { wishes.unshift({ n: f.n, h: f.h, u: f.u, t: new Date().toISOString() }); if (!U) ls.set(wkey(), wishes.slice(0, 50)); shown = Math.max(shown, 6); drawWishes(); }
    showDone(rec);
  };

  if (!U) {                                            // tanpa backend: kirim lewat WhatsApp
    if (!String(D.whatsapp || '').replace(/\D/g, '')) { setSt('Pengiriman belum dapat dilakukan karena nomor WhatsApp belum diisi.', 1); return; }
    window.open(waUrl(f), '_blank', 'noopener'); done({ wa: true }); return;
  }
  btn.disabled = true; setSt('Mengirim…');
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await (await fetch(U, { method: 'POST', body: new URLSearchParams(f), signal: ctl.signal })).json();
    if (!r.ok) throw new Error(r.error || 'gagal');
    done({});
  } catch (x) {
    setSt(x && x.message && x.message !== 'gagal' && x.name !== 'AbortError' && x.name !== 'TypeError' ? x.message : 'Konfirmasi belum terkirim. Periksa koneksi internet Anda, lalu coba lagi.', 1);
    btn.disabled = false;
  } finally { clearTimeout(to); }
}

async function loadWishes() {
  const U = (D.backend || {}).url;
  if (!U) { wishes = ls.get(wkey(), []).filter(w => w.u); return drawWishes(); }
  try { const r = await (await fetch(U + '?aksi=ucapan')).json(); wishes = (r.data || []).filter(w => w.u); }
  catch { wishes = []; }
  drawWishes();
}
function drawWishes() {
  const ws = $('#ws'); if (!ws) return;
  if (!wishes.length) { ws.innerHTML = '<p class="none">Belum ada ucapan. Jadilah yang pertama mendoakan kami.</p>'; return; }
  ws.innerHTML = wishes.slice(0, shown).map(w => `<article class="wish"><header><b>${esc(w.n)}</b>${w.h ? `<span class="st ${w.h === 'Hadir' ? '' : 'no'}">${w.h === 'Hadir' ? 'Hadir' : 'Berhalangan hadir'}</span>` : ''}<time>${esc(ago(w.t))}</time></header><p>${esc(w.u)}</p></article>`).join('')
    + (wishes.length > shown ? `<button class="btn line more" id="more" type="button">Lihat ${Math.min(6, wishes.length - shown)} ucapan lagi</button>` : '');
  const m = $('#more'); if (m) m.onclick = () => { shown += 6; drawWishes(); };
}

/* ───────── mulai ───────── */
render(window.DATA);

/* dipakai editor.html untuk pratinjau langsung */
addEventListener('message', e => {
  if (e.data && e.data.type === 'data') {
    const y = scrollY; window.DATA = e.data.data; render(e.data.data);
    if (opened) { scrollTo(0, y); setTimeout(() => $('#cover') && $('#cover').classList.remove('nt'), 50); }
  }
});
})();
