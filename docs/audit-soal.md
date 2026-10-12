# Audit Latihan dan Kuis — Simulasi Lingkaran SMP

Tanggal audit: 10 Oktober 2026. Audit ini membaca generator dan komponen aplikasi tanpa mengubah kode aplikasi atau dependensi.

## 1. Ringkasan eksekutif

Kesimpulan: **layak dari sisi generator dan pemeriksaan kode otomatis; uji manual yang tercantum tetap diperlukan**.
Jumlah temuan teragregasi: 0 aturan temuan (0 kemunculan pada soal/paket yang diuji).
Kritis: 0; Tinggi: 0; Sedang: 0; Rendah: 0.
Semua jenis yang terinventarisasi diuji sedikitnya 2.000 seed per jenis: ya.
Risiko terbesar: tidak ada risiko Kritis/Tinggi yang terverifikasi pada audit otomatis.
Laporan ini adalah hasil audit ulang setelah perbaikan; status setiap jenis soal dan alur dicatat di bawah.

## 2. Inventaris

Jumlah pada kolom seed dan variasi mengikuti urutan jenis soal yang ditulis pada kolom jenis. A = kebenaran kunci, B = kelayakan matematis, C = pilihan ganda, D = parser/toleransi, E = konsistensi teks, F = determinisme/keragaman. Kebijakan parser dijelaskan pada bagian hasil alur.

| Topik | Jenis soal dan format jawaban | Seed diuji per jenis | Variasi unik per jenis | Status A–F per jenis |
|---|---|---:|---:|---|
| 01-unsur — Unsur-unsur lingkaran | diameter (pilihan ganda)<br>jari-jari (isian numerik)<br>keliling (isian numerik) | 2000, 2000, 2000 | 1916, 37, 37 | diameter: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>jari-jari: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>keliling: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus |
| 02-keliling — Keliling lingkaran | radius (isian numerik)<br>diameter (pilihan ganda)<br>balik (isian numerik)<br>busur (isian numerik)<br>roda (isian numerik)<br>ukur (pilihan ganda)<br>rasio (isian numerik)<br>apit (pilihan ganda) | 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000 | 31, 1886, 31, 155, 248, 1368, 781, 216 | radius: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>diameter: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>balik: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>busur: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>roda: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>ukur: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>rasio: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>apit: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus |
| 03-luas — Luas lingkaran | radius (isian numerik)<br>diameter (pilihan ganda)<br>balik (isian numerik)<br>juring (isian numerik)<br>gabungan (isian numerik)<br>setengah (isian numerik) | 2000, 2000, 2000, 2000, 2000, 2000 | 31, 1876, 31, 155, 31, 31 | radius: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>diameter: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>balik: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>juring: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>gabungan: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>setengah: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus |
| 04-sudut — Sudut pusat dan sudut keliling | sudut pusat (pilihan ganda) | 2000 | 1911 | sudut pusat: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus |
| 05-tali-busur — Sudut antara dua tali busur | dua-busur (isian numerik)<br>cari-busur (pilihan ganda) | 2000, 2000 | 1986, 2000 | dua-busur: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>cari-busur: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus |
| 06-segi-empat — Segi empat tali busur | berhadapan (isian numerik)<br>aljabar (isian numerik)<br>luar (isian numerik) | 2000, 2000, 2000 | 131, 41, 111 | berhadapan: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>aljabar: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>luar: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus |
| 07-dalam-segitiga — Lingkaran dalam segitiga | radius (isian numerik)<br>luas (isian numerik)<br>siku-siku (isian numerik) | 2000, 2000, 2000 | 48, 30, 48 | radius: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>luas: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>siku-siku: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus |
| 08-luar-segitiga — Lingkaran luar segitiga | tripel (isian numerik)<br>sama-kaki (isian numerik)<br>siku-siku (isian numerik)<br>klasifikasi (pilihan ganda) | 2000, 2000, 2000, 2000 | 48, 36, 47, 60 | tripel: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>sama-kaki: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>siku-siku: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>klasifikasi: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus |
| 09-garis-singgung — Garis singgung lingkaran | panjang (isian numerik)<br>cari-radius (isian numerik)<br>cari-jarak (isian numerik)<br>luar (isian numerik)<br>dalam (isian numerik)<br>sudut (pilihan ganda) | 2000, 2000, 2000, 2000, 2000, 2000 | 48, 48, 48, 48, 48, 482 | panjang: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>cari-radius: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>cari-jarak: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>luar: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>dalam: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>sudut: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus |
| 10-kedudukan — Kedudukan dua lingkaran | klasifikasi (pilihan ganda)<br>jumlah-garis (pilihan ganda)<br>jumlah-titik (pilihan ganda)<br>cari-d-luar (isian numerik)<br>cari-d-dalam (isian numerik)<br>rentang-potong (pilihan ganda) | 2000, 2000, 2000, 2000, 2000, 2000 | 2000, 1996, 1988, 549, 552, 1856 | klasifikasi: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>jumlah-garis: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>jumlah-titik: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>cari-d-luar: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>cari-d-dalam: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus<br>rentang-potong: A lulus, B lulus, C lulus, D lulus, E lulus, F lulus |

