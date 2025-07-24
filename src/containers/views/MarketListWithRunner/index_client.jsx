import React, { useEffect, useState, useContext } from "react";
import { NavLink, useParams } from "react-router-dom";
import StoreContext from "../../../Store";

import Loader from "../../../utilities/Loader";
import ConfirmPlayers from "./ConfirmPlayers";
import { GiCricketBat, GiStopwatch } from "react-icons/gi";

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

 

  if (loading) return <Loader></Loader>;

  return (
    <>
      <NavLink className="btn btn-sm btn-dark ms-1" title="Other" to={'/eventlist/'}>BACK</NavLink>
      <div className="row" key="markets">
        {marketList.map((v, k) => (
          <div className="col-12 p-0" key={k}>
            <div className="card" key={k}>
              <div className="card-body" key={k}>
                <div className="btn btn-sm btn-light" key={k}>
                  <div className="card-title">
                    <span className="text-border text-success font-weight-bold text-xl-left">
                      {v.market_name}
                    </span>
                    {/* <span className="float-right text-danger">
                      Exp: {expMarket[v.id] ? expMarket[v.id] : 0}
                    </span> */}
                  </div>

                  <div className="container" key={k}>
                    <div className="row" key={k}>
                      <div className="col" key={k}>
                        <ul className="list-group text-dark">
                          <li class="list-group-item list-group-item-info">
                            Team1
                          </li>
                          {playerList.map((v1, i) =>
                            v1.market_id == v.id && v1.team == 1 ? (
                              <>
                                <li
                                  className="list-group-item d-flex justify-content-between align-items-center"
                                  key={v1.id}
                                >
                                  <span class="badge badge-info badge-pill text-dark">
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
                          <li class="list-group-item list-group-item-info">
                            Team 2
                          </li>
                          {playerList.map((v1, i) =>
                            v1.market_id == v.id && v1.team == 2 ? (
                              <>
                                <li
                                  className="list-group-item d-flex justify-content-between align-items-center"
                                  key={v1.id}
                                >
                                  <span class="badge badge-info badge-pill text-dark">
                                    {v1.name}
                                  </span>
                                </li>
                              </>
                            ) : null
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
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
