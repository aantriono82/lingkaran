# Simulasi Lingkaran SMP

Aplikasi belajar interaktif untuk Matematika SMP kelas 9 Kurikulum Merdeka. Siswa dapat menggeser titik, mengubah slider, lalu melihat nilai dan rumus berubah langsung. Semua teks, kode aplikasi, ikon, dan font KaTeX dibundel sehingga aplikasi dapat digunakan tanpa permintaan jaringan eksternal.

## Sepuluh topik

1. Unsur-unsur lingkaran
2. Keliling lingkaran
3. Luas lingkaran
4. Sudut pusat dan sudut keliling
5. Sudut antara dua tali busur
6. Segi empat tali busur
7. Lingkaran dalam segitiga
8. Lingkaran luar segitiga
9. Garis singgung lingkaran
10. Kedudukan dua lingkaran

Semua kartu topik aktif. Setiap topik mempunyai tab Eksplorasi, Konsep, Latihan, dan Kuis. Skor terbaik kuis disimpan per topik di `localStorage`.

## Menjalankan aplikasi

Prasyarat: Node.js 20 atau yang lebih baru.

```bash
npm install
npm run dev
```

Pemeriksaan produksi:

```bash
npm run check
npm run preview
```

`npm run check` menjalankan lint, seluruh tes, dan build produksi sebelum folder `dist/` disalin ke server. Jika ESLint belum tersedia di instalasi lokal, lihat bagian **Langkah untuk Bapak** pada `docs/perbaikan-teknis.md`.

Perintah manual yang setara:

```bash
npm run test
npm run build
```

`npm run build` menghasilkan folder `dist/`. Folder ini dapat diunggah ke hosting statis apa pun, termasuk subfolder, karena Vite memakai `base: './'` dan aplikasi memakai `HashRouter`. Tidak diperlukan aturan rewrite server.

Service worker dari `vite-plugin-pwa` mem-precache JavaScript, CSS, HTML, ikon, aset KaTeX, dan aset aplikasi hasil build. Setelah halaman dibuka sekali melalui `preview` atau hosting statis, aplikasi dapat dibuka kembali saat koneksi diputus.

Untuk deploy statis, gunakan header berikut agar service worker dan shell HTML selalu dapat mengambil versi terbaru. Aset berhash di `assets/` dapat diberi cache jangka panjang.

```text
/sw.js
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

Pada Nginx aturan tersebut dapat diterapkan dengan `location = /sw.js`, `location = /index.html`, dan `location /assets/`. Pada Caddy gunakan matcher path yang sama dengan `header` dan nilai header di atas. Path aktual harus mengikuti subfolder tempat `dist/` dipasang.

## Struktur penting

```text
src/
  components/              layout, kontrol, latihan, kuis
  components/svg/          Canvas, titik, lingkaran, segmen, busur, sudut
  lib/geometry/            fungsi geometri murni dan unit test
  lib/quiz/                RNG seed, generator soal, pengecekan jawaban
  topics/NN-nama/          module.tsx, Explore.tsx, concept.ts, generator.ts
  topics/registry.ts       penemu modul dan pengurutan berdasarkan nomor
public/                    ikon PWA lokal
```

## Menambah topik baru

1. Buat satu folder `src/topics/NN-nama/` dengan `module.tsx`, `Explore.tsx`, `concept.ts`, dan `generator.ts`.
2. Ekspor `topicModule` dari `module.tsx` dan isi metadata, konsep, generator, jenis soal, serta `describe`.
3. `src/topics/registry.ts`, `Home`, dan `TopicPage` menemukan modul lewat `import.meta.glob`; tidak perlu menambah daftar manual di ketiga berkas tersebut.
4. Tambahkan ID ke union `TopicId` dan `formulasByTopic` bila modul perlu dukungan static type atau rumus baru. Audit soal juga perlu diberi aturan bila jenis soal baru diperkenalkan.
5. Gunakan RNG seed dan simpan angka pembentuk soal di `data` agar jawaban dapat diuji secara independen. Generator lama yang ada di `lib/quiz/generator.ts` dipakai sebagai jalur kompatibilitas untuk 10 topik saat ini; generator topik baru sebaiknya didefinisikan langsung di folder modul.
6. Tambahkan fungsi geometri murni di `src/lib/geometry/` bila diperlukan, gunakan fungsi yang sudah ada bila cocok, dan tambahkan unit test untuk batas numeriknya.
7. Gunakan token warna di `src/styles.css`, area sentuh minimal 44 piksel, Pointer Events, serta parser jawaban numerik yang sudah tersedia.
8. Jalankan `npm run test` dan `npm run build`.

## Keputusan desain

- SVG memakai viewBox 700 × 430 agar diagram tetap jelas pada proyektor dan dapat mengecil sampai layar 360 piksel.
- Titik yang dapat digeser memiliki area sentuh 92 piksel dan memakai `setPointerCapture` serta `touch-action: none`.
- Perhitungan titik singgung, garis singgung persekutuan, titik potong, dan klasifikasi kedudukan mengembalikan nilai aman pada pusat berimpit, radius minimum, dan kondisi batas.
- Soal garis singgung memakai tripel Pythagoras agar akar kuadrat menghasilkan bilangan rapi. Soal kedudukan memakai kondisi batas yang terpisah jelas antara bersinggungan dan berada di dalam.
- Jalur navigasi topik membaca registry, sehingga tombol sebelumnya berhenti di topik 1 dan tombol berikutnya berhenti di topik 10.
