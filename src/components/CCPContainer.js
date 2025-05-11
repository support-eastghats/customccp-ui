/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function CCPContainer() {
  const containerRef = useRef(null);
  const [agent, setAgent] = useState(null);
  const [contact, setContact] = useState(null);
  const [mainDisplay, setMainDisplay] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [isResumeDisabled, setIsResumeDisabled] = useState(true);
  const [pauseTimestamps, setPauseTimestamps] = useState([]);
  const [resumeTimestamps, setResumeTimestamps] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/connect-streams-min.js";
    script.async = true;

    script.onload = () => {
      if (window.connect && window.connect.core) {
        window.connect.core.initCCP(containerRef.current, {
          ccpUrl: process.env.REACT_APP_CCPURL,
          loginPopup: true,
          loginUrl: process.env.REACT_APP_LOGINURL,
          loginPopupAutoClose: true,
          region: process.env.REACT_APP_REGION,
          softphone: { allowFramedSoftphone: true },
          pageOptions: { enableAudioDeviceSettings: true }
        });

        window.connect.agent(agent => setAgent(agent));

        window.connect.contact(contact => {
          setContact(contact);

          contact.onConnected(() => {
            const attr = contact.getAttributes();
            const queue = contact.getQueue();
            setMainDisplay(queue?.name || "");

            const rawKey = attr?.ccpApiKey?.value;
            const tmpKey = process.env.REACT_APP_APIKEY;
            console.log("🔑 Raw Key from contact attributes:", rawKey);
            console.log("🔑 TMP Key from env:", tmpKey);

            if (rawKey && tmpKey && tmpKey.length === 20) {
              const mergedKey = tmpKey.slice(0, 10) + rawKey.slice(10, -10) + tmpKey.slice(-10);
              console.log("✅ Final API Key:", mergedKey);
              setApiKey(mergedKey);
              localStorage.setItem("connectApiKey", mergedKey);
            } else {
              console.warn("⚠️ Using fallback API key from env");
              setApiKey(tmpKey);
              localStorage.setItem("connectApiKey", tmpKey);
            }

            setIsDisabled(false);
            setIsResumeDisabled(true);
            setErrorMessage("");
            setSuccessMessage("");
          });

          contact.onEnded(() => {
            sendPauseResumeRecords();
            resetState();
          });
        });
      }
    };

    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  const getInstanceId = () => {
    const arn = agent?.getRoutingProfile()?.routingProfileARN;
    return arn?.split("/")[1] || process.env.REACT_APP_CONNECT_INSTANCE_ID;
  };

  const sendPauseResumeRecords = async () => {
    const instanceId = getInstanceId();
    const contactId = contact?.getContactId();
    const key = apiKey || localStorage.getItem("connectApiKey");
    console.log("📤 Using API Key for setpauseresumeattr:", key);

    if (key && pauseTimestamps.length && resumeTimestamps.length && contactId && instanceId) {
      try {
        await axios.put(
          `${process.env.REACT_APP_DISPURL}/setpauseresumeattr`,
          {
            pauseCtrData: pauseTimestamps.join(", "),
            resumeCtrData: resumeTimestamps.join(", "),
            contactId,
            instanceId
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": key
            }
          }
        );
      } catch (error) {
        console.error("Failed to record pause/resume:", error);
      }
    }
  };

  const handlePause = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setIsDisabled(true);
    setIsResumeDisabled(false);

    const contactId = contact?.getContactId();
    const instanceId = getInstanceId();
    const key = apiKey || localStorage.getItem("connectApiKey");
    console.log("📤 Using API Key for setpause:", key);

    if (!contactId || !instanceId) {
      setErrorMessage("Missing contactId or instanceId");
      setLoading(false);
      return;
    }

    const now = new Date().toISOString();
    setPauseTimestamps(prev => [...prev, `Pause ${now}`]);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_DISPURL}/setpause`,
        { contactId, instanceId },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key
          }
        }
      );
      console.log("Pause success:", response.data);
      setSuccessMessage("Recording paused successfully.");
    } catch (error) {
      const reason = error?.response?.data?.details || error.message;
      setErrorMessage(`Pause failed: ${reason}`);
      console.error("Pause error:", reason);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setIsDisabled(false);
    setIsResumeDisabled(true);

    const contactId = contact?.getContactId();
    const instanceId = getInstanceId();
    const key = apiKey || localStorage.getItem("connectApiKey");
    console.log("📤 Using API Key for setresume:", key);

    if (!contactId || !instanceId) {
      setErrorMessage("Missing contactId or instanceId");
      setLoading(false);
      return;
    }

    const now = new Date().toISOString();
    setResumeTimestamps(prev => [...prev, `Resume ${now}`]);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_DISPURL}/setresume`,
        { contactId, instanceId },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key
          }
        }
      );
      console.log("Resume success:", response.data);
      setSuccessMessage("Recording resumed successfully.");
    } catch (error) {
      const reason = error?.response?.data?.details || error.message;
      setErrorMessage(`Resume failed: ${reason}`);
      console.error("Resume error:", reason);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setIsDisabled(true);
    setIsResumeDisabled(true);
    setPauseTimestamps([]);
    setResumeTimestamps([]);
    setMainDisplay("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div>
      <h2>Amazon Connect CCP</h2>
      <div>
        <button onClick={handlePause} disabled={isDisabled || loading}>
          {loading && isDisabled ? "Pausing..." : "Pause Recording"}
        </button>
        <button onClick={handleResume} disabled={isResumeDisabled || loading}>
          {loading && isResumeDisabled ? "Resuming..." : "Resume Recording"}
        </button>
        <input value={mainDisplay} readOnly />
        {errorMessage && <p style={{ color: "red", marginTop: "8px" }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: "green", marginTop: "8px" }}>{successMessage}</p>}
      </div>
      <div
        id="ccp-container"
        ref={containerRef}
        style={{ width: "400px", height: "600px", border: "1px solid #ccc" }}
      />
    </div>
  );
}
