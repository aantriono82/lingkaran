# Catatan perbaikan teknis

Dokumen ini mencatat perubahan berdasarkan ID di `docs/saran-teknis.md`. Status dan angka di bawah diperbarui setelah setiap tahap.

## Status Tahap 1 — kebenaran dan keselamatan data siswa

### Perubahan yang sudah diterapkan

- `RESP-01`: konversi pointer memakai inversi `getScreenCTM()` di `src/components/svg/coordinates.ts`; `DraggablePoint` menyimpan offset pointer pada awal drag dan menggunakannya pada setiap event. Jalur manual berbasis `getBoundingClientRect()` sudah dihapus dari komponen titik.
- `PWA-02` dan `QUIZ-03`: pembaruan service worker berpindah ke mode prompt. Sesi kuis berversi disimpan ke localStorage, divalidasi, kedaluwarsa setelah 24 jam, dapat dilanjutkan atau dimulai ulang, dan dihapus saat kuis selesai atau dibatalkan. Kunci skor terbaik lama tidak diubah.
- `A11Y-01`: `Canvas` sekarang mempunyai `title`, `desc`, ID grid unik, dan region `aria-live` yang diperbarui dengan jeda 500 ms.
- `A11Y-02`: titik SVG mempunyai fokus keyboard dan langkah panah dasar yang tetap melalui fungsi kendala titik.
- `A11Y-04`: aturan `prefers-reduced-motion` diperluas ke animasi dan transisi.

### Tes dan build sementara

Perintah `npm run test` lulus: **17 berkas, 115 tes**. Sebanyak 98 tes awal tetap lulus; 17 tes baru mencakup koordinat CTM, sesi kuis, keputusan pembaruan, penjadwal frame, langkah keyboard, dan deskripsi aksesibilitas.

Perintah `npm run build` lulus: TypeScript dan Vite berhasil. Build menghasilkan 112 modul; waktu Vite 4,68 detik. Bundel yang tercatat saat Tahap 1: JavaScript aplikasi 352,14 kB, React 49,63 kB, KaTeX 260,45 kB, CSS 56,17 kB; precache 32 entri, 962,08 KiB.

Pengukuran pointer nyata pada IFP, HP, dan CPU throttled belum tersedia di lingkungan ini; bagian itu tetap **perlu uji manual**.

## Status Tahap 2 — kelancaran dan aksesibilitas

### Perubahan yang sudah diterapkan

- `PERF-01`: `DraggablePoint` menyimpan nilai terakhir dan mengirim paling banyak satu perubahan per frame melalui `requestAnimationFrame`; `pointerup` melakukan `flush` sehingga posisi akhir tetap dikomit. `pointercancel` juga ditangani.
- `PERF-02`: primitif SVG bersama (`Circle`, `Segment`, `Arc`, `AngleMarker`, `RightAngleMarker`, `Label`) dimemoisasi. Perhitungan layout, 64 juring, dan susunan juring Topik 3 memakai `useMemo`.
- `A11Y-01` dan `A11Y-02`: semua `Canvas` yang ada sekarang menerima ringkasan dinamis; titik dapat menerima fokus keyboard, tombol panah, dan kendala geometri yang sama. Fokus diberi garis kontras.
- `A11Y-04`: semua transisi dan animasi mengikuti `prefers-reduced-motion`.
- Deskripsi murni untuk 10 topik ditambahkan di `src/topics/descriptions.ts`, dengan tes yang memastikan ringkasan tidak menghasilkan `NaN` atau `undefined`.

### Tes dan build sementara

`npm run test` lulus: **17 berkas, 115 tes**. `npm run build` lulus: TypeScript dan Vite berhasil, 112 modul, waktu Vite 5,50 detik, JavaScript aplikasi 352,27 kB, React 49,63 kB, KaTeX 260,45 kB, CSS 56,17 kB, precache 32 entri 962,21 KiB.

### Pengukuran drag

