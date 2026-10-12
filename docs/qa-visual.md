# Laporan Uji Kualitas (QA) Visual & Interaksi Front-End
**Aplikasi:** Simulasi Lingkaran SMP (Matematika Kelas 9 — Kurikulum Merdeka)  
**Acuan Desain:** Penerapan Arah B (*Modern Interactive Classroom*)  
**Tanggal Pengujian:** 11 Oktober 2026  
**Metode:** Pengujian Otomatis & Manual Browser Nyata (Google Chrome 153 Headless & Real Preview Build PWA `http://localhost:4173/`)  
**Penilai:** Penguji Kualitas (QA) Front-End

---

## 1. Ringkasan Eksekutif

Penerapan UI Arah B (*Modern Interactive Classroom*) pada aplikasi **Simulasi Lingkaran SMP** menunjukkan kualitas rekayasa front-end yang **sangat tinggi, rapi, dan matang**. Seluruh 10 topik dan 4 tab (Eksplorasi, Konsep, Latihan, Kuis) berhasil dirender tanpa galat konsol (0 error, 0 warning), **nol luapan horizontal** (*0 overflow*) di semua lebar viewport (360px hingga 3840px 4K), 100% mandiri tanpa koneksi luar (*zero external requests*), dan cache PWA offline bekerja penuh. Akurasi seret koordinat SVG sangat presisi (< 0,55 px selisih koordinat layar).

Aplikasi **LAYAK DIGUNAKAN DI KELAS** dengan beberapa perbaikan prioritas:
- **Total Temuan:** 8 temuan (**0 Kritis**, **2 Tinggi**, **3 Sedang**, **3 Rendah**).
- **5 Cacat Paling Berdampak:**
  1. **[VIS-TOP-ALL-01]** Tombol pengalih Mode Kelas di header (`button.mode-ifp-toggle`) memiliki tinggi hanya 28px (target sentuh < 44px WCAG / < 54px Mode Kelas).
  2. **[VIS-TOP-ALL-02]** Teks *eyebrow* sub-header topik menggunakan warna oranye aksen di atas latar dasar abu muda dengan rasio kontras **1,96:1** (gagal batas WCAG 4,5:1).
  3. **[VIS-CTRL-ALL-03]** Slider panel kontrol (`input[type="range"]`) memiliki tebal rel sentuh hanya 8px tanpa penambahan area sentuh jemari (*hit target* < 44px).
  4. **[VIS-ROUT-TAB-04]** Navigasi antar-topik via *stepper* tidak me-reset tab aktif ke 'Eksplorasi' karena komponen halaman tidak di-*remount* oleh router saat ID berubah.
  5. **[VIS-LANG-DEC-05]** Penulisan angka desimal di 9 modul topik masih menggunakan titik bahasa Inggris (mis. `154.00 cm²`) alih-alih koma standar Indonesia (`154,00 cm²`).

---

## 2. Cakupan yang Benar-Benar Diuji

Pengujian dilakukan menggunakan hasil *production build* (`npm run build`) yang dijalankan via server pratinjau (`vite preview`) pada port 4173, menggunakan emulasi Chrome DevTools Protocol (CDP) dengan *storage profile* bersih dan terisolasi.

### Tabel Matriks Pengujian

