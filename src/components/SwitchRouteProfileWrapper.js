// SwitchRouteProfileWrapper.js
import { useState } from "react";
import axios from "axios";
import SwitchRouteProfileSection from "./SwitchRouteProfileSection";
import "./SwitchRouteProfileWrapper.css";

export default function SwitchRouteProfileWrapper({ agent, apiKey, isCallActive, onProfileSwitched }) {
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
      const fullArn = agent?.getAgentARN?.();
      const userId = fullArn?.split("/").pop();

      if (!userId) {
        setError("Agent ID not available.");
        setLoading(false);
        return;
      }

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

      const profiles = res.data.allowedProfiles || [];

      if (profiles.length === 0) {
        setError(res.data.message || "No routing profiles available.");
      } else {
        setAvailableProfiles(profiles);
        setShowForm(true);
      }
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
          disabled={loading || isCallActive} // 🔒 Disable during call
        >
          {loading ? "Loading..." : "Switch Routing Profile"}
        </button>
      ) : (
        <SwitchRouteProfileSection
          agent={agent}
          apiKey={apiKey}
          availableProfiles={availableProfiles}
          onClose={() => setShowForm(false)}
          onProfileSwitched={() => {
            setShowForm(false);
            onProfileSwitched();
          }}
          isCallActive={isCallActive} // 🔒 Propagate to inner section
        />
      )}

      {error && <p className="switch-message">{error}</p>}
    </div>
  );
}