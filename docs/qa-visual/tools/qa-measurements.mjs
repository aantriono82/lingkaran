export const MEASUREMENT_SCRIPTS = {
  checkOverflow: `
    (() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const windowWidth = window.innerWidth;
      const hasOverflow = scrollWidth > windowWidth + 1;
      
      const offending = [];
      if (hasOverflow) {
        const all = document.querySelectorAll('*');
        for (const el of all) {
          const r = el.getBoundingClientRect();
          if (r.right > windowWidth + 2 && r.width > 0 && r.height > 0) {
            offending.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || null,
              className: (typeof el.className === 'string' ? el.className : el.className?.baseVal || ''),
              right: Math.round(r.right),
              width: Math.round(r.width),
              windowWidth
            });
          }
        }
      }
      return {
        hasOverflow,
        scrollWidth,
        windowWidth,
        offendingElements: offending.slice(0, 10)
      };
    })()
  `,

  measureFonts: `
    ((mode) => {
      const results = [];
      const all = document.querySelectorAll('*');
      for (const el of all) {
        // Only inspect elements with direct text
        let hasDirectText = false;
        let textContent = '';
        for (const node of el.childNodes) {
          if (node.nodeType === 3 && node.textContent.trim().length > 0) {
            hasDirectText = true;
            textContent += node.textContent.trim() + ' ';
          }
        }
        if (!hasDirectText) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        const size = parseFloat(style.fontSize);
        if (mode !== 'kelas' && size < 14) {
          results.push({
            tag: el.tagName.toLowerCase(),
            className: typeof el.className === 'string' ? el.className : el.className?.baseVal || '',
            text: textContent.slice(0, 40).trim(),
            fontSize: size,
            lineHeight: style.lineHeight
          });
        }
      }

      // In Mode Kelas, check highlight numbers
      const highlights = [];
      if (mode === 'kelas') {
        const sel = '.stat-value, .progress-number, .canvas-badge, .card-topic-number, .topic-title-unified';
        const targets = document.querySelectorAll(sel);
        for (const el of targets) {
          const style = window.getComputedStyle(el);
          highlights.push({
            selector: el.className,
            text: el.textContent?.trim().slice(0, 20),
            fontSize: parseFloat(style.fontSize)
          });
        }
      }

      return {
        smallFonts: results.slice(0, 25),
        totalSmall: results.length,
        highlights
      };
    })
  `,

  measureTouchTargets: `
    ((mode) => {
      const threshold = mode === 'kelas' ? 54 : 44;
      const selectors = 'button, [role="button"], [role="tab"], [role="switch"], input, a, .drag-hit-area, .step-btn-pill, .back-btn-pill, .btn-pill';
      const elements = document.querySelectorAll(selectors);
      const failures = [];
      let total = 0;

      for (const el of elements) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        total++;

        // Draggable point radius hit area check
        let shortestSide = Math.min(r.width, r.height);
        if (el.tagName.toLowerCase() === 'circle') {
          const radius = parseFloat(el.getAttribute('r') || '0');
          if (radius > 0) shortestSide = radius * 2;
        }

        if (shortestSide < threshold) {
          failures.push({
            tag: el.tagName.toLowerCase(),
            text: el.textContent?.trim().slice(0, 25) || el.getAttribute('aria-label')?.slice(0, 25) || '',
            className: typeof el.className === 'string' ? el.className : el.className?.baseVal || '',
            width: Math.round(r.width),
            height: Math.round(r.height),
            shortestSide: Math.round(shortestSide),
            threshold
          });
        }
      }

      return {
        totalInteractive: total,
        failureCount: failures.length,
        failures: failures.slice(0, 25)
      };
    })
  `,

  measureContrast: `
    (() => {
      function parseColor(str) {
        if (!str || str === 'transparent' || str === 'rgba(0, 0, 0, 0)') return null;
        const m = str.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
        if (m) {
          return {
            r: parseInt(m[1], 10),
            g: parseInt(m[2], 10),
            b: parseInt(m[3], 10),
            a: m[4] !== undefined ? parseFloat(m[4]) : 1
          };
        }
        return null;
      }

      function getEffectiveBg(el) {
        let cur = el;
        while (cur && cur !== document.documentElement) {
          const style = window.getComputedStyle(cur);
          const bg = parseColor(style.backgroundColor);
          if (bg && bg.a > 0.1) return bg;
          cur = cur.parentElement;
        }
        return { r: 240, g: 245, b: 250, a: 1 }; // default --bg-base #f0f5fa
      }

      function luminance(r, g, b) {
        const a = [r, g, b].map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      }

      function contrastRatio(fg, bg) {
        const l1 = luminance(fg.r, fg.g, fg.b);
        const l2 = luminance(bg.r, bg.g, bg.b);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }

      const textElements = document.querySelectorAll('h1, h2, h3, p, span, button, a, label, .eyebrow, .card-title, .stat-label, .badge-offline');
      const failures = [];

      for (const el of textElements) {
        let text = '';
        for (const node of el.childNodes) {
          if (node.nodeType === 3) text += node.textContent.trim();
        }
        if (!text) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;

        const fg = parseColor(style.color);
        if (!fg) continue;
        const bg = getEffectiveBg(el);
        const ratio = contrastRatio(fg, bg);
        const fontSize = parseFloat(style.fontSize);
        const isBold = parseInt(style.fontWeight, 10) >= 700 || style.fontWeight === 'bold';
        const isLarge = fontSize >= 24 || (fontSize >= 18.66 && isBold);
        const minRatio = isLarge ? 3.0 : 4.5;

        if (ratio < minRatio) {
          failures.push({
            tag: el.tagName.toLowerCase(),
            className: typeof el.className === 'string' ? el.className : el.className?.baseVal || '',
            text: text.slice(0, 30),
            ratio: parseFloat(ratio.toFixed(2)),
            required: minRatio,
            fontSize,
            fg: style.color,
            bg: 'rgb(' + bg.r + ',' + bg.g + ',' + bg.b + ')'
          });
        }
      }

      return {
        contrastFailures: failures.slice(0, 25),
        totalFailures: failures.length
      };
    })()
  `,

  detectSvgTextOverlaps: `
    (() => {
      const texts = Array.from(document.querySelectorAll('svg text'));
      const rects = texts.map(t => ({
        text: t.textContent?.trim(),
        rect: t.getBoundingClientRect()
      })).filter(item => item.rect.width > 0 && item.rect.height > 0);

      const overlaps = [];
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const a = rects[i].rect;
          const b = rects[j].rect;
          const intersect = !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
          if (intersect) {
            overlaps.push({
              textA: rects[i].text,
              textB: rects[j].text
            });
          }
        }
      }
      return overlaps;
    })()
  `
};
