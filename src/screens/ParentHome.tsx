import { useCallback, useEffect, useState } from "react";
import { AmountText, AvatarRings, Button, Card, Sheet } from "../components";
import { api, ERA_ORDER } from "../data/api";
import { ERA_LABELS } from "../era";
import type { Household, KidSummary } from "../data/types";
import "./ParentHome.css";

/* Parent home: every kid's balances at a glance, the approvals badge,
 * and the era controls — advancing an era is a deliberate, confirmed
 * act because it triggers the kid's ceremony (Phase 9). */
export function ParentHome() {
  const [hh, setHh] = useState<Household | null>(null);
  const [kids, setKids] = useState<KidSummary[]>([]);
  const [confirming, setConfirming] = useState<KidSummary | null>(null);

  const refresh = useCallback(async () => {
    setHh(await api.household());
    setKids(await api.kidSummaries());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const pending = kids.reduce((sum, k) => sum + k.pendingApprovals, 0);

  const advance = async (k: KidSummary) => {
    await api.advanceEra(k.member.id);
    setConfirming(null);
    await refresh();
  };

  if (!hh) {
    return (
      <div className="mm-parent">
        <h1>No economy yet</h1>
        <p>Run onboarding first: <a href="#onboarding">set up your economy</a>.</p>
      </div>
    );
  }

  return (
    <div className="mm-parent">
      <div className="mm-parent-head">
        <h1>{hh.name}</h1>
        <span className="mm-parent-badge" aria-label={`${pending} pending approvals`}>
          {pending} to approve
        </span>
      </div>

      {kids.map((k) => {
        const eraIdx = ERA_ORDER.indexOf(k.member.era);
        const next = ERA_ORDER[eraIdx + 1];
        return (
          <Card key={k.member.id} className="mm-parent-kid">
            <div className="mm-parent-kid-head">
              <AvatarRings years={1} size={56}>
                <div className="mm-parent-avatar">{k.member.displayName[0]}</div>
              </AvatarRings>
              <div className="who">
                <strong>{k.member.displayName}</strong>
                <small>
                  {ERA_LABELS[k.member.era]} · <span className="money">{k.member.baseIncome ?? 0}</span> {hh.currencyName}/week
                </small>
              </div>
            </div>
            <div className="mm-parent-balances">
              {(["wallet", "savings", "vault", "education"] as const).map((kind) => (
                <div key={kind}>
                  <AmountText value={k.balances[kind]} size="sm" />
                  <small>{kind}</small>
                </div>
              ))}
            </div>
            <div className="mm-parent-era">
              <small>
                {next ? `Next era: ${ERA_LABELS[next]}` : "Final era — the ceremony awaits"}
              </small>
              {next && (
                <Button variant="ghost" onClick={() => setConfirming(k)}>
                  Advance era
                </Button>
              )}
            </div>
          </Card>
        );
      })}

      <Sheet open={confirming !== null} onClose={() => setConfirming(null)}>
        {confirming && (
          <>
            <h2>Advance {confirming.member.displayName}?</h2>
            <p style={{ color: "var(--muted)", margin: "8px 0 16px" }}>
              {confirming.member.displayName} graduates to{" "}
              {ERA_LABELS[ERA_ORDER[ERA_ORDER.indexOf(confirming.member.era) + 1]]}. The app changes
              for them the moment you confirm — they'll see the ceremony next time they open it.
              Readiness, not birthday.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <Button onClick={() => void advance(confirming)}>Begin the ceremony</Button>
              <Button variant="ghost" onClick={() => setConfirming(null)}>Not yet</Button>
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}