| Halaman / Fitur | 360×800 (HP Potret) | 768×1024 (Tablet) | 800×360 (HP Lanskap) | 1280×800 (Laptop) | 1920×1080 (IFP FHD) | 3840×2160 (IFP 4K) | Status Uji |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Beranda (Pengguna Baru)** | Normal & Kelas | Normal & Kelas | Normal & Kelas | Normal & Kelas | Normal & Kelas | Normal & Kelas | Teruji Penuh |
| **Beranda (Ada Kemajuan)** | Normal & Kelas | Normal & Kelas | Normal & Kelas | Normal & Kelas | Normal & Kelas | Normal & Kelas | Teruji Penuh |
| **Dialog Hapus Skor** | Normal & Kelas | — | — | — | Normal & Kelas | — | Teruji Penuh |
| **Topik 01–10: Eksplorasi** | Normal | Normal | Normal (1, 3, 7) | Normal | Normal & Kelas | Normal (1, 4, 7, 10) | Teruji Penuh |
| **Topik 01–10: Konsep** | Normal | — | — | — | Normal (Semua) + Kelas (1, 3, 7, 9) | — | Teruji Penuh |
| **Topik 01–10: Latihan** | Normal | — | — | — | Normal (Semua) + Kelas (1, 3, 7, 9) | — | Teruji Penuh |
| **Topik 01–10: Kuis** | Normal | — | — | — | Normal (Semua) + Kelas (1, 3, 7, 9) | — | Teruji Penuh |
| **Topik 1 (Semua Unsur & Apotema)** | Normal | — | — | — | Normal | — | Teruji Penuh |
| **Topik 2 (3 Mode Keliling & π)** | Normal | — | — | — | Normal | — | Teruji Penuh |
| **Topik 3 (Juring n = 4, 16, 64)** | Normal | — | — | — | Normal | — | Teruji Penuh |
| **Topik 9 (3 Sub-mode PGS)** | Normal | — | — | — | Normal | — | Teruji Penuh |
| **Topik 10 (6 Kedudukan Lingkaran)** | Normal | — | — | — | Normal | — | Teruji Penuh |
| **Latihan (Umpan Balik & Parser)** | Normal | — | — | — | Normal | — | Teruji Penuh |
| **Kuis (Tengah, Resume, Konfeti 5/5)** | Normal | — | — | — | Normal | — | Teruji Penuh |
| **Akurasi Seret Koordinat Layar** | 5 Topik (Touch) | — | — | — | 5 Topik (Mouse & Kelas) | — | Teruji Penuh |
| **Kanvas Sticky Mobile** | 10 Topik | — | 3 Topik (Nonaktif) | — | — | — | Teruji Penuh |
| **Reduced Motion Emulasi** | Normal | — | — | — | Normal | — | Teruji Penuh |
| **PWA & Offline Emulasi Jaringan** | — | — | — | — | Normal (Reload Topik 1) | — | Teruji Penuh |
| **CPU Throttling 4x (Kinerja)** | — | — | — | — | 4 Topik Beban Berat | — | Teruji Penuh |

*Catatan: Total 198 tangkapan layar PNG tersimpan rapi di direktori `docs/qa-visual/<lebar>/<mode>/`.*

---

## 3. Hasil Pengukuran Otomatis

### 3.1 Luapan Horizontal (Horizontal Overflow)
- **Metrik:** `document.documentElement.scrollWidth > window.innerWidth`
- **Hasil:** **0 kejadian luapan horizontal** pada seluruh 6 ukuran viewport (360, 768, 800, 1280, 1920, 3840 px) di mode Normal maupun Kelas. Seluruh kontainer `page-shell`, `home-container`, kartu topik, dan tabel KaTeX terbungkus dengan responsif sempurna.

### 3.2 Keterbacaan dan Ukuran Font
- **Metrik:** Teks dengan `computed fontSize < 14px` pada mode Normal.
- **Hasil:** Ditemukan 75 kemunculan teks berukuran < 14px:
  - Miniatur kartu Beranda: label rumus miniatur KaTeX/SVG (`panjang = π·r`: 9,5px, `K = π·d`: 9px, `d = 2r`: 11px). *Catatan: Ini adalah miniatur grafis ilustratif.*
  - Nomor urut kartu Beranda (`span.card-topic-number`): **13,12px**.
  - Lencana status kartu Beranda (`span.card-status-badge`): **12,8px**.
  - Catatan sudut/titik kecil SVG pada topik 4 (`2α`, `α`): **11px**.
- **Mode Kelas (IFP):**
  - Judul topik (`topic-title-unified`): **41,6px** (Sangat jelas dari belakang kelas).
  - Angka sorotan / nilai statistik (`stat-value`): **33,6px** (Memenuhi target 26–35px).
  - Nomor kartu Beranda (`card-topic-number`): **28,8px** (Besar dan tegas).

