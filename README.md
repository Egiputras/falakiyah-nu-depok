# Website Lembaga Falakiyah NU Kota Depok

Situs resmi **Lembaga Falakiyah Nahdlatul Ulama Kota Depok**: jadwal waktu sholat,
pengukuran arah kiblat, kalender Hijriyah, serta kabar hisab & rukyat — lengkap
dengan **running text** waktu sholat.

Situs ini **statis** (HTML + CSS + JavaScript murni, tanpa framework dan tanpa
backend). Semua perhitungan (waktu sholat, arah kiblat, tanggal Hijriyah, jam &
hitung mundur) berjalan di sisi browser, sehingga selalu ter-update tanpa server.

## Struktur folder

```
Falakiyah NU Depok/
├── public/                 ← folder yang di-serve Vercel (outputDirectory)
│   ├── index.html          ← seluruh halaman
│   └── assets/
│       ├── nu-logo.png     ← logo Nahdlatul Ulama
│       └── favicon.svg     ← ikon tab
├── package.json            ← metadata + skrip (build/dev)
├── vercel.json             ← konfigurasi Vercel (static, header keamanan, cache)
├── .gitignore
└── README.md
```

## Menjalankan secara lokal

Tidak butuh build. Buka `public/index.html` langsung di browser, atau jalankan
server statis kecil (butuh Node.js terpasang):

```bash
npm run dev
```

Lalu buka alamat yang ditampilkan (mis. `http://localhost:3000`).

## Deploy ke Vercel

Situs ini sudah siap deploy. Karena repo ini berisi beberapa proyek, deploy folder
ini sebagai **project Vercel tersendiri**.

### Cara 1 — Dashboard Vercel (paling mudah)

1. Push repo ke GitHub (lihat catatan di bawah).
2. Di [vercel.com](https://vercel.com) → **Add New → Project** → import repo-nya.
3. Pada **Root Directory**, pilih folder `Falakiyah NU Depok`.
4. Framework Preset: **Other** (terbaca otomatis dari `vercel.json`).
5. **Deploy**. Selesai — Vercel menyajikan isi `public/`.

### Cara 2 — Vercel CLI

Dari dalam folder ini:

```bash
npx vercel --prod
```

Saat ditanya, set **Root Directory** ke `.` (folder ini) dan ikuti prompt.

## Konfigurasi build

| Item | Nilai |
|------|-------|
| Framework | Other / none (`framework: null`) |
| Build Command | `echo "Static site - no build step required."` |
| Output Directory | `public` |
| Install Command | — (tidak ada dependency) |

Tidak ada dependency pihak ketiga, jadi tidak ada `node_modules` yang perlu
di-install dan tidak ada langkah build yang bisa gagal.

## Catatan teknis

- **Waktu sholat** memakai metode **Kementerian Agama RI** (Subuh 20°, Isya 18°,
  faktor Ashar mazhab Syafi'i, ihtiyati +2 menit) untuk koordinat Kota Depok
  (−6.4025, 106.7942; 121 mdpl). Algoritma astronomis dihitung di browser.
- **Tanggal Hijriyah** memakai `Intl.DateTimeFormat` kalender `islamic-umalqura`.
- **Arah kiblat** dihitung dari koordinat Depok ke Ka'bah (azimuth ± 295°).
- **Font** (Fraunces, Plus Jakarta Sans, Amiri, JetBrains Mono) dimuat dari
  Google Fonts. Butuh koneksi internet; jika ingin sepenuhnya offline, font bisa
  di-self-host di `assets/`.

> Waktu sholat bersifat perkiraan hisab. Untuk pelaksanaan ibadah, tetap rujuk
> azan/jadwal resmi setempat.
