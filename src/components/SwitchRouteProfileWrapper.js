// src/components/SwitchRouteProfileWrapper.js
import { useEffect, useState } from "react";
import SwitchRouteProfileSection from "./SwitchRouteProfileSection";
import "./SwitchRouteProfileWrapper.css";

export default function SwitchRouteProfileWrapper() {
  const [agent, setAgent] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const ccpAgent = window.connect?.agent?.();
      const key = localStorage.getItem("connectApiKey");

      console.log("🔍 Checking CCP agent:", ccpAgent);
      console.log("🔍 Checking API key:", key);

      if (ccpAgent && key) {
        setAgent(ccpAgent);
        setApiKey(key);
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
        <p style={{ color: "red" }}>⚠️ Agent or API Key not available. Please login through CCP.</p>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <SwitchRouteProfileSection agent={agent} apiKey={apiKey} />
    </div>
  );
}
