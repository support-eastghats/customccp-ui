import { useState } from "react";
import axios from "axios";
import "./SwitchRouteProfileSection.css";

export default function SwitchRouteProfileSection({
  agent,
  apiKey,
  availableProfiles,
  onClose,
  onProfileSwitched,
  isCallActive = false,
}) {
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const instanceId = process.env.REACT_APP_CONNECT_INSTANCE_ID;
  const apiBase = process.env.REACT_APP_DISPURL;

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
        routingProfileId: selectedProfileId,
      };

      await axios.post(`${apiBase}/switchRoutingProfile`, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      });

      setMessage("✅ Routing profile switched successfully.");

      if (onProfileSwitched) {
        onProfileSwitched(); // Update UI with new profile
      }

      setTimeout(() => {
        onClose(); // Hide form
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
        disabled={loading || isCallActive}
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
          type="button"
          className="switch-submit"
          onClick={handleSwitch}
          disabled={!selectedProfileId || loading || isCallActive}
        >
          {loading ? "Switching..." : "Change"}
        </button>
        <button
          type="button"
          className="switch-toggle"
          onClick={onClose}
          disabled={loading || isCallActive}
        >
          Cancel
        </button>
      </div>

      {message && <p className="switch-message">{message}</p>}
    </div>
  );
}
