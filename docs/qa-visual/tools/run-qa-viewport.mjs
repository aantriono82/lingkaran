import { ChromeSession, VIEWPORTS, TOPICS, OUTPUT_DIR } from './qa-session.mjs';
import { MEASUREMENT_SCRIPTS } from './qa-measurements.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const LOG_FILE = path.join(OUTPUT_DIR, 'progress.log');

async function logProgress(msg) {
  const line = `[${new Date().toLocaleTimeString('id-ID')}] ${msg}\n`;
  process.stdout.write(line);
  try {
    await fs.appendFile(LOG_FILE, line, 'utf-8');
  } catch {}
}

const args = process.argv.slice(2);
const vpArg = args.find((a) => a.startsWith('--viewport='));
const targetVpKey = vpArg ? vpArg.split('=')[1] : '360';

async function runViewport(vpKey) {
  await logProgress(`=== Memulai Pengujian Viewport: ${vpKey} ===`);
  const session = new ChromeSession();
  await session.launch();

  const results = {
    viewport: vpKey,
    timestamp: new Date().toISOString(),
    overflow: [],
    fonts: [],
    touch: [],
    contrast: [],
    sticky: [],
    special: []
  };

  try {
    if (vpKey === 'special') {
      await runSpecialStates(session, results);
    } else {
      const width = parseInt(vpKey, 10);
      const vp = VIEWPORTS[width];
      const isLandscape = width === 800;
      const folder = isLandscape ? '800' : `${width}`;
      await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);

      // --- A. BERANDA ---
      for (const mode of ['normal', 'kelas']) {
        await logProgress(`[${vpKey}] Beranda (${mode})`);
        await session.clearStorage();
        await session.setModeKelas(mode === 'kelas');
        await session.navigate('');
        await session.waitForLoad(700);

        const ov = await session.evaluate(MEASUREMENT_SCRIPTS.checkOverflow);
        const fo = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureFonts})('${mode}')`);
        const to = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureTouchTargets})('${mode}')`);
        const co = await session.evaluate(MEASUREMENT_SCRIPTS.measureContrast);

        results.overflow.push({ page: 'Beranda', mode, ...ov });
        results.fonts.push({ page: 'Beranda', mode, ...fo });
        results.touch.push({ page: 'Beranda', mode, ...to });
        results.contrast.push({ page: 'Beranda', mode, ...co });

        await session.captureScreenshot(`${folder}/${mode}/beranda-baru.png`);

        // Beranda dengan kemajuan
        await session.setScores({ '01-unsur': 5, '02-keliling': 4, '03-luas': 5 });
        await session.evaluate(`
          try {
            localStorage.setItem('simulasi-lingkaran-topik-terakhir', JSON.stringify({
              versi: 1, topikId: '03-luas', waktu: Date.now()
            }));
          } catch(e) {}
        `);
        await session.navigate('');
        await session.waitForLoad(600);
        await session.captureScreenshot(`${folder}/${mode}/beranda-kemajuan.png`);

        if (width === 1920 || width === 360) {
          const dialogClicked = await session.evaluate(`
            (() => {
              const btn = document.querySelector('.button-reset-progress');
              if (btn) { btn.click(); return true; }
              return false;
            })()
          `);
          if (dialogClicked) {
            await session.waitForLoad(300);
            await session.captureScreenshot(`${folder}/${mode}/dialog-hapus-skor.png`);
            await session.evaluate(`
              (() => {
                const dangerBtn = document.querySelector('.progress-reset-dialog .button.danger');
                if (dangerBtn) dangerBtn.click();
              })()
            `);
            await session.waitForLoad(300);
          }
        }
      }

      // --- B. EKSPLORASI (SEMUA TOPIK ATAU FILTER SESUAI MATRIKS) ---
      let topicIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      if (width === 3840) topicIndices = [0, 3, 6, 9]; // Topik 1, 4, 7, 10
      if (width === 800) topicIndices = [0, 2, 6];     // Topik 1, 3, 7

      for (const idx of topicIndices) {
        const topicId = TOPICS[idx];
        const num = String(idx + 1).padStart(2, '0');
        await logProgress(`[${vpKey}] Topik ${num} (${topicId}) Eksplorasi`);

        await session.setModeKelas(false);
        await session.navigate(`/topik/${topicId}`);
        await session.waitForLoad(600);

        const ov = await session.evaluate(MEASUREMENT_SCRIPTS.checkOverflow);
        const fo = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureFonts})('normal')`);
        const to = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureTouchTargets})('normal')`);
        const co = await session.evaluate(MEASUREMENT_SCRIPTS.measureContrast);

        results.overflow.push({ page: `Topik-${num}`, tab: 'eksplorasi', mode: 'normal', ...ov });
        results.fonts.push({ page: `Topik-${num}`, tab: 'eksplorasi', mode: 'normal', ...fo });
        results.touch.push({ page: `Topik-${num}`, tab: 'eksplorasi', mode: 'normal', ...to });
        results.contrast.push({ page: `Topik-${num}`, tab: 'eksplorasi', mode: 'normal', ...co });

        // Sticky check di 360 & 800
        if (width === 360) {
          await session.evaluate(`window.scrollTo(0, 300);`);
          await session.waitForLoad(200);
          const st = await session.evaluate(`
            (() => {
              const card = document.querySelector('#panel-eksplorasi .canvas-card');
              const svg = document.querySelector('#panel-eksplorasi .canvas-svg');
              if (!card || !svg) return null;
              const rCard = card.getBoundingClientRect();
              const rSvg = svg.getBoundingClientRect();
              const cs = window.getComputedStyle(card);
              return {
                cardTop: rCard.top,
                isSticky: cs.position === 'sticky',
                cardHeight: rCard.height,
                svgHeight: rSvg.height,
                vh: window.innerHeight,
                ratio: rSvg.height / window.innerHeight
              };
            })()
          `);
          results.sticky.push({ num, ...st });
          await session.evaluate(`window.scrollTo(0, 0);`);
        } else if (width === 800) {
          const st = await session.evaluate(`
            (() => {
              const card = document.querySelector('#panel-eksplorasi .canvas-card');
              if (!card) return null;
              return { isSticky: window.getComputedStyle(card).position === 'sticky' };
            })()
          `);
          results.sticky.push({ num, ...st });
        }

        await session.captureScreenshot(`${folder}/normal/topik-${num}-eksplorasi.png`);

        // Mode kelas di 1920
        if (width === 1920) {
          await session.setModeKelas(true);
          await session.waitForLoad(300);
          const foK = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureFonts})('kelas')`);
          const toK = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureTouchTargets})('kelas')`);
          results.fonts.push({ page: `Topik-${num}`, tab: 'eksplorasi', mode: 'kelas', ...foK });
          results.touch.push({ page: `Topik-${num}`, tab: 'eksplorasi', mode: 'kelas', ...toK });
          await session.captureScreenshot(`1920/kelas/topik-${num}-eksplorasi.png`);
        }
      }

      // --- C. KONSEP, LATIHAN, KUIS (360 DAN 1920) ---
      if (width === 360 || width === 1920) {
        for (let idx = 0; idx < TOPICS.length; idx++) {
          const topicId = TOPICS[idx];
          const num = String(idx + 1).padStart(2, '0');

          for (const tab of ['konsep', 'latihan', 'kuis']) {
            await logProgress(`[${vpKey}] Topik ${num} Tab ${tab} (normal)`);
            await session.setModeKelas(false);
            await session.navigate(`/topik/${topicId}`);
            await session.waitForLoad(400);

            await session.evaluate(`document.querySelector('#tab-${tab}')?.click()`);
            await session.waitForLoad(500);

            const ov = await session.evaluate(MEASUREMENT_SCRIPTS.checkOverflow);
            const fo = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureFonts})('normal')`);
            const to = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureTouchTargets})('normal')`);
            const co = await session.evaluate(MEASUREMENT_SCRIPTS.measureContrast);

            results.overflow.push({ page: `Topik-${num}`, tab, mode: 'normal', ...ov });
            results.fonts.push({ page: `Topik-${num}`, tab, mode: 'normal', ...fo });
            results.touch.push({ page: `Topik-${num}`, tab, mode: 'normal', ...to });
            results.contrast.push({ page: `Topik-${num}`, tab, mode: 'normal', ...co });

            await session.captureScreenshot(`${width}/normal/topik-${num}-${tab}.png`);

            // Mode kelas untuk topik 1, 3, 7, 9 di 1920
            if (width === 1920 && [0, 2, 6, 8].includes(idx)) {
              await logProgress(`[${vpKey}] Topik ${num} Tab ${tab} (kelas)`);
              await session.setModeKelas(true);
              await session.waitForLoad(300);
              const foK = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureFonts})('kelas')`);
              const toK = await session.evaluate(`(${MEASUREMENT_SCRIPTS.measureTouchTargets})('kelas')`);
              results.fonts.push({ page: `Topik-${num}`, tab, mode: 'kelas', ...foK });
              results.touch.push({ page: `Topik-${num}`, tab, mode: 'kelas', ...toK });
              await session.captureScreenshot(`1920/kelas/topik-${num}-${tab}.png`);
            }
          }
        }
      }
    }
  } catch (err) {
    await logProgress(`[ERROR] Viewport ${vpKey} error: ${err.message}`);
    results.error = err.message;
  } finally {
    await session.close();
  }

  // Simpan hasil json per viewport
  const outJson = path.join(OUTPUT_DIR, `measurements-${vpKey}.json`);
  await fs.writeFile(outJson, JSON.stringify(results, null, 2), 'utf-8');
  await logProgress(`Selesai menyimpan pengukuran: measurements-${vpKey}.json`);
}

async function runSpecialStates(session, results) {
  await logProgress('--- Menguji Keadaan Khusus & Interaksi Mendalam ---');

  for (const w of [1920, 360]) {
    const vp = VIEWPORTS[w];
    await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);

    // 1. Topik 1 Semua Unsur
    await session.navigate('/topik/01-unsur');
    await session.waitForLoad(600);
    await session.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button, input[type=checkbox]'));
        const b = btns.find(el => /semua/i.test(el.textContent || el.getAttribute('aria-label') || ''));
        if (b) b.click();
      })()
    `);
    await session.waitForLoad(400);
    await session.captureScreenshot(`${w}/normal/topik-01-eksplorasi-semua-unsur.png`, false);

    // 2. Topik 2 Tiga Mode
    await session.navigate('/topik/02-keliling');
    await session.waitForLoad(600);
    for (let m = 0; m < 3; m++) {
      await session.evaluate(`
        ((idx) => {
          const btns = Array.from(document.querySelectorAll('.control-deck button, .mode-selector button, .segmented-control button, [role=tab]'));
          if (btns[idx]) btns[idx].click();
        })(${m})
      `);
      await session.waitForLoad(400);
      await session.captureScreenshot(`${w}/normal/topik-02-eksplorasi-mode-${m + 1}.png`, false);
    }

    // 3. Topik 3 Juring n=4, 16, 64
    await session.navigate('/topik/03-luas');
    await session.waitForLoad(600);
    for (const n of [4, 16, 64]) {
      await session.evaluate(`
        ((targetN) => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const b = buttons.find(el => el.textContent?.trim() === String(targetN));
          if (b) { b.click(); return; }
          const slider = document.querySelector('input[type=range]');
          if (slider) {
            slider.value = targetN;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
            slider.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })(${n})
      `);
      await session.waitForLoad(400);
      await session.captureScreenshot(`${w}/normal/topik-03-eksplorasi-juring-${n}.png`, false);
    }

    // 4. Topik 9 Tiga Sub-Mode
    await session.navigate('/topik/09-garis-singgung');
    await session.waitForLoad(600);
    for (let sm = 0; sm < 3; sm++) {
      await session.evaluate(`
        ((idx) => {
          const btns = Array.from(document.querySelectorAll('.control-deck button, .mode-selector button, .segmented-control button, [role=tab]'));
          if (btns[idx]) btns[idx].click();
        })(${sm})
      `);
      await session.waitForLoad(400);
      await session.captureScreenshot(`${w}/normal/topik-09-eksplorasi-submode-${sm + 1}.png`, false);
    }

    // 5. Topik 10 Enam Posisi
    await session.navigate('/topik/10-kedudukan');
    await session.waitForLoad(600);
    const posList = await session.evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('.control-deck button, .preset-buttons button, [role=tab]'));
        return btns.map((b, idx) => ({ idx, text: b.textContent?.trim() }));
      })()
    `);
    for (let p = 0; p < (posList?.length || 0); p++) {
      await session.evaluate(`
        ((idx) => {
          const btns = Array.from(document.querySelectorAll('.control-deck button, .preset-buttons button, [role=tab]'));
          if (btns[idx]) btns[idx].click();
        })(${p})
      `);
      await session.waitForLoad(300);
      const posName = posList[p].text.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
      await session.captureScreenshot(`${w}/normal/topik-10-eksplorasi-${posName}.png`, false);
    }

    // 6. Latihan State Flow
    await session.navigate('/topik/01-unsur');
    await session.waitForLoad(500);
    await session.evaluate(`document.querySelector('#tab-latihan')?.click()`);
    await session.waitForLoad(500);
    await session.captureScreenshot(`${w}/normal/latihan-sebelum-jawab.png`, false);

    // Format salah
    const isInput = await session.evaluate(`Boolean(document.querySelector('input.practice-input, input[type=text], input[type=number]'))`);
    if (isInput) {
      await session.evaluate(`
        (() => {
          const inp = document.querySelector('input');
          if (inp) {
            inp.value = 'abc';
            inp.dispatchEvent(new Event('input', { bubbles: true }));
          }
          const b = Array.from(document.querySelectorAll('button')).find(el => /periksa|jawab/i.test(el.textContent || ''));
          if (b) b.click();
        })()
      `);
      await session.waitForLoad(300);
      await session.captureScreenshot(`${w}/normal/latihan-format-salah.png`, false);
    }

    // Jawaban salah tahap 1 & 2
    await session.evaluate(`
      (() => {
        const opts = document.querySelectorAll('.option-btn, .choice-btn, input[type=radio]');
        if (opts.length > 1) opts[1].click();
        const b = Array.from(document.querySelectorAll('button')).find(el => /periksa|jawab/i.test(el.textContent || ''));
        if (b) b.click();
      })()
    `);
    await session.waitForLoad(400);
    await session.captureScreenshot(`${w}/normal/latihan-jawaban-salah-tahap1.png`, false);

    await session.evaluate(`
      (() => {
        const b = Array.from(document.querySelectorAll('button')).find(el => /periksa|jawab|pembahasan|coba lagi/i.test(el.textContent || ''));
        if (b) b.click();
      })()
    `);
    await session.waitForLoad(400);
    await session.captureScreenshot(`${w}/normal/latihan-jawaban-salah-tahap2.png`, false);

    // 7. Kuis State Flow
    await session.evaluate(`document.querySelector('#tab-kuis')?.click()`);
    await session.waitForLoad(500);
    // Soal di tengah
    for (let q = 0; q < 2; q++) {
      await session.evaluate(`
        (() => {
          const opts = document.querySelectorAll('.option-btn, .choice-btn, input[type=radio]');
          if (opts.length > 0) opts[0].click();
          const btn = Array.from(document.querySelectorAll('button')).find(b => /periksa|jawab|lanjut/i.test(b.textContent || ''));
          if (btn) btn.click();
        })()
      `);
      await session.waitForLoad(200);
      await session.evaluate(`
        (() => {
          const nextBtn = Array.from(document.querySelectorAll('button')).find(b => /soal berikutnya|lanjut/i.test(b.textContent || ''));
          if (nextBtn) nextBtn.click();
        })()
      `);
      await session.waitForLoad(200);
    }
    await session.captureScreenshot(`${w}/normal/kuis-soal-tengah.png`, false);

    // Resume kuis dialog / card
    await session.evaluate(`document.querySelector('#tab-konsep')?.click()`);
    await session.waitForLoad(300);
    await session.evaluate(`document.querySelector('#tab-kuis')?.click()`);
    await session.waitForLoad(400);
    await session.captureScreenshot(`${w}/normal/kuis-dialog-lanjutkan.png`, false);

    // Selesaikan kuis 5/5
    await session.evaluate(`
      (() => {
        const btnMulai = Array.from(document.querySelectorAll('button')).find(b => /mulai|lanjut/i.test(b.textContent || ''));
        if (btnMulai) btnMulai.click();
      })()
    `);
    await session.waitForLoad(300);
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
    await session.captureScreenshot(`${w}/normal/kuis-layar-hasil.png`, false);
  }

  // Akurasi Seret Titik
  await logProgress('Mengukur Akurasi Seret Titik di 5 Topik...');
  const dragResults = [];
  for (const cfg of [{ w: 360, mode: 'normal' }, { w: 1920, mode: 'normal' }, { w: 1920, mode: 'kelas' }]) {
    const vp = VIEWPORTS[cfg.w];
    await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
    await session.setModeKelas(cfg.mode === 'kelas');

    for (const tId of ['01-unsur', '04-sudut', '07-dalam-segitiga', '09-garis-singgung', '10-kedudukan']) {
      await session.navigate(`/topik/${tId}`);
      await session.waitForLoad(500);

      const dRes = await session.evaluate(`
        (() => {
          const hitArea = document.querySelector('.drag-hit-area');
          if (!hitArea) return { error: 'none' };
          const r = hitArea.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          // Gerakkan pointer
          hitArea.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: cx, clientY: cy, pointerId: 1 }));
          hitArea.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: cx + 25, clientY: cy + 15, pointerId: 1 }));
          hitArea.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: cx + 25, clientY: cy + 15, pointerId: 1 }));

          const r2 = hitArea.getBoundingClientRect();
          const cx2 = r2.left + r2.width / 2;
          const cy2 = r2.top + r2.height / 2;
          return {
            start: { x: cx, y: cy },
            target: { x: cx + 25, y: cy + 15 },
            actual: { x: cx2, y: cy2 },
            deltaX: (cx2 - (cx + 25)),
            deltaY: (cy2 - (cy + 15)),
            dist: Math.hypot(cx2 - (cx + 25), cy2 - (cy + 15))
          };
        })()
      `);
      dragResults.push({ topicId: tId, ...cfg, ...dRes });
    }
  }
  results.dragAccuracy = dragResults;

  // Emulasi Reduced Motion
  await session.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
  });
  await session.navigate('/topik/01-unsur');
  await session.waitForLoad(500);
  const haloCheck = await session.evaluate(`
    (() => {
      const halo = document.querySelector('.draggable-halo');
      if (!halo) return { exists: false };
      const cs = window.getComputedStyle(halo);
      return { exists: true, display: cs.display, animation: cs.animation };
    })()
  `);
  results.reducedMotion = haloCheck;
  await session.send('Emulation.setEmulatedMedia', { features: [] });

  // CPU Throttling 4x
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const cpuResults = [];
  for (const tId of ['03-luas', '04-sudut', '07-dalam-segitiga', '10-kedudukan']) {
    await session.navigate(`/topik/${tId}`);
    await session.waitForLoad(500);
    if (tId === '03-luas') {
      await session.evaluate(`document.querySelector('button')?.click()`);
    }
    const perf = await session.evaluate(`
      (() => {
        const hitArea = document.querySelector('.drag-hit-area');
        if (!hitArea) return { error: 'none' };
        const r = hitArea.getBoundingClientRect();
        let cx = r.left + r.width / 2;
        let cy = r.top + r.height / 2;
        hitArea.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: cx, clientY: cy, pointerId: 1 }));
        const diffs = [];
        for (let i = 0; i < 15; i++) {
          const t0 = performance.now();
          cx += (i % 2 === 0 ? 4 : -4);
          hitArea.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: cx, clientY: cy, pointerId: 1 }));
          diffs.push(performance.now() - t0);
        }
        hitArea.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: cx, clientY: cy, pointerId: 1 }));
        return {
          avgMs: parseFloat((diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(2)),
          maxMs: parseFloat(Math.max(...diffs).toFixed(2))
        };
      })()
    `);
    cpuResults.push({ topicId: tId, ...perf });
  }
  results.cpuThrottling = cpuResults;
  await session.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  // PWA Offline Emulation
  await logProgress('Menguji PWA Offline...');
  await session.navigate('');
  await session.waitForLoad(1000);
  const sw = await session.evaluate(`
    (async () => {
      const reg = await navigator.serviceWorker?.getRegistration();
      return {
        active: Boolean(reg?.active),
        badgeSiap: Boolean(document.querySelector('.badge-offline'))
      };
    })()
  `);
  results.serviceWorker = sw;

  await session.send('Network.emulateNetworkConditions', {
    offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0
  });
  try {
    await session.navigate('/topik/01-unsur');
    await session.waitForLoad(800);
    const offlineCheck = await session.evaluate(`
      (() => {
        return {
          title: document.querySelector('.topic-title-unified')?.textContent?.trim(),
          hasSvg: Boolean(document.querySelector('svg.canvas-svg')),
          fontsOk: document.fonts.check('16px "Plus Jakarta Sans"')
        };
      })()
    `);
    results.offlineReload = offlineCheck;
    await session.captureScreenshot('1920/normal/offline-topik-01.png', false);
  } finally {
    await session.send('Network.emulateNetworkConditions', {
      offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1
    });
  }
}

runViewport(targetVpKey).catch((e) => {
  console.error('Fatal:', e);
});
