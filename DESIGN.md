# Desain: Undangan Nadia & Raka

Arah: **album foto analog**. Undangan terasa seperti cetakan foto yang baru "dicuci", bukan template emas-krem.
Semua pilihan visual diambil dari foto pasangan sendiri (busana, tirai studio, cap tanggal film), jadi tidak bisa dipakai ulang untuk undangan lain tanpa terasa janggal.

## Warna (bisa diganti dari editor; turunan dihitung otomatis)
| Peran | Nilai | Asal |
|---|---|---|
| Aksen utama (tombol, judul, latar gelap) | `#6b1d2b` marun | hijab |
| Aksen kedua (blok info, ampersand) | `#a9c0da` biru debu | kemeja |
| Kertas | `#edeeec` abu dingin | tirai studio |
| Teks | `#2a161b` | marun tua, bukan hitam murni |
| Kartu & kolom isian | `#f8f7f4` | |
| Cap tanggal | `#ff8a2a` | tanggal oranye pada foto film |

## Tipografi
- **Bodoni Moda** (judul, nama, angka): kontras tinggi ala majalah mode. Sumbu `opsz` diturunkan di judul kecil (26) supaya garis tipis tidak hilang di layar 1x.
- **Plus Jakarta Sans** (isi, formulir, tombol): jelas di HP, mendukung bahasa Indonesia penuh.
- **Reenie Beanie** hanya untuk tulisan tangan nama tamu di cetakan foto cover.
- **DSEG7** hanya untuk cap tanggal pada foto.
Semua font di-host lokal (`assets/fonts/`): tidak ada permintaan ke Google Fonts, tidak ada loncatan tata letak.

## Elemen penanda
1. **Cetakan foto polaroid**: cover, hero, Our Story, galeri. Foto "mencuci" dari pucat-buram ke jernih saat muncul.
2. **Mempelai dalam lengkung**: foto paspor (latar merah dan biru) disatukan jadi duotone dari warna aksen lewat CSS, jadi foto apa pun yang diunggah pelanggan tetap serasi.
3. **Dress code dari busana pasangan**: tiga lengkung warna (marun, biru debu, camel).

## Aturan
- Satu momen gerak: foto "dicuci" dan cover terangkat. Selain itu gerak hanya menjawab aksi tamu (buka, geser, kirim).
- Tidak ada label kecil di atas judul, tidak ada nomor urut kecuali memang urutan.
- Teks utama 15–16 px, baris ≤ 36 karakter, target sentuh ≥ 48 px.
