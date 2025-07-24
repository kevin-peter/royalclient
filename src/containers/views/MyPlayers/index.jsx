import React, { useEffect, useState, useContext } from "react";
import { NavLink, useParams } from "react-router-dom";
import StoreContext from "../../../Store";

import Loader from "../../../utilities/Loader";

import { GiCricketBat, GiStopwatch } from "react-icons/gi";
import {
  EyeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";

const MarketList = (props) => {
  const store = useContext(StoreContext);
  let { eventid, eventtype } = useParams();

  //let type = "";
  //let { type } = (localStorage.getItem("event_data")) ? JSON.parse(localStorage.getItem("event_data")) : "";
  const [loading, setLoading] = useState(false);
  const [eventList, setList] = useState([]);
  const [mkIds, setMkIds] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [expEvent, setExpEvent] = useState([]);
  const [expMarket, setExpMarket] = useState([]);
  const [players, setPlayers] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState("");
  const [event_id, setEventId] = useState(0);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [market_id, setMarketId] = useState(0);

  let k = 0;
  useEffect(() => {
    getEvents();
    //getMarkets();
    // getPlayers();
  }, []);

  const getEvents = async (e) => {
    setLoading(true);

    // const urlencoded = {
    //   event_id: eventid,
    // };

    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    let requestOptions = {
      method: "POST",
      headers: headers,
      redirect: "follow",
      // body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/getEvents", requestOptions)
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.data) setList(result.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getMarkets = async (eventId) => {
    setLoading(true);

    const urlencoded = {
      event_id: eventId,
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
      import.meta.env.VITE_API_HOST + "/event/getMyMarketsByEvent",
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
        if (result.data) {
          setMarkets(result.data);
          setExpEvent(result.expMarket);
          setExpMarket(result.all_exp);
          setMkIds([...mkIds, ...result.mkIds]);
          console.log(result.data);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getPlayers = async (e) => {
    setLoading(true);

    // const urlencoded = {
    //   event_id: eventid,
    // };

    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    let requestOptions = {
      method: "POST",
      headers: headers,
      redirect: "follow",
      // body: JSON.stringify(urlencoded),
    };

    fetch(
      import.meta.env.VITE_API_HOST + "/event/getMyPlayers",
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
        if (result.data) setPlayers(result.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getRuns = async (e) => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));
    const urlencoded = {
      event_id: eventid,
      eventtype: eventtype,
      result_type: "RUN",
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/result/getResults", requestOptions)
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {})
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEventChange = (e) => {
    setEventId(e.target.value);
    setSelectedEvent(e.target.value);
    setSelectedMarket("");
    getMarkets(e.target.value);
  };
  const handleMarketChange = (e) => {
    setSelectedMarket(e.target.value);
    setMarketId(e.target.value);
    getPlayers();
    // getResults(e.target.value);
  };

  //console.log(markets);
  if (loading) return <Loader></Loader>;

  return (
    <>
      <div className="row">
        <div className="col-6 mt-3">
          <select
            name="market"
            value={selectedEvent} // Bind to state
            onChange={handleEventChange} // Handle selection change
            className="mr-3 mb-3"
          >
            <option value="">Select Event</option>
            {eventList.map((v) => (
              <option key={v.event_id} value={v.event_id}>
                {v.event_name}
              </option>
            ))}
          </select>
          {/* </div>
        <div className="col-3 mt-3"> */}
          <select
            name="market"
            value={selectedMarket} // Bind to state
            onChange={handleMarketChange} // Handle selection change
          >
            <option value="">Select Market</option>
            {markets.map((v) => (
              <option key={v.main_market_id} value={v.main_market_id}>
                {v.market_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row" key="markets">
        {eventList &&
          eventList.map(
            (v, k) =>
              v.event_id == selectedEvent && (
                <div className="col-12 col-md-4 p-0" key={k}>
                  <div className="card" key={k}>
                    <div className="card-header text-center">
                      <GiCricketBat className="w-6 text-dark float-left"></GiCricketBat>
                      <span className="float-left title-e badge badge-warning text-center">
                        {v.event_name}
                      </span>
                      <span className="float-right text-danger badge badge-pill badge-warning">
                        Total Exp:{" "}
                        {expEvent[v.event_id] ? expEvent[v.event_id] : 0}
                      </span>
                    </div>
                    <div className="card-body p-2" key={k}>
                      {/* <div className="card-title">
                        <span className="float text-danger badge badge-pill badge-warning">
                          Current Market Exp: {expEvent[v.event_id] ? expEvent[v.event_id] : 0}
                        </span>
                      </div> */}

                      <div className="container" key={k}>
                        <div className="row" key={k}>
                          <ul class="list-group">
                            {markets.length != 0 &&
                              markets.map(
                                (v1, k1) =>
                                  v1.event_id == v.event_id &&
                                  v1.main_market_id == selectedMarket && (
                                    <li
                                      className="list-group-item list-group-item-dark"
                                      key={k1}
                                    >
                                      <span className="float-left title-m badge badge-dark text-center mb-2">
                                        {v1.market_name} 
                                      </span>
                                      <span className="float-right text-danger badge badge-pill badge-warning mb-2">
                                        Exp:{" "}
                                        {expMarket[v1.market_id]
                                          ? expMarket[v1.market_id]
                                          : 0}
                                      </span>

                                      <table className="table table-bordered table-striped table-sm report-table display-2">
                                        <thead className="thead-light">
                                          <tr>
                                            {/* <th scope="row">Sr.</th> */}
                                            <th>Player</th>
                                            <th>
                                              {v1.main_market_id == 1 ||
                                              v1.main_market_id == 2 ||
                                              v1.main_market_id == 3 ||
                                              v1.main_market_id == 6 ||
                                              v1.main_market_id == 7
                                                ? "Run"
                                                : v1.main_market_id == 11
                                                ? "Win"
                                                : v1.main_market_id == 4 ||
                                                  v1.main_market_id == 5
                                                ? "Score Digit"
                                                : "N/A"}
                                            </th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {players.map(
                                            (v2, k2) =>
                                              v2.market_id == v1.market_id && (
                                                <tr key={k2}>
                                                  {/* <td>{i + 1}</td> */}
                                                  <td
                                                    className={
                                                      v2.type == "user"
                                                        ? "text-success bold"
                                                        : "text-secondary"
                                                    }
                                                  >
                                                    {v2.runner_name}
                                                    {v2.odd_even ? (
                                                      <>
                                                        <span className="float-right text-uppercase bd-highlight font-weight-normal">
                                                          {v2.odd_even}
                                                        </span>
                                                      </>
                                                    ) : null}
                                                  </td>
                                                  <td className={v2.type === "user" ? "text-success italic" : "text-secondary"}>
                                                  {v1.main_market_id === 11 && v2.runs ? (
                                                    <>
                                                      <i className="uppercase">{v1.odd_even}</i>
                                                      <CheckIcon className="w-6 text-success" />
                                                    </>
                                                  ) : v1.main_market_id === 1 && v2.runs != null ? (
                                                    v2.runs
                                                  ) : v1.main_market_id === 2 && v2.runs != null ? (
                                                    v2.runs
                                                  ) : v1.main_market_id === 3 && v2.runs != null ? (
                                                    v2.runs
                                                  ) : v1.main_market_id === 6 && v2.runs != null ? (
                                                    v2.runs  
                                                  ) : v1.main_market_id === 7 && v2.runs != null ? (
                                                    v2.runs  
                                                  ) : v1.main_market_id === 4 || v1.main_market_id === 5 && v2.run_digit != null ? (
                                                    v2.run_digit    
                                                  ) : (
                                                    "-"
                                                  )}
                                                  </td>

                                                  <td
                                                    className={
                                                      v2.type == "user"
                                                        ? "text-success bold"
                                                        : "text-secondary"
                                                    }
                                                  >
                                                    {v2.type == "user"
                                                      ? "U"
                                                      : "S"}
                                                  </td>

                                                  <td className="text-success bold">
                                                    {v2.amount}
                                                  </td>
                                                </tr>
                                              )
                                          )}
                                        </tbody>
                                      </table>
                                    </li>
                                  )
                              )}
                            {markets.length === 0 && (
                              <li class="list-group-item list-group-item-dark">
                                No Player Selected yet.
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
          )}
      </div>
    </>
  );
};

export default MarketList;
