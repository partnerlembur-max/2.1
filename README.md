# Undangan Digital (varian v3: album foto analog)

- `data/data.js`  → semua isi undangan (nama, tanggal, tempat, rekening, dress code, dll.)
- `editor.html`   → ubah semuanya lewat form dengan pratinjau HP / HP landscape / tablet / PC. Tekan **Simpan data.js** lalu timpa `data/data.js`. Jangan ikut dipublikasikan.
- `assets/`       → foto, `og.jpg` (gambar preview WhatsApp 1200×630), `musik.mp3`, `fonts/`
- `admin.html`    → rekap RSVP untuk mempelai (butuh `ADMIN_KEY` dari Apps Script)
- `backend/apps-script.gs` → backend Google Sheets (lihat PANDUAN.md)
- `DESIGN.md`     → keputusan desain dan token warna/tipografi

Link per tamu: `index.html?to=Nama%20Tamu` (atau "Salin Semua Link Tamu" di tab **Tamu & Share**).

## Yang baru di v3
- Konfirmasi kehadiran sungguhan: hadir / tidak hadir, acara yang dihadiri, jumlah tamu, ucapan. Tanpa backend, otomatis dikirim lewat WhatsApp.
- Tombol "Simpan ke kalender" (.ics), salin rekening/alamat, siaran langsung (opsional), dress code (opsional).
- Tab **RSVP & Fitur** di editor; kolom **Preview Link di WhatsApp** di tab Tamu & Share.
- Font di-host lokal, `index.html` hasil ekspor editor mengikuti desain ini.

## Tips performa
- Foto: lebar maks 1400px, ≤ 250 KB per foto. Musik: mp3 ≤ 3 MB (dimuat setelah tamu menekan tombol buka).
- Hosting: GitHub Pages / Netlify / Cloudflare Pages (gratis, HTTPS).
- Memilih foto lewat editor menanam foto (base64) di data.js. Untuk foto besar, simpan di `assets/` lalu isi path-nya.