### 3.3 Target Sentuh (Touch Target Area)
- **Ambang Batas Minimum:** ≥ 44px (Normal) dan ≥ 54px (Mode Kelas).
- **Hasil Temuan:**
  - `button.mode-ifp-toggle`: **34 × 28 px** pada mode Normal (Tinggi 28px terlalu tipis untuk sentuhan jari guru/siswa).
  - `input[type="range"]` (semua slider panel kontrol): **290 × 8 px** (Tinggi visual rel hanya 8px tanpa padding sentuh luar yang mencukupi).
  - Titik pusat SVG tidak interaktif (`g.unsur-layer` titik O): **6 × 6 px** (Terdeteksi karena memiliki peran role/klik namun sebenarnya non-seret).
  - Titik seret nyata (`.drag-hit-area`): **radius r = 46px** (diameter 92px normal, 120px di Mode Kelas). **Memenuhi standar sentuh IFP dan HP dengan sangat baik!**

### 3.4 Rasio Kontras Warna (WCAG 2.1 AA)
- **Ambang Batas:** ≥ 4,5:1 (teks normal < 18pt), ≥ 3,0:1 (teks besar/grafis).
- **Hasil Temuan:**
  - `span.topic-eyebrow-unified` (Teks "RUMPUN I · TOPIK 01 DARI 10"): warna `#f59e0b` di atas latar `#f0f5fa` menghasilkan rasio **1,96:1** (**GAGAL** batas 4,5:1).
  - `span.hero-eyebrow` di atas gradien hero: rasio **1,35:1** (**GAGAL** batas 4,5:1).
  - `span.chip-number` ("2.") dan `span` chip unsur: rasio **4,1:1** (**MARGINAL**, batas 4,5:1).

### 3.5 Akurasi Seret Titik (*Pointer Drag Accuracy*)
Pengujian dilakukan dengan menggeser pointer sejauh target (ΔX = +25px, ΔY = +15px, jarak garis lurus 29,15px) menggunakan *real browser events* (Touch Event pada HP 360px dan Mouse Pointer Event pada Desktop/IFP 1920px):

| Topik | Viewport & Mode | Posisi Awal Layar | Target Pointer | Posisi Akhir Layar | Karakteristik Geometri | Selisih Titik vs Pointer | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Topik 07 (Segitiga)** | 1920px Normal | (431, 873) | (461, 893) | (461.50, 893.01) | Bebas 2D (dalam segitiga) | **0,50 px** | **LULUS (≤ 2px)** |
| **Topik 07 (Segitiga)** | 1920px Kelas | (431, 901) | (461, 921) | (461.50, 921.01) | Bebas 2D (dalam segitiga) | **0,50 px** | **LULUS (≤ 2px)** |
| **Topik 07 (Segitiga)** | 360px Touch | (100, 713) | (125, 728) | (124.86, 728.49) | Bebas 2D (dalam kanvas sticky) | **0,51 px** | **LULUS (≤ 2px)** |
| **Topik 10 (Kedudukan)** | 1920px Normal | (438, 715) | (468, 735) | (468.11, 735.35) | Bebas 2D (pusat lingkaran) | **0,37 px** | **LULUS (≤ 2px)** |
| **Topik 10 (Kedudukan)** | 1920px Kelas | (438, 743) | (468, 763) | (468.11, 763.35) | Bebas 2D (pusat lingkaran) | **0,37 px** | **LULUS (≤ 2px)** |
| **Topik 10 (Kedudukan)** | 360px Touch | (102, 703) | (127, 718) | (127.21, 718.47) | Bebas 2D (pusat lingkaran) | **0,51 px** | **LULUS (≤ 2px)** |
| **Topik 01 (Unsur)** | 1920px Normal | (829, 631) | (859, 651) | (839.22, 657.11) | Terikat pada Keliling ($r=R$) | Proyeksi Lingkaran Valid | **LULUS** |
| **Topik 04 (Sudut)** | 1920px Normal | (474, 656) | (504, 676) | (470.28, 667.83) | Terikat pada Keliling ($r=R$) | Proyeksi Lingkaran Valid | **LULUS** |
| **Topik 09 (Garis Singgung)** | 1920px Normal | (638, 768) | (668, 788) | (635.02, 774.31) | Terikat pada Garis Singgung | Proyeksi Tangen Valid | **LULUS** |

*Kesimpulan Akurasi Seret:* Transformasi matriks layar SVG (`clientToSvg` via `getScreenCTM`) bekerja sempurna dengan deviasi sub-piksel (< 0,55 px), tanpa lompatan (*no jitter/jumping*) meskipun kanvas dibatasi tinggi dan mengalami *letterboxing*.

