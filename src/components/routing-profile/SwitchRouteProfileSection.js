import { useState } from "react";
import axios from "axios";
import "./SwitchRouteProfileSection.css";

export default function SwitchRouteProfileSection({
  agent,
  apiKey,
  availableProfiles,
  onClose,
  onProfileSwitched,
  isCallActive
}) {
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const instanceId = process.env.REACT_APP_CONNECT_INSTANCE_ID;
  const apiBase = process.env.REACT_APP_DISPURL;

  const handleSwitch = async () => {
    if (!selectedProfileId) return;
    setLoading(true);
    setMessage("Switching...");

    try {
      const fullArn = agent?.getAgentARN?.();
      const userId = fullArn?.split("/").pop();

      const payload = { userId, instanceId, routingProfileId: selectedProfileId };

      await axios.post(`${apiBase}/switchRoutingProfile`, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        }
      });

      setMessage("Routing profile switched successfully.");
      onProfileSwitched();
    } catch (err) {
      console.error("Switch failed:", err);
      setMessage("Failed to switch routing profile.");
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
        disabled={isCallActive}
      >
        <option value="">-- Select Routing Profile --</option>
        {availableProfiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </select>

      <div className="switch-buttons">
        <button
          className="switch-submit"
          onClick={handleSwitch}
          disabled={!selectedProfileId || loading || isCallActive}
        >
          {loading ? "Switching..." : "Change"}
        </button>
        <button
          className="switch-cancel"
          onClick={() => !loading && onClose()}
          disabled={loading || isCallActive}
        >
          Cancel
        </button>
      </div>

      {message && <p className="switch-message">{message}</p>}
    </div>
  );
}
