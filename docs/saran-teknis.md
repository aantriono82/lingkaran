# Saran Teknis — Simulasi Lingkaran SMP

Tanggal tinjauan: 10 Oktober 2026

Ruang lingkup: pembacaan kode, tes bawaan, build produksi, ukuran artefak, konfigurasi PWA, dan pemeriksaan statis. Audit kebenaran kunci jawaban tidak diulang; hasil `docs/audit-soal.md`, `docs/sampel-soal.md`, dan `docs/perbaikan-soal.md` dipakai sebagai konteks.

## 1. Ringkasan eksekutif

- Aplikasi sudah memiliki 10 topik aktif, empat mode belajar, geometri murni, generator seed, dan aset offline lokal.
- 98/98 tes bawaan lulus dan `npm run build` lulus; TypeScript memakai `strict: true`.
- Kekuatan utama: pemisahan dasar geometri, generator deterministik yang diaudit, dan dukungan PWA tanpa CDN aplikasi.
- Kekuatan lain: banyak kasus batas geometri sudah diuji dan alur kuis sudah melindungi perpindahan melalui tautan aplikasi.
- Risiko terbesar: drag melakukan `setState` pada setiap `pointermove`, tanpa pengaturan `requestAnimationFrame`.
- Risiko terbesar: konversi koordinat drag mengabaikan letterboxing `preserveAspectRatio`, sehingga posisi sentuh dapat bergeser pada viewport sempit atau tinggi.
- Risiko terbesar: `skipWaiting`/`clientsClaim` dapat mengganti versi saat kuis berjalan, sedangkan state kuis tidak dipersistenkan.
- Aksesibilitas SVG interaktif, maskable icon, perangkat nyata, instalasi PWA, dan pembaruan service worker masih memerlukan uji manual.

## 2. Hasil pengukuran

### Perintah yang dijalankan

| Perintah | Hasil terverifikasi |
|---|---|
| `npm run test` | Lulus: 11 berkas, 98 tes. Durasi Vitest 4,66 detik. |
| `npm run build` | Lulus: TypeScript, Vite, dan generate service worker. 106 modul ditransformasi; Vite melaporkan 4,14 detik, waktu proses shell 14,33 detik. |
| `npm audit --omit=dev --json` | Tidak menghasilkan laporan advisory karena request ke `registry.npmjs.org` gagal `ENOTFOUND`. Tidak boleh disimpulkan sebagai “0 kerentanan”. Tidak ada `npm install` atau `npm audit fix` dijalankan. |
| Versi paket terpasang | React 19.3.0, React Router DOM 7.18.4, KaTeX 0.18.1, TypeScript 5.9.3, Vite 7.3.7, Vitest 3.2.7, `vite-plugin-pwa` 1.3.0. |

### Ukuran artefak `dist/`

Build menghasilkan 71 file dengan total 1.812.117 byte atau sekitar 1,77 MiB. Workbox melaporkan 32 entri precache dengan total 954,12 KiB.

| Artefak | Ukuran mentah | Gzip yang dilaporkan |
|---|---:|---:|
| `assets/index-D1aHaCem.js` | 344,22 kB | 103,34 kB |
| `assets/katex-D6oIofZu.js` | 260,45 kB | 77,52 kB |
| `assets/index-C3oMB2_q.css` | 55,94 kB | 14,08 kB |
| `assets/react-PEQU33XK.js` | 49,63 kB | 17,54 kB |
| `workbox-9c191d2f.js` | 14,41 kB | — |
| Font terbesar keseluruhan: `KaTeX_AMS-Regular-DRggAlZN.ttf` | 63,63 kB | — |

Semua font KaTeX di `dist/assets` berjumlah 59 file dan 1.072.948 byte. Hanya varian `woff2` yang masuk daftar precache karena pola Workbox di `vite.config.ts:36-38` tidak mencakup `woff` dan `ttf`.

### Jumlah file dan baris

Perhitungan memakai `wc -l`; baris tes dipisahkan dari implementasi. Baris pada tabel `lib lain` hanya `src/lib/formulas.ts` dan `src/lib/storage.ts`, sehingga tidak tumpang tindih dengan geometri atau kuis.

| Bagian | File implementasi | Baris implementasi | File tes | Baris tes |
|---|---:|---:|---:|---:|
| Komponen | 16 | 505 | 1 | 27 |
| Halaman | 2 | 95 | 0 | 0 |
| Geometri | 9 | 680 | 1 | 236 |
| Kuis | 3 | 634 | 2 | 360 |
| `lib` lain | 2 | 146 | 2 | 61 |
| Topik | 39 | 2.287 | 5 | 143 |
| Root `src` dan CSS | 5 | 418 | 0 | 0 |
| **Total `src`** | **76** | **4.765** | **11** | **827** |

File terbesar yang memerlukan perhatian pemeliharaan adalah `src/lib/quiz/generator.ts` (605 baris), `src/styles.css` (372 baris), `src/topics/01-unsur/Explore.tsx` (316 baris), dan `src/topics/01-unsur/labelLayout.ts` (191 baris).

## 3. Temuan dan saran per area

### 3.1 Arsitektur dan struktur kode

Kondisi saat ini cukup terstruktur: komponen umum, geometri murni, kuis, dan direktori topik sudah dipisahkan. Batas modul mulai melemah pada registrasi topik dan generator pusat.

#### ARCH-01 — Registry belum menjadi sumber definisi topik

- **Bukti:** `src/topics/registry.ts:3-22` hanya memuat metadata. `src/pages/TopicPage.tsx:7-27` mengimpor seluruh komponen topik, lalu `TopicPage.tsx:43-56` mengulang pemetaan konsep dan rantai ternary eksplorasi.
- **Dampak:** Menambah topik memerlukan perubahan di beberapa lokasi. Satu langkah yang terlupa dapat membuat kartu tampil di beranda tetapi halaman, konsep, atau generator tidak terhubung.
- **Saran:** Bentuk `TopicDefinition` yang memuat metadata, `Explore`, konsep, dan factory soal. Buat `TopicPage` membaca definisi itu dari satu peta. Pertahankan tes yang memeriksa setiap `TopicId` memiliki definisi lengkap.
- **Prioritas:** Tinggi. **Perkiraan usaha:** Sedang.

