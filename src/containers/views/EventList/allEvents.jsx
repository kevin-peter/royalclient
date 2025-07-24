import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import StoreContext from "../../../Store";
import AlertBox from "../../../components/AlertBox";
import Markets from "./Markets";
import moment from "moment";

import {
  EyeIcon,
  LockClosedIcon,
  ArrowLeftCircleIcon,
  UserCircleIcon,
  CogIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { GiCricketBat, GiStopwatch } from "react-icons/gi";

const EventList = (props) => {
  const store = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const [eventList, setList] = useState([]);
  const [eventStatus, setEventStatus] = useState([]);
  const [marketSetting, setMarketSetting] = useState(false);

  const currDate = new Date().toLocaleString("en-US");
  const currTime = new Date().toLocaleTimeString();

  //const [id, setId] = useState("");
  const [event_id, setEventId] = useState("");
  const [event_name, setEventName] = useState("");

  const [message, setMessage] = useState();
  const [errorClass, setErrorClass] = useState("alert alert-success");

  const closeModal = async (e) => {
    setEventId("");
    setEventName("");
    setMarketSetting(false);

    getEvents();
  };

  useEffect(() => {
    getEvents();
    const intervalId = setInterval(() => {
      getEvents();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const getEvents = async (e) => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    let requestOptions = {
      method: "POST",
      headers: headers,
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/getevents", requestOptions)
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.data) setList(result.data);
        //if (result.event_default) setEventStatus(result.event_default)
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateEventStatus = async (flag, type, data, index) => {
    //if (!window.confirm("sure to change?")) return;
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

    const urlencoded = {
      event_id: data.event_id,
    };

    if (type === "status") {
      urlencoded.status = flag;
      urlencoded.bet_lock = data.bet_lock;
    } else if (type === "bet_lock") {
      urlencoded.bet_lock = flag;
      urlencoded.status = data.status;
    } else if (type === "lock") {
      // urlencoded.lock = flag;
    }

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(
      import.meta.env.VITE_API_HOST + "/setting/updateEventStatus",
      requestOptions
    )
      .then((response) => {
        if (response.status === 401) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.message) {
          let rn = [...eventList];
          if (type === "status") {
            rn[index].status = flag;
          } else if (type === "bet_lock") {
            rn[index].bet_lock = flag;
          }
          setMessage(result.message);
          setErrorClass("alert alert-success");
        }
      })
      .catch((err) => {
        setMessage(err);
        setErrorClass("alert alert-danger");
      })
      .finally(async () => {
        setTimeout(() => {
          setErrorClass("");
          setMessage("");
        }, 3000);
        setLoading(false);
      });
  };

  const closeMessage = async (e) => {
    setMessage(false);
  };

  //console.log(currDate);

  return (
    <>
      {eventList.length > 0 ? (
        <div className="row">
          {eventList.map((v, k) => (
            <div className="col-12 col-md-5 p-0" key={k}>
              <div className="card">
                <div className="card-body">
                  {/* <h5 class="card-title">{v.results}</h5> */}

                  <NavLink
                    className={
                      props.role === 5
                        ? "btn btn-sm btn-light"
                        : "btn btn-sm btn-white"
                    }
                    to={
                      props.role === 5 &&
                      v.parent_bet_lock === 0 &&
                      // !(
                      //   moment(v.opendate).format("DD/MM/YYYY HH:mm A") <=
                      //   moment(currDate).format("DD/MM/YYYY HH:mm A")
                      // )
                      !moment(v.opendate).isBefore(currDate)
                        ? "/marketlist/" + v.event_id + "/" + v.type
                        : "#"
                    }
                    onClick={() =>
                      props.role === 5 && v.parent_bet_lock === 1
                        ? setMessage("Event locked")
                        : setMessage(false)
                    }
                  >
                    <p className="card-text">
                      <GiCricketBat className="icon-cricket w-10"></GiCricketBat>
                      <span className="title-e badge badge-warning text-center">
                        {v.event_name}
                      </span>

                      {v.parent_bet_lock === 1 && (
                        <LockClosedIcon className="icon-lock w-10"></LockClosedIcon>
                      )}
                      {/* {moment(v.opendate).format('DD/MM/YYYY HH:mm A') <= moment(currDate).format('DD/MM/YYYY HH:mm A') ? ( */}
                      {moment(v.opendate).isBefore(currDate) ? (
                        <>
                          <LockClosedIcon className="icon-lock w-10"></LockClosedIcon>
                          <ClockIcon
                            className="icon-ClockIcon w-10 text-secondary "
                            title="OFF TIME"
                          ></ClockIcon>
                          <small className="text-muted float-right badge">
                            TIME OUT
                          </small>
                        </>
                      ) : (
                        <>
                          <ClockIcon className="icon-ClockIcon w-10 text-success"></ClockIcon>
                          <small className="text-muted float-right badge">
                            {moment(v.opendate).format("DD/MM/YYYY HH:mm A")}
                          </small>
                        </>
                      )}
                      {/* {v.results != null ? (
                          <>
                          <div className="headline">{v.results}</div>
                          </>
                          ) : null} */}

                      {/* <small className="text-muted float-right">{moment(currDate).format('DD/MM/YYYY HH:mm A')}</small> */}
                    </p>

                    <p className="card-text">
                      <GiStopwatch className="text-success ml-2"></GiStopwatch>
                      {/* {new Date(v.opendate).toLocaleString("en-US", "")} */}
                      {moment(v.opendate).format("DD/MM/YYYY HH:mm A")}
                      <GiStopwatch className="text-danger ml-2"></GiStopwatch>
                      {/* {new Date(v.closedate).toLocaleString("en-US", "")} */}
                      {moment(v.opendate).format("DD/MM/YYYY HH:mm A")}
                    </p>
                  </NavLink>

                  {props.role !== 5 ? (
                    <>
                      <div className="col-12">
                        {/* visible show/hide */}
                        <button
                          title="Event Status"
                          onClick={async () => {
                            await updateEventStatus(
                              v.status === null ? false : !v.status,
                              "status",
                              v,
                              k
                            );
                          }}
                          className={`btn btn-sm ${
                            v.status === null || Boolean(v.status) === true
                              ? !v.parent_status
                                ? "btn-danger"
                                : "btn-success"
                              : "btn-danger"
                          }`}
                          disabled={loading || !v.parent_status}
                        >
                          <EyeIcon className="w-6"></EyeIcon>
                        </button>
                        {/* lock event */}
                        <button
                          title="Event Bet Lock"
                          onClick={async () => {
                            await updateEventStatus(
                              v.bet_lock === null ? false : !v.bet_lock,
                              "bet_lock",
                              v,
                              k
                            );
                          }}
                          className={`btn btn-sm me-1 ml-1 ${
                            v.bet_lock === null || Boolean(v.bet_lock) === false
                              ? v.parent_bet_lock
                                ? "btn-danger"
                                : "btn-success"
                              : "btn-danger"
                          }`}
                          disabled={loading || v.parent_bet_lock}
                        >
                          <LockClosedIcon className="w-6"></LockClosedIcon>
                        </button>

                        {/* market setting */}
                        <button
                          title="Market Setting"
                          onClick={() => {
                            setMarketSetting(true);
                            setEventId(v.event_id);
                            setEventName(v.event_name);
                          }}
                          className="btn btn-sm btn-dark ml-1 shadow"
                        >
                          Markets
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="col-12 col-md-4 p-0" key="0">
          <div className="card">
            <div className="card-body">
              <p className="card-text"> No Event Found!</p>
            </div>
          </div>
        </div>
      )}
      {/* </div> */}
      {marketSetting && (
        <Markets
          title={event_name}
          event_id={event_id}
          closeModal={closeModal}
        ></Markets>
      )}
      {message && (
        <AlertBox message={message} closeMessage={closeMessage}></AlertBox>
      )}
    </>
  );
};

export default EventList;
