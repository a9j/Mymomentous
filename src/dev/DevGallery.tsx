import { useState } from "react";
import { ERAS, ERA_LABELS, useEra } from "../era";
import {
  AmountText,
  AvatarRings,
  Button,
  Card,
  GrowthRing,
  LeafCoin,
  NavBar,
  QuestCard,
  ScoreDial,
  Sheet,
  Sparkline,
  StoreItem,
} from "../components";
import "./DevGallery.css";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: <Dot /> },
  { id: "jobs", label: "Jobs", icon: <Dot /> },
  { id: "store", label: "Store", icon: <Dot /> },
  { id: "bank", label: "Bank", icon: <Dot /> },
];

function Dot() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="10" cy="10" r="7" />
    </svg>
  );
}

const FUND = [104, 108, 103, 112, 109, 118, 111, 114, 106, 108, 101, 97];

/* The dev era-switcher: every component, all five skins, eyeballed in
 * seconds. This screen is Phase 2's definition of done. */
export function DevGallery() {
  const { era, setEra } = useEra();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [nav, setNav] = useState("home");

  return (
    <div className="mm-gallery">
      <header>
        <h1>Component gallery</h1>
        <p className="mm-gallery-sub">
          Hidden dev screen. Era switch = one <code>data-era</code> attribute on the root.
        </p>
      </header>

      <div className="mm-gallery-switcher" role="group" aria-label="Era">
        {ERAS.map((e) => (
          <button key={e} aria-pressed={e === era} onClick={() => setEra(e)}>
            {ERA_LABELS[e]}
          </button>
        ))}
      </div>

      <Card>
        <h2>Button</h2>
        <div className="mm-gallery-row">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      <Card>
        <h2>AmountText + LeafCoin</h2>
        <div className="mm-gallery-row">
          <LeafCoin size={64} />
          <AmountText value={128} size="xl" />
          <AmountText value={5} delta />
          <AmountText value={-8} delta />
          <AmountText value={75} gold symbol="ⓜ" />
        </div>
        <p className="mm-gallery-sub" style={{ marginTop: 8 }}>
          Leaf maturity, all five: {ERAS.map((e) => <LeafCoin key={e} era={e} size={36} />)}
        </p>
      </Card>

      <Card>
        <h2>GrowthRing + AvatarRings</h2>
        <div className="mm-gallery-row">
          <GrowthRing progress={0.65} size={104}>
            <AmountText value={65} size="sm" />
          </GrowthRing>
          <AvatarRings years={3} size={104}>
            <div className="mm-gallery-avatar">M</div>
          </AvatarRings>
          <AvatarRings years={6} size={104}>
            <div className="mm-gallery-avatar">J</div>
          </AvatarRings>
        </div>
      </Card>

      <Card>
        <h2>QuestCard</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <QuestCard title="Water the garden" amount={8} meta="Chore · posted by Mom" />
          <QuestCard title="Wash the car" amount={25} kind="pitch" meta="Your pitch · name your price">
            <Button>Accept</Button>
            <Button variant="ghost">Counter</Button>
          </QuestCard>
        </div>
      </Card>

      <Card>
        <h2>StoreItem</h2>
        <StoreItem name="Movie night pick" emoji="🍿" price={40} onBuy={() => {}} />
        <StoreItem name="30 min screen time" emoji="📱" price={15} onBuy={() => {}} />
        <StoreItem name="Skip a chore" emoji="🎟️" price={75} onBuy={() => {}} disabled />
      </Card>

      <Card>
        <h2>ScoreDial + Sparkline</h2>
        <div className="mm-gallery-row">
          <ScoreDial value={612} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <Sparkline data={FUND} />
            <AmountText value={-8} delta size="sm" />
          </div>
        </div>
      </Card>

      <Card>
        <h2>Sheet + NavBar</h2>
        <Button variant="secondary" onClick={() => setSheetOpen(true)}>
          Open sheet
        </Button>
        <div style={{ marginTop: 16, border: "1px solid var(--line)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <NavBar items={NAV_ITEMS} activeId={nav} onSelect={setNav} />
        </div>
      </Card>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <h2>Move Mints</h2>
        <p className="mm-gallery-sub">Wallet → Savings</p>
        <div className="mm-gallery-row" style={{ marginTop: 12 }}>
          <AmountText value={20} size="lg" />
          <Button onClick={() => setSheetOpen(false)}>Confirm</Button>
        </div>
      </Sheet>
    </div>
  );
}
