import React, { Component } from "react";
const ping_url = "https://query1.finance.yahoo.com/v7/finance/spark?symbols=aapl&range=1d";

const NW = (ComposedComponent) => {
  class NetworkDetector extends Component {
    state = {
      isDisconnected: false,
    };

    componentDidMount() {
      this.handleConnectionChange();
      window.addEventListener("online", this.handleConnectionChange);
      window.addEventListener("offline", this.handleConnectionChange);
    }

    componentWillUnmount() {
      window.removeEventListener("online", this.handleConnectionChange);
      window.removeEventListener("offline", this.handleConnectionChange);
    }

    handleConnectionChange = () => {
      const condition = navigator.onLine ? "online" : "offline";
      if (condition === "online") {
        const webPing = setInterval(() => {
          fetch(ping_url, {
            mode: "no-cors",
          })
            .then(() => {
              this.setState({ isDisconnected: false }, () => {
                return clearInterval(webPing);
              });
            })
            .catch(() => this.setState({ isDisconnected: true }));
        }, 2000);
        return;
      }

      return this.setState({ isDisconnected: true });
    };

    render() {
      const { isDisconnected } = this.state;
      return (
        <div>
          <ComposedComponent {...this.props} />
          {isDisconnected && (
            <div className="internet-error">
              <div className="content-error">
                <p className="alert alert-danger"><span role="img" aria-label="sorrow">&#129318;</span> Internet connection lost !!</p>
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  return NetworkDetector;
}


export default NW;