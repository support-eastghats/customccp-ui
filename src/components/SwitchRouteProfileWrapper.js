import { useState } from "react";
import SwitchRouteProfileSection from "./SwitchRouteProfileSection";
import "./SwitchRouteProfileWrapper.css";

export default function SwitchRouteProfileWrapper({ agent, apiKey }) {
  const [showSwitcher, setShowSwitcher] = useState(false);

  if (!agent || !apiKey) {
    return (
      <div className="profile-wrapper">
        <p style={{ color: "orange" }}>⏳ Detecting agent info...</p>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <button
        className="switch-toggle"
        onClick={() => setShowSwitcher((prev) => !prev)}
      >
        {showSwitcher ? "Cancel" : "Switch Routing Profile"}
      </button>

      {showSwitcher && (
        <SwitchRouteProfileSection
          agent={agent}
          apiKey={apiKey}
          onClose={() => setShowSwitcher(false)}
        />
      )}
    </div>
  );
}
