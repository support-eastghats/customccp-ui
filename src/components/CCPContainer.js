import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./CCPContainer.css";

export default function CCPContainer({ setAgent, setApiKey }) {
  const containerRef = useRef(null);
  const [contact, setContact] = useState(null);
  const [mainDisplay, setMainDisplay] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [isResumeDisabled, setIsResumeDisabled] = useState(true);
  const [pauseTimestamps, setPauseTimestamps] = useState([]);
  const [resumeTimestamps, setResumeTimestamps] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/connect-streams-min.js";
    script.async = true;

    script.onload = () => {
      if (window.connect?.core) {
        window.connect.core.initCCP(containerRef.current, {
          ccpUrl: process.env.REACT_APP_CCPURL,
          loginPopup: true,
          loginUrl: process.env.REACT_APP_LOGINURL,
          loginPopupAutoClose: true,
          region: process.env.REACT_APP_REGION,
          softphone: { allowFramedSoftphone: true },
          pageOptions: { enableAudioDeviceSettings: true }
        });

        const pollAgent = setInterval(() => {
          const ccpAgent = window.connect.agent?.();
          if (ccpAgent) {
            setAgent(ccpAgent);
            clearInterval(pollAgent);
          }
        }, 1000);

        window.connect.contact((contact) => {
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
              localStorage.setItem("connectApiKey", mergedKey);
            } else {
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
  }, [setAgent, setApiKey]);

  const getInstanceId = () => {
    const arn = window.connect.agent?.()?.getRoutingProfile()?.routingProfileARN;
    return arn?.split("/")[1] || process.env.REACT_APP_CONNECT_INSTANCE_ID;
  };

  const sendPauseResumeRecords = async () => {
    const instanceId = getInstanceId();
    const contactId = contact?.getContactId();
    const key = localStorage.getItem("connectApiKey");

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
    const key = localStorage.getItem("connectApiKey");

    if (!contactId || !instanceId) {
      setErrorMessage("Missing contactId or instanceId");
      setLoading(false);
      return;
    }

    const now = new Date().toISOString();
    setPauseTimestamps(prev => [...prev, `Pause ${now}`]);

    try {
      await axios.post(
        `${process.env.REACT_APP_DISPURL}/setpause`,
        { contactId, instanceId },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key
          }
        }
      );
      setSuccessMessage("Recording paused successfully.");
    } catch (error) {
      const reason = error?.response?.data?.details || error.message;
      setErrorMessage(`Pause failed: ${reason}`);
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
    const key = localStorage.getItem("connectApiKey");

    if (!contactId || !instanceId) {
      setErrorMessage("Missing contactId or instanceId");
      setLoading(false);
      return;
    }

    const now = new Date().toISOString();
    setResumeTimestamps(prev => [...prev, `Resume ${now}`]);

    try {
      await axios.post(
        `${process.env.REACT_APP_DISPURL}/setresume`,
        { contactId, instanceId },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key
          }
        }
      );
      setSuccessMessage("Recording resumed successfully.");
    } catch (error) {
      const reason = error?.response?.data?.details || error.message;
      setErrorMessage(`Resume failed: ${reason}`);
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
    <div className="ccp-container">
      <div className="ccp-buttons">
        <button onClick={handlePause} disabled={isDisabled || loading}>
          {loading && isDisabled ? "Pausing..." : "Pause Recording"}
        </button>
        <button onClick={handleResume} disabled={isResumeDisabled || loading}>
          {loading && isResumeDisabled ? "Resuming..." : "Resume Recording"}
        </button>
      </div>
      <input value={mainDisplay} readOnly className="queue-display" />
      {errorMessage && <p className="error-msg">{errorMessage}</p>}
      {successMessage && <p className="success-msg">{successMessage}</p>}
      <div id="ccp-container" ref={containerRef} className="softphone-frame" />
    </div>
  );
}
