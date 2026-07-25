export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  /** Trend coloring; derived from first/last when omitted. */
  trend?: "up" | "dn";
}

/* §4.3: data becomes decoration. Losses must look like losses. */
export function Sparkline({ data, width = 300, height = 48, trend }: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 4;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = pad + (1 - (v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ");
  const dir = trend ?? (data[data.length - 1] >= data[0] ? "up" : "dn");
  const color = dir === "up" ? "var(--signal-up)" : "var(--signal-dn)";

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`M ${line} L ${width} ${height} L 0 ${height} Z`} fill={color} opacity="0.12" />
      <path d={`M ${line}`} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
