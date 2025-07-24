import React, { useEffect, useState, useContext } from "react";
import { NavLink, useParams } from "react-router-dom";
import StoreContext from "../../../Store";
//import Spinner from 'react-bootstrap/Spinner';
//import Alert from 'react-bootstrap/Alert';

import AlertBox from "../../../components/AlertBox"
import Loader from "../../../utilities/Loader";
import ConfirmPlayers from "./ConfirmPlayers";
import { GiCricketBat, GiStopwatch } from "react-icons/gi";
import {
    EyeIcon,
    LockClosedIcon,
    ArrowLeftCircleIcon,
    UserCircleIcon,
    CogIcon,
  } from "@heroicons/react/24/solid";

const MarketList = (props) => {
  const store = useContext(StoreContext);
  let { eventid, eventtype } = useParams();

  //let type = "";
  //let { type } = (localStorage.getItem("event_data")) ? JSON.parse(localStorage.getItem("event_data")) : "";
  const [loading, setLoading] = useState(false);
  const [marketList, setList] = useState([]);
  const [playerList, setPlayers] = useState([]);
  const [isPlyer, setIsPlayer] = useState(false);

  //const [userSelection, setUserSelection] = useState([]);
  const [autoSelect, setAutoSelect] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [confirmMarkets, setConfirmMarkets] = useState([]);
  const [confirmPlayers, setConfirmPlayers] = useState([]);
  const [expMarket, setExpMarket] = useState([]);

  const [confirmFlag, setConfirmFlag] = useState(false);
  const [mkId, setMkId] = useState(0);
  const [mkName, setMkName] = useState("");
  const [userExp, setUserExp] = useState({});
  const [adminExp, setAdminExp] = useState({});

  const [message, setMessage] = useState();
  const [errorClass, setErrorClass] = useState("alert alert-success");

  useEffect(() => {
    getMarkets();
  }, []);

  const getMarkets = async (e) => {
    setLoading(true);

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

  const updateMarketStatus = async (flag, type, data, index) => {
    //if (!window.confirm("sure to change?")) return;
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

    const urlencoded = {
      event_id: data.event_id,
      type_name: data.market_name,
      market_id: data.id,
      //locked: data.locked,
      //visible: data.visible
    };

    if (type === "visible") {
      urlencoded.visible = flag;
      urlencoded.locked = data.locked;
    } else if (type === "locked") {
      urlencoded.locked = flag;
      urlencoded.visible = data.visible;
    } 

    urlencoded.type = type;

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/updateMarketStatus", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.message) {
          let rn = [...marketList];
          if (type === "visible") {
            rn[index].visible = flag;
          } else if (type === "locked") {
            rn[index].locked = flag;
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
  //if (loading) return <Loader></Loader>;
  
  return (
    <>
      
      <NavLink
        className="btn btn-sm btn-dark ms-1"
        title="Other"
        to={"/eventlist/"}
      >
        BACK
      </NavLink>
      <div className="row" key="markets">
        <div className="col-12 p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-sm table-dark">
              <thead className="">
                <tr>
                  <th width="5%" className="text-center px-2 py-0.5">
                    Sr.
                  </th>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">Event ID</th>
                  <th className="px-2 py-1 text-left">Runner (per Team)</th>
                  <th className="px-2 py-1 text-center">Status</th>
                  <th className="px-2 py-1 text-center">Locked</th>
                  <th className="px-2 py-1 text-center">Action</th>
                  
                </tr>
              </thead>
              <tbody>
                {marketList.map((v, k) => (
                  <tr key={k}>
                    <td className="text-center px-2 py-1" width={"5%"}>
                      {k + 1}
                    </td>
                    <td className="px-2 py-0.5 text-left">{v.market_name}</td>
                    <td className="px-2 py-0.5 text-left">{v.event_id}</td>
                    <td className="px-2 py-0.5 text-left">{v.runner_count}</td>
                    <td className="px-2 py-0.5 text-center">
                      <button
                        title="Market Status"
                        onClick={async () => {
                          await updateMarketStatus(
                            v.visible === null ? false : !v.visible,
                            "visible",
                            v,
                            k
                          );
                        }}
                        className={`btn btn-sm ${
                          v.visible === null || Boolean(v.visible) === true
                            ? "btn-success"
                            : "btn-danger"
                        }`}
                        disabled={loading}
                      >
                        {/* {v.status == 1 ? "Active" : "Inactive"} */}
                        <EyeIcon className="w-6"></EyeIcon>
                        {/* {loading ? <Spinner /> : <EyeIcon className="w-6" />} */}
                      </button>
                    </td>

                    <td className="px-2 py-0.5 text-center">
                    <button
                    title="Market Lock"
                    onClick={async () => {
                      await updateMarketStatus(
                        v.locked === null ? false : !v.locked,
                        "locked",
                        v,
                        k
                      );
                    }}
                    className={`btn btn-sm me-1 ${
                      v.locked === null || Boolean(v.locked) === true
                        ? "btn-success"
                        : "btn-danger"
                    }`}
                  >
                    <LockClosedIcon className="w-6"></LockClosedIcon>
                  </button>
                    </td>
                    <td className="px-2 py-0.5 text-center">

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {message && (<AlertBox message={message} closeMessage={closeMessage}></AlertBox> )}
    </>
  );
};

export default MarketList;
