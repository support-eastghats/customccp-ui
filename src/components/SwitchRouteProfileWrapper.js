import { useEffect, useState } from "react";
import SwitchRouteProfileSection from "./SwitchRouteProfileSection";
import "./SwitchRouteProfileWrapper.css";

export default function SwitchRouteProfileWrapper() {
  const [agent, setAgent] = useState(null);
  const apiKey = process.env.REACT_APP_APIKEY;

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.connect?.agent) {
        try {
          window.connect.agent((agentObj) => {
            console.log("✅ Agent initialized:", agentObj.getUsername());
            setAgent(agentObj);
          });
          clearInterval(interval);
        } catch (err) {
          console.warn("⚠️ Agent not ready:", err.message);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!agent) {
    return (
      <div className="profile-wrapper">
        <p>🔄 Waiting for CCP to initialize...</p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="profile-wrapper">
        <p style={{ color: "red" }}>
          ❌ API key is missing. Please check your .env config.
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
