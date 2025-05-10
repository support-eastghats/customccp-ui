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

        window.connect.agent(agent => {
          setAgent(agent);
        });

        window.connect.contact(contact => {
          setContact(contact);

          contact.onConnected(() => {
            const attr = contact.getAttributes();
            const queue = contact.getQueue();
            setMainDisplay(queue?.name || "");

            const rawKey = attr?.ccpApiKey?.value;
            const tmpKey = process.env.REACT_APP_APIKEY;
            if (rawKey && tmpKey && tmpKey.length === 20) {
              const mergedKey = tmpKey.slice(0, 10) + rawKey.slice(10, -10) + tmpKey.slice(-10);
              setApiKey(mergedKey);
            }

            setIsDisabled(false);
            setIsResumeDisabled(true);
            setErrorMessage("");
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

  const sendPauseResumeRecords = async () => {
    const instanceId = getInstanceId();
    const contactId = contact?.getContactId();
    if (apiKey && pauseTimestamps.length && resumeTimestamps.length && contactId && instanceId) {
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
              "x-api-key": apiKey
            }
          }
        );
      } catch (error) {
        console.error("Failed to record pause/resume:", error);
      }
    }
  };

  const getInstanceId = () => {
    const arn = agent?.getRoutingProfile()?.routingProfileARN;
    return arn?.split("/")[1] || process.env.REACT_APP_CONNECT_INSTANCE_ID;
  };

  const handlePause = async () => {
    setIsDisabled(true);
    setIsResumeDisabled(false);
    setErrorMessage("");

    const contactId = contact?.getContactId();
    const instanceId = getInstanceId();
    if (!contactId || !instanceId) {
      setErrorMessage("Missing contactId or instanceId");
      return;
    }

    const now = new Date().toISOString();
    setPauseTimestamps(prev => [...prev, `Pause ${now}`]);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_DISPURL}/setpause`,
        { contactId, instanceId, ensureStarted: true },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
          }
        }
      );
      console.log("Pause success:", response.data);
    } catch (error) {
      const reason = error?.response?.data?.details || error.message;
      setErrorMessage(`Pause failed: ${reason}`);
      console.error("Pause error:", reason);
    }
  };

  const handleResume = async () => {
    setIsDisabled(false);
    setIsResumeDisabled(true);
    setErrorMessage("");

    const contactId = contact?.getContactId();
    const instanceId = getInstanceId();
    if (!contactId || !instanceId) {
      setErrorMessage("Missing contactId or instanceId");
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
            "x-api-key": apiKey
          }
        }
      );
      console.log("Resume success:", response.data);
    } catch (error) {
      const reason = error?.response?.data?.details || error.message;
      setErrorMessage(`Resume failed: ${reason}`);
      console.error("Resume error:", reason);
    }
  };

  const resetState = () => {
    setIsDisabled(true);
    setIsResumeDisabled(true);
    setPauseTimestamps([]);
    setResumeTimestamps([]);
    setMainDisplay("");
    setErrorMessage("");
  };

  return (
    <div>
      <h2>Amazon Connect CCP</h2>
      <div>
        <button onClick={handlePause} disabled={isDisabled}>
          Pause Recording
        </button>
        <button onClick={handleResume} disabled={isResumeDisabled}>
          Resume Recording
        </button>
        <input value={mainDisplay} readOnly />
        {errorMessage && <p style={{ color: "red", marginTop: "8px" }}>{errorMessage}</p>}
      </div>
      <div
        id="ccp-container"
        ref={containerRef}
        style={{ width: "400px", height: "600px", border: "1px solid #ccc" }}
      />
    </div>
  );
}
