import React, { useEffect, useState, useContext } from "react";
import { NavLink, useParams } from "react-router-dom";
import StoreContext from "../../../Store";

import Loader from "../../../utilities/Loader";
import {
  MdViewHeadline,
  MdEqualizer,
  MdGradient,
  MdDescription,
} from "react-icons/md";
import { GiCricketBat, GiStopwatch } from "react-icons/gi";

const Profile = (props) => {
  const store = useContext(StoreContext);
  let { eventid, eventtype } = useParams();

  //let type = "";
  //let { type } = (localStorage.getItem("event_data")) ? JSON.parse(localStorage.getItem("event_data")) : "";
  const [loading, setLoading] = useState(false);
  const [eventList, setList] = useState([]);

  useEffect(() => {
    getEvents();
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

    fetch(import.meta.env.VITE_API_HOST + "/user/prof", requestOptions)
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

  if (loading) return <Loader></Loader>;

  console.log(eventList["profile"]);
  return (
    <>
      <div className="container-fluid content-report">
        <div className="row">
          {eventList["profile"] &&
            eventList["profile"].map((v, k) => (
              <>
                <div className="col-auto p-0" key={k}>
                  <div className="card">
                    <div class="card-body">
                      <h5 className="card-text text-uppercase">
                        <MdDescription></MdDescription>
                        Avaiable Chips :
                      </h5>
                      <p
                        className={`card-text ${
                          parseInt(v.amount) < 0
                            ? `text-danger`
                            : `text-success`
                        }`}
                      >
                        {v.amount}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-auto p-0" key={k}>
                  <div className="card">
                    <div class="card-body">
                      <h5 className="card-text text-uppercase">
                        <MdEqualizer></MdEqualizer>
                        Total P/L :
                      </h5>
                      <p
                        className={`card-text ${
                          parseInt(v.net_pl) < 0
                            ? `text-danger`
                            : `text-success`
                        }`}
                      >
                        {v.net_pl}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-auto p-0" key={k}>
                  <div className="card">
                    <div class="card-body">
                      <h5 className="card-text text-uppercase">
                        <MdEqualizer></MdEqualizer>
                        Downline P/L :
                      </h5>
                      <p
                        className={`card-text ${
                          parseInt(v.down_line) < 0
                            ? `text-danger`
                            : `text-success`
                        }`}
                      >
                        {v.down_line}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-auto p-0" key={k}>
                  <div className="card">
                    <div class="card-body">
                      <h5 className="card-text text-uppercase">
                        <MdEqualizer></MdEqualizer>
                        Parent P/L :
                      </h5>
                      <p
                        className={`card-text ${
                          parseInt(v.up_line) < 0
                            ? `text-danger`
                            : `text-success`
                        }`}
                      >
                        {v.up_line}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-auto p-0" key={k}>
                  <div className="card">
                    <div class="card-body">
                      <h5 className="card-text text-uppercase">
                        <MdEqualizer></MdEqualizer>
                        My Running P/L :
                      </h5>
                      <p
                        className={`card-text ${
                          parseInt(v.down_line - v.up_line) < 0
                            ? `text-danger`
                            : `text-success`
                        }`}
                      >
                        {v.down_line - v.up_line}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-auto p-0" key={k}>
                  <div className="card">
                    <div class="card-body">
                      <h5 className="card-text text-uppercase">
                        <MdEqualizer></MdEqualizer>
                        Cash :
                      </h5>
                      <p
                        className={`card-text ${
                          parseInt(v.pocket) < 0
                            ? `text-danger`
                            : `text-success`
                        }`}
                      >
                        {v.pocket}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ))}
        </div>
      </div>
    </>
  );
};

export default Profile;
