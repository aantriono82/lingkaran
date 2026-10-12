# Catatan Implementasi UI Arah B "Modern Interactive Classroom"

Dokumen ini mencatat keputusan teknis, metrik ukuran bundel, tes otomatis, dan daftar uji manual untuk implementasi UI Arah B pada project **Simulasi Lingkaran SMP**.

---

## Putaran 1: Fondasi (Token, Font, Kontras, Mode IFP)

### 1. Ringkasan Perubahan
1. **Sistem Token Desain Arah B (`src/lib/tokens.ts` & `src/styles.css`)**:
   - Seluruh blok `:root` diganti dengan arsitektur token berlapis: warna permukaan terkalibrasi WCAG AAA, palet tema navy-amber, palet geometri baku, tipografi fluid `clamp()` berbatas `rem`, spasi 4px/8px, radius sudut, elevasi bayangan lembut, dan durasi mikro-transisi.
   - Warna hex hardcode yang tersebar di `src/styles.css` dan `src/topics/` telah dimigrasikan ke variabel CSS dan konstanta token terpusat.
2. **Font Lokal Offline Plus Jakarta Sans Variabel**:
   - Mengimpor font variabel **Plus Jakarta Sans** (subset Latin saja: `plus-jakarta-sans-latin-wght-normal.woff2` dan `plus-jakarta-sans-latin-wght-italic.woff2`) dari paket `@fontsource-variable/plus-jakarta-sans`.
   - Mengabaikan subset Cyrillic dan Vietnamese untuk meminimalkan beban precache.
   - Mengonfigurasi `font-display: swap`, tumpukan font cadangan sistem, dan `font-variant-numeric: tabular-nums` untuk penyajian angka yang kokoh.
3. **Kontras & Aksesibilitas Tipografi**:
   - Teks utama (`#0e2238`) memiliki rasio kontras 15.8:1 terhadap putih (WCAG AAA).
   - Teks lembut (`#334e68`) memiliki rasio kontras 7.2:1 terhadap putih (WCAG AAA).
   - Batas kartu dipertegas dengan garis 1.5px (`#d0e0ee`).
   - Ukuran font terkecil diatur minimal 14px (`clamp(0.875rem, ...)` / `var(--font-ukuran-sm)`) agar terbaca jelas di proyektor kelas.
   - Cincin fokus keyboard diperbarui menjadi kontras tinggi (`outline: 3px solid var(--warna-garis-fokus); outline-offset: 3px;`).
4. **Palet Geometri Baru & Diferensiasi Non-Warna**:
   - Migrasi ke palet geometri: radius (`#0284c7`), diameter (`#dc2626`), tali busur (`#059669`), busur (`#7c3aed`), juring (`#ea580c`), tembereng (`#d97706`), apotema (`#e11d48`).
   - Tali busur diberi pola putus-putus (`stroke-dasharray="6 4"` dan gaya legend `putus`).
   - Apotema memiliki garis putus-putus berpenanda sudut siku-siku (`RightAngleMarker`).
   - Juring dan tembereng memiliki pembeda opasitas/isi yang tegas.
5. **Mode Kelas / IFP (Dasar)**:
   - Dibuat `IfpProvider` dan hook `useIfp()` di `src/lib/ifpContext.tsx`.
   - Saat Mode Kelas aktif, kelas `.mode-ifp` ditambahkan pada `<body>` dan variabel `--skala-garis: 1.3` disetel secara reaktif.
   - Seluruh elemen SVG dasar (`Circle`, `Segment`, `Arc`, `AngleMarker`, `RightAngleMarker`, `DraggablePoint`) membaca `skalaGaris` dan mempertebal garis serta memperbesar target sentuh sentral sebesar 30%.
   - Kontrol, tab, tombol, dan chip otomatis memiliki tinggi minimum 54px saat mode kelas aktif.
   - Tombol saklar "Mode kelas" disematkan di header Beranda dan header Halaman Topik dengan atribut `aria-pressed`.
   - Pilihan preferensi Mode Kelas disimpan di `localStorage` melalui kunci terpusat `simulasi-lingkaran-preferensi-mode-ifp` dan **tidak ikut terhapus** saat pengguna menekan "Hapus skor di perangkat ini".
6. **Denyut Titik Seret (*Pulsing Halo*)**:
   - Diterapkan pada `DraggablePoint` menggunakan lingkaran halo dengan animasi murni `transform: scale()` dan `opacity` (`transform-box: fill-box; transform-origin: center`).
   - Tidak mengubah atau menganimasikan atribut `r`.
   - Halo otomatis berhenti saat titik sedang diseret (`sedangGeser`) atau setelah interaksi pertama pengguna pada titik tersebut, serta sepenuhnya dimatikan pada `@media (prefers-reduced-motion: reduce)`.
7. **Transisi Masuk Tab**:
   - Panel tab (`[role="tabpanel"]`) memiliki animasi masuk 220ms (`opacity` dan `transform: translateY(6px)` ke `0`), dan dinonaktifkan pada reduced-motion.
8. **Tombol Destruktif Dialog Reset Skor**:
   - Tombol konfirmasi "Hapus skor" pada dialog modal diberi kelas `.button.danger` berwarna merah destruktif (`#dc2626`) dengan teks yang eksplisit, sementara fokus keyboard awal tetap berada pada tombol "Batal".

---

### 2. Ukuran Bundel & Precache (Sebelum vs Sesudah)

| Metrik | Sebelum Putaran 1 | Sesudah Putaran 1 | Perubahan |
| :--- | :--- | :--- | :--- |
| **Berkas Font woff2 Baru** | 0 KB | 56.95 KB (2 berkas) | +56.95 KB |
| - `plus-jakarta-sans-latin-wght-normal.woff2` | - | 27.35 KB | +27.35 KB |
| - `plus-jakarta-sans-latin-wght-italic.woff2` | - | 29.60 KB | +29.60 KB |
| **CSS Bundel (`dist/assets/*.css`)** | 54.44 KB (gzip: 13.84 KB) | 62.09 KB (gzip: 14.91 KB) | +7.65 KB (gzip: +1.07 KB) |
| **JS Bundel Utama (`dist/assets/index-*.js`)** | 357.22 KB (gzip: 107.38 KB) | 360.07 KB (gzip: 108.25 KB) | +2.85 KB (gzip: +0.87 KB) |
| **Entri Precache PWA (`sw.js`)** | 32 entri (965.35 KiB) | 34 entri (1031.23 KiB) | +2 entri (+65.88 KiB) |

> **Catatan Target:** Penambahan total precache hanya **+65.88 KiB**, jauh di bawah batas target maksimal sekitar 120 KB (hanya terpakai ~55% dari batas).

---

### 3. Berkas yang Diubah & Ditambahkan

#### Berkas Baru:
- [`src/lib/tokens.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/tokens.ts): Token warna tema dan palet geometri baku.
- [`src/lib/contrast.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/contrast.ts): Fungsi kalkulasi relative luminance dan rasio kontras WCAG 2.1.
- [`src/lib/contrast.test.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/contrast.test.ts): Unit test rasio kontras teks dan geometri.
- [`src/lib/ifpContext.tsx`](file:///home/aantriono/Dev/lingkaran/src/lib/ifpContext.tsx): Konteks React untuk Mode Kelas/IFP dan faktor skala garis SVG.
- [`src/lib/tokens.test.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/tokens.test.ts): Pemindaian otomatis untuk memastikan tidak ada warna hex terlarang/lama di `src/`.