Baseline dari laporan teknis: pembaruan state terjadi pada setiap `pointermove`. Setelah perubahan, tes sintetis mengirim 3 nilai dalam satu frame dan menghasilkan 1 callback dengan nilai terakhir; tes `flush` memastikan titik akhir dikirim sekali. Waktu skrip per frame di CPU throttled 4× belum dapat diukur tanpa DevTools dan perangkat/browser nyata, jadi target **< 8 ms** tetap **perlu uji manual** pada Topik 3 (64 juring), 4, 7, dan 10.

## Status Tahap 3 — pemeliharaan

### Perubahan yang sudah diterapkan

- `ARCH-01` dan `MAINT-01`: setiap folder topik sekarang mengekspor `topicModule` dengan metadata, komponen eksplorasi, konsep, generator, jenis soal, dan `describe`. `src/topics/registry.ts` menemukan modul melalui `import.meta.glob` dan mengurutkannya berdasarkan nomor. `TopicPage` tidak lagi mengimpor atau memilih komponen topik secara manual.
- `ARCH-02`: `buatSoal` dan pembentukan paket kuis mendelegasikan pembuatan soal ke generator modul. Implementasi generator lama tetap diekspor sebagai jalur kompatibilitas internal untuk isi 10 topik yang sudah ada agar isi soal dan hasil audit tidak berubah; generator topik baru dapat dimiliki langsung oleh modul tanpa menambah cabang dispatcher.
- `README.md` sekarang menjelaskan struktur `module.tsx`, kontrak modul, dan langkah menambah topik.

### Tes kontrak modul

`src/topics/registry.test.ts` memastikan 10 modul ditemukan dalam urutan 1–10, metadata dan konsep wajib terisi, setiap modul memiliki jenis soal, generator menghasilkan lima soal, serta `describe()` tidak menghasilkan `NaN` atau `undefined`.

## Tabel status temuan laporan