#### ARCH-02 — Generator soal menjadi satu rantai kondisional besar

- **Bukti:** `src/lib/quiz/generator.ts:101-565` berisi semua cabang 10 topik dalam `buatSoalInternal`. File ini juga mengatur parser, pilihan jawaban, seed, dan paket kuis. File `src/topics/NN-*/generator.ts` hanya wrapper enam baris.
- **Dampak:** Perubahan pada satu jenis soal meningkatkan risiko regresi pada parser, paket kuis, atau jenis soal lain. Guru atau pengembang baru sulit menemukan tempat yang benar untuk menambah konten.
- **Saran:** Pindahkan aturan tiap topik ke factory per topik yang mengembalikan tipe `Question` terdiskriminasi. Central dispatcher cukup berupa `Record<TopicId, QuestionFactory>`. Factory tetap menerima RNG/seed dan menyimpan data pembentuk soal.
- **Prioritas:** Sedang. **Perkiraan usaha:** Besar.

#### ARCH-03 — Komponen topik memuat layout, state, perhitungan, dan narasi sekaligus

- **Bukti:** `src/topics/01-unsur/Explore.tsx` 316 baris, `src/topics/03-luas/Explore.tsx` 193 baris, dan `src/topics/09-garis-singgung/Explore.tsx` 191 baris. `TopicPage.tsx:71` juga merender seluruh struktur konsep secara padat.
- **Dampak:** Perubahan visual dapat menyentuh perhitungan dan sebaliknya. Review menjadi lebih lambat, terutama pada algoritme label `src/topics/01-unsur/labelLayout.ts:150-186`.
- **Saran:** Pisahkan hook state eksplorasi, model perhitungan murni, dan subkomponen diagram/kontrol. Beri komentar singkat pada algoritme layout label dan aturan geometri yang tidak langsung terlihat.
- **Prioritas:** Sedang. **Perkiraan usaha:** Sedang.

### 3.2 Kebenaran dan ketahanan numerik

Kondisi saat ini baik untuk kasus UI yang sudah dipakai: ada sanitasi pada banyak fungsi, beberapa fallback aman, dan tes mencakup titik bertumpuk, garis hampir sejajar, batas lingkaran, serta segitiga degenerat. Konsistensi toleransi dan validasi input lintas API masih perlu diperkuat.

#### NUM-01 — Toleransi tersebar dan berskala tidak seragam

- **Bukti:** `src/lib/geometry/types.ts:16` mendefinisikan `EPSILON = 1e-9`; `circle.ts:23` memakai `1e-7`; `tangent.ts:12` memakai `1e-8`; `chord.ts:35,60,76` memakai `1e-7` dan `1e-8`; `triangle.ts:66,71` memakai `1e-7` dan `1e-4`; `angle.ts:9` memakai `1e-12`.
- **Dampak:** Pada skala besar atau nilai yang tepat di batas, klasifikasi dapat berbeda antara fungsi analisis, titik potong, dan garis singgung. Siswa dapat melihat label “bersinggungan” sementara titik hasil tidak muncul, atau sebaliknya.
- **Saran:** Sediakan helper terpusat seperti `hampirSama(a, b, skala, toleransiRelatif)` dan tetapkan toleransi domain untuk jarak, luas, sudut, dan diskriminan. Uji pasangan nilai `batas ± epsilon` pada skala 1, 100, dan 1e6.
- **Prioritas:** Tinggi. **Perkiraan usaha:** Sedang.

#### NUM-02 — Beberapa fungsi geometri murni belum menolak input non-finite

- **Bukti:** `src/lib/geometry/circle.ts:29-33` menghitung `titikPadaLingkaran` tanpa validasi pusat, radius, atau sudut. `circle.ts:36-56` tidak memeriksa `Number.isFinite` sebelum menghitung diskriminan. `point.ts:35-38` mengembalikan `NaN` bila sudut masukannya `NaN`.
- **Dampak:** UI saat ini memberi input terbatas, tetapi pemakaian ulang fungsi pada topik baru dapat memasukkan `NaN`, `Infinity`, atau radius negatif dan menghasilkan koordinat SVG yang rusak.
- **Saran:** Validasi `Point` dan radius di batas API geometri. Kembalikan hasil bertipe `{ valid: false, reason }` untuk operasi yang gagal, atau dokumentasikan dengan tegas fungsi yang melakukan sanitasi. Tambahkan tes input `NaN`, `Infinity`, radius negatif, pusat non-finite, dan sudut non-finite.
- **Prioritas:** Sedang. **Perkiraan usaha:** Sedang.

#### NUM-03 — Celah tes numerik yang masih spesifik

- **Bukti:** `src/lib/geometry/geometry.test.ts:34-39` hanya menguji satu garis memotong lingkaran; belum ada kasus garis singgung, garis di luar, garis berarah sangat besar, atau input non-finite untuk `potongLingkaranGaris`. Tidak ada tes langsung untuk `proyeksiKeGaris`, `proyeksiKeSegmen`, dan `normalisasiSudut` pada nilai ekstrem.
- **Dampak:** Perubahan helper dasar dapat merusak topik 1, 5, 6, atau 10 tanpa terdeteksi meskipun tes saat ini lulus.
- **Saran:** Tambahkan tabel kasus konkret: segmen nol, garis singgung, diskriminan sedikit negatif karena pembulatan, dua lingkaran hampir sepusat dengan radius berbeda, radius nol, tiga titik segitiga kolinear, sudut `-2π`, `4π`, dan `NaN`. Periksa semua koordinat keluaran dengan `Number.isFinite`.
- **Prioritas:** Sedang. **Perkiraan usaha:** Sedang.

### 3.3 Interaksi dan kinerja IFP/HP

