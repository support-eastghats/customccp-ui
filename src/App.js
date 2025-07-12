import CCP from './ccp';
import './App.css';
import { Component } from "react";
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      src: "about:blank",
      urlhandle: 0,
      closeCCP: false,
      srcInput: "about:blank",
      sidePanelOpen: false
    }
  }

  handleOpenUrl = (url) => {
    console.log('urlAddress', url);
    let urlsrc = url !== "" ? url.toLowerCase().indexOf("https://") === 0 ? url :
      url.toLowerCase().indexOf("www.") === 0 ? `https://${url}` : "about:blank" : "about:blank"
    if (this.state.urlhandle && this.state.urlhandle.closed === false) {
      let tmpWindow = this.state.urlhandle;
      tmpWindow.location.href = urlsrc;
      tmpWindow.focus();
      this.setState({ urlhandle: tmpWindow });
    } else {

      if (this.state.urlhandle) {
        this.state.urlhandle.close();
      }
      let urlhandle;
      let positionLeft;
      let positionLeftOrg;

      positionLeftOrg = window.screenLeft + window.outerWidth + 10;

      let pagePosition = {
        availHeight: window.screen.availHeight,
        availLeft: window.screen.availLeft,
        availTop: window.screen.availTop,
        availWidth: window.screen.availWidth,
        top: 10,
      }

      positionLeft = ((positionLeftOrg - pagePosition.availLeft) + pagePosition.availLeft);
      let winWindth = pagePosition.availWidth - ((positionLeftOrg - pagePosition.availLeft) + 10);
      winWindth = winWindth < (pagePosition.availWidth / 2) ? pagePosition.availWidth / 2 : winWindth;

      urlhandle = window.open(urlsrc, "yodaInterface", `toolbar=yes,scrollbars=yes,resizable=yes,` +
        `top=${((pagePosition.top - pagePosition.availTop) + pagePosition.availTop)},` +
        `left=${positionLeft},` +
        `width=${winWindth},` +
        `height=${pagePosition.availHeight}`);
      let moveToPos = window.screenLeft - (positionLeft + window.outerWidth + 10) < (window.screen.availWidth / 2) ? window.screenLeft + (window.screen.availWidth / 2) : positionLeft;
      urlhandle.moveTo(moveToPos, 0);

      if (urlhandle) {
        let positionCheck = positionLeft - urlhandle.screenLeft;
        console.log('positionCheck', positionLeftOrg, positionLeft, urlhandle.screenLeft, positionCheck);
        this.setState({ urlhandle });
      }
      console.log('urlHandle', urlhandle);
    }
  }

  handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      this.handleOpenUrl(this.state.src)
    }
  }

  handleOpenCloseSidePanel = () => {
    this.setState({ sidePanelOpen: !this.state.sidePanelOpen });
  }

  handleTestApi = (name) => async e => {
    console.log('handleTestApi', name, e.target);
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': '7KFWWEN96G1iunOcICpT56UVtH1Mbcty65B0Mbbj'
    }
    axios.get(`${process.env.REACT_APP_DISPURL}/FRD`, { headers })
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      })
  }

  render() {
    return (
      <div className="ccpContainer">
        <div className={`sidepanel ${this.state.sidePanelOpen ? "sidepanelOpen" : "sidepanelClosed"}`}>
          <button className="closebtn" onClick={this.handleOpenCloseSidePanel}>×</button>
          <div className="btn-group">
            <button
              className="button"
              onClick={() => this.handleOpenUrl(this.state.src)}>
              URL screenpop test
            </button>
            <label htmlFor="lname">test URL</label>
            <input
              value={this.state.src}
              onChange={(event) => this.setState({ src: event.target.value })}
              onKeyDown={(event) => this.handleKeyDown(event)}
            >
            </input>
          </div>
        </div>
        <CCP
          handleOpenUrl={this.handleOpenUrl}
          handleOpenCloseSidePanel={this.handleOpenCloseSidePanel}
        />
      </div>
    )
  }
}

export default App;