| ID | Status | Catatan implementasi atau alasan |
|---|---|---|
| ARCH-01 | Diperbaiki | `TopicModule` dan `import.meta.glob` menjadi sumber modul; `TopicPage` tidak lagi memilih komponen dengan ternary. |
| ARCH-02 | Menunggu keputusan | Dispatcher sudah mendelegasikan ke generator modul, tetapi 10 generator lama masih memakai implementasi kompatibilitas di `lib/quiz/generator.ts`. Pemisahan penuh berarti memindahkan sekitar 460 baris generator tanpa mengubah soal. |
| ARCH-03 | Tidak diperbaiki | Refaktor hook/subkomponen besar berisiko mengubah perilaku visual dan belum diperlukan untuk keselamatan kuis/drag. |
| NUM-01 | Tidak diperbaiki | Sentralisasi epsilon memerlukan keputusan toleransi domain dan audit numerik baru. |
| NUM-02 | Tidak diperbaiki | Validasi geometri menyeluruh memerlukan kontrak hasil baru; tidak diubah agar 10 topik tetap kompatibel. |
| NUM-03 | Tidak diperbaiki | Celah uji geometri lanjutan tetap menjadi pekerjaan berikutnya. |
| PERF-01 | Diperbaiki | `buatPenjadwalFrame` membatasi callback ke satu per frame dan `pointerup` melakukan flush akhir. |
| PERF-02 | Diperbaiki | Daftar path Topik 3 dan primitif SVG dimemoisasi. |
| PERF-03 | Diperbaiki | `pointerId`, `pointercancel`, dan cleanup scheduler ditangani di `DraggablePoint`. Multi-touch dua titik berbeda tetap perlu uji perangkat. |
| QUIZ-01 | Tidak diperbaiki | Union tipe `Question` terdiskriminasi memerlukan refaktor konten besar. |
| QUIZ-02 | Tidak diperbaiki | Fallback paket deterministik belum diubah; audit 2.000 seed lulus. |
| QUIZ-03 | Diperbaiki | Sesi kuis berversi, umur 24 jam, pilihan lanjut/mulai baru, dan penghapusan saat selesai/batal. |
| QUIZ-04 | Menunggu keputusan | Key skor lama tetap dipertahankan dan sekarang memvalidasi allowlist topik. Migrasi ke `{ version, scores }` menunggu keputusan kompatibilitas/reset skor. |
| CONTENT-01 | Tidak diperbaiki | Pemisahan narasi dan formula memerlukan perubahan format konten. |
| CONTENT-02 | Diperbaiki | Kontrak `describe` untuk 10 topik dan tes token `NaN`/`undefined` ditambahkan; lint semua narasi KaTeX masih lanjutan. |
| PWA-01 | Menunggu keputusan | Build masih mempertahankan fallback `woff`/`ttf`; service worker mem-precache `woff2`. Perlu matriks browser target sebelum menghapus fallback. |
| PWA-02 | Diperbaiki | `registerType: 'prompt'`, updateSW tertunda saat kuis aktif, sesi kuis tersimpan. |
| PWA-03 | Diperbaiki | Ikon 512 mendeklarasikan `any maskable` dan `onOfflineReady` menampilkan status siap offline. Safe area ikon tetap perlu uji launcher. |
| A11Y-01 | Diperbaiki | Canvas memiliki `title`, `desc`, ringkasan dinamis, dan live region debounce 500 ms. Interaksi pembaca layar nyata tetap perlu uji. |
| A11Y-02 | Diperbaiki | Titik fokusable, role button, label posisi, panah/Shift, dan kendala geometri. Home/End hanya tersedia melalui callback khusus; kontrol slider/numerik bespoke untuk setiap titik bebas masih menjadi keputusan UX. |
| A11Y-03 | Diperbaiki | Tab/panel memakai `tablist`, `tab`, `aria-selected`, `aria-controls`, dan `tabpanel`. |
| A11Y-04 | Diperbaiki | Media query reduced motion diperluas ke transition/animation global. |
| RESP-01 | Diperbaiki | `clientToSvg` memakai inversi CTM, sehingga letterboxing, skala, rotasi, dan perubahan ukuran memakai transform aktual SVG. |
| RESP-02 | Tidak diperbaiki | Matriks uji visual lintas ukuran tetap perlu perangkat/browser atau smoke test visual. |
| TOOL-01 | Tidak diperbaiki | Tidak menambah dependensi lint/format/CI sesuai batasan pekerjaan. |
| TOOL-02 | Tidak diperbaiki | `noUncheckedIndexedAccess` dan `noUnusedLocals` belum diaktifkan karena perlu perbaikan lint/type terpisah. |
| TOOL-03 | Tidak diperbaiki | `npm audit` jaringan belum dijalankan; audit lokal tetap tidak boleh dianggap bukti terbaru. |
| SEC-01 | Tidak diperbaiki | Renderer KaTeX masih memakai `dangerouslySetInnerHTML` untuk string kode tepercaya; tidak ada jalur input siswa ke renderer. |
| SEC-02 | Menunggu keputusan | KaTeX tidak dinaikkan sesuai instruksi; pembaruan patch dilakukan oleh pemilik proyek. |
| SEC-03 | Menunggu keputusan | Skor global perangkat bersama dipertahankan. Perlu keputusan apakah menambah tombol hapus/reset. |
| DEPLOY-01 | Menunggu keputusan | Preview root lulus; deploy nyata di subfolder belum dilakukan. |
| DEPLOY-02 | Diperbaiki | Header cache untuk `index.html`, `sw.js`, manifest, dan aset hashed ditambahkan ke README. |
| MAINT-01 | Diperbaiki | README dan tes kontrak menjelaskan satu modul per folder serta pemeriksaan wajib. |
| MAINT-02 | Tidak diperbaiki | Komentar alasan algoritme geometri/layout belum ditambahkan. |

## Verifikasi akhir

### Perintah dan hasil

