import React, { useEffect, useState, useContext } from "react";
import { NavLink, useParams } from "react-router-dom";
import StoreContext from "../../../Store";

import Loader from "../../../utilities/Loader";
import AlertBox from "../../../components/AlertBox";

import AddAmountBox from "./AddAmountBox";
//import ConfirmPlayers from "./ConfirmPlayers";
import { GiCricketBat, GiStopwatch, GiLockedBox } from "react-icons/gi";
import {
  EyeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import moment from "moment";

const MarketList = (props) => {
  const store = useContext(StoreContext);
  let { eventid, market, eventtype } = useParams();

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
  const [score, setScore] = useState({});

  const [buttons, setButtons] = useState("");
  const [selectedBtn, setSelectedBtn] = useState({});

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
      main_market_id: market,
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
      main_market_id: market,
      //status: "SELECT",
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };
    fetch(
      import.meta.env.VITE_API_HOST + "/event/getSelRunersSingle",
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
          setSelectedCheckboxes([...selectedCheckboxes, ...result.data]);
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
        import.meta.env.VITE_API_HOST + "/event/selectSingleRunner",
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
            //setAutoSelect([...tr, result.data[0].runnerId]);
            //setSelectedCheckboxes([...selectedCheckboxes, 616]);

            getSelectedRunners();
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
    // const isValuePresent = selectedMarkets.includes(data.id);
    // if (!isValuePresent) {
    //   setMessage("Empty selection box, select player again!");
    //   setErrorClass("alert-danger");
    //   return false;
    // }

    // console.log(selectedBtn)
    // console.log(amount)
    // console.log(playerList[0].id)
    //console.log(data)

    if (!selectedBtn[playerList[0].id]) {
      setMessage(
        "Empty selection box, Select 1st Inning Total Score Last Digit!"
      );
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
      lastDigit: selectedBtn[playerList[0].id],
      amount: amount[data.id],
      eventtype: eventtype,
      main_market_id: data.main_market_id,
      selection: false,
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
        if (response.status === 200) {
          setErrorClass("alert-success");
        }
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
        if (result.event_timeout === 1) props.navigate(`/events`);
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
      main_market_id: market,
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

  const handleButtonClick1 = (mid, val) => {
    setScore((prevAmount) => ({
      ...prevAmount,
      [mid]: val,
    }));
  };

  const handleBackClick = () => {
    // Logic to go back (e.g., using React Router or window.history)
    window.history.back();
  };

  function incrementCount(mid, amt) {
    amt = amt + 1;
    setAmount((prevAmount) => ({
      ...prevAmount,
      [mid]: amt,
    }));
  }
  function decrementCount(mid, amt) {
    amt = amt - 1;
    setAmount((prevAmount) => ({
      ...prevAmount,
      [mid]: amt,
    }));
  }

  if (loading) return <Loader></Loader>;

  //console.log(eventtype);
  //console.log(selectedCheckboxes);
  return (
    <>
      <div className="row" key="markets">
        {/* {eventStatus['bet_lock'] == 1} */}
        {marketList.map((v, k) => (
          <>
            <div className="col-12 col-md-5 p-0" key={k}>
              <div className="card" key={k}>
                <div className="card-header text-center">
                  <button
                    className="btn btn-sm btn-secondary float-left"
                    onClick={handleBackClick}
                  >
                    Back
                  </button>

                  <span className="badge badge-pill badge-warning text-border font-weight-bold title-e text-center">
                    <GiCricketBat className="w-6 text-dark"></GiCricketBat>
                    {eventStatus.event_name}
                  </span>
                </div>
                <div className="card-body" key={k}>
                  <div className="col-12 row btn btn-sm btn-light" key={k}>
                    <div className="card-title">
                      <span className="float-left title-m badge badge-dark text-center">
                        {v.market_name}
                      </span>
                      <span className="float-right text-danger badge badge-pill badge-warning">
                        Exp: {expMarket[v.id] ? expMarket[v.id] : 0}
                      </span>
                    </div>

                    {/* //NOT Confirm markets */}
                    {confirmMarkets.includes(v.id) == false ? (
                      v.visible == null || v.parent_visible == 1 ? (
                        <div className="container mt-4" key={k}>
                          <div className="row" key={k}>
                            <div className="col" key={k}>
                              <ul className="list-group row">
                                <li className="list-group-item list-group-item-info">
                                  {/* {eventStatus.team1} Team1 */}
                                  1ST INNING TOTAL SCORE
                                </li>
                                {playerList.map((v1, i) =>
                                  v1.market_id == v.id && v1.team == 1 ? (
                                    <>
                                      <li
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                        key={v1.id}
                                      >
                                        {eventStatus.bet_lock === 0 &&
                                        v.parent_locked == 0 &&
                                        (selectedCheckboxes == "" ||
                                          autoSelect.includes(v1.id)) ? (
                                          <>
                                            {v.main_market_id == 5 ? (
                                              <>
                                                {Array.from(
                                                  { length: 10 },
                                                  (_, b) => (
                                                    <button
                                                      type="button"
                                                      className={
                                                        "mr-1 mt-1 btn btn-sm " +
                                                        (selectedBtn[v1.id] ===
                                                        b
                                                          ? "btn-secondary"
                                                          : "btn-danger")
                                                      }
                                                      onClick={() =>
                                                        setSelectedBtn({
                                                          ...selectedBtn,
                                                          [v1.id]: b,
                                                        })
                                                      }
                                                    >
                                                      {b}
                                                    </button>
                                                  )
                                                )}
                                              </>
                                            ) : v.main_market_id == 4 ? (
                                              <>
                                                <input
                                                  placeholder="ENTER TOTAL SCORE"
                                                  type="number"
                                                  value={selectedBtn[v1.id] || ""}
                                                  onChange={(e) =>
                                                    setSelectedBtn({
                                                      ...selectedBtn,
                                                      [v1.id]: e.target.value, 
                                                    })
                                                  }
                                                  maxLength="150"
                                                  className="ml-1 mb-2 text-center w-75"
                                                  required
                                                />
                                              </>
                                            ) : null}
                                          </>
                                        ) : (
                                          <>
                                            {/* {eventStatus.bet_lock} */}
                                            <span className="lock"></span>
                                            <LockClosedIcon className="w-6"></LockClosedIcon>
                                          </>
                                        )}
                                      </li>
                                    </>
                                  ) : null
                                )}
                              </ul>
                            </div>
                          </div>
                          {/* <!-- Bet Place button --> */}
                          <div className="row">
                            <div className="col mt-2 ">
                              {eventStatus.bet_lock === 0 &&
                              v.parent_locked == 0 ? (
                                <>
                                  <div className="text-center">
                                    <button
                                      className="btn btn-sm btn-dark mr-1 "
                                      onClick={(e) =>
                                        decrementCount(v.id, amount[v.id])
                                      }
                                    >
                                      -
                                    </button>
                                    <input
                                      placeholder="Bet Amount"
                                      type="number"
                                      value={amount[v.id]}
                                      onChange={(e) =>
                                        handleButtonClick(v.id, e.target.value)
                                      }
                                      maxLength="50"
                                      className="mb-2 text-center w-50"
                                      required
                                    />
                                    <button
                                      className="btn btn-sm btn-dark ml-1 "
                                      onClick={(e) =>
                                        incrementCount(v.id, amount[v.id])
                                      }
                                    >
                                      +
                                    </button>
                                  </div>
                                  <div className="text-center">
                                    {buttons &&
                                      buttons.map((v6, k) => (
                                        <button
                                          type="button"
                                          className={
                                            "mr-1 mt-1 btn btn-sm " +
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
                                  <div className="text-center mt-2">
                                    <NavLink
                                      to="#"
                                      className="btn btn-lg btn-success btn-outline-red btn-block"
                                      onClick={() => handleConfirmClick(v)}
                                      disabled
                                    >
                                      Bet Place {/* Press Confirm to Play */}
                                    </NavLink>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <NavLink
                                    to="#"
                                    className="btn btn-lg btn-dark float-left btn-block disabled"
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
                        <div className="container mt-4">
                          This Market unavailable to bet.
                        </div>
                      )
                    ) : (
                      // //Confirmed player records****************************
                      <div className="container mt-4" key={k}>
                        <div className="row" key={k}>
                          <div className="col-12" key={k}>
                            <ul className="list-group">
                              <li className="list-group-item list-group-item-info">
                                User (Your Selection)
                              </li>
                              {confirmPlayers.map((v1, i) =>
                                v1.market_id == v.id && v1.type == "user" ? (
                                  <>
                                    <li className="list-group-item list-group-item-info d-flex justify-content-between align-items-center">
                                      {/* <input
                                            key={v1.id}
                                            type="checkbox"
                                            //defaultChecked={true}
                                            checked={true}
                                            disabled={true}
                                            className="text-success bg-success"
                                          /> */}
                                      <CheckCircleIcon className="w-6 text-success"></CheckCircleIcon>
                                      <i className="badge badge-danger badge-pill">
                                        {v1.run_digit}
                                      </i>
                                      -<i className="">{v1.runner_name}</i>
                                      <CheckIcon className="w-6 text-success"></CheckIcon>
                                      {/* <span className="ml-2 bold">
                                        {v1.runner_name} - {v1.run_digit}
                                      </span> */}
                                    </li>
                                  </>
                                ) : null
                              )}
                            </ul>
                          </div>

                          <div className="col mt-1">
                            <i className="text-success">
                              Player Confirmed{" "}
                              <CheckCircleIcon className="w-6 text-success"></CheckCircleIcon>
                            </i>
                            {/* <button
                                  className="btn btn-lg btn-success float-right disable"
                                  disabled={true}
                                >
                                  Confirmed
                                </button> */}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ))}
      </div>

      {message && (
        <AlertBox
          message={message}
          closeMessage={closeMessage}
          className={errorClass}
        ></AlertBox>
      )}
      {/* {AddAmountPop && (
        <AddAmountBox
          title="Amount Confirmation:"
          event_id={eventid}
          market_id={mkId}
          amount={amount[mkId] ? amount[mkId] : 1}
          market_name={mkName}
          event_name={eventStatus.event_name}
          exposer={expMarket[mkId] ? expMarket[mkId] : 0}
          closeModal={closeModal}
          messageModal={messageModal}
        ></AddAmountBox>
      )} */}

      {/* {confirmFlag && (
        <ConfirmPlayers
          title="You have Selected following Players"
          event_id={eventid}
          market_id={mkId}
          market_name={mkName}
          closeModal={closeModal}
           returnConfirmModal={returnConfirmModal}
        ></ConfirmPlayers>
      )} */}
    </>
  );
};

export default MarketList;
