import React, { useEffect, useState, useContext } from "react";
import { NavLink, useParams } from "react-router-dom";
import StoreContext from "../../../Store";

import Loader from "../../../utilities/Loader";
import AlertBox from "../../../components/AlertBox";

import AddAmountBox from "./AddAmountBox";
//import ConfirmPlayers from "./ConfirmPlayers";
import { GiCricketBat, GiStopwatch, GiLockedBox } from "react-icons/gi";
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
    }, 2000);

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

    fetch(import.meta.env.VITE_API_HOST + "/event/getMarketsC", requestOptions)
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
    setLoading(true);
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
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  const addRunner = (e, data, tr) => {
    setLoading(true);
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
      //console.log("false data");
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
      main_market_id: data.main_market_id,
      selection: true,
      
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

  if (loading) return <Loader></Loader>;

  //console.log(amount);
  //console.log(selectedMarkets);
  return (
    <>
      <div className="row" key="markets">
        {/* {eventStatus['bet_lock'] == 1} */}
        {marketList.map(
          (v, k) =>
            (
              <>
                <div className="col-12 col-md-3 p-0" key={k}>
                  <div className="card" key={k}>
                    <div className="card-header text-center">
                      <span className="badge badge-pill badge-warning text-border font-weight-bold title-e text-center">
                        <GiCricketBat className="w-6 text-dark"></GiCricketBat>
                        {eventStatus.event_name}
                      </span>
                    </div>
                    <div className="card-body" key={k}>
                      <div className="col-12 btn btn-sm btn-light" key={k}>
                        <div className="card-title">
                          <span className="float-left title-m badge badge-dark text-center">
                            {v.market_name}
                          </span>
                          <span className="float-right text-danger badge badge-pill badge-warning">
                            Exp: {expMarket[v.id] ? expMarket[v.id] : 0}
                            
                          </span>
                        </div>
                        {/* <div className="card-subtitle">
                          <div className="col-12 row mt-2 pt-2">
                            {buttons &&
                              buttons.map((v6, k) => (
                                <button
                                  type="button"
                                  className={
                                    "mr-1 btn btn-sm " +
                                    (amount[v.id] == v6.b_value
                                      ? "btn-warning"
                                      : "btn-dark")
                                  }
                                  onClick={() =>
                                    handleButtonClick(v.id, v6.b_value)
                                  }
                                >
                                  {v6.b_name}
                                </button>
                              ))}
                          </div>
                        </div> */}
                        {/* //NOT Confirm markets */}
                        {confirmMarkets.includes(v.id) == false ? (
                          (v.visible == null || v.parent_visible == 1) ? (
                          <div className="container mt-4" key={k}>
                            <div className="row" key={k}>
                              <div className="col" key={k}>
                                <ul className="list-group">
                                  <li className="list-group-item list-group-item-info">
                                    {eventStatus.team1} {/* Team1 */}
                                  </li>
                                  {playerList.map((v1, i) =>
                                    v1.market_id == v.id && v1.team == 1 ? (
                                      <>
                                        <li
                                          className="list-group-item d-flex justify-content-between align-items-center"
                                          key={v1.id}
                                        >
                                          {eventStatus.bet_lock === 0 &&
                                          v.parent_locked == 0 ? (
                                            <input
                                              key={v1.id}
                                              type="checkbox"
                                              //defaultChecked={true}
                                              onChange={(e) => {
                                                let t_r = [...autoSelect];
                                                const index = t_r.indexOf(
                                                  v1.id
                                                );
                                                if (index !== -1) {
                                                  t_r.splice(index, 1);
                                                } else {
                                                  t_r.push(v1.id);
                                                }

                                                addRunner(e, v1, t_r);
                                              }}
                                              checked={autoSelect.includes(
                                                v1.id
                                              )}
                                              disabled={selectedCheckboxes.includes(
                                                v1.id
                                              )}
                                            />
                                          ) : (
                                            <>
                                              {/* {eventStatus.bet_lock} */}
                                              <span className="lock"></span>
                                              <LockClosedIcon className="w-6"></LockClosedIcon>
                                            </>
                                          )}
                                          <span className="badge badge-info badge-pill">
                                            {v1.name}
                                          </span>
                                        </li>
                                      </>
                                    ) : null
                                  )}
                                </ul>
                              </div>
                              <div className="col">
                                <ul className="list-group">
                                  <li className="list-group-item list-group-item-info">
                                    {eventStatus.team2} {/* Team 2 */}
                                  </li>
                                  {playerList.map((v1, i) =>
                                    v1.market_id == v.id && v1.team == 2 ? (
                                      <>
                                        <li
                                          className="list-group-item d-flex justify-content-between align-items-center"
                                          key={v1.id}
                                        >
                                          {eventStatus.bet_lock === 0 &&
                                          v.parent_locked == 0 ? (
                                            <input
                                              key={v1.id}
                                              type="checkbox"
                                              //defaultChecked={true}
                                              onChange={(e) => {
                                                let t_r = [...autoSelect];
                                                const index = t_r.indexOf(
                                                  v1.id
                                                );
                                                if (index !== -1) {
                                                  t_r.splice(index, 1);
                                                } else {
                                                  t_r.push(v1.id);
                                                }

                                                addRunner(e, v1, t_r);
                                              }}
                                              checked={autoSelect.includes(
                                                v1.id
                                              )}
                                              disabled={selectedCheckboxes.includes(
                                                v1.id
                                              )}
                                            />
                                          ) : (
                                            <>
                                              <span className="lock"></span>
                                              <LockClosedIcon className="w-6"></LockClosedIcon>
                                            </>
                                          )}
                                          <span className="badge badge-info badge-pill">
                                            {v1.name}
                                          </span>
                                        </li>
                                      </>
                                    ) : null
                                  )}
                                </ul>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col mt-2 ">
                                {eventStatus.bet_lock === 0 &&
                                v.parent_locked == 0 ? (
                                  <>
                                    <input
                                      placeholder="Bet Amount"
                                      type="text"
                                      value={amount[v.id]}
                                      onChange={(e) =>
                                        handleButtonClick(v.id, e.target.value)
                                      }
                                      maxLength="50"
                                      className="mb-1 text-center"
                                      required
                                    />
                                    <NavLink
                                      to="#"
                                      className="btn btn-lg btn-success float-left ml-5"
                                      onClick={() => handleConfirmClick(v)}
                                      disabled
                                    >
                                      Bet Place {/* Press Confirm to Play */}
                                    </NavLink>
                                  </>
                                ) : (
                                  <>
                                    <NavLink
                                      to="#"
                                      className="btn btn-lg btn-dark float-left disabled"
                                    >
                                      <LockClosedIcon className=""></LockClosedIcon>
                                      Bet Place
                                    </NavLink>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          ) : (
                            <div className="container mt-4">This Market unavailable to bet.</div>  
                          )
                        ) : (
                          // //Confirmed player records****************************
                          <div className="container mt-4" key={k}>
                            <div className="row" key={k}>
                              <div className="col" key={k}>
                                <ul className="list-group">
                                  <li className="list-group-item list-group-item-info">
                                    User
                                  </li>
                                  {confirmPlayers.map((v1, i) =>
                                    v1.market_id == v.id &&
                                    v1.type == "user" ? (
                                      <>
                                        <li className="list-group-item list-group-item-info">
                                          <input
                                            key={v1.id}
                                            type="checkbox"
                                            //defaultChecked={true}
                                            checked={true}
                                            disabled={true}
                                            className="text-success bg-success"
                                          />
                                          <i>{v1.runner_name}</i>
                                        </li>
                                      </>
                                    ) : null
                                  )}
                                </ul>
                              </div>
                              <div className="col">
                                <ul className="list-group">
                                  <li className="list-group-item list-group-item-secondary">
                                    System
                                  </li>
                                  {confirmPlayers.map((v1, i) =>
                                    v1.market_id == v.id &&
                                    v1.type == "system" ? (
                                      <>
                                        <li className="list-group-item list-group-item-secondary">
                                          <input
                                            key={v1.id}
                                            type="checkbox"
                                            //defaultChecked={true}
                                            checked={true}
                                            disabled={true}
                                            className="text-success bg-success"
                                          />
                                          <i>{v1.runner_name}</i>
                                        </li>
                                      </>
                                    ) : null
                                  )}
                                </ul>
                              </div>
                              <div className="col mt-1">
                                {/* <i>Players Summary</i> */}
                                <button
                                  className="btn btn-lg btn-success float-right disable"
                                  disabled={true}
                                >
                                  Confirmed
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )
        )}
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
