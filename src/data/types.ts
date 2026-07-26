/* Domain types mirroring the Supabase schema (supabase/migrations).
 * IDs are strings (uuids server-side). */

import type { Era } from "../motion";

export type Role = "parent" | "kid";
export type AccountKind = "wallet" | "savings" | "vault" | "education";

export interface Household {
  id: string;
  name: string;
  currencyName: string;
  currencySymbol: string;
}

export interface Member {
  id: string;
  householdId: string;
  role: Role;
  displayName: string;
  birthYear?: number;
  era: Era;
  /** Weekly base income in Mints (kid only). Sunday deposits, Phase 5. */
  baseIncome?: number;
}

export interface StoreItemRow {
  id: string;
  householdId: string;
  name: string;
  emoji?: string;
  price: number;
  active: boolean;
}

export interface KidSummary {
  member: Member;
  balances: Record<AccountKind, number>;
  pendingApprovals: number;
}