Tingkat kesulitan tidak memiliki field khusus pada tipe `Question`. Karena itu generator tidak menyimpan atau menampilkan tingkat kesulitan formal; tingkat hanya dapat diinferensikan dari struktur soal. Satuan yang muncul terutama cm, cm², dan °.

## 3. Temuan

Tidak ada temuan otomatis.

## 4. Hasil alur Latihan/Kuis

| Butir | Status | Catatan berbasis pembacaan kode |
|---|---|---|
| Latihan: tombol Periksa dan umpan balik | Lulus | Tombol, status benar/salah, pembahasan, dan satu live region bersama tersedia. Tidak ada skor latihan yang dapat digandakan. |
| Latihan: Soal baru dan reset jawaban | Lulus | `soalBaru` mengganti seed, soal, jawaban, status diperiksa, dan memindahkan fokus ke judul soal baru. |
| Kuis: tepat 5 soal dan maju | Lulus | `buatPaketKuis` membuat lima soal; tombol Lanjut maju dan kunci sekali dengan `sudahDijawab`. |
| Kuis: mundur | Tidak tersedia | Tidak ada tombol atau state untuk mundur; tidak diuji sebagai fitur yang tersedia. |
| Kuis: skor, hasil, dan Ulangi | Lulus | Skor bertambah sekali per soal, layar hasil diumumkan lewat live region, dan Ulangi mereset state serta membuat seed baru. |
| Reset saat pindah topik | Lulus | Engine diberi `key={meta.id}`; perpindahan tab/topik yang meninggalkan kuis meminta konfirmasi dan menghapus progres sementara setelah disetujui. |
| Skor terbaik tidak turun | Lulus | `simpanSkorTerbaik` hanya menulis jika skor baru lebih besar. `try/catch` melindungi baca/tulis. |
| Data localStorage rusak/kosong | Lulus | JSON rusak, kosong, bukan number, bukan integer, atau di luar rentang 0–5 diabaikan; baca/tulis dilindungi `try/catch`. |
| Kunci localStorage antar-topik | Lulus | Satu objek JSON memakai `topikId` sebagai property. |
| Reload di tengah kuis | Catatan | State kuis tidak dipersistenkan; reload memulai state kuis baru dengan seed baru. |
| Jaringan putus | Catatan | README menyatakan aset dibundel dan PWA melakukan precache; alur kuis tidak memiliki state jaringan khusus. Uji offline perangkat nyata belum dilakukan. |
| `aria-live` untuk feedback | Lulus | Komponen `AnswerFeedback` selalu ada di DOM dengan `role=status`, `aria-live=polite`, ikon, dan teks; hasil akhir kuis memakai region yang sama. |
| Keyboard, target sentuh, kontras | Lulus sebagian | Kontrol native fokus keyboard, tombol utama dan opsi memiliki tinggi minimal 44–52 px, fokus judul berpindah setelah soal baru, dan warna dilengkapi ikon/teks. Pembaca layar serta perangkat nyata tetap perlu diuji manual. |

Statistik paket kuis dari 2.000 seed per topik:

| Topik | Paket diuji | Paket dengan soal kembar | Paket dengan tiga jenis sama berurutan | Contoh |
|---|---:|---:|---:|---|
| 01-unsur | 2000 | 0 | 0 | — |
| 02-keliling | 2000 | 0 | 0 | — |
| 03-luas | 2000 | 0 | 0 | — |
| 04-sudut | 2000 | 0 | N/A | — |
| 05-tali-busur | 2000 | 0 | 0 | — |
| 06-segi-empat | 2000 | 0 | 0 | — |
| 07-dalam-segitiga | 2000 | 0 | 0 | — |
| 08-luar-segitiga | 2000 | 0 | 0 | — |
| 09-garis-singgung | 2000 | 0 | 0 | — |
| 10-kedudukan | 2000 | 0 | 0 | — |