#### Berkas Diubah:
- [`src/styles.css`](file:///home/aantriono/Dev/lingkaran/src/styles.css): `@font-face` lokal, token `:root`, gaya `.mode-ifp`, animasi halo, transisi tab, fokus cincin, tombol destruktif, migrasi hex ke variabel.
- [`src/App.tsx`](file:///home/aantriono/Dev/lingkaran/src/App.tsx): Membungkus pohon aplikasi dengan `IfpProvider`.
- [`src/lib/storage.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/storage.ts): Menambahkan `KUNCI_PREFERENSI_MODE_IFP`, `bacaPreferensiModeIfp`, `simpanPreferensiModeIfp`. Memastikan `clearAllProgress` tidak menghapus preferensi tampilan.
- [`src/lib/storage.test.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/storage.test.ts): Tes penyimpanan preferensi IFP dan ketahanannya terhadap reset skor.
- [`src/components/svg/Primitives.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/svg/Primitives.tsx): Membaca `skalaGaris` untuk penskalaan ketebalan garis SVG yang akurat.
- [`src/components/svg/DraggablePoint.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/svg/DraggablePoint.tsx): Aura denyut (*halo*) dengan `transform: scale()`, integrasi reduced-motion, dan penskalaan ukuran IFP.
- [`src/components/svg/Canvas.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/svg/Canvas.tsx): Mengganti warna pola kisi dengan `var(--warna-garis)`.
- [`src/components/TopicLayout.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/TopicLayout.tsx): Menambahkan tombol saklar "Mode kelas" dengan `aria-pressed`.
- [`src/pages/Home.tsx`](file:///home/aantriono/Dev/lingkaran/src/pages/Home.tsx): Menambahkan tombol "Mode kelas" dan tombol bahaya destruktif pada modal hapus skor.
- [`src/topics/01-unsur/unsur.ts`](file:///home/aantriono/Dev/lingkaran/src/topics/01-unsur/unsur.ts): Mengubah gaya tali busur menjadi `putus`.
- [`src/topics/01-unsur/Explore.tsx`](file:///home/aantriono/Dev/lingkaran/src/topics/01-unsur/Explore.tsx): Menambahkan pola garis putus-putus pada segmen tali busur.
- [`src/topics/01-unsur/Calculations.tsx`](file:///home/aantriono/Dev/lingkaran/src/topics/01-unsur/Calculations.tsx): Mengganti warna kanvas statis dengan token.
- [`src/topics/03-luas/Explore.tsx`](file:///home/aantriono/Dev/lingkaran/src/topics/03-luas/Explore.tsx): Mengganti penanda dimensi dengan token.
- [`src/topics/*/module.tsx`](file:///home/aantriono/Dev/lingkaran/src/topics): Mengganti warna tema topik 01 sampai 10 dengan token `WARNA_GEOMETRI`.
- [`index.html`](file:///home/aantriono/Dev/lingkaran/index.html) & [`vite.config.ts`](file:///home/aantriono/Dev/lingkaran/vite.config.ts): Memperbarui `theme_color` dan `background_color` ke token Direction B.

---

### 4. Daftar Keputusan Mandiri
1. **Pemilihan Subset Font Latin Murni**:
   Mengimpor berkas font langsung melalui `@font-face` di CSS (bukan `@import '@fontsource-variable/plus-jakarta-sans/index.css'`) untuk membatasi unduhan woff2 hanya ke `latin-normal` dan `latin-italic`. Ini menghemat lebih dari 60 KB dibandingkan mengikutsertakan cyrillic dan vietnamese.
2. **Konteks React vs CSS Variables untuk SVG Scale (Koreksi 1)**:
   Menggabungkan keduanya: `IfpProvider` menyetel variabel CSS `--skala-garis: 1.3` pada elemen akar dan mengekspos `skalaGaris: number` via hook `useIfp()`. Dengan demikian, elemen SVG murni React (`Segment`, `Circle`, `Arc`, `DraggablePoint`) menerima prop numerik terkalibrasi tanpa bergantung pada keterbatasan CSS `stroke-width` pada elemen SVG anak.
3. **Penghentian Denyut Titik Seret (Koreksi 2)**:
   Menambahkan status `sedangGeser` dan `pernahDisentuh` pada titik seret sehingga cincin denyut berhenti seketika saat siswa mulai menyentuh titik, dan tidak mengganggu perhatian visual setelah siswa memahami bahwa titik tersebut dapat digeser.
4. **Isolasi Preferensi Mode Kelas terhadap Pembersihan Progres**:
   Kunci `simulasi-lingkaran-preferensi-mode-ifp` sengaja dikecualikan dari `KUNCI_PROGRESS_APLIKASI` agar guru yang mengatur layar kelas tidak perlu menyalakan ulang Mode Kelas setiap kali menghapus riwayat skor siswa.

---

### 5. Keputusan yang Menunggu Bapak
1. **Peletakan Posisi Tombol Mode Kelas di Beranda pada Putaran 2**:
   Saat ini tombol diletakkan di sisi kanan header hero beranda. Pada Putaran 2, saat tata letak hero baru dengan tombol primer "Lanjutkan Topik" diterapkan, kita dapat memutuskan apakah tombol ini tetap di hero atau disematkan di topbar navigasi atas yang ramping.
2. **Preset Ketebalan Garis Mode IFP**:
   Saat ini skala garis diatur ke 1.3 (+30%). Mohon dievaluasi saat uji coba visual pada layar sentuh IFP sungguhan di kelas apakah ketebalan garis sudah pas atau perlu dinaikkan ke 1.35.

---

### 6. Daftar Uji Manual yang Perlu Dilakukan
- [ ] **Rumus KaTeX**: Buka tab Konsep pada Topik 01, 02, dan 03. Pastikan tidak ada rumus matematika KaTeX yang terpotong, bergeser baseline secara janggal, atau terdesak oleh ukuran font baru.
- [ ] **Keterbacaan Font Plus Jakarta Sans**: Pastikan font termuat mulus dengan `font-display: swap` tanpa flicker teks tak terlihat (FOIT), dan angka tabular tersusun rata secara vertikal pada tabel data keliling.
- [ ] **Mode Kelas pada Layar Besar (1920px & IFP)**:
  - Klik tombol "Mode kelas" di header.
  - Periksa seluruh garis SVG menebal dengan tegas dan proporsional.
  - Periksa ukuran tombol tab, chip unsur, slider, dan tombol aksi membesar (tinggi minimal 54px) dan nyaman ditekan dengan jari.
- [ ] **Aura Denyut Titik Seret**: Amati titik A dan B pada Topik 01. Titik seret harus memiliki cincin halo yang berdenyut halus, berhenti saat mulai digeser, dan hilang saat mode *prefers-reduced-motion* diaktifkan di pengaturan sistem/peramban.
- [ ] **Modal Reset Skor**: Tekan "Hapus skor di perangkat ini". Pastikan tombol "Batal" langsung mendapat fokus keyboard, dan tombol "Hapus skor" berwarna merah tegas. Setelah dihapus, periksa apakah Mode Kelas tetap aktif (tidak ikut terhapus).
- [ ] **PWA Offline**: Matikan koneksi internet (atau centang Offline di tab Network DevTools), lalu muat ulang halaman. Pastikan seluruh font, aplikasi, dan grafik tetap terbuka 100% tanpa jaringan.

---

## Putaran 2: Beranda (Arah B: Modern Interactive Classroom)

### 1. Ringkasan Perubahan
1. **Bilah Atas Bersama (`src/components/AppTopBar.tsx`)**:
   - Dibuat komponen navigasi atas tunggal yang disematkan pada **Beranda dan seluruh Halaman Topik** pada posisi yang identik (sticky top).
   - Di sisi kiri: Logo lingkaran geometris dan nama aplikasi *"Simulasi Lingkaran SMP"* beserta subjudul *"Matematika SMP Kelas 9 · Kurikulum Merdeka"* yang berfungsi sebagai tautan kembali ke Beranda (`/`).
   - Di sisi kanan: **Lencana "Siap offline"** (hanya muncul saat cache service worker selesai) dan **tombol saklar "Mode kelas"** (`aria-pressed`, ikon layar IFP, dan teks jelas).
   - Tombol Mode Kelas dipindahkan dari header hero beranda dan header topik ke bilah atas ini. Di halaman topik, bilah atas menggantikan tempat tombol lama tanpa mengutak-atik judul dan navigasi sub-header topik (Putaran 3).
   - Responsif di layar HP (360px): label teks berubah menjadi ikon dengan nama aksesibel (`aria-label`) tanpa memotong atau membuat bilah atas meluap (*overflow*).
2. **Metadata Rumpun Kurikulum (`src/types.ts` & `src/topics/registry.ts`)**:
   - Menambahkan metadata rumpun untuk empat kelompok materi:
     - **Rumpun I (Bagian-Bagian dan Ukuran Lingkaran)**: Topik 01 (*Unsur-unsur*), 02 (*Keliling*), 03 (*Luas*).
     - **Rumpun II (Sudut-Sudut pada Lingkaran)**: Topik 04 (*Sudut pusat & keliling*), 05 (*Sudut dua tali busur*), 06 (*Segi empat tali busur*).
     - **Rumpun III (Segitiga dan Lingkaran)**: Topik 07 (*Lingkaran dalam segitiga*), 08 (*Lingkaran luar segitiga*).
     - **Rumpun IV (Garis Singgung dan Kedudukan)**: Topik 09 (*Garis singgung lingkaran*), 10 (*Kedudukan dua lingkaran*).
   - Seluruh modul di `src/topics/*/module.tsx` diperbarui dengan `rumpun: RumpunId`.
3. **Hero Baru & Widget Kemajuan Belajar (`src/pages/Home.tsx` & `src/lib/progress.ts`)**:
   - Tata letak hero modern navy bergradien dengan tipografi display tebal dan deskripsi eksploratif.
   - **Tombol Aksi Dinamis**:
     - Bila belum ada progres: *"Mulai dari Topik 1"*.
     - Bila siswa sudah pernah membuka topik: *"Lanjutkan: Topik N · Nama topik"*.
   - **Widget Progres Belajar Interaktif**:
     - Menampilkan indikator angka `"X / 10 Topik Selesai"`.
     - Elemen bilah kemajuan aksesibel dengan atribut `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="10"`, dan label deskriptif teks (bukan hanya warna).
     - Menghitung **rata-rata skor kuis** (skala 5) dengan ikon bintang bagi topik-topik yang sudah diselesaikan.
     - Menyematkan kartu mini jalan pintas *"Terakhir Dibuka"* di dalam widget.
   - Menghapus statistik lama yang kurang bermakna (*"10 topik / 10 simulasi aktif / 4 mode belajar"*).
4. **Definisi Topik Selesai**:
   > **Definisi:** Sebuah topik dianggap **selesai** jika dan hanya jika kuis topik tersebut telah diselesaikan oleh siswa dan nilai terbaiknya tersimpan di penyimpanan terpusat (`ambilSkorTerbaik(topikId) !== null` dengan nilai bulat 0 sampai 5). Membuka tab konsep atau kanvas saja tanpa menyelesaikan kuis tidak dihitung sebagai topik selesai.
5. **Pencatatan Topik Terakhir Dibuka (`src/lib/storage.ts`)**:
   - Kunci terpusat: `simulasi-lingkaran-topik-terakhir`.
   - Skema data berversi: `{ versi: 1, topikId, waktu: number }`.
   - Otomatis diperbarui saat siswa membuka halaman topik di `TopicPage`.
   - Ikut terhapus bersih saat pengguna memilih *"Hapus skor di perangkat ini"* (`clearAllProgress()`), sementara preferensi Mode Kelas tetap bertahan.
   - Tahan terhadap data rusak, perubahan versi skema, atau id topik asing.
6. **Lencana "Siap Offline" Murni (`src/lib/offline.ts`)**:
   - Logika murni `tentukanStatusOffline()` memvalidasi keberadaan Service Worker API, event `pwa-offline-ready`, dan status `navigator.serviceWorker.controller`.
   - Tidak pernah menampilkan klaim palsu *"100% offline"* sebelum cache service worker diverifikasi selesai. Bila belum siap, lencana disembunyikan secara bersih.
7. **10 Miniatur SVG Khas Topik (`src/components/miniatur/`)**:
   - Seluruh 10 miniatur SVG kustom diporting ke komponen React statis ber-token (`src/components/miniatur/Miniatur*.tsx`) dengan peta terpusat `petaMiniatur` di `index.ts`.
   - Menggunakan token `WARNA_GEOMETRI` dan `WARNA_TEMA`, ber-`aria-hidden="true"`, dan bebas dari warna hardcode hex terlarang.
   - Status kartu menyajikan label eksplisit *"Belum dicoba"* atau *"★ Skor X/5"*.
   - Label aksesibel kartu (`aria-label`) membacakan nomor, nama topik, dan status kemajuan.
   - Efek hover/fokus mengangkat kartu 4px dengan bayangan lembut, dan dimatikan sepenuhnya pada `prefers-reduced-motion: reduce`.
8. **Tata Letak Bebas Kartu Menggantung**:
   - Rumpun I dan II disajikan dalam grid responsif 3 kolom di desktop.
   - Rumpun III (2 topik) dan IV (2 topik) diletakkan bersisian (*side-by-side*) dalam `.rumpun-duo-grid` pada desktop lebar, lalu bertransisi ke 2 kolom pada tablet, dan 1 kolom pada HP 360px.
   - Menghilangkan anomali 2 kartu menggantung dari versi awal.
9. **Footer & Tombol Hapus Skor Baru**:
   - Tombol *"Hapus skor di perangkat ini"* diposisikan di footer kartu dengan gaya tombol sekunder berbingkai (*outline button*), jarak aman dari tepi bawah layar, dan tidak mudah tertekan tidak sengaja saat menggulir di HP atau papan interaktif IFP.
   - Dialog modal konfirmasi tetap mempertahankan tombol *"Hapus skor"* merah destruktif, fokus awal pada *"Batal"*, dan penutupan dengan tombol Escape. Pembersihan skor memperbarui tampilan hero dan kartu secara langsung (*live update*) tanpa memuat ulang halaman, serta mengumumkan hasilnya via region `aria-live`.

---

### 2. Ukuran Bundel & Precache (Sebelum vs Sesudah Putaran 2)

| Metrik | Sesudah Putaran 1 | Sesudah Putaran 2 | Perubahan |
| :--- | :--- | :--- | :--- |
| **CSS Bundel (`dist/assets/*.css`)** | 62.09 KB (gzip: 14.91 KB) | 68.64 KB (gzip: 16.11 KB) | +6.55 KB (gzip: +1.20 KB) |
| **JS Bundel Utama (`dist/assets/index-*.js`)** | 360.07 KB (gzip: 108.25 KB) | 376.78 KB (gzip: 111.82 KB) | +16.71 KB (gzip: +3.57 KB) |
| **Total Ukuran Folder `dist/`** | 1.074 MB (1074458 B) | 1.097 MB (1097719 B) | +23.26 KB |
| **Entri Precache PWA (`sw.js`)** | 34 entri (1031.23 KiB) | 34 entri (1053.94 KiB) | 0 entri baru (+22.71 KiB) |

> **Catatan Efisiensi:** Penambahan 10 miniatur SVG kustom, bilah atas bersama, metadata rumpun, dan logika progres belajar hanya menambah **+22.71 KiB** pada precache offline PWA, jauh di bawah batas anggaran performa.

---

### 3. Berkas yang Diubah & Ditambahkan

#### Berkas Baru:
- [`src/lib/progress.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/progress.ts): Fungsi murni kalkulasi kemajuan belajar, persentase, rata-rata skor kuis, dan penentuan tombol aksi hero ("Mulai Topik 1" vs "Lanjutkan Topik N").
- [`src/lib/progress.test.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/progress.test.ts): Unit test logika kalkulasi progres, penanganan data kosong/rusak, dan tombol hero.
- [`src/lib/offline.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/offline.ts): Fungsi murni dan React hook untuk status kesiapan offline Service Worker.
- [`src/lib/offline.test.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/offline.test.ts): Unit test deteksi status offline service worker.
- [`src/components/AppTopBar.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/AppTopBar.tsx): Komponen bilah atas bersama dengan brand, lencana offline, dan tombol mode IFP.
- [`src/components/miniatur/`](file:///home/aantriono/Dev/lingkaran/src/components/miniatur): Folder berisi 10 komponen miniatur SVG khas (`MiniaturUnsur.tsx` sampai `MiniaturKedudukan.tsx`), `index.ts`, dan tes `miniatur.test.ts`.

#### Berkas Diubah:
- [`src/types.ts`](file:///home/aantriono/Dev/lingkaran/src/types.ts): Menambahkan `RumpunId`, `RumpunMeta`, `DAFTAR_RUMPUN`, dan field `rumpun` pada `TopicMeta`.
- [`src/topics/types.ts`](file:///home/aantriono/Dev/lingkaran/src/topics/types.ts): Menambahkan properti `rumpun` opsional pada antarmuka `TopicModule`.
- [`src/topics/*/module.tsx`](file:///home/aantriono/Dev/lingkaran/src/topics): Menambahkan `rumpun: 'rumpun-1'` s.d. `'rumpun-4'` pada seluruh 10 modul topik.
- [`src/topics/registry.ts`](file:///home/aantriono/Dev/lingkaran/src/topics/registry.ts): Menyertakan metadata rumpun pada `topicModules` dan menambahkan fungsi `ambilTopikPerRumpun()`.
- [`src/topics/registry.test.ts`](file:///home/aantriono/Dev/lingkaran/src/topics/registry.test.ts): Tes kontrak rumpun (kelengkapan 10 topik, pembagian 3-3-2-2, ketiadaan topik ganda).
- [`src/lib/storage.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/storage.ts): Menambahkan `KUNCI_TOPIK_TERAKHIR`, `simpanTopikTerakhir()`, `bacaTopikTerakhir()`, serta memasukkan kunci topik terakhir ke dalam `KUNCI_PROGRESS_APLIKASI`.
- [`src/lib/storage.test.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/storage.test.ts): Tes penyimpanan topik terakhir, verifikasi pembersihan progres, dan isolasi preferensi Mode Kelas.
- [`src/components/TopicLayout.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/TopicLayout.tsx): Menyematkan `AppTopBar` di bagian atas dan menghapus tombol mode IFP lama dari header topik.
- [`src/components/index.ts`](file:///home/aantriono/Dev/lingkaran/src/components/index.ts): Mengekspor `AppTopBar`.
- [`src/pages/TopicPage.tsx`](file:///home/aantriono/Dev/lingkaran/src/pages/TopicPage.tsx): Memanggil `simpanTopikTerakhir(meta.id)` saat halaman topik dimuat.
- [`src/pages/Home.tsx`](file:///home/aantriono/Dev/lingkaran/src/pages/Home.tsx): Membangun ulang Beranda Arah B (AppTopBar, hero progres, tombol dinamis, kelompok 4 rumpun, miniatur SVG, footer sekunder).
- [`src/styles.css`](file:///home/aantriono/Dev/lingkaran/src/styles.css): Gaya CSS bilah atas, hero banner baru, kartu topik baru, rumpun duo-grid, footer baru, aturan reduced motion, dan penyesuaian responsif.

---

### 4. Daftar Keputusan Mandiri
1. **Pengelompokan Rumpun III & IV Berdampingan**:
   Pada layar desktop (lebar > 1024px), Rumpun III (2 topik) dan Rumpun IV (2 topik) disajikan berdampingan dalam grid dua kolom (`.rumpun-duo-grid`). Masing-masing kolom memuat 2 kartu. Dengan cara ini, tidak ada lagi 2 kartu menggantung di baris terakhir yang tampak janggal pada layar lebar.
2. **Kondisi Tampilan Lencana Siap Offline**:
   Lencana disembunyikan sepenuhnya sampai service worker terbukti siap (baik melalui event `pwa-offline-ready` pada instalasi awal atau `navigator.serviceWorker.controller` pada kunjungan berikutnya). Ini menghindari pemberian rasa aman palsu kepada siswa atau guru sebelum cache offline benar-benar lengkap di memori perangkat.
3. **Penyimpanan Topik Terakhir dengan Skema Versi**:
   Objek `{ versi: 1, topikId, waktu: Date.now() }` disimpan di localStorage dengan validasi ketat terhadap array `TOPIC_IDS`. Bila terjadi korupsi data atau id tidak dikenal, fungsi jatuh kembali secara aman ke nilai `null` dan tombol hero menampilkan *"Mulai dari Topik 1"*.
4. **Target Sentuh Responsif pada HP 360px**:
   Pada layar sangat sempit (<= 480px), label teks pada tombol saklar Mode Kelas dan lencana offline disembunyikan sementara ikonnya tetap dipertahankan dengan target sentuh minimum 44px (54px di Mode Kelas) dan `aria-label` penuh, menjaga agar bilah atas tidak meluap (*overflow* horisontal).

---

### 5. Keputusan yang Menunggu Bapak
1. **Slot Nama / Logo Sekolah (`LOGO_SEKOLAH: tidak`)**:
   Sesuai pengaturan awal, slot logo sekolah saat ini tidak dibuat. Bila di masa mendatang sekolah menginginkan logo sekolah atau MGMP disematkan di bilah atas dan footer, kita dapat membuat modul konfigurasi `src/config/school.ts` pada putaran berikutnya.
2. **Perilaku Tombol "Lihat 10 Topik" pada Hero**:
   Saat ini tombol sekunder hero menggulir halus (*smooth scroll*) ke jangkar `#daftar-topik`. Mohon dievaluasi apakah perilaku ini sudah memuaskan atau ada preferensi lain.

---

### 6. Daftar Uji Manual yang Perlu Dilakukan
- [ ] **Tampilan Beranda di Berbagai Lebar Layar**:
  - **360px (HP Kecil)**: Periksa bilah atas tidak terpotong, teks subjudul menyusut menjadi ikon rapi dengan target sentuh minimal 44px, grid kartu menjadi 1 kolom vertikal tanpa overflow horizontal.
  - **768px (Tablet / iPad)**: Periksa grid kartu menjadi 2 kolom rapi dan hero tersusun vertikal yang seimbang.
  - **1280px & 1920px (Laptop & Proyektor Full HD)**: Periksa Rumpun I dan II tersusun 3 kolom, Rumpun III & IV bersisian (2 kelompok x 2 kartu) tanpa kartu menggantung janggal.
  - **3840px (Layar IFP 4K)**: Periksa konten tetap terpusat di tengah layar (`margin: 0 auto` dengan batas maksimal proporsional) dan tidak mengecil di pojok kiri atas.
- [ ] **Posisi Tombol Mode Kelas**:
  - Buka Beranda, perhatikan posisi tombol Mode Kelas di pojok kanan atas bilah navigasi.
  - Klik salah satu topik (mis. Topik 01), pastikan tombol Mode Kelas berada di koordinat dan posisi yang sama persis di bilah atas.
- [ ] **Siklus Belajar & Pembaruan Progres Hero**:
  - Buka aplikasi pada profil peramban baru/bersih. Pastikan tombol hero bertuliskan *"Mulai dari Topik 1"* dan progres *"0 / 10 Topik Selesai"*.
  - Buka Topik 01, selesaikan kuisnya hingga selesai dan skor tersimpan.
  - Kembali ke Beranda: pastikan tombol hero berubah menjadi *"Lanjutkan: Topik 1 · Unsur-unsur lingkaran"*, progres menjadi *"1 / 10 Topik Selesai"*, rata-rata skor muncul (mis. *"★ 5 / 5"*), dan kartu Topik 01 menampilkan lencana skor.
- [ ] **Pembersihan Skor ("Hapus skor di perangkat ini")**:
  - Klik tombol *"Hapus skor di perangkat ini"* di footer Beranda.
  - Dialog modal konfirmasi muncul dengan fokus keyboard awal pada tombol *"Batal"*.
  - Tekan tombol merah *"Hapus skor"*. Pastikan seluruh status kartu kembali ke *"Belum dicoba"*, progres kembali ke *"0 / 10"*, dan tombol hero kembali ke *"Mulai dari Topik 1"* secara instan tanpa muat ulang halaman.
  - Pastikan saklar **Mode Kelas tetap aktif** jika sebelumnya sedang dinyalakan.
- [ ] **Verifikasi Lencana "Siap Offline"**:
  - Buka aplikasi di jendela penyamaran (*Incognito* / profil bersih).
  - Saat awal muat sebelum caching selesai, lencana offline belum muncul (keadaan netral).
  - Begitu service worker selesai melakukan precache (muncul notifikasi siap offline), lencana hijau *"Siap offline"* muncul di bilah atas.
  - Matikan koneksi jaringan di DevTools (pilih *Offline*) lalu muat ulang halaman; pastikan halaman terbuka seketika tanpa koneksi internet.
- [ ] **Keterbacaan dari Belakang Kelas di IFP**:
  - Buka Beranda di layar besar dengan Mode Kelas aktif.
  - Amati keterbacaan judul topik, angka skor, dan teks deskripsi dari jarak sekitar 5–7 meter.
- [ ] **Navigasi Keyboard & Pembaca Layar**:
  - Gunakan tombol `Tab` untuk menavigasi dari bilah atas, tombol hero, hingga kartu topik dan footer.
  - Pastikan setiap elemen memiliki cincin fokus biru kontras tinggi (`outline: 3px solid var(--warna-garis-fokus)`).
  - Buka dialog modal reset skor dengan tombol `Enter`, tekan `Escape` untuk membatalkan, dan pastikan fokus keyboard kembali ke tombol pemicu di footer.

---

## Putaran 3: Halaman Topik, Kanvas Interaktif, dan Kuis (Selesai)

### 1. Pengaturan yang Dipilih
```yaml
KONFETI_SKOR_SEMPURNA: ya   # Animasi konfeti bintang SVG ringan saat skor kuis 5/5; mati pada prefers-reduced-motion; aria-hidden="true"
```

---

### 2. Ringkasan Implementasi Putaran 3

1. **Sub-Header Terpadu Halaman Topik (`src/components/TopicLayout.tsx`, `src/lib/topicNav.ts`)**:
   - Menyatukan navigasi dalam satu kesatuan kontekstual di atas tab:
     - Tombol pill **"← Beranda"** dengan ikon panah SVG dan target sentuh minimal 44px (54px pada Mode Kelas).
     - Tombol stepper **"← Topik N"** dan **"Topik N →"** yang kompak di kanan.
     - Penonaktifan tegas: pada Topik 01, tombol sebelumnya menampilkan status nonaktif (`.disabled`, `aria-disabled="true"`, border putus-putus); pada Topik 10, tombol berikutnya dinonaktifkan serupa.
     - Eyebrow rumpun dan nomor terpadu (mis. *"Rumpun III · Topik 07 dari 10"*) yang diambil secara murni dari metadata `rumpun` dan registry.
     - Judul topik `<h1>` dengan ukuran fluid `clamp(1.8rem, 2.5vw, 2.6rem)` dan ringkasan konsep.

2. **Tabs Modern Pill Ber-ikon (`src/components/Tabs.tsx`)**:
   - Ditata ulang sebagai modern pill tabs 4 segmen: **Eksplorasi**, **Konsep**, **Latihan**, dan **Kuis**.
   - Dilengkapi ikon SVG kustom untuk masing-masing fungsi tab.
   - Tetap memenuhi standar ARIA `role="tablist"` dan `role="tab"`, `aria-selected`, dan `aria-controls`.
   - Transisi panel tab masuk dengan animasi `tabFadeIn` berbasis `transform` dan `opacity` murni (dimatikan pada `prefers-reduced-motion`).

3. **Panel Nilai (Values Deck) & Kartu Sorotan (`src/components/ValuePanel.tsx`)**:
   - Angka utama disajikan sebagai kartu sorotan dalam grid responsif dengan font besar fluid `clamp(1.6rem, 2.2vw, 2.2rem)` (pada Mode Kelas: `clamp(2rem, 2.7vw, 2.8rem)`).
   - Teks angka menggunakan `font-variant-numeric: tabular-nums` sehingga digit tidak bergetar saat nilai digeser secara dinamis.
   - Kartu pertama ditonjolkan secara visual (`.stat-box.featured`) dengan aksen hijau lembut saat menyajikan 3 item atau 1 item utama.
   - Nilai perhitungan, angka desimal, dan pembulatan bawaan tidak diubah sama sekali.

4. **Kotak Rumus KaTeX Satu Baris (`src/components/Formula.tsx`)**:
   - Rumus matematika disajikan dalam kartu sorotan `formula-callout` berlatar hangat lembut dengan border jelas.
   - Wadah rumus menggunakan `overflow-x: auto; white-space: nowrap;` sehingga rumus KaTeX panjang tidak pernah terpotong atau memecah baris di tengah ekspresi, serta mempertahankan baseline matematika.

5. **Kontrol Interaktif: Slider & Saklar Modern (`src/components/SliderControl.tsx`, `src/styles.css`)**:
   - **Slider**: Track 8px dengan radius bulat, thumb slider berdiameter 26px (32px pada Mode Kelas) dengan kontras tinggi dan bayangan lembut. Nilai parameter saat ini disajikan dalam lencana dekat slider (`.slider-value-badge`).
   - **Saklar (Toggle Switch)**: Checkbox fungsional diubah tampilannya menjadi saklar pil modern (`.toggle-field`) 48px × 28px dengan thumb bulat 22px yang meluncur halus saat aktif, background hijau kontras (`var(--warna-sukses)`), dan cincin fokus keyboard jelas. Pada Mode Kelas, dimensi membesar menjadi 56px × 32px (thumb 26px) dengan target sentuh 54px.
   - **Chip Mode**: Menggunakan `aria-pressed` atau status aktif dengan target sentuh minimal 44px (54px di Mode Kelas).

6. **Pembedaan Visual Titik Seret vs Titik Pasif/Landmark (`src/components/svg/DraggablePoint.tsx`, `src/components/svg/Primitives.tsx`)**:
   - **Titik Seret (Draggable Handle)**: Isi warna solid geometri, cincin putih tebal 3.5–4px (`stroke="#ffffff"`), halo berdenyut saat belum disentuh (`.draggable-halo`), dan radius seret besar (r = 10px × `skalaGaris`).
   - **Titik Pasif / Kalkulasi (`LandmarkPoint`)**: Isi putih bersih (`#ffffff`), ring tepi berwarna tebal 3px, dan ukuran lebih kecil (r = 5.5px × `skalaGaris`).
   - Pembedaan ini menjamin siswa dapat mengenali titik seret secara visual bahkan pada mode monokrom atau bagi siswa dengan gangguan penglihatan warna.

7. **Kanvas Lengket (Sticky) di HP pada Tab Eksplorasi (`src/styles.css`)**:
   - Khusus pada lebar layar HP ≤ 600px dan hanya pada tab Eksplorasi portrait.
   - Tinggi kanvas dibatasi maksimal 38% tinggi layar (`max-height: 38vh; object-fit: contain`) sehingga deck kontrol di bawahnya tetap terlihat dan leluasa digulir.
   - **Keputusan Desain**: Pada layar ≤ 600px di halaman topik, `AppTopBar` dibuat posisi relatif (`position: relative; top: auto;`), sehingga kanvas dapat menempel mulus di `top: 0` tanpa memakan ruang ganda yang menenggelamkan kontrol.
   - Pada orientasi lanskap HP (tinggi layar ≤ 500px), perilaku sticky otomatis dimatikan (`position: static`) untuk mencegah tertutupnya antarmuka.

8. **Latihan dan Kuis Interaktif (`src/components/QuizEngine.tsx`, `src/components/PracticeEngine.tsx`, `src/components/AnswerFeedback.tsx`, `src/lib/quiz/result.ts`)**:
   - **Lebar Wadah**: Tata letak engine diperluas mengikuti lebar halaman (`max-width: 980px`), tidak lagi berupa kartu sempit terisolasi.
   - **Bilah Progres Kuis**: Teks "Soal X dari 5", persentase, dan bilah dengan `role="progressbar"`, `aria-valuenow`, `aria-valuemin={1}`, dan `aria-valuemax={5}`.
   - **Pilihan Jawaban**: Disajikan dalam tombol pilihan besar dengan lencana huruf A, B, C, D di kotak terpisah, target sentuh minimal 52px (58px di Mode Kelas), seleksi berbingkai tegas, dan penanda benar (✓) / salah (✗) saat dijawab.
   - **Umpan Balik Dua Tahap**:
     1. Tahap 1: Header pesan empatik singkat dalam Bahasa Indonesia natural (*"Tepat sekali! Pemahamanmu mantap."* atau *"Belum tepat, ayo periksa lagi langkahnya."*), disertai lencana jawaban benar jika salah.
     2. Tahap 2: Kartu pembahasan langkah KaTeX terpisah dengan judul *"Pembahasan Langkah:"*.
     - Region `aria-live="polite"` dan pengelolaan fokus keyboard dipertahankan sepenuhnya.
   - **Layar Hasil Kuis**:
     - Cincin progres skor SVG (`.score-ring-svg`) dengan angka skor besar dan persentase di tengah lingkaran.
     - Pesan capaian motivatif dari fungsi murni `pesanHasilKuis(skor, total)`.
     - Lencana skor terbaik tersimpan di perangkat.
     - Tombol navigasi aksi:
       - Tombol primer: **"Lanjut ke Topik Berikutnya →"** (atau **"Kembali ke Beranda →"** pada Topik 10) menggunakan urutan terdaftar registry.
       - Tombol sekunder: **"↺ Ulangi kuis"** dan **"Kembali ke Eksplorasi"**.
   - **Konfeti Skor Sempurna (`KONFETI_SKOR_SEMPURNA: ya`)**:
     - Komponen SVG `KonfetiBintang` memunculkan 9 bintang dan lingkaran warna tema yang melayang ke atas dengan rotasi lembut.
     - Animasi murni `transform` dan `opacity` selama 1.2 detik (satu putaran, tidak mengulang).
     - Mati total pada `prefers-reduced-motion: reduce`.
     - Dilengkapi `pointer-events: none;` dan `aria-hidden="true"` sehingga tidak menghalangi tombol maupun mengganggu screen reader.

9. **Penyempurnaan Beranda Terkait (Poin 4.9)**:
   - Tombol sekunder hero *"Lihat 10 Topik"*: Menghormati preferensi gerak (`behavior: prefersReducedMotion ? 'auto' : 'smooth'`) dan memindahkan fokus keyboard programatis ke jangkar `#daftar-topik` (`tabIndex={-1}`) agar pengguna keyboard dan pembaca layar tidak tertinggal di atas banner hero.
   - Informasi topik terakhir di panel widget hero disederhanakan menjadi lencana status ringkas (`.last-topic-badge-row`), menghindari duplikasi klik target dengan tombol aksi utama hero *"Lanjutkan: Topik N"*.

10. **Pembersihan CSS & Komponen**:
    - Seluruh aturan CSS halaman topik, kuis, dan kontrol diselaraskan ke token `src/lib/tokens.ts` dan CSS variables.
    - Zero hex hardcode selain `#ffffff` dan `#fff`, lulus 100% pada tes pemindaian token.

---

### 3. Ukuran Bundel & Precache (Sebelum vs Sesudah Putaran 3)

| Metrik | Sesudah Putaran 2 | Sesudah Putaran 3 | Perubahan |
| :--- | :--- | :--- | :--- |
| **CSS Bundel (`dist/assets/*.css`)** | 68.64 KB (gzip: 16.11 KB) | 77.32 KB (gzip: 17.52 KB) | +8.68 KB (gzip: +1.41 KB) |
| **JS Bundel Utama (`dist/assets/index-*.js`)** | 376.78 KB (gzip: 111.82 KB) | 387.73 KB (gzip: 114.85 kB) | +10.95 KB (gzip: +3.03 KB) |
| **Total Ukuran Folder `dist/`** | 1.097 MB (1097719 B) | 1.117 MB (1117342 B) | +19.62 KB |
| **Entri Precache PWA (`sw.js`)** | 34 entri (1053.94 KiB) | 34 entri (1073.11 KiB) | 0 entri baru (+19.17 KiB) |

> **Catatan Efisiensi:** Seluruh perombakan antarmuka sub-header, pill tabs ber-ikon, values deck, kotak KaTeX satu baris, saklar modern, dua tahap kuis, cincin skor SVG, dan animasi bintang konfeti hanya menambah **+19.17 KiB** pada precache PWA.

---

### 4. Berkas yang Diubah & Ditambahkan pada Putaran 3

#### Berkas Baru:
- [`src/lib/topicNav.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/topicNav.ts): Fungsi murni format eyebrow rumpun dan logika navigasi stepper topik (sebelumnya/berikutnya, status dinonaktifkan pada topik 1 dan 10).
- [`src/lib/topicNav.test.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/topicNav.test.ts): Unit test untuk navigasi stepper topik batas awal dan akhir serta penataan eyebrow rumpun.
- [`src/lib/quiz/result.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/quiz/result.ts): Fungsi murni pesan motivatif hasil kuis, penentuan aksi tombol hasil (lanjut ke topik berikutnya vs kembali ke beranda pada Topik 10), dan format progres bar.
- [`src/lib/quiz/result.test.ts`](file:///home/aantriono/Dev/lingkaran/src/lib/quiz/result.test.ts): Unit test evaluasi skor kuis, pesan kelulusan, dan tautan tombol akhir kuis.
- [`src/components/svg/primitives.test.ts`](file:///home/aantriono/Dev/lingkaran/src/components/svg/primitives.test.ts): Unit test verifikasi skala garis Mode Kelas (`skalaGaris`) pada seluruh primitif SVG dan handle titik seret.

#### Berkas Diubah:
- [`src/components/TopicLayout.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/TopicLayout.tsx): Membangun sub-header terpadu: tombol pill "← Beranda", stepper kompak dengan penonaktifan jelas, eyebrow rumpun dan nomor, judul topik fluid, dan deskripsi konsep.
- [`src/components/Tabs.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/Tabs.tsx): Pill tabs modern 4 segmen dengan ikon SVG kustom untuk Eksplorasi, Konsep, Latihan, dan Kuis.
- [`src/components/ValuePanel.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/ValuePanel.tsx): Kartu sorotan `values-deck` dengan `tabular-nums`, penonjolan kartu unggulan (`featured`), dan variabel warna aksen token.
- [`src/components/Formula.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/Formula.tsx): Kartu sorotan formula callout KaTeX satu baris dengan overflow-x pelindung pemotongan rumus.
- [`src/components/SliderControl.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/SliderControl.tsx): Track 8px, thumb sentuh besar, dan badge nilai parameter tabular-nums dekat slider.
- [`src/components/svg/Primitives.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/svg/Primitives.tsx): Menambahkan komponen `LandmarkPoint` untuk membedakan titik pasif/kalkulasi (isi putih, tepi berwarna) dari titik seret.
- [`src/components/svg/index.ts`](file:///home/aantriono/Dev/lingkaran/src/components/svg/index.ts): Mengekspor `LandmarkPoint`.
- [`src/components/AnswerFeedback.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/AnswerFeedback.tsx): Umpan balik dua tahap (pesan empatik + pembahasan KaTeX terpisah) dengan region `aria-live` dan teks aksesibel yang memenuhi tes regresi.
- [`src/components/QuizEngine.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/QuizEngine.tsx): Wadah luas, progress bar aksesibel, pilihan jawaban bertarget sentuh besar ber-lencana huruf, input desimal nyaman, cincin skor SVG, pesan motivatif, tombol navigasi registry ("Lanjut ke Topik Berikutnya" / "Kembali ke Beranda"), tombol "Kembali ke Eksplorasi", dialog pemulihan sesi modern, dan konfeti bintang SVG saat 5/5.
- [`src/components/PracticeEngine.tsx`](file:///home/aantriono/Dev/lingkaran/src/components/PracticeEngine.tsx): Opsi jawaban bertarget sentuh besar selaras dengan QuizEngine dan umpan balik dua tahap.
- [`src/pages/TopicPage.tsx`](file:///home/aantriono/Dev/lingkaran/src/pages/TopicPage.tsx): Menghubungkan callback tombol "Kembali ke Eksplorasi" dari QuizEngine ke pergantian tab otomatis.
- [`src/pages/Home.tsx`](file:///home/aantriono/Dev/lingkaran/src/pages/Home.tsx): Mengarahkan tombol hero "Lihat 10 Topik" ke jangkar dengan penghormatan reduced motion dan pemindahan fokus programatis; menyederhanakan kartu topik terakhir hero menjadi lencana status agar jalur CTA tombol hero tetap tunggal dan tegas.
- [`src/styles.css`](file:///home/aantriono/Dev/lingkaran/src/styles.css): Gaya CSS lengkap Putaran 3 (sub-header terpadu, pill tabs, values deck, formula callout, slider, saklar switch toggle, kuis luas, cincin skor, konfeti SVG, sticky canvas mobile, Mode IFP scaling, dan aturan responsif).

---

### 5. Daftar Keputusan Mandiri (Putaran 3)

1. **Bilah Atas Relatif di Halaman Topik pada Layar HP (≤ 600px)**:
   Pada layar HP berorientasi portrait, mempertahankan bilah atas sticky bersama kanvas sticky di tab Eksplorasi akan memakan lebih dari 65% tinggi layar, menyisakan area kontrol yang sangat sempit bagi jari siswa. Sesuai panduan Tugas 4.5, bilah atas `AppTopBar` dijadikan `position: relative` pada lebar ≤ 600px di halaman topik, sehingga kanvas tab Eksplorasi dapat menempel di `top: 0` dengan tinggi terkontrol (38vh) dan deck kontrol di bawahnya dapat digulir dengan nyaman.
2. **Pembedaan Fisik Monokrom Titik Seret vs Landmark Point**:
   Titik seret menggunakan radius besar r=10px × skala, isi padat solid, cincin putih tebal 3.5px, serta animasi halo berdenyut sebelum disentuh. Titik pasif / kalkulasi (`LandmarkPoint`) menggunakan radius lebih kecil r=5.5px × skala, isi putih bersih `#ffffff`, dan border berwarna tebal 3px. Perbedaan bentuk dan ukuran ini menjamin keterbacaan instan tanpa bergantung pada penglihatan warna.
3. **Pemberian Tombol Callback "Kembali ke Eksplorasi" di Hasil Kuis**:
   Layar hasil kuis menyajikan tombol sekunder *"Kembali ke Eksplorasi"* yang langsung mengubah state tab aktif halaman topik kembali ke tab Eksplorasi tanpa memuat ulang halaman. Ini memudahkan siswa yang ingin langsung kembali membuktikan konsep secara visual di kanvas setelah melihat hasil kuisnya.
4. **Penyederhanaan Kartu Terakhir Dibuka di Widget Hero Beranda**:
   Tombol CTA hero *"Lanjutkan: Topik N · Nama"* sudah mengarahkan siswa langsung ke topik terakhir yang sedang dipelajari. Menjadikan elemen terakhir dibuka di dalam widget hero sebagai kartu link kedua terbukti membingungkan hierarki navigasi. Kartu tersebut disederhanakan menjadi lencana status informatif (*"Terakhir Dibuka: Topik 07 · Lingkaran Dalam Segitiga"*), mempertahankan kejelasan informasi tanpa menduplikasi jalur klik.

---

### 6. Keputusan yang Menunggu Bapak

1. **Perilaku Kanvas Sticky pada Mode Lanskap HP**:
   Saat ini, kanvas sticky dimatikan pada layar dengan tinggi ≤ 500px (HP dalam posisi lanskap) agar kontrol di bawahnya tidak tertutup penuh oleh kanvas. Mohon dievaluasi apakah perilaku ini sudah sesuai dengan kebutuhan siswa di kelas atau ada rekomendasi tata letak dua kolom pada HP lanskap di masa mendatang.
2. **Tombol "Kembali ke Eksplorasi" pada Layar Hasil Kuis**:
   Tombol ini memindahkan tab siswa secara langsung ke tab Eksplorasi topik yang sama. Apakah Bapak menghendaki tombol ini tetap berdampingan dengan *"Ulangi kuis"* dan *"Lanjut ke Topik berikutnya"*, atau cukup tombol *"Lanjut ke Topik berikutnya"* sebagai tombol primer tunggal?

---

### 7. Ringkasan Akhir Keseluruhan (Tiga Putaran)

Proyek **Simulasi Lingkaran SMP** kini telah sepenuhnya bertransformasi ke **Arah B (Modern Interactive Classroom)**:
- **Putaran 1 (Fondasi & Desain Sistem)**: Menetapkan token warna geometri baru, font lokal Plus Jakarta Sans tanpa koneksi internet, rasio kontras WCAG AA yang terverifikasi, Mode Kelas IFP dengan penskalaan garis geometri (`--skala-garis: 1.30`) dan target sentuh 54px, penyimpanan terpusat `src/lib/storage.ts`, serta audit pemindaian token otomatis.
- **Putaran 2 (Beranda Modern & Rumpun Topik)**: Menyajikan bilah atas bersama sticky `AppTopBar`, banner hero interaktif dengan kalkulasi kemajuan belajar Kurikulum Merdeka, 10 miniatur kartu SVG khas topik geometri ber-token, eliminasi kartu menggantung melalui layout berdampingan Rumpun III & IV, lencana *"Siap offline"* murni berbasis kesiapan cache Service Worker, dan tombol pembersihan skor perangkat yang aman di footer.
- **Putaran 3 (Halaman Topik, Kanvas, dan Kuis)**: Sub-header terpadu dengan navigasi pill dan status disabled eksplisit pada batas topik; pill tabs ber-ikon; kartu sorotan nilai dengan font tabular-nums besar; formula KaTeX satu baris pelindung pemotongan rumus; saklar switch toggle modern; titik seret berkontras tinggi dengan halo denyut; kanvas sticky responsif di HP portrait; engine kuis luas dengan progress bar aksesibel, pilihan jawaban bertarget sentuh besar, umpan balik dua tahap empatik + KaTeX, cincin skor SVG, konfeti bintang SVG skor 5/5, dan tombol navigasi alur belajar registry.

---

### 8. Daftar Uji Manual Lengkap (Semua Putaran)

- [ ] **1. Tampilan Setiap Topik di Berbagai Resolusi Layar**:
  - **360px (HP Portrait)**: Buka tiap topik (Topik 01 s.d. 10). Pastikan sub-header rapi, tab tersusun 2x2 tanpa overflow, kanvas Eksplorasi sticky menempel di atas (tinggi ~38vh), slider dan kontrol di bawahnya leluasa digulir dengan jari.
  - **768px (Tablet / iPad Portrait)**: Buka tiap topik. Pastikan tata letak 1 kolom leluasa, pilihan jawaban kuis 1 kolom yang nyaman ditekan jari, formula KaTeX tidak terpotong.
  - **1280px & 1920px (Laptop & Proyektor Full HD)**: Buka tiap topik. Pastikan kanvas di kiri dan panel kontrol di kanan bersanding seimbang (`explore-layout`), nilai stat card terbaca jelas dari jarak jauh, formula KaTeX satu baris elegan.
  - **1920px dengan Mode Kelas Aktif**: Aktifkan saklar Mode Kelas di bilah atas. Periksa font judul, tombol pil, kartu nilai, dan pilihan jawaban membesar dengan target sentuh ≥ 54px; garis geometri SVG menebal 1,30× tanpa ada elemen atau label yang saling bertumpuk.
  - **3840px (Layar IFP 4K Sungguhan)**: Uji pada layar interaktif kelas 4K atau proyektor besar. Pastikan antarmuka terpusat proporsional dan angka sorotan terbaca jelas dari bangku belakang kelas.
- [ ] **2. Interaksi Seret Titik di Kanvas**:
  - Pada HP dan IFP sungguhan: Sentuh dan geser titik seret (titik A, B, atau C) menggunakan jari.
  - Pastikan koordinat responsif (`getScreenCTM`), tidak ada lonjakan offset, dan tidak terjadi konflik gestur antara penyeretan titik geometri dengan scroll halaman.
  - Pastikan halo denyut di sekeliling titik seret menghilang setelah titik pertama kali disentuh/digerakkan.
- [ ] **3. Pembedaan Visual Titik Seret vs Titik Pasif**:
  - Pada Topik 07 (Lingkaran Dalam Segitiga), periksa bahwa titik sudut A, B, C (titik seret) berwarna solid dengan cincin putih tebal, sedangkan titik singgung pada sisi segitiga dan pusat incenter I (titik pasif/landmark) berwarna putih berlubang dengan garis tepi berwarna.
- [ ] **4. Alur Kuis Sempurna (Skor 5/5)**:
  - Buka kuis pada salah satu topik (mis. Topik 01).
  - Jawab semua 5 soal dengan benar.
  - Pada layar hasil kuis: pastikan cincin progres SVG penuh 100%, pesan *"Luar Biasa Sempurna!"* muncul, animasi bintang konfeti SVG melayang lembut di atas kartu, dan tombol primer bertuliskan *"Lanjut ke Topik Berikutnya →"* menunjuk ke Topik 02.
  - Klik tombol *"Kembali ke Eksplorasi"*, pastikan tab otomatis berpindah ke Eksplorasi.
- [ ] **5. Alur Kuis dengan Skor Rendah**:
  - Buka kuis topik lain dan jawab salah sebagian soal.
  - Saat memilih jawaban salah: amati umpan balik dua tahap menampilkan *"Belum tepat, ayo periksa lagi langkahnya."*, jawaban yang benar ditampilkan, dan kotak *"Pembahasan Langkah:"* KaTeX tersaji rapi di bawahnya.
  - Pada layar hasil kuis: pesan motivatif ramah muncul, cincin progres menunjukkan persentase yang sesuai, dan konfeti tidak muncul.
- [ ] **6. Navigasi Batas Sub-Header**:
  - Buka Topik 01: Tombol *"← Topik sebelumnya"* harus berstatus disabled (tidak bisa diklik, gaya putus-putus redup); tombol *"Topik 02 →"* aktif dan menuju ke Topik 02.
  - Buka Topik 10: Tombol *"← Topik 09"* aktif; tombol *"Topik berikutnya →"* berstatus disabled.
  - Selesaikan kuis Topik 10: Tombol primer pada layar hasil kuis harus bertuliskan *"Kembali ke Beranda →"* (bukan lanjut ke topik berikutnya).
- [ ] **7. Aksesibilitas Keyboard & Pembaca Layar (Orca / NVDA)**:
  - Navigasi seluruh halaman topik hanya menggunakan tombol `Tab`, `Shift+Tab`, `Space`, dan `Enter`.
  - Pastikan setiap tombol pill, tab, pilihan jawaban kuis, dan slider memiliki cincin fokus biru tebal (`outline: 3px solid var(--warna-garis-fokus)`).
  - Pada titik seret kanvas: gunakan tombol panah keyboard (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`) untuk menggeser koordinat titik.
  - Pastikan pembaca layar mengumumkan umpan balik status soal via live region `aria-live="polite"`.
- [ ] **8. PWA Offline Penuh**:
  - Buka aplikasi di jendela penyamaran (*Incognito*).
  - Tunggu hingga lencana hijau *"Siap offline"* muncul di bilah atas.
  - Buka DevTools → Network → centang opsi *Offline*.
  - Muat ulang halaman (`F5`) dan navigasikan ke beberapa topik serta kuis; pastikan seluruh halaman, font matematika KaTeX, font Plus Jakarta Sans, dan ikon SVG berfungsi 100% tanpa jaringan internet.


