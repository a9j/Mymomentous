import { useEffect, useState } from "react";
import { EraProvider } from "./era";
import { DevGallery } from "./dev/DevGallery";

/* The app's screens arrive in later phases. The hidden dev gallery lives
 * at #dev (always available in dev builds so the era switch stays one
 * keystroke away). */
function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const showGallery = hash === "#dev" || import.meta.env.DEV;

  return (
    <EraProvider>
      {showGallery ? (
        <DevGallery />
      ) : (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h1>MyMomentous</h1>
          <p>Money is grown, not given.</p>
        </div>
      )}
    </EraProvider>
  );
}
