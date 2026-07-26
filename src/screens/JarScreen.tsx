import { useState } from "react";
import { Button } from "../components";
import "./JarScreen.css";

/* SPROUT (§4.1): the screen is a toy. One object (the jar), two actions,
 * zero navigation. Copy is five words or fewer per line. */

function Jar({ coins, dropping }: { coins: number; dropping: boolean }) {
  const rows: { x: number; y: number }[] = [];
  const shown = Math.min(coins, 18);
  for (let i = 0; i < shown; i++) {
    const row = Math.floor(i / 5);
    const inRow = i % 5;
    rows.push({ x: 74 + inRow * 36 + (row % 2 ? 16 : 0), y: 268 - row * 26 });
  }
  return (
    <svg width="280" height="320" viewBox="0 0 280 320" role="img" aria-label={`Jar with ${coins} Mints`}>
      {/* soil + sprout on the lid */}
      <g className="mm-jar-sprout">
        <path d="M140 62 V 36" stroke="#4A7C59" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M140 44 C 120 42 110 28 112 14 C 128 16 138 28 140 38 Z" fill="#6FD08C" />
        <path d="M140 44 C 160 42 170 28 168 14 C 152 16 142 28 140 38 Z" fill="#57BA78" />
      </g>
      <rect x="94" y="56" width="92" height="18" rx="9" fill="#8A6A48" />
      <rect x="86" y="70" width="108" height="16" rx="8" fill="#A5825C" />
      {/* glass */}
      <path
        d="M92 86 C 74 104 62 132 62 168 L 62 268 C 62 292 82 306 106 306 L 174 306 C 198 306 218 292 218 268 L 218 168 C 218 132 206 104 188 86 Z"
        fill="#FFFFFF" fillOpacity="0.55" stroke="#8A6A48" strokeWidth="6"
      />
      {/* coins inside */}
      {rows.map((c, i) => (
        <g key={i} className={dropping && i === shown - 1 ? "mm-jar-dropcoin" : undefined}>
          <circle cx={c.x} cy={c.y} r="15" fill="#F2B33C" stroke="#DC9E2C" strokeWidth="3" />
          <path d={`M${c.x} ${c.y + 7} V ${c.y - 2} M${c.x} ${c.y - 1} C ${c.x - 5} ${c.y - 2} ${c.x - 7} ${c.y - 6} ${c.x - 6} ${c.y - 9} M${c.x} ${c.y - 1} C ${c.x + 5} ${c.y - 2} ${c.x + 7} ${c.y - 6} ${c.x + 6} ${c.y - 9}`}
                stroke="#B07A16" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </g>
      ))}
      {/* glass shine */}
      <path d="M84 116 C 78 136 76 152 76 168 L 76 240" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" opacity="0.6" fill="none" />
    </svg>
  );
}

export function JarScreen() {
  const [coins, setCoins] = useState(7);
  const [burst, setBurst] = useState(0);

  const add = () => {
    setCoins((c) => c + 1);
    setBurst((b) => b + 1);
  };

  return (
    <div className="mm-jar">
      <div>
        <div className="money mm-jar-count">{coins}</div>
        <div className="mm-jar-word">Mints in your jar</div>
      </div>
      <div className="mm-jar-stage">
        <Jar coins={coins} dropping={burst > 0} />
        {burst > 0 && (
          <div key={burst} className="mm-jar-float money" aria-hidden="true">
            +1
          </div>
        )}
      </div>
      <div className="mm-jar-actions">
        <Button onClick={add}>Add a Mint</Button>
        <Button variant="secondary">Spend</Button>
      </div>
    </div>
  );
}
