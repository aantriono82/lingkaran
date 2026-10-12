import { ChromeSession, VIEWPORTS } from './qa-session.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = path.resolve('/home/aantriono/Dev/lingkaran/docs/qa-visual');

async function testCdpDrag() {
  console.log('=== Mengukur Akurasi Seret Titik dengan CDP Native Pointer Events ===');
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
      await session.evaluate(`document.querySelector('#tab-eksplorasi')?.click()`);
      await session.waitForLoad(400);
      await session.evaluate(`window.scrollTo(0, 0);`);

      // Dapatkan posisi awal titik
      const pos1 = await session.evaluate(`
        (() => {
          const hitArea = document.querySelector('.drag-hit-area');
          if (!hitArea) return null;
          const r = hitArea.getBoundingClientRect();
          return {
            x: Math.round(r.left + r.width / 2),
            y: Math.round(r.top + r.height / 2)
          };
        })()
      `);

      if (!pos1) {
        dragReport.push({ topicId: tId, ...cfg, error: 'no hit area' });
        continue;
      }

      const startX = pos1.x;
      const startY = pos1.y;
      const targetX = startX + 30;
      const targetY = startY + 20;

      // Kirim native browser mouse events via CDP
      await session.send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: startX,
        y: startY,
        button: 'left',
        clickCount: 1
      });

      // Gerakkan 5 langkah
      for (let step = 1; step <= 5; step++) {
        const curX = Math.round(startX + (targetX - startX) * (step / 5));
        const curY = Math.round(startY + (targetY - startY) * (step / 5));
        await session.send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: curX,
          y: curY
        });
        await new Promise((r) => setTimeout(r, 40));
      }

      await session.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: targetX,
        y: targetY,
        button: 'left'
      });

      // Tunggu render
      await session.waitForLoad(200);

      const pos2 = await session.evaluate(`
        (() => {
          const hitArea = document.querySelector('.drag-hit-area');
          if (!hitArea) return null;
          const r = hitArea.getBoundingClientRect();
          return {
            x: parseFloat((r.left + r.width / 2).toFixed(2)),
            y: parseFloat((r.top + r.height / 2).toFixed(2))
          };
        })()
      `);

      const dx = pos2 ? pos2.x - startX : 0;
      const dy = pos2 ? pos2.y - startY : 0;
      const deltaFromTarget = pos2 ? Math.hypot(pos2.x - targetX, pos2.y - targetY) : 999;

      console.log(`Topik ${tId} (${cfg.w}px, ${cfg.mode}): start=(${startX},${startY}) target=(${targetX},${targetY}) final=(${pos2?.x},${pos2?.y}) dx=${dx.toFixed(1)} dy=${dy.toFixed(1)} delta=${deltaFromTarget.toFixed(2)}px`);

      dragReport.push({
        topicId: tId,
        width: cfg.w,
        mode: cfg.mode,
        start: { x: startX, y: startY },
        target: { x: targetX, y: targetY },
        final: pos2,
        dx,
        dy,
        deltaFromTarget: parseFloat(deltaFromTarget.toFixed(2))
      });
    }
  }

  await session.close();

  const outPath = path.join(OUTPUT_DIR, 'measurements-drag-cdp.json');
  await fs.writeFile(outPath, JSON.stringify(dragReport, null, 2), 'utf-8');
  console.log('Selesai! Data disimpan di:', outPath);
}

testCdpDrag().catch(console.error);
