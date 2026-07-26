import { useEffect, useState } from "react";
import { EraProvider } from "./era";
import type { Era } from "./motion";
import { ERAS } from "./era";
import { DevGallery } from "./dev/DevGallery";
import { KidHome } from "./screens/KidHome";

/* The hidden dev gallery lives at #dev. ?era=<name> sets the starting
 * era (handy for screenshots and design review). */
function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

function initialEra(): Era {
  const q = new URLSearchParams(window.location.search).get("era");
  return (ERAS as string[]).includes(q ?? "") ? (q as Era) : "sapling";
}

export default function App() {
  const hash = useHash();
  return (
    <EraProvider initial={initialEra()}>
      {hash === "#dev" ? <DevGallery /> : <KidHome />}
    </EraProvider>
  );
}
