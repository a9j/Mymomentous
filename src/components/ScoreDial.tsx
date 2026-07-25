import { AmountText } from "./AmountText";
import "./ScoreDial.css";

export interface ScoreDialProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  size?: number;
}

/* §4.3: the credit score is a half-arc dial; the needle sweeps on change. */
export function ScoreDial({ value, min = 300, max = 850, label = "Credit score", size = 200 }: ScoreDialProps) {
  const frac = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const w = size;
  const h = size * 0.58;
  const cx = w / 2;
  const cy = h - 8;
  const r = w / 2 - 14;
  const arcLength = Math.PI * r;
  const angle = -90 + frac * 180;

  return (
    <div className="mm-dial" role="meter" aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} aria-label={label}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <path
          className="mm-dial-track"
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          className="mm-dial-arc"
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength * (1 - frac)}
        />
        <g className="mm-dial-needle" style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - r + 16} strokeWidth="3" strokeLinecap="round" stroke="currentColor" />
        </g>
        <circle className="mm-dial-hub" cx={cx} cy={cy} r="5" />
      </svg>
      <div className="mm-dial-value">
        <AmountText value={value} size="lg" />
      </div>
      <div className="mm-dial-label">{label}</div>
    </div>
  );
}
