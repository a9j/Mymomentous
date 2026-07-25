import type { ReactNode } from "react";
import "./NavBar.css";

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface NavBarProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

/* Note: Sprout screens have zero navigation (§4.1) — don't render a NavBar
 * there. The component itself stays era-agnostic. */
export function NavBar({ items, activeId, onSelect }: NavBarProps) {
  return (
    <nav className="mm-nav">
      {items.map((item) => (
        <button
          key={item.id}
          className="mm-nav-item"
          aria-current={item.id === activeId}
          onClick={() => onSelect(item.id)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
