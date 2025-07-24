import React, { Component } from "react";
import { CgProfile } from "react-icons/cg";
import Loader from "../../../../utilities/loader/loader";
import socketIOClient from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_SOCKET;
const Message = React.lazy(() => import("../../../../Helper/notifyMessage"));

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      chips: "",
      pl: "",
      bal: "",
      message: ""
    };
  }
  componentDidMount() {
    this.setState(
      {
        chips: this.props.chips,
        bal: this.props.bal,
        pl: this.props.pl,
      },
      () => {
        this.getBal();
      }
    );
    if (this.props.role && this.props.role === 2) {
      this.getMarquees();
      this.socket = socketIOClient(ENDPOINT, {
        debug: false,
        forceNew: true,
        reconnection: true,
        autoConnect: true,
        secure: true,
        multiplex: false,
        transports: ["websocket", "polling"],
        forceBase64: true,
        rememberUpgrade: true,
        isLoggenin: true,
      });
    }

  }
  componentWillUnmount() {
    this.catchData();
    if (this.props.role && this.props.role === 2) {
      this.socket.disconnect();
    }
  }
  catchData = () => {
    localStorage.setItem("bal", this.state.bal);
    localStorage.setItem("chips", this.state.chips);
    localStorage.setItem("pl", this.state.pl);
  };
  getBal = () => {
    let urlencoded = new URLSearchParams();
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    var requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };

    fetch(import.meta.env.VITE_API_HOST + "/getprofile", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        this.setState(
          {
            bal: result.data && result.data.length ? result.data[0].bal : "",
            pl:
              result.data && result.data.length
                ? (result.data[0].bal - result.data[0].chips).toFixed(2)
                : "",
            chips:
              result.data && result.data.length ? result.data[0].chips : "",
            loading: false
          },
          () => {
            this.catchData();
          }
        );
      });
  };
  setMarquee = (e) => {
    e.preventDefault();
    let urlencoded = new URLSearchParams();
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    var requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };
    urlencoded.append("message", this.state.message);
    fetch(import.meta.env.VITE_API_HOST + "/setMarquee", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.message) {
          this.socket.emit("runner", {
            action: "updatemarquee",
            message: this.state.message,
          });
          this.setState({
            info: result.message
          }, () => {
            setTimeout(() => {
              this.setState({
                info: ""
              })
            }, 3000)
          })
        }
      });
  }
  getMarquees() {
    let headers = new Headers();
    let urlencoded = new URLSearchParams();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    urlencoded.append("first", 1);
    let requestOptions = {
      method: "POST",
      redirect: "follow",
      headers: headers,
      body: urlencoded
    };
    fetch(import.meta.env.VITE_API_HOST + "/getMarquee", requestOptions)
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        if (result && result.success) {

          this.setState(
            {
              message: result.data.msg
            })
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }
  render() {
    return (
      <React.Fragment>
        {
          this.state.loading && <Loader />
        }
        <div className="container">
          <div className="row">
            <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
              <div className="card rounded my-5 border-0 shadow-sm">
                <div className="card-body profile-body">
                  <h5 className="card-title text-center shadow">
                    {" "}
                    <span>
                      <CgProfile></CgProfile>
                    </span>
                    <br />
                    {this.props.username}
                  </h5>
                  <table className="table table-bordered table-striped">
                    <tbody>
                      <tr>
                        <td className="text-right">Free Chip : </td>
                        <td className="text-success">
                          <strong>
                            {this.state.chips}
                          </strong>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-right">Profit And Loss : </td>
                        <td
                          className={this.state.pl < 0 ? "text-danger" : "text-success"}
                        >
                          <strong>{this.state.pl}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-right">Available Chips : </td>
                        <td className="text-success"><strong>{this.state.bal}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                  {this.props.role && this.props.role === 2 &&
                    <form onSubmit={(e) => this.setMarquee(e)}>
                      <textarea className="w-75 form-control float-left" type="text" placeholder="Message"
                        onChange={(event) => {
                          this.setState({
                            message: event.target.value,
                          });
                        }}
                        value={this.state.message}
                        maxLength="150"
                        style={{resize: "none"}}
                        rows="2"
                      />
                      <button type="submit" className="ml-2 mt-1 w-20 btn btn-sm btn-success">Submit</button>
                    </form>}
                </div>
              </div>
            </div>
          </div>
        </div>
        {this.state.info && <React.Suspense fallback={""}><Message alertclass="alert-success" message={this.state.info} /></React.Suspense>}
      </React.Fragment>
    );
  }
}
