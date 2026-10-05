# LKPD Interaktif Bilangan Rasional Kelas VII

Package ini adalah versi penyesuaian media pembelajaran berdasarkan gambar LKPD yang Anda kirim.

## Penyesuaian utama
- Materi dan urutan kegiatan disesuaikan dengan 8 halaman pada gambar:
  1. Konsep bilangan rasional
  2. LKPD pertemuan 1
  3. Mengubah pecahan ke desimal dan sebaliknya
  4. LKPD pertemuan 2
  5. Letak bilangan rasional pada garis bilangan
  6. LKPD pertemuan 3
  7. Membandingkan dan mengurutkan bilangan rasional
  8. LKPD pertemuan 4
- Tampilan pecahan dibuat **vertikal/asli** menggunakan komponen `vfrac`, bukan garis miring.
- Pilihan kelas tersedia dari **VII A sampai VII G**.
- Tetap mendukung **offline-first** dan sinkronisasi ke **Google Apps Script + Google Sheet**.

## Struktur folder

```text
bilangan-rasional-mts-gorontalo-v2/
├── index.html
├── README.md
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── config.js
│       ├── api.js
│       └── app.js
└── gas/
    └── Code.gs
```

## Cara pakai lokal
Cukup buka `index.html` di browser.

## Menghubungkan ke Google Apps Script

### 1. Siapkan Spreadsheet
Buat spreadsheet baru.

### 2. Buat Apps Script
- Buka `https://script.google.com`
- Buat project baru
- Salin isi `gas/Code.gs`
- Isi nilai `SPREADSHEET_ID` dengan ID spreadsheet Anda

### 3. Inisialisasi sheet
Jalankan fungsi:

```javascript
setupSheets()
```

Sheet yang dibuat:
- `Students`
- `Progress`
- `WorksheetResults`

### 4. Deploy Web App
- Deploy → New deployment → Web app
- Execute as: **Me**
- Who has access: **Anyone** (atau opsi publik yang tersedia)
- Salin URL deployment yang berakhiran `/exec`

### 5. Pasang endpoint
Buka `assets/js/config.js`, lalu ganti:

```javascript
GAS_ENDPOINT: "https://script.google.com/macros/s/PASTE_YOUR_DEPLOYMENT_ID/exec"
```

dengan URL web app Anda.

## Catatan teknis
- Jika internet putus, data akan disimpan lokal lalu dikirim ulang saat online.
- Klik tombol **Sinkronkan** untuk memaksa flush antrean.
- Jawaban esai tetap tersimpan dan dikirim ke spreadsheet, tetapi penilaian kualitas jawabannya tetap dilakukan guru.
