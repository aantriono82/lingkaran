import { ChromeSession, VIEWPORTS } from './qa-session.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = path.resolve('/home/aantriono/Dev/lingkaran/docs/qa-visual');

async function testTouchDrag() {
  console.log('=== Mengukur Akurasi Seret Titik di Layar HP 360px dengan Touch Event ===');
  const session = new ChromeSession();
  await session.launch();

  const vp = VIEWPORTS[360];
  await session.setViewport(vp.width, vp.height, vp.isMobile, vp.dpr);
  await session.setModeKelas(false);

  const topics = ['01-unsur', '04-sudut', '07-dalam-segitiga', '09-garis-singgung', '10-kedudukan'];
  const results = [];

  for (const tId of topics) {
    await session.navigate(`/topik/${tId}`);
    await session.waitForLoad(500);
    await session.evaluate(`document.querySelector('#tab-eksplorasi')?.click()`);
    await session.waitForLoad(400);
    await session.evaluate(`window.scrollTo(0, 0);`);

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

    if (!pos1) continue;

    const startX = pos1.x;
    const startY = pos1.y;
    const targetX = startX + 25;
    const targetY = startY + 15;

    // Kirim touch events via CDP
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: startX, y: startY, id: 0 }]
    });

    for (let step = 1; step <= 5; step++) {
      const curX = Math.round(startX + (targetX - startX) * (step / 5));
      const curY = Math.round(startY + (targetY - startY) * (step / 5));
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: curX, y: curY, id: 0 }]
      });
      await new Promise((r) => setTimeout(r, 40));
    }

    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });

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

    console.log(`Topik ${tId} (360px Touch): start=(${startX},${startY}) target=(${targetX},${targetY}) final=(${pos2?.x},${pos2?.y}) dx=${dx.toFixed(1)} dy=${dy.toFixed(1)} delta=${deltaFromTarget.toFixed(2)}px`);

    results.push({
      topicId: tId,
      start: { x: startX, y: startY },
      target: { x: targetX, y: targetY },
      final: pos2,
      dx,
      dy,
      deltaFromTarget: parseFloat(deltaFromTarget.toFixed(2))
    });
  }

  await session.close();
  const outPath = path.join(OUTPUT_DIR, 'measurements-drag-touch-360.json');
  await fs.writeFile(outPath, JSON.stringify(results, null, 2), 'utf-8');
}

testTouchDrag().catch(console.error);
