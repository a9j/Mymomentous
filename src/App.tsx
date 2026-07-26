import { useEffect, useState } from "react";
import { EraProvider, ERAS } from "./era";
import type { Era } from "./motion";
import { DevGallery } from "./dev/DevGallery";
import { KidHome } from "./screens/KidHome";
import { Onboarding } from "./screens/Onboarding";
import { ParentHome } from "./screens/ParentHome";

/* Hash routes until real navigation lands:
 *   (default)    kid home concept
 *   #onboarding  parent onboarding flow
 *   #parent      parent home
 *   #dev         hidden component gallery
 * ?era=<name> sets the starting era (design review, screenshots). */
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
      {hash === "#dev" ? (
        <DevGallery />
      ) : hash === "#onboarding" ? (
        <Onboarding onDone={() => { window.location.hash = "#parent"; }} />
      ) : hash === "#parent" ? (
        <ParentHome />
      ) : (
        <KidHome />
      )}
    </EraProvider>
  );
}