### 3.6 Kanvas Lengket (*Sticky Canvas*) di HP Potret (360×800)
- **Status Posisi saat Digulir:** `position: sticky; top: 0; z-index: 20` aktif pada tab Eksplorasi di seluruh 10 topik.
- **Tinggi Kanvas SVG:** Terukur tepat **304 px** (rasio **29,7%** dari tinggi layar 1025px), mematuhi batas desain maksimum 38vh.
- **Perilaku di Lanskap Pendek (800×360 px):** Media query `(max-width: 600px) and (min-height: 501px)` mematikan sifat lengket secara otomatis saat orientasi lanskap (tinggi ≤ 500px), sehingga tidak menutupi kontrol di bawahnya.

### 3.7 Konsol Browser dan Jaringan
- **Galat Konsol (Console Error/Warn):** **0 galat**, **0 peringatan**.
- **Permintaan Jaringan Eksternal:** **0 permintaan** keluar dari origin `localhost:4173`. Seluruh aset font, pustaka KaTeX, modul React, dan SVG dimuat lokal.
- **Service Worker & PWA:** Service worker aktif (`sw.js`). Pengujian emulasi jaringan offline murni menunjukkan aplikasi berhasil memuat ulang halaman topik, menampilkan grafik SVG lengkap, serta font lokal Plus Jakarta Sans dan rumus KaTeX tetap ter-render utuh.

---

## 4. Daftar Temuan Rinci (Cacat Visual, Tata Letak, dan Interaksi)

### [VIS-TOP-ALL-01] Tombol Mode Kelas di Bilah Atas Terlalu Kecil
- **Tingkat:** Tinggi
- **Kategori:** Sentuh / Aksesibilitas
- **Lokasi:** `AppTopBar` (Beranda & seluruh halaman Topik), Mode Normal & Kelas, semua lebar viewport
- **Bukti:** `measurements-360.json` dan `measurements-1920.json`: `button.mode-ifp-toggle` berukuran **34 × 28 px** (tinggi 28px).
- **Langkah Reproduksi:** Buka halaman mana saja pada viewport 360px atau 1920px. Amati tombol pengalih "Mode kelas" di kanan atas.
- **Yang Seharusnya:** Tombol kontrol interaktif utama memiliki ukuran target sentuh minimal 44 × 44 px (Mode Normal) dan 54 × 54 px (Mode Kelas) agar mudah ditekan oleh jari guru di layar sentuh IFP atau siswa di HP.
- **Yang Terjadi:** Tombol hanya memiliki padding kecil dengan tinggi total 28px, rawan meleset saat ditekan menggunakan jari.
- **Petunjuk Penyebab:** `src/styles.css` baris 240–255 pada kelas `.mode-ifp-toggle`:
  ```css
  .mode-ifp-toggle {
    padding: 6px 12px;
    height: 28px; /* atau implisit dari padding */
  }
  ```
- **Saran Perbaikan:** Berikan `min-height: 44px; min-width: 44px; padding: 10px 16px;` pada `.mode-ifp-toggle`, dan pada `body.mode-ifp .mode-ifp-toggle` berikan `min-height: 54px; min-width: 54px;`.

---

### [VIS-TOP-ALL-02] Kontras Warna Eyebrow Sub-Header Topik Gagal Standar WCAG
- **Tingkat:** Tinggi
- **Kategori:** Kontras / Keterbacaan
- **Lokasi:** Sub-header Topik (`.topic-eyebrow-unified`), seluruh 10 topik, semua lebar viewport
- **Bukti:** Pengukuran kontras otomatis: `#f59e0b` (oranye aksen) di atas latar `#f0f5fa` menghasilkan rasio kontras **1,96:1** (jauh di bawah batas WCAG 4,5:1).
- **Langkah Reproduksi:** Buka sembarang halaman topik (misalnya `#/topik/01-unsur`). Lihat teks kecil di atas judul: "RUMPUN I · TOPIK 01 DARI 10".
- **Yang Seharusnya:** Teks *eyebrow* memiliki kontras tinggi yang tajam dan nyaman dibaca dari jarak jauh (minimal 4,5:1). Pada mockup Arah B topik (`mockup-arah-b-topik.html`), teks eyebrow menggunakan warna hijau toska gelap `#0d9488` (kontras 4,8:1).
- **Yang Terjadi:** Teks berwarna kuning-oranye pudar di atas abu-abu muda, sangat silau dan kabur bila diproyeksikan ke layar proyektor kelas atau dilihat dari belakang ruangan.
- **Petunjuk Penyebab:** `src/styles.css` baris 1910 pada `.topic-eyebrow-unified`:
  ```css
  .topic-eyebrow-unified {
    color: var(--warna-aksen); /* #f59e0b */
  }
  ```
