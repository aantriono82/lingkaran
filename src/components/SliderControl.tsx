import { memo } from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  minimum: number;
  maksimum: number;
  langkah?: number;
  satuan?: string;
  onChange: (value: number) => void;
}

export const SliderControl = memo(function SliderControl({
  label,
  value,
  minimum,
  maksimum,
  langkah = 1,
  satuan = '',
  onChange
}: SliderControlProps) {
  return (
    <label className="control-field slider-deck">
      <span className="control-label">
        <span className="slider-label-text">{label}</span>
        <strong className="slider-value-badge">{value}{satuan}</strong>
      </span>
      <div className="slider-input-wrap">
        <input
          type="range"
          min={minimum}
          max={maksimum}
          step={langkah}
          value={value}
          onChange={(event) => onChange(event.target.valueAsNumber)}
          aria-label={`${label}: ${value}${satuan}`}
        />
      </div>
    </label>
  );
});
