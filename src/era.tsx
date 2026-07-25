import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Era } from "./motion";
import { loadEraFonts } from "./fonts";

export const ERAS: Era[] = ["sprout", "sapling", "grove", "canopy", "harvest"];

export const ERA_LABELS: Record<Era, string> = {
  sprout: "Sprout · 3–5",
  sapling: "Sapling · 6–9",
  grove: "Grove · 10–13",
  canopy: "Canopy · 14–17",
  harvest: "Harvest · 18",
};

interface EraContextValue {
  era: Era;
  setEra: (era: Era) => void;
}

const EraContext = createContext<EraContextValue>({
  era: "sprout",
  setEra: () => {},
});

/* Applied before React state updates so children reading computed styles
 * in their effects always see the new era's tokens. */
function applyEra(era: Era) {
  document.documentElement.dataset.era = era;
  loadEraFonts(era);
}

export function EraProvider({
  initial = "sprout",
  children,
}: {
  initial?: Era;
  children: ReactNode;
}) {
  const [era, setEraState] = useState<Era>(initial);

  useEffect(() => {
    applyEra(era);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setEra = useCallback((next: Era) => {
    applyEra(next);
    setEraState(next);
  }, []);

  return (
    <EraContext.Provider value={{ era, setEra }}>{children}</EraContext.Provider>
  );
}

export function useEra(): EraContextValue {
  return useContext(EraContext);
}

/** Read a numeric token (e.g. --ring-weight) from the root, re-read on era change. */
export function useTokenNumber(name: string, fallback: number): number {
  const { era } = useEra();
  const [value, setValue] = useState(fallback);
  useEffect(() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
    const parsed = parseFloat(raw);
    setValue(Number.isFinite(parsed) ? parsed : fallback);
  }, [name, fallback, era]);
  return value;
}
