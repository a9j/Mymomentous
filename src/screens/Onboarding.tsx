import { useState } from "react";
import { AmountText, Button, Card } from "../components";
import { api, suggestedEra } from "../data/api";
import type { Era } from "../motion";
import { ERAS, ERA_LABELS } from "../era";
import "./Onboarding.css";

/* Parent onboarding: download → working economy in under 3 minutes.
 * Four steps, every default pre-filled so "Next, Next, Next, Done" works. */

interface KidDraft {
  name: string;
  birthYear: string;
  era: Era;
  baseIncome: number;
}

const STARTERS = [
  { name: "Movie night pick", emoji: "🍿", price: 40 },
  { name: "30 min screen time", emoji: "📱", price: 15 },
  { name: "Skip a chore", emoji: "🎟️", price: 75 },
  { name: "Sleepover pass", emoji: "🛌", price: 60 },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [economyName, setEconomyName] = useState("");
  const [parentName, setParentName] = useState("");
  const [currencyName, setCurrencyName] = useState("Mints");
  const [currencySymbol, setCurrencySymbol] = useState("M");
  const [kids, setKids] = useState<KidDraft[]>([]);
  const [draft, setDraft] = useState<KidDraft>({ name: "", birthYear: "", era: "sprout", baseIncome: 10 });
  const [items, setItems] = useState(STARTERS.map((s) => ({ ...s, on: true })));
  const [busy, setBusy] = useState(false);

  const addKid = () => {
    if (!draft.name.trim()) return;
    setKids([...kids, draft]);
    setDraft({ name: "", birthYear: "", era: "sprout", baseIncome: 10 });
  };

  const finish = async () => {
    setBusy(true);
    await api.onboard({
      economyName: economyName.trim() || "Our Family Economy",
      parentName: parentName.trim() || "Parent",
      currencyName,
      currencySymbol,
      kids: kids.map((k) => ({
        name: k.name,
        birthYear: k.birthYear ? Number(k.birthYear) : undefined,
        era: k.era,
        baseIncome: k.baseIncome,
      })),
      starterItems: items.filter((i) => i.on).map(({ name, emoji, price }) => ({ name, emoji, price })),
    });
    onDone();
  };

  return (
    <div className="mm-onb">
      <div className="mm-onb-progress" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => <span key={i} className={i <= step ? "done" : ""} />)}
      </div>

      {step === 0 && (
        <>
          <h1>Name your economy</h1>
          <Card>
            <div className="mm-onb-field">
              <label htmlFor="onb-name">Economy name</label>
              <input id="onb-name" placeholder="The Anderson Economy" value={economyName}
                     onChange={(e) => setEconomyName(e.target.value)} />
            </div>
            <div className="mm-onb-field" style={{ marginTop: 12 }}>
              <label htmlFor="onb-parent">Your name</label>
              <input id="onb-parent" placeholder="Alex" value={parentName}
                     onChange={(e) => setParentName(e.target.value)} />
            </div>
            <div className="mm-onb-row" style={{ marginTop: 12 }}>
              <div>
                <label htmlFor="onb-cur">Currency</label>
                <input id="onb-cur" value={currencyName} onChange={(e) => setCurrencyName(e.target.value)} />
              </div>
              <div style={{ maxWidth: 96 }}>
                <label htmlFor="onb-sym">Symbol</label>
                <input id="onb-sym" value={currencySymbol} maxLength={2}
                       onChange={(e) => setCurrencySymbol(e.target.value)} />
              </div>
            </div>
          </Card>
          <div className="mm-onb-actions">
            <Button onClick={() => setStep(1)}>Next</Button>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h1>Add your kids</h1>
          <Card>
            <div className="mm-onb-field">
              <label htmlFor="onb-kid">Kid's name (a nickname is fine)</label>
              <input id="onb-kid" placeholder="Maya" value={draft.name}
                     onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="mm-onb-row" style={{ marginTop: 12 }}>
              <div>
                <label htmlFor="onb-year">Birth year</label>
                <input id="onb-year" inputMode="numeric" placeholder="2019" value={draft.birthYear}
                       onChange={(e) => {
                         const birthYear = e.target.value;
                         setDraft({ ...draft, birthYear, era: suggestedEra(birthYear ? Number(birthYear) : undefined) });
                       }} />
              </div>
              <div>
                <label htmlFor="onb-era">Starting era</label>
                <select id="onb-era" value={draft.era}
                        onChange={(e) => setDraft({ ...draft, era: e.target.value as Era })}>
                  {ERAS.map((e) => <option key={e} value={e}>{ERA_LABELS[e]}</option>)}
                </select>
              </div>
            </div>
            <div className="mm-onb-field" style={{ marginTop: 12 }}>
              <label htmlFor="onb-income">Weekly {currencyName} (base income)</label>
              <input id="onb-income" inputMode="numeric" value={draft.baseIncome}
                     onChange={(e) => setDraft({ ...draft, baseIncome: Number(e.target.value) || 0 })} />
            </div>
            <Button variant="secondary" style={{ marginTop: 14 }} onClick={addKid}>
              Add {draft.name.trim() || "kid"}
            </Button>
          </Card>
          {kids.map((k, i) => (
            <Card key={i}>
              <div className="mm-onb-kid">
                <div>
                  <strong>{k.name}</strong>
                  <small>{ERA_LABELS[k.era]} · <span className="money">{k.baseIncome}</span> {currencyName}/week</small>
                </div>
                <Button variant="ghost" onClick={() => setKids(kids.filter((_, j) => j !== i))}>Remove</Button>
              </div>
            </Card>
          ))}
          <div className="mm-onb-actions">
            <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={() => setStep(2)} disabled={kids.length === 0}>Next</Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1>Stock the house store</h1>
          <p>Four starters. Change everything later.</p>
          <Card>
            {items.map((it, i) => (
              <div className="mm-onb-item" key={it.name}>
                <input type="checkbox" id={`onb-it-${i}`} checked={it.on}
                       onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, on: e.target.checked } : x))} />
                <label htmlFor={`onb-it-${i}`} className="grow" style={{ margin: 0 }}>
                  {it.emoji} {it.name}
                </label>
                <AmountText value={it.price} gold />
              </div>
            ))}
          </Card>
          <div className="mm-onb-actions">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>Next</Button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1>Ready to open</h1>
          <Card>
            <p><strong>{economyName.trim() || "Our Family Economy"}</strong></p>
            <p>{kids.length} kid{kids.length === 1 ? "" : "s"} · {items.filter((i) => i.on).length} store items · paid in {currencyName}</p>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>
              Base income lands every Sunday. You approve jobs and purchases with one tap.
            </p>
          </Card>
          <div className="mm-onb-actions">
            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={finish} disabled={busy}>Open the economy</Button>
          </div>
        </>
      )}
    </div>
  );
}
