/* global connect */

import { Component } from 'react';
import React from 'react';
import 'amazon-connect-streams';
import SelcectElement from './SelectElement'
import axios from 'axios';
import './App.css';
import SwitchRouteProfileWrapper from './components/routing-profile/SwitchRouteProfileWrapper';

class CCP extends Component {
    constructor(props) {
        super(props);

        this.containerDiv = React.createRef();
        this.state = {
            mainDisplay: "",
            agent: null,
            contact: null,
            dispCodesLists: null,
            dispCodesListName: null,
            ccpApiKey: null,
            isDisabled: true,
            isResumeDisabled: true,
            pausecolor: '',
            resumecolor: '',
            pauseresumeDisplay: null,
            pauseresumeDisplayColor: '',
            ispauseDisplay: 'none',
            isresumeDisplay: 'none',
            direction:'',
            ismessageDisplay: true,
            ispauseCount: 0,
            ispausetimestamp: '',
            ispausetimestampCtr: '',
            isresumeCount: 0,
            isresumetimestamp: '',
            isresumetimestampCtr: '',
            ispausetimestampFinalCtr: '',
            isresumetimestampFinalCtr: '',
            pauseresumecontactId: '',
            ctrcontactid: '',
            ctrinstanceid: '',
            selectedRoutingProfile: '',
            showRouteProfileUI: false
        }



    }

    constructCCPApiKey = (ccpAttrVal) => {
        const tmpApiKey = process.env.REACT_APP_APIKEY;
        if (tmpApiKey && tmpApiKey.length === 20 && ccpAttrVal) {
          return tmpApiKey.slice(0, 10) + ccpAttrVal.slice(10, -10) + tmpApiKey.slice(-10);
        }
        return null;
      };      


