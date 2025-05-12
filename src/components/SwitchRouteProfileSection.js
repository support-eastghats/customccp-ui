import { useState } from "react";
import axios from "axios";
import "./SwitchRouteProfileSection.css";

export default function SwitchRouteProfileSection({ agent, apiKey }) {
  const [showForm, setShowForm] = useState(false);
  const [currentProfile, setCurrentProfile] = useState("");
  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const instanceId = process.env.REACT_APP_CONNECT_INSTANCE_ID;
  const apiBase = process.env.REACT_APP_DISPURL;

  const fetchRoutingProfiles = async () => {
    try {
      if (!agent || !agent.getUsername) {
        console.warn("⚠️ Agent not ready in fetchRoutingProfiles");
        return;
      }

      const userId = agent.getUsername();
      console.log("📤 Fetching routing profiles for user:", userId);

      const res = await axios.post(
        `${apiBase}/getAvailableRoutingProfiles`,
        { userId, instanceId },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
        }
      );

      console.log("✅ Routing profiles fetched:", res.data);
      setCurrentProfile(res.data.currentProfile);
      setAvailableProfiles(res.data.allowedProfiles);
    } catch (err) {
      console.error("❌ Error fetching profiles:", err);
      setMessage("Failed to load profiles");
    }
  };

  const handleSwitch = async () => {
    if (!selectedProfileId) return;

    setLoading(true);
    setMessage("");

    const payload = {
      userId: agent?.getUsername(),
      instanceId,
      routingProfileId: selectedProfileId,
    };

    console.log("📤 Switching routing profile with:", payload);

    try {
      const res = await axios.post(`${apiBase}/switchRoutingProfile`, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      });

      console.log("✅ Profile switched:", res.data);
      setMessage("✅ Routing profile switched successfully!");
    } catch (err) {
      console.error("❌ Switch failed:", err.response?.data || err.message);
      setMessage("❌ Failed to switch routing profile");
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    if (!showForm) fetchRoutingProfiles();
    setShowForm(!showForm);
  };

  return (
    <div className="switch-container">
      <button className="switch-toggle" onClick={toggleForm}>
        {showForm ? "Cancel" : "Switch Routing Profile"}
      </button>

      {showForm && (
        <div className="switch-form">
          <p>
            <strong>Current Profile:</strong>{" "}
            {currentProfile || "Loading..."}
          </p>

          <select
            className="switch-dropdown"
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
          >
            <option value="">-- Select Routing Profile --</option>
            {availableProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>

          <button
            className="switch-submit"
            onClick={handleSwitch}
            disabled={!selectedProfileId || loading}
          >
            {loading ? "Changing..." : "Change"}
          </button>

          {message && <p className="switch-message">{message}</p>}
        </div>
      )}
    </div>
  );
}
