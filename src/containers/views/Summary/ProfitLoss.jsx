import React, { useState, useEffect, useContext } from 'react'
import StoreContext from '../store'
import { setDate, dateReport } from '../Utils'
import useInfiniteScroll from "../useInfiniteScroll";
import Loader from './Component/Loader';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { PopNew } from './Component/PopNew';

const GenModal = React.lazy(() => import("./Component/GenModal"));
const PopUp = React.lazy(() => import("./Component/PopUp"));
const BetsModal = React.lazy(() => import("./Component/BetsModal"));
const AcModal = React.lazy(() => import("./Component/AcModal"));

const ProfitLoss = (props) => {

  const [fromdate, setFromDate] = useState(0);
  const [todate, setToDate] = useState(0);
  const [mindate, setMinDate] = useState(0);
  const [mode_type, setModeType] = useState('');
  const [ac_type] = useState('all');

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
    fetch(import.meta.env.VITE_API_HOST + "/report/getpl", requestOptions)
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
            ttl += Number(ac_data[i].amount)
          }
          setAcData(ac_data);
          setTotal(ttl);
          setGt(result.gt)
        }
        setIsFetching(false)
      })
      .catch((error) => {
        if (error) {
          setIsFetching(false)
        }
      });
  };
  const closeModal = (flag = false) => {
    if (!flag) window.history.go(-1)
    setBetModal(false);
    setGmodal(false);
    setAcModal(false);
    setBetList([]);
  }

  const openModal = () => {
    setBetModal(true)
  }
  const [isFetching, setIsFetching] = useInfiniteScroll(handleSubmit);
  const init = (event) => {
    event.preventDefault();
    setAcData([])
    setPage(1);
    setNoMore(false);
    setIsFetching(true)
  }
  useEffect(() => {
    const active_user = store.getItem("active_user");
    setMinDate(setDate(
      new Date(new Date().setDate(new Date().getDate() - 90))
    ))
    setFromDate(setDate(
      new Date(new Date().setDate(new Date().getDate() - 15))
    ))
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

  if (data_ob.length > 0) {
    ac_data = data_ob.map((v, k) => {
      out_cash = v.type === "CR" ? parseFloat(v.amount) + out_cash : out_cash;
      in_cash = v.type === "DR" ? parseFloat(v.amount) + in_cash : in_cash;
      return (
        <React.Fragment key={k}>
          <tr className={`text-black dark:text-white ${(k) % 2 === 0 ? "bg-white dark:bg-secondary-900" : "bg-secondary-100 dark:bg-secondary-700"}`} >

            <td role="button" className="px-2 py-0.5 text-left whitespace-nowrap"><PopNew title={v.event.split("/")[0]}>{dateReport(v.created_at)}</PopNew></td>
            <td className={`px-2 py-0.5  text-right font-semibold ${parseInt(v.amount) < 0 ? "text-red-600 dark:text-pink-300" : "text-green-700 dark:text-green-300"}`}>{v.amount}</td>
            {props.role < 5 &&
              <td className={`px-2 py-0.5  text-right font-semibold ${parseInt(v.up_line) > 0 ? "text-red-600 dark:text-pink-300" : "text-green-700 dark:text-green-300"}`}>{v.up_line * (-1)}</td>}
            <td className="px-2 py-0.5 text-center whitespace-nowrap">
              {v.market_id !== "0" && (
                <button
                  onClick={() => {
                    getBetList(
                      v.event_id,
                      v.market_id
                    );
                    setTitle(v.event.split("/")[0] + " /BETS")
                    setBetModal(true)
                    window.history.pushState({ dummyUrl: true }, null, null);
                  }}
                  title="Bet List"
                  className="bg-primary-300 dark:bg-gray-600 hover:bg-primary-200 dark:hover:bg-gray-500 text-black dark:text-white text-center px-2 py-0.5 rounded transition-all duration-300 mx-0.5 my-0.5"
                >
                  B
                </button>

              )}
              {v.market_id !== "0" && props.role < 5 &&
                (<button
                  onClick={() => {
                    setGmodal(true);
                    setTitle("-: " + v.event.split("/")[0] + " GENERAL -:");
                    setEventId(v.event_id);
                    setModeId(v.mode_id);
                    window.history.pushState({ dummyUrl: true }, null, null);
                  }}
                  title="Event General Userwise"
                  className="bg-primary-300 dark:bg-gray-600 hover:bg-primary-200 dark:hover:bg-gray-500 text-black dark:text-white text-center px-2 py-0.5 rounded transition-all duration-300 mx-0.5 my-0.5"
                >
                  S
                </button>)}
              <button
                onClick={() => {
                  setAcModal(true);
                  setTitle("-: " + v.event.split("/")[0] + "  Markets Details-:");
                  setEventId(v.event_id);
                  setModeId(v.mode_id);
                  window.history.pushState({ dummyUrl: true }, null, null);
                }}
                title="Markets Details"
                className="bg-primary-300 dark:bg-gray-600 hover:bg-primary-200 dark:hover:bg-gray-500 text-black dark:text-white text-center px-2 py-0.5 rounded transition-all duration-300 mx-0.5 my-0.5"
              >
                D
              </button>
            </td>

          </tr>
        </React.Fragment>
      )
    });
  }
  const ac_total = [0].map((v, k) => (
    <tr key={k}>

      <td className="text-right text-primary-800 dark:text-white">Page Total</td>
      <td

        className={`text-right px-2 font-semibold ${total < 0 ? "text-red-600 dark:text-pink-300" : "text-green-700 dark:text-green-300"
          }`}
      >
        {total.toFixed(2)}
      </td>
      <td colSpan='2' className="text-left"></td>
    </tr>
  ));
  const g_total = [0].map((v, k) => (
    <tr key={k}>

      <td className="text-right text-primary-800 dark:text-white">Grand Total</td>
      <td

        className={`text-right px-2 font-semibold ${gt < 0 ? "text-red-600 dark:text-pink-300" : "text-green-700 dark:text-green-300"
          }`}
      >
        {gt.toFixed(2)}
      </td>
      <td colSpan='2' className="text-left"></td>
    </tr>
  ));
  const resetFilter = (event) => {
    event.preventDefault();
    store.setItem("active_user", {});
    setAcData([])
    setPage(1);
    setActiveUser({})
    window.history.back();
  }
  return (
    <React.Fragment>
      <div className='py-2 md:px-2 bg-primary-50 dark:bg-black'>
        <div className="bg-white dark:bg-secondary-800 shadow md:rounded-lg pt-6 p-2 md:p-6">
          <form onSubmit={(e) => init(e)} className="grid  grid-cols-3 lg:grid-cols-6 gap-1">
            <div className="border border-gray-700 focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1">
              <div className="-mt-4 absolute tracking-wider px-1 uppercase text-xs">
                <p>
                  <label htmlFor="name" className="bg-primary-200 dark:bg-secondary-700 text-black dark:text-white px-1">From Date </label>
                </p>
              </div>
              <p>
                <input min={mindate} value={fromdate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                  }}
                  autoComplete="false" type="date" className="py-1 px-1 text-black dark:text-white bg-primary-100 dark:bg-primary-700 outline-none block h-8 w-full" />
              </p>
            </div>
            <div className="border border-gray-700 focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1">
              <div className="-mt-4 absolute tracking-wider px-1 uppercase text-xs">
                <p>
                  <label htmlFor="name" className="bg-primary-200 dark:bg-secondary-700 text-black dark:text-white px-1">To Date </label>
                </p>
              </div>
              <p>
                <input min={mindate} value={todate} onChange={(e) => {
                  setToDate(e.target.value);
                }} autoComplete="false" type="date" className="py-1 px-1 text-black dark:text-white bg-primary-100 dark:bg-primary-700 outline-none block h-8 w-full" />
              </p>
            </div>
            <div className="border border-gray-700 focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1">
              <div className="-mt-4 absolute tracking-wider px-1 uppercase text-xs">
                <p>
                  <label htmlFor="name" className="bg-primary-200 dark:bg-secondary-700 text-black dark:text-white px-1">Sport</label>
                </p>
              </div>
              <p>
                <select onChange={(e) => {
                  setModeType(e.target.value)
                }} autoComplete="false" type="date" className="py-1 px-1 text-black dark:text-white bg-primary-100 dark:bg-primary-700 outline-none block h-8 w-full">
                  <option value="">All</option>
                  {props.play_mods.map((v, k) => (
                    <option key={k} value={v.mode_id}>{v.play}</option>
                  ))}
                </select>
              </p>
            </div>
            <div className="border border-gray-700 focus-within:border-blue-500 focus-within:text-blue-500 transition-all duration-500 relative rounded p-1">
              <button type='submit' className="bg-primary-200 dark:bg-primary-700 hover:bg-primary-200  text-black dark:text-white px-4 py-1 transition-all duration-300 w-full">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className=''>
        <h1 className="text-center bg-primary-700 text-white">-: Report Profit And Loss {active_user.p_code && <span className="text-green-500">Of {active_user.p_code}</span>}{active_user.id && <XCircleIcon role="button" type="reset" title="Reset Filter" onClick={(e) => { resetFilter(e) }} className="inline-flex float-right justify-center w-8 h-8  focus:outline-none text-red-500  dark:text-red-400  hover:text-red-400 dark:hover:text-red-300  float-right">X</XCircleIcon>}: -</h1>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-black dark:text-white bg-secondary-200 dark:bg-secondary-700">
              <tr className="tracking-wide text-left">
                <th className="px-1 py-0.5">Event</th>
                <th className="px-1 py-0.5 text-right">Total</th>
                {props.role < 5 && <th className="px-1 py-0.5 text-right">Up</th>}
                <th className="px-1 py-0.5 text-center">Info</th>
              </tr>
            </thead>
            {ac_data.length > 0 && <tbody>{g_total}{ac_total}{ac_data}</tbody>}
          </table>
        </div>
        {isFetching && !noMore && <div className="relative h-20"><div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"><Loader></Loader></div></div>}
      </div>
      {betmodal &&
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
      }
      {
        g_modal &&
        <React.Suspense fallback={<Loader></Loader>}>
          <PopUp title={title} modelClose={closeModal}>
            <GenModal uid={active_user.id && active_user.id} event_id={event_id} mode_id={mode_id} modelClose={closeModal}></GenModal>
          </PopUp>
        </React.Suspense>
      }
      {
        ac_modal &&
        <React.Suspense fallback={<Loader></Loader>}>
          <PopUp title={title} modelClose={closeModal}>
            <AcModal
              event_id={event_id}
              mode={mode_id}
              fromdate={fromdate}
              todate={todate}
              active_user={active_user}
              {...props}
              modelClose={closeModal}
            >
            </AcModal>
          </PopUp></React.Suspense>
      }
    </React.Fragment>
  )
}

export default ProfitLoss;