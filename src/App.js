// src/App.js
import { useState, useEffect } from "react";
import CCPContainer from "./components/CCPContainer";
import SwitchRouteProfileWrapper from "./components/SwitchRouteProfileWrapper";
import "./App.css";

function App() {
  const [agent, setAgent] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("connectApiKey");
    if (storedKey) setApiKey(storedKey);
  }, []);

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