- `npm run test`: **18 berkas, 119 tes lulus**. Tes lama tetap lulus; tes baru mencakup koordinat, sesi kuis, policy update, frame, keyboard, deskripsi, dan registry.
- `npx vitest run --config scripts/audit/vitest.config.ts`: **3 tes lulus**, termasuk 2.000 seed per jenis soal. Audit memperbarui `docs/audit-soal.md` dan `docs/sampel-soal.md` tanpa temuan Kritis/Tinggi.
- `npm run build`: lulus; TypeScript dan Vite berhasil, **133 modul**, waktu Vite terakhir **6,31 detik**.
- Artefak `dist`: **1.823.290 byte** (sekitar 1,74 MiB; `du -sb`). Chunk terbesar: aplikasi 355.155 byte, KaTeX 260.451 byte, CSS 56.171 byte, React 49.633 byte. Aset individual terbesar adalah font KaTeX AMS TTF 63.632 byte.
- Precache: **32 entri, 965,03 KiB**.
- `npm run preview` berhasil setelah izin membuka port diberikan. `index.html`, `manifest.webmanifest`, `sw.js`, dan `workbox-2fbc6a65.js` masing-masing merespons **HTTP 200**. Static scan bundle tidak menemukan endpoint jaringan aplikasi; URL React error dan namespace SVG/MathML adalah referensi runtime/library, bukan permintaan aplikasi.

### Berkas yang diubah atau dibuat

- SVG/drag: `src/components/svg/Canvas.tsx`, `DraggablePoint.tsx`, `Primitives.tsx`, `coordinates.ts`, `dragFrame.ts`, `keyboard.ts`, dan tesnya.
- Kuis/PWA: `src/components/QuizEngine.tsx`, `UpdateToast.tsx`, `updatePolicy.ts`, `src/lib/quiz/session.ts`, `src/main.tsx`, `vite.config.ts`, `src/lib/storage.ts`.
- Aksesibilitas: `src/components/Tabs.tsx`, `src/pages/TopicPage.tsx`, `src/topics/descriptions.ts`, dan tes deskripsi.
- Modul topik: `src/topics/types.ts`, `src/topics/registry.ts`, sepuluh `module.tsx`, generator adapter, serta `registry.test.ts`.
- Dokumentasi: `README.md` dan dokumen ini. Tidak ada dependensi yang ditambah/diubah dan tidak ada `npm install` atau `npm audit fix` dijalankan.

### Kinerja

| Ukuran | Sebelum | Sesudah |
|---|---:|---:|
| Jalur drag | `onChange` langsung pada setiap `pointermove` | Maksimal satu callback/frame, flush pada `pointerup` |
| Render primitif SVG | Tidak dimemoisasi | Lima primitif bersama memakai `React.memo` |
| Perhitungan juring Topik 3 | Array path dibuat setiap render | Array 64 + susunan juring memakai `useMemo` |
| Waktu frame dengan CPU throttled 4× | Belum diukur pada laporan awal | Belum diukur di lingkungan ini |

Angka waktu frame nyata belum dapat diisi secara bertanggung jawab tanpa Chrome DevTools dan perangkat target. Target yang harus diverifikasi adalah skrip per frame < 8 ms pada CPU throttled 4× untuk Topik 3, 4, 7, dan 10.

## Daftar uji manual yang wajib dilakukan

