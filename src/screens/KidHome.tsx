import { useState } from "react";
import {
  AmountText,
  Button,
  Card,
  GrowthRing,
  LeafCoin,
  NavBar,
  QuestCard,
  StoreItem,
} from "../components";
import { Scene } from "../components/Scene";
import "./KidHome.css";

const NAV = [
  { id: "home", label: "Home", icon: <NavIcon d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1Z" /> },
  { id: "jobs", label: "Jobs", icon: <NavIcon d="M9 6V5a3 3 0 0 1 6 0v1h4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" /> },
  { id: "store", label: "Store", icon: <NavIcon d="M4 9h16l-1 10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Zm3 0V7a5 5 0 0 1 10 0v2" /> },
  { id: "bank", label: "Bank", icon: <NavIcon d="M3 10 12 4l9 6M5 10v8m4-8v8m6-8v8m4-8v8M3 20h18" /> },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* Kid Home concept screen — Sapling era voice, reference art direction:
 * a scenic color-blocked hero with a curved bottom, floating paper
 * cards, big friendly numbers, a dark pill nav. Everything below the
 * illustration reads only from tokens. */
export function KidHome() {
  const [nav, setNav] = useState("home");

  return (
    <div className="mm-home">
      <header className="mm-home-hero">
        <Scene height={250} />
        <div className="mm-home-greeting">
          <h1 className="mm-display">Hi, Maya</h1>
        </div>
        <div className="mm-home-balance">
          <LeafCoin size={40} />
          <div>
            <AmountText value={128} size="lg" />
            <small>Mints</small>
          </div>
        </div>
      </header>

      <div className="mm-home-stats">
        <div className="mm-home-stat">
          <AmountText value={18} delta size="md" />
          <small>this week</small>
        </div>
        <div className="mm-home-stat">
          <AmountText value={10} size="md" gold />
          <small>saved up</small>
        </div>
        <div className="mm-home-stat">
          <AmountText value={2} size="md" />
          <small>jobs open</small>
        </div>
      </div>

      <Card>
        <h2>Your goal</h2>
        <div className="mm-home-goal">
          <GrowthRing progress={0.65} size={104}>
            <div className="mm-home-goal-photo" aria-label="Bike goal photo">🚲</div>
          </GrowthRing>
          <div>
            <p><strong>New bike</strong></p>
            <p>12 more Mints to your goal.</p>
            <Button variant="secondary" style={{ marginTop: 10 }}>Add Mints</Button>
          </div>
        </div>
      </Card>

      <section>
        <h2>Jobs board</h2>
        <div className="mm-home-list">
          <QuestCard title="Water the garden" amount={8} meta="Chore · weekly" />
          <QuestCard title="Wash the car" amount={25} kind="pitch" meta="Your pitch · waiting on Dad" />
        </div>
      </section>

      <section>
        <h2>House store</h2>
        <Card style={{ padding: "4px 12px" }}>
          <StoreItem name="Movie night pick" emoji="🍿" price={40} onBuy={() => {}} />
          <StoreItem name="30 min screen time" emoji="📱" price={15} onBuy={() => {}} />
        </Card>
      </section>

      <div className="mm-home-nav">
        <NavBar items={NAV} activeId={nav} onSelect={setNav} />
      </div>
    </div>
  );
}
