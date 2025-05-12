import { useEffect, useState } from "react";
import SwitchRouteProfile from "./switchRouteProfile";

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

  return <SwitchRouteProfile agent={agent} apiKey={apiKey} />;
}
