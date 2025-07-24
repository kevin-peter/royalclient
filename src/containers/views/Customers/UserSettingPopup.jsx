import React, { useState, useEffect } from 'react'

const UserSettingPopup = (props) => {

  const [types, setTypes] = useState([]);
  const [usersetting, setUserSetting] = useState([]);
  const [typevalue, setTypeValue] = useState("");
  const [maxwin, setMaxWin] = useState("");
  const [minbet, setMinBet] = useState("");
  const [maxbet, setMaxBet] = useState("");
  const [mxprofit, setMxProfit] = useState("");
  const [mxmarketprofit, setMxMarketProfit] = useState("");
  const [mxliability, setMxLiability] = useState("");
  const [mxmarketliability, setMxMarketLiability] = useState("");
  const [mode_id, setModeId] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [admin_password, setAdminPass] = useState("");
  const [comm_in, setCommIn] = useState("");
  const [comm_out, setCommOut] = useState("");


  useEffect(() => {
    const getProfile = () => {
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");
      headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
      let urlencoded = new URLSearchParams();
      if (props.user && props.user.u_id) {
        urlencoded.append("uid", props.user.u_id);
      }
      let requestOptions = {
        method: "POST",
        headers: headers,
        body: urlencoded
      };

      fetch(import.meta.env.VITE_API_HOST + "/getprofile", requestOptions)
        .then((response) => {
          if (response.status === 401) {
          } else {
            return response.json();
          }
        }).then((result) => {
          if (result.data && result.data.length > 0) {
            setMaxWin(result.data[0].plmt)
          }
        });
    }
    getProfile();
  }, [props.user])

  const selectModes = (value) => {
    setModeId(value)
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("mode_id", value);

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/getmarkettype", requestOptions).then((response) => {
      if (response.status === 401) {
      } else {
        return response.json();
      }
    }).then((result) => {
      if (result && result.success) {
        setTypes(result.data);
      }
    });
  };


  const selectTypes = (e) => {
    let value = e.target.value;
    setTypeValue(value);
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("mode_id", mode_id);
    urlencoded.append("type_name", value);
    if (props.user && props.user.id) {
      urlencoded.append("user_id", props.user.id);
    }
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/getmarkettype", requestOptions).then((response) => {
      if (response.status === 401) {
      } else {
        return response.json();
      }
    }).then((result) => {
      if (result && result.success) {
        setUserSetting(result.data);
        setCommIn(result.data[0].comm_in);
        setCommOut(result.data[0].comm_out);
        setMinBet(result.data[0].min);
        setMaxBet(result.data[0].max);
        setMxProfit(result.data[0].max_profit);
        setMxMarketProfit(result.data[0].max_market_profit);
        setMxLiability(result.data[0].max_liability);
        setMxMarketLiability(result.data[0].max_market_liability);
      }
    });
  }

  const saveUserSetting = (e) => {
    e.preventDefault();
    setLoading(true)
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();

    if (props.user && props.user.id) {
      urlencoded.append("user_id", props.user.id);
      urlencoded.append("min", minbet);
      urlencoded.append("max", maxbet);
      urlencoded.append("max_profit", mxprofit);
      urlencoded.append("max_market_profit", mxmarketprofit);
      urlencoded.append("max_liability", mxliability);
      urlencoded.append("max_market_liability", mxmarketliability);
      urlencoded.append("type_name", typevalue);
      urlencoded.append("mode_id", mode_id);
      urlencoded.append("comm_in", comm_in);
      urlencoded.append("comm_out", 0);
      urlencoded.append("admin_password", admin_password);
    }

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded
    };

    fetch(import.meta.env.VITE_API_HOST + "/user/updatemarkettype", requestOptions).then((response) => {
      if (response.status === 401) {

        setLoading(false);
      } else {
        return response.json();
      }
    }).then((result) => {
      if (result && result.success) {
        props.modelClose(1, result.message)
      } else {
        setError(result.message);
        setTimeout((e) => {
          setError("")
        }, 2000);
      }
      setLoading(false);
    });
  }

  let typeData = [{ type_name: "Select Type", visible: 1, id: 0 }, ...types];

  return (
    <>
      <form className="bg-primary-200 dark:bg-secondary-700 opacity-95 inline-block p-2 my-1 overflow-hidden text-left align-middle transition-all transform w-full" onSubmit={saveUserSetting}>
        <div className="grid grid-cols-12 gap-1 text-blue-900 dark:text-blue-300  px-1 py-1">
          <div className='col-span-6'>
            <label>Play Mode</label>
            <select name="modes" className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" onChange={(e) => selectModes(e.target.value)}>
              {props.modes.map((mode, index) => (
                <option key={index} value={mode.mode_id}>{mode.play}</option>
              ))}
            </select>
          </div>
          <div className='col-span-6'>
            <label>Types</label>
            <select name="types" className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" onChange={selectTypes}>
              {typeData.map((type, index) => (
                <option key={index} value={type.id}>{type.type_name}</option>
              ))}
            </select>
          </div>


          {typeData.length > 1 && usersetting.length > 0 ? (<>
            <div className='col-span-6'>
              <label>Min Bet</label>
              <input type="number"
                value={minbet}
                onChange={e => setMinBet(e.target.value)}
                className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" name="min_bet" min="0" required />
            </div>

            <div className='col-span-6'>
              <label>Max Bet</label>
              <input type="number"
                value={maxbet}
                onChange={e => setMaxBet(e.target.value)}
                className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" name="max_bet" required />
            </div>

            <div className='col-span-6'>
              <label>Commission In</label>
              <input type="text"
                value={comm_in}
                onChange={e => setCommIn(e.target.value)}
                className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" name="commIn" required />
            </div>

            <div className='col-span-6'>
              <label>Commission out</label>
              <input type="text"
                value={comm_out}
                disabled
                onChange={e => setCommOut(e.target.value)}
                className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" name="commOut" required />
            </div>

            <div className='col-span-6'>
              <label>Max Profit</label>
              <input type="number"
                value={mxprofit}
                onChange={e => setMxProfit(e.target.value)}
                className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" name="max_profit" required />
            </div>

            <div className='col-span-6'>
              <label>Max Market Profit</label>
              <input type="number"
                value={mxmarketprofit}
                onChange={e => setMxMarketProfit(e.target.value)}
                className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" name="max_market_profit" required />
            </div>
            <div className='col-span-6'>
              <label> Max Liability</label>
              <input type="number"
                value={mxliability}
                onChange={e => setMxLiability(e.target.value)}
                className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" name="max_liability" required />
            </div>

            <div className='col-span-6'>
              <label >Max Market Liability</label>
              <input type="number"
                value={mxmarketliability}
                onChange={e => setMxMarketLiability(e.target.value)}
                className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" name="max_market_liability" required />
            </div>
            <div className='col-span-6'></div>
            <div className='col-span-6'>
              <label >Admin Password</label>
              <input type="password"
                autoComplete='off'
                value={admin_password}
                onChange={e => setAdminPass(e.target.value)}
                className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" required />
            </div>

            <div className='col-span-12'>
              <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-full focus:outline-none float-right" >Change</button>
              <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full focus:outline-none" onClick={props.modelClose}>Cancel</button>
            </div>

          </>) : null}

          <div className="flex flex-wrap content-center text-white text-center font-semibold">
            {error && <p className="w-full max-w-sm z-20 fixed bottom-1 left-1/2 transform -translate-x-1/2  leading-10 bg-red-500">{error}</p>}
          </div>
        </div>
      </form>
    </>)
}
export default UserSettingPopup;