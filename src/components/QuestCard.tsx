import type { ReactNode } from "react";
import { AmountText } from "./AmountText";
import "./QuestCard.css";

export interface QuestCardProps {
  title: string;
  amount: number;
  /** 'chore' = parent-posted (color spine); 'pitch' = kid proposal (dashed). */
  kind?: "chore" | "pitch";
  meta?: string;
  /** Action buttons, negotiation history, etc. */
  children?: ReactNode;
}

function BulbIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.5 1 2.5h6c0-1 .3-1.9 1-2.5A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

export function QuestCard({ title, amount, kind = "chore", meta, children }: QuestCardProps) {
  return (
    <div className={`mm-quest mm-quest-${kind}`}>
      <div className="mm-quest-head">
        <div>
          <div className="mm-quest-title">{title}</div>
          {meta && <div className="mm-quest-meta">{meta}</div>}
        </div>
        {kind === "pitch" && <span className="mm-quest-bulb"><BulbIcon /></span>}
        <AmountText value={amount} gold />
      </div>
      {children && <div className="mm-quest-actions">{children}</div>}
    </div>
  );
}