    initCCP = () => {


        // eslint-disable-next-line no-undef
        connect.core.initCCP(this.containerDiv.current, {
            ccpUrl: process.env.REACT_APP_CCPURL,
            loginPopup: true,
            loginUrl: process.env.REACT_APP_LOGINURL,
            loginPopupAutoClose: true,
            region: process.env.REACT_APP_REGION,
            softphone: { allowFramedSoftphone: true },
            pageOptions: { enableAudioDeviceSettings: true }
        });
        

        // eslint-disable-next-line no-undef
        connect.core.onAuthFail(function () {
            console.log("onAuthFail");
        });

        // eslint-disable-next-line no-undef
        connect.core.onAccessDenied(function () {
            console.log("onAccessDenied");
        });

        // eslint-disable-next-line no-undef
        const eventBus = connect.core.getEventBus();
        // eslint-disable-next-line no-undef
        eventBus.subscribe(connect.EventType.TERMINATED, () => {
          console.log("Agent signed out");
        
          connect.core.terminate(); // ends internal stream handlers
          if (this.containerDiv.current) {
            this.containerDiv.current.innerHTML = ""; // remove iframe
          }
        
          this.setState({
            agent: null,
            contact: null,
            showRouteProfileUI: false,
            currentRoutingProfileName: "",
            mainDisplay: "",
            isDisabled: true,
            isResumeDisabled: true,
            // clear anything else needed
          });
        
          alert("Signed out of Amazon Connect.");
        });        

        // eslint-disable-next-line no-undef
        // This is called once the CCP successfully loads the agent after login
        connect.agent((agent) => {
          this.setState({
            agent,
            ccpApiKey: process.env.REACT_APP_APIKEY,  
            showRouteProfileUI: true
          });
          console.log("Agent loaded, API key set");

          // Optional: Handle agent state changes here if needed
          agent.onStateChange((agentStateChange) => {
            // console.log("Agent state changed:", agentStateChange.newState);
          });

          // Automatically run ACW timer if the attribute is present
          agent.onAfterCallWork(() => {
            if (this.state.contact) {
              let attributeMap = this.state.contact.getAttributes();
              console.log('ccpAcwTimer');
              console.log(attributeMap.ccpAcwTimer?.value);
              if (
                attributeMap &&
                attributeMap.ccpAcwTimer &&
                !isNaN(attributeMap.ccpAcwTimer.value)
              ) {
                this.startTimer(parseInt(attributeMap.ccpAcwTimer.value, 10));
              }
            }
          });

  // 👇 You can restore this if needed to control pause/resume buttons by routing profile
  // const routingProfileName = agent.getRoutingProfile().name;
  // console.log("Routing Profile:", routingProfileName);
  // if (routingProfileName === 'DAB Retail Agent - PauseResume') {
  //   this.setState({
  //     ispauseDisplay: 'block',
  //     isresumeDisplay: 'block'
  //   });
  // } else {
  //   this.setState({
  //     ispauseDisplay: 'none',
  //     isresumeDisplay: 'none'
  //   });
  // }
});

        // eslint-disable-next-line no-undef
        connect.contact((contact) => {
            this.setState({ contact });

            contact.onConnecting(async () => {
                let queue = contact.getQueue();
                let attributeMap = contact.getAttributes();
                this.updateMainDisplay(queue, attributeMap);

                if (attributeMap.dispCodeList && attributeMap.ccpApiKey && !this.state.dispCodesList) {
                    this.setState({ dispCodesTimestamp: new Date() })
                    console.log('onConnecting getDispCodeList', this.state.dispCodesList)
                    await this.getDispCodesList(attributeMap.ccpApiKey.value, attributeMap.dispCodeList.value);
                }

                //logic added for pause resume flow :
                const apiKey = process.env.REACT_APP_APIKEY;
                console.warn("🔧 [Dev Override] Using raw API key:", apiKey);

                console.log("Connected: constructed ccpApiKey", apiKey);
                console.log("Setting final ccpApiKey in state:", apiKey);
                this.setState({ ccpApiKey: apiKey }, () => {
                    // console.log("Final ccpApiKey in state (post setState):", this.state.ccpApiKey);
                });;
                this.setState({ isDisabled: false });
                this.setState({ isResumeDisabled: true });

            });

            contact.onRefresh(async () => {
                let queue = contact.getQueue();
                let attributeMap = contact.getAttributes();
                this.updateMainDisplay(queue, attributeMap);

                if (attributeMap.dispCodeList && attributeMap.ccpApiKey && !this.state.dispCodesList && !this.state.dispCodesTimestamp) {
                    console.log('onRefresh getDispCodeList', this.state.dispCodesList)
                    await this.getDispCodesList(attributeMap.ccpApiKey.value, attributeMap.dispCodeList.value);
                }

                let dispCodeSelected = [];
                Object.keys(attributeMap).forEach(attr => {
                    //if (attr.indexOf('DISPCODE') === 0)
                    if (attr === 'DISPCODE')
                        dispCodeSelected.push(attributeMap[attr].value);
                });
                if (dispCodeSelected.length > 0)
                    this.setState({ dispCodeSelected });

                console.log('onRefresh', dispCodeSelected);
            });

            contact.onAccepted(() => {
                let queue = contact.getQueue();
                let attributeMap = contact.getAttributes();
                this.updateMainDisplay(queue, attributeMap);
            });


            contact.onConnected(() => {
                // eslint-disable-next-line no-undef
                connect.agent((agent) => {
                  this.setState({ agent });
                
                  const profile = agent.getRoutingProfile();
                  const routingProfileName = profile?.name || "Unavailable";
                
                  console.log("Current Routing Profile:", routingProfileName);
                  console.log("Expected for visibility:", process.env.REACT_APP_ROUTEPROFILE);
                
                  // Save routing profile name in state
                  this.setState({ currentRoutingProfileName: routingProfileName });
                
                  // Define allowed profiles in one place
                  const profilesWithPauseResume = [
                    'DAB Retail Agent - PauseResume',
                    'SBG SG SE Other Queries',
                    'SBG SG SE Reactivations',
                    'Project1-Sales-Level1'
                  ];
                
                  // Conditional visibility
                  if (profilesWithPauseResume.includes(routingProfileName)) {
                    this.setState({
                      ispauseDisplay: 'block',
                      isresumeDisplay: 'block',
                      isDisabled: false
                    });
                  } else {
                    this.setState({
                      ispauseDisplay: 'none',
                      isresumeDisplay: 'none'
                    });
                  }
                });
                
              
                const queue = contact.getQueue();
                const attributeMap = contact.getAttributes();
                this.updateMainDisplay(queue, attributeMap);
              
                // Set ccpApiKey here!
                const apiKey = process.env.REACT_APP_APIKEY;
                console.warn("[Dev Override] Using raw API key:", apiKey);

                console.log("onConnected: constructed ccpApiKey", apiKey);
                console.log("Setting final ccpApiKey in state:", apiKey);
                this.setState({ ccpApiKey: apiKey }, () => {
                    // console.log("Final ccpApiKey in state (post setState):", this.state.ccpApiKey);
                });;
              
                try {
                  if (attributeMap.yodaUrlAddress && attributeMap.validUrlAddress)
                    if (attributeMap.validUrlAddress.value === "true")
                      this.props.handleOpenUrl(`${attributeMap.yodaUrlAddress.value}`);
                } catch (error) {
                  console.log(error);
                }
              });
              

              contact.onEnded(() => {
                const {
                  ispausetimestampFinalCtr,
                  isresumetimestampFinalCtr,
                  ctrcontactid,
                  ctrinstanceid
                } = this.state;
              
                // Ensure state updates are fully applied before calling the API
                this.setState({
                  mainDisplay: "",
                  isDisabled: true,
                  isResumeDisabled: true,
                  pauseresumeDisplay: '',
                  pausecolor: '',
                  resumecolor: '',
                  pauseresumeDisplayColor: '',
                  ispauseCount: 0,
                  isresumeCount: 0,
                  ispausetimestampCtr: null,
                  isresumetimestampCtr: null,
                  direction: '',
                  ispauseDisplay: 'none',
                  isresumeDisplay: 'none'
                }, async () => {
                  try {
                    const res = await this.setPauseResumeCtrRecords(
                      ispausetimestampFinalCtr,
                      isresumetimestampFinalCtr,
                      ctrcontactid,
                      ctrinstanceid
                    );
                    console.log('onEnded setPauseResumeCtrRecords res', res);
                  } catch (error) {
                    console.log('onEnded setPauseResumeCtrRecords error', error);
                  }
                });
              });
              

              contact.onDestroy(() => {
                const {
                  ispausetimestampFinalCtr,
                  isresumetimestampFinalCtr,
                  ctrcontactid,
                  ctrinstanceid
                } = this.state;

                if (sessionStorage.getItem("reloadAfterCall") === "true") {
                  console.log("Reloading after call end...");
                  sessionStorage.removeItem("reloadAfterCall");
              
                  try {
                    connect.core.terminate?.();
                  } catch (err) {
                    console.warn("Connect termination error:", err.message);
                  }
              
                  setTimeout(() => window.location.reload(), 300);
                }                
              
                this.setState({
                  dispCodesList: null,
                  dispCodeSelected: null,
                  currentContactId: null,
                  isDisabled: true,
                  isResumeDisabled: true,
                  pauseresumeDisplay: '',
                  pausecolor: '',
                  resumecolor: '',
                  pauseresumeDisplayColor: '',
                  ispauseCount: 0,
                  isresumeCount: 0,
                  ispausetimestampCtr: null,
                  isresumetimestampCtr: null,
                  direction: '',
                  ispauseDisplay: 'none',
                  isresumeDisplay: 'none'
                }, async () => {
                  try {
                    const res = await this.setPauseResumeCtrRecords(
                      ispausetimestampFinalCtr,
                      isresumetimestampFinalCtr,
                      ctrcontactid,
                      ctrinstanceid
                    );
                    console.log('onDestroy setPauseResumeCtrRecords res', res);
                  } catch (error) {
                    console.log('onDestroy setPauseResumeCtrRecords error', error);
                  }
              
                  // Now cleanup
                  this.setState({
                    ispausetimestampFinalCtr: '',
                    isresumetimestampFinalCtr: '',
                    ctrinstanceid: '',
                    ctrcontactid: ''
                  });
                });
              
                // If a timer was running, stop it
                if (this.timer) {
                  clearInterval(this.timer);
                  this.setState({ timerOn: false });
                }
              });              

            if (this.timer) {
                clearInterval(this.timer);
                this.setState({ timerOn: false });
            }
        });



    }

