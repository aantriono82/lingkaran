import { memo, type CSSProperties, type ReactNode } from 'react';

export interface ValueItem {
  label: ReactNode;
  value: ReactNode;
  warna?: string;
}

export const ValuePanel = memo(function ValuePanel({ items, judul = 'Nilai saat ini' }: { items: ValueItem[]; judul?: string }) {
  return (
    <section className="values-deck value-panel" aria-label={judul}>
      <div className="deck-head">
        <h3 className="deck-title">{judul}</h3>
      </div>
      <div className="value-cards-grid">
        {items.map((item, indeks) => {
          // Bila tepat 3 item atau 1 item, item pertama dapat ditonjolkan
          const isFeatured = (items.length === 3 && indeks === 0) || items.length === 1;
          return (
            <div
              className={`stat-box ${isFeatured ? 'featured' : ''}`}
              key={indeks}
              style={item.warna ? ({ '--stat-accent': item.warna, borderTopColor: item.warna } as CSSProperties) : undefined}
            >
              <span className="stat-label">{item.label}</span>
              <strong className="stat-value">{item.value}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
});
