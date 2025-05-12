import { useEffect, useState } from "react";
import SwitchRouteProfileSection from "./SwitchRouteProfileSection";
import "./SwitchRouteProfileWrapper.css";

export default function SwitchRouteProfileWrapper() {
  const [agent, setAgent] = useState(null);
  const apiKey = process.env.REACT_APP_APIKEY;

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.connect?.agent) {
        const ccpAgent = window.connect.agent();
        if (ccpAgent?.getUsername()) {
          console.log("✅ Agent ready:", ccpAgent.getUsername());
          setAgent(ccpAgent);
          clearInterval(interval);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!agent) {
    return (
      <div className="profile-wrapper">
        <p>⏳ Detecting agent info...</p>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <SwitchRouteProfileSection agent={agent} apiKey={apiKey} />
    </div>
  );
}