1. **Drag letterboxing dan rotasi:** buka Topik 1, 4, 7, 9, dan 10 pada lebar 360 px, 768 px, dan 1920 px. Letakkan jari/kursor tepat di pusat titik, mulai drag dari tepi area hit, pastikan titik tidak melompat, ubah orientasi potret/lanskap saat drag, lalu ulangi setelah resize.
2. **PWA update:** build dan pasang versi A, buka aplikasi sekali sampai offline ready, mulai kuis dan isi beberapa jawaban, build versi B dengan nama/revisi berbeda, buka versi B dari server, pastikan toast hanya menyatakan versi siap selama kuis, klik/akhiri kuis, pastikan pembaruan baru diterapkan setelah aman, dan muat ulang untuk memastikan sesi valid menawarkan “Lanjutkan kuis”. Uji “Mulai baru”, sesi rusak, dan sesi lebih dari 24 jam.
3. **Keyboard:** dengan Tab, lewati titik pada Topik 1, 4, 7, 9, dan 10 dalam urutan logis. Uji panah, Shift+panah, fokus kontras, kendala titik pada lingkaran, titik bebas, dan kontrol slider yang sudah ada.
4. **Pembaca layar:** jalankan Orca di Linux, dengarkan title/description kanvas dan ringkasan setelah pointerup/keyup. Pastikan drag panjang tidak mengumumkan setiap pointermove dan feedback kuis tidak diumumkan dua kali.
5. **Reduced motion:** aktifkan `prefers-reduced-motion`, uji pergantian tab, Topik 2 mode pengukuran, progress kuis, dan fokus keyboard.
6. **IFP/HP:** uji satu jari, dua jari pada titik berbeda, pointercancel dengan membuka panel sistem, drag setelah scroll, keyboard eksternal pada Android/Windows, dan kelas dengan proyektor.
7. **Ukuran/layout:** uji 320×640, 360×800, 768×1024, 1366×768, dan 3840×2160; periksa overflow horizontal, rumus dapat digulir, tombol minimal 44 px, teks terbaca dari jarak proyektor, dan tidak ada nilai terpotong.
8. **Offline/deploy subfolder:** salin `dist` ke `/lingkaran/`, buka `/lingkaran/`, buka `/#/topik/10-kedudukan`, periksa manifest, `sw.js`, ikon, reload offline, dan request aset relatif. Pastikan header `index.html`/`sw.js` `no-cache` dan aset berhash immutable.

## Keputusan yang diperlukan

1. **Font KaTeX:** (a) pertahankan `woff`, `woff2`, dan `ttf` untuk kompatibilitas IFP/Android; (b) precache semua format; atau (c) tetapkan browser minimum dan hanya pertahankan `woff2`. Rekomendasi: pilih (a) sampai matriks perangkat nyata selesai.
2. **Generator legacy:** (a) pertahankan adapter kompatibilitas saat ini; (b) pindahkan 10 cabang lama ke 10 `generator.ts` secara bertahap dengan snapshot hasil; atau (c) ubah tipe soal dulu lalu pindahkan. Rekomendasi: (b) setelah ada waktu khusus refaktor konten, karena risiko perubahan soal paling besar.
3. **Perangkat bersama:** (a) pertahankan skor global per browser; (b) tambahkan tombol reset skor lokal; atau (c) hapus skor saat aplikasi ditutup. Rekomendasi: (b), karena tidak mengganggu skor lama dan memberi kontrol kepada guru.
4. **Lint dan pemeriksaan tipe:** (a) tetap tanpa dependensi tambahan; (b) aktifkan `noUncheckedIndexedAccess`/`noUnusedLocals` bertahap; atau (c) tambahkan tooling dalam perubahan terpisah. Rekomendasi: (b) dulu, lalu putuskan CI.

## Putaran kecil: font, reset skor, lint

Putaran ini dikerjakan pada 10 Oktober 2026. Isi soal, rumus, dan perilaku simulasi tidak diubah.

### 1. Font KaTeX hanya woff2

Transformasi CSS dibuat sebagai fungsi murni `filterKatexFonts()` di `src/lib/katexFontTransform.ts`. Plugin `katexWoff2Only` di `vite.config.ts` menjalankannya pada berkas CSS KaTeX berdasarkan path paket dan ekstensi CSS, bukan nomor baris atau isi yang spesifik pada satu versi. Parser kecilnya memecah daftar `src` dengan memperhatikan tanda kurung dan kutip, lalu menghapus URL `.woff` dan `.ttf` hanya dari blok `@font-face` keluarga `KaTeX`. Format lain dan keluarga font lain tetap dipertahankan.

Tes baru di `src/lib/katexFontTransform.test.ts` mencakup CSS tiga format, CSS tanpa `@font-face`, keluarga selain KaTeX, dan format lain seperti `otf`.

| Ukuran | Sebelum putaran | Sesudah putaran |
|---|---:|---:|
| Total `dist/` | 1.823.290 byte | 1.006.878 byte |
| Font woff2 | 19 berkas / 256.168 byte | 19 berkas / 256.168 byte |
| Font woff | 20 berkas / 303.116 byte | 0 berkas / 0 byte |
| Font ttf | 20 berkas / 513.664 byte | 0 berkas / 0 byte |
| URL font pada CSS hasil build | 59 | 19, semuanya woff2 |
| Precache | 32 entri / sekitar 988.191 byte / 965,03 KiB | 32 entri / 988.558 byte / 965,39 KiB |

