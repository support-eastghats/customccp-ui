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
          ccpUrl: process.env.REACT_APP_CCPURL,
          loginPopup: true,
          loginUrl: process.env.REACT_APP_LOGINURL,
          loginPopupAutoClose: true,
          region: process.env.REACT_APP_REGION,
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
