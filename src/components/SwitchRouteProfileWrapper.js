// SwitchRouteProfileWrapper.js
import { useEffect, useState } from "react";
import SwitchRouteProfile from "./switchRouteProfile";

export default function SwitchRouteProfileWrapper() {
  const [agent, setAgent] = useState(null);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const key = localStorage.getItem("connectApiKey");

    if (window.connect && window.connect.agent && key) {
      window.connect.agent(agentData => {
        console.log("✅ Agent loaded:", agentData.getName());
        setAgent(agentData);
        setApiKey(key);
      });
    } else {
      console.warn("⏳ Waiting for connect.agent or API key");
    }
  }, []);

  if (!agent || !apiKey) return <p>Loading routing profile controls...</p>;

  return <SwitchRouteProfile agent={agent} apiKey={apiKey} />;
}
