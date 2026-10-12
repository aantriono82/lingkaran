import { memo, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export const Formula = memo(function Formula({ rumus, label, keterangan }: { rumus: string; label?: string; keterangan?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    katex.render(rumus, ref.current, {
      throwOnError: import.meta.env.PROD ? false : true,
      displayMode: false
    });
  }, [rumus]);

  return (
    <div className="formula-box formula-callout" aria-label={label ?? `Rumus ${rumus}`}>
      <div className="formula-scroll-wrap">
        <span ref={ref} className="formula-tex" />
      </div>
      {keterangan && <div className="formula-explanation">{keterangan}</div>}
    </div>
  );
});