    componentDidMount() {
      // Open SSO Login URL in a new tab (first time only)
      if (!sessionStorage.getItem("ssoLaunched")) {
        window.open(process.env.REACT_APP_LOGINURL, "_blank");
        sessionStorage.setItem("ssoLaunched", "true");
      }
    
      // Delay CCP init slightly to ensure the iframe container div exists
      setTimeout(() => {
        if (this.containerDiv.current) {
          console.log("CCP container div is ready:", this.containerDiv.current);
          requestAnimationFrame(() => this.initCCP());
        } else {
          console.error("CCP container div is not ready!");
        }
      }, 500); // 👈 This ends the setTimeout properly
    }
       

    componentWillUnmount() {
      console.log("[CCP] componentWillUnmount() - cleaning up");
      try {
        if (window.connect?.core?.getAgent()) {
          window.connect.core.terminate();
          console.log("[CCP] connect.core.terminate() called");
        }
      } catch (err) {
        console.warn("[CCP] connect.core.terminate failed:", err.message);
      }
    }    

    handleLeavePage = () => {
        if (this.state.agent != null) {
            let agentConfig = this.state.agent ? this.state.agent.getConfiguration() : null;
            if (agentConfig) {
                let offlineState = agentConfig.agentStates.filter(state => state.name === "Offline");
                if (Array.isArray(offlineState) && offlineState.length > 0) {
                    this.state.agent.setState(offlineState[0], {
                        success: () => console.log("setState success"),
                        failure: () => console.log("setState failure")
                    })
                }
            }
        }
    }

