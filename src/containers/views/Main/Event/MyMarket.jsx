import React from "react";
import socketIOClient from "socket.io-client";
import { IoMdInformationCircle } from "react-icons/io";
import { Navigate } from "react-router-dom";
import Loader from "../../../../utilities/loader/loader";
import { FiFilter } from "react-icons/fi";
import NS from "./../../../../sound/short_notification.mp3"

const Book = React.lazy(() => import("./Book"));
const Position = React.lazy(() => import("./Postion"));
const ToolTip = React.lazy(() => import("./ToolTip"));
const Message = React.lazy(() => import("../../../../Helper/notifyMessage"));
const PopUp = React.lazy(() => import("../../../../Helper/PopUp"));
const BetSlip = React.lazy(() => import("./BetSlip"));
const TablePosition = React.lazy(() => import("./TablePosition"));

const ENDPOINT = process.env.REACT_APP_SOCKET;
class MyMarket extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      eventid: "",
      eventname: "My Markets",
      s_event: "",
      eventdata: {},
      exp_arr: [],
      runners: [],
      line_runners: [],
      fancy_runners: [],
      extra_runners: [],
      extra_filter: [],
      stop: 0,
      show_slip: false,
      logout: false,
      slip_obj: {},
      slip_type: "",
      stack: 0,
      active_runner_id: "",
      active_runner_name: "",
      betlist: [],
      market_type: {},
      market_ids: [],
      event_ids: [],
      active_market_type: "",
      active_runners: [],
      slip_market_id: "",
      openbook: false,
      opentool: false,
      o_rate: "",
      openpostion: false,
      position: [],
      book_title: "",
      size: 1,
      mounted: false,
      message: "",
      alertclass: "alert-info",
      btns: [],
      mo_filter: [],
      marquee: '',
      m_rtbl: false,
      more_disable: false,
      page: 1,
      limit: 20,
      filter: {},
      betcount: ""
    };
    this.socket = {};
  }
  componentDidMount() {
    let betdata = [];
    if (this.props.betdata) {
      betdata = this.props.betdata;
    }
    this.setState({
      betlist: betdata,
      marquee: this.props.message,
    });
    if (this.props.eventdata) {
      this.setState(
        {
          runners:
            this.props.eventdata.runners &&
              this.props.eventdata.runners.length > 0
              ? this.props.eventdata.runners
              : [],
          line_runners:
            this.props.eventdata.line_runners &&
              this.props.eventdata.line_runners.length > 0
              ? this.props.eventdata.line_runners
              : [],
          fancy_runners:
            this.props.eventdata.fancy_runners &&
              this.props.eventdata.fancy_runners.length > 0
              ? this.props.eventdata.fancy_runners
              : [],
          extra_runners:
            this.props.eventdata.extra_runners &&
              this.props.eventdata.extra_runners.length > 0
              ? this.props.eventdata.extra_runners
              : [],
          extra_filter:
            this.props.eventdata.extra_filter &&
              this.props.eventdata.extra_filter.length > 0
              ? this.props.eventdata.extra_filter
              : []
        },
        () => { }
      );
    }
    this.getRunnerPostion("", true);
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

    this.socket.on("connection", () => {
      if (parseInt(this.state.stop) > 1 && this.state.event_ids.length > 0) {
        for (let i = 0; i < this.state.event_ids.length; i++) {
          this.socket.emit("event", {
            eid: this.state.event_ids[i],
            mid: this.state.market_ids.join(","),
          });
        }
      }
    });

    this.socket.on("score", (res) => {
      this.setState({
        scoredata: res.data
      })
    });

    this.socket.on("data", this.changeData);
    this.socket.on("updaterunner", (data) => {

      if (data.action && data.action === "placebet") {
        if (this.props.ps && data.data.ps && data.data.ps.includes(this.props.ps)) {
          if ('vibrate' in navigator) {
            navigator.vibrate(500);
          }
          const sound = new Audio(NS);
          sound.play();
          let market_ids = [...this.state.market_ids];
          if (!market_ids.includes(data.mid)) {
            market_ids.push(data.mid);
            this.getRunners(market_ids.join(), data.mid);
          } else {
            this.getRunnerPostion(data.mid);
          }
          this.setState({
            market_ids: market_ids
          }, () => {
            this.getBetList();
          })
        }
      }
      if (this.state.market_ids.includes(data.mid)) {
        if (data.action && data.action === "updatebets") {
          this.getBetList(data.mid);
        } else if (data.action && (data.action === "updatelock")) {
          this.getRunners();
        } else if (data.action === "updatemessage") {
          this.getRunners();
        }
        else if (data.action && data.action === "resultrunner") {
          let market_ids = [...this.state.market_ids];
          let index = market_ids.indexOf(data.mid);
          if (index > -1) {
            market_ids.splice(index, 1);
          }
          this.getRunners();
          this.getBetList();
          for (let i = 0; i < market_ids.length; i++) {
            this.getRunnerPostion(market_ids[i]);
          }
        }

        else if (data.action && data.action === "revoke") {
          let market_ids = [...this.state.market_ids];
          let index = market_ids.indexOf(data.mid);
          if (index === -1) {
            market_ids.push(data.mid);
          }
          this.getRunners();
          this.getBetList();
          for (let i = 0; i < market_ids.length; i++) {
            this.getRunnerPostion(market_ids[i]);
          }

        } else if (data.action && data.action === "exposerupdate") {
          if (data.client && data.client.toUpperCase() === this.props.username) {
            this.getRunnerPostion();
          }
        }
      }
      if (data.action === "updatemarquee") {
        this.setState({
          marquee: data.message
        }, () => {
          localStorage.setItem("message", data.message)
        })
      }
    });

    if (this.props.btns.length === 0) {
      this.getButtons()
    } else {
      this.setState({
        btns: this.props.btns
      })
    }

    this.timerID = setInterval(() => this.tick(), 1000);
  }
  componentWillUnmount() {
    this.socket.disconnect();
    this.catchData();
    clearInterval(this.timerID);
  }
  catchData = () => {
    let all_runners = {
      eventname: this.state.eventname,
      runners: [...this.state.runners],
      line_runners: [...this.state.line_runners],
      fancy_runners: [...this.state.fancy_runners],
      extra_runners: [...this.state.extra_runners],
      extra_filter: [...this.state.extra_filter],
    };
    localStorage.setItem(
      "betlist_" + this.props.eventid,
      JSON.stringify(this.state.betlist)
    );
    localStorage.setItem(this.props.eventid, JSON.stringify(all_runners));
  };
  getRunners(marketid = "", s_mid = "") {
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    if (marketid) {
      urlencoded.append("market_id", marketid);
    }

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };
    fetch(import.meta.env.VITE_API_HOST + "/getRunners", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          let rn = [];
          let ls = [];
          let ext = [];
          let fn = [];
          let ext_filt = [];
          let market_type = {};
          let mo_filter = [];
          if (result.data && result.data.runners) {
            for (let i = 0; i < result.data.runners.length; i++) {
              market_type[result.data.runners[i].market_id] = "Match Odds";
              if (i === 0) {
                mo_filter.push({
                  market_name: result.data.runners[i].event_name,
                  mkid: result.data.runners[i].market_id,
                  msg: result.data.runners[i].msg,
                });
              } else if (i > 0) {
                if (
                  result.data.runners[i - 1].market_id !==
                  result.data.runners[i].market_id
                ) {
                  mo_filter.push({
                    market_name: result.data.runners[i].event_name,
                    mkid: result.data.runners[i].market_id,
                    msg: result.data.runners[i].msg,
                  });
                }
              }
              rn[i] = {};
              rn[i]["rs"] =
                this.state.runners.length > i && this.state.runners[i]["rs"]
                  ? this.state.runners[i]["rs"]
                  : "";
              rn[i]["b"] =
                this.state.runners.length > i && this.state.runners[i]["b"]
                  ? this.state.runners[i]["b"]
                  : [0];

              rn[i]["bs"] =
                this.state.runners.length > i && this.state.runners[i]["bs"]
                  ? this.state.runners[i]["bs"]
                  : [0];

              rn[i]["l"] =
                this.state.runners.length > i && this.state.runners[i]["l"]
                  ? this.state.runners[i]["l"]
                  : [0];

              rn[i]["ls"] =
                this.state.runners.length > i && this.state.runners[i]["ls"]
                  ? this.state.runners[i]["ls"]
                  : [0];
              rn[i]["en"] = result.data.runners[i].event_name;
              rn[i]["n"] = result.data.runners[i].name;
              rn[i]["mode"] = result.data.runners[i].mode_id;
              rn[i]["mid"] = result.data.runners[i].market_id;
              rn[i]["eid"] = result.data.runners[i].event_id;
              rn[i]["rid"] = result.data.runners[i].runnerId;
              rn[i]["exp"] = (this.state.exp_arr.length > i) ? this.mapExposure(rn[i]["rid"], rn[i]["mid"], this.state.exp_arr) : "";
              if (result.data.locked) {
                rn[i]["lock"] = result.data.locked;
              } else {
                rn[i]["lock"] = result.data.runners[i].locked;
              }
              if (this.state.runners.length > i) {
                rn[i]["m_lock"] = this.state.runners[i]["m_lock"];
              } else {
                rn[i]["m_lock"] = 0;
              }
            }
          }
          if (result.data && result.data.line_runners) {
            for (let i = 0; i < result.data.line_runners.length; i++) {
              ls[i] = {};
              ls[i]["rs"] =
                this.state.line_runners.length > i &&
                  this.state.line_runners[i]["rs"]
                  ? this.state.line_runners[i]["rs"]
                  : "";
              market_type[result.data.line_runners[i].market_id] =
                "Line Session";
              ls[i]["n"] = result.data.line_runners[i].name;
              ls[i]["en"] = result.data.line_runners[i].event_name;
              ls[i]["rid"] = result.data.line_runners[i].runnerId;
              ls[i]["mkid"] = result.data.line_runners[i].market_id;
              ls[i]["mode"] = result.data.line_runners[i].mode_id;
              ls[i]["eid"] = result.data.line_runners[i].event_id;

              if (result.data.locked) {
                ls[i]["lock"] = result.data.locked;
              } else {
                ls[i]["lock"] = result.data.line_runners[i].locked;
              }
              if (this.state.line_runners.length > i) {
                ls[i]["m_lock"] = this.state.line_runners[i]["m_lock"];
              } else {
                ls[i]["m_lock"] = 0;
              }
              ls[i]["b"] =
                this.state.line_runners &&
                  this.state.line_runners.length > i &&
                  this.state.line_runners[i]["b"]
                  ? this.state.line_runners[i]["b"]
                  : [0];
              ls[i]["bs"] =
                this.state.line_runners &&
                  this.state.line_runners.length > i &&
                  this.state.line_runners[i]["bs"]
                  ? this.state.line_runners[i]["bs"]
                  : [0];
              ls[i]["l"] =
                this.state.line_runners &&
                  this.state.line_runners.length > i &&
                  this.state.line_runners[i]["l"]
                  ? this.state.line_runners[i]["l"]
                  : [0];
              ls[i]["ls"] =
                this.state.line_runners &&
                  this.state.line_runners.length > i &&
                  this.state.line_runners[i]["ls"]
                  ? this.state.line_runners[i]["ls"]
                  : [0];
              ls[i]["msg"] = result.data.line_runners[i].msg ? result.data.line_runners[i].msg : null;

              ls[i]["exp"] = (this.state.line_runners.length > i) ? this.mapAllExposure(ls[i]["rid"], ls[i]["mkid"], this.state.line_runners) : "";
            }
          }
          if (result.data && result.data.fancy_runners) {
            for (let i = 0; i < result.data.fancy_runners.length; i++) {
              fn[i] = {};
              fn[i]["rs"] =
                this.state.fancy_runners.length > i &&
                  this.state.fancy_runners[i]["rs"]
                  ? this.state.fancy_runners[i]["rs"]
                  : "";
              market_type[result.data.fancy_runners[i].market_id] =
                "Fancy";
              fn[i]["n"] = result.data.fancy_runners[i].name;
              fn[i]["en"] = result.data.fancy_runners[i].event_name;
              fn[i]["rid"] = result.data.fancy_runners[i].runnerId;
              fn[i]["mkid"] = result.data.fancy_runners[i].market_id;
              fn[i]["mode"] = result.data.fancy_runners[i].mode_id;
              fn[i]["eid"] = result.data.fancy_runners[i].event_id;

              if (result.data.locked) {
                fn[i]["lock"] = result.data.locked;
              } else {
                fn[i]["lock"] = result.data.fancy_runners[i].locked;
              }
              if (this.state.fancy_runners.length > i) {
                fn[i]["m_lock"] = this.state.fancy_runners[i]["m_lock"];
              } else {
                fn[i]["m_lock"] = 0;
              }
              fn[i]["b"] =
                this.state.fancy_runners &&
                  this.state.fancy_runners.length > i &&
                  this.state.fancy_runners[i]["b"]
                  ? this.state.fancy_runners[i]["b"]
                  : [0];
              fn[i]["bs"] =
                this.state.fancy_runners &&
                  this.state.fancy_runners.length > i &&
                  this.state.fancy_runners[i]["bs"]
                  ? this.state.fancy_runners[i]["bs"]
                  : [0];
              fn[i]["l"] =
                this.state.fancy_runners &&
                  this.state.fancy_runners.length > i &&
                  this.state.fancy_runners[i]["l"]
                  ? this.state.fancy_runners[i]["l"]
                  : [0];
              fn[i]["ls"] =
                this.state.fancy_runners &&
                  this.state.fancy_runners.length > i &&
                  this.state.fancy_runners[i]["ls"]
                  ? this.state.fancy_runners[i]["ls"]
                  : [0];

              fn[i]["msg"] = result.data.fancy_runners[i].msg ? result.data.fancy_runners[i].msg : null;
              fn[i]["exp"] = (this.state.fancy_runners.length > i) ? this.mapAllExposure(fn[i]["rid"], fn[i]["mkid"], this.state.fancy_runners) : "";
            }
          }
          if (result.data && result.data.extra_runners) {
            for (let i = 0; i < result.data.extra_runners.length; i++) {
              if (i === 0) {
                ext_filt.push({
                  market_name: result.data.extra_runners[i].market_name,
                  mkid: result.data.extra_runners[i].market_id,
                  en: result.data.extra_runners[i].event_name,
                  msg: result.data.extra_runners[i].msg,
                });
              } else if (i > 0) {
                if (
                  result.data.extra_runners[i - 1].market_id !==
                  result.data.extra_runners[i].market_id
                ) {
                  ext_filt.push({
                    market_name: result.data.extra_runners[i].market_name,
                    mkid: result.data.extra_runners[i].market_id,
                    en: result.data.extra_runners[i].event_name,
                    msg: result.data.extra_runners[i].msg,
                  });
                }
              }
              ext[i] = {};
              if (result.data.extra_runners[i].market_id)
                market_type[result.data.extra_runners[i].market_id] = result.data.extra_runners[i].market_id.startsWith("9.") || result.data.extra_runners[i].market_id.startsWith("16.") || result.data.extra_runners[i].market_id.startsWith("17.") || result.data.extra_runners[i].market_id.startsWith("18.") ? "Book Maker" : "Extra Market";
              ext[i]["rs"] =
                this.state.extra_runners.length > i &&
                  this.state.extra_runners[i]["rs"]
                  ? this.state.extra_runners[i]["rs"]
                  : "";
              ext[i]["n"] = result.data.extra_runners[i].name;
              ext[i]["en"] = result.data.extra_runners[i].event_name;
              ext[i]["market_name"] = result.data.extra_runners[i].market_name;
              ext[i]["rid"] = result.data.extra_runners[i].runnerId;
              ext[i]["mkid"] = result.data.extra_runners[i].market_id;
              ext[i]["mode"] = result.data.extra_runners[i].mode_id;
              ext[i]["eid"] = result.data.extra_runners[i].event_id;
              ext[i]["back_blink"] = ext[i]["lay_blink"] = "";
              if (result.data.locked) {
                ext[i]["lock"] = result.data.locked;
              } else {
                ext[i]["lock"] = result.data.extra_runners[i].locked;
              }
              if (this.state.extra_runners.length > i) {
                ext[i]["m_lock"] = this.state.extra_runners[i]["m_lock"];
              } else {
                ext[i]["m_lock"] = 0;
              }

              //ext[i]["exp"] = (this.state.extra_runners.length > i) ? this.mapAllExposure(ext[i]["rid"], ext[i]["mkid"], this.state.extra_runners) : "";

              ext[i]["exp"] = (this.state.exp_arr.length > i) ? this.mapExposure(ext[i]["rid"], ext[i]["mkid"], this.state.exp_arr) : "";

              ext[i]["b"] =
                this.state.extra_runners.length > i &&
                  this.state.extra_runners[i]["b"]
                  ? this.state.extra_runners[i]["b"]
                  : [0];
              ext[i]["bs"] =
                this.state.extra_runners.length > i &&
                  this.state.extra_runners[i]["bs"]
                  ? this.state.extra_runners[i]["bs"]
                  : [0];
              ext[i]["l"] =
                this.state.extra_runners.length > i &&
                  this.state.extra_runners[i]["l"]
                  ? this.state.extra_runners[i]["l"]
                  : [0];
              ext[i]["ls"] =
                this.state.extra_runners.length > i &&
                  this.state.extra_runners[i]["ls"]
                  ? this.state.extra_runners[i]["ls"]
                  : [0];
            }
          }
          if (rn.length === 0 && ls.length === 0 && ext.length === 0) {
            // window.history.back();
          }

          this.setState(
            {
              runners: rn,
              line_runners: [...ls],
              fancy_runners: [...fn],
              extra_runners: [...ext],
              extra_filter: [...ext_filt],
              market_type: market_type,
              mo_filter: mo_filter,
              loading: false,
            },
            () => {
              if (this.state.event_ids.length > 0) {
                for (let i = 0; i < this.state.event_ids.length; i++) {
                  this.socket.emit("event", {
                    eid: this.state.event_ids[i],
                    mid: this.state.market_ids.join(","),
                  });
                }
              }
              if (marketid && !s_mid) {
                let m_arr = marketid.split(",");
                if (m_arr) {
                  let i = 1;
                  for (const key in this.state.market_type) {
                    if (this.state.market_type[key] === 'Fancy' || this.state.market_type[key] === 'Line Session') {
                      if (!this.state.mounted) {
                        ((i) => {
                          setTimeout(() => {
                            this.getRunnerPostion(key);
                          }, 1000 * i);
                        })(i)
                      }
                    }
                    i++;
                  }
                }
              }
              if (s_mid) {
                this.getRunnerPostion(s_mid);
              }
            }
          );
        } else {
          this.setState({
            loading: false
          })
        }
      })
      .then(() => {
        if (!this.state.mounted) {
          this.getBetList();
        }
      })
      .catch((error) => {
        console.log("error", error);
        this.setState({
          loading: false
        })
      })
  }
  mapExposure(runner_id, mid, data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].market_id === mid && data[i].runner_id === runner_id) {
        return data[i].exp ? parseInt(data[i].exp) : 0;
      }
    }
  }
  mapAllExposure(rid, market_id, data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].mkid === market_id && data[i].rid === rid) {
        return data[i].exp ? parseInt(data[i].exp) : 0;
      }
    }
  }
  mapMarketId(data, mkid) {
    let m_arr = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].mkid === mkid) {
        m_arr.push(data[i]);
      }
    }
    return m_arr;
  }
  getRunnerPostion = (marketid = "", flag) => {
    let urlencoded = new URLSearchParams();
    let market_type = "";
    let market_id = "";
    if (marketid) {
      urlencoded.append("market_id", marketid);
      market_id = marketid;
      market_type = this.state.market_type[market_id] ? this.state.market_type[market_id] : "";
    }
    let exp_url = (this.props.role < 5 && (market_type === 'Fancy' || market_type === 'Line Session')) ? "getRunnerPositionParent" : "getExposerAdmin";
    fetch(import.meta.env.VITE_API_HOST + "/" + exp_url + "", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: urlencoded,
      method: "POST",
    })
      .then((response) => {
        if (response.status === 401) {
          this.socket.disconnect();
          this.setState(
            {
              isLoggenin: false,
              eventdata: {},
              runners: [],
            },
            () => {
              window.location.href = process.env.PUBLIC_URL + "/login";
            }
          );
        } else {
          return response.json();
        }
      })
      .then((result) => {
        let market_ids = [...this.state.market_ids];
        let event_ids = [...this.state.event_ids];
        let runner = [...this.state.runners];
        let extra_runners = [...this.state.extra_runners];
        let line_runners = [...this.state.line_runners];
        let fancy_runners = [...this.state.fancy_runners];
        let exp = "";
        let exp_arr = [...this.state.exp_arr];
        if (result && result.success && market_type === "Match Odds") {
          if (runner && result.data.runners.length > 0) {
            for (let i = 0; i < runner.length; i++) {
              let new_exp = this.mapExposure(
                runner[i].rid,
                runner[i].mid,
                result.data.runners
              );
              if (new_exp) {
                runner[i].exp = new_exp;
              }
            }
          }
        }
        if (result && result.success && market_type === "Line Session") {
          exp = "";
          for (let i = 0; i < line_runners.length; i++) {
            if (line_runners[i].mkid === market_id) {
              if (this.props.role < 5) {
                exp = result.data.mainExp !== 0 ? parseInt(result.data.mainExp) : "";
              } else {
                exp = result.data.runners.length > 0 && result.data.runners[0].exp
                  ? parseInt(result.data.runners[0].exp) : "";
              }
              line_runners[i].exp = exp;
            }
          }
        }
        if (result && result.success && market_type === "Fancy") {
          exp = ""
          for (let i = 0; i < fancy_runners.length; i++) {
            if (fancy_runners[i].mkid === market_id) {
              if (this.props.role < 5) {
                exp = result.data.mainExp !== 0 ? parseInt(result.data.mainExp) : "";
              } else {
                exp = result.data.runners.length > 0 && result.data.runners[0].exp
                  ? parseInt(result.data.runners[0].exp) : "";
              }
              fancy_runners[i].exp = exp;
            }
          }
        }
        if (result && result.success && (market_type === "Extra Market" || market_type === "Book Maker")) {
          if (extra_runners && result.data.runners.length > 0) {
            for (let i = 0; i < extra_runners.length; i++) {
              if (extra_runners[i].mkid === market_id) {
                extra_runners[i].exp = this.mapExposure(
                  extra_runners[i].rid,
                  extra_runners[i].mkid,
                  result.data.runners
                );
              }
            }
          }
        }
        if (!market_type && result.data && result.data.runners.length > 0) {
          for (let i = 0; i < result.data.runners.length; i++) {
            if (!market_ids.includes(result.data.runners[i].market_id)) {
              market_ids.push(result.data.runners[i].market_id)
            }
            if (!event_ids.includes(result.data.runners[i].event_id)) {
              event_ids.push(result.data.runners[i].event_id)
            }
          }
        }
        let updatetime = new Date().getTime();
        let eventdata = this.state.eventdata;
        eventdata.updatetime = updatetime;
        eventdata.eventname = this.state.eventname;

        if (market_type !== "Line Session" && market_type !== "Fancy") {
          exp_arr = result.data && result.data.runners ? result.data.runners : exp_arr;
        }

        this.setState(
          {
            runners: runner,
            eventdata: eventdata,
            market_ids: market_ids,
            event_ids: event_ids,
            exp_arr: exp_arr
          },
          () => {
            this.catchData();
            if (flag) {
              this.getRunners(market_ids.join());
            }
            if (result.data && ('exp' in result.data)) {
              this.props.updateBal(result.data);
            }
          }
        );
      });
  };
  getBetList = (marketid = "") => {
    let urlencoded = new URLSearchParams();
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
    fetch(import.meta.env.VITE_API_HOST + "/getAllBets", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: urlencoded,
      method: "POST",
    })
      .then((response) => {
        if (response.status === 401) {
          this.socket.disconnect();
          this.setState(
            {
              isLoggenin: false,
              eventdata: {},
              runners: [],
            },
            () => {
              window.location.href = process.env.PUBLIC_URL + "/login";
            }
          );
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result && result.success) {
          let matched = result.data && result.data.matched ? result.data.matched : [];
          this.setState(
            {
              betlist: matched,
              mounted: true,
              betcount: result.data && result.data.total ? result.data.total : "",
              page: 1
            },
            () => {
              this.catchData();
              if (result.data && ('exp' in result.data)) {
                this.props.updateBal(result.data);
              }
            }
          );
        }
      })
      .then(() => {
        if (marketid) {
          this.getRunnerPostion(marketid)
        }
      });
  };
  changeData = (n_data) => {
    let runners = [...this.state.runners];
    let line_runners = [...this.state.line_runners];
    let fancy_runners = [...this.state.fancy_runners];
    let extra_runners = [...this.state.extra_runners];

    if (n_data && n_data.mo && n_data.mo.rn.length) {
      let m_lock = n_data.mo.ms !== "OPEN" ? 1 : 0;
      if (this.state.market_type[n_data.mo.mkid] === "Match Odds") {
        for (let i = 0; i < runners.length; i++) {
          if (n_data.mo.mkid === runners[i]["mid"]) {
            for (let j = 0; j < n_data.mo.rn.length; j++) {
              if (runners[i]["rid"].toString() === n_data.mo.rn[j].rid.toString()) {
                runners[i]["back_blink"] =
                  runners[i]["b"][0] && runners[i]["b"][0] !== n_data.mo.rn[j].b[0] ? "back_blink" : "";
                runners[i]["lay_blink"] =
                  runners[i]["l"][0] && runners[i]["l"][0] !== n_data.mo.rn[j].l[0] ? "lay_blink" : "";
                runners[i]["rs"] = n_data.mo.rn[j].rs ? n_data.mo.rn[j].rs : "";
                runners[i]["n"] = this.state.runners[i]
                  ? this.state.runners[i].n
                  : "";
                runners[i]["exp"] = this.state.runners[i]
                  ? this.state.runners[i].exp
                  : "";
                runners[i]["b"] = n_data.mo.rn[j].b;
                runners[i]["b"] = n_data.mo.rn[j].b;
                runners[i]["bs"] = n_data.mo.rn[j].bs;
                runners[i]["l"] = n_data.mo.rn[j].l;
                runners[i]["ls"] = n_data.mo.rn[j].ls;
                runners[i]["m_lock"] = m_lock;
              }
            }
          } else {
            runners[i] = this.state.runners[i];
          }
        }
      }

      if (this.state.market_type[n_data.mo.mkid] === "Line Session") {
        for (let j = 0; j < line_runners.length; j++) {
          if (n_data.mo.mkid === line_runners[j].mkid) {
            line_runners[j]["back_blink"] =
              line_runners[j]["b"][0] !== n_data.mo.rn[0].b[0]
                ? "back_blink"
                : "";
            line_runners[j]["lay_blink"] =
              line_runners[j]["l"][0] !== n_data.mo.rn[0].l[0]
                ? "lay_blink"
                : "";
            line_runners[j]["rs"] = n_data.mo.rn[0].rs
              ? n_data.mo.rn[0].rs
              : "";
            line_runners[j]["exp"] = this.state.line_runners[j]
              ? this.state.line_runners[j].exp
              : "";
            line_runners[j]["b"] = n_data.mo.rn[0].b;
            line_runners[j]["bs"] = n_data.mo.rn[0].bs;
            line_runners[j]["l"] = n_data.mo.rn[0].l;
            line_runners[j]["ls"] = n_data.mo.rn[0].ls;
            line_runners[j]["m_lock"] = m_lock;
          }
        }
      }
      if (this.state.market_type[n_data.mo.mkid] === "Fancy") {
        for (let j = 0; j < fancy_runners.length; j++) {
          if (n_data.mo.mkid === fancy_runners[j].mkid) {
            fancy_runners[j]["back_blink"] =
              fancy_runners[j]["b"][0] !== n_data.mo.rn[0].b[0]
                ? "back_blink"
                : "";
            fancy_runners[j]["lay_blink"] =
              fancy_runners[j]["l"][0] !== n_data.mo.rn[0].l[0]
                ? "lay_blink"
                : "";
            fancy_runners[j]["rs"] = n_data.mo.rn[0].rs
              ? n_data.mo.rn[0].rs
              : "";
            fancy_runners[j]["exp"] = this.state.fancy_runners[j]
              ? this.state.fancy_runners[j].exp
              : "";
            fancy_runners[j]["b"] = n_data.mo.rn[0].b;
            fancy_runners[j]["bs"] = n_data.mo.rn[0].bs;
            fancy_runners[j]["l"] = n_data.mo.rn[0].l;
            fancy_runners[j]["ls"] = n_data.mo.rn[0].ls;
            fancy_runners[j]["m_lock"] = m_lock;
          }
        }
      }
      if (this.state.market_type[n_data.mo.mkid] === "Extra Market" || this.state.market_type[n_data.mo.mkid] === "Book Maker") {
        for (let j = 0; j < this.state.extra_runners.length; j++) {
          if (this.state.extra_runners[j].mkid === n_data.mo.mkid) {
            extra_runners[j]["exp"] = this.state.extra_runners[j]
              ? this.state.extra_runners[j].exp
              : "";
            let n_d = n_data.mo.rn.filter((rec) => rec.rid.toString() === this.state.extra_runners[j].rid.toString());
            extra_runners[j]["back_blink"] =
              n_d.length > 0 && extra_runners[j]["b"][0] !== n_d[0].b[0]
                ? "back_blink"
                : "";
            extra_runners[j]["lay_blink"] =
              n_d.length > 0 && extra_runners[j]["l"][0] !== n_d[0].l[0]
                ? "lay_blink"
                : "";
            extra_runners[j]["rs"] = n_d.length > 0 && n_d[0].rs
              ? n_d[0].rs
              : "";
            extra_runners[j]["b"] = n_d.length > 0 ? n_d[0].b : 0;
            extra_runners[j]["bs"] = n_d.length > 0 ? n_d[0].bs : 0;
            extra_runners[j]["l"] = n_d.length > 0 ? n_d[0].l : 0;
            extra_runners[j]["ls"] = n_d.length > 0 ? n_d[0].ls : 0;
            extra_runners[j]["m_lock"] = m_lock;
            // if (n_data.mo.mkid.startsWith("12.") && n_d[0].l[0] > 2.02) {
            //   extra_runners[j]["m_lock"] = 1;
            // }
          }
        }
      }
    }
    this.setState({
      runners: [...runners],
      line_runners: [...line_runners],
      fancy_runners: [...fancy_runners],
      extra_runners: [...extra_runners],
      stop: 0,
    });
  };
  tick = () => {
    let stop = parseInt(this.state.stop) + 1;
    if (parseInt(stop) > 4) {
      stop = 0;
      for (let i = 0; i < this.state.event_ids.length; i++) {
        this.socket.emit("event", {
          eid: this.state.event_ids[i],
          mid: this.state.market_ids.join(","),
        });
      }
    }
    this.setState({
      stop: stop,
    });
  };
  closeBetSlip = (message, alertclass) => {
    this.setState({
      show_slip: false,
      message: message,
      alertclass: alertclass
    }, () => {
      setTimeout(() => {
        this.setState({
          message: ""
        })
      }, 3000)
    });
  };
  closeBook = () => {
    this.setState({
      openbook: false,
      m_rtbl: false
    });
  };
  closeToolTip = () => {
    this.setState({
      opentool: false,
    });
  };
  closePosition = () => {
    this.setState({
      openpostion: false,
    });
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
  getLinePosition = (market_id, runner_id, book_title) => {
    let urlencoded = new URLSearchParams();
    let a_path = this.props.role < 5 ? "getRunnerPositionParent" : "getRunnerPosition";
    urlencoded.append("market_id", market_id);
    urlencoded.append("runner_id", runner_id);
    fetch(import.meta.env.VITE_API_HOST + "/" + a_path, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: urlencoded,
      method: "POST",
    })
      .then((response) => {
        if (response.status === 401) {
          this.socket.disconnect();
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.data) {
          let arr = [];
          if (this.props.role < 5) {
            for (var key in result.data.pos) {
              arr.push(result.data.pos[key]);
            }
          } else {
            arr = result.data;
          }
          this.setState({
            position: arr,
          });
        }
      })
      .then(() => {
        this.setState({
          openpostion: true,
          book_title: book_title,
        });
      });
  };
  parseEventName(eve = '') {
    var new_name = eve;
    let arr = eve.split(" v ");
    if (arr.length > 1) {
      new_name = arr[0].substring(0, 3) + " v " + arr[1].substring(0, 3);
    } else {
      new_name = eve.substring(0, 15)
    }
    return new_name;
  }
  cupWinner(eve = '') {
    let arr = eve.split(" v ");
    if (arr.length > 1) {
      return false
    } else {
      return true
    }
  }
  getButtons() {
    fetch(import.meta.env.VITE_API_HOST + "/buttons", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      method: "POST",
    }).then((response) => {
      if (response.status === 401) {
        this.socket.disconnect();
        window.location.href = process.env.PUBLIC_URL + "/login";
      } else {
        return response.json();
      }
    })
      .then((result) => {
        this.setState({
          btns: result.data ? result.data : [],
        }, () => {
          localStorage.setItem("btns", JSON.stringify(result.data))
        });
      })
  }

  loadMore = () => {
    this.setState({
      more_disable: true,
    });
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("page", this.state.page + 1);
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
            betlist: [...this.state.betlist, ...matched],
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
  applyFilter = (e, flag = true) => {
    e.preventDefault();
    this.getBetList();
  }

  render() {
    let MATCH_ODDS;
    let LINE_SESSION;
    let FANCY;
    let E_T;
    if (this.state.mo_filter && this.state.mo_filter.length > 0) {
      MATCH_ODDS = this.state.mo_filter.map((v, k) => (
        <div className='table-responsive bg-white mb-1 shadow' key={k}>
          <table className="table table-sm table-odds">
            <thead>
              <tr className="text-center">
                <th width="60%" className="eventtype">
                  {this.parseEventName(v.market_name)} :- {this.cupWinner(v.market_name) ? '🏆 Winner' : 'MATCH ODDS'}<span onClick={() => this.setState({
                    opentool: !this.state.opentool,
                    toolmkid: v.mkid,
                    tooltitle: v.market_name
                  })} className="float-right info-icon"><IoMdInformationCircle></IoMdInformationCircle></span>
                </th>
                <th width="20%" className="back">Back</th>
                <th className="lay">Lay</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.runners
                  .filter(nv => (v.mkid === nv.mid))
                  .map((nv, nk) => {
                    return (
                      <tr key={nk}>
                        <td className="runner" width="60%">
                          <span title={v.market_name + " / Position"} role="button" onClick={() => {
                            if (this.props.role < 5) {
                              this.setState({
                                m_rtbl: true,
                                slip_market_id: nv.mid,
                                active_runners: this.state.runners.filter(v1 => v1.mid === nv.mid),
                                s_event: v.market_name + " / Position"
                              })
                            }
                          }}>{nv.n}</span>
                          <span
                            className={`bold float-right ${nv.rs === "LOSER" ? "text-danger" : "text-success"
                              }`}
                          >
                            {nv.rs && nv.rs !== "ACTIVE" ? nv.rs : ""}
                          </span>
                          <br />
                          <small
                            className={`bold ${nv.exp < 0 ? "text-danger" : "text-success"}`}
                          >
                            {nv.exp}
                          </small>
                        </td>
                        <td
                          onClick={() => {
                            this.setState({
                              show_slip: nv.m_lock === 1 || nv.lock === 1 ? false : true,
                              slip_obj: nv,
                              slip_type: "back",
                              stack: nv.b[0],
                              o_rate: nv.b[0],
                              active_runner_id: nv.rid.toString(),
                              active_runner_name: nv.n,
                              active_market_type: this.state.market_type[nv.mid],
                              active_runners: this.state.runners.filter(v1 => v1.mid === nv.mid),
                              slip_market_id: nv.mid,
                              eventid: nv.eid,
                              modeid: nv.mode,
                              s_event: v.market_name
                            });
                          }}
                          className={`${this.state.runners.length > 0 && this.state.runners[k].back_blink
                            ? this.state.runners[k].back_blink
                            : ""
                            } back`}
                          width="20%"
                        >
                          {nv.b[0]}
                          {(nv.m_lock === 1 || nv.lock === 1 ||
                            Math.ceil(nv.b[0]) === 0 ||
                            Math.ceil(nv.bs[0]) === 0) && (
                              <span className="lock"></span>
                            )}
                          <br />
                          <span className="size">{nv.bs[0]}</span>
                        </td>
                        <td
                          onClick={() => {
                            this.setState({
                              show_slip: nv.m_lock === 1 || nv.lock === 1 ? false : true,
                              slip_obj: nv,
                              slip_type: "lay",
                              stack: nv.l[0],
                              active_runner_id: nv.rid.toString(),
                              active_runner_name: nv.n,
                              active_market_type: this.state.market_type[nv.mid],
                              active_runners: this.state.runners.filter(v1 => v1.mid === nv.mid),
                              slip_market_id: nv.mid,
                              eventid: nv.eid,
                              modeid: nv.mode
                            });
                          }}
                          className={`${this.state.runners.length > 0 && this.state.runners[k].lay_blink
                            ? this.state.runners[k].lay_blink
                            : ""
                            } lay`}
                          width="20%"
                        >
                          {nv.l[0]}
                          {(nv.m_lock === 1 || nv.lock === 1 ||
                            Math.ceil(nv.l[0]) === 0 ||
                            Math.ceil(nv.ls[0]) === 0) && (
                              <span className="lock"></span>
                            )}
                          <br />
                          <span className="size">{nv.ls[0]}</span>
                        </td>
                      </tr>
                    );
                  }
                  )}
              {v.msg.length > 1 &&
                <tr key={`_${k}`}>
                  <td className='info-message text-primary' colSpan="3">{v.msg}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>))
    };

    if (this.state.extra_filter && this.state.extra_filter.length > 0) {
      E_T = this.state.extra_filter.map((v, k) => (
        <div className='table-responsive bg-white mb-1 shadow' key={k}>
          <table className="table table-sm table-odds">
            <thead>
              <tr className="text-center">
                <th width="60%" className="eventtype">
                  {this.parseEventName(v.en)} :- {v.market_name}<span onClick={() => this.setState({
                    opentool: !this.state.opentool,
                    toolmkid: v.mkid,
                    tooltitle: v.market_name
                  })} className="float-right info-icon"><IoMdInformationCircle></IoMdInformationCircle></span>
                </th>
                <th width="20%" className="back">Back</th>
                <th className="lay">Lay</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.extra_runners
                  .filter(nv => (v.mkid === nv.mkid))
                  .map((nv, nk) => {
                    return (
                      <tr key={nk}>
                        <td className="runner">
                          <span title={nv.n + " / Position"} role="button" onClick={() => {
                            if (this.props.role < 5) {
                              this.setState({
                                m_rtbl: true,
                                slip_market_id: nv.mkid,
                                active_runners: this.mapMarketId(
                                  this.state.extra_runners,
                                  nv.mkid
                                ),
                                s_event: nv.n + " / Position"
                              })
                            }
                          }}>{nv.n}</span>
                          <span
                            className={`bold float-right ${nv.rs === "LOSER" ? "text-danger" : "text-success"
                              }`}
                          >
                            {nv.rs && nv.rs !== "ACTIVE" ? nv.rs : ""}
                          </span>
                          <br />
                          <small
                            className={`bold ${nv.exp < 0 ? "text-danger" : "text-success"
                              }`}
                          >
                            {nv.exp}
                          </small>
                        </td>
                        <td
                          className={`back ${this.state.extra_runners.length > 0 &&
                            this.state.extra_runners[k].back_blink
                            ? this.state.extra_runners[k].back_blink
                            : ""
                            }`}
                          onClick={() => {
                            this.setState({
                              show_slip: nv.m_lock === 1 || nv.lock === 1 ? false : true,
                              slip_obj: nv,
                              slip_type: "back",
                              stack: nv.b[0],
                              active_runner_id: nv.rid.toString(),
                              active_runner_name: nv.n,
                              active_market_type: this.state.market_type[nv.mkid],
                              active_runners: this.mapMarketId(
                                this.state.extra_runners,
                                nv.mkid
                              ),
                              slip_market_id: nv.mkid,
                              eventid: nv.eid,
                              modeid: nv.mode,
                              s_event: v.en + "-" + v.market_name
                            });
                          }}
                        >
                          {nv.b[0]}
                          <br />
                          <span className="size">{nv.bs[0]}</span>
                          {(nv.m_lock === 1 || nv.lock === 1 ||
                            Math.ceil(nv.b[0]) === 0 ||
                            Math.ceil(nv.bs[0]) === 0) && (
                              <span className="lock"></span>
                            )}
                        </td>
                        <td
                          className={`lay ${this.state.extra_runners.length > 0 &&
                            this.state.extra_runners[k].lay_blink
                            ? this.state.extra_runners[k].lay_blink
                            : ""
                            }`}
                          onClick={() => {
                            this.setState({
                              show_slip: nv.m_lock === 1 || nv.lock === 1 ? false : true,
                              slip_obj: nv,
                              slip_type: "lay",
                              stack: nv.l[0],
                              active_runner_id: nv.rid.toString(),
                              active_runner_name: nv.n,
                              active_market_type: this.state.market_type[nv.mkid],
                              active_runners: this.mapMarketId(
                                this.state.extra_runners,
                                nv.mkid
                              ),
                              slip_market_id: nv.mkid,
                              eventid: nv.eid,
                              modeid: nv.mode,
                              s_event: v.en + "-" + v.market_name
                            });
                          }}
                        >
                          {nv.l[0]}
                          <br />
                          <span className="size">{nv.ls[0]}</span>
                          {(nv.m_lock === 1 || nv.lock === 1 ||
                            Math.ceil(nv.l[0]) === 0 ||
                            Math.ceil(nv.ls[0]) === 0) && (
                              <span className="lock"></span>
                            )}
                        </td>
                      </tr>
                    );
                  })}
              {v.msg.length > 1 &&
                <tr key={`_${k}`}>
                  <td className="text-primary info-message" colSpan="3">{v.msg}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      ));
    }
    if (this.state.line_runners && this.state.line_runners.length > 0) {
      LINE_SESSION = this.state.line_runners.map((v, k) => (
        <React.Fragment key={k}>
          <tr key={k}>
            <td className="runner" role="button" width="60%" >
              <span onClick={() => this.getLinePosition(v.mkid, v.rid, v.n)}>{v.n} ({this.parseEventName(v.en)})</span>
              <span onClick={() => this.setState({
                opentool: !this.state.opentool,
                toolmkid: v.mkid,
                tooltitle: v.n
              })} className="info-icon text-theme"><IoMdInformationCircle></IoMdInformationCircle></span>
              <br />
              {v.exp && (
                <small
                  className={`bold ${v.exp < 0 ? "text-danger" : "text-success"
                    }`}
                >
                  {v.exp}
                </small>
              )}
            </td>
            <td
              onClick={() => {
                this.setState({
                  show_slip: v.m_lock === 1 || v.lock === 1 ? false : true,
                  slip_obj: v,
                  slip_type: "lay",
                  stack: Math.ceil(v.b[0]),
                  o_rate: v.b[0],
                  opponent: Math.ceil(v.l[0]),
                  active_runner_id: v.rid.toString(),
                  active_runner_name: v.n,
                  active_market_type: this.state.market_type[v.mkid],
                  active_runners: [this.state.line_runners[k]],
                  slip_market_id: v.mkid,
                  eventid: v.eid,
                  modeid: v.mode,
                  s_event: v.en + "-" + this.state.market_type[v.mkid]
                });
              }}
              className={`lay ${this.state.line_runners.length > 0 &&
                this.state.line_runners[k].lay_blink
                ? this.state.line_runners[k].lay_blink
                : ""
                }`}
              width="20%"
            >
              {(v.m_lock === 1 || v.lock === 1 ||
                Math.ceil(v.b[0]) === 0 ||
                Math.ceil(v.bs[0]) === 0) && (
                  <span className="lock"></span>
                )}
              {Math.ceil(v.b[0])}
              <br />
              <span className="size">{v.bs[0]}</span>
            </td>
            <td
              className={`back ${this.state.line_runners.length > 0 &&
                this.state.line_runners[k].back_blink
                ? this.state.line_runners[k].back_blink
                : ""
                }`}
              onClick={() => {
                this.setState({
                  show_slip: v.m_lock === 1 || v.lock === 1 ? false : true,
                  slip_obj: v,
                  slip_type: "back",
                  stack: Math.ceil(v.l[0]),
                  o_rate: v.l[0],
                  active_runner_id: v.rid.toString(),
                  active_runner_name: v.n,
                  active_market_type: this.state.market_type[v.mkid],
                  active_runners: [this.state.line_runners[k]],
                  slip_market_id: v.mkid,
                  eventid: v.eid,
                  modeid: v.mode,
                  s_event: v.en
                });
              }}
              width="20%"
            >
              {(v.m_lock === 1 || v.lock === 1 ||
                Math.ceil(v.l[0]) === 0 ||
                Math.ceil(v.ls[0]) === 0) && (
                  <span className="lock"></span>
                )}
              {Math.ceil(v.l[0])}
              <br />
              <span className="size">{v.ls[0]}</span>
            </td>
          </tr>
          {v.msg &&
            <tr key={`_${k}`}>
              <td className="text-primary info-message" colSpan="3">{v.msg}</td>
            </tr>
          }
        </React.Fragment>
      ));
    }
    if (this.state.fancy_runners && this.state.fancy_runners.length > 0) {
      FANCY = this.state.fancy_runners.map((v, k) => (
        <React.Fragment key={k}>
          <tr key={k}>
            <td className="runner" role="button" width="60%">
              <span onClick={() => this.getLinePosition(v.mkid, v.rid, v.n)}>{v.n} ({this.parseEventName(v.en)})</span>
              <span onClick={() => this.setState({
                opentool: !this.state.opentool,
                toolmkid: v.mkid,
                tooltitle: v.n
              })} className="info-icon text-theme"><IoMdInformationCircle></IoMdInformationCircle></span>
              <br />
              {v.exp && (
                <small
                  className={`bold ${v.exp < 0 ? "text-danger" : "text-success"
                    }`}
                >
                  {v.exp}
                </small>
              )}
            </td>
            <td
              onClick={() => {
                this.setState({
                  show_slip: v.lock === 1 || v.m_lock === 1 ? false : true,
                  slip_obj: v,
                  slip_type: "lay",
                  stack: Math.ceil(v.l[0]),
                  o_rate: v.b[0],
                  size: v.ls[0] / 100,
                  opponent: Math.ceil(v.l[0]),
                  active_runner_id: v.rid.toString(),
                  active_runner_name: v.n,
                  active_market_type: "Fancy",
                  active_runners: [this.state.fancy_runners[k]],
                  slip_market_id: v.mkid,
                  eventid: v.eid,
                  modeid: v.mode,
                  s_event: v.en + "-" + this.state.market_type[v.mkid]
                });
              }}
              className={`lay ${this.state.fancy_runners.length > 0 &&
                this.state.fancy_runners[k].lay_blink
                ? this.state.fancy_runners[k].lay_blink
                : ""
                }`}
              width="20%"
            >
              {(v.m_lock === 1 || v.lock === 1 ||
                Math.ceil(v.l[0]) === 0 ||
                Math.ceil(v.ls[0]) === 0) && (
                  <span className="running">ball</span>
                )}
              {Math.ceil(v.l[0])}
              <br />
              <span className="size">{v.ls[0]}</span>
            </td>
            <td
              className={`back ${this.state.fancy_runners.length > 0 &&
                this.state.fancy_runners[k].back_blink
                ? this.state.fancy_runners[k].back_blink
                : ""
                }`}
              onClick={() => {
                this.setState({
                  show_slip: v.lock === 1 || v.m_lock === 1 ? false : true,
                  slip_obj: v,
                  slip_type: "back",
                  stack: Math.ceil(v.b[0]),
                  size: v.bs[0] / 100,
                  o_rate: v.l[0],
                  active_runner_id: v.rid.toString(),
                  active_runner_name: v.n,
                  active_market_type: "Fancy",
                  active_runners: [this.state.fancy_runners[k]],
                  slip_market_id: v.mkid,
                  eventid: v.eid,
                  modeid: v.mode,
                  s_event: v.en
                });
              }}
              width="20%"
            >
              {(v.m_lock === 1 || v.lock === 1 ||
                Math.ceil(v.b[0]) === 0 ||
                Math.ceil(v.bs[0]) === 0) && (
                  <span className="running">ball</span>
                )}
              {Math.ceil(v.b[0])}
              <br />
              <span className="size">{v.bs[0]}</span>
            </td>
          </tr>
          {v.msg &&
            <tr key={`_${k}`}>
              <td className="text-primary info-message" colSpan="3">{v.msg}</td>
            </tr>
          }
        </React.Fragment>
      ));
    }
    return (
      <React.Fragment>
        {this.state.logout && (
          <Navigate to="../../../../login" replace={true} />
        )}
        <React.Fragment>
          <div className="row">
            {
              this.state.loading && <Loader />
            }
            <div className={`d-first col-sm-6 ${FANCY ? 'col-md-4' : 'col-md-6'} pl-1 pr-1`}>
              {MATCH_ODDS && MATCH_ODDS}
              {E_T && E_T}
              {LINE_SESSION && (
                <div className="table-responsive bg-white mb-1 shadow">
                  <table className="table table-sm table-odds">
                    <thead>
                      <tr className="text-center">
                        <th className="eventtype">Line Session</th>
                        <th className="back">No</th>
                        <th className="lay">Yes</th>
                      </tr>
                    </thead>
                    {LINE_SESSION && (
                      <tbody>{LINE_SESSION}</tbody>
                    )}
                  </table>
                </div>
              )}
            </div>
            {FANCY && (<div className="d-middle col-sm-6 col-md-4  pl-1 pr-1">
              <div className="table-responsive bg-white mb-1 shadow">
                <table className="table table-sm table-odds">
                  <thead>
                    <tr className="text-center">
                      <th className="eventtype">FANCY</th>
                      <th className="back">No</th>
                      <th className="lay">Yes</th>
                    </tr>
                  </thead>
                  <tbody>{FANCY}</tbody>
                </table>
              </div>
            </div>)}
            <div className={`d-right col-sm-6 pl-1 pr-1 ${FANCY ? 'col-md-4' : 'col-md-6'}`}>
              <div className="overflow-auto">
                <table className="table table-bordered mb-2">
                  <thead>
                    <tr>
                      <th
                        colSpan={(this.props.role < 5 ? "8" : "5")}
                        className="p-0 border-0" style={{ minWidth: "455px" }}>
                        {this.props.role < 5 &&
                          (<button
                            title="Filter"
                            onClick={() => {
                              this.setState({
                                openfilter: !this.state.openfilter,
                              });
                            }}
                            className="btn btn-xs btn-outline-success shadow-sm ml-2 mr-1"
                          ><FiFilter></FiFilter></button>)}
                        <button
                          title="Match ODDS BETS"
                          onClick={() => {
                            this.setState({
                              openbook: true,
                              book_marketid: this.props.marketid,
                              book_type: 'tbl_runners',
                              fiter_by: "market_type",
                              book_title: this.state.eventname + " Match Odds",
                            });
                          }}
                          className="btn btn-outline-success bets-filter"
                        >Match Odds</button>
                        <button
                          title="Line Session BETS"
                          onClick={() => {
                            this.setState({
                              openbook: true,
                              book_marketid: this.props.marketid,
                              book_type: 'tbl_line_runners',
                              fiter_by: "market_type",
                              book_title: this.state.eventname + " Line Session",
                            });
                          }}
                          className="btn btn-outline-success bets-filter"
                        >Line Session</button>
                        <button
                          title="Fancy BETS"
                          onClick={() => {
                            this.setState({
                              openbook: true,
                              book_marketid: this.props.marketid,
                              book_type: 'tbl_fancy_runners',
                              fiter_by: "market_type",
                              book_title: this.state.eventname + " Fancy",
                            });
                          }}
                          className="btn btn-outline-success bets-filter"
                        >Fancy</button>
                        <button
                          title="Book Maker BETS"
                          onClick={() => {
                            this.setState({
                              openbook: true,
                              book_marketid: this.props.marketid,
                              book_type: 'tbl_odds_runners',
                              fiter_by: "market_type",
                              book_title: this.state.eventname + " Book Maker",
                            });
                          }}
                          className="btn btn-outline-success bets-filter"
                        >Book M</button>
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              {this.state.openfilter && (<fieldset className="p-2 border mb-2">
                <legend className='w-auto text-center h6'><span>Apply Filter:</span></legend>
                <form onSubmit={(e) => this.applyFilter(e)}>
                  <div className="col-6  float-left p-1">
                    <label className="mb-0">Market Wise</label>
                    <select onChange={(e) => {
                      let f_ob = { ...this.state.filter }
                      f_ob.type = e.target.value;
                      this.setState({
                        filter: f_ob
                      }, () => { this.getBetList() })
                    }} className="form-control">
                      <option value="" defaultValue="">All</option>
                      <option value="MATCH_ODDS">Match Odds</option>
                      <option value="LINE_SESSION">Line Session</option>
                      <option value="FANCY">Fancy</option>
                      <option value="BOOK_MAKER">Book Maker</option>
                    </select>
                  </div>
                  <div className="col-6  float-left p-1">
                    <label className="mb-0">User Name</label>
                    <input onInput={(e) => {
                      let f_ob = { ...this.state.filter }
                      f_ob.username = e.target.value;
                      this.setState({
                        filter: f_ob
                      })
                    }} className="form-control" placeholder="Bet By User Name" type="text" />
                  </div>
                  <div className="col-6  float-left p-1">
                    <label className="mb-0">Amount</label>
                    <input onInput={(e) => {
                      let f_ob = { ...this.state.filter }
                      f_ob.amount = e.target.value;
                      this.setState({
                        filter: f_ob
                      })
                    }} className="form-control" placeholder="Amount" type="number" />
                  </div>
                  <div className="col-6 float-left p-1">
                    <label className="col-12 invisible mb-4"></label>
                    <button title="Apply" className="btn btn-sm btn-theme" type="submit">Apply</button>
                    <button title="Reset" onClick={(e) => {
                      this.setState({
                        filter: {},
                      }, () => { this.getBetList() })
                    }} className="btn btn-sm btn-danger ml-1" type="reset">Reset</button>
                  </div>
                </form>
              </fieldset>)}
              <div className="table-responsive bg-white mb-1 shadow-lg">
                <table className="table table-sm table-betlist">
                  <thead>
                    <tr className="position-absolute" style={{ right: "0px" }}>
                      <th> <span className="btn p-1 badge badge-success">{this.state.betcount}</span></th>
                    </tr>
                    <tr className="row-header-betlist">
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
                      <th className="text-center">Time</th>
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
                    onClick={() => this.loadMore()}
                    title="Dil Mange More"
                    className="col-4 col-md-2 btn btn-sm btn-theme shadow"
                  >
                    Load More
                  </button>
                }
              </div>
            </div>
          </div>
        </React.Fragment>
        {this.state.show_slip &&
          this.state.stack &&
          this.props.role === 5 &&
          this.state.stack > 0.9 &&
          this.state.stack < 1000 && (
            <React.Suspense fallback={<Loader></Loader>}>
              <BetSlip
                eventid={this.state.eventid}
                modeid={this.state.modeid}
                stack={this.state.stack}
                o_rate={this.state.o_rate}
                slip_type={this.state.slip_type}
                title={this.state.s_event}
                slip_obj={this.state.slip_obj}
                slip_runners={this.state.active_runners}
                closeBetSlip={this.closeBetSlip}
                runner_id={this.state.active_runner_id}
                runner_name={this.state.active_runner_name}
                getRunnerPostion={this.getRunnerPostion}
                getBetList={this.getBetList}
                active_market_type={this.state.active_market_type}
                mid={this.state.slip_market_id}
                size={this.state.size}
                btns={this.state.btns}
                socket={this.socket}
              ></BetSlip>
            </React.Suspense>
          )}
        {this.state.openbook && (
          <React.Suspense fallback={<Loader></Loader>}>
            <Book
              closeBook={this.closeBook}
              betlist={this.state.betlist}
              market_id={this.state.book_marketid}
              book_type={this.state.book_type}
              dateFormate={this.dateFormate}
              title={this.state.book_title}
              {...this.props}
            ></Book>
          </React.Suspense>
        )}
        {this.state.openpostion && (
          <React.Suspense fallback={<Loader></Loader>}>
            <Position
              closePosition={this.closePosition}
              position={this.state.position}
              title={this.state.book_title}
            ></Position>
          </React.Suspense>
        )}
        {
          this.state.opentool &&
          <React.Suspense fallback={<Loader></Loader>}>
            <ToolTip closeToolTip={this.closeToolTip} mid={this.state.toolmkid} title={this.state.tooltitle}></ToolTip>
          </React.Suspense>
        }
        {
          this.state.m_rtbl &&
          <React.Suspense fallback={<Loader></Loader>}>
            <PopUp title={this.state.s_event} closePopUp={this.closeBook}>
              <TablePosition bets={this.state.betlist.length} runners={this.state.active_runners} market_id={this.state.slip_market_id} />
            </PopUp>
          </React.Suspense>
        }
        {this.state.message && <React.Suspense fallback={""}><Message alertclass={this.state.alertclass} message={this.state.message} /></React.Suspense>}
      </React.Fragment>
    );
  }
}
export default MyMarket;
