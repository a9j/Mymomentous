import type { ReactNode } from "react";
import { useTokenNumber } from "../era";
import "./GrowthRing.css";

export interface AvatarRingsProps {
  /** Whole years in the economy — one concentric ring each (§2.4). */
  years: number;
  size?: number;
  /** Avatar content: image, emoji, or initial. */
  children?: ReactNode;
}

/* Tenure rings: a 6-year veteran has 6 rings. A quiet badge of honor. */
export function AvatarRings({ years, size = 96, children }: AvatarRingsProps) {
  const weight = useTokenNumber("--ring-weight", 5);
  const gap = useTokenNumber("--ring-gap", 3);

  const radii: number[] = [];
  let r = size / 2 - weight / 2;
  for (let i = 0; i < years && r > weight; i++) {
    radii.push(r);
    r -= weight + gap;
  }
  const centerSize = Math.max(0, 2 * (r + weight / 2 - gap));

  return (
    <div
      className="mm-ring"
      style={{ width: size, height: size }}
      aria-label={`${years} year${years === 1 ? "" : "s"} in the economy`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {radii.map((radius, i) => (
          <circle
            key={radius}
            className="mm-ring-fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={weight}
            opacity={1 - i * 0.12}
          />
        ))}
      </svg>
      <div className="mm-ring-center" style={{ width: centerSize, height: centerSize }}>
        {children}
      </div>
    </div>
  );
}