Kebijakan parser: koma atau titik desimal, spasi luar, minus Unicode, simbol derajat, dan akhiran `derajat`, `cm`, `cm2`, `cm²`, atau `satuan` diterima. Pemisah tunggal dengan tiga digit di belakangnya menghasilkan dua kandidat; jawaban diterima bila salah satunya cocok dengan kunci dalam toleransi. Campuran pemisah, pemisah berulang, notasi ilmiah, pecahan, kosong, dan huruf saja ditolak dengan pesan netral yang jelas.

Uji toleransi pada 74000 isian numerik: kunci persis diterima 74000/74000; dari 62995 pembahasan yang memiliki nilai akhir numerik, hasil tampil diterima 62995/62995; jawaban yang digeser jelas dari kunci ditolak 74000/74000; jawaban dengan nilai π alternatif yang berbeda melampaui toleransi ditolak 18596 kasus.

Determinisme: lulus; soal dan paket yang dipanggil dua kali dengan seed sama memiliki JSON identik pada seluruh 10 topik dan seed pemeriksaan.

## 5. Hasil uji kepekaan

Kunci tiga generator dimutasi sementara di memori dengan mengubah nilainya sebesar +1 atau mengganti string. Verifier independen harus mendeteksi seluruh mutasi.

| Generator | Seed | Mutasi | Hasil |
|---|---:|---|---|
| 03-luas | 1 | 11 → dimutasi | Terdeteksi |
| 08-luar-segitiga | 1 | 42,5 → dimutasi | Terdeteksi |
| 10-kedudukan | 2 | 0 → dimutasi | Terdeteksi |

## 6. Daftar perbaikan terurut

1. **Selesai — Kritis** — Topik 5 memakai perpanjangan tali busur sebagai garis secan serta busur jauh/dekat.
2. **Selesai — Kritis** — Topik 7 menurunkan `r`, `s`, dan luas dari segitiga valid yang diverifikasi dengan Heron.
3. **Selesai — Tinggi** — Engine di-reset dengan key topik; perpindahan tab/topik dari kuis meminta konfirmasi.
4. **Selesai — Tinggi** — Feedback dan skor akhir memakai satu live region `role=status`/`aria-live=polite`.
5. **Selesai — Sedang** — Pilihan diacak deterministik, kunci tidak menetap pada satu posisi, dan paket kuis menghindari duplikasi.
6. **Selesai — Sedang** — Angka tampilan memakai koma, kunci dan pembahasan memakai pembulatan dua desimal yang sama.
7. **Selesai — Sedang** — Parser menerima satuan umum, menolak bentuk rusak, dan memilih tafsiran pemisah ambigu berdasarkan kunci.
8. **Selesai — Sedang** — Skor localStorage divalidasi sebagai integer 0–5 tanpa mengubah skema lama.
9. **Selesai — Sedang** — Ruang parameter diperluas; seluruh jenis memiliki sedikitnya 30 variasi pada 2.000 seed.

## 7. Hal yang tidak bisa diverifikasi

- Tampilan KaTeX pada semua browser, ukuran layar, pembaca layar, dan perangkat nyata.
- Kontras aktual setelah rendering perangkat dan mode kontras tinggi.
- Perilaku service worker offline pada instalasi PWA nyata; audit ini hanya membaca konfigurasi dan kode.
- Kesesuaian redaksi dengan buku pegangan sekolah tertentu.
- Kualitas ilustrasi geometri yang tidak dirujuk oleh generator soal.

Daftar uji manual untuk guru:

1. Buka setiap jenis soal pada sampel dan hitung ulang dari angka di teks.
2. Coba jawaban dengan koma, titik, spasi, minus Unicode, derajat, dan satuan.
3. Jalankan kuis, pindah topik pada setiap posisi, reload di tengah kuis, dan ulangi kuis.
4. Uji keyboard saja dan pembaca layar pada feedback benar/salah.
5. Putuskan jaringan setelah aplikasi dibuka sekali, lalu ulangi Latihan dan Kuis.
6. Periksa khusus contoh topik 5 luar, topik 7 luas, dan topik 10 “satu di dalam yang lain”.

## Lampiran: metode audit

Skrip membaca `buatSoal` dan `buatPaketKuis`, mengumpulkan sedikitnya 2.000 seed per jenis, membandingkan kunci dengan perhitungan independen, memeriksa domain geometri, opsi, teks, determinisme, variasi, parser, dan paket kuis. Jalankan terpisah dari tes bawaan dengan:

```bash
npx vitest run scripts/audit/audit-soal.test.ts
```

Tes ini menghasilkan laporan ini dan `docs/sampel-soal.md`. Tes bawaan `npm run test` tidak memasukkan folder `scripts/audit` karena konfigurasi Vitest hanya menyertakan `src/**/*.test.ts`.
