import { useEffect, useState } from "react";
import SwitchRouteProfileSection from "./SwitchRouteProfileSection";
import "./SwitchRouteProfileWrapper.css";

export default function SwitchRouteProfileWrapper() {
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const ccpAgent = window.connect?.agent?.();
      if (ccpAgent) {
        console.log("✅ Agent detected:", ccpAgent.getName());
        setAgent(ccpAgent);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="profile-wrapper">
      {agent ? (
        <SwitchRouteProfileSection agent={agent} apiKey={process.env.REACT_APP_APIKEY} />
      ) : (
        <p>⏳ Detecting agent info...</p>
      )}
    </div>
  );
}
