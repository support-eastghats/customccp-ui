// src/App.js
import { useState } from "react";
import CCPContainer from "./components/CCPContainer";
import SwitchRouteProfileWrapper from "./components/SwitchRouteProfileWrapper";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [agent, setAgent] = useState(null);
  const [apiKey, setApiKey] = useState("");

  return (
    <div className={`App ${darkMode ? "dark" : ""}`}>
      <div className="top-bar">
        <h2>Amazon Connect Agent Console</h2>
        <button className="toggle-mode-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div className="app-container">
        <div className="card">
          <CCPContainer setAgent={setAgent} setApiKey={setApiKey} />
        </div>
        <div className="card">
          <SwitchRouteProfileWrapper agent={agent} apiKey={apiKey} />
        </div>
      </div>
    </div>
  );
}

export default App;