    updateMainDisplay = (queue, attributeMap) => {
        let displayString = attributeMap.ccpPciSessionStatus ? queue.name ?
            `${queue.name} (PCI ${attributeMap.ccpPciSessionStatus.value})` :
            `(PCI ${attributeMap.ccpPciSessionStatus.value})` : queue.name ? queue.name : ""
        this.setState({ mainDisplay: displayString });
    }


    setPauseApiCallControl = async (contactId, instanceId) => {
        // console.log("setPauseApiCallControl - ccpApiKey:", this.state.ccpApiKey);
      
        if (this.state.ccpApiKey) {
          const payload = { contactId, instanceId };
      
          const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.state.ccpApiKey
          };
      
          try {
            const res = await axios.post(`${process.env.REACT_APP_DISPURL}/setpause`, payload, { headers });
            console.log('setPauseApiCallControl res', res);
          } catch (error) {
            console.error('setPauseApiCallControl error', error?.response?.data || error.message);
          }
        } else {
          console.warn("ccpApiKey is missing — API call skipped.");
        }
      };      
      

      setResumeApiCallControl = async (contactId, instanceId) => {
        // console.log("setResumeApiCallControl - ccpApiKey:", this.state.ccpApiKey);
      
        if (this.state.ccpApiKey) {
          const payload = { contactId, instanceId };
      
          const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.state.ccpApiKey
          };
      
          try {
            const res = await axios.post(`${process.env.REACT_APP_DISPURL}/setresume`, payload, { headers });
            console.log('setResumeApiCallControl res', res);
          } catch (error) {
            console.log('setResumeApiCallControl error', error?.response?.data || error.message);
          }
        } else {
          console.warn("ccpApiKey is missing — API call skipped.");
        }
      };            


    getDispCodesList = async (ccpApiKey, dispCodesListName) => {
        console.log('getDispCodeList', dispCodesListName);
        let tmpApiKey = process.env.REACT_APP_APIKEY && process.env.REACT_APP_APIKEY.length === 20 ? process.env.REACT_APP_APIKEY : null;
        let apiKey = tmpApiKey ? tmpApiKey.slice(0, 10) + ccpApiKey.slice(10, -10) + tmpApiKey.slice(-10) : null;
        if (apiKey) {
            const headers = {
                'Content-Type': 'application/json',
                'x-api-key': apiKey//'7KFWWEN96G1iunOcICpT56UVtH1Mbcty65B0Mbbj'
            }
            let res;
            try {
                res = await axios.get(`${process.env.REACT_APP_DISPURL}/getdispcodelist/${dispCodesListName}`, { headers })
            } catch (error) {
                console.log(error);
            }
            console.log('getDispCodeList res', res);
            if (res && res.data && res.data.Item) {
                this.setState({ dispCodesList: res.data.Item });
                console.log('getDispCodesList state', this.state);
                console.log("Setting final ccpApiKey in state:", apiKey);
                this.setState({ ccpApiKey: apiKey }, () => {
                    // console.log("Final ccpApiKey in state (post setState):", this.state.ccpApiKey);
                });;
            }
        }

    }

    setDispCode = async (dispCodeName, dispCodeVal, instanceId, contactId) => {
        let res;
        if (this.state.ccpApiKey) {
          const payload = { dispCodeName, dispCodeVal, instanceId, contactId };
      
          const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.state.ccpApiKey
          };
      
          try {
            res = await axios.put(`${process.env.REACT_APP_DISPURL}/setdispcodeattr`, payload, { headers });
            console.log('setDispCode res', res);
          } catch (error) {
            console.log('setDispCode error', error?.response?.data || error.message);
          }
        }
        return res;
      };
      

      setPauseResumeCtrRecords = async (pauseCtrData, resumeCtrData, contactId, instanceId) => {
        let res;
        if (this.state.ccpApiKey) {
          const payload = { pauseCtrData, resumeCtrData, contactId, instanceId };  
      
          const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.state.ccpApiKey
          };
      
          try {
            res = await axios.put(`${process.env.REACT_APP_DISPURL}/setpauseresumeattr`, payload, { headers });
            console.log('setPauseResumeCtrRecords res', res);
          } catch (error) {
            console.log('setPauseResumeCtrRecords error', error?.response?.data || error.message);
          }
        }
        return res;
      };
      

    handleDispCodesSelectChange = async (e) => {
        console.log('handleDispCodesSelectChange');

        if (!this.state.dispCodeSelected || this.state.dispCodeSelected.indexOf(e.target.innerText) === -1) {
            let contactId = this.state.contact ? this.state.contact.getContactId() : null;
            let agentRoutingProfile = this.state.agent ? this.state.agent.getRoutingProfile() : null;
            let rpArnArr = agentRoutingProfile && agentRoutingProfile.routingProfileARN ? agentRoutingProfile.routingProfileARN.split('/') : null;
            let instanceId = rpArnArr && Array.isArray(rpArnArr) && rpArnArr.length === 4 ? rpArnArr[1] : null;
            try {
                let res = await this.setDispCode(e.target.id, e.target.innerText, instanceId, contactId);
                console.log('handleDispCodesSelectChange res', res);

            } catch (error) {
                console.log('handleDispCodesSelectChange error', error);
            }
        }
    }

    handlePauseButtonChangeColor = (newColor) => {
        if (this.state.ismessageDisplay === false) {
            this.setState({ pausecolor: '#d3660c' });
            this.setState({ pauseresumeDisplayColor: '' });
            this.setState({ pauseresumeDisplay: '' });
        }
        else {
            this.setState({ pausecolor: newColor })
            this.setState({ pauseresumeDisplayColor: newColor });
            this.setState({ pauseresumeDisplay: process.env.REACT_APP_PAUSEWARNMESSAGE });
        }
    }

    handlePauseButtonSelectChange = async (e) => {
        this.setState({ pauseresumeDisplay: process.env.REACT_APP_PAUSEMESSAGE });
        this.setState({ isDisabled: true });
        this.setState({ isResumeDisabled: false });
        this.setState({ pausecolor: '#ffc61a' })
        this.setState({ pauseresumeDisplayColor: '#ffc61a' });
        this.setState({ ismessageDisplay: true });
        console.log("handle pause button")
        let contactId = this.state.contact ? this.state.contact.getContactId() : null;
        let agentRoutingProfile = this.state.agent ? this.state.agent.getRoutingProfile() : null;
        let rpArnArr = agentRoutingProfile && agentRoutingProfile.routingProfileARN ? agentRoutingProfile.routingProfileARN.split('/') : null;
        let instanceId = rpArnArr && Array.isArray(rpArnArr) && rpArnArr.length === 4 ? rpArnArr[1] : null;
        this.setState({ ctrcontactid: contactId });
        this.setState({ ctrinstanceid: instanceId });
        try {
            let res = await this.setPauseApiCallControl(contactId, instanceId);
            console.log('handlePauseButtonSelectChange res', res);

        } catch (error) {
            console.log('handlePauseButtonSelectChange error', error);
        }

        this.timer = setTimeout(
            () => this.handlePauseButtonChangeColor('red'),
            1000 * parseInt(process.env.REACT_APP_PAUSETIMEOUT) // in milliseconds, 10s for fast show           
        )

        let tmpPausecount = this.state.ispauseCount;
        this.setState({ ispauseCount: tmpPausecount + 1 })
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        const currentPauseDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
        console.log(currentPauseDate);
        //let currentPauseDate = new Date().toLocaleString();
        this.setState({ ispausetimestamp: currentPauseDate });
        let tmpispausetimestampCtr = "Pause " + this.state.ispauseCount + " " + currentPauseDate + ",";
        this.setState({ ispausetimestampCtr: tmpispausetimestampCtr })
        this.setState({ ispausetimestampFinalCtr: this.state.ispausetimestampFinalCtr + this.state.ispausetimestampCtr })
        console.log('Pause FINAL CTR' + this.state.ispausetimestampFinalCtr);
    }

    handleResumeButtonChangeColor = (newColor) => {
        this.setState({ pausecolor: '#d3660c' });
        this.setState({ pauseresumeDisplayColor: '' });
        this.setState({ pauseresumeDisplay: '' });
    }

    handleRouteProfileChange = (e) => {
        const newProfile = e.target.value;
        this.setState({ selectedRoutingProfile: newProfile });
      
        const { agent } = this.state;
        if (agent) {
          const allStates = agent.getAgentStates();
          const offlineState = allStates.find((state) => state.name === 'Offline');
      
          // This is optional: force offline before changing profiles, if your app logic allows it
          if (offlineState) {
            agent.setState(offlineState, {
              success: () => {
                console.log('Switched to Offline to prepare profile switch.');
                // Add any additional handling if needed
              },
              failure: () => console.log('Failed to switch to Offline')
            });
          }
        }
      
        // (Optional) Show/hide pause/resume buttons immediately
        const showButtons = [
          'DAB Retail Agent - PauseResume',
          'SBG SG SE Other Queries',
          'SBG SG SE Reactivations',
          'Project1-Sales-Level1'
        ].includes(newProfile);
      
        this.setState({
          ispauseDisplay: showButtons ? 'block' : 'none',
          isresumeDisplay: showButtons ? 'block' : 'none'
        });
      };      

    handleResumeButtonSelectChange = async (e) => {
        this.setState({ isDisabled: false });
        this.setState({ isResumeDisabled: true });
        this.setState({ ismessageDisplay: false });
        this.setState({ pauseresumeDisplay: process.env.REACT_APP_RESUMEMESSAGE });
        this.setState({ pauseresumeDisplayColor: '#5cd30c' });

        let contactId = this.state.contact ? this.state.contact.getContactId() : null;
        let agentRoutingProfile = this.state.agent ? this.state.agent.getRoutingProfile() : null;
        let rpArnArr = agentRoutingProfile && agentRoutingProfile.routingProfileARN ? agentRoutingProfile.routingProfileARN.split('/') : null;
        let instanceId = rpArnArr && Array.isArray(rpArnArr) && rpArnArr.length === 4 ? rpArnArr[1] : null;
        this.setState({ ctrcontactid: contactId });
        this.setState({ ctrinstanceid: instanceId });
        try {
            let res = await this.setResumeApiCallControl(contactId, instanceId);
            console.log('handleResumeButtonSelectChange res', res);
        } catch (error) {
            console.log('handleResumeButtonSelectChange error', error);
        }
        this.timer = setTimeout(
            () => this.handleResumeButtonChangeColor(''),
            1000 * parseInt(process.env.REACT_APP_PAUSETIMEOUT) // in milliseconds, 10s for fast show           
        )

        let tmprescount = this.state.isresumeCount;
        this.setState({ isresumeCount: tmprescount + 1 })
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const hours = String(now.getUTCHours()).padStart(2, '0');
        const minutes = String(now.getUTCMinutes()).padStart(2, '0');
        const seconds = String(now.getUTCSeconds()).padStart(2, '0');
        const currentResumeDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
        //let currentResumeDate = new Date().toLocaleString();
        console.log(currentResumeDate)
        this.setState({ isresumetimestamp: currentResumeDate });
        let tmpisresumetimestampCtr = "Resume " + this.state.isresumeCount + " " + currentResumeDate + ",";
        this.setState({ isresumetimestampCtr: tmpisresumetimestampCtr })
        this.setState({ isresumetimestampFinalCtr: this.state.isresumetimestampFinalCtr + this.state.isresumetimestampCtr })
        console.log('Resume FINAL CTR', this.state.isresumetimestampFinalCtr);

    }

    startTimer = (theTime) => {
        this.setState({
            timerOn: true,
            timerTime: theTime
        });
        this.timer = setInterval(() => {
            const newTime = this.state.timerTime - 1;
            if (newTime >= 0) {
                this.setState({
                    timerTime: newTime
                });
            } else {
                clearInterval(this.timer);
                this.setState({ timerOn: false });
            }
        }, 1000);
    };

    render() {
      return (
        <div className="ccpContainerInner">
          
          {/* Routing Profile Switch (Top Bar) */}
          <div className="routeProfileBar">
            {this.state.agent && (
              <SwitchRouteProfileWrapper
              agent={this.state.agent}
              apiKey={this.state.ccpApiKey}
              isCallActive={!!this.state.contact}
            />            
            )}
          </div>
    
          {/* Pause/Resume Bar (Middle) */}
          <div className="pauseResumeBar">
            <button className="openbtn" onClick={this.props.handleOpenCloseSidePanel}>☰</button>
    
            <button
              className="btnpause"
              onClick={this.handlePauseButtonSelectChange}
              disabled={this.state.isDisabled}
              style={{
                display: this.state.ispauseDisplay,
                background: this.state.pausecolor
              }}
            >
              Pause Recording
            </button>
    
            <button
              className="btnresume"
              onClick={this.handleResumeButtonSelectChange}
              disabled={this.state.isResumeDisabled}
              style={{
                display: this.state.isresumeDisplay,
                background: this.state.resumecolor
              }}
            >
              Resume Recording
            </button>
    
            <input
              className="maindisplay"
              value={this.state.mainDisplay}
              readOnly
            />
    
            <input
              className="pauseresumebtn"
              value={this.state.pauseresumeDisplay}
              style={{ background: this.state.pauseresumeDisplayColor }}
              readOnly
            />
    
            {this.state.dispCodesList && (
              <div className="dispcodesdropdown" style={{ float: 'right' }}>
                <button
                  className="dispcodesdropbtn"
                  style={{
                    backgroundColor:
                      this.state.timerOn &&
                      this.state.timerTime &&
                      !this.state.dispCodeSelected
                        ? 'red'
                        : ''
                  }}
                >
                  <div style={{ display: 'flex' }}>
                    {this.state.timerOn && this.state.timerTime && (
                      <div style={{ width: '30px' }}>{this.state.timerTime}</div>
                    )}
                    <div>{this.state.dispCodesList.dispCodesList}</div>
                  </div>
                </button>
    
                <SelcectElement
                  dispCodesList={this.state.dispCodesList}
                  handleDispCodesSelectChange={this.handleDispCodesSelectChange}
                  dispCodeSelected={this.state.dispCodeSelected}
                />
              </div>
            )}
          </div>
    
          {/* CCP iframe container (Bottom) */}
          <div className="ccpElement" ref={this.containerDiv} />
        </div>
      );
    }
        
}

export default CCP;