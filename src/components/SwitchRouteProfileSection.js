import { useState, useEffect } from "react";
import axios from "axios";
import "./SwitchRouteProfileSection.css";

export default function SwitchRouteProfileSection({
  agent,
  apiKey,
  availableProfiles,
  onClose,
  onProfileSwitched
}) {
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [inCall, setInCall] = useState(false);

  const instanceId = process.env.REACT_APP_CONNECT_INSTANCE_ID;
  const apiBase = process.env.REACT_APP_DISPURL;

  useEffect(() => {
    if (!agent) return;

    const unsubscribe = window.connect.contact((contact) => {
      contact.onConnected(() => {
        setInCall(true);
        setMessage("⚠️ Cannot switch while on call.");
      });
      contact.onEnded(() => {
        setInCall(false);
        setMessage("");
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [agent]);

  const handleSwitch = async () => {
    if (!selectedProfileId) return;
    setLoading(true);
    setMessage("⏳ Switching...");

    try {
      const fullArn = agent?.getAgentARN?.();
      const userId = fullArn?.split("/").pop();

      if (!userId) {
        setMessage("❌ Unable to get Agent ID.");
        setLoading(false);
        return;
      }

      const payload = {
        userId,
        instanceId,
        routingProfileId: selectedProfileId
      };

      await axios.post(`${apiBase}/switchRoutingProfile`, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        }
      });

      setMessage("✅ Routing profile switched successfully.");

      // Update CCPContainer's profile name
      if (typeof onProfileSwitched === "function") {
        onProfileSwitched();
      }

      // Collapse back to button view after a short delay
      setTimeout(() => {
        setSelectedProfileId("");
        setMessage("");
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Switch failed:", err);
      setMessage("❌ Failed to switch routing profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="switch-form">
      <select
        className="switch-dropdown"
        value={selectedProfileId}
        onChange={(e) => setSelectedProfileId(e.target.value)}
        disabled={loading || inCall}
      >
        <option value="">-- Select Routing Profile --</option>
        {availableProfiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </select>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          className="switch-submit"
          onClick={handleSwitch}
          disabled={!selectedProfileId || loading || inCall}
        >
          {loading ? "Switching..." : "Change"}
        </button>
        <button className="switch-toggle" onClick={onClose} disabled={loading || inCall}>
          Cancel
        </button>
      </div>

      {message && <p className="switch-message">{message}</p>}
    </div>
  );
}