Kondisi saat ini sudah memakai Pointer Events, `setPointerCapture`, area sentuh 92 unit SVG, dan cleanup untuk listener/animation frame yang terlihat. Jalur drag utama belum dibatasi ke frame browser.

#### PERF-01 — Drag memicu render React pada setiap `pointermove`

- **Bukti:** `src/components/svg/DraggablePoint.tsx:18-28` memanggil `onChange` langsung pada setiap event. Semua `Explore` menyimpan koordinat atau sudut di state React; tidak ada `requestAnimationFrame` atau `React.memo` pada jalur drag.
- **Dampak:** Pada HP murah atau IFP dengan event pointer rapat, satu gerakan dapat memicu render diagram, kalkulasi, panel nilai, dan KaTeX berulang. Gejala yang mungkin muncul adalah titik tertinggal, input terasa berat, atau frame meloncat.
- **Saran:** Simpan posisi pointer terakhir di `ref`, jadwalkan satu update melalui `requestAnimationFrame`, lalu batalkan frame saat pointer selesai. Ukur dengan React Profiler dan Performance panel pada drag 10 detik. Target praktis: frame mayoritas ≤16,7 ms pada perangkat kelas target, tanpa long task >50 ms, dan input-to-paint terasa <100 ms.
- **Prioritas:** Tinggi. **Perkiraan usaha:** Sedang.

#### PERF-02 — Topik luas menggambar 129 path juring pada nilai maksimum

- **Bukti:** `src/topics/03-luas/Explore.tsx:88-94` membuat 64 path juring lingkaran. `Explore.tsx:101-149` membuat 65 path juring pada susunan persegi panjang. Keduanya dirender di `Explore.tsx:165,172`; daftar itu dihitung ulang setiap render.
- **Dampak:** Slider jumlah juring atau radius menyebabkan pembuatan ulang string path dan 129 node SVG pada setiap perubahan. Ini masih mungkin lancar di laptop, tetapi menjadi beban tambahan di IFP kelas bawah.
- **Saran:** Bungkus daftar path dan nilai turunan dengan `useMemo`. Ukur 4, 16, 32, dan 64 juring pada perangkat target sebelum memutuskan optimasi lebih besar. Jika p95 frame melewati target, kurangi detail saat drag lalu tampilkan detail penuh setelah pointer berhenti.
- **Prioritas:** Sedang. **Perkiraan usaha:** Kecil sampai sedang.

#### PERF-03 — Pembatalan pointer dan multi-touch belum memiliki kontrak eksplisit

- **Bukti:** `DraggablePoint.tsx:14-32` menangani `pointerdown`, `pointermove`, dan `pointerup`, tetapi tidak memiliki `pointercancel` atau state `pointerId` aktif. `touch-action: none` sudah dipasang di `DraggablePoint.tsx:46` dan `styles.css:106,314`.
- **Dampak:** Perubahan jari, pembatalan OS, atau dua jari pada dua titik perlu diuji agar tidak membuat posisi melompat atau membuat kontrol sulit dilepas. Dampak aktual bergantung browser dan perangkat, sehingga belum dapat disimpulkan dari kode saja.
- **Saran:** Tambahkan jalur cleanup bersama untuk `pointerup` dan `pointercancel`, simpan pointer aktif per titik, dan abaikan pointer lain pada titik yang sama. Uji satu jari, dua jari, sentuhan yang dibatalkan, rotasi layar, dan drag setelah scroll.
- **Prioritas:** Sedang. **Perkiraan usaha:** Kecil.

### 3.4 Generator soal dan mesin kuis

Audit soal yang ada menyatakan determinisme, parser, kunci, variasi, dan paket lulus. Temuan berikut menyangkut bentuk arsitektur dan alur yang belum menjadi bagian dari audit kebenaran tersebut.

#### QUIZ-01 — Tipe pertanyaan terlalu longgar untuk pertumbuhan konten

- **Bukti:** `src/lib/quiz/types.ts:3-14` memakai `Record<string, number | string>` untuk `data` dan `sumberGeometri`. `generator.ts:101-565` membaca dan menulis field dengan nama berbeda untuk tiap cabang.
- **Dampak:** Salah eja nama field atau perubahan format dapat lolos TypeScript dan baru terlihat saat soal atau pembahasan tertentu dibuka. Menambah tipe soal menjadi pekerjaan yang rawan omission.
- **Saran:** Gunakan union terdiskriminasi per `data.jenis`, misalnya `QuestionNumerik` dan `QuestionPilihan`, lalu beri tipe data sumber per topik. Pertahankan `sumberGeometri` sebagai data verifikasi, bukan sebagai objek bebas tanpa kontrak.
- **Prioritas:** Sedang. **Perkiraan usaha:** Besar.

#### QUIZ-02 — Paket kuis dapat melempar error setelah batas percobaan

- **Bukti:** `src/lib/quiz/generator.ts:576-595` mencoba maksimal 1.000 seed per posisi, melakukan backtracking rekursif, lalu melempar error pada baris 595 bila paket tidak terbentuk. Audit yang tersedia menguji banyak seed dan saat ini tidak menemukan kegagalan.
- **Dampak:** Penambahan jenis soal dengan ruang variasi sempit dapat membuat tab Kuis gagal dibuka untuk seed tertentu. Di kelas, kegagalan ini muncul sebagai layar error tanpa jalur pemulihan yang jelas.
- **Saran:** Pisahkan pool jenis soal dari pool signature, berikan fallback deterministik yang tidak menggandakan signature, dan tambahkan tes kontrak “semua `TopicId`, seed 0 sampai N, selalu menghasilkan lima soal”. Jika tetap gagal, tampilkan pesan pemulihan di UI dan log konteks topik/seed.
- **Prioritas:** Sedang. **Perkiraan usaha:** Sedang.

#### QUIZ-03 — State kuis tidak persisten dan konfirmasi hanya mencakup tautan aplikasi

