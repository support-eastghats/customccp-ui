import { useState, useEffect } from "react";
import CCPContainer from "./components/CCPContainer";
import SwitchRouteProfileWrapper from "./components/SwitchRouteProfileWrapper";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [agent, setAgent] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0);

  const triggerProfileRefresh = () => {
    setProfileRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (agent) console.log("✅ Agent set in App:", agent.getName());
    console.log("🔑 API Key in App:", apiKey);
  }, [agent, apiKey]);

  return (
    <div className={`App ${darkMode ? "dark" : ""}`}>
      <div className="top-bar">
        <h2>Amazon Connect Agent Console</h2>
        <button
          className="toggle-mode-btn"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div className="app-container">
        <div className="card">
          <CCPContainer
            setAgent={setAgent}
            setApiKey={setApiKey}
            profileRefreshTrigger={profileRefreshTrigger}
          />
        </div>

        {agent && apiKey && (
          <div className="card">
            <SwitchRouteProfileWrapper
              agent={agent}
              apiKey={apiKey}
              onProfileSwitched={triggerProfileRefresh}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;