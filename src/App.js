// src/App.js
import React, { useState } from "react";
import CCPContainer from "./components/CCPContainer";

function App() {
  const [agentInfo, setAgentInfo] = useState(null);
  const [error, setError] = useState("");

  const handleAgentReady = (info) => {
    console.log("📲 Agent Ready:", info);
    setAgentInfo(info);
  };

  const handleCcpError = (err) => {
    console.error("🛑 CCP Error:", err);
    setError(err);
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial" }}>
      <h1>Amazon Connect Custom CCP</h1>

      {error && (
        <div style={{ color: "red", fontWeight: "bold", marginBottom: "1rem" }}>
          ⚠️ Error: {error}
        </div>
      )}

      {!agentInfo ? (
        <p>Waiting for agent to authenticate via Google SSO...</p>
      ) : (
        <div style={{ marginBottom: "1rem" }}>
          <h3>👤 Agent Info</h3>
          <ul>
            <li><strong>Name:</strong> {agentInfo.name}</li>
            <li><strong>Username:</strong> {agentInfo.username}</li>
            <li><strong>User ID:</strong> {agentInfo.userId}</li>
            <li><strong>Routing Profile:</strong> {agentInfo.routingProfile}</li>
          </ul>
        </div>
      )}

      <CCPContainer onAgentReady={handleAgentReady} onCcpError={handleCcpError} />
    </div>
  );
}

export default App;