Perubahan total `dist/` adalah pengurangan 816.412 byte. Precache memang hanya berisi woff2 sejak konfigurasi sebelumnya; perubahan `globPatterns` sekarang menuliskan pola aset umum dan `**/*.woff2` secara terpisah sehingga woff dan ttf tidak ikut secara tidak sengaja. Pada hasil akhir, jumlah byte file unik yang dihitung dalam precache (tidak menghitung `manifest.webmanifest`) adalah 988.558 byte. Selisih kecil ukuran precache berasal dari kode reset dan skrip aplikasi yang bertambah pada putaran ini.

`npm run build` terakhir berhasil, 133 modul, waktu Vite 4,44 detik. `scripts/check-preview-assets.mjs` mengambil index, stylesheet, setiap URL font dalam CSS, manifest, dan service worker. Hasilnya: 1 CSS, 19 font, manifest, dan service worker HTTP 200. Tidak ada file `.woff` atau `.ttf` di `dist/`, dan seluruh URL font CSS menunjuk file yang ada.

Browser minimum operasional sekarang adalah browser modern yang mendukung WOFF2. Browser lama tanpa WOFF2 tidak lagi memiliki fallback font KaTeX. Kompatibilitas tampilan di Chrome desktop sudah diverifikasi lewat build dan preview; IFP dan HP yang dipakai di kelas **perlu uji manual**.

### 2. Reset skor perangkat bersama

Beranda (`src/pages/Home.tsx`) sekarang memiliki tombol sekunder **“Hapus skor di perangkat ini”** di bagian bawah. Tombol membuka elemen `<dialog>` modal dengan judul, penjelasan, tombol **Batal** dan **Hapus**. Fokus awal diarahkan ke Batal, Tab dijaga di dalam dialog, Escape menutup, dan fokus dikembalikan ke tombol pemicu.

Modul `src/lib/storage.ts` menjadi pusat daftar kunci progres:

| Kunci | Isi | Dihapus oleh reset |
|---|---|---|
| `simulasi-lingkaran-skor-terbaik` | skor terbaik per topik yang sudah ada | Ya |
| `simulasi-lingkaran-sesi-kuis` | sesi kuis tersimpan untuk pemulihan, termasuk field `versi` | Ya |

Belum ada kunci penanda skema terpisah. Daftar eksplisit `KUNCI_PROGRESS_APLIKASI` dipakai agar kunci asing pada origin yang sama tidak tersentuh. `clearAllProgress()` mengembalikan `false` bila storage gagal diakses; Beranda menampilkan pesan netral dan tetap dapat digunakan. Setelah berhasil, kartu skor dirender ulang tanpa reload dan region `aria-live` mengumumkan “Skor di perangkat ini sudah dihapus.”

Tes tambahan di `src/lib/storage.test.ts` membuktikan skor lama tetap terbaca, semua kunci aplikasi dan hanya kunci tersebut terhapus, kunci asing bertahan, pemanggilan kedua idempoten, serta kegagalan storage tidak melempar galat. Belum ada pustaka tes komponen di project, sehingga interaksi dialog **perlu uji manual**.

### 3. ESLint dan `npm run check`

Paket `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, dan `globals` tidak ada di `node_modules`. Percobaan pemasangan tidak membuat paket tersedia dan `package.json`/lockfile tidak diberi referensi paket yang tidak terpasang. Karena itu, `eslint.config.js` sudah disiapkan tetapi `npm run lint` memakai `scripts/run-lint.mjs`, yang berhenti dengan pesan jelas:

```text
ESLint belum terpasang. Jalankan perintah instalasi pada bagian “Langkah untuk Bapak” di docs/perbaikan-teknis.md.
```

Konfigurasi memakai rekomendasi `@eslint/js` dan `typescript-eslint`, `rules-of-hooks` sebagai error, serta `exhaustive-deps` sebagai peringatan. `dist/`, `node_modules/`, `coverage/`, dan `docs/` diabaikan. Tidak ada pengecualian massal atau perbaikan hook yang dilakukan. Karena executable belum ada, belum ada daftar peringatan lint yang dapat dinilai.

Skrip yang ditambahkan:

```json
"lint": "node scripts/run-lint.mjs",
"check": "npm run lint && npm run test && npm run build"
```

### Langkah untuk Bapak

Jalankan dari root project saat registry npm tersedia:

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks globals
npm run lint
npm run check
```

