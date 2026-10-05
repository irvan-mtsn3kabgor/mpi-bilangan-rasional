# MPI Bilangan Rasional - MTs Kelas VII

Paket front-end statis untuk GitHub Pages dengan backend Google Apps Script + Google Sheets.

## Struktur

```text
bilangan-rasional-mts-gorontalo/
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── config.js
│       ├── api.js
│       └── app.js
├── gas/
│   └── Code.gs
└── README.md
```

## Data yang disimpan

Aplikasi menyimpan data ke `localStorage` lebih dulu sehingga tetap dapat digunakan saat koneksi internet tidak stabil. Jika endpoint Google Apps Script aktif, data berikut dikirim ke Google Sheets:

- identitas murid: nama dan kelas
- modul terakhir/progres
- skor kuis formatif
- waktu pengiriman

Jika pengiriman gagal, request masuk antrean lokal dan dicoba kembali saat browser mendeteksi koneksi online.

## 1. Siapkan Google Sheet

1. Buat Google Spreadsheet baru.
2. Buka **Extensions > Apps Script**.
3. Salin isi `gas/Code.gs` ke editor Apps Script.
4. Simpan.
5. Jalankan fungsi `setupSheets()` sekali.
6. Beri izin yang diminta Google.

Tiga sheet akan dibuat otomatis:

- `Students`
- `Progress`
- `QuizResults`

## 2. Deploy Google Apps Script sebagai Web App

1. Di Apps Script pilih **Deploy > New deployment**.
2. Pilih tipe **Web app**.
3. `Execute as`: akun pemilik script.
4. Atur akses sesuai kebijakan madrasah/akun Google yang digunakan.
5. Deploy dan salin URL Web App yang berakhiran `/exec`.

> Jangan menggunakan URL editor Apps Script. Yang diperlukan aplikasi adalah URL deployment Web App `/exec`.

## 3. Hubungkan frontend ke Apps Script

Buka `assets/js/config.js` lalu isi:

```js
GAS_ENDPOINT: "https://script.google.com/macros/s/DEPLOYMENT_ID/exec"
```

Tidak perlu mengubah file lain.

## 4. Hosting di GitHub Pages

1. Buat repository GitHub baru.
2. Upload seluruh isi folder ini ke root repository.
3. Commit dan push.
4. Buka **Settings > Pages**.
5. Pilih deployment dari branch utama dan root folder.
6. Setelah Pages aktif, buka URL GitHub Pages yang diberikan GitHub.

Tidak ada proses build, npm, framework, atau CDN eksternal.

## Catatan keamanan penting

Google Apps Script Web App pada contoh ini menerima data dari front-end publik. Karena GitHub Pages adalah situs statis, jangan menaruh password, API secret, token privat, atau kredensial sensitif di `config.js`.

Jika aplikasi akan dipakai secara resmi dan menyimpan data murid dalam skala besar, sebaiknya tambahkan kontrol akses, kode kelas/session token, validasi input, kebijakan retensi data, dan persetujuan pengelolaan data sesuai aturan instansi.

## Pengembangan lanjutan

Struktur API sudah dipisahkan di `assets/js/api.js`, sehingga modul berikut dapat ditambahkan tanpa mengubah pola utama, misalnya:

- leaderboard kelompok
- rekap nilai per kelas
- resume progres ketika murid kembali membuka aplikasi
- dashboard guru
- bank soal dari Google Sheet
- pengaturan soal berdasarkan kelas atau pertemuan
