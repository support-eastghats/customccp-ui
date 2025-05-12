import { useEffect, useState } from "react";
import SwitchRouteProfileSection from "./SwitchRouteProfileSection";
import "./SwitchRouteProfileWrapper.css";

export default function SwitchRouteProfileWrapper() {
  const [agent, setAgent] = useState(null);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const ccpAgent = window.connect?.agent?.();
      const key = localStorage.getItem("connectApiKey");
      if (ccpAgent && key) {
        setAgent(ccpAgent);
        setApiKey(key);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!agent || !apiKey) return null;

  return (
    <div className="profile-wrapper">
      <SwitchRouteProfileSection agent={agent} apiKey={apiKey} />
    </div>
  );
}
