import React, { useEffect, useState } from "react";
import 'amazon-connect-streams';

const CCPContainer = () => {
  const [contact, setContact] = useState(null);
  const [agent, setAgent] = useState(null);

  const LOCAL_CCP_URL = `${window.location.origin}/custom-ccp.html`;
  const GOOGLE_SSO_URL = "https://accounts.google.com/o/saml2/initsso?idpid=C00j5cpqj&spid=257792497971&forceauthn=false&authuser=0";

  useEffect(() => {
    window.connect.core.initCCP(document.getElementById("ccp-container"), {
      ccpUrl: `${window.location.origin}/custom-ccp.html`,
      loginPopup: true, // ← enables Google SSO popup
      loginPopupAutoClose: true, // ← closes the popup once login finishes
      region: "eu-west-2",
      softphone: {
        allowFramedSoftphone: true,
        disableRingtone: false,
      },
    });

    window.connect.agent((newAgent) => {
      console.log("Agent Info", newAgent);
      setAgent(newAgent);
    });

    window.connect.contact((newContact) => {
      console.log("New contact", newContact);
      setContact(newContact);
    });
  }, []);

  return (
    <div>
      <h2>Custom Amazon Connect CCP</h2>
      <div id="ccp-container" style={{ display: "none" }} />

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
