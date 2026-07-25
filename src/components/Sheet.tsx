import type { ReactNode } from "react";
import "./Sheet.css";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ open, onClose, children }: SheetProps) {
  if (!open) return null;
  return (
    <>
      <div className="mm-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="mm-sheet" role="dialog" aria-modal="true">
        <div className="mm-sheet-handle" />
        {children}
      </div>
    </>
  );
}
