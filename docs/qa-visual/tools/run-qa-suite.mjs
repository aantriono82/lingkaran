import { ChromeSession, VIEWPORTS, TOPICS, OUTPUT_DIR, BASE_URL } from './qa-session.mjs';
import { MEASUREMENT_SCRIPTS } from './qa-measurements.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

async function run() {
  console.log('=== Memulai QA Visual Suite Simulasi Lingkaran SMP ===');
  const session = new ChromeSession();
  await session.launch();
  console.log('Chrome berhasil diluncurkan');

  const reportData = {
    timestamp: new Date().toISOString(),
    viewportsTested: [],
    pagesTested: [],
    overflowResults: [],
    fontResults: [],
    touchResults: [],
    contrastResults: [],
    dragAccuracyResults: [],
    stickyCanvasResults: [],
    overlapResults: [],
    specialStatesResults: [],
    offlineResult: {},
    consoleErrors: [],
    networkExternalRequests: [],
    perfThrottleResults: []
  };

  try {
    // ----------------------------------------------------
    // 1. BERANDA (5 viewports + Landscape 800, normal & kelas)
    // ----------------------------------------------------
    console.log('\n--- 1. Menguji Beranda ---');
    const berandaWidths = [360, 768, 1280, 1920, 3840, 800];

    for (const w of berandaWidths) {
      const vp = VIEWPORTS[w];
      const isLandscape = w === 800;
      await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);

      for (const mode of ['normal', 'kelas']) {
        console.log(`Beranda: ${w}px (${mode})`);
        reportData.viewportsTested.push({ page: 'Beranda', width: w, mode });

        // Pengguna baru (Clean Storage)
        await session.clearStorage();
        await session.setModeKelas(mode === 'kelas');
        await session.navigate('');
        await session.waitForLoad(1000);

        // Pengukuran
        const overflow = await session.evaluate(MEASUREMENT_SCRIPTS.checkOverflow);
        const fonts = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureFonts})('${mode}')`);
        const touch = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureTouchTargets})('${mode}')`);
        const contrast = await session.evaluate(MEASUREMENT_SCRIPTS.measureContrast);

        reportData.overflowResults.push({ page: 'Beranda', width: w, mode, ...overflow });
        reportData.fontResults.push({ page: 'Beranda', width: w, mode, ...fonts });
        reportData.touchResults.push({ page: 'Beranda', width: w, mode, ...touch });
        reportData.contrastResults.push({ page: 'Beranda', width: w, mode, ...contrast });

        const folder = isLandscape ? '800' : `${w}`;
        await session.captureScreenshot(`${folder}/${mode}/beranda-baru.png`);

        // Pengguna dengan kemajuan (Score seeded)
        await session.setScores({
          '01-unsur': 5,
          '02-keliling': 4,
          '03-luas': 5
        });
        await session.evaluate(`
          try {
            localStorage.setItem('simulasi-lingkaran-topik-terakhir', JSON.stringify({
              versi: 1, topikId: '03-luas', waktu: Date.now()
            }));
          } catch(e) {}
        `);
        await session.navigate('');
        await session.waitForLoad(800);
        await session.captureScreenshot(`${folder}/${mode}/beranda-kemajuan.png`);

        // Dialog Hapus Skor (pada 1920 dan 360)
        if (w === 1920 || w === 360) {
          const dialogClicked = await session.evaluate(`
            (() => {
              const btn = document.querySelector('.button-reset-progress');
              if (btn) { btn.click(); return true; }
              return false;
            })()
          `);
          if (dialogClicked) {
            await session.waitForLoad(400);
            await session.captureScreenshot(`${folder}/${mode}/dialog-hapus-skor.png`);
            // Klik konfirmasi hapus skor
            await session.evaluate(`
              (() => {
                const dangerBtn = document.querySelector('.progress-reset-dialog .button.danger');
                if (dangerBtn) dangerBtn.click();
              })()
            `);
            await session.waitForLoad(400);
          }
        }
      }
    }

    // ----------------------------------------------------
    // 2. SEMUA 10 TOPIK - TAB EKSPLORASI
    // ----------------------------------------------------
    console.log('\n--- 2. Menguji Tab Eksplorasi (10 Topik) ---');
    for (let i = 0; i < TOPICS.length; i++) {
      const topicId = TOPICS[i];
      const topicNum = String(i + 1).padStart(2, '0');
      console.log(`Topik ${topicNum} (${topicId}) - Eksplorasi`);

      // Viewports wajib: 360, 768, 1280, 1920 (normal), 1920 (kelas)
      // Viewport 3840 untuk topik 1, 4, 7, 10
      // Viewport 800 (landscape) untuk topik 1, 3, 7
      const testWidths = [360, 768, 1280, 1920];
      if ([1, 4, 7, 10].includes(i + 1)) testWidths.push(3840);
      if ([1, 3, 7].includes(i + 1)) testWidths.push(800);

      for (const w of testWidths) {
        const vp = VIEWPORTS[w];
        const isLandscape = w === 800;
        const folder = isLandscape ? '800' : `${w}`;
        await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);

        // Normal mode
        await session.setModeKelas(false);
        await session.navigate(`/topik/${topicId}`);
        await session.waitForLoad(800);

        const overflow = await session.evaluate(MEASUREMENT_SCRIPTS.checkOverflow);
        const fonts = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureFonts})('normal')`);
        const touch = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureTouchTargets})('normal')`);
        const contrast = await session.evaluate(MEASUREMENT_SCRIPTS.measureContrast);
        const overlaps = await session.evaluate(MEASUREMENT_SCRIPTS.detectSvgTextOverlaps);

        reportData.overflowResults.push({ page: `Topik-${topicNum}`, tab: 'eksplorasi', width: w, mode: 'normal', ...overflow });
        reportData.fontResults.push({ page: `Topik-${topicNum}`, tab: 'eksplorasi', width: w, mode: 'normal', ...fonts });
        reportData.touchResults.push({ page: `Topik-${topicNum}`, tab: 'eksplorasi', width: w, mode: 'normal', ...touch });
        reportData.contrastResults.push({ page: `Topik-${topicNum}`, tab: 'eksplorasi', width: w, mode: 'normal', ...contrast });
        if (overlaps && overlaps.length > 0) {
          reportData.overlapResults.push({ page: `Topik-${topicNum}`, tab: 'eksplorasi', width: w, overlaps });
        }

        // Sticky Canvas check pada 360 (potret) dan 800 (lanskap)
        if (w === 360) {
          const stickyDataBefore = await session.evaluate(`
            (() => {
              const card = document.querySelector('#panel-eksplorasi .canvas-card');
              const svg = document.querySelector('#panel-eksplorasi .canvas-svg');
              if (!card || !svg) return null;
              const rCard = card.getBoundingClientRect();
              const rSvg = svg.getBoundingClientRect();
              return {
                cardTop: rCard.top,
                cardHeight: rCard.height,
                svgHeight: rSvg.height,
                vh: window.innerHeight,
                ratio: rSvg.height / window.innerHeight
              };
            })()
          `);

          // Gulir ke bawah
          await session.evaluate(`window.scrollTo(0, 300);`);
          await session.waitForLoad(300);

          const stickyDataAfter = await session.evaluate(`
            (() => {
              const card = document.querySelector('#panel-eksplorasi .canvas-card');
              const svg = document.querySelector('#panel-eksplorasi .canvas-svg');
              if (!card || !svg) return null;
              const rCard = card.getBoundingClientRect();
              const rSvg = svg.getBoundingClientRect();
              const cs = window.getComputedStyle(card);
              return {
                cardTop: rCard.top,
                position: cs.position,
                cardHeight: rCard.height,
                svgHeight: rSvg.height,
                vh: window.innerHeight,
                ratio: rSvg.height / window.innerHeight
              };
            })()
          `);

          reportData.stickyCanvasResults.push({
            topicNum,
            width: w,
            before: stickyDataBefore,
            after: stickyDataAfter
          });

          // Kembalikan scroll
          await session.evaluate(`window.scrollTo(0, 0);`);
          await session.waitForLoad(200);
        } else if (w === 800) {
          // Cek landscape (height <= 500px): sticky harus nonaktif
          const stickyLandscape = await session.evaluate(`
            (() => {
              const card = document.querySelector('#panel-eksplorasi .canvas-card');
              if (!card) return null;
              const cs = window.getComputedStyle(card);
              return {
                position: cs.position,
                windowHeight: window.innerHeight
              };
            })()
          `);
          reportData.stickyCanvasResults.push({
            topicNum,
            width: 800,
            landscape: stickyLandscape
          });
        }

        await session.captureScreenshot(`${folder}/normal/topik-${topicNum}-eksplorasi.png`);

        // Mode Kelas pada 1920
        if (w === 1920) {
          await session.setModeKelas(true);
          await session.waitForLoad(500);

          const fontsKelas = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureFonts})('kelas')`);
          const touchKelas = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureTouchTargets})('kelas')`);
          reportData.fontResults.push({ page: `Topik-${topicNum}`, tab: 'eksplorasi', width: w, mode: 'kelas', ...fontsKelas });
          reportData.touchResults.push({ page: `Topik-${topicNum}`, tab: 'eksplorasi', width: w, mode: 'kelas', ...touchKelas });

          await session.captureScreenshot(`1920/kelas/topik-${topicNum}-eksplorasi.png`);
        }
      }
    }

    // ----------------------------------------------------
    // 3. SEMUA 10 TOPIK - TAB KONSEP, LATIHAN, KUIS
    // ----------------------------------------------------
    console.log('\n--- 3. Menguji Tab Konsep, Latihan, dan Kuis ---');
    for (let i = 0; i < TOPICS.length; i++) {
      const topicId = TOPICS[i];
      const topicNum = String(i + 1).padStart(2, '0');
      const tabs = ['konsep', 'latihan', 'kuis'];

      for (const t of tabs) {
        // Uji pada 360 dan 1920 normal
        for (const w of [360, 1920]) {
          const vp = VIEWPORTS[w];
          await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
          await session.setModeKelas(false);
          await session.navigate(`/topik/${topicId}`);
          await session.waitForLoad(400);

          // Pindah tab
          await session.evaluate(`
            (() => {
              const btn = document.querySelector('#tab-${t}');
              if (btn) btn.click();
            })()
          `);
          await session.waitForLoad(600);

          const overflow = await session.evaluate(MEASUREMENT_SCRIPTS.checkOverflow);
          const fonts = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureFonts})('normal')`);
          const touch = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureTouchTargets})('normal')`);
          const contrast = await session.evaluate(MEASUREMENT_SCRIPTS.measureContrast);

          reportData.overflowResults.push({ page: `Topik-${topicNum}`, tab: t, width: w, mode: 'normal', ...overflow });
          reportData.fontResults.push({ page: `Topik-${topicNum}`, tab: t, width: w, mode: 'normal', ...fonts });
          reportData.touchResults.push({ page: `Topik-${topicNum}`, tab: t, width: w, mode: 'normal', ...touch });
          reportData.contrastResults.push({ page: `Topik-${topicNum}`, tab: t, width: w, mode: 'normal', ...contrast });

          await session.captureScreenshot(`${w}/normal/topik-${topicNum}-${t}.png`);
        }

        // Mode Kelas di 1920 untuk topik 1, 3, 7, 9
        if ([1, 3, 7, 9].includes(i + 1)) {
          const vp = VIEWPORTS[1920];
          await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
          await session.setModeKelas(true);
          await session.navigate(`/topik/${topicId}`);
          await session.waitForLoad(400);

          await session.evaluate(`
            (() => {
              const btn = document.querySelector('#tab-${t}');
              if (btn) btn.click();
            })()
          `);
          await session.waitForLoad(600);

          const fontsKelas = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureFonts})('kelas')`);
          const touchKelas = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureTouchTargets})('kelas')`);
          reportData.fontResults.push({ page: `Topik-${topicNum}`, tab: t, width: 1920, mode: 'kelas', ...fontsKelas });
          reportData.touchResults.push({ page: `Topik-${topicNum}`, tab: t, width: 1920, mode: 'kelas', ...touchKelas });

          await session.captureScreenshot(`1920/kelas/topik-${topicNum}-${t}.png`);
        }
      }
    }

    // ----------------------------------------------------
    // 4. KEADAAN KHUSUS & INTERAKSI MENDALAM
    // ----------------------------------------------------
    console.log('\n--- 4. Menguji Keadaan Khusus ---');

    // 4.1 Topik 1: "Tampilkan semua unsur" dan apotema nol saat diameter
    for (const w of [1920, 360]) {
      const vp = VIEWPORTS[w];
      await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
      await session.setModeKelas(false);
      await session.navigate('/topik/01-unsur');
      await session.waitForLoad(800);

      // Cari tombol / toggle "Tampilkan semua"
      const resTampilkanSemua = await session.evaluate(`
        (() => {
          // Cari tombol atau switch 'Semua' atau 'Tampilkan semua'
          const buttons = Array.from(document.querySelectorAll('button, input[type=checkbox]'));
          const btn = buttons.find(b => /semua/i.test(b.textContent || b.getAttribute('aria-label') || ''));
          if (btn) {
            btn.click();
            return { found: true, text: btn.textContent?.trim() };
          }
          return { found: false };
        })()
      `);
      await session.waitForLoad(500);
      await session.captureScreenshot(`${w}/normal/topik-01-eksplorasi-semua-unsur.png`);
      reportData.specialStatesResults.push({ state: 'Topik-01-Semua-Unsur', width: w, ...resTampilkanSemua });
    }

    // 4.2 Topik 2: Tiga mode Eksplorasi
    for (const w of [1920, 360]) {
      const vp = VIEWPORTS[w];
      await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
      await session.navigate('/topik/02-keliling');
      await session.waitForLoad(800);

      const modeButtons = await session.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll('.control-deck button, .mode-selector button, .segmented-control button, [role=tab]'));
          return btns.map((b, idx) => ({ idx, text: b.textContent?.trim() }));
        })()
      `);
      reportData.specialStatesResults.push({ state: 'Topik-02-ModeButtons', width: w, modeButtons });

      // Coba klik tombol mode yang tersedia
      for (let m = 0; m < 3; m++) {
        const clicked = await session.evaluate(`
          ((idx) => {
            const btns = Array.from(document.querySelectorAll('.control-deck button, .mode-selector button, .segmented-control button, [role=tab]'));
            if (btns[idx]) { btns[idx].click(); return btns[idx].textContent?.trim(); }
            return null;
          })(${m})
        `);
        if (clicked) {
          await session.waitForLoad(500);
          await session.captureScreenshot(`${w}/normal/topik-02-eksplorasi-mode-${m + 1}.png`);
        }
      }
    }

    // 4.3 Topik 3: Jumlah juring 4, 16, 64
    for (const w of [1920, 360]) {
      const vp = VIEWPORTS[w];
      await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
      await session.navigate('/topik/03-luas');
      await session.waitForLoad(800);

      for (const n of [4, 16, 64]) {
        const setN = await session.evaluate(`
          ((targetN) => {
            // Cek tombol n atau input slider
            const buttons = Array.from(document.querySelectorAll('button'));
            const b = buttons.find(el => el.textContent?.trim() === String(targetN));
            if (b) { b.click(); return { method: 'button', val: targetN }; }
            const slider = document.querySelector('input[type=range]');
            if (slider) {
              slider.value = targetN;
              slider.dispatchEvent(new Event('input', { bubbles: true }));
              slider.dispatchEvent(new Event('change', { bubbles: true }));
              return { method: 'slider', val: targetN };
            }
            return { method: 'not_found' };
          })(${n})
        `);
        await session.waitForLoad(500);
        await session.captureScreenshot(`${w}/normal/topik-03-eksplorasi-juring-${n}.png`);
        reportData.specialStatesResults.push({ state: `Topik-03-Juring-${n}`, width: w, ...setN });
      }
    }

    // 4.4 Topik 9: Tiga sub-mode
    for (const w of [1920, 360]) {
      const vp = VIEWPORTS[w];
      await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
      await session.navigate('/topik/09-garis-singgung');
      await session.waitForLoad(800);

      for (let sm = 0; sm < 3; sm++) {
        const subModeName = await session.evaluate(`
          ((idx) => {
            const btns = Array.from(document.querySelectorAll('.control-deck button, .mode-selector button, .segmented-control button, [role=tab]'));
            if (btns[idx]) { btns[idx].click(); return btns[idx].textContent?.trim(); }
            return null;
          })(${sm})
        `);
        if (subModeName) {
          await session.waitForLoad(500);
          await session.captureScreenshot(`${w}/normal/topik-09-eksplorasi-submode-${sm + 1}.png`);
        }
      }
    }

    // 4.5 Topik 10: Setiap kedudukan dua lingkaran
    for (const w of [1920, 360]) {
      const vp = VIEWPORTS[w];
      await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
      await session.navigate('/topik/10-kedudukan');
      await session.waitForLoad(800);

      const positions = await session.evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll('.control-deck button, .preset-buttons button, [role=tab]'));
          return btns.map((b, idx) => ({ idx, text: b.textContent?.trim() }));
        })()
      `);
      reportData.specialStatesResults.push({ state: 'Topik-10-Positions', width: w, positions });

      for (let p = 0; p < positions.length; p++) {
        await session.evaluate(`
          ((idx) => {
            const btns = Array.from(document.querySelectorAll('.control-deck button, .preset-buttons button, [role=tab]'));
            if (btns[idx]) btns[idx].click();
          })(${p})
        `);
        await session.waitForLoad(400);
        const posName = positions[p].text.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
        await session.captureScreenshot(`${w}/normal/topik-10-eksplorasi-${posName}.png`);
      }
    }

    // 4.6 Latihan: Alur interaksi
    console.log('Menguji alur Latihan...');
    for (const w of [1920, 360]) {
      const vp = VIEWPORTS[w];
      await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
      await session.navigate('/topik/01-unsur');
      await session.waitForLoad(500);
      await session.evaluate(`document.querySelector('#tab-latihan')?.click()`);
      await session.waitForLoad(600);

      // Keadaan sebelum dijawab
      await session.captureScreenshot(`${w}/normal/latihan-sebelum-jawab.png`);

      // Cek apakah soal pilihan ganda atau isian numerik
      const isInput = await session.evaluate(`Boolean(document.querySelector('input.practice-input, input[type=text], input[type=number]'))`);

      if (isInput) {
        // Coba input format salah (huruf)
        await session.evaluate(`
          (() => {
            const inp = document.querySelector('input.practice-input, input[type=text], input[type=number]');
            if (inp) {
              inp.value = 'abc';
              inp.dispatchEvent(new Event('input', { bubbles: true }));
              inp.dispatchEvent(new Event('change', { bubbles: true }));
            }
            const submitBtn = Array.from(document.querySelectorAll('button')).find(b => /periksa|jawab/i.test(b.textContent || ''));
            if (submitBtn) submitBtn.click();
          })()
        `);
        await session.waitForLoad(400);
        await session.captureScreenshot(`${w}/normal/latihan-format-salah.png`);
      }

      // Pilih jawaban salah (atau salah 1)
      await session.evaluate(`
        (() => {
          const opts = document.querySelectorAll('.option-btn, .choice-btn, input[type=radio]');
          if (opts.length > 1) {
            // pilih opsi kedua
            opts[1].click();
          } else {
            const inp = document.querySelector('input');
            if (inp) {
              inp.value = '9999';
              inp.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
          const submitBtn = Array.from(document.querySelectorAll('button')).find(b => /periksa|jawab/i.test(b.textContent || ''));
          if (submitBtn) submitBtn.click();
        })()
      `);
      await session.waitForLoad(500);
      await session.captureScreenshot(`${w}/normal/latihan-jawaban-salah-tahap1.png`);

      // Klik periksa lagi untuk tahap 2 pembahasan
      await session.evaluate(`
        (() => {
          const submitBtn = Array.from(document.querySelectorAll('button')).find(b => /periksa|jawab|pembahasan|coba lagi/i.test(b.textContent || ''));
          if (submitBtn) submitBtn.click();
        })()
      `);
      await session.waitForLoad(500);
      await session.captureScreenshot(`${w}/normal/latihan-jawaban-salah-tahap2.png`);
    }

    // 4.7 Kuis: Alur interaksi, skor rendah, skor 5/5 konfeti, Topik 10 tombol Kembali ke Beranda
    console.log('Menguji alur Kuis...');
    for (const w of [1920, 360]) {
      const vp = VIEWPORTS[w];
      await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
      await session.navigate('/topik/01-unsur');
      await session.waitForLoad(500);
      await session.evaluate(`document.querySelector('#tab-kuis')?.click()`);
      await session.waitForLoad(600);

      // Kuis sedang berjalan: jawab 2 soal
      for (let q = 0; q < 2; q++) {
        await session.evaluate(`
          (() => {
            const opts = document.querySelectorAll('.option-btn, .choice-btn, input[type=radio]');
            if (opts.length > 0) opts[0].click();
            const lanjutBtn = Array.from(document.querySelectorAll('button')).find(b => /lanjut|periksa|jawab/i.test(b.textContent || ''));
            if (lanjutBtn) lanjutBtn.click();
          })()
        `);
        await session.waitForLoad(300);
        await session.evaluate(`
          (() => {
            const nextBtn = Array.from(document.querySelectorAll('button')).find(b => /soal berikutnya|lanjut/i.test(b.textContent || ''));
            if (nextBtn) nextBtn.click();
          })()
        `);
        await session.waitForLoad(300);
      }

      // Tangkapan layar soal di tengah
      await session.captureScreenshot(`${w}/normal/kuis-soal-tengah.png`);

      // Dialog "Lanjutkan kuis": pindah tab ke Konsep lalu kembali ke Kuis
      await session.evaluate(`
        (() => {
          window.confirm = () => true; // izinkan keluar
          const tabKonsep = document.querySelector('#tab-konsep');
          if (tabKonsep) tabKonsep.click();
        })()
      `);
      await session.waitForLoad(400);
      await session.evaluate(`document.querySelector('#tab-kuis')?.click()`);
      await session.waitForLoad(500);
      await session.captureScreenshot(`${w}/normal/kuis-dialog-lanjutkan.png`);

      // Mulai kuis baru dan selesaikan dengan skor 5/5 untuk memicu konfeti
      await session.evaluate(`
        (() => {
          // Klik Mulai dari awal atau Lanjutkan
          const btnMulai = Array.from(document.querySelectorAll('button')).find(b => /mulai|lanjut/i.test(b.textContent || ''));
          if (btnMulai) btnMulai.click();
        })()
      `);
      await session.waitForLoad(500);

      // Selesaikan kuis sampai layar hasil
      for (let q = 0; q < 5; q++) {
        await session.evaluate(`
          (() => {
            const opts = document.querySelectorAll('.option-btn, .choice-btn, input[type=radio]');
            if (opts.length > 0) opts[0].click();
            const btn = Array.from(document.querySelectorAll('button')).find(b => /periksa|jawab|lanjut/i.test(b.textContent || ''));
            if (btn) btn.click();
          })()
        `);
        await session.waitForLoad(300);
        if (q < 4) {
          await session.evaluate(`
            (() => {
              const nextBtn = Array.from(document.querySelectorAll('button')).find(b => /soal berikutnya|lanjut/i.test(b.textContent || ''));
              if (nextBtn) nextBtn.click();
            })()
          `);
          await session.waitForLoad(300);
        }
      }

      await session.waitForLoad(600);
      await session.captureScreenshot(`${w}/normal/kuis-layar-hasil.png`);

      // Cek konfeti
      const hasConfetti = await session.evaluate(`Boolean(document.querySelector('.svg-confetti-container'))`);
      reportData.specialStatesResults.push({ state: 'Kuis-Hasil-Confetti', width: w, hasConfetti });
    }

    // Kuis Topik 10: tombol kembali ke beranda di hasil kuis topik terakhir
    {
      const vp = VIEWPORTS[1920];
      await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
      await session.navigate('/topik/10-kedudukan');
      await session.waitForLoad(500);
      await session.evaluate(`document.querySelector('#tab-kuis')?.click()`);
      await session.waitForLoad(500);

      // Selesaikan kuis cepat
      for (let q = 0; q < 5; q++) {
        await session.evaluate(`
          (() => {
            const opts = document.querySelectorAll('.option-btn, .choice-btn, input[type=radio]');
            if (opts.length > 0) opts[0].click();
            const btn = Array.from(document.querySelectorAll('button')).find(b => /periksa|jawab|lanjut/i.test(b.textContent || ''));
            if (btn) btn.click();
          })()
        `);
        await session.waitForLoad(200);
        if (q < 4) {
          await session.evaluate(`
            (() => {
              const nextBtn = Array.from(document.querySelectorAll('button')).find(b => /soal berikutnya|lanjut/i.test(b.textContent || ''));
              if (nextBtn) nextBtn.click();
            })()
          `);
          await session.waitForLoad(200);
        }
      }
      await session.waitForLoad(500);
      await session.captureScreenshot('1920/normal/topik-10-kuis-hasil-terakhir.png');
      const actionBtnText = await session.evaluate(`
        (() => {
          const btn = document.querySelector('.quiz-result-card .button.primary, .quiz-result-card a.button.primary');
          return btn ? btn.textContent?.trim() : null;
        })()
      `);
      reportData.specialStatesResults.push({ state: 'Topik-10-Kuis-Aksi-Terakhir', actionBtnText });
    }

    // ----------------------------------------------------
    // 5. AKURASI SERET TITIK DENGAN POINTER EVENT NYATA
    // ----------------------------------------------------
    console.log('\n--- 5. Menguji Akurasi Seret Titik ---');
    // Topik 1, 4, 7, 9, 10 di 360, 1920 normal, dan 1920 kelas
    const dragTestTopics = ['01-unsur', '04-sudut', '07-dalam-segitiga', '09-garis-singgung', '10-kedudukan'];
    const dragConfigs = [
      { width: 360, mode: 'normal' },
      { width: 1920, mode: 'normal' },
      { width: 1920, mode: 'kelas' }
    ];

    for (const cfg of dragConfigs) {
      const vp = VIEWPORTS[cfg.width];
      await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
      await session.setModeKelas(cfg.mode === 'kelas');

      for (const tId of dragTestTopics) {
        await session.navigate(`/topik/${tId}`);
        await session.waitForLoad(800);

        const dragResult = await session.evaluate(`
          (() => {
            const hitArea = document.querySelector('.drag-hit-area');
            if (!hitArea) return { error: 'No drag-hit-area found' };

            const rectBefore = hitArea.getBoundingClientRect();
            const startX = rectBefore.left + rectBefore.width / 2;
            const startY = rectBefore.top + rectBefore.height / 2;

            // Gerakkan pointer sebesar 30px ke kanan dan 20px ke bawah
            const targetX = startX + 30;
            const targetY = startY + 20;

            const pDown = new PointerEvent('pointerdown', {
              bubbles: true,
              cancelable: true,
              clientX: startX,
              clientY: startY,
              pointerId: 1,
              isPrimary: true
            });
            hitArea.dispatchEvent(pDown);

            const pMove = new PointerEvent('pointermove', {
              bubbles: true,
              cancelable: true,
              clientX: targetX,
              clientY: targetY,
              pointerId: 1,
              isPrimary: true
            });
            hitArea.dispatchEvent(pMove);

            const pUp = new PointerEvent('pointerup', {
              bubbles: true,
              cancelable: true,
              clientX: targetX,
              clientY: targetY,
              pointerId: 1,
              isPrimary: true
            });
            hitArea.dispatchEvent(pUp);

            const rectAfter = hitArea.getBoundingClientRect();
            const finalX = rectAfter.left + rectAfter.width / 2;
            const finalY = rectAfter.top + rectAfter.height / 2;

            return {
              startX,
              startY,
              targetX,
              targetY,
              finalX,
              finalY,
              dxTarget: targetX - startX,
              dyTarget: targetY - startY,
              dxActual: finalX - startX,
              dyActual: finalY - startY
            };
          })()
        `);

        // Tunggu satu frame render
        await session.waitForLoad(200);

        const finalCheck = await session.evaluate(`
          (() => {
            const hitArea = document.querySelector('.drag-hit-area');
            if (!hitArea) return null;
            const r = hitArea.getBoundingClientRect();
            return {
              centerX: r.left + r.width / 2,
              centerY: r.top + r.height / 2
            };
          })()
        `);

        reportData.dragAccuracyResults.push({
          topicId: tId,
          width: cfg.width,
          mode: cfg.mode,
          dragResult,
          finalCheck
        });
      }
    }

    // ----------------------------------------------------
    // 6. REDUCED MOTION & HALO DENYUT
    // ----------------------------------------------------
    console.log('\n--- 6. Menguji prefers-reduced-motion ---');
    await session.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await session.navigate('/topik/01-unsur');
    await session.waitForLoad(800);

    const reducedMotionHalo = await session.evaluate(`
      (() => {
        const halo = document.querySelector('.draggable-halo');
        if (!halo) return { exists: false };
        const cs = window.getComputedStyle(halo);
        return {
          exists: true,
          display: cs.display,
          animation: cs.animation,
          visibility: cs.visibility
        };
      })()
    `);
    reportData.specialStatesResults.push({ state: 'Reduced-Motion-Halo', ...reducedMotionHalo });
    // Reset emulated media
    await session.send('Emulation.setEmulatedMedia', { features: [] });

    // ----------------------------------------------------
    // 7. OFFLINE PWA & CACHE CHECK
    // ----------------------------------------------------
    console.log('\n--- 7. Menguji PWA & Mode Offline ---');
    await session.navigate('');
    await session.waitForLoad(1500);

    const swStatus = await session.evaluate(`
      (async () => {
        if (!('serviceWorker' in navigator)) return { supported: false };
        const reg = await navigator.serviceWorker.getRegistration();
        return {
          supported: true,
          registered: Boolean(reg),
          active: Boolean(reg?.active),
          badgeSiap: Boolean(document.querySelector('.badge-offline'))
        };
      })()
    `);
    reportData.offlineResult.serviceWorker = swStatus;

    // Emulasi Offline Network
    console.log('Mengaktifkan emulasi offline jaringan...');
    await session.send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0
    });

    try {
      // Reload halaman saat offline
      await session.navigate('/topik/01-unsur');
      await session.waitForLoad(1000);

      const offlineContentCheck = await session.evaluate(`
        (() => {
          const title = document.querySelector('.topic-title-unified')?.textContent?.trim();
          const hasSvg = Boolean(document.querySelector('svg.canvas-svg'));
          // Cek font Plus Jakarta Sans dan KaTeX
          const fontsLoaded = document.fonts.check('16px "Plus Jakarta Sans"');
          return {
            title,
            hasSvg,
            fontsLoaded,
            url: window.location.href
          };
        })()
      `);
      reportData.offlineResult.offlineReload = offlineContentCheck;
      await session.captureScreenshot('1920/normal/offline-topik-01.png');
    } catch (e) {
      reportData.offlineResult.offlineReloadError = e.message;
    } finally {
      // Matikan emulasi offline
      await session.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1
      });
    }

    // ----------------------------------------------------
    // 8. CPU THROTTLING 4X & PERFORMANCE TEST
    // ----------------------------------------------------
    console.log('\n--- 8. Menguji CPU Throttling 4x ---');
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    for (const tId of ['03-luas', '04-sudut', '07-dalam-segitiga', '10-kedudukan']) {
      await session.navigate(`/topik/${tId}`);
      await session.waitForLoad(600);

      // Jika di topik 3, set juring ke 64
      if (tId === '03-luas') {
        await session.evaluate(`
          (() => {
            const btn64 = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim() === '64');
            if (btn64) btn64.click();
          })()
        `);
        await session.waitForLoad(400);
      }

      // Ukur frame time saat pointer move berulang
      const perfData = await session.evaluate(`
        (() => {
          const hitArea = document.querySelector('.drag-hit-area');
          if (!hitArea) return { error: 'No drag-hit-area' };

          const rect = hitArea.getBoundingClientRect();
          let curX = rect.left + rect.width / 2;
          let curY = rect.top + rect.height / 2;

          hitArea.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true, clientX: curX, clientY: curY, pointerId: 1
          }));

          const times = [];
          for (let i = 0; i < 20; i++) {
            const t0 = performance.now();
            curX += (i % 2 === 0 ? 5 : -5);
            hitArea.dispatchEvent(new PointerEvent('pointermove', {
              bubbles: true, clientX: curX, clientY: curY, pointerId: 1
            }));
            const t1 = performance.now();
            times.push(t1 - t0);
          }

          hitArea.dispatchEvent(new PointerEvent('pointerup', {
            bubbles: true, clientX: curX, clientY: curY, pointerId: 1
          }));

          const sum = times.reduce((a, b) => a + b, 0);
          const avg = sum / times.length;
          const max = Math.max(...times);

          return {
            avgMsPerDispatch: parseFloat(avg.toFixed(2)),
            maxMsPerDispatch: parseFloat(max.toFixed(2)),
            samples: times.length
          };
        })()
      `);
      reportData.perfThrottleResults.push({ topicId: tId, ...perfData });
    }

    // Reset CPU throttling
    await session.send('Emulation.setCPUThrottlingRate', { rate: 1 });

    // ----------------------------------------------------
    // 9. LOG KONSOL & PERMINTAAN JARINGAN EXTERNAL
    // ----------------------------------------------------
    console.log('\n--- 9. Memeriksa Konsol & Jaringan Eksternal ---');
    reportData.consoleErrors = session.consoleLogs.filter(
      (l) => l.type === 'error' || l.type === 'warn'
    );
    reportData.networkExternalRequests = session.networkRequests.filter((r) => {
      try {
        const u = new URL(r.url);
        return u.hostname !== 'localhost' && u.hostname !== '127.0.0.1';
      } catch {
        return false;
      }
    });

  } catch (err) {
    console.error('Fatal error during QA suite:', err);
    reportData.fatalError = err.message;
  } finally {
    await session.close();
  }

  // Simpan data pengukuran ke file
  const jsonPath = path.join(OUTPUT_DIR, 'measurements.json');
  await fs.writeFile(jsonPath, JSON.stringify(reportData, null, 2), 'utf-8');
  console.log(`\n=== QA Suite Selesai! Data pengukuran disimpan di: ${jsonPath} ===`);
}

run().catch(console.error);
