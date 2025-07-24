import React, { useState, useContext, useEffect } from 'react';
import StoreContext from '../../../Store';

const AddUserPopup = (props) => {
  const store = useContext(StoreContext);
  /** statue for Add new user */
  const [name, setName] = useState("");
  const [username, setUserName] = useState("");
  const [remark, setRemark] = useState("");
  const [admin_password, setAdminPassword] = useState("");
  const [password, setPassword] = useState("");
  const [freechip, setFreeChip] = useState(0);
  const [rbalance, setRbalance] = useState(store.getItem("balance"));
  const [cbalance] = useState(store.getItem("balance"));
  const [playmode] = useState(store.getItem("client_play_mods"));
  const [patnership, setPatnership] = useState(store.getItem("client_play_mods"));
  const [loading, setLoading] = useState(false);
  const [error, setMessage] = useState("");
  const [userType, setUserType] = useState(5);
  const [mobile, setMobile] = useState("");

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
        "email": username,
        "free_chip": freechip,
        "mobile": mobile,
        "name": name,
        "partArr": patnership,
        "u_role": Number(userType),
        "remark": remark,
        "password": password
      })
    };

    fetch(import.meta.env.VITE_API_HOST + "/user/adduser", requestOptions).then((response) => {
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
    userData.push({ id: 3, text: 'SUPER MASTER' })
  }
  if (props.role && props.role < 4) {
    userData.push({ id: 4, text: 'MASTER' })
  }
  if (props.role && props.role < 5) {
    userData.push({ id: 5, text: 'PLAYER' })
  }
  if (props.role && props.role < 5) {
    userData.push({ id: 6, text: 'CUTTING' })
  }

  useEffect(() => {
    let ml = [...patnership];
    for (let i = 0; i < ml.length; i++) {
      ml[i].upline = 100 - ml[i].our;
      ml[i].max = ml[i].our;
    }
    setPatnership([...ml])
  }, []);

  const modesdata = patnership.map((mode, key) => (
    // <tr key={key}>
    //   <td>
    //     <div className="form-check">
    //       <input className="form-check-input"
    //         defaultChecked={true}
    //         value={patnership.length > 0 ? patnership[key].active : true}
    //         type="checkbox" onChange={() => { updateMode(mode.mode_id, !patnership[key].active) }} />
    //       <label className="form-check-label ms-1">
    //         {mode.play}
    //       </label>
    //     </div>
    //   </td>
    //   <td><input type="text" value={patnership.length > 0 ? mode.upline : ""} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" readOnly={true} tabIndex={-1} /></td>
    //   <td><input type="number" min="0" max={patnership.length > 0 ? mode.max : ""} value={patnership.length > 0 ? mode.downline : ""} onChange={(e) => {
    //     let pt = [...patnership];
    //     let init = [...playmode.filter((v) => v.mode_id === mode.mode_id)]
    //     pt[key].downline = e.target.value
    //     if (init.length > 0) pt[key].our = init[0].our - e.target.value
    //     setPatnership([...pt])
    //   }} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" readOnly={Number(userType) > 4} required={Number(userType) < 5} tabIndex={Number(userType) > 4 ? -1 : 0} /></td>
    //   <td><input type="text" value={patnership.length > 0 ? mode.our : ""} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" readOnly={true} tabIndex={-1} /></td>
    // </tr>
    <table className="table table-bordered table-sm col-span-12 md:col-span-4 bg-primary-200 dark:bg-primary-900 border border-primary-700">
      <tbody>
        <tr className='bg-white dark:bg-primary-700'>
          <th className="text-center">Position</th>
          <th className="text-center"><div className="form-check">
            <input className="form-check-input"
              tabIndex={-1}
              defaultChecked={true}
              value={patnership.length > 0 ? patnership[key].active : true}
              type="checkbox" onChange={() => { updateMode(mode.mode_id, !patnership[key].active) }} />
            <label className="form-check-label ms-1">
              {mode.play}
            </label>
          </div></th>
        </tr>
        <tr>
          <td className="text-center">Up-line</td>
          <td className="text-center">
            <label>{patnership.length > 0 ? mode.upline : ""}</label>
          </td>
        </tr>
        <tr>
          <td className="text-center">Down-line</td>
          <td className="text-right">
            <div className="input-field col s12 m12 no-margin">
              <input type="number" min="0" max={patnership.length > 0 ? mode.max : ""} value={mode.downline ? mode.downline : ""} onChange={(e) => {
                let pt = [...patnership];
                let init = [...playmode.filter((v) => v.mode_id === mode.mode_id)]
                pt[key].downline = e.target.value
                if (init.length > 0) pt[key].our = init[0].our - e.target.value
                setPatnership([...pt])
              }} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700 text-center border-b" readOnly={!userType || Number(userType) > 4} required={Number(userType) < 5} tabIndex={Number(userType) > 4 ? -1 : 0}
                placeholder="Client Part" />
            </div>
          </td>
        </tr>
        <tr>
          <td className="text-center">Own</td>
          <td className="text-center">
            <label>{patnership.length > 0 ? mode.our : ""}</label>
          </td>
        </tr>
      </tbody>
    </table>
  ));

  return (
    <div className="col-span-12">
      <form className="bg-primary-200 dark:bg-secondary-700 opacity-95 inline-block p-2 my-1 overflow-hidden text-left align-middle transition-all transform w-full" autoComplete={"off"} onSubmit={saveNewUser}>
        <div className="grid grid-cols-12 gap-1 text-blue-900 dark:text-blue-300  px-1 py-1">
          <div className="col-span-6">
            <label>Name</label>
            <input maxLength="100" placeholder="Name" type="text" required defaultValue={name} onChange={e => setName(e.target.value)} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" />
          </div>
          <div className="col-span-6">
            <label>Username</label>
            <input className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700"
              placeholder="Username"
              type="text"
              value={username}
              onChange={e => setUserName(e.target.value)}
              pattern="[^\s]+"
              title="please dont use the white space :)"
              maxLength="12"
              autoComplete="off"
              required
            />
          </div>
          <div className="col-span-6">
            <label>Password</label>
            <input className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700"
              placeholder="Password"
              type="password"
              onChange={e => setPassword(e.target.value)}
              value={password}
              autoComplete="off"
              minLength="6"
              maxLength="20"
              required />
          </div>
          <div className="col-span-6">
            <label>Retype Password</label>
            <input className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700"
              placeholder="Retype Password"
              type="password"
              onChange={e => {
                if (e.target.value !== password) {
                  e.target.setCustomValidity('Password and retype password not match');
                } else {
                  e.target.setCustomValidity('');
                }
              }}
              autoComplete="off"
              minLength="6"
              maxLength="20"
              required />
          </div>


          <div className="col-span-6">
            <label>User Type</label>
            <select name="userstype" className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" onChange={
              e => {
                let pt = [...patnership];
                if (Number(e.target.value) > 4) {
                  for (let i = 0; i < pt.length; i++) {
                    delete pt[i].downline;
                    pt[i].our = pt[i].max;
                  }
                }
                setPatnership([...pt])
                setUserType(e.target.value);
              }
            } required>
              {userData.map((user, index) => (
                <option key={index} value={user.id}>{user.text}</option>
              ))}
            </select>
          </div>

          {/* <div className="col-span-6">
            <label >Current Chips</label>
            <input type="text"
              name="cbalance"
              defaultValue={cbalance}
              tabIndex={-1}
              readOnly={true} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" />
          </div> */}

          <div className="col-span-6">
            <label >Remark</label>
            <input maxLength="100" placeholder="Reference" type="text" defaultValue={remark} onChange={e => setRemark(e.target.value)} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" />
          </div>
          <div className="col-span-6">
            <label>Free Chips</label>
            <input
              className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700"
              placeholder="Free Chip"
              type="number"
              onChange={e => { setFreeChip(e.target.value); setRbalance(parseInt(cbalance - e.target.value)) }}
              min="0" max={cbalance} required />
          </div>
          <div className="col-span-6 text-right">
            <label >Remaining Chips</label>
            <p className='text-green-600 font-semibold'>{rbalance}</p>


          </div>

          {modesdata.length > 0 && modesdata}
          {/* {modesdata.length > 0 &&
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
              {modesdata.length > 0 && modesdata}
            </div>} */}
          <div className='col-span-6'>
            <label >Mobile Number</label>
            <input maxLength="100" placeholder="Mobile Number" type="text" autoComplete='off' defaultValue={mobile} onChange={e => setMobile(e.target.value)} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" />
          </div>
          <div className="col-span-6">
            <label>Admin Password</label>
            <input maxLength="100" placeholder="Admin Password" type="password" autoComplete='off' required defaultValue={admin_password} onChange={e => setAdminPassword(e.target.value)} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" />
          </div>
          <div className="col-span-12">
            <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-full focus:outline-none float-right" >Create</button>
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

export default AddUserPopup;
