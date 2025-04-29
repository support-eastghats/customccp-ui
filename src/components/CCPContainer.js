// src/components/CCPContainer.js
import React, { useEffect } from "react";
import 'amazon-connect-streams';

const CCPContainer = () => {
  useEffect(() => {
    const containerId = "ccp-container";

    if (window.connect) {
      window.connect.core.initCCP(document.getElementById(containerId), {
        ccpUrl: process.env.REACT_APP_CONNECT_CCP_URL,
        loginPopup: true,
        loginUrl: "https://accounts.google.com/o/saml2/initsso?idpid=C00j5cpqj&spid=257792497971&forceauthn=false&authuser=0",
        region: "eu-west-2",
        softphone: {
          allowFramedSoftphone: true,
          disableRingtone: false,
        },
      });
    } else {
      console.error('Amazon Connect Streams SDK not loaded');
    }
  }, []);

  return (
    <div>
      <h2>Amazon Connect Softphone</h2>
      <div id="ccp-container" style={{ height: "600px", width: "100%" }} />
    </div>
  );
};

export default CCPContainer;
