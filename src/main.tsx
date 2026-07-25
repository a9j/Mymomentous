import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

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
