import { useEffect, useId, useState, type MouseEventHandler, type ReactNode } from 'react';

interface CanvasProps {
  children: ReactNode;
  label: string;
  viewBox?: string;
  grid?: boolean;
  className?: string;
  description?: string;
  onPointerDown?: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMove?: (event: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp?: (event: React.PointerEvent<SVGSVGElement>) => void;
  onClick?: MouseEventHandler<SVGSVGElement>;
}

export function Canvas({ children, label, viewBox = '0 0 700 430', grid = false, className = '', description = label, ...events }: CanvasProps) {
  const id = useId().replace(/:/g, '');
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const gridId = `${id}-grid`;
  const [ringkasan, setRingkasan] = useState(description);

  useEffect(() => {
    const timer = window.setTimeout(() => setRingkasan(description), 500);
    return () => window.clearTimeout(timer);
  }, [description]);

  return (
    <>
      <svg
        className={`canvas-svg ${className}`}
        viewBox={viewBox}
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
        preserveAspectRatio="xMidYMid meet"
        {...events}
      >
        <title id={titleId}>{label}</title>
        <desc id={descriptionId}>{description}</desc>
      {grid && (
        <>
          <defs>
            <pattern id={gridId} width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="var(--warna-garis)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${gridId})`} />
        </>
      )}
      {children}
      </svg>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{ringkasan}</div>
    </>
  );
}
