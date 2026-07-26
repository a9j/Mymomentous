import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

/* Self-hosted fonts (offline-friendly for the Capacitor shell). The
 * browser fetches each family's woff2 lazily on first use, so eras
 * still only pay for the fonts they show. */
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/nunito-sans/700.css";
import "@fontsource/nunito-sans/800.css";
import "@fontsource/sora/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/spline-sans-mono/500.css";
import "@fontsource/spline-sans-mono/600.css";

import "../tokens/base.css";
import "../tokens/sprout.css";
import "../tokens/sapling.css";
import "../tokens/grove.css";
import "../tokens/canopy.css";
import "../tokens/harvest.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
