import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  return (
    <button className={`mm-btn mm-btn-${variant} ${className}`.trim()} {...rest} />
  );
}