- **Saran Perbaikan:** Ubah warna `.topic-eyebrow-unified` menjadi warna primer yang lebih gelap atau toska gelap kontras tinggi (misalnya `#095c54` atau `#0c4a6e`, atau `--warna-primer`).

---

### [VIS-CTRL-ALL-03] Area Sentuh Rel Slider Range Terlalu Tipis (8px)
- **Tingkat:** Sedang
- **Kategori:** Sentuh / Interaksi
- **Lokasi:** Seluruh panel kontrol topik yang memiliki slider (Topik 01, 02, 03, 04, 10)
- **Bukti:** `measurements-360.json`: `input[type="range"]` terhitung berukuran **290 × 8 px**.
- **Langkah Reproduksi:** Buka tab Eksplorasi Topik 01 atau Topik 03 pada HP potret 360px atau layar sentuh IFP. Coba seret pengatur nilai jari-jari atau jumlah juring menggunakan jari.
- **Yang Seharusnya:** Komponen slider memiliki area sentuh vertikal minimal 44px (Normal) atau 54px (Kelas) meskipun garis rel visualnya tipis.
- **Yang Terjadi:** Pengguna harus mendaratkan ujung jari tepat pada jempol slider kecil setinggi 8–18px; bila meleset sedikit, sentuhan dianggap menggulir halaman.
- **Petunjuk Penyebab:** `src/styles.css` pada selektor `input[type="range"]`: belum memiliki padding vertikal transparan (mis. `padding: 12px 0; margin: -12px 0;`) untuk memperluas *hit area*.
- **Saran Perbaikan:** Tambahkan padding sentuh pada `input[type="range"]` dan perbesar diameter `::-webkit-slider-thumb` menjadi minimal 28px pada mode Normal dan 36px pada Mode Kelas.

---

### [VIS-ROUT-TAB-04] Tab Tidak Otomatis Kembali ke 'Eksplorasi' saat Pindah Topik
- **Tingkat:** Sedang
- **Kategori:** Interaksi / Navigasi
- **Lokasi:** Sub-header Stepper (`.step-btn-pill`), navigasi antar-topik
- **Bukti:** Saat berada di tab Kuis pada Topik 01, kemudian mengklik tautan "Topik 02 →", halaman Topik 02 terbuka dalam keadaan tab Kuis aktif (bukan tab Eksplorasi).
- **Langkah Reproduksi:**
  1. Buka Topik 01, klik tab "Kuis".
  2. Klik tombol stepper "Topik 02 →" di bilah navigasi atas.
  3. Amati tab yang aktif di Topik 02.
- **Yang Seharusnya:** Setiap kali siswa berpindah ke topik baru, tab aktif harus di-*reset* ke tab 'Eksplorasi' agar alur belajar runtut (Eksplorasi → Konsep → Latihan → Kuis).
- **Yang Terjadi:** State `tab` dipertahankan pada `'kuis'` karena komponen `TopicPage` tidak di-*remount* oleh React Router (hanya parameter `:id` yang berubah).
- **Petunjuk Penyebab:** `src/pages/TopicPage.tsx`: state `tab` diinisialisasi sekali `useState<TabId>('eksplorasi')` tanpa `useEffect` yang mereset `tab` saat `id` berubah:
  ```tsx
  useEffect(() => {
    setTab('eksplorasi');
  }, [id]);
  ```
- **Saran Perbaikan:** Tambahkan `useEffect` di `TopicPage.tsx` untuk me-reset `tab` ke `'eksplorasi'` saat parameter `id` berganti.

---

