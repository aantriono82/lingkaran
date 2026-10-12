import fs from 'node:fs/promises';
import path from 'node:path';

const DIR = path.resolve('/home/aantriono/Dev/lingkaran/docs/qa-visual');

async function main() {
  const files = [
    'measurements-360.json',
    'measurements-768.json',
    'measurements-800.json',
    'measurements-1280.json',
    'measurements-1920.json',
    'measurements-3840.json',
    'measurements-special.json'
  ];

  const allData = {};
  for (const f of files) {
    try {
      const content = await fs.readFile(path.join(DIR, f), 'utf-8');
      allData[f] = JSON.parse(content);
    } catch (e) {
      console.error('Failed to read', f, e.message);
    }
  }

  console.log('=== 1. ANALISIS OVERFLOW HORIZONTAL ===');
  const overflows = [];
  for (const [file, d] of Object.entries(allData)) {
    if (d.overflow) {
      for (const item of d.overflow) {
        if (item.hasOverflow) {
          overflows.push({ file, page: item.page, tab: item.tab, mode: item.mode, width: item.windowWidth, scrollWidth: item.scrollWidth, offending: item.offendingElements });
        }
      }
    }
  }
  console.log('Total overflow kejadian:', overflows.length);
  if (overflows.length > 0) {
    console.log(JSON.stringify(overflows, null, 2));
  } else {
    console.log('Nihil (0 overflow di semua viewport dan tab)!');
  }

  console.log('\n=== 2. ANALISIS TARGET SENTUH TERLALU KECIL ===');
  const touchFailures = new Map();
  for (const [file, d] of Object.entries(allData)) {
    if (d.touch) {
      for (const item of d.touch) {
        if (item.failures && item.failures.length > 0) {
          for (const f of item.failures) {
            const key = `${f.tag}.${f.className || 'none'} ("${f.text || ''}") [${item.mode}]`;
            if (!touchFailures.has(key)) {
              touchFailures.set(key, { ...f, count: 1, mode: item.mode, samplePage: `${item.page || ''} ${item.tab || ''}` });
            } else {
              touchFailures.get(key).count++;
            }
          }
        }
      }
    }
  }
  console.log('Total jenis target sentuh < threshold:', touchFailures.size);
  for (const [k, v] of Array.from(touchFailures.entries()).slice(0, 15)) {
    console.log(`- ${k}: size ${v.width}x${v.height}px (shortest: ${v.shortestSide}px, min: ${v.threshold}px, ${v.count}x pada ${v.samplePage})`);
  }

  console.log('\n=== 3. ANALISIS FONT < 14px ===');
  const fontFailures = new Map();
  for (const [file, d] of Object.entries(allData)) {
    if (d.fonts) {
      for (const item of d.fonts) {
        if (item.smallFonts && item.smallFonts.length > 0) {
          for (const f of item.smallFonts) {
            const key = `${f.tag}.${f.className || 'none'} ("${f.text}")`;
            if (!fontFailures.has(key)) {
              fontFailures.set(key, { ...f, count: 1, samplePage: `${item.page || ''} ${item.tab || ''}` });
            } else {
              fontFailures.get(key).count++;
            }
          }
        }
      }
    }
  }
  console.log('Total jenis font < 14px:', fontFailures.size);
  for (const [k, v] of Array.from(fontFailures.entries()).slice(0, 15)) {
    console.log(`- ${k}: ${v.fontSize}px (${v.count}x pada ${v.samplePage})`);
  }

  console.log('\n=== 4. ANALISIS KONTRAS WCAG ===');
  const contrastFailures = new Map();
  for (const [file, d] of Object.entries(allData)) {
    if (d.contrast) {
      for (const item of d.contrast) {
        if (item.contrastFailures && item.contrastFailures.length > 0) {
          for (const f of item.contrastFailures) {
            const key = `${f.tag}.${f.className || 'none'} ("${f.text}")`;
            if (!contrastFailures.has(key)) {
              contrastFailures.set(key, { ...f, count: 1, samplePage: `${item.page || ''} ${item.tab || ''}` });
            } else {
              contrastFailures.get(key).count++;
            }
          }
        }
      }
    }
  }
  console.log('Total jenis kegagalan kontras:', contrastFailures.size);
  for (const [k, v] of Array.from(contrastFailures.entries()).slice(0, 15)) {
    console.log(`- ${k}: ratio ${v.ratio}:1 (required: ${v.required}:1, fg: ${v.fg}, bg: ${v.bg})`);
  }

  console.log('\n=== 5. AKURASI SERET TITIK & SPECIAL STATES ===');
  const spec = allData['measurements-special.json'];
  if (spec) {
    console.log('Drag accuracy samples:');
    if (spec.dragAccuracy) {
      for (const d of spec.dragAccuracy) {
        console.log(`- Topik ${d.topicId} (${d.w}px, ${d.mode}): target dist=29.15px, actual dist=${d.dist ? d.dist.toFixed(2) : 'err'}px, deltaX=${d.deltaX?.toFixed(2)}, deltaY=${d.deltaY?.toFixed(2)}`);
      }
    }
    console.log('Reduced motion check:', spec.reducedMotion);
    console.log('CPU throttling 4x:', spec.cpuThrottling);
    console.log('ServiceWorker & Offline reload:', spec.serviceWorker, spec.offlineReload);
  }

  console.log('\n=== 6. KANVAS STICKY HASIL UKUR ===');
  const m360 = allData['measurements-360.json'];
  if (m360 && m360.sticky) {
    for (const s of m360.sticky) {
      console.log(`- Topik ${s.num}: sticky=${s.isSticky}, svgHeight=${s.svgHeight}px (ratio ${(s.ratio * 100).toFixed(1)}% dari vh)`);
    }
  }
}

main().catch(console.error);
