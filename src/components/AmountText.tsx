import "./AmountText.css";

export interface AmountTextProps {
  value: number;
  size?: "sm" | "md" | "lg" | "xl";
  /** Show as a signed delta with arrow (▲/▼) and signal color. */
  delta?: boolean;
  /** Render in accessible gold (prices, rewards). */
  gold?: boolean;
  /** Currency symbol prefix. `ⓜ` is the fallback until the icon-font glyph ships (§2.1). */
  symbol?: string;
}

/* Every number that is Mints is Spline Sans Mono, tabular, always (§2.2). */
export function AmountText({ value, size = "md", delta = false, gold = false, symbol }: AmountTextProps) {
  const dir = delta ? (value >= 0 ? "up" : "dn") : null;
  const cls = [
    "mm-amount",
    `mm-amount-${size}`,
    dir ? `mm-amount-${dir}` : "",
    gold ? "mm-amount-gold" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const magnitude = Math.abs(value).toLocaleString("en-US");
  return (
    <span className={cls}>
      {dir === "up" && "▲ +"}
      {dir === "dn" && "▼ −"}
      {symbol && <span aria-hidden="true">{symbol}</span>}
      {magnitude}
    </span>
  );
}
