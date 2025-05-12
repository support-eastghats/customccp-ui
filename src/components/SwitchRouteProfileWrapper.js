import { useEffect, useState } from "react";
import SwitchRouteProfileSection from "./SwitchRouteProfileSection";
import "./SwitchRouteProfileWrapper.css";

export default function SwitchRouteProfileWrapper() {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiKey = process.env.REACT_APP_APIKEY;

  useEffect(() => {
    const interval = setInterval(() => {
      const globalAgent = window.ccpAgent;
      if (globalAgent) {
        console.log("✅ Agent initialized in wrapper:", globalAgent.getUsername());
        setAgent(globalAgent);
        setLoading(false);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="profile-wrapper">
        <p>🔄 Waiting for CCP to initialize...</p>
      </div>
    );
  }

  if (!agent || !apiKey) {
    return (
      <div className="profile-wrapper">
        <p style={{ color: "red" }}>
          ⚠️ Agent or API Key not available. Please login through CCP.
        </p>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <SwitchRouteProfileSection agent={agent} apiKey={apiKey} />
    </div>
  );
}
