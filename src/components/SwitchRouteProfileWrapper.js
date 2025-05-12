import { useState } from "react";
import axios from "axios";
import SwitchRouteProfileSection from "./SwitchRouteProfileSection";
import "./SwitchRouteProfileWrapper.css";

export default function SwitchRouteProfileWrapper({ agent, apiKey }) {
  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const apiBase = process.env.REACT_APP_DISPURL;
  const instanceId = process.env.REACT_APP_CONNECT_INSTANCE_ID;

  const fetchProfiles = async () => {
    setLoading(true);
    setError("");
    try {
      if (typeof agent?.getUsername !== "function") {
        setError("Agent not ready.");
        setLoading(false);
        return;
      }
  
      const userId = agent.getUsername();
  
      const res = await axios.post(
        `${apiBase}/getAvailableRoutingProfiles`,
        { userId, instanceId },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
          }
        }
      );
  
      setAvailableProfiles(res.data.allowedProfiles || []);
      setShowForm(true);
    } catch (err) {
      console.error("Failed to fetch routing profiles:", err);
      setError("❌ Could not fetch routing profiles.");
    } finally {
      setLoading(false);
    }
  };
  
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
      {!showForm ? (
        <button
          className="switch-toggle"
          onClick={fetchProfiles}
          disabled={loading}
        >
          {loading ? "Loading..." : "Switch Routing Profile"}
        </button>
      ) : (
        <SwitchRouteProfileSection
          agent={agent}
          apiKey={apiKey}
          availableProfiles={availableProfiles}
          onClose={() => setShowForm(false)}
        />
      )}

      {error && <p className="switch-message">{error}</p>}
    </div>
  );
}
