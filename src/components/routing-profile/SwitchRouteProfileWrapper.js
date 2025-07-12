import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SwitchRouteProfileSection from "./SwitchRouteProfileSection";
import "./SwitchRouteProfileWrapper.css";

const apiBase = process.env.REACT_APP_DISPURL;
const instanceId = process.env.REACT_APP_CONNECT_INSTANCE_ID;
console.log("Loaded env INSTANCE_ID:", instanceId);

export default function SwitchRouteProfileWrapper({ agent, apiKey, isCallActive }) {
  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentProfileName, setCurrentProfileName] = useState("");

  const fetchProfiles = useCallback(async () => {
    if (isCallActive) {
      setError("Cannot switch routing profile during a call.");
      return;
    }

    console.group("fetchProfiles() initiated");
    try {
      setLoading(true);
      setError("");

      const fullArn = agent?.getAgentARN?.();
      if (!fullArn || !fullArn.includes("agent/")) {
        setError("Agent not ready. Please wait...");
        return;
      }

      const userId = fullArn.split("/").pop();
      let finalInstanceId = instanceId;
      if (!finalInstanceId && fullArn.includes("/instance/")) {
        finalInstanceId = fullArn.split("/instance/")[1]?.split("/")[0];
      }

      const res = await axios.post(
        `${apiBase}/getAvailableRoutingProfiles`,
        { userId, instanceId: finalInstanceId },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
        }
      );

      const profiles = res.data.allowedProfiles || [];
      setAvailableProfiles(profiles);
      setShowForm(true);
    } catch (err) {
      console.error("fetchProfiles error:", err);
      setError("Failed to fetch routing profiles.");
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  }, [agent, apiKey, isCallActive]);

  const refreshCurrentProfile = useCallback(() => {
    if (window.connect) {
      window.connect.agent((freshAgent) => {
        const profileName = freshAgent?.getRoutingProfile()?.name || "Unavailable";
        setCurrentProfileName(profileName);
      });
    } else {
      console.warn("connect is not available yet");
    }
  }, []);  

  useEffect(() => {
    refreshCurrentProfile();
  }, [agent, refreshCurrentProfile]);

  return (
    <div className="switch-wrapper">
      <div className="current-profile">
        <span role="img" aria-label="user"></span> Current Routing Profile: <strong>{currentProfileName}</strong>
      </div>

      <button
        className="switch-toggle"
        onClick={fetchProfiles}
        disabled={loading || isCallActive}
      >
        <span role="img" aria-label="switch"></span> {loading ? "Loading..." : "Switch Routing Profile"}
      </button>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <SwitchRouteProfileSection
              agent={agent}
              apiKey={apiKey}
              availableProfiles={availableProfiles}
              onClose={() => setShowForm(false)}
              onProfileSwitched={() => {
                const connectCore = window.connect?.core;
              
                if (!connectCore) {
                  console.warn("Amazon Connect core not available. Skipping termination.");
                  return;
                }
              
                if (!isCallActive) {
                  console.log("Terminating connect.core before reload...");
                  connectCore.terminate();
              
                  // Delay reload to ensure CCP iframe is fully removed
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000); // Delay reload by 1 second
                } else {
                  alert("Profile switched. Reload will happen after call ends.");
                  sessionStorage.setItem("reloadAfterCall", "true");
                }
              }}             
              isCallActive={isCallActive}
            />
          </div>
        </div>
      )}

      {error && <p className="switch-error">{error}</p>}
    </div>
  );
}
