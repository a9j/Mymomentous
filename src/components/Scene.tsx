/* A flat paper-craft landscape in the reference art direction: muted
 * earth pastels, layered hills, pines, and — because this is
 * MyMomentous — a mint sprig growing in the foreground. Illustration
 * exists in Sprout and Sapling only (§5); illustration colors are
 * scene-local by design, not semantic tokens. */
export function Scene({ height = 240 }: { height?: number }) {
  return (
    <svg
      viewBox="0 0 390 240"
      width="100%"
      height={height}
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="A mint sprout growing in a mountain valley"
    >
      {/* paper sky */}
      <rect width="390" height="240" fill="#F9EFDC" />
      {/* sun */}
      <circle cx="312" cy="54" r="26" fill="#F2C879" />
      {/* drifting seeds */}
      <circle cx="76" cy="40" r="4" fill="#DC8A66" opacity="0.7" />
      <circle cx="128" cy="66" r="3" fill="#C9A24B" opacity="0.6" />
      <circle cx="248" cy="34" r="3.5" fill="#A9BC98" opacity="0.8" />
      {/* far mountains */}
      <path d="M0 150 L70 70 L140 150 Z" fill="#D8B08C" />
      <path d="M96 150 L180 52 L268 150 Z" fill="#C89B74" />
      <path d="M228 150 L306 76 L390 150 L390 160 L228 160 Z" fill="#B98A62" />
      {/* snow caps */}
      <path d="M164 70 L180 52 L197 71 L188 78 L180 71 L172 78 Z" fill="#F9EFDC" />
      {/* pine cluster */}
      <g fill="#4F6B51">
        <path d="M22 132 L36 98 L50 132 Z" />
        <path d="M320 168 L338 122 L356 168 Z" />
        <path d="M322 148 L338 108 L354 148 Z" />
      </g>
      <rect x="33" y="130" width="5" height="10" fill="#6B4F3A" />
      <rect x="335" y="166" width="6" height="12" fill="#6B4F3A" />
      {/* rolling meadow */}
      <path d="M0 176 Q 98 140 195 172 T 390 168 L390 240 L0 240 Z" fill="#A9BC98" />
      <path d="M0 206 Q 130 176 240 204 T 390 198 L390 240 L0 240 Z" fill="#8FA97F" />
      {/* winding path */}
      <path d="M210 240 Q 230 214 216 196 Q 204 182 226 172" stroke="#E8D9B8" strokeWidth="10" fill="none" strokeLinecap="round" />
      {/* the mint sprig, growing in the clear */}
      <g strokeLinecap="round" transform="translate(146 0)">
        <path d="M126 226 V 186" stroke="#2E6B4F" strokeWidth="6" fill="none" />
        <path d="M126 210 C 106 208 96 194 98 180 C 114 182 124 194 126 204 Z" fill="#46C48A" />
        <path d="M126 210 C 146 208 156 194 154 180 C 138 182 128 194 126 204 Z" fill="#39A873" />
        <path d="M126 192 C 112 190 105 180 107 170 C 118 172 124 180 126 187 Z" fill="#5ED49B" />
        <path d="M126 192 C 140 190 147 180 145 170 C 134 172 128 180 126 187 Z" fill="#46C48A" />
      </g>
    </svg>
  );
}
