import React, { useState, useEffect, useContext } from "react";
import Modal from "../../../components/Model";
import StoreContext from "../../../Store";

const UserSettingPopup = (props) => {
  const store = useContext(StoreContext);
  const [types, setTypes] = useState([]);
  const [usersetting, setUserSetting] = useState([]);
  const [typevalue, setTypeValue] = useState("");
  const [maxwin, setMaxWin] = useState(0);
  const [minbet, setMinBet] = useState(0);
  const [maxbet, setMaxBet] = useState(0);
  const [mxprofit, setMxProfit] = useState("");
  const [mxmarketprofit, setMxMarketProfit] = useState("");
  const [mxliability, setMxLiability] = useState("");
  const [mxmarketliability, setMxMarketLiability] = useState("");
  const [bet_delay, setBetDelay] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [modeList] = useState(store.getItem("modes"));
  const [mode_id, setModeid] = useState("");
  const [inplay_bet, setInplayBet] = useState("");
  const [min_odd, setMinOdd] = useState("");
  const [max_odd, setMaxOdd] = useState("");
  const [comm_in, setCommIn] = useState(0);
  const [comm_out, setCommOut] = useState(0);
  const [errorClass, setErrorClass] = useState("alert alert-success");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const getProfile = () => {
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");
      headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
      let urlencoded = new URLSearchParams();
      if (props.user && props.user.u_id) {
        urlencoded.append("uid", props.user.u_id);
      }
      let ro = {
        method: "POST",
        headers: headers,
        body: urlencoded,
      };

      fetch(import.meta.env.VITE_API_HOST + "/getprofile", ro)
        .then((response) => {
          if (response.status === 401) {
          } else {
            return response.json();
          }
        })
        .then((result) => {
          if (result.data && result.data.length > 0) {
            setMaxWin(result.data[0].plmt);
          }
        });
    };
    getProfile();
  }, [props.user]);

  const selectModes = async (mode_id, flag = false, typ = "") => {
    setModeid(mode_id);
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("mode_id", mode_id);
    if (flag && props.user && props.user.id) {
      urlencoded.append("admin_id", props.user.id);
    }

    if (typ) {
      urlencoded.append("type_name", typ);
    }

    let ro = {
      method: "POST",
      headers: headers,
      body: urlencoded,
    };
    let result = [];
    const response = await fetch(
      import.meta.env.VITE_API_HOST + "/event/getmarkettype",
      ro
    );
    if (response.ok) result = await response.json();
    if (result && result.success && !flag) {
      setTypes(result.data);
    }
    return result;
  };

  const handleChangeMaxWin = (e) => {
    e.preventDefault();
    setLoading(true);

    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();

    if (props.user && props.user.u_id) {
      urlencoded.append("profit_limit", maxwin);
      urlencoded.append("uid", props.user.u_id);
    }
    let ro = {
      method: "POST",
      headers: headers,
      body: urlencoded,
    };

    fetch(import.meta.env.VITE_API_HOST + "/setprofitLimit", ro)
      .then((response) => {
        if (response.status === 401) {
          setLoading(false);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result && result.success) {
          setMessage(result.message);
          setTimeout((e) => {
            setMessage("");
          }, 3000);
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const selectTypes = async (e) => {
    let value = e.target.value;
    setTypeValue(value);
    let result = await selectModes(mode_id, true, value);
    await resetSetting();
    for (let i = 0; i < result.data.length; i++) {
      if (value === result.data[i].type_name) {
        setMinBet(result.data[i].min);
        setMaxBet(result.data[i].max);
        setMxProfit(result.data[i].max_profit);
        setMxMarketProfit(result.data[i].max_market_profit);
        setMxLiability(result.data[i].max_liability);
        setMxMarketLiability(result.data[i].max_market_liability);
        setBetDelay(result.data[i].bet_delay);
        setMinOdd(result.data[i].min_odd);
        setMaxOdd(result.data[i].max_odd);
        setCommIn(result.data[i].comm_in);
        setCommOut(result.data[i].comm_out);
        setInplayBet(result.data[i].inplay_bet);
      }
    }
  };

  const saveUserSetting = (e) => {
    e.preventDefault();
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();

    if (props.user && props.user && props.user.id) {
      urlencoded.append("user_id", props.user.id);
    }
    urlencoded.append("mode_id", mode_id);
    urlencoded.append("min", minbet);
    urlencoded.append("max", maxbet);
    urlencoded.append("max_profit", mxprofit);
    urlencoded.append("max_market_profit", mxmarketprofit);
    urlencoded.append("max_liability", mxliability);
    urlencoded.append("max_market_liability", mxmarketliability);
    urlencoded.append("type_name", typevalue);
    urlencoded.append("inplay_bet", inplay_bet);
    urlencoded.append("min_odd", min_odd);
    urlencoded.append("max_odd", max_odd);
    urlencoded.append("comm_in", comm_in);
    urlencoded.append("comm_out", comm_out);
    urlencoded.append("bet_delay", bet_delay);
    urlencoded.append("admin_password", password);

    let ro = {
      method: "POST",
      headers: headers,
      body: urlencoded,
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/updatemarkettype", ro)
      .then((response) => {
        if (response.status === 401) {
          setLoading(false);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        setMessage(result.message);
        if (result && result.success) {
          setErrorClass("alert-success");
        } else {
          setErrorClass("alert-danger");
        }
        setTimeout((e) => {
          setMessage("");
        }, 2000);
        setLoading(false);
      });
  };

  const resetSetting = async () => {
    setMinBet("");
    setMaxBet("");
    setMxProfit("");
    setMxMarketProfit("");
    setMxLiability("");
    setMxMarketLiability("");
    setBetDelay("");
    setMinOdd("");
    setMaxOdd("");
    setCommIn("");
    setCommOut("");
    setInplayBet("");
    return;
  };

  const typeData = [{ type_name: "Select Type", visible: 1, id: 0 }, ...types];

  return (
    <Modal
      closeModal={props.closeModal}
      title={`${
        props.user ? `SETTING FOR ADMIN ${props.user.p_code}` : `MY SETTINGS`
      }`}
    >
      <div className="model-table-content">
        <form
          className="my-1 text-left align-middle"
          onSubmit={saveUserSetting}
        >
          <div className="row">
            <div className="col-6 form-group mt-1 input__custom">
              <div className="form-group">
                <label>Sports</label>
                <select
                  name="modes"
                  className="form-control"
                  value={mode_id}
                  onChange={(e) => {
                    selectModes(e.target.value, false);
                    setTypeValue("");
                  }}
                >
                  <option>Select Sports</option>
                  {modeList.length > 0 &&
                    modeList.map((mode, k) => (
                      <option key={k} value={mode.mode_id}>
                        {mode.play}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="col-6 form-group mt-1 input__custom">
              <div className="form-group">
                <label>Market Type</label>
                <select
                  name="types"
                  className="form-control"
                  value={typevalue}
                  onChange={(e) => selectTypes(e)}
                >
                  {typeData.map((type, index) => (
                    <option key={index} value={type.type_name}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {typevalue.length > 0 ? (
            <div className="row">
              <div className="col-6 form-group mt-1 input__custom">
                <label>Min Bet</label>
                <input
                  type="number"
                  value={minbet}
                  onChange={(e) => setMinBet(e.target.value)}
                  className="form-control"
                  name="min_bet"
                  min="0"
                  required
                />
              </div>
              <div className="col-6 form-group mt-1 input__custom">
                <label>Max Bet</label>
                <input
                  type="number"
                  value={maxbet}
                  onChange={(e) => setMaxBet(e.target.value)}
                  className="form-control"
                  name="max_bet"
                  required
                />
              </div>

              <div className="col-6 form-group mt-1 input__custom">
                <label>Max Profit</label>
                <input
                  type="number"
                  value={mxprofit}
                  onChange={(e) => setMxProfit(e.target.value)}
                  className="form-control"
                  name="max_profit"
                  required
                />
              </div>

              <div className="col-6 form-group mt-1 input__custom">
                <label>Max Market Profit</label>
                <input
                  type="number"
                  value={mxmarketprofit}
                  onChange={(e) => setMxMarketProfit(e.target.value)}
                  className="form-control"
                  name="max_market_profit"
                  required
                />
              </div>

              <div className="col-6 form-group mt-1 input__custom">
                <label> Max Liability</label>
                <input
                  type="number"
                  value={mxliability}
                  onChange={(e) => setMxLiability(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-6 form-group mt-1 input__custom">
                <label>Max Market Liability</label>
                <input
                  type="number"
                  value={mxmarketliability}
                  onChange={(e) => setMxMarketLiability(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-6 form-group mt-1 input__custom">
                <label>Min ODDS</label>
                <input
                  type="number"
                  value={min_odd}
                  onChange={(e) => setMinOdd(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-6 form-group mt-1 input__custom">
                <label>Max ODDS</label>
                <input
                  type="number"
                  value={max_odd}
                  onChange={(e) => setMaxOdd(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-6 form-group mt-1 input__custom">
                <label>Comm IN</label>
                <input
                  type="number"
                  value={comm_in}
                  onChange={(e) => setCommIn(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-6 form-group mt-1 input__custom">
                <label>Comm OUT</label>
                <input
                  type="number"
                  value={comm_out}
                  onChange={(e) => setCommOut(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-6 form-group mt-1 input__custom">
                <label>Bet Delay</label>
                <input
                  type="number"
                  value={bet_delay}
                  max={10}
                  min={0}
                  onChange={(e) => setBetDelay(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="col-6 form-group mt-1 input__custom">
                <label>Inplay Bet</label>
                <select
                  name="types"
                  className="form-control"
                  value={inplay_bet}
                  onChange={(e) => setInplayBet(e.target.value)}
                >
                  <option value={0}>ALL Time Bet</option>
                  <option value={1}>Inplay Bet Only</option>
                </select>
              </div>
              <div className="col-6 form-group mt-1 input__custom">
                <label>Admin Password</label>
                <input
                  type="password"
                  placeholder="Admin Password"
                  autoComplete="off"
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  maxLength="20"
                  required
                />
              </div>
              <div className="col-12 form-group mt-2 input__custom">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-sm btn-primary float-end"
                >
                  Change
                </button>

                <button
                  className="btn btn-sm btn-danger float-start"
                  onClick={() => props.closeModal()}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
          <div className="text-center">
            {message && (
              <span className={`px-2 py-1 alert ${errorClass}`}>{message}</span>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};
export default UserSettingPopup;
