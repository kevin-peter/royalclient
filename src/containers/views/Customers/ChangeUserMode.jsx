import React, { useState, useContext, useEffect } from 'react';
import StoreContext from '../../../Store';

const ChangeUserMode = (props) => {
  const store = useContext(StoreContext);
  /** statue for Add new user */
  const [admin_password, setAdminPassword] = useState("");
  const [playmode] = useState(store.getItem("client_play_mods"));
  const [patnership, setPatnership] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setMessage] = useState("");

  const saveNewUser = (e) => {
    e.preventDefault();
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        "admin_password": admin_password,
        "partArr": patnership,
        "user_id": props.user.id
      })
    };

    fetch(import.meta.env.VITE_API_HOST + "/user/updatepart", requestOptions).then((response) => {
      if (response.status === 401) {
        setLoading(false);
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


  const updateMode = (id, active) => {
    let patnershipItems = patnership.map(
      el => el.mode_id === id ? { ...el, active: active } : el
    )
    setPatnership(patnershipItems);
  }

  let userData = [{ id: '', text: 'Select Role' }];

  if (props.role && props.role <= 3) {
    userData.push({ id: 3, text: 'Super Master' })
  }
  if (props.role && props.role < 4) {
    userData.push({ id: 4, text: 'Master' })
  }
  if (props.role && props.role < 5) {
    userData.push({ id: 5, text: 'Client' })
  }


  useEffect(() => {
    getModes();
  }, []);

  const getModes = () => {
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Authorization', 'Bearer ' + localStorage.getItem('jwt'));
    let urlencoded = new URLSearchParams();
    if (props.user && props.user.id) {
      urlencoded.append('child_id', props.user.id);
    }

    let ro = {
      method: 'POST',
      headers: headers,
      body: urlencoded
    };

    fetch(import.meta.env.VITE_API_HOST + '/event/getpart', ro)
      .then((response) => {
        if (response.status === 401) {
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.success && result.data.length > 0) {
          let data = result.data ? result.data : [];
          let pt = []
          let d_w = 0;
          for (let j = 0; j < data.length; j++) {
            d_w = data[j].our
            data[j].downline = d_w;
            for (let i = 0; i < playmode.length; i++) {
              if (playmode[i].mode_id === data[j].mode_id) {
                data[j].max = playmode[i].our;
                data[j].our = playmode[i].our - d_w;
                data[j].upline = 100 - playmode[i].our
                pt[i] = data[j];
              }
            }

          }
          setPatnership(pt)
        }
      })
      .catch((e) => { console.log(e) });
  };

  const modesdata = patnership.map((mode, key) => (
    <tr key={key}>
      <td>
        <div className="form-check">
          <input className="form-check-input"
            checked={mode.active}
            value={patnership.length > 0 ? patnership[key].active : true}
            type="checkbox" onChange={() => { updateMode(mode.mode_id, !patnership[key].active) }} />
          <label className="form-check-label ms-1">
            {mode.play}
          </label>
        </div>
      </td>
      <td><input type="text" value={patnership.length > 0 ? mode.upline : ""} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" readOnly={true} tabIndex={-1} /></td>
      <td><input type="number" min="0" max={patnership.length > 0 ? mode.max : ""} value={patnership.length > 0 ? mode.downline : ""} onChange={(e) => {
        let pt = [...patnership];
        let init = [...playmode.filter((v) => v.mode_id === mode.mode_id)]
        pt[key].downline = e.target.value
        if (init.length > 0) pt[key].our = init[0].our - e.target.value
        setPatnership([...pt])
      }} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" readOnly={props.user.u_role > 4} required /></td>
      <td><input type="text" value={patnership.length > 0 ? props.user.u_role < 5 ? mode.our : mode.our - 100 : ""} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" readOnly={true} tabIndex={-1} /></td>
    </tr>
  ));

  return (
    <div className="col-span-12">
      <form className="bg-primary-200 dark:bg-secondary-700 opacity-95 inline-block p-2 my-1 overflow-hidden text-left align-middle transition-all transform w-full" autoComplete={"off"} onSubmit={saveNewUser}>
        <div className="grid grid-cols-12 gap-1 text-blue-900 dark:text-blue-300  px-1 py-1">

          {modesdata.length > 0 &&
            <div className="col-span-12 table-reponsive">
              <table className="table table-bordered table-sm w-full">
                <thead>
                  <tr>
                    <th width="16%">Play Type</th>
                    <th width="28%">UpLine</th>
                    <th width="28%">Downline</th>
                    <th width="28%">Our Part</th>
                  </tr>
                </thead>
                <tbody>
                  {modesdata.length > 0 && modesdata}
                </tbody>
              </table>
            </div>}
          <div className='col-span-6'>
          </div>
          <div className="col-span-6">
            <label >Admin Password</label>
            <input maxLength="100" placeholder="Admin Password" type="password" autoComplete='off' required defaultValue={admin_password} onChange={e => setAdminPassword(e.target.value)} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" />
          </div>
          <div className="col-span-12">
            <button title="Create User" type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-full focus:outline-none float-right">Create</button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full focus:outline-none" onClick={props.modelClose}>Cancel</button>
          </div>
          <div className="flex flex-wrap content-center text-white text-center font-semibold">
            {error && <p className="w-full max-w-sm z-20 fixed bottom-1 left-1/2 transform -translate-x-1/2  leading-10 bg-red-500">{error}</p>}
          </div>
        </div>
      </form>
    </div>
  )
}

export default ChangeUserMode;
