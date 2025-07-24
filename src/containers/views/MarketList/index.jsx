import React, { useEffect, useState, useContext } from "react";
import { NavLink, useParams } from "react-router-dom";
import StoreContext from "../../../Store";

import Loader from "../../../utilities/Loader";
import AlertBox from "../../../components/AlertBox";

import AddAmountBox from "./AddAmountBox";
//import ConfirmPlayers from "./ConfirmPlayers";
import {
  GiCricketBat,
  GiCricket,
  GiStopwatch,
  GiLockedBox,
} from "react-icons/gi";
import { MdSportsCricket, MdSportsEsports } from "react-icons/md";
import { FcSportsMode } from "react-icons/fc";
import { CiTrophy } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { FaCoins } from "react-icons/fa";

import { EyeIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import moment from "moment";

const MarketList = (props) => {
  const store = useContext(StoreContext);
  let { eventid, eventtype } = useParams();

  //let type = "";
  //let { type } = (localStorage.getItem("event_data")) ? JSON.parse(localStorage.getItem("event_data")) : "";
  const [loading, setLoading] = useState(false);
  const [AddAmountPop, setAddAmountPop] = useState(false);
  const [marketList, setList] = useState([]);
  const [playerList, setPlayers] = useState([]);
  const [eventStatus, setEventStatus] = useState([]);
  // const [isPlyer, setIsPlayer] = useState(false);

  //const [userSelection, setUserSelection] = useState([]);
  const [autoSelect, setAutoSelect] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [confirmMarkets, setConfirmMarkets] = useState([]);
  const [confirmPlayers, setConfirmPlayers] = useState([]);
  const [expMarket, setExpMarket] = useState([]);
  const [expMarketAmt, setExpMarketAmt] = useState([]);
  const [amount, setAmount] = useState({});

  const [buttons, setButtons] = useState("");

  const [message, setMessage] = useState();
  const [errorClass, setErrorClass] = useState("alert-success");

  const [confirmFlag, setConfirmFlag] = useState(false);
  const [mkId, setMkId] = useState(0);
  const [mkName, setMkName] = useState("");
  const [userExp, setUserExp] = useState({});
  const [adminExp, setAdminExp] = useState({});

  useEffect(() => {
    // setLoading(true);
    getEventStatus();
    getMarkets();
    getSelectedRunners();
    getButtons();
    const intervalId = setInterval(() => {
      getEventStatus();
      getMarkets();
      getButtons();
      getSelectedRunners();
    }, 20000000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const getMarkets = async (e) => {
    // setLoading(true);

    const urlencoded = {
      event_id: eventid,
    };

    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    let requestOptions = {
      method: "POST",
      headers: headers,
      redirect: "follow",
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/getMarkets", requestOptions)
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.data) setList(result.data);
        if (result.players) setPlayers(result.players);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getSelectedRunners = () => {
    //setLoading(true);
    //user select player
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

    let urlencoded = "";

    urlencoded = {
      event_id: eventid,
      //status: "SELECT",
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };
    fetch(
      import.meta.env.VITE_API_HOST + "/event/getSelRuners",
      requestOptions
    )
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.success == true) {
          setConfirmMarkets([...confirmMarkets, ...result.confirmedMarkets]);
          //setConfirmPlayers([...confirmPlayers, ...result.confirmedPlayers]);
          setConfirmPlayers(result.confirmedPlayers);
          setExpMarket(result.expMarket);
          setExpMarketAmt(result.amtTaken);
          setAutoSelect([...autoSelect, ...result.data]);
          setSelectedCheckboxes([...selectedCheckboxes, ...result.system]);
          setSelectedMarkets(result.markets);

          if (result.bal.length > 0) {
            store.setItem("bal", result.bal[0]["amount"]);
            store.setItem("exp", result.bal[0]["exposer"]);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const unSelectRunners = (e, data, tr) => {
    if (e.target.checked == false) {
      //user select player
      let headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

      let urlencoded = "";

      urlencoded = {
        event_id: eventid,
        market_id: data.market_id,
        runnerId: data.id,
        sequence: data.sequence,
        team: data.team,
        //status: "SELECT",
      };

      let requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(urlencoded),
      };
      fetch(
        import.meta.env.VITE_API_HOST + "/event/unSelectRunner",
        requestOptions
      )
        .then((response) => {
          if (response.status === 403) {
            props.navigate(`/login`);
          } else {
            return response.json();
          }
        })
        .then((result) => {
          if (result.success == true) {
            setAutoSelect(
              autoSelect.filter((item) => !result.data.includes(item))
            );
            setSelectedCheckboxes(
              selectedCheckboxes.filter((item) => !result.data.includes(item))
            );
            setExpMarket(result.expMarket);
            setExpMarketAmt("1");
          }

          setMessage(result.message);
          setErrorClass("alert-success");
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  const addRunner = (e, data, tr) => {
    if (e.target.checked == true) {
      //user select player
      let headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

      let urlencoded = "";

      urlencoded = {
        event_id: eventid,
        market_id: data.market_id,
        runnerId: data.id,
        runner_name: data.name,
        sequence: data.sequence,
        team: data.team,
        main_market_id: data.main_market_id,
        eventType: eventtype,
        eventStatus: eventStatus,
        //status: "SELECT",
      };

      let requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(urlencoded),
      };
      fetch(
        import.meta.env.VITE_API_HOST + "/event/selectRunner",
        requestOptions
      )
        .then((response) => {
          if (response.status === 403) {
            props.navigate(`/login`);
          } else {
            return response.json();
          }
        })
        .then((result) => {
          if (result.success == true) {
            setAutoSelect([...tr, result.runner[0].id]);
            setSelectedCheckboxes([...selectedCheckboxes, result.runner[0].id]);
            //localStorage.setItem("userExp_" + result.mkId, result.user_exp);
            getSelectedRunners();
            //setUserExp(result.user_exp)
            setMessage(result.message);
            setErrorClass("alert-success");
          }
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setSelectedMarkets(
        selectedMarkets.filter((item) => item !== data.market_id)
      );
      unSelectRunners(e, data, tr);
      //getSelectedRunners();
      console.log("false data");
    }
  };

  const closeModal = async (e) => {
    setAddAmountPop(false);
    setMkId("");
    setMkName("");
    setUserExp("");

    getMarkets();
    getSelectedRunners();
  };

  const messageModal = async (e) => {
    setMessage(e);
  };

  const handleConfirmClick = (data) => {
    const isValuePresent = selectedMarkets.includes(data.id);
    if (!isValuePresent) {
      setMessage("Empty selection box, select player again!");
      setErrorClass("alert-danger");
      return false;
    }

    if (!amount[data.id]) {
      setMessage("Bet amount required!");
      setErrorClass("alert-danger");
      return false;
    }

    //popup code start
    // setAddAmountPop(true);
    // setMkId(data.id);
    // setMkName(data.market_name);
    // setUserExp(expMarket[data.id]);
    //popup code end

    setLoading(true);

    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    const urlencoded = {
      event_id: eventid,
      market_id: data.id,
      event_name: eventStatus.event_name,
      amount: amount[data.id],
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(
      import.meta.env.VITE_API_HOST + "/event/confirmPlayers",
      requestOptions
    )
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        //setConfirmFlag(false);
        getMarkets();
        getSelectedRunners();
        setMessage(result.message);
        if (!result.success) {
          setErrorClass("alert-danger");
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getEventStatus = async (e) => {
    //setLoading(true);

    const urlencoded = {
      event_id: eventid,
    };

    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    let requestOptions = {
      method: "POST",
      headers: headers,
      redirect: "follow",
      body: JSON.stringify(urlencoded),
    };

    fetch(
      import.meta.env.VITE_API_HOST + "/event/getEventStatus",
      requestOptions
    )
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if(result.event_timeout === 1) props.navigate(`/events`);
        if (result.data[0]) setEventStatus(result.data[0]);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getButtons = async (e) => {
    const urlencoded = {
      event_id: eventid,
    };

    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    let requestOptions = {
      method: "POST",
      headers: headers,
      redirect: "follow",
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/getButtons", requestOptions)
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.data) setButtons(result.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        //setLoading(false);
      });
  };

  const closeMessage = async (e) => {
    setMessage(false);
  };

  const handleButtonClick = (mid, val) => {
    setAmount((prevAmount) => ({
      ...prevAmount,
      [mid]: val,
    }));
  };
  
  const handleBackClick = () => {
    // Logic to go back (e.g., using React Router or window.history)
    window.history.back();
  };

  if (loading) return <Loader></Loader>;

  //console.log(amount);
  //console.log(selectedMarkets);
  return (
    <>
      <div className="row" key="markets">
        {/* {eventStatus['bet_lock'] == 1} */}

        <div className="col-12 col-md-4 p-0">
          <div className="card">
            <div className="card-header text-center">
            <button className="btn btn-sm btn-secondary float-right" onClick={handleBackClick}>Back</button>
              <span className="badge badge-pill badge-warning text-border font-weight-bold title-e text-center">
                <FcSportsMode className="float-left"></FcSportsMode>
                <GiCricketBat className="w-6 text-dark"></GiCricketBat>
                {eventStatus.event_name}
              </span>
            </div>
            <div className="card-body">
              {marketList.map((v, k) => (
                <>
                  <FcSportsMode className="w-6 text-warning float-left"></FcSportsMode>
                  <GiCricketBat className="w-6 text-success float-left"></GiCricketBat>
                  <span className="float-right text-danger badge badge-pill badge-warning">
                    Exp: {expMarket[v.id] ? expMarket[v.id] : 0}
                  </span>
                  {/* Conditional rendering based on main_market_id */}
                  {v.main_market_id === 8 || v.main_market_id === 10 ? (
                    <NavLink
                      title="Other"
                      to={
                        `/livemarket2/` +
                        eventid +
                        "/" +
                        v.main_market_id +
                        "/" +
                        eventtype
                      }
                      style={{ color: "#FFF" }}
                    >
                      <div className="col-12 card-title btn btn-dark text-center">
                        <MdSportsEsports className="w-6 text-warning float-left"></MdSportsEsports>
                        {v.market_name}
                        <MdSportsCricket className="w-6 text-light float-right"></MdSportsCricket>
                      </div>
                    </NavLink>
                  ) : v.main_market_id === 1 || v.main_market_id === 2 || v.main_market_id === 6 || v.main_market_id === 7 || v.main_market_id === 11 ? (
                    <NavLink
                      title="Other"
                      to={
                        `/livemarket/` +
                        eventid +
                        "/" +
                        v.main_market_id +
                        "/" +
                        eventtype
                      }
                      style={{ color: "#FFF" }}
                    >
                      <div className="col-12 card-title btn btn-dark text-center">
                        <MdSportsEsports className="w-6 text-warning float-left"></MdSportsEsports>
                        {v.market_name}
                        <MdSportsCricket className="w-6 text-light float-right"></MdSportsCricket>
                      </div>
                    </NavLink>
                  ) : v.main_market_id === 9 ? (
                    <NavLink
                    title="Other"
                    to={
                      `/pairBet/` +
                      eventid +
                      "/" +
                      v.main_market_id +
                      "/" +
                      eventtype
                    }
                    style={{ color: "#FFF" }}
                  >
                    <div className="col-12 card-title btn btn-dark text-center">
                      <MdSportsEsports className="w-6 text-warning float-left"></MdSportsEsports>
                      {v.market_name}
                      <MdSportsCricket className="w-6 text-light float-right"></MdSportsCricket>
                    </div>
                  </NavLink>
                  ) : v.main_market_id === 3 ? (
                    <NavLink
                      title="Other"
                      to={
                        `/oddEven/` +
                        eventid +
                        "/" +
                        v.main_market_id +
                        "/" +
                        eventtype
                      }
                      style={{ color: "#FFF" }}
                    >
                      <div className="col-12 card-title btn btn-dark text-center">
                        <MdSportsEsports className="w-6 text-warning float-left"></MdSportsEsports>
                        {v.market_name}
                        <MdSportsCricket className="w-6 text-light float-right"></MdSportsCricket>
                      </div>
                    </NavLink>
                ) : v.main_market_id === 4 || v.main_market_id === 5 ? (
                  <NavLink
                      title="Inning Total Score"
                      to={
                        `/inningScore/` +
                        eventid +
                        "/" +
                        v.main_market_id +
                        "/" +
                        eventtype
                      }
                      style={{ color: "#FFF" }}
                    >
                      <div className="col-12 card-title btn btn-dark text-center">
                        <MdSportsEsports className="w-6 text-warning float-left"></MdSportsEsports>
                        {v.market_name}
                        <MdSportsCricket className="w-6 text-light float-right"></MdSportsCricket>
                      </div>
                    </NavLink>
                  ) : null }
                </>
              ))}
            </div>
          </div>
        </div>
      </div>

      {message && (
        <AlertBox
          message={message}
          closeMessage={closeMessage}
          className={errorClass}
        ></AlertBox>
      )}
    </>
  );
};

export default MarketList;
