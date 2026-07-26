/* The data seam. Screens talk to DataApi only; MockApi backs it today,
 * SupabaseApi (calling the create_household/add_kid/... RPCs) replaces
 * it in one place once the live project exists. The mock enforces the
 * same rule as the database: balances are sums over an append-only
 * ledger, never stored numbers. */

import type { Era } from "../motion";
import type {
  AccountKind,
  Household,
  KidSummary,
  Member,
  StoreItemRow,
} from "./types";

export interface OnboardingInput {
  economyName: string;
  currencyName: string;
  currencySymbol: string;
  parentName: string;
  kids: { name: string; birthYear?: number; era: Era; baseIncome: number }[];
  starterItems: { name: string; emoji?: string; price: number }[];
}

export interface DataApi {
  household(): Promise<Household | null>;
  onboard(input: OnboardingInput): Promise<Household>;
  kidSummaries(): Promise<KidSummary[]>;
  storeItems(): Promise<StoreItemRow[]>;
  advanceEra(memberId: string): Promise<Member>;
}

export const ERA_ORDER: Era[] = ["sprout", "sapling", "grove", "canopy", "harvest"];

export function suggestedEra(birthYear: number | undefined, now = 2026): Era {
  if (birthYear == null) return "sprout";
  const age = now - birthYear;
  if (age <= 5) return "sprout";
  if (age <= 9) return "sapling";
  if (age <= 13) return "grove";
  if (age <= 17) return "canopy";
  return "harvest";
}

interface LedgerEntry {
  accountId: string;
  amount: number;
}

let nextId = 1;
const id = () => `mock-${nextId++}`;

class MockApi implements DataApi {
  private hh: Household | null = null;
  private members: Member[] = [];
  private accounts: { id: string; memberId: string; kind: AccountKind }[] = [];
  private ledger: LedgerEntry[] = []; // append-only, like the real one
  private items: StoreItemRow[] = [];
  private approvals = new Map<string, number>();

  async household() {
    return this.hh;
  }

  async onboard(input: OnboardingInput): Promise<Household> {
    this.hh = {
      id: id(),
      name: input.economyName,
      currencyName: input.currencyName,
      currencySymbol: input.currencySymbol,
    };
    this.members = [
      { id: id(), householdId: this.hh.id, role: "parent", displayName: input.parentName, era: "canopy" },
    ];
    for (const kid of input.kids) {
      const m: Member = {
        id: id(),
        householdId: this.hh.id,
        role: "kid",
        displayName: kid.name,
        birthYear: kid.birthYear,
        era: kid.era,
        baseIncome: kid.baseIncome,
      };
      this.members.push(m);
      for (const kind of ["wallet", "savings", "vault", "education"] as AccountKind[]) {
        this.accounts.push({ id: id(), memberId: m.id, kind });
      }
      // first week's base income lands immediately so the app never opens empty
      const wallet = this.accounts.find((a) => a.memberId === m.id && a.kind === "wallet")!;
      this.ledger.push({ accountId: wallet.id, amount: kid.baseIncome });
      this.approvals.set(m.id, 0);
    }
    this.items = input.starterItems.map((s) => ({
      id: id(),
      householdId: this.hh!.id,
      name: s.name,
      emoji: s.emoji,
      price: s.price,
      active: true,
    }));
    return this.hh;
  }

  async kidSummaries(): Promise<KidSummary[]> {
    return this.members
      .filter((m) => m.role === "kid")
      .map((m) => {
        const balances = { wallet: 0, savings: 0, vault: 0, education: 0 } as Record<AccountKind, number>;
        for (const a of this.accounts.filter((a) => a.memberId === m.id)) {
          balances[a.kind] = this.ledger
            .filter((e) => e.accountId === a.id)
            .reduce((sum, e) => sum + e.amount, 0);
        }
        return { member: m, balances, pendingApprovals: this.approvals.get(m.id) ?? 0 };
      });
  }

  async storeItems() {
    return this.items.filter((i) => i.active);
  }

  async advanceEra(memberId: string): Promise<Member> {
    const m = this.members.find((x) => x.id === memberId);
    if (!m) throw new Error("member not found");
    const idx = ERA_ORDER.indexOf(m.era);
    if (idx < ERA_ORDER.length - 1) m.era = ERA_ORDER[idx + 1];
    return m;
  }
}

export const api: DataApi = new MockApi();