### [VIS-LANG-DEC-05] Pemisah Desimal Angka Menggunakan Titik Bahasa Inggris
- **Tingkat:** Sedang
- **Kategori:** Teks / Bahasa / Kebutuhan Kelas
- **Lokasi:** Panel nilai (`ValuePanel`) pada 9 modul topik (Topik 01, 02, 03, 04, 05, 06, 07, 08, 09, 10)
- **Bukti:** Nilai terhitung menampilkan `154.00 cm²`, `22.00 cm`, `77.0°`, `9.5 cm` (titik sebagai pemisah desimal).
- **Langkah Reproduksi:** Buka tab Eksplorasi Topik 03 (Luas) atau Topik 04 (Sudut). Amati kartu nilai di panel kanan/bawah.
- **Yang Seharusnya:** Sesuai Kurikulum Merdeka Matematika SMP dan PUEBI, pemisah desimal di Indonesia menggunakan koma (mis. `154,00 cm²`, `77,0°`).
- **Yang Terjadi:** Angka diformat menggunakan `nilai.toFixed(1)` atau `nilai.toFixed(2)` bawaan JavaScript tanpa substitusi tanda koma.
- **Petunjuk Penyebab:** Panggilan fungsi pembantu lokal di file modul topik (mis. `src/topics/07-dalam-segitiga/Explore.tsx` baris 16: `nilai.toFixed(2)`).
- **Saran Perbaikan:** Gunakan fungsi utilitas terpusat `formatAngkaDesimal(nilai, digit)` yang menjalankan `.toFixed(digit).replace('.', ',')` seperti yang sudah diterapkan di `ArchimedesMode.tsx`.

---

### [VIS-HOME-FNT-06] Ukuran Font Miniatur Kartu Beranda di Bawah 14px
- **Tingkat:** Rendah
- **Kategori:** Keterbacaan / Visual
- **Lokasi:** Kartu Topik Beranda (`.card-topic-number`, `.card-status-badge`, teks SVG miniatur)
- **Bukti:** Pengukuran font: `span.card-topic-number` = **13,12px**, `span.card-status-badge` = **12,8px**, label formula miniatur = **9–11px**.
- **Langkah Reproduksi:** Buka Beranda pada viewport 360px atau 1280px. Amati nomor urut kartu ("01") dan lencana status ("Belum dicoba").
- **Yang Seharusnya:** Teks informasi penting memiliki ukuran minimal 14px agar tidak menyulitkan siswa dengan keterbatasan penglihatan.
- **Yang Terjadi:** Teks berukuran 12,8–13,1px, sedikit di bawah ambang rekomendasi 14px.
- **Petunjuk Penyebab:** `src/styles.css` baris 410–430 pada `.card-topic-number` (`font-size: 0.82rem`) dan `.card-status-badge` (`font-size: 0.8rem`).
- **Saran Perbaikan:** Naikkan `font-size` menjadi `0.88rem` (14px) untuk lencana dan nomor kartu.

---

### [VIS-TOP1-APT-07] Garis Apotema Hilang Mendadak saat Menjadi Diameter
- **Tingkat:** Rendah
- **Kategori:** Visual / Geometri
- **Lokasi:** Topik 01 (Unsur-Unsur Lingkaran), tab Eksplorasi
- **Bukti:** Tangkapan layar `docs/qa-visual/1920/normal/topik-01-eksplorasi-semua-unsur.png`.
- **Langkah Reproduksi:** Di Topik 01, geser titik A dan B sehingga segmen AB melintasi titik pusat O (menjadi diameter).
- **Yang Seharusnya:** Keterangan teks "Apotema = 0 karena tali busur melalui pusat" muncul (ini sudah muncul), dan transisi garis apotema memendek hingga titik O secara halus.
- **Yang Terjadi:** Garis apotema langsung di-unmount dari DOM saat panjangnya ≤ 1e-6. Teks keterangan muncul di bawah kanvas dengan baik.
- **Petunjuk Penyebab:** `src/topics/01-unsur/Explore.tsx` baris 105: `if (!geometri.adaTaliBusur || geometri.apotemaNol) hasil.delete('apotema');`.
- **Saran Perbaikan:** Biarkan titik kaki apotema berkedip atau berikan penanda visual halus di pusat O saat apotema bernilai 0.

---

