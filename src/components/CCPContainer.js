// src/components/CCPContainer.js
import React, { useEffect, useState } from "react";
import 'amazon-connect-streams';

const CCPContainer = () => {
  const [contact, setContact] = useState(null);
  const [agent, setAgent] = useState(null);

  const CONNECT_CCP_URL = process.env.REACT_APP_CONNECT_CCP_URL;
  const GOOGLE_SSO_URL = "https://accounts.google.com/o/saml2/initsso?idpid=C00j5cpqj&spid=257792497971&forceauthn=false&authuser=0";

  useEffect(() => {
    // Load hidden CCP iframe (will not render UI, just enable Streams SDK)
    window.connect.core.initCCP(document.getElementById("ccp-container"), {
      ccpUrl: CONNECT_CCP_URL,
      loginPopup: false,
      region: "eu-west-2",
      softphone: {
        allowFramedSoftphone: true,
        disableRingtone: false,
      },
    });

    // Check login state
    const checkLogin = setInterval(() => {
      const agent = window.connect?.agentApp?.getAgent();
      if (agent && agent.getState()) {
        console.log("Agent logged in via SSO");
        clearInterval(checkLogin);
        setAgent(agent);
      } else {
        // Not logged in — force SSO
        console.warn("Not authenticated — redirecting to SSO");
        window.location.href = GOOGLE_SSO_URL;
      }
    }, 1000);

    // Register contact listener
    window.connect.contact((newContact) => {
      console.log("New contact", newContact);
      setContact(newContact);
    });

    window.connect.agent((newAgent) => {
      console.log("Agent Info", newAgent);
      setAgent(newAgent);
    });
  }, []);

  return (
    <div>
      <h2>Custom Amazon Connect CCP</h2>
      <div id="ccp-container" style={{ display: "none" }} /> {/* Hidden iframe */}

      {contact ? (
        <div>
          <h3>Incoming Call</h3>
          <p>Caller ID: {contact.getAttributes()?.CallerId?.value || "Unknown"}</p>
          <button onClick={() => contact.accept()}>Accept</button>
          <button onClick={() => contact.reject()}>Reject</button>
          <button onClick={() => contact.destroy()}>End</button>
        </div>
      ) : (
        <p>No active call</p>
      )}

      {agent && (
        <div>
          <h4>Status: {agent.getState().name}</h4>
        </div>
      )}
    </div>
  );
};

export default CCPContainer;
