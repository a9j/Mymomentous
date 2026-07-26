import type { ReactNode } from "react";
import { useTokenNumber } from "../era";
import "./GrowthRing.css";

export interface GrowthRingProps {
  /** 0..1 fill, clockwise from 12 o'clock. */
  progress: number;
  size?: number;
  /** Center content — a goal photo, an amount, an icon. */
  children?: ReactNode;
}

/* §2.4: progress is never a bar. Ring weight comes from --ring-weight
 * (8px Sprout, 5px elsewhere); the 3px ring gap is a brand constant. */
export function GrowthRing({ progress, size = 96, children }: GrowthRingProps) {
  const weight = useTokenNumber("--ring-weight", 5);
  const gap = useTokenNumber("--ring-gap", 3);
  const clamped = Math.min(1, Math.max(0, progress));

  const r = size / 2 - weight / 2;
  const circumference = 2 * Math.PI * r;
  const centerSize = 2 * (r - weight / 2 - gap);

  return (
    <div
      className="mm-ring"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="mm-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={weight}
        />
        <circle
          className="mm-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={weight}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
        />
      </svg>
      <div className="mm-ring-center" style={{ width: centerSize, height: centerSize }}>
        {children}
      </div>
    </div>
  );
}
