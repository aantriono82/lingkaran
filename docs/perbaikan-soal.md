# Laporan Perbaikan Soal

Tanggal: 10 Oktober 2026

## Ringkasan

Perbaikan dilakukan berdasarkan `docs/audit-soal.md` dan `docs/sampel-soal.md`. Tidak ada dependensi atau skema localStorage yang dinaikkan. Skor lama tetap dibaca dari kunci `simulasi-lingkaran-skor-terbaik`; nilai rusak diabaikan saat baca.

### Tahap 1 — Kritis dan Tinggi

| ID audit | Status | Tes regresi | Berkas utama |
|---|---|---|---|
| A-001 | Diperbaiki | `membangun segitiga sumber yang sah untuk seluruh soal Topik 7` — 2.000 seed | `src/lib/quiz/generator.ts`, `src/lib/quiz/repair.test.ts` |
| A-002 | Diperbaiki | `memakai istilah secan...` dan pemeriksaan string generator/konsep/eksplorasi | `src/lib/quiz/generator.ts`, `src/topics/05-tali-busur/` |
| A-003 | Diperbaiki | Tes istilah lama pada 2.000 seed | `src/lib/quiz/generator.ts`, `src/topics/05-tali-busur/` |
| A-004 | Diperbaiki | `menyediakan live region bersama...` | `src/components/AnswerFeedback.tsx`, `PracticeEngine.tsx`, `QuizEngine.tsx` |
| A-005 | Diperbaiki | `mereset engine dengan key topik...` dan tes paket/state | `src/pages/TopicPage.tsx`, `src/components/TopicLayout.tsx` |

Perbaikan Topik 7 memilih segitiga dari tabel yang diverifikasi, memberi skala integer, lalu menurunkan `r`, `s`, luas, dan sisi. Tes menghitung ulang ketidaksamaan segitiga, rumus Heron, `L = r × s`, dan batas `s ≥ 3√3r`. Topik 8–10 juga diuji pada 2.000 seed dengan sumber geometri dan syarat jarak pusat.

Feedback kini selalu memiliki satu region DOM dengan `role="status"` dan `aria-live="polite"`. Tombol pemeriksaan tetap fokus; judul soal menerima fokus setelah “Soal baru”, “Lanjut”, atau “Ulangi”. Perpindahan tab/topik dari kuis berjalan meminta konfirmasi.

### Tahap 2 — Sedang

| ID audit | Status | Tes/status akhir | Perubahan |
|---|---|---|---|
| A-006–A-011 | Diperbaiki | Audit ulang E lulus | Pembahasan matematika dirender oleh `MathText` melalui KaTeX. |
| A-012–A-017 | Diperbaiki | Audit ulang E lulus | Formatter tampilan memakai koma dan kunci mengikuti pembulatan dua desimal. |
| A-018–A-035 | Diperbaiki | Audit ulang C dan paket lulus | Pilihan diacak dengan Fisher–Yates deterministik; paket menolak signature kembar dan tiga jenis berturut-turut bila jenis tersedia. |
| A-036–A-039 | Diperbaiki | Audit ulang F lulus | Ruang parameter diperluas dengan nilai rapi dan domain geometri tetap valid. |
| A-040 | Diperbaiki | `penyimpanan skor terbaik` — skor 0–5 | `src/lib/storage.ts`, `src/lib/storage.test.ts` |
| A-041–A-042 | Diperbaiki | `menerima satuan...` dan pemeriksaan parser audit | `parseNumericCandidates`, `pesanKesalahanNumerik`, `src/lib/quiz/repair.test.ts` |
| A-043–A-066 | Diperbaiki | Audit ulang 2.000 seed/type: 0 temuan Kritis/Tinggi/Sedang | Konsistensi teks, toleransi, variasi, dan paket diverifikasi ulang; tidak ada temuan tersisa yang memerlukan keputusan desain. |

Rentang ID sedang di atas mempertahankan urutan temuan pada laporan awal; laporan audit ulang menghasilkan inventaris baru dan menyatakan semua status A–F lulus. Setiap tipe memiliki sedikitnya 30 kombinasi unik pada 2.000 seed; tipe Topik 7 luas menghasilkan tepat 30 kombinasi dan memenuhi ambang “di bawah 30”.

## Parser jawaban numerik

Parser menerima koma atau titik desimal, spasi luar, minus Unicode, `70°`, `70 derajat`, `154 cm`, `154 cm2`, `154 cm²`, dan `22 satuan`. Satuan diabaikan; yang dinilai adalah angkanya. `1,234` dan `1.386` menghasilkan dua kandidat, lalu `jawabanSama` menerimanya bila salah satu cocok dengan kunci dalam toleransi. Campuran koma-titik, pemisah berulang, kosong, huruf saja, `1e3`, `1/2`, `∞`, dan `NaN` ditolak dengan pesan netral.

## Verifikasi dan hasil sementara

- Tes sebelum perbaikan sengaja gagal pada tujuh pemeriksaan regresi, termasuk skor `99`, istilah lama, parser satuan, dan state/live region.
- `npm run test`: lulus, 11 berkas dan 98 tes.
- `npm run build`: lulus tanpa error TypeScript.
- Audit terpisah: `npx vitest run --config scripts/audit/vitest.config.ts`, lulus 3 tes; 2.000 seed per jenis; 0 Kritis, 0 Tinggi, 0 Sedang.
- Uji kepekaan tiga mutasi kunci tetap terdeteksi.

## Keputusan yang diperlukan

Tidak ada keputusan desain yang menghalangi perbaikan Kritis/Tinggi atau temuan Sedang yang terdeteksi otomatis. Aplikasi saat reload di tengah kuis memulai kuis baru dan tidak memulihkan progres; ini dicatat sebagai perilaku yang perlu dikonfirmasi guru bila ingin diubah pada pekerjaan berikutnya.

## Pemeriksaan manual yang tersisa

1. Uji `aria-live` dengan pembaca layar dan pastikan fokus judul soal berpindah sesuai harapan.
2. Periksa kontras serta ukuran feedback di IFP dan ponsel.
3. Baca sampel Topik 5 dan Topik 7 pada `docs/sampel-soal.md`.
4. Pasang aplikasi, putuskan jaringan setelah aset ter-cache, lalu ulangi Latihan dan Kuis.
5. Periksa tampilan KaTeX pada browser target dan mode kontras tinggi.

## Berkas yang berubah

Generator, tipe soal, parser, penyimpanan, komponen Latihan/Kuis, navigasi topik, konten Topik 5, gaya feedback, tes regresi, skrip audit, serta dua dokumen audit diperbarui. Dependensi dan `package.json` tidak diubah.