- **Bukti:** `src/components/QuizEngine.tsx:13-20` menyimpan semua progres di state React. `src/pages/TopicPage.tsx:57-69` meminta konfirmasi pada tautan yang memanggil `onNavigateAway`; reload, browser back, atau perubahan hash langsung tidak melewati handler tersebut.
- **Dampak:** Reload karena pembaruan, menutup tab, atau navigasi browser menghilangkan progres kuis. Skor terbaik tetap aman, tetapi jawaban sementara tidak dapat dipulihkan.
- **Saran:** Putuskan dan dokumentasikan kebijakan reload. Jika pemulihan dibutuhkan, simpan sesi sementara dengan schema version, seed, indeks, dan jawaban; jika tidak, tambahkan pesan status yang jelas dan uji semua jalur keluar. Jangan menyimpan jawaban siswa tanpa keputusan guru karena perangkat dapat dipakai bersama.
- **Prioritas:** Sedang. **Perkiraan usaha:** Sedang.

#### QUIZ-04 — Skor localStorage sudah defensif, tetapi belum berversi

- **Bukti:** `src/lib/storage.ts:3-20` memakai satu key global tanpa `schemaVersion`, memvalidasi skor 0–5, dan menangkap JSON rusak. `storage.ts:32-42` menangkap kegagalan kuota/private mode. `storage.ts:14` melakukan `topikId as TopicId` tanpa allowlist.
- **Dampak:** Skema masa depan sulit dimigrasikan. Key asing di objek dapat disimpan sebagai `TopicId` secara tipe meskipun bukan topik resmi. Pada perangkat bersama, skor terbaik tetap terbawa ke pengguna berikutnya dan tidak ada fungsi hapus/reset skor.
- **Saran:** Simpan `{ version: 1, scores: { ... } }`, validasi key terhadap registry, dan sediakan keputusan produk untuk reset skor lokal. Pertahankan `try/catch`, lalu beri umpan balik non-blocking jika penulisan gagal.
- **Prioritas:** Sedang. **Perkiraan usaha:** Kecil sampai sedang.

### 3.5 Rumus dan konten

Registry rumus sudah terpusat dan `src/lib/formulas.test.ts` merender semua rumus dengan `throwOnError: true`. Risiko utama berada pada parser teks campuran yang mengubah seluruh kalimat menjadi ekspresi KaTeX.

#### CONTENT-01 — `MathText` mencampur narasi dan matematika dalam satu ekspresi

- **Bukti:** `src/components/MathText.tsx:4-14` mengganti simbol Unicode dengan token TeX lalu memanggil `katex.renderToString` pada seluruh `potongan`. `MathText.tsx:20-23` memilih jalur ini hanya berdasarkan regex karakter matematika.
- **Dampak:** Kalimat pembahasan yang berisi satu tanda `=` atau `×` dapat membuat kata narasi ikut dirender sebagai matematika. Tampilan, spasi, atau pembacaan pembaca layar dapat berbeda dari teks sumber. Tes saat ini memeriksa registry rumus, bukan hasil visual untuk pembahasan generator.
- **Saran:** Simpan pembahasan sebagai segmen `{ text, math }`, atau tandai formula secara eksplisit lalu render hanya segmen matematika. Tambahkan snapshot/DOM test untuk pembahasan yang berisi kalimat, `π`, satuan, akar, dan tanda minus.
- **Prioritas:** Sedang. **Perkiraan usaha:** Sedang.

#### CONTENT-02 — Validasi konten belum memeriksa semua teks yang akan dirender

- **Bukti:** `src/lib/formulas.test.ts:14-24` menguji `allFormulas`. Teks konsep berada di `src/topics/*/concept.ts`, sedangkan pembahasan soal dibentuk di `generator.ts`; tidak ada lint konten yang memeriksa string `undefined`, `NaN`, simbol derajat, satuan, atau hasil `MathText` untuk seluruh topik.
- **Dampak:** Rumus registry dapat lulus sementara satu redaksi pembahasan atau konsep menghasilkan simbol yang tidak konsisten. Guru menemukan masalah ketika membuka seed atau topik tertentu.
- **Saran:** Buat pemeriksaan konten yang mengiterasi semua `poinKonsep`, `rumusKonsep`, dan seed sampel generator. Periksa token terlarang (`undefined`, `NaN`, `Infinity`), satuan yang diharapkan, dan render KaTeX dengan `throwOnError: true` pada segmen formula.
- **Prioritas:** Sedang. **Perkiraan usaha:** Sedang.

### 3.6 PWA dan offline

Konfigurasi memakai `generateSW`, `autoUpdate`, `skipWaiting`, `clientsClaim`, dan path relatif. Build berhasil membuat service worker dan precache. Perilaku perangkat nyata belum terverifikasi.

#### PWA-01 — Fallback font KaTeX tidak ikut precache

- **Bukti:** `vite.config.ts:36-38` memakai `globPatterns: ['**/*.{js,css,html,svg,png,woff2}']`. `dist` berisi font `woff` dan `ttf`, tetapi daftar `dist/sw.js` hanya berisi 19 font KaTeX `woff2`.
- **Dampak:** Browser lama pada IFP atau Android yang memilih `woff`/`ttf` dapat kehilangan font KaTeX ketika offline, sehingga rumus bergeser atau tampil dengan fallback.
- **Saran:** Pilih strategi font yang jelas: precache semua format yang memang didukung target, atau keluarkan format fallback dan tetapkan browser minimum. Uji instalasi lalu offline pada browser IFP/Android target.
- **Prioritas:** Tinggi. **Perkiraan usaha:** Kecil.

#### PWA-02 — Pembaruan otomatis dapat mengganti versi saat kuis berjalan

