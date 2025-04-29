// src/components/CCPContainer.js
import React, { useEffect, useState } from "react";
import 'amazon-connect-streams';

const CCPContainer = () => {
  const [contact, setContact] = useState(null);
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    window.connect.core.initCCP(document.getElementById("ccp-container"), {
      ccpUrl: process.env.REACT_APP_CONNECT_CCP_URL, // No loginPopup, iframe only to initialize streams
      region: "eu-west-2",
      loginPopup: false,
      softphone: {
        allowFramedSoftphone: true,
        disableRingtone: false,
      },
    });

    window.connect.contact((newContact) => {
      console.log("New contact", newContact);
      setContact(newContact);
    });

    window.connect.agent((newAgent) => {
      console.log("Agent Info", newAgent);
      setAgent(newAgent);
    });
  }, []);

  const acceptCall = () => {
    if (contact) {
      contact.accept();
    }
  };

  const rejectCall = () => {
    if (contact) {
      contact.reject();
    }
  };

  const endCall = () => {
    if (contact) {
      contact.destroy();
    }
  };

  const muteCall = () => {
    if (contact && contact.getInitialConnection()) {
      contact.getInitialConnection().mute();
    }
  };

  const unmuteCall = () => {
    if (contact && contact.getInitialConnection()) {
      contact.getInitialConnection().unmute();
    }
  };

  return (
    <div>
      <h2>Custom Amazon Connect CCP</h2>
      <div id="ccp-container" style={{ display: "none" }} /> {/* Hide iframe */}
      
      {contact ? (
        <div>
          <h3>Incoming Call</h3>
          <p>Caller ID: {contact.getAttributes()?.CallerId?.value || "Unknown"}</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
          <button onClick={endCall}>End</button>
          <button onClick={muteCall}>Mute</button>
          <button onClick={unmuteCall}>Unmute</button>
        </div>
      ) : (
        <p>No incoming call</p>
      )}

      {agent ? (
        <div>
          <h4>Agent Status: {agent.getState().name}</h4>
        </div>
      ) : null}
    </div>
  );
};

export default CCPContainer;
