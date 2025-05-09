import { useEffect } from "react";

let initialized = false;

export default function CCPContainer() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;

    const script = document.createElement("script");
    script.src = "/connect-streams-min.js";
    script.async = true;

    script.onload = () => {
      if (window.connect && window.connect.core) {
        window.connect.core.initCCP(document.getElementById("ccp-container"), {
          ccpUrl: "https://eastghats-dev.my.connect.aws/ccp-v2/",
          loginPopup: true,
          loginUrl: "https://accounts.google.com/o/saml2/initsso?idpid=C00j5cpqj&spid=257792497971&forceauthn=false",
          loginPopupAutoClose: true,
          region: "eu-west-2",
          softphone: {
            allowFramedSoftphone: true
          }
        });
      } else {
        console.error("Amazon Connect not available.");
      }
    };

    document.body.appendChild(script);
  }, []);


  return (
    <div>
      <h2>Amazon Connect CCP</h2>
      <div id="ccp-container" style={{ width: "400px", height: "600px", border: "1px solid #ccc" }}></div>
    </div>
  );
}