- **Bukti:** `vite.config.ts:17-18,35-38` mengaktifkan `registerType: 'autoUpdate'`, `skipWaiting`, dan `clientsClaim`. `src/main.tsx:7-12` mengirim event update; `src/components/UpdateToast.tsx:12-13` memanggil `window.location.reload()`. State kuis tidak dipersistenkan (`QuizEngine.tsx:13-20`).
- **Dampak:** Guru atau siswa dapat kehilangan soal dan jawaban sementara ketika service worker baru aktif. Reload juga dapat terjadi pada saat interaksi kelas sedang berlangsung.
- **Saran:** Tunda aktivasi selama latihan/kuis aktif, tampilkan prompt pada kondisi idle, dan panggil `updateSW(true)` dari handler tombol setelah pengguna setuju. Jika kebijakan auto update dipertahankan, simpan minimal seed dan indeks sebelum reload.
- **Prioritas:** Tinggi. **Perkiraan usaha:** Sedang.

#### PWA-03 — Manifest belum mendeklarasikan ikon maskable dan status offline siap tidak diberi tahu

- **Bukti:** `vite.config.ts:25-33` hanya mendeklarasikan PNG 192 dan 512 tanpa `purpose: 'maskable'`. `src/main.tsx:7-12` hanya memasang `onNeedRefresh`, tanpa `onOfflineReady`.
- **Dampak:** Ikon instalasi dapat dipotong kurang baik pada launcher Android. Guru tidak mendapat tanda jelas kapan cache offline selesai dan kapan aplikasi aman dipakai tanpa jaringan.
- **Saran:** Sediakan aset maskable dengan safe area dan deklarasikan `purpose: 'maskable'`. Tambahkan status “siap offline” sekali per instalasi atau dokumentasikan bahwa cache selesai diam-diam. Uji install/uninstall/update pada Chrome Android dan browser Windows/IFP.
- **Prioritas:** Rendah. **Perkiraan usaha:** Kecil.

### 3.7 Aksesibilitas dan keterpakaian

Kontrol HTML umumnya fokusable, target tombol 44–52 px, dan feedback memiliki live region. Canvas SVG masih diperlakukan sebagai satu gambar, sehingga informasi dinamis dan drag tidak memiliki jalur akses yang setara.

#### A11Y-01 — `role="img"` pada canvas menutupi struktur interaktif

- **Bukti:** `src/components/svg/Canvas.tsx:17-23` selalu memberi `role="img"` dan satu `aria-label`. `DraggablePoint.tsx:37-50` memberi `aria-label` pada circle di dalam SVG, tetapi tidak memberi jalur keyboard atau ringkasan nilai dinamis.
- **Dampak:** Pembaca layar kemungkinan hanya mendengar “Diagram ...” dan tidak memperoleh posisi titik, sudut, radius, atau klasifikasi terbaru. Label anak tidak cukup menggantikan alternatif teks untuk diagram yang berubah.
- **Saran:** Beri `<title>` dan `<desc>` pada SVG, sediakan ringkasan HTML yang diperbarui untuk nilai penting, dan hubungkan dengan `aria-describedby`. Jadikan informasi interaktif tersedia sebagai slider/tombol keyboard atau kontrol HTML yang setara.
- **Prioritas:** Tinggi. **Perkiraan usaha:** Sedang.

#### A11Y-02 — Titik drag belum dapat dioperasikan dengan keyboard

- **Bukti:** `DraggablePoint.tsx:14-32` hanya menangani Pointer Events. Komponen `SelectableUnsur` di `src/topics/01-unsur/Explore.tsx:35-54` memiliki `role="button"`, `tabIndex`, dan `onKeyDown`, tetapi itu hanya memilih/fokus unsur, bukan memindahkan titik.
- **Dampak:** Siswa yang tidak dapat menggunakan pointer tidak dapat mengeksplorasi topik dengan cara yang setara. Pembaca layar juga tidak memperoleh cara menguji perubahan nilai.
- **Saran:** Tambahkan kontrol keyboard yang jelas, misalnya slider sudut/koordinat tersembunyi secara visual tetapi terlihat oleh assistive technology, atau buat `DraggablePoint` mendukung Arrow keys dengan langkah dan `aria-valuenow`. Umumkan nilai setelah perubahan melalui live region yang tidak berulang.
- **Prioritas:** Sedang. **Perkiraan usaha:** Sedang.

#### A11Y-03 — Status aktif tab dan feedback perlu semantik yang lebih tegas

- **Bukti:** `src/components/Tabs.tsx:10-11` hanya memberi class `aktif` tanpa `aria-selected`, `aria-current`, atau hubungan ke panel. `AnswerFeedback.tsx:19-23` menaruh teks visual dan salinan `.sr-only` di dalam region status yang sama.
- **Dampak:** Teknologi bantu mungkin tidak mengetahui tab aktif dan dapat mengumumkan feedback dua kali. Pengguna keyboard harus menyimpulkan status dari perubahan visual.
- **Saran:** Pilih pola tab lengkap (`role=tablist`, `role=tab`, `aria-selected`, `aria-controls`, `role=tabpanel`) atau gunakan `aria-current` pada pola navigasi biasa. Jadikan satu sumber teks untuk live region; tandai salinan visual sebagai `aria-hidden` bila salinan terpisah memang diperlukan.
- **Prioritas:** Sedang. **Perkiraan usaha:** Kecil.

#### A11Y-04 — Reduced motion baru mencakup sebagian transisi

- **Bukti:** `styles.css:316-318` hanya mematikan transisi `.unsur-layer`. Transisi kartu `styles.css:72`, layer `styles.css:122`, dan progress kuis `styles.css:226` tetap aktif. Animasi penggulungan di `MeasureMode.tsx:85-104` sudah memeriksa `prefers-reduced-motion`.
- **Dampak:** Siswa yang meminta gerak dikurangi masih melihat beberapa animasi. Efek ini perlu diuji pada browser target karena dukungan media query pada perangkat kelas dapat bervariasi.
- **Saran:** Sediakan aturan global `@media (prefers-reduced-motion: reduce)` untuk semua transition/animation yang tidak esensial, lalu pertahankan perubahan nilai instan. Tambahkan pemeriksaan manual pada mode pengukuran dan pergantian tab.
- **Prioritas:** Rendah. **Perkiraan usaha:** Kecil.

### 3.8 Responsivitas dan tata letak