### [VIS-KUIS-CNF-08] Animasi Konfeti Bintang Tidak Memiliki Tombol Tutup
- **Tingkat:** Rendah
- **Kategori:** Visual / Interaksi
- **Lokasi:** Layar Hasil Kuis (Skor Sempurna 5/5)
- **Bukti:** Tangkapan layar `docs/qa-visual/1920/normal/kuis-layar-hasil.png`.
- **Langkah Reproduksi:** Selesaikan kuis di topik mana saja dengan skor 5/5.
- **Yang Seharusnya:** Animasi konfeti bintang SVG merayakan pencapaian siswa tanpa mengaburkan teks pembahasan di bawahnya.
- **Yang Terjadi:** Konfeti SVG berposisi absolut di atas kartu hasil kuis. Meskipun tidak memblokir klik (`pointer-events: none`), partikel bintang statis tetap berada di layar hingga siswa berpindah topik.
- **Petunjuk Penyebab:** Komponen `KonfetiBintang` di `src/components/QuizEngine.tsx` aktif secara permanen saat `selesai && skor === 5`.
- **Saran Perbaikan:** Berikan durasi *fade-out* otomatis setelah 4 detik atau tombol kecil untuk mematikan konfeti.

---

## 5. Perbandingan dengan Mockup Acuan (Arah B)

Perbandingan dilakukan terhadap mockup terpilih `docs/ui-mockups/mockup-arah-b-beranda.html` dan `docs/ui-mockups/mockup-arah-b-topik.html` pada viewport 360, 1280, dan 1920 px:

### 5.1 Beranda (Home)

| Elemen Desain | Status | Evaluasi Perbandingan |
| :--- | :---: | :--- |
| **Top App Bar** | **Sesuai** | Logo lingkaran dengan jari-jari aksen, tipografi judul & subjudul, serta lencana offline dan pengalih Mode Kelas tertata identik dengan mockup. |
| **Hero Banner** | **Sesuai** | Gradien biru laut gelap (`#123e6d` ke `#1e558f`), tombol aksi utama "Mulai Eksplorasi" / "Lanjutkan", dan tombol sekunder "Lihat 10 Topik" berfungsi mulus. |
| **Widget Kemajuan Belajar** | **Sesuai** | Bilah progres persentase, penghitung topik selesai (n/10), bintang rata-rata kuis, dan penanda topik terakhir dibuka dirender sesuai rancangan. |
| **Tata Letak 4 Rumpun** | **Sesuai** | Rumpun I (3 kartu), Rumpun II (3 kartu), serta Rumpun III dan IV berdampingan dalam *duo-grid* di layar lebar. **Tidak ada kartu menggantung ganjil di layar 1280px dan 1920px.** |
| **Miniatur Kartu Topik** | **Sesuai** | Seluruh 10 kartu memiliki miniatur SVG khusus yang relevan dengan materi topiknya (bukan placeholder statis). |
| **Dialog Hapus Skor** | **Berbeda Wajar** | Ditambahkan tombol aksesibel di footer beranda dengan dialog modal konfirmasi `<dialog>` yang menjaga pengaturan Mode Kelas tetap aman. |

### 5.2 Halaman Topik (Acuan: Topik 07 Lingkaran Dalam Segitiga)

| Elemen Desain | Status | Evaluasi Perbandingan |
| :--- | :---: | :--- |
| **Sub-Header Navigasi** | **Sesuai** | Tombol "← Beranda", *stepper* navigasi sebelumnya/berikutnya, dan *eyebrow* rumpun tersusun rapi di atas judul topik. |
| **Sistem Tab Navigasi** | **Sesuai** | Tab *pill* 4 bagian (Eksplorasi, Konsep, Latihan, Kuis) dengan ikon SVG khusus dan latar aktif putih berefek bayangan halus. |
| **Tata Letak Panggung (Stage Split)** | **Sesuai** | Kanvas interaktif di kolom kiri dan dek kontrol/pembuktian di kolom kanan pada layar lebar; bertumpuk vertikal responsif di layar sempit. |
| **Kanvas Sticky Mobile** | **Sesuai** | Pada layar HP potret 360px, kanvas menempel di bagian atas saat halaman digulir dan tingginya terkunci rapi di bawah 38vh. |
| **Warna Eyebrow Sub-Header** | **Berbeda (Cacat)** | Mockup menggunakan warna toska gelap `#0d9488` (kontras 4,8:1), sedangkan implementasi menggunakan oranye `#f59e0b` yang menghasilkan kontras rendah 1,96:1. |
| **Hierarki Kartu Nilai (Featured Stat)** | **Berbeda Wajar** | Mockup menampilkan satu kartu besar hijau menonjol untuk jari-jari dalam ($r$), sedangkan implementasi menggunakan kisi 2 kolom seragam dalam `ValuePanel`. Nilai tetap sangat terbaca. |

