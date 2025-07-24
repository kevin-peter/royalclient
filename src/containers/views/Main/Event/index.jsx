import React from "react";
import socketIOClient from "socket.io-client";
import { FiLock, FiTv, FiFilter } from "react-icons/fi";
import { IoMdInformationCircle } from "react-icons/io";
import { Navigate } from "react-router-dom";
import Loader from "../../../../utilities/loader/loader";
import NS from "./../../../../sound/short_notification.mp3"

const Book = React.lazy(() => import("./Book"));
const Position = React.lazy(() => import("./Postion"));
const Tv = React.lazy(() => import("./Tv"));
const ToolTip = React.lazy(() => import("./ToolTip"));
const Score = React.lazy(() => import("./Score"));
const Message = React.lazy(() => import("../../../../Helper/notifyMessage"));
const PopUp = React.lazy(() => import("../../../../Helper/PopUp"));
const BetSlip = React.lazy(() => import("./BetSlip"));
const TablePosition = React.lazy(() => import("./TablePosition"));

const ENDPOINT = process.env.REACT_APP_SOCKET;
class EventPage extends React.Component {
  constructor(props) {
    super();
    this.state = {
      loading: true,
      eventname: "...",
      tv: 0,
      voice: 0,
      eventdata: {},
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
      my_market_ids: [],
      active_market_type: "",
      s_event: "",
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
      scoredata: '',
      opentv: '',
      marquee: '',
      m_rtbl: false,
      more_disable: false,
      page: 1,
      limit: 20,
      filter: {},
      fancy_lock: 0,
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
      limit: this.props.role < 5 ? 20 : 20
    });
    if (this.props.eventdata) {
      this.setState(
        {
          eventname: (this.props.eventdata.eventname) ? this.parseEventName(this.props.eventdata.eventname) : "",
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
              : [],
          loading: (this.props.eventdata.eventname) ? false : true,
        }
      );
    }
    this.getRunners();
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
      if (parseInt(this.state.stop) > 1) {
        let market_ids = [...this.state.market_ids];
        this.socket.emit("event", {
          eid: this.props.eventid,
          mid: market_ids.join(),
        });
      }
    });

    this.socket.on("score", (res) => {
      this.setState({
        scoredata: res.data
      })
    });

    this.socket.on("data", this.changeData);
    this.socket.on("updaterunner", (data) => {
      if (data.eid && data.eid === this.props.eventid) {
        if (data.action && data.action === "updatebets") {
          this.getBetList();
        } else if (data.action && (data.action === "updatelock")) {
          this.getRunners(data.mid);
        } else if (data.action === "updatemessage") {
          this.getRunners();
        }
        else if (data.action && data.action === "resultrunner") {
          let market_ids = [...this.state.market_ids];
          let index = market_ids.indexOf(data.mid);
          if (index > -1) {
            market_ids.splice(index, 1);
          }
          this.getRunners(data.mid);
          this.getBetList();
          for (let i = 0; i < market_ids.length; i++) {
            this.getRunnerPostion(market_ids[i]);
          }
          this.setState({
            my_market_ids: market_ids
          });
        }
        else if (data.action && data.action === "placebet") {
          if (this.props.ps && data.data.ps && data.data.ps.includes(this.props.ps)) {
            if ('vibrate' in navigator) {
              navigator.vibrate(500);
            }
            const sound = new Audio(NS);
            sound.play();
            this.getBetList(data.mid);
          }
        }
        else if (data.action && data.action === "revoke") {
          let market_ids = [...this.state.market_ids];
          let index = market_ids.indexOf(data.mid);
          if (index === -1) {
            market_ids.push(data.mid);
          }
          this.getRunners(data.mid);
          this.getBetList();
          for (let i = 0; i < market_ids.length; i++) {
            this.getRunnerPostion(market_ids[i]);
          }
          this.setState({
            my_market_ids: market_ids
          });

        } else if (data.action && data.action === "exposerupdate") {
          if (data.client && data.client.toUpperCase() === this.props.username) {
            this.getRunnerPostion();
          }
        }
      } else {
        if (data.action && (data.action === "updatebets" || data.action === "placebet")) {
          if (this.props.ps && data.data.ps && data.data.ps.includes(this.props.ps)) {
            if ('vibrate' in navigator) {
              navigator.vibrate(500);
            }
            const sound = new Audio(NS);
            sound.play();
            this.getRunnerPostion(data.mid)
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
  getRunners(marketid = "") {
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("event_id", this.props.eventid);
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
          let eventname = result.data.event_name ? result.data.event_name : "...";
          let tv = result.data.tv;
          let voice = result.data.voice;
          if (eventname !== this.state.eventname) {
            this.props.setEventName(this.parseEventName(eventname));
          }
          let rn = [];
          let ls = [];
          let ext = [];
          let fn = [];
          let ext_filt = [];
          let market_type = {};
          let market_ids = [this.props.marketid, ...this.state.market_ids];
          let show_slip = true;

          if (result.data && result.data.runners) {
            if (!result.data.visible) {
              window.history.back();
            }
            for (let i = 0; i < result.data.runners.length; i++) {
              market_type[result.data.runners[i].market_id] = "Match Odds";
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

              rn[i]["n"] = result.data.runners[i].name;
              rn[i]["rid"] = result.data.runners[i].runnerId;
              rn[i]["mkid"] = result.data.runners[i].market_id;
              rn[i]["msg"] = result.data.runners[i].msg ? result.data.runners[i].msg : null;
              rn[i]["exp"] = (this.state.runners.length > i) ? this.mapAllExposure(rn[i]["rid"], rn[i]["mkid"], this.state.runners) : "";
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
              if (this.state.slip_market_id === result.data.runners[i].market_id) {
                if (rn[i]["lock"] || rn[i]["m_lock"]) {
                  show_slip = false;
                }
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
              ls[i]["rid"] = result.data.line_runners[i].runnerId;
              ls[i]["mkid"] = result.data.line_runners[i].market_id;
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

              if (!market_ids.includes(result.data.line_runners[i].market_id)) {
                market_ids.push(result.data.line_runners[i].market_id);
              }
              if (this.state.slip_market_id === result.data.line_runners[i].market_id) {
                if (ls[i]["lock"] || ls[i]["m_lock"]) {
                  show_slip = false;
                }
              }
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
              fn[i]["rid"] = result.data.fancy_runners[i].runnerId;
              fn[i]["mkid"] = result.data.fancy_runners[i].market_id;
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

              if (!market_ids.includes(result.data.fancy_runners[i].market_id)) {
                market_ids.push(result.data.fancy_runners[i].market_id);
              }
              if (this.state.slip_market_id === result.data.fancy_runners[i].market_id) {
                if (fn[i]["lock"] || fn[i]["m_lock"]) {
                  show_slip = false;
                }
              }
            }
          }
          if (result.data && result.data.extra_runners) {
            for (let i = 0; i < result.data.extra_runners.length; i++) {
              if (i === 0) {
                ext_filt.push({
                  market_name: result.data.extra_runners[i].market_name,
                  mkid: result.data.extra_runners[i].market_id,
                  msg: result.data.extra_runners[i].msg,
                  sm_lock: result.data.extra_runners[i].sm_lock,
                  mlock: result.data.extra_runners[i].mlock,
                  ad_lock: result.data.extra_runners[i].ad_lock,
                });
              } else if (i > 0) {
                if (
                  result.data.extra_runners[i - 1].market_id !==
                  result.data.extra_runners[i].market_id
                ) {
                  ext_filt.push({
                    market_name: result.data.extra_runners[i].market_name,
                    mkid: result.data.extra_runners[i].market_id,
                    msg: result.data.extra_runners[i].msg,
                    lock: result.data.extra_runners[i].sm_lock
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
              ext[i]["market_name"] = result.data.extra_runners[i].market_name;
              ext[i]["rid"] = result.data.extra_runners[i].runnerId;
              ext[i]["mkid"] = result.data.extra_runners[i].market_id;
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

              ext[i]["msg"] = result.data.extra_runners[i].msg ? result.data.extra_runners[i].msg : null;
              ext[i]["exp"] = (this.state.extra_runners.length > i) ? this.mapAllExposure(ext[i]["rid"], ext[i]["mkid"], this.state.extra_runners) : "";

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
              if (
                !market_ids.includes(result.data.extra_runners[i].market_id)
              ) {
                market_ids.push(result.data.extra_runners[i].market_id);
              }
              if (this.state.slip_market_id === result.data.extra_runners[i].market_id) {
                if (ext[i]["lock"] || ext[i]["m_lock"]) {
                  show_slip = false;
                }
              }
            }
          }
          if (rn.length === 0 && ls.length === 0 && ext.length === 0) {
            window.history.back();
          }
          if (!this.state.mounted) {
            let i = 1;
            for (const key in market_type) {
              ((i) => {
                setTimeout(() => {
                  this.getRunnerPostion(key);
                }, 300 * i);
              })(i)
              i++;
            }
          }
          this.setState(
            {
              eventname: this.parseEventName(eventname),
              tv: tv,
              voice: voice,
              runners: rn,
              line_runners: [...ls],
              fancy_runners: [...fn],
              extra_runners: [...ext],
              extra_filter: [...ext_filt],
              market_type: market_type,
              market_ids: [...market_ids],
              loading: false
            },
            () => {
              this.socket.emit("event", {
                eid: this.props.eventid,
                mid: this.state.market_ids.join(),
              });
              if (!show_slip && this.state.show_slip) {
                this.closeBetSlip()
              }
            }
          );
        }
      })
      .then(() => {
        if (!this.state.mounted) {
          this.getBetList();
        }
        if (marketid) {
          this.getRunnerPostion(marketid);
        }
      })
      .catch((error) => {
        console.log("error", error);
        this.setState({
          loading: false
        })
      })
  }
  mapExposure(runner_id, data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].runner_id === runner_id) {
        return data[i].exp ? parseInt(data[i].exp) : "";
      }
    }
  }
  mapAllExposure(rid, market_id, data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].mkid === market_id && data[i].rid === rid) {
        return data[i].exp ? parseInt(data[i].exp) : "";
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
  getRunnerPostion = (marketid = "") => {
    let urlencoded = new URLSearchParams();
    let market_id = marketid ? marketid : this.props.marketid;
    urlencoded.append("event_id", this.props.eventid);
    urlencoded.append("mode_id", this.props.modeid);
    urlencoded.append("market_id", market_id);
    let market_type = this.state.market_type[market_id];
    let exp_url = (this.props.role < 5 && (market_type === 'Fancy' || market_type === 'Line Session'))
      ? "getRunnerPositionParent" : "getExposerAdmin";
    fetch(import.meta.env.VITE_API_HOST + "/" + exp_url, {
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
        let runner = [...this.state.runners];
        let extra_runners = [...this.state.extra_runners];
        let line_runners = [...this.state.line_runners];
        let fancy_runners = [...this.state.fancy_runners];
        let exp = "";
        if (result.success && market_type === "Match Odds") {
          if (runner && result.data.runners.length > 0) {
            for (let i = 0; i < runner.length; i++) {
              runner[i].exp = this.mapExposure(
                runner[i].rid,
                result.data.runners
              );
            }
          }
        }
        if (result.success && market_type === "Line Session") {
          exp = "";
          for (let i = 0; i < line_runners.length; i++) {
            if (line_runners[i].mkid === market_id) {
              if (this.props.role < 5) {
                exp = result.data.mainExp !== 0 ? parseInt(result.data.mainExp) : "";
              } else {
                exp = result.data.runners.length > 0 && result.data.runners[0].exp
                  ? parseInt(result.data.runners[0].exp) : "";
              }
              line_runners[i].exp = isNaN(exp) ? "" : exp;
            }
          }
        }
        if (result.success && market_type === "Fancy") {
          exp = "";
          for (let i = 0; i < fancy_runners.length; i++) {
            if (fancy_runners[i].mkid === market_id) {
              if (this.props.role < 5) {
                exp = result.data.mainExp !== 0 ? parseInt(result.data.mainExp) : "";
              } else {
                exp = result.data.runners.length > 0 && result.data.runners[0].exp
                  ? parseInt(result.data.runners[0].exp) : "";
              }
              fancy_runners[i].exp = isNaN(exp) ? "" : exp;
            }
          }
        }
        if (result.success && (market_type === "Extra Market" || market_type === "Book Maker")) {
          if (extra_runners && result.data.runners.length > 0) {
            for (let i = 0; i < extra_runners.length; i++) {
              if (extra_runners[i].mkid === market_id) {
                extra_runners[i].exp = this.mapExposure(
                  extra_runners[i].rid,
                  result.data.runners
                );
              }
            }
          }
        }
        let updatetime = new Date().getTime();
        let eventdata = this.state.eventdata;
        eventdata.updatetime = updatetime;
        eventdata.eventname = this.state.eventname;
        this.setState(
          {
            runners: runner,
            eventdata: eventdata,
          },
          () => {
            this.catchData();
            if (result.data && ('exp' in result.data)) {
              this.props.updateBal(result.data);
            }
          }
        );
      });
  };
  getBetList = (marketid = "") => {
    let urlencoded = new URLSearchParams();
    urlencoded.append("event_id", this.props.eventid);
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
          let market_ids = [];
          let matched =
            result.data && result.data.matched ? result.data.matched : [];
          this.setState(
            {
              betlist: matched,
              my_market_ids: market_ids,
              mounted: true,
              betcount: result.data && result.data.total ? result.data.total : "",
              page: 1
            },
            () => {
              this.catchData();
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
      if (this.state.slip_market_id === n_data.mo.mkid) {
        if (m_lock) {
          this.closeBetSlip()
        }
      }
      if (this.state.market_type[n_data.mo.mkid] === "Match Odds") {
        for (let i = 0; i < n_data.mo.rn.length; i++) {
          let md = this.runnerFilter(n_data.mo.rn, runners[i].rid);
          runners[i]["back_blink"] =
            runners[i]["b"][0] !== n_data.mo.rn[i].b[0] ? "back_blink" : "";
          runners[i]["lay_blink"] =
            runners[i]["l"][0] !== n_data.mo.rn[i].l[0] ? "lay_blink" : "";
          runners[i]["rs"] = n_data.mo.rn[i].rs ? n_data.mo.rn[i].rs : "";
          runners[i]["n"] = this.state.runners[i]
            ? this.state.runners[i].n
            : "";
          runners[i]["exp"] = this.state.runners[i]
            ? this.state.runners[i].exp
            : "";
          if (md && md.length > 0) {
            runners[i]["b"] = md[0].b;
            runners[i]["bs"] = md[0].bs;
            runners[i]["l"] = md[0].l;
            runners[i]["ls"] = md[0].ls;
          }
          runners[i]["m_lock"] = m_lock;
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
        let k = 0;
        for (let j = 0; j < this.state.extra_runners.length; j++) {
          if (this.state.extra_runners[j].mkid === n_data.mo.mkid) {
            let ed = this.runnerFilter(n_data.mo.rn, this.state.extra_runners[j].rid);
            if (n_data.mo.mkid.startsWith("1.")) {
              extra_runners[j]["back_blink"] =
                extra_runners[j]["b"][0] !== n_data.mo.rn[k].b[0]
                  ? "back_blink"
                  : "";
              extra_runners[j]["lay_blink"] =
                extra_runners[j]["l"][0] !== n_data.mo.rn[k].l[0]
                  ? "lay_blink"
                  : "";
            }

            extra_runners[j]["exp"] = this.state.extra_runners[j]
              ? this.state.extra_runners[j].exp
              : "";
            if (ed && ed.length > 0) {
              extra_runners[j]["rs"] = ed[0].rs;
              extra_runners[j]["b"] = ed[0].b;
              extra_runners[j]["bs"] = ed[0].bs;
              extra_runners[j]["l"] = ed[0].l;
              extra_runners[j]["ls"] = ed[0].ls;
            }
            extra_runners[j]["m_lock"] = m_lock;
            // if (n_data.mo.mkid.startsWith("12.") && ed[0].l[0] > 2.02) {
            //   extra_runners[j]["m_lock"] = 1;
            // }
            k++;
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
  runnerFilter = (rn, rid) => {
    return rn.filter((v) => String(v.rid) === String(rid));
  }
  tick = () => {
    let stop = parseInt(this.state.stop) + 1;
    if (parseInt(stop) > 4) {
      stop = 0;
      let market_ids = [...this.state.market_ids];
      this.socket.emit("event", {
        eid: this.props.eventid,
        mid: market_ids.join(),
      });
    }
    this.setState({
      stop: stop,
    });
  };
  closeBetSlip = (message, alertclass) => {
    this.setState({
      show_slip: false,
      slip_market_id: "",
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
    if (window.innerWidth < 480) {
      let arr = eve.split(" v ");
      if (arr.length > 1) {
        new_name = arr[0].substring(0, 3) + " v " + arr[1].substring(0, 3);
      } else {
        new_name = eve.substring(0, 15)
      }
    }
    return new_name;
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
    urlencoded.append("event_id", this.props.eventid);
    urlencoded.append("mode_id", this.props.modeid);
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
      });
  };
  applyFilter = (e, flag = true) => {
    e.preventDefault();
    this.getBetList();
  }

  lockMarket(v) {
    let urlencoded = new URLSearchParams();
    let flag = 1;
    if (v.mkid) {
      urlencoded.append("market_id", v.mkid);
    }
    if (this.props.eventid) {
      urlencoded.append("event_id", this.props.eventid);
    }
    if (this.props.role === 4) {
      flag = v.mlock === 1 ? 0 : 1;
    }
    if (this.props.role === 3) {
      flag = v.sm_lock === 1 ? 0 : 1;
    }
    if (this.props.role === 2) {
      flag = v.ad_lock === 1 ? 0 : 1;
    }
    urlencoded.append("flag", flag);

    fetch(import.meta.env.VITE_API_HOST + "/lockMarket", {
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
        if (result && result.success) {
          this.getRunners()
          this.setState({
            message: result.message,
            alertclass: flag === 1 ? "alert-danger" : "alert-success"
          }, () => {
            setTimeout(() => {
              this.setState({
                message: "",
              })
            }, 1000)
          })
          this.socket.emit("updatelock", {
            eid: this.props.eventid,
            mid: v.mkid
          });
        }
      })

  }
  render() {
    let MATCH_ODDS;
    let LINE_SESSION;
    let FANCY = [];
    let E_T;
    let L_E_T = [];

    if (this.state.runners && this.state.runners.length > 0) {
      MATCH_ODDS = this.state.runners.map((v, k) => (
        <React.Fragment key={k}>
          <tr key={k}>
            <td className="runner" width="60%">
              <span title={this.state.market_type[this.props.marketid] + " / Position"} role="button" onClick={() => {
                if (this.props.role < 5) {
                  this.setState({
                    m_rtbl: true,
                    slip_market_id: this.props.marketid,
                    active_runners: [...this.state.runners],
                    s_event: this.state.market_type[this.props.marketid] + " / Position"
                  })
                }
              }}>{v.n}</span>
              <span
                className={`bold float-right ${v.rs === "LOSER" ? "text-danger" : "text-success"
                  }`}
              >
                {v.rs && v.rs !== "ACTIVE" ? v.rs : ""}
              </span>
              <br />
              <small
                className={`bold ${v.exp < 0 ? "text-danger" : "text-success"}`}
              >
                {v.exp}
              </small>
            </td>
            <td
              onClick={() => {
                this.setState({
                  show_slip: v.m_lock === 1 || v.lock === 1 ? false : true,
                  slip_obj: v,
                  slip_type: "back",
                  stack: v.b[0],
                  o_rate: v.b[0],
                  active_runner_id: v.rid.toString(),
                  active_runner_name: v.n,
                  active_market_type: this.state.market_type[this.props.marketid],
                  active_runners: [...this.state.runners],
                  slip_market_id: this.props.marketid,
                  s_event: this.state.eventname + "-" + this.state.market_type[this.props.marketid]
                });
              }}
              className={`${this.state.runners.length > 0 && this.state.runners[k].back_blink
                ? this.state.runners[k].back_blink
                : ""
                } back`}
              width="20%"
            >
              {v.b[0]}
              {(v.m_lock === 1 || v.lock === 1 ||
                Math.ceil(v.b[0]) === 0 ||
                Math.ceil(v.bs[0]) === 0) && (
                  <span className="lock"></span>
                )}
              <br />
              <span className="size">{v.bs[0].toString().replace(".", "")}</span>
            </td>
            <td
              onClick={() => {
                this.setState({
                  show_slip: v.m_lock === 1 || v.lock === 1 ? false : true,
                  slip_obj: v,
                  slip_type: "lay",
                  stack: v.l[0],
                  active_runner_id: v.rid.toString(),
                  active_runner_name: v.n,
                  active_market_type: this.state.market_type[this.props.marketid],
                  active_runners: [...this.state.runners],
                  slip_market_id: this.props.marketid,
                  s_event: this.state.eventname + "-" + this.state.market_type[this.props.marketid]
                });
              }}
              className={`${this.state.runners.length > 0 && this.state.runners[k].lay_blink
                ? this.state.runners[k].lay_blink
                : ""
                } lay`}
              width="20%"
            >
              {v.l[0]}
              {(v.m_lock === 1 || v.lock === 1 ||
                Math.ceil(v.l[0]) === 0 ||
                Math.ceil(v.ls[0]) === 0) && (
                  <span className="lock"></span>
                )}
              <br />
              <span className="size">{v.ls[0].toString().replace(".", "")}</span>
            </td>
          </tr>
          {k === this.state.runners.length - 1 &&
            <tr key={`_${k}`}>
              <td className='info-message text-primary' colSpan="3">{this.state.runners[0].msg}</td>
            </tr>
          }
        </React.Fragment>
      ));
    }
    if (this.state.extra_filter && this.state.extra_filter.length > 0) {
      E_T = this.state.extra_filter.map((v, k) => (
        <div className='table-responsive bg-white mb-1 shadow' key={k} m_type={v.market_name}>
          <table className="table table-sm table-odds">
            <thead>
              <tr className="text-center">
                <th width="60%" className="eventtype">
                  {v.market_name}<span onClick={() => this.setState({
                    opentool: !this.state.opentool,
                    toolmkid: v.mkid,
                    tooltitle: v.market_name
                  })} className="float-right info-icon"><IoMdInformationCircle></IoMdInformationCircle></span>
                  {/* {this.props.role < 5 && this.state.mounted && <button onClick={() => this.lockMarket(v)} className={`btn btn-sm badge ${(v.ad_lock === 1 && this.props.role === 2) || (v.sm_lock === 1 && this.props.role === 3) || (v.mlock === 1 && this.props.role === 4) ? "badge-danger" : "badge-success"}`}> <FiLock></FiLock></button>} */}
                </th>
                <th width="20%" className="back">Back</th>
                <th className="lay">Lay</th>
              </tr>
            </thead>
            <tbody>
              {this.state.extra_runners
                .filter(nv => (v.mkid === nv.mkid))
                .map((nv, nk) => {
                  return (
                    <React.Fragment key={nk}>
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
                            && (nv.mkid.startsWith("1.") || nv.mkid.startsWith("12."))
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
                              s_event: this.state.eventname + "-" + v.market_name
                            });
                          }}
                        >
                          {nv.b[0]}
                          <br />
                          <span className="size">{Math.ceil(nv.bs[0])}</span>
                          {(nv.m_lock === 1 || nv.lock === 1 ||
                            Math.ceil(nv.b[0]) === 0 ||
                            Math.ceil(nv.bs[0]) === 0) && (
                              <span className="lock"></span>
                            )}
                        </td>
                        <td
                          className={`lay ${this.state.extra_runners.length > 0 &&
                            this.state.extra_runners[k].lay_blink
                            && (nv.mkid.startsWith("1.") || nv.mkid.startsWith("12."))
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
                              s_event: this.state.eventname + "-" + v.market_name
                            });
                          }}
                        >
                          {nv.l[0]}
                          <br />
                          <span className="size">{Math.ceil(nv.ls[0])}</span>
                          {(nv.m_lock === 1 || nv.lock === 1 ||
                            Math.ceil(nv.l[0]) === 0 ||
                            Math.ceil(nv.ls[0]) === 0) && (
                              <span className="lock"></span>
                            )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              {v.msg.length > 1 &&
                <tr key={`_${k}`}>
                  <td className="info-message text-primary" colSpan="3">{v.msg}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      ));
      if (E_T.length > 0) {
        const last_mrkt = [
          "Tied Match", "Completed Match"
        ]
        for (let i = 0; i < E_T.length; i++) {
          if (last_mrkt.includes(E_T[i].props.m_type) || E_T[i].props.m_type.toUpperCase().includes("DIGIT")) {
            L_E_T.push(E_T[i]);
            delete (E_T[i]);
          }
        }
      }
    }
    if (this.state.line_runners && this.state.line_runners.length > 0) {
      LINE_SESSION = this.state.line_runners.map((v, k) => (
        <React.Fragment key={k}>
          <tr key={k}>
            <td className="runner" role="button" width="60%" >
              <span onClick={() => this.getLinePosition(v.mkid, v.rid, v.n)}>{v.n}</span>
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
                  s_event: this.state.eventname + "-" + this.state.market_type[v.mkid]
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
                  <span className="lock">
                    <FiLock></FiLock>
                  </span>
                )}
              {Math.ceil(v.b[0])}
              <br />
              <span className="size">{Math.ceil(v.bs[0])}</span>
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
                  s_event: this.state.eventname + "-" + this.state.market_type[v.mkid]
                });
              }}
              width="20%"
            >
              {(v.m_lock === 1 || v.lock === 1 ||
                Math.ceil(v.l[0]) === 0 ||
                Math.ceil(v.ls[0]) === 0) && (
                  <span className="lock">
                    <FiLock></FiLock>
                  </span>
                )}
              {Math.ceil(v.l[0])}
              <br />
              <span className="size">{Math.ceil(v.ls[0])}</span>
            </td>
          </tr>
          {v.msg &&
            <tr key={`_${k}`}>
              <td className='info-message text-primary' colSpan="3">{v.msg}</td>
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
              <span onClick={() => this.getLinePosition(v.mkid, v.rid, v.n)}>{v.n}</span>
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
                  s_event: this.state.eventname + "-" + this.state.market_type[v.mkid]
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
              <td className='info-message text-primary' colSpan="3">{v.msg}</td>
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
            <div className={`d-first col-sm-6 ${(FANCY.length > 0 || L_E_T.length > 0) ? 'col-md-4' : 'col-md-6'} pl-1 pr-1`}>
              {window.innerWidth < 992 && this.state.opentv && <React.Suspense fallback={<Loader></Loader>}><Tv {...this.props}></Tv></React.Suspense>}

              {this.state.scoredata && <React.Suspense fallback={<Loader></Loader>}><Score scoredata={this.state.scoredata}></Score></React.Suspense>}
              {MATCH_ODDS && (
                <div className="table-responsive bg-white mb-1 shadow">
                  <table className="table table-sm table-odds">
                    <thead>
                      <tr className="text-center">
                        <th className="eventtype">Match Odds {this.state.tv !== 0 && <span className="tv-icon" role="link" title="Play" onClick={() => this.setState({
                          opentv: !this.state.opentv
                        })}><FiTv></FiTv></span>}
                          {this.state.voice !== 0 && <span className="inline-flex align-bottom ml-2" style={{ maxWidth: "30px" }}><iframe className="align-bottom" style={{ width: "30px", marginBottom: "-3px" }} height="23" width="23" title="tota" src={}></iframe></span>}
                          <span role="link" title="Info" onClick={() => this.setState({
                            opentool: !this.state.opentool,
                            toolmkid: this.props.marketid,
                            tooltitle: this.state.eventname + " Match Odds"
                          })} className="float-right info-icon"><IoMdInformationCircle></IoMdInformationCircle></span>

                        </th>
                        <th className="back">Back</th>
                        <th className="lay">Lay</th>
                      </tr>
                    </thead>
                    <tbody>{MATCH_ODDS}</tbody>
                  </table>
                </div>)}
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
            {(FANCY.length > 0 || L_E_T.length > 0) && (<div className="d-middle col-sm-6 col-md-4  pl-1 pr-1">
              {FANCY.length > 0 &&
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
              }
              {L_E_T.length > 0 && L_E_T}
            </div>)}

            <div className={`d-right col-sm-6 pl-1 pr-1 ${(FANCY.length > 0 || L_E_T.length > 0) ? 'col-md-4' : 'col-md-6'}`}>
              {window.innerWidth > 992 && this.state.opentv && <React.Suspense fallback={<Loader></Loader>}><Tv {...this.props}></Tv></React.Suspense>}
              {this.props.modeid === 4 && (
                <div className="overflow-auto">
                  <table className="table table-bordered mb-2">
                    <thead>
                      <tr>
                        <th
                          colSpan={(this.props.role < 5 ? "8" : "5")}
                          className="p-0 border-0" style={{ minWidth: "455px" }}>
                          {this.props.role < 5 && this.props.modeid === 4 && (
                            <button
                              title="Filter"
                              onClick={() => {
                                this.setState({
                                  openfilter: !this.state.openfilter,
                                });
                              }}
                              className="btn btn-xs btn-outline-success shadow ml-2 mr-1"
                            ><FiFilter></FiFilter></button>)}
                          {this.props.modeid === 4 && (
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
                            >Match Odds</button>)}
                          {this.props.modeid === 4 && (
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
                            >Line Session</button>)}
                          {this.props.modeid === 4 && (
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
                            >Fancy</button>)}
                          {this.props.modeid === 4 && (<button
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
                          >Book M</button>)}
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
              )}
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
              <div className="table-responsive bg-white shadow-lg">
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
                          <th className='text-right'>USER</th>
                          <th className="text-center">Ref.</th>
                          <th className="text-center">IP</th>
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
                                <td className="text-center text-primary"><span role="button" title={v.device_info}>{v.ip_addr}</span></td>
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
          this.state.stack > 0.9 &&
          this.props.role === 5 &&
          this.state.stack < 1000 && (
            <React.Suspense fallback={<Loader></Loader>}>
              <BetSlip
                {...this.props}
                stack={this.state.stack}
                o_rate={this.state.o_rate}
                slip_type={this.state.slip_type}
                title={this.state.s_event}
                active_market_type={this.state.active_market_type}
                slip_obj={this.state.slip_obj}
                slip_runners={this.state.active_runners}
                closeBetSlip={this.closeBetSlip}
                runner_id={this.state.active_runner_id}
                runner_name={this.state.active_runner_name}
                getRunnerPostion={this.getRunnerPostion}
                getBetList={this.getBetList}
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
            <ToolTip modes={this.props.play_mods} role={this.props.role} closeToolTip={this.closeToolTip} mid={this.state.toolmkid} title={this.state.tooltitle}></ToolTip>
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
export default EventPage;