Breakpoint 1180, 820, dan 520 px sudah menurunkan grid dan menumpuk panel. Ada satu masalah teknis yang mempengaruhi ketepatan drag ketika ukuran SVG tidak lagi sama dengan rasio `viewBox`.

#### RESP-01 — Konversi pointer mengabaikan letterboxing `preserveAspectRatio`

- **Bukti:** `Canvas.tsx:19-22` memakai `preserveAspectRatio="xMidYMid meet"`. `DraggablePoint.tsx:22-27` memetakan `clientX/clientY` menggunakan seluruh `getBoundingClientRect()` dan `viewBox`, tanpa `getScreenCTM()`.
- **Dampak:** `styles.css:106,337,359` menetapkan `height: auto` sekaligus `min-height`. Pada lebar sekitar 360 px, tinggi minimum dapat membuat rasio kotak berbeda dari `700 × 430`; area kosong hasil `meet` ikut dihitung sebagai koordinat. Titik bergerak tidak tepat di bawah jari.
- **Saran:** Gunakan transform SVG aktual, misalnya `event.currentTarget.ownerSVGElement?.getScreenCTM()?.inverse()` dan transform `DOMPoint(clientX, clientY)`. Uji ulang pada 320, 360, 768, layar lanskap, dan IFP 4K.
- **Prioritas:** Tinggi. **Perkiraan usaha:** Kecil.

#### RESP-02 — Matriks viewport target belum menjadi tes deploy

- **Bukti:** Breakpoint hanya didefinisikan di `styles.css:320-372`; tidak ada tes visual atau skrip smoke untuk 360 px, 4K, potret, lanskap, zoom browser, dan keyboard focus.
- **Dampak:** Tabel konsep dan tombol navigasi dapat memerlukan scroll horizontal, sementara ukuran teks dan diagram pada IFP sangat lebar belum diketahui dari kode saja.
- **Saran:** Jadikan matriks manual 320×640, 360×800, 768×1024, 1366×768, dan 3840×2160. Periksa tidak ada overflow horizontal, fokus tidak tertutup, rumus dapat digulir, area sentuh tetap mudah dipakai, dan nilai tidak terpotong.
- **Prioritas:** Sedang. **Perkiraan usaha:** Kecil.

### 3.9 Kualitas TypeScript dan tooling

TypeScript sudah strict dan build memeriksa tipe. Tooling belum memiliki lint, format check, atau pipeline CI yang menggabungkan semua pemeriksaan.

#### TOOL-01 — Tidak ada lint, format check, atau CI script

- **Bukti:** `package.json:5-15` hanya memiliki `dev`, `build`, `preview`, dan `test`. Tidak ditemukan konfigurasi ESLint/Prettier di root. `vitest.config.ts:4-6` hanya memasukkan `src/**/*.test.ts`; tes audit di `scripts/audit/` memakai konfigurasi terpisah.
- **Dampak:** JSX satu baris, import yang tidak konsisten, dan kesalahan gaya tidak terdeteksi. Perubahan generator dapat lulus `npm run test` tanpa menjalankan audit terpisah.
- **Saran:** Tambahkan `lint`, `format:check`, dan `test:audit` sebagai perintah terpisah, lalu jalankan `lint + test + test:audit + build` di CI. Gunakan rule TypeScript yang melarang assertion tidak perlu dan memeriksa import. Penambahan dependency dilakukan dalam pekerjaan terpisah sesuai keputusan tim.
- **Prioritas:** Sedang. **Perkiraan usaha:** Kecil sampai sedang.

#### TOOL-02 — Strict aktif, tetapi pemeriksaan tipe belum memaksa keamanan indeks/data

- **Bukti:** `tsconfig.app.json:5-18` mengaktifkan `strict`, tetapi tidak mengaktifkan `noUncheckedIndexedAccess` atau `noUnusedLocals`. Assertion seperti `topikId as TopicId` ada di `storage.ts:14`, dan banyak data soal berupa `Record<string, ...>`.
- **Dampak:** TypeScript tidak sepenuhnya mengingatkan key yang mungkin tidak ada atau field data yang salah. Risiko ini terlihat terutama saat menambah topik atau jenis soal.
- **Saran:** Uji `noUncheckedIndexedAccess` dan `noUnusedLocals` secara bertahap di branch terpisah. Perbaiki error yang muncul dengan union/guard yang eksplisit, bukan menambah assertion baru.
- **Prioritas:** Rendah. **Perkiraan usaha:** Sedang.

#### TOOL-03 — Status dependensi tidak dapat dinilai penuh dari `npm audit` offline

- **Bukti:** `npm list --depth=0` berhasil membaca versi terpasang. `npm audit --omit=dev --json` gagal sebelum menerima advisory karena DNS registry. Paket langsung tampak dipakai oleh source atau konfigurasi; belum ada pemeriksaan depcheck formal.
- **Dampak:** Tim tidak memiliki bukti lokal terbaru tentang advisory atau paket transitive yang tidak dipakai. Keputusan pembaruan dapat tertunda sampai audit dijalankan di jaringan yang tersedia.
- **Saran:** Jalankan audit dan `npm outdated` di CI yang dapat mengakses registry, simpan hasil sebagai artefak, dan review pembaruan satu per satu. Jangan menjalankan `npm audit fix` otomatis pada proyek offline.
- **Prioritas:** Sedang. **Perkiraan usaha:** Kecil.

### 3.10 Keamanan dan privasi

Tidak ditemukan `fetch` aplikasi, CDN runtime, backend, login, atau data pribadi. Data lokal hanya skor terbaik per topik. Jalur HTML mentah tetap memerlukan disiplin input.

#### SEC-01 — `dangerouslySetInnerHTML` aman untuk konten saat ini, tetapi menjadi batas kepercayaan