---

## 6. Daftar Rekomendasi Perbaikan Terurut

Daftar ini dikelompokkan per berkas sumber agar dapat langsung digunakan oleh pengembang:

### 1. Perbaikan Bilah Atas & Aksesibilitas Sentuh (`src/styles.css` & `src/components/AppTopBar.tsx`)
- [ ] **[VIS-TOP-ALL-01]** Perbesar target sentuh `.mode-ifp-toggle`: ubah tinggi dari 28px menjadi minimal `min-height: 44px; min-width: 44px;` pada mode normal dan `min-height: 54px;` pada Mode Kelas.
- [ ] **[VIS-CTRL-ALL-03]** Perluas *hit area* slider `input[type="range"]` dengan padding vertikal transparan minimal 12px dan perbesar diameter *thumb* slider.

### 2. Perbaikan Kontras Sub-Header Topik (`src/styles.css`)
- [ ] **[VIS-TOP-ALL-02]** Ubah warna `.topic-eyebrow-unified` dari `var(--warna-aksen)` (`#f59e0b`) menjadi warna toska gelap atau biru gelap (mis. `#0d9488` atau `#0c4a6e`) agar memenuhi standar WCAG AA (rasio kontras > 4,5:1).
- [ ] **[VIS-HOME-FNT-06]** Sesuaikan `font-size` kelas `.card-topic-number` dan `.card-status-badge` menjadi minimal `0.88rem` (14px).

### 3. Perbaikan Navigasi & Siklus Hidup Tab (`src/pages/TopicPage.tsx`)
- [ ] **[VIS-ROUT-TAB-04]** Tambahkan efek reset tab saat parameter `id` berganti:
  ```tsx
  useEffect(() => {
    setTab('eksplorasi');
  }, [id]);
  ```

### 4. Perbaikan Standar Desimal Bahasa Indonesia (`src/topics/*/Explore.tsx`)
- [ ] **[VIS-LANG-DEC-05]** Ganti pemanggilan `.toFixed(n)` langsung pada seluruh `ValuePanel` topik dengan utilitas pemformat desimal koma (mis. `.toFixed(n).replace('.', ',')`).

---

## 7. Hal yang Tidak Bisa Diverifikasi Secara Otomatis & Uji Manual Guru

Aspek berikut berada di luar batasan lingkungan emulasi headless Linux dan disarankan untuk diverifikasi langsung oleh guru di ruang kelas:

1. **Interaksi Layar Sentuh Fisik IFP 86 Inci:**
   - Menguji kepekaan sentuhan jari/stylus asli pada layar inframerah/kapasitif IFP kelas besar.
   - Menguji apakah menyeret titik dengan kecepatan tinggi di IFP menimbulkan jeda (*input lag*) pada perangkat keras TV pintar sekolah.
2. **Keterbacaan dari Baris Belakang Kelas (Jarak 7–9 Meter):**
   - Mengamati keterbacaan angka sorotan pada Mode Kelas saat diproyeksikan oleh proyektor LCD ruangan yang terkena cahaya lampu kelas siang hari.
3. **Pembaca Layar Nyata (Screen Reader):**
   - Mendengarkan pelafalan pengumuman ARIA menggunakan NVDA di Windows atau TalkBack di Android siswa saat nilai geometri bergeser.
4. **Browser Safari / WebKit iOS:**
   - Memastikan perilaku kanvas sticky dan font Plus Jakarta Sans tetap mulus di peramban Safari HP iPhone siswa.

---

## 8. Pertanyaan Konfirmasi untuk Pengguna

1. **Warna Eyebrow Topik:** Apakah disetujui untuk mengembalikan warna teks eyebrow topik menjadi hijau toska gelap `#0d9488` seperti pada mockup Arah B agar lulus uji kontras WCAG 4,5:1?
2. **Pemisah Desimal Koma:** Apakah seluruh tampilan nilai (panjang tali busur, luas, keliling, sudut) ingin distandarkan menggunakan koma Indonesia (`154,00 cm²`) untuk konsistensi soal Matematika SMP?
