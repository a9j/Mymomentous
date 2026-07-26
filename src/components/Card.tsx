import type { HTMLAttributes } from "react";
import "./Card.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
}

export function Card({ raised = false, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`mm-card ${raised ? "mm-card-raised" : ""} ${className}`.trim()}
      {...rest}
    />
  );
}
