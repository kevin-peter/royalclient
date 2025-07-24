import React, { useState, useEffect, useContext } from 'react'
import StoreContext from '../../../Store';

export default function SetPl(props) {
  const store = useContext(StoreContext);
  const [availableChimp, setAvailableChimp] = useState(store.getItem("balance"));
  const [remainingChimp, setremainingChimp] = useState(store.getItem("balance"));
  const [withdraw, setWithdraw] = useState();
  const [f_upline, setFullUpline] = useState();
  const [password, setPassword] = useState("");
  const [remark, setRemark] = useState("");
  const [autodepo, setAutoDepo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setMessage] = useState("");

  useEffect(() => {
    let w = props.user.u_role < 5 ? props.user.up_line : props.user.up_line * (-1)
    if (props.modeltype === 'withdraw') w = w * (-1)
    setWithdraw(w)
    setFullUpline(w)
  }, [])

  useEffect(() => {
    const getExposer = () => {
      let headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");
      headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
      let urlencoded = new URLSearchParams();
      if (props.user && props.user.id) {
        urlencoded.append("uid", props.user.id);
      }
      let requestOptions = {
        method: "POST",
        headers: headers,
        body: urlencoded
      };

      fetch(import.meta.env.VITE_API_HOST + "/getExposerAdmin", requestOptions).then((response) => {
        if (response.status === 401) {
        } else {
          return response.json();
        }
      }).then((result) => {
        if (result && result.success) {
          setAvailableChimp(parseInt(result.data.bal));
          setremainingChimp(parseInt(result.data.bal));
        }
      });
    }
    getExposer();
  }, [props.user])

  const countRemainChimp = (event) => {
    let withdraw = parseInt(event.target.value);
    let available = availableChimp;
    if (Number.isNaN(withdraw) || withdraw < 0)
      withdraw = 0;
    if (props.modeltype === 'withdraw')
      setremainingChimp((available + withdraw));
    else
      setremainingChimp((available - withdraw));

  }
  const withdrawAndDepositeSubmit = (e) => {
    e.preventDefault();
    setLoading(true)
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    if (props.user && props.user.id) {
      urlencoded.append("user_id", props.user.id);
      urlencoded.append("t_type", props.modeltype);
      urlencoded.append("deposite_bal", withdraw);
      urlencoded.append("remark", remark);
      urlencoded.append("p_code", props.user.p_code);
      if (props.user.u_role > 4 && parseInt(props.user.up_line) < 0) {
        urlencoded.append("auto", autodepo);
      }
      urlencoded.append("admin_password", password);
    }

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded
    };
    let api = "/user/plset"
    fetch(import.meta.env.VITE_API_HOST + api, requestOptions)
      .then((response) => {
        if (response.status === 401) {
        } else {
          return response.json();
        }
      }).then((result) => {
        if (result && result.success) {
          props.modelClose(1, result.message)
        } else {
          setMessage(result.message);
          setTimeout((e) => {
            setMessage("")
          }, 2000);
        }
        setLoading(false);
      }).catch((e) => {
        setLoading(false);
      })

  }
  return (
    <div className="flex items-center justify-center">
      <form autoComplete="off" className="bg-primary-200 dark:bg-secondary-700 opacity-95 inline-block p-2 my-1 overflow-hidden text-left align-middle transition-all transform w-full" onSubmit={withdrawAndDepositeSubmit}>
        <div className="grid grid-cols-2 gap-1 text-blue-900 dark:text-blue-300  px-1 py-1">
          <div>
            <label >{props.modeltype === 'withdraw' ? "Withdraw From Pocket" : "Deposite To Pocket"}</label>
            <input type="number"
              value={withdraw}
              autoFocus
              onChange={e => { setWithdraw(e.target.value); countRemainChimp(e) }}
              min="0"
              step={0.01}
              max={Math.abs(props.user.up_line)}
              className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700"
              required />
          </div>
          <div>
            <label >Remark</label>
            <input type="text"
              value={remark}
              onChange={e => setRemark(e.target.value)}
              maxLength="70"
              className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700"
              required />
          </div>
          <div className='float-end'>
            <label >Admin Password:</label>
            <input type="password"
              autoComplete="off"
              onChange={e => setPassword(e.target.value)}
              className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700"
              maxLength="20"
              required />
          </div>
          {props.user.u_role > 4 && parseInt(props.user.up_line) < 0 &&
            <>
              <div></div>
              <div>
                <label>Auto Deposite</label>
                <input type='checkbox' checked={autodepo} onChange={() => { setAutoDepo(!autodepo) }} />
              </div>
            </>
          }
          <div style={{clear:"both"}}></div>
          <div>
            <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-full focus:outline-none">Transfer</button>
          </div>
          <div>
            {error && <p className="alert alert-danger">{error}</p>}
          </div>
        </div>
      </form>
    </div>
  );
}
