import { ChromeSession, VIEWPORTS } from './qa-session.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = path.resolve('/home/aantriono/Dev/lingkaran/docs/qa-visual');

async function testDrag() {
  console.log('=== Mengukur Akurasi Seret Titik Secara Presisi ===');
  const session = new ChromeSession();
  await session.launch();

  const configs = [
    { w: 360, mode: 'normal' },
    { w: 1920, mode: 'normal' },
    { w: 1920, mode: 'kelas' }
  ];

  const topics = ['01-unsur', '04-sudut', '07-dalam-segitiga', '09-garis-singgung', '10-kedudukan'];
  const dragReport = [];

  for (const cfg of configs) {
    const vp = VIEWPORTS[cfg.w];
    await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
    await session.setModeKelas(cfg.mode === 'kelas');

    for (const tId of topics) {
      await session.navigate(`/topik/${tId}`);
      await session.waitForLoad(500);
      // Pastikan aktif di tab Eksplorasi
      await session.evaluate(`document.querySelector('#tab-eksplorasi')?.click()`);
      await session.waitForLoad(500);

      // Scroll ke atas kanvas
      await session.evaluate(`window.scrollTo(0, 0);`);

      const res = await session.evaluate(`
        (() => {
          const hitArea = document.querySelector('.drag-hit-area');
          if (!hitArea) return { error: 'Elemen .drag-hit-area tidak ditemukan' };

          const r1 = hitArea.getBoundingClientRect();
          const startX = r1.left + r1.width / 2;
          const startY = r1.top + r1.height / 2;

          // Pointer movement
          // Gerakkan pointer ke kanan 25px dan ke bawah 15px
          const targetX = startX + 25;
          const targetY = startY + 15;

          hitArea.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true, cancelable: true, clientX: startX, clientY: startY, pointerId: 1, isPrimary: true
          }));

          hitArea.dispatchEvent(new PointerEvent('pointermove', {
            bubbles: true, cancelable: true, clientX: targetX, clientY: targetY, pointerId: 1, isPrimary: true
          }));

          hitArea.dispatchEvent(new PointerEvent('pointerup', {
            bubbles: true, cancelable: true, clientX: targetX, clientY: targetY, pointerId: 1, isPrimary: true
          }));

          const r2 = hitArea.getBoundingClientRect();
          const finalX = r2.left + r2.width / 2;
          const finalY = r2.top + r2.height / 2;

          return {
            startX: parseFloat(startX.toFixed(2)),
            startY: parseFloat(startY.toFixed(2)),
            targetX: parseFloat(targetX.toFixed(2)),
            targetY: parseFloat(targetY.toFixed(2)),
            finalX: parseFloat(finalX.toFixed(2)),
            finalY: parseFloat(finalY.toFixed(2)),
            dx: parseFloat((finalX - startX).toFixed(2)),
            dy: parseFloat((finalY - startY).toFixed(2)),
            deltaFromTarget: parseFloat(Math.hypot(finalX - targetX, finalY - targetY).toFixed(2))
          };
        })()
      `);

      console.log(`Topik ${tId} (${cfg.w}px, ${cfg.mode}):`, res);
      dragReport.push({
        topicId: tId,
        width: cfg.w,
        mode: cfg.mode,
        ...res
      });
    }
  }

  await session.close();

  const outPath = path.join(OUTPUT_DIR, 'measurements-drag-accuracy.json');
  await fs.writeFile(outPath, JSON.stringify(dragReport, null, 2), 'utf-8');
  console.log('Hasil akurasi disimpan di:', outPath);
}

testDrag().catch(console.error);
