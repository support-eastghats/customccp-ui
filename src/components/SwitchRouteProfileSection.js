import { useEffect, useState } from "react";
import axios from "axios";
import "./SwitchRouteProfileSection.css";

export default function SwitchRouteProfileSection({ agent, apiKey, onClose }) {
  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [currentProfileId, setCurrentProfileId] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [currentProfileName, setCurrentProfileName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const instanceId = process.env.REACT_APP_CONNECT_INSTANCE_ID;
  const apiBase = process.env.REACT_APP_DISPURL;

  useEffect(() => {
    if (!agent?.getUsername) return;

    const fetchRoutingProfiles = async () => {
      try {
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

        const currentId = res.data.currentProfile;
        const allowedProfiles = res.data.allowedProfiles;

        setAvailableProfiles(allowedProfiles);
        setCurrentProfileId(currentId);

        const matched = allowedProfiles.find((p) => p.id === currentId);
        setCurrentProfileName(matched?.name || "Unknown");
      } catch (err) {
        console.error("Failed to fetch routing profiles:", err);
        setMessage("❌ Failed to load profiles.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutingProfiles();
  }, [agent, apiKey]);

  const handleSwitch = async () => {
    if (!selectedProfileId) return;
    setMessage("⏳ Switching...");
    setLoading(true);

    try {
      const payload = {
        userId: agent.getUsername(),
        instanceId,
        routingProfileId: selectedProfileId
      };

      await axios.post(`${apiBase}/switchRoutingProfile`, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        }
      });

      const selected = availableProfiles.find(p => p.id === selectedProfileId);
      setCurrentProfileId(selectedProfileId);
      setCurrentProfileName(selected?.name || selectedProfileId);
      setMessage("✅ Routing profile switched successfully.");
    } catch (err) {
      console.error("Switch failed:", err);
      setMessage("❌ Failed to switch routing profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="switch-form">
      <p>
        <strong>Current Profile:</strong>{" "}
        {loading ? "Loading..." : currentProfileName || "Not Assigned"}
      </p>

      {loading && <div className="spinner" />}

      <select
        className="switch-dropdown"
        value={selectedProfileId}
        onChange={(e) => setSelectedProfileId(e.target.value)}
        disabled={loading}
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
          disabled={!selectedProfileId || loading}
        >
          {loading ? "Switching..." : "Change"}
        </button>
        <button className="switch-toggle" onClick={onClose} disabled={loading}>
          Cancel
        </button>
      </div>

      {message && <p className="switch-message">{message}</p>}
    </div>
  );
}