- **Bukti:** `src/components/MathText.tsx:14,23` memakai `katex.renderToString` dan `dangerouslySetInnerHTML`. Inputnya saat ini berasal dari string pembahasan/konsep yang dikendalikan kode; input jawaban siswa tidak dikirim ke `MathText`.
- **Dampak:** Risiko XSS saat ini rendah karena tidak ada jalur input pengguna ke renderer. Risiko meningkat jika guru kelak mengimpor konten dari file atau localStorage dan string itu langsung dirender.
- **Saran:** Pertahankan `trust: false`, batasi renderer pada segmen formula yang sudah dikenali, dan sanitasi hasil jika sumber konten menjadi eksternal. Tambahkan tes regresi bahwa input pengguna tidak pernah masuk ke `MathText`.
- **Prioritas:** Sedang. **Perkiraan usaha:** Sedang.

#### SEC-02 — KaTeX 0.18.1 berada di bawah patch advisory rendah yang berlaku

- **Bukti:** `package.json:13` meminta `katex: ^0.18.1` dan `npm list` menunjukkan 0.18.1. [Advisory resmi KaTeX GHSA-238p-pmpm-9mq7](https://github.com/KaTeX/KaTeX/security/advisories/GHSA-238p-pmpm-9mq7) menyatakan versi `>=0.11.0, <0.18.2` terdampak dan 0.18.2 menjadi versi perbaikan. Advisory menjelaskan eksploitasi memerlukan kombinasi prototype pollution, ekspresi tak tepercaya, dan penyisipan HTML tanpa sanitizer; pola aplikasi saat ini memakai ekspresi statis.
- **Dampak:** Risiko operasional aplikasi ini rendah karena tidak menerima ekspresi matematika siswa dan tidak memakai backend. Versi dependency tetap perlu dinaikkan dalam pekerjaan terpisah agar baseline supply-chain tidak menyimpan patch yang sudah tersedia.
- **Saran:** Setelah ada keputusan pembaruan dependency, naikkan minimal ke versi patch yang memperbaiki advisory, jalankan test/build, lalu audit ulang. Jangan mengubah dependency pada tinjauan ini.
- **Prioritas:** Sedang. **Perkiraan usaha:** Kecil.

#### SEC-03 — Skor lokal dapat terbawa antar pengguna perangkat bersama

- **Bukti:** `src/lib/storage.ts:3-4` memakai satu key global `simulasi-lingkaran-skor-terbaik`; `Home.tsx:19` menampilkan skor itu pada beranda. Tidak ada identitas pengguna atau tombol reset skor.
- **Dampak:** Pada IFP atau laptop kelas yang dipakai bergantian, siswa berikutnya dapat melihat skor terbaik siswa sebelumnya. Ini bukan kebocoran jaringan, tetapi dapat membingungkan dan memengaruhi privasi kelas.
- **Saran:** Konfirmasi kebijakan guru. Bila perangkat bersama membutuhkan reset, sediakan aksi hapus skor lokal dengan konfirmasi dan dokumentasikan bahwa data tidak pernah dikirim ke server.
- **Prioritas:** Rendah. **Perkiraan usaha:** Kecil.

### 3.11 Build dan deploy

Build memverifikasi `base: './'` bekerja pada proses produksi dan HTML hasil build memakai URL relatif. Verifikasi server nyata dari subfolder masih belum dilakukan.

#### DEPLOY-01 — Artefak produksi sudah relatif, tetapi pembuktian subfolder perlu dijadikan langkah rilis

- **Bukti:** `vite.config.ts:6` memakai `base: './'`; `dist/index.html:10-14` memakai `./assets/...`, `./manifest.webmanifest`, dan favicon `./icon.svg`. `HashRouter` dipasang di `src/App.tsx:7`.
- **Dampak:** Struktur ini cocok untuk hosting statis di subfolder dan tidak membutuhkan rewrite route. Kesalahan server MIME, `scope`, atau service worker tetap dapat membuat offline/PWA gagal meskipun URL JavaScript relatif.
- **Saran:** Pada staging, salin isi `dist` ke path `/lingkaran/`, buka `/lingkaran/`, lalu buka `/#/topik/10-kedudukan`. Periksa request `./assets`, `/lingkaran/manifest.webmanifest`, `/lingkaran/sw.js`, reload offline, dan navigasi langsung ke hash route.
- **Prioritas:** Tinggi. **Perkiraan usaha:** Kecil.

#### DEPLOY-02 — Header cache perlu dibakukan

- **Bukti:** Hasil build membuat aset hashed seperti `assets/index-D1aHaCem.js`, `assets/katex-D6oIofZu.js`, `sw.js`, dan `index.html`. Tidak ada konfigurasi server dalam repository.
- **Dampak:** Cache agresif pada `index.html` atau `sw.js` dapat menahan versi lama; cache terlalu singkat pada aset hashed menambah waktu buka di kelas.
- **Saran:** Untuk aset hashed gunakan `Cache-Control: public, max-age=31536000, immutable`. Untuk `index.html`, `sw.js`, dan manifest gunakan `no-cache` atau TTL pendek dengan revalidasi. Pastikan `sw.js` disajikan sebagai JavaScript dan scope berada pada direktori aplikasi.
- **Prioritas:** Tinggi. **Perkiraan usaha:** Kecil.

### 3.12 Kemudahan pemeliharaan

README sudah menjelaskan struktur, langkah menambah topik, target Node, path relatif, dan target sentuh. Dokumentasi belum membentuk kontrak otomatis yang menjaga agar langkah-langkah itu tetap sinkron dengan implementasi.

#### MAINT-01 — Prosedur menambah topik masih berupa daftar perubahan manual

- **Bukti:** `README.md:51-70` meminta perubahan `types.ts`, `registry.ts`, `TopicPage.tsx`, `lib/quiz/generator.ts`, geometri, dan tes. Registry dan TopicPage memang menyimpan daftar terpisah.
- **Dampak:** Kontributor baru harus memahami beberapa pola sebelum dapat menambah satu topik. Risiko tertinggi adalah topik terdaftar tetapi tidak memiliki explore/konsep/generator yang lengkap.
- **Saran:** Dokumentasikan template `TopicDefinition`, template test topik, dan checklist konten. Tambahkan tes yang gagal jika setiap `TopicId` tidak memiliki metadata, komponen eksplorasi, konsep, dan factory kuis.
- **Prioritas:** Tinggi. **Perkiraan usaha:** Sedang.

#### MAINT-02 — Algoritme matematika dan layout yang rumit kurang diberi alasan

- **Bukti:** Komentar penjelas ada di `src/topics/02-keliling/pi/archimedes.ts:15-18,45`, `src/lib/geometry/tangent.ts:57-60`, dan parser generator `generator.ts:39-43`. Sebaliknya, heuristik kandidat label `src/topics/01-unsur/labelLayout.ts:81-184` dan beberapa fallback geometri tidak memiliki komentar alasan.
- **Dampak:** Pengembang berikutnya dapat mengubah urutan kandidat, toleransi, atau fallback tanpa memahami dampaknya pada gambar dan kestabilan numerik.
- **Saran:** Tambahkan komentar singkat yang menjelaskan invariant: mengapa label mencoba arah tertentu, kapan fallback pusat dipakai, dan mengapa nilai toleransi berskala. Sertakan satu contoh input/output pada tes untuk setiap algoritme.
- **Prioritas:** Sedang. **Perkiraan usaha:** Kecil.

## 4. Rencana tindak lanjut berurutan

Urutan memakai dampak kelas dibagi usaha. Pekerjaan kode belum dilakukan dalam tinjauan ini.

### Kerjakan sekarang

1. **RESP-01:** perbaiki transform pointer dengan `getScreenCTM()` dan verifikasi 360 px/IFP.
2. **PWA-01:** pastikan font yang dipakai browser target masuk precache offline.
3. **PERF-01:** ukur drag dengan React Profiler/Performance panel dan jadwalkan update lewat `requestAnimationFrame` bila target tidak tercapai.
4. **A11Y-01:** sediakan ringkasan HTML dinamis, `<title>/<desc>`, dan jalur akses nilai untuk SVG.
5. **DEPLOY-01/02:** uji artefak dari subfolder dan tetapkan header cache `index.html`/`sw.js`.

### Sebelum dipakai di kelas

6. **PWA-02:** tetapkan kebijakan update saat kuis aktif dan uji update service worker.
7. **A11Y-02/03:** uji keyboard dan pembaca layar, lalu benahi semantik tab, drag, dan pengumuman feedback.
8. **NUM-01/03:** pusatkan toleransi dan tambahkan kasus numerik yang spesifik pada batas.
9. **PERF-02/03:** uji 64 juring, multi-touch, pointer cancel, dan 10 detik drag pada perangkat target.

### Nanti

10. **ARCH-01/02, QUIZ-01, MAINT-01:** satukan definisi topik, pecah generator per topik, dan buat kontrak tipe/template untuk kontributor.

## 5. Hal yang tidak bisa diverifikasi dan uji manual

### Tidak bisa diverifikasi dari lingkungan ini

- IFP nyata, HP siswa, stylus, multi-touch, pointer cancel, rotasi layar, dan kinerja perangkat kelas bawah.
- Instalasi PWA baru, cache pertama, pembukaan tanpa jaringan, update service worker, dan pengaruh header server.
- Pembaca layar pada browser target, pembacaan MathML/KaTeX, urutan fokus SVG, dan mode kontras tinggi.
- Kesesuaian ukuran fisik teks pada proyektor/IFP 4K dan keterbacaan dari jarak kelas.
- Hasil `npm audit --omit=dev` lengkap karena registry npm tidak dapat diakses dari sesi ini.
- Repository git: `.git` ada sebagai direktori kosong/tidak valid bagi `git`, sehingga status perubahan sebelum dan sesudah review tidak dapat dibandingkan.

### Daftar uji manual yang disarankan

1. Buka setiap topik pada viewport 360×800, 768×1024, 1366×768, dan IFP 4K; uji potret, lanskap, zoom, dan tanpa overflow horizontal.
2. Drag setiap titik dengan satu jari selama 10 detik; ulangi dua jari, sentuhan yang dibatalkan, drag dekat batas, dan setelah scroll.
3. Pada Topik 3, bandingkan 4, 16, 32, dan 64 juring sambil mengamati jank.
4. Buka aplikasi online sekali, tunggu service worker siap, matikan jaringan, reload, buka semua 10 topik, lalu jalankan Latihan dan Kuis.
5. Instal PWA pada Android/Windows/IFP target; periksa ikon, mode standalone, scope subfolder, dan pembaruan dari versi lama.
6. Saat kuis berjalan, pasang versi baru atau tekan reload; pastikan kebijakan kehilangan/pemulihan progres sesuai keputusan guru.
7. Jalankan keyboard saja: tab melalui topik, tab, slider, titik, pilihan jawaban, feedback, dan tombol reset.
8. Uji NVDA/Chrome atau pembaca layar yang tersedia untuk ringkasan SVG, nilai dinamis, KaTeX, dan `aria-live` feedback.
9. Uji mode `prefers-reduced-motion: reduce` dan mode kontras tinggi.
10. Sajikan `dist` di `/lingkaran/`, buka `/#/topik/10-kedudukan`, periksa `sw.js`, putuskan jaringan, lalu ulangi reload.

## 6. Pertanyaan untuk keputusan desain

1. Saat service worker baru tersedia ketika kuis aktif, apakah aplikasi harus menunda update sampai kuis selesai, atau menyimpan dan memulihkan sesi kuis?
2. Pada perangkat bersama, apakah skor terbaik perlu tombol reset untuk memulai kelas baru?
3. Apakah titik SVG harus dapat digerakkan dengan keyboard, atau cukup disediakan kontrol slider/angka yang setara untuk assistive technology?
4. Browser minimum apa yang harus didukung IFP/Android? Keputusan ini menentukan apakah `woff`/`ttf` perlu ikut precache.
5. Apakah generator soal akan tetap menjadi satu kumpulan pusat, atau akan ada kontributor lain yang memerlukan factory per topik dan schema konten?