Jika lint menemukan peringatan `react-hooks/exhaustive-deps`, tinjau satu per satu sebelum mengubah dependency array. Pada putaran ini saya tidak menambahkan Prettier, CI, atau pengetatan `tsconfig`.

### Verifikasi akhir putaran

- `npm run test`: **19 berkas, 124 tes lulus**; 119 tes sebelumnya tetap lulus dan 5 tes baru mencakup transformasi font serta reset storage.
- `npx vitest run --config scripts/audit/vitest.config.ts`: **3 tes lulus**, termasuk audit 2.000 seed per jenis soal.
- `npm run build`: **lulus**, tanpa error TypeScript.
- `npm run lint`: **belum dapat dijalankan** karena paket ESLint belum terpasang; fallback berhenti dengan pesan yang dapat ditindaklanjuti.
- `npm run preview` dan `node scripts/check-preview-assets.mjs http://127.0.0.1:4173/`: index, CSS, 19 font, manifest, dan service worker HTTP 200. Pemindaian string build hanya menemukan URL namespace SVG/MathML, URL pesan error library, dan URL dokumentasi Workbox; tidak ada endpoint aplikasi yang dipanggil.

### Uji manual yang masih wajib

1. Di Chrome, buka Topik 3 dan Topik 8 dalam mode offline setelah instalasi PWA; pastikan semua rumus tetap memakai font yang benar. Ulangi pada IFP dan HP kelas.
2. Isi skor pada dua topik, mulai kuis ketiga tanpa menyelesaikan, kembali ke Beranda, pilih “Hapus skor di perangkat ini”, dan pastikan semua skor hilang serta “Lanjutkan kuis” tidak muncul. Uji Batal, Escape, fokus keyboard, sentuhan, dan pembaca layar.
3. Uji tombol dialog dengan keyboard dan satu jari di IFP/HP; pastikan fokus tidak keluar dari modal dan fokus kembali ke pemicu.
4. Pasang ESLint sesuai perintah di atas, lalu jalankan `npm run lint` dan `npm run check`; catat peringatan hook tanpa memperbaikinya otomatis.

### Pembaruan setelah ESLint dipasang

Paket ESLint dan plugin dipasang oleh pemilik project dengan perintah yang tercantum di atas. Konfigurasi kemudian diperbaiki untuk mengenali global Node pada `scripts/*.mjs`/`*.js`, sehingga `process`, `console`, `URL`, dan `fetch` tidak lagi dilaporkan sebagai undefined. Variabel tak terpakai yang aman dihapus dari `scripts/audit/audit-soal.test.ts`, `src/topics/01-unsur/labelLayout.ts`, `src/topics/02-keliling/pi/ArchimedesMode.tsx`, dan `src/topics/09-garis-singgung/Explore.tsx`.

Status terbaru: `npm run lint` menghasilkan **0 error dan 2 peringatan**. Keduanya adalah `react-hooks/exhaustive-deps` pada `src/topics/02-keliling/pi/ArchimedesMode.tsx` untuk `useMemo` `titikDalam` dan `titikLuar` (baris 56–57). Dependency array tidak diubah karena perubahan tersebut perlu tinjauan perilaku render terpisah. `npm run check` sekarang lulus: lint, 124 tes, dan build.

Output pemasangan yang diberikan pemilik project melaporkan 4 vulnerability pada dependency tree (1 low, 1 moderate, 2 critical). `npm audit fix` tidak dijalankan sesuai batasan putaran ini; pembaruan dependency menjadi keputusan terpisah.
