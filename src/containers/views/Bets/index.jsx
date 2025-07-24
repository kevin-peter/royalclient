import React, { useEffect, useState, useContext } from "react";
import { NavLink, useParams } from "react-router-dom";
import StoreContext from "../../../Store";
import useInfiniteScroll from "../../../components/UseInfiniteScroll";
import Loader from "../../../utilities/Loader";
import { setDate, dateReport } from "../../../utilities/Util";

import { GiCricketBat, GiStopwatch } from "react-icons/gi";

const BETS = (props) => {
  const store = useContext(StoreContext);
  let { eventid, eventtype } = useParams();

  //const currentDate = new Date();
  //currentDate.setDate(currentDate.getDate() - 15);
  const currentDate = setDate(new Date(new Date().setDate(new Date().getDate() - 15)))
  
  const [fromdate, setFromDate] = useState(currentDate);
  const [mindate, setMinDate] = useState(0);
  
  //let type = "";
  //let { type } = (localStorage.getItem("event_data")) ? JSON.parse(localStorage.getItem("event_data")) : "";
  const [loading, setLoading] = useState(false);
  const [eventList, setList] = useState([]);

  let k = 0;
  useEffect(() => {
    setMinDate(
      setDate(new Date(new Date().setDate(new Date().getDate() - 90)))
    );
    setFromDate(
      setDate(new Date(new Date().setDate(new Date().getDate() - 15)))
    );
    getBets();
  }, []);

  const getBets = async (e) => {
    setLoading(true);

    const urlencoded = {
      fromdate: fromdate,
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

    fetch(import.meta.env.VITE_API_HOST + "/event/getBets", requestOptions)
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

  const [isFetching, setIsFetching] = useInfiniteScroll(getBets);
  const init = (event) => {
    event.preventDefault();
    setList([]);
    getBets();
    //setPage(1);
    //setNoMore(false);
    //setIsFetching(true);
  };
  
  console.log(fromdate);

  if (loading) return <Loader></Loader>;

  //if (isFetching) return <Loader></Loader>;

  return (
    <>
      <div className="container-fluid content-report">
        <div className="row rowBG">
        <form onSubmit={(e) => init(e)} className="col-12">
          <div className="col-6 col-md-2 float-left p-1">
            <label htmlFor="startDate">From Date</label>
            <input
                min={mindate}
                value={fromdate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                }}
                autoComplete="false"
                type="date"
                className="form-control"
              />
          </div>
          <div className="col-6 col-md-2 float-left p-1">
            <label htmlFor="inputLastname">To Date</label>
            <input
              type="date"
              min="2023-10-09"
              className="form-control"
              placeholder="to"
              value="2024-01-07"
            />
          </div>
          <div className="col-4 col-md-2 float-left p-1">
            <label htmlFor="accountType">Market Type</label>
            <select type="text" className="form-control" id="accountType">
              <option value="all">All</option>
              <option value="1">NO-CUT(R)</option>
              <option value="2">NO-CUT(W)</option>
              <option value="3">CUT(R)</option>
              <option value="4">CUT(W)</option>
            </select>
          </div>

          <div className="col-4 col-md-2 float-left p-1">
            <label className="invisible d-block">submit</label>
            <button type="submit" className="mt-1 btn btn-sm btn-theme shadow">
              Submit
            </button>
            <button
              title="Download PDF"
              className="ml-2 btn btn-sm btn-outline-success shadow"
              type="button"
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  d="M4.99787498,8.99999999 L4.99787498,0.999999992 L19.4999998,0.999999992 L22.9999998,4.50000005 L23,23 L4,23 M18,1 L18,6 L23,6 M3,12 L3.24999995,12 L4.49999995,12 C6.5,12 6.75,13.25 6.75,14 C6.75,14.75 6.5,16 4.49999995,16 L3.24999995,16 L3.24999995,18 L3,17.9999999 L3,12 Z M9.5,18 L9.5,12 C9.5,12 10.4473684,12 11.2052633,12 C12.3421053,12 13.5,12.5 13.5,15 C13.5,17.5 12.3421053,18 11.2052633,18 C10.4473684,18 9.5,18 9.5,18 Z M16.5,19 L16.5,12 L20.5,12 M16.5,15.5 L19.5,15.5"
                ></path>
              </svg>
            </button>
          </div>
          </form>
        </div>
        <div className="row">
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-sm report-table">
              <thead>
                <tr>
                  <th width="3%" className="text-center">
                    Sr.
                  </th>
                  <th width="10%" className="text-right">
                    User
                  </th>
                  <th width="10%" className="text-right">
                    Event
                  </th>
                  <th width="10%" className="text-right">
                    Market
                  </th>
                  <th width="10%" className="text-right">
                    Team
                  </th>
                  <th width="5%" className="text-center">
                    Player
                  </th>
                  <th width="5%" className="text-center">
                    Amount
                  </th>
                  <th width="5%" className="text-center">
                    Type
                  </th>
                  <th width="8%" className="text-center">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody>
                {eventList.map((v, k) => (
                  <tr>
                    <td className="text-center">{k + 1}</td>
                    <td className="text-right">{v.email}</td>
                    <td className="text-right">{v.event_name}</td>
                    <td className="text-right">{v.market_name}</td>
                    <td className="text-right">{v.team_name}</td>
                    <td className="text-center">{v.r_name}</td>
                    <td className="text-center">{v.amount}</td>
                    <td className="text-center">{v.type}</td>
                    <td className="text-center">
                      {new Date(v.created_at).toLocaleString("en-US", "")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Add other form elements here */}
      </div>
    </>
  );
};

export default BETS;
