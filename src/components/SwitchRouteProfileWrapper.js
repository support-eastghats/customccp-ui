// src/components/SwitchRouteProfileWrapper.js
import SwitchRouteProfileSection from "./SwitchRouteProfileSection";
import "./SwitchRouteProfileWrapper.css";

export default function SwitchRouteProfileWrapper({ agent, apiKey }) {
  if (!agent || !apiKey) {
    return (
      <div className="profile-wrapper">
        <p>🔄 Waiting for CCP to initialize...</p>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <SwitchRouteProfileSection agent={agent} apiKey={apiKey} />
    </div>
  );
}
