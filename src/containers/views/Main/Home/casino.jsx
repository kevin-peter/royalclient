import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { casino_arr } from "./casinoList";
import "./../../../../css/casino.scss";

const ENDPOINT = process.env.REACT_APP_SOCKET;
const op_id = 9232; // operator id
const domain = window.innerWidth < 992 ? "m2" : "d2";

class Casino extends Component {
  constructor(props) {
    super(props);
    this.frameRef = React.createRef();
    this.betsRef = React.createRef();
    this.topRef = React.createRef();

    this.state = {
      loading: true,
      showframe: false,
      filter: {},
      betlist: [],
      exp_arr: {},
      page: 0,
      limit: 20
    };
  }
  scroll(ref) {
    ref.current.scrollIntoView({ behavior: 'smooth' })
  }
  componentDidMount() {
    this.getExposure();
    this.socket = socketIOClient(ENDPOINT, {
      debug: false,
      forceNew: true,
      exp: "",
      bal: "",
      reconnection: true,
      autoConnect: true,
      secure: true,
      multiplex: false,
      transports: ["websocket", "polling"],
      forceBase64: true,
      rememberUpgrade: true,
      isLoggenin: true,
    });
    this.socket.on("updaterunner", (data) => {
      if (data.action && data.action === "exposerupdate") {
        if (this.props.username && data.client && data.client.toUpperCase() === this.props.username.toUpperCase()) {
          this.getExposure();
        }
      }
      if (data.action && data.action === "casinoresult") {
        this.getExposure();
      }
    });
    const urlParams = new URLSearchParams(window.location.search);
    const table_id = urlParams.get('opentable');
    if (table_id) {
      this.openTable(table_id);
    }
    this.timerID = setInterval(() => this.getExposure(), 5000);
    this.getBetList(true);
  }
  getExposure() {
    fetch(import.meta.env.VITE_API_HOST + "/getExposerAdmin", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: {},
      method: "POST",
    }).then((response) => {
      if (response.status === 401) {
        this.setState(
          {
            isLoggenin: false,
          },
          () => {
            window.location.href = process.env.PUBLIC_URL + "/login";
          }
        );
      } else {
        return response.json();
      }
    }).then((result) => {
      let exp_arr = {}
      if (result && result.data) {
        if ('exp' in result.data) {
          let obj = {
            exp: result.data.exp,
            bal: result.data.bal,
          };
          this.props.updateBal(obj)
        }

        for (let i = 0; i < result.data.runners.length; i++) {
          if (result.data.runners[i].exp < 0) {
            if (result.data.runners[i].event_id in exp_arr && exp_arr[result.data.runners[i].event_id] > result.data.runners[i].exp) {
              exp_arr[result.data.runners[i].event_id] = parseFloat(result.data.runners[i].exp).toFixed(2);
            } else {
              exp_arr[result.data.runners[i].event_id] = parseFloat(result.data.runners[i].exp).toFixed(2);
            }

          }
        }
      }
      this.setState({
        exp_arr: exp_arr
      })
    });
  }
  openTable(table_id = null) {
    let casino_url = "https://" + domain + ".fawk.app/#/splash-screen/" + this.props.casino_token + "/" + op_id;
    casino_url = (table_id) ? casino_url + "?opentable=" + table_id : casino_url
    this.setState({
      showframe: true
    }, () => {
      this.frameRef.current.contentWindow.location.replace(casino_url);
    })
  }
  getBetList = (flag = false) => {
    this.setState({
      more_disable: true,
    });
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    if (flag) {
      urlencoded.append("page", this.state.page + 1);
    }
    urlencoded.append("mode_id", this.props.modeid);
    urlencoded.append("limit", this.state.limit);
    if (this.state.filter.username) {
      urlencoded.append("username", this.state.filter.username);
    }
    if (this.state.filter.type) {
      urlencoded.append("market_type", this.state.filter.type);
    }
    if (this.state.filter.amount) {
      urlencoded.append("amount", this.state.filter.amount);
    }
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };
    fetch(import.meta.env.VITE_API_HOST + "/getAllBets", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result && result.data) {
          let matched =
            result.data && result.data.matched ? result.data.matched : [];
          this.setState({
            betlist: (flag) ? [...this.state.betlist, ...matched] : [...matched],
            more_disable: false,
            page: result.data.matched.length > 0 ? (this.state.page + 1) : this.state.page,
            loading: false,
          });
        }
      }).catch(() => {
        this.setState({
          more_disable: false
        })
      })
  };
  dateFormate = (date) => {
    let arr = date.split("-");
    let new_date = arr.join("/");
    new_date = new_date + "+00:00";
    let d = new Date(new_date);
    return d.toLocaleTimeString("en-IN", {
      month: "numeric",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  componentWillUnmount() {
    this.socket.disconnect();
    clearInterval(this.timerID);
  }
  render() {
    const showframe = this.state.showframe;
    return (
      <React.Fragment>
        {showframe ? (
          <div className="row" ref={this.topRef}>
            <div className={"col-12 p-0 pull-right " + (this.props.role < 5 ? 'col-md-7' : '')}>
              <button onClick={() => this.setState({
                showframe: false
              })} className='close-btn btn-sm btn-danger'>X</button>
              {this.props.role < 5 && window.innerWidth < 480 && <button title="Go To Bets" className='btn btn-xs btn-info float-right' onClick={() => { this.scroll(this.betsRef) }}>View Bets</button>}
              <iframe
                ref={this.frameRef}
                width="100%"
                className="casino-link"
                height="100%"
                title="Live Casino"
              ></iframe>
            </div>
            {this.props.role < 5 &&
              <div className='col-12 col-md-5 bg-white d-right'>
                <div className="table-responsive bg-white mb-2 shadow">
                  <table ref={this.betsRef} className="table table-sm table-betlist">
                    <thead>
                      <tr className="row-header-betlist shadow">
                        <th>Runner</th>
                        <th className="text-right">Rate</th>
                        <th className="text-right">Stake</th>
                        <th className="text-right">P/L</th>
                        {this.props.role < 5 && (
                          <React.Fragment>
                            <th className='text-right'>USER NAME</th>
                            <th className="text-center">Ref.</th>
                            <th>IP</th>
                          </React.Fragment>
                        )}
                        <th className="text-center">Time {this.props.role < 5 && window.innerWidth < 480 && <button title="Go To Bets" className='btn btn-xs btn-info float-right' onClick={() => { this.scroll(this.topRef) }}>Up</button>}</th>
                      </tr>
                    </thead>
                    {
                      this.state.betlist && this.state.betlist.length > 0 &&
                      <tbody>
                        {
                          this.state.betlist.map((v, k) => (
                            <tr
                              key={k}
                              className={`row-betlist ${v.bet_type ? v.bet_type : ""
                                }`}
                            >
                              <td>{v.runner}</td>
                              <td className="text-right">{v.rate}{v.table_name === 'tbl_fancy_runners' && ("/" + v.size)}</td>
                              <td className="text-right">{v.stake}</td>
                              <td className="text-right">
                                {(v.table_name !== "tbl_line_runners" && v.table_name !== "tbl_fancy_runners" && v.table_name !== "tbl_odds_runners") &&
                                  (v.stake * (v.rate - 1)).toFixed(0)}
                                {(v.table_name === "tbl_line_runners" || v.table_name === "tbl_fancy_runners") && (v.stake * v.size / 100).toFixed(0)}

                                {(v.table_name === "tbl_odds_runners") &&
                                  (v.stake * v.rate / 100).toFixed(0)}
                              </td>
                              {this.props.role < 5 && (
                                <React.Fragment>
                                  <td className='text-right'>{v.u_name}</td>
                                  <td className='text-center'>{v.webref}</td>
                                  <td className="text-primary"><span role="button" title={v.device_info}>{v.ip_addr}</span></td>
                                </React.Fragment>)}
                              <td className="text-center">
                                {this.dateFormate(v.created)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    }
                  </table>
                </div>
                <div className="p-1 d-flex justify-content-center">
                  {this.state.betlist && this.state.betlist.length > 19 &&
                    <button
                      disabled={this.state.more_disable}
                      onClick={() => this.getBetList(true)}
                      title="Dil Mange More"
                      className="col-12 col-md-3 btn btn-sm btn-theme shadow"
                    >
                      Load More
                    </button>
                  }
                </div>
              </div>}
          </div>
        ) : (
          <div className="row fwak-casino">
            {casino_arr.map((v, k) => (
              <div onClick={() => this.openTable(v.id)} className="col-6 col-sm-3 col-md-3 col-lg-2 col-xl-2">
                <figure className="fig-pos"><img alt="." src={process.env.PUBLIC_URL +`/casino/` + v.id + ".jpg"} className="img-fluid" /></figure>
                <div className="text-center fwak-title-main">{v.name} <span className={`pull-right ${this.state.exp_arr[v.id] < 0 ? 'text-danger' : 'text-success'}`}>{this.state.exp_arr[v.id]}</span></div>
              </div>
            ))}
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default Casino;