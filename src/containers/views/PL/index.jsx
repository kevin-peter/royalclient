import React, { useState, useEffect, useContext } from "react";
import StoreContext from "../../../Store";
//import { setDate, dateReport } from '../Utils'
import { setDate, dateReport } from "../../../utilities/Util";
import useInfiniteScroll from "../../../components/UseInfiniteScroll";
import Loader from "../../../utilities/Loader";
import { XCircleIcon } from "@heroicons/react/24/solid";
// import { PopNew } from './Component/PopNew';

//const GenModal = React.lazy(() => import("./Component/GenModal"));
const PopUp = React.lazy(() => import("../../../components/PopUp"));
const BetsModal = React.lazy(() => import("../../../components/BetsModal"));
//const AcModal = React.lazy(() => import("./Component/AcModal"));

const ProfitLoss = (props) => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 15);
  const [fromdate, setFromDate] = useState(currentDate);
  const [todate, setToDate] = useState(new Date());
  const [mindate, setMinDate] = useState(0);
  const [mode_type, setModeType] = useState("4");
  const [ac_type] = useState("all");

  const [betlist, setBetList] = useState([]);
  const [limit] = useState(50);
  const [noMore, setNoMore] = useState(false);
  const [title, setTitle] = useState("");
  const [data_ob, setAcData] = useState([]);
  const [active_user, setActiveUser] = useState(0);
  const [g_modal, setGmodal] = useState(false);
  const [event_id, setEventId] = useState("");
  const [mode_id, setModeId] = useState("");

  const store = useContext(StoreContext);
  let [page, setPage] = useState(1);
  let [total, setTotal] = useState(0);
  let [gt, setGt] = useState(0);
  let [betmodal, setBetModal] = useState(false);
  let [ac_modal, setAcModal] = useState(false);

  const handleSubmit = () => {
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("mode", mode_type);
    urlencoded.append("type", ac_type);
    urlencoded.append("fromdate", fromdate);
    urlencoded.append("todate", todate);
    urlencoded.append("page", page);
    urlencoded.append("limit", limit);
    if (active_user.id) {
      urlencoded.append("uid", active_user.id);
    }
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };
    fetch(import.meta.env.VITE_API_HOST + "/account/getpl", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.success && result.data && result.data) {
          let ac_data = [...data_ob];
          if (result.data.length > 0) {
            setPage(page + 1);
          } else {
            setNoMore(true);
          }
          ac_data = [...ac_data, ...result.data];
          let ttl = 0;
          for (let i = 0; i < ac_data.length; i++) {
            ttl += Number(ac_data[i].amount);
          }
          setAcData(ac_data);
          setTotal(ttl);
          setGt(result.gt);
        }
        setIsFetching(false);
      })
      .catch((error) => {
        if (error) {
          setIsFetching(false);
        }
      });
  };

  const closeModal = (flag = false) => {
    if (!flag) window.history.go(-1);
    setBetModal(false);
    setGmodal(false);
    setAcModal(false);
    setBetList([]);
  };

  const openModal = () => {
    setBetModal(true);
  };
  const [isFetching, setIsFetching] = useInfiniteScroll(handleSubmit);

  const init = (event) => {
    event.preventDefault();
    setAcData([]);
    setPage(1);
    setNoMore(false);
    setIsFetching(true);
  };
  
  useEffect(() => {
    handleSubmit();

    const active_user = store.getItem("active_user");
    setMinDate(
      setDate(new Date(new Date().setDate(new Date().getDate() - 90)))
    );
    setFromDate(
      setDate(new Date(new Date().setDate(new Date().getDate() - 15)))
    );
    setToDate(setDate(new Date()));
    setActiveUser(active_user.id ? active_user : {});
  }, []);

  const getBetList = (event_id, market_id) => {
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("event_id", event_id);
    urlencoded.append("limit", 500);
    if (active_user.id) {
      urlencoded.append("uid", active_user.id);
    }
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };
    fetch(import.meta.env.VITE_API_HOST + "/event/resulttrade", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result && result.data) {
          setBetList(result.data);
        }
      });
  };

  let ac_data = [];
  let out_cash = 0;
  let in_cash = 0;

  //console.log(data_ob)
  if (data_ob.length > 0) {
    ac_data = data_ob.map((v, k) => {
      out_cash = v.type === "CR" ? parseFloat(v.amount) + out_cash : out_cash;
      in_cash = v.type === "DR" ? parseFloat(v.amount) + in_cash : in_cash;
      return (
        <React.Fragment key={k}>
          <tr>
            <td role="button" className="text-left">
              {/* <PopNew title={v.event.split("/")[0]}>{dateReport(v.created_at)}</PopNew> */}
              {v.event.split("/")[0] + "/" + v.event.split("/")[1] + "/" + v.event.split("/")[2]} -{" "}
              {/* {v.event} -{" "} */}
              {dateReport(v.created_at)}
            </td>
            <td
              className={`text-right ${
                parseInt(v.amount) < 0 ? "text-danger" : "text-success"
              }`}
            >
              {v.amount}
            </td>
            {props.role < 5 && (
              <td
                className={`text-right ${
                  parseInt(v.up_line) > 0 ? "text-danger" : "text-success"
                }`}
              >
                {v.up_line * -1}
              </td>
            )}
            <td className="text-center">
              {v.market_id !== "0" && (
                <button
                  onClick={() => {
                    getBetList(v.event_id, v.market_id);
                    setTitle(v.event.split("/")[0] + " /BETS");
                    setBetModal(true);
                    window.history.pushState({ dummyUrl: true }, null, null);
                  }}
                  title="Bet List"
                  className="bg-primary"
                >
                  B
                </button>
              )}
              {v.market_id !== "0" && props.role < 5 && (
                <button
                  onClick={() => {
                    setGmodal(true);
                    setTitle("-: " + v.event.split("/")[0] + " GENERAL -:");
                    setEventId(v.event_id);
                    setModeId(v.mode_id);
                    window.history.pushState({ dummyUrl: true }, null, null);
                  }}
                  title="Event General Userwise"
                  className="bg-primary"
                >
                  S
                </button>
              )}
              <button
                onClick={() => {
                  setAcModal(true);
                  setTitle(
                    "-: " + v.event.split("/")[0] + "  Markets Details-:"
                  );
                  setEventId(v.event_id);
                  setModeId(v.mode_id);
                  window.history.pushState({ dummyUrl: true }, null, null);
                }}
                title="Markets Details"
                className="bg-primary"
              >
                D
              </button>
            </td>
          </tr>
        </React.Fragment>
      );
    });
  }

 
  const ac_total = [0].map((v, k) => (
    <tr key={k}>
      <td className="text-right">Page Total</td>
      <td
        className={`text-right px-2 font-semibold ${
          total < 0 ? "text-danger " : "text-success"
        }`}
      >
        {total.toFixed(2)}
      </td>
      <td colSpan="2" className="text-left"></td>
    </tr>
  ));
  const g_total = [0].map((v, k) => (
    <tr key={k}>
      <td className="text-right text-primary">Grand Total</td>
      <td className={`text-right ${gt < 0 ? "text-danger " : "text-success"}`}>
        {gt.toFixed(2)}
      </td>
      <td colSpan="2" className="text-left"></td>
    </tr>
  ));
  const resetFilter = (event) => {
    event.preventDefault();
    store.setItem("active_user", {});
    setAcData([]);
    setPage(1);
    setActiveUser({});
    window.history.back();
  };

  console.log(g_total)
  return (
    <React.Fragment>
      <div className="container-fluid content-report">
        <div className="row rowBG">
          <form onSubmit={(e) => init(e)} className="col-12">
            <div className="col-6 col-md-2 float-left p-1">
              <label htmlFor="name" className="">
                From Date{" "}
              </label>

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
              <label htmlFor="name" className="">
                To Date{" "}
              </label>

              <input
                min={mindate}
                value={todate}
                onChange={(e) => {
                  setToDate(e.target.value);
                }}
                autoComplete="false"
                type="date"
                className="form-control"
              />
            </div>
            <div className="col-4 col-md-2 float-left p-1">
              <label htmlFor="name" className="">
                Sport
              </label>

              <select
                onChange={(e) => {
                  setModeType(e.target.value);
                }}
                autoComplete="false"
                type="date"
                className="form-control"
              >
                <option value="">All</option>
                {/* {props.play_mods.map((v, k) => (
                        <option key={k} value={v.mode_id}>{v.play}</option>
                      ))} */}
              </select>
            </div>
            <div className="col-4 col-md-2 float-left p-1">
              <label className="invisible d-block">submit</label>
              <button
                type="submit"
                className="mt-1 btn btn-sm btn-theme shadow"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
        <div className="row">
          <h1 className="text-center">
            {/* -: Report Profit And Loss{" "} */}
            {/* {active_user.p_code && (
              <span className="text-success">Of {active_user.p_code}</span>
            )} */}
            {active_user.id && (
              <XCircleIcon
                role="button"
                type="reset"
                title="Reset Filter"
                onClick={(e) => {
                  resetFilter(e);
                }}
                className="float-right bg-success"
              >
                X
              </XCircleIcon>
            )}
          </h1>
        </div>
        <div className="row">
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-sm report-table">
              <thead className="text-black">
                <tr className="text-left">
                  <th className="text-center">Event</th>
                  <th className="text-right">Total</th>
                  {props.role < 5 && <th className="text-right">Up</th>}
                  <th className="text-center">Info</th>
                </tr>
              </thead>
              {/* {ac_data.length > 0 && ( */}
                <tbody>
                  {g_total}
                  {ac_total}
                  {ac_data}
                </tbody>
              {/* )} */}
            </table>
          </div>

          {isFetching && !noMore && (
            <div className="relative h-20">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Loader></Loader>
              </div>
            </div>
          )}
        </div>
      </div>
      {betmodal && (
        <React.Suspense fallback={<Loader></Loader>}>
          <BetsModal
            betlist={betlist}
            dateFormate={dateReport}
            title={title}
            {...props}
            openModal={openModal}
            closeModal={closeModal}>
          </BetsModal>
        </React.Suspense>
      )}
      {g_modal && (
        <React.Suspense fallback={<Loader></Loader>}>
          <PopUp title={title} modelClose={closeModal}>
            {/* <GenModal uid={active_user.id && active_user.id} event_id={event_id} mode_id={mode_id} modelClose={closeModal}></GenModal> */}
          </PopUp>
        </React.Suspense>
      )}
      {ac_modal && (
        <React.Suspense fallback={<Loader></Loader>}>
          <PopUp title={title} modelClose={closeModal}>
            {/* <AcModal
              event_id={event_id}
              mode={mode_id}
              fromdate={fromdate}
              todate={todate}
              active_user={active_user}
              {...props}
              modelClose={closeModal}
            >
            </AcModal> */}
          </PopUp>
        </React.Suspense>
      )}
    </React.Fragment>
  );
};

export default ProfitLoss;
