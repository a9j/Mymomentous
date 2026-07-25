import { AmountText } from "./AmountText";
import { Button } from "./Button";
import "./StoreItem.css";

export interface StoreItemProps {
  name: string;
  price: number;
  /** Shown in Sprout/Sapling only — CSS hides it from Grove onward (§5). */
  emoji?: string;
  onBuy?: () => void;
  disabled?: boolean;
}

export function StoreItem({ name, price, emoji, onBuy, disabled }: StoreItemProps) {
  return (
    <div className="mm-store-item">
      {emoji && <span className="mm-store-emoji" aria-hidden="true">{emoji}</span>}
      <span className="mm-store-name">{name}</span>
      <AmountText value={price} gold />
      {onBuy && (
        <Button variant="secondary" onClick={onBuy} disabled={disabled}>
          Buy
        </Button>
      )}
    </div>
  );
}
