import React, { useState, useContext } from 'react';
//import StoreContext from './../../../../store'
import StoreContext from "../../../Store";
import Modal from "../../../components/Model"

const AddUserPopup = (props) => {
  const store = useContext(StoreContext);
  /** statue for Add new user */
  const [name, setName] = useState("");
  const [username, setUserName] = useState("");
  const [remark, setRemark] = useState("");
  const [password, setPassword] = useState("");
  const [re_password, setRepassword] = useState("");
  const [freechip, setFreeChip] = useState(0);
  const [rbalance, setRbalance] = useState(store.getItem("bal"));
  const [cbalance] = useState(store.getItem("bal"));
  const [patnership, setPatnership] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setMessage] = useState("");
  const [userType, setUserType] = useState("5");

  const getUserPaternShip = (e) => {
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded
    };
    fetch(import.meta.env.VITE_API_HOST + "/getPartnership", requestOptions)
      .then((response) => {
        if (response.status === 401) {

        } else {
          return response.json();
        }
      }).then((result) => {
        if (result && result.success) {
          let newarray = [];
          newarray = result.data.map(obj => ({ ...obj, ownership: obj.partnership, downline: "", visible: true }));
          setPatnership(newarray);
        }
      });
  }

  const saveNewUser = (e) => {
    e.preventDefault();
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();

    urlencoded.append("name", name);
    urlencoded.append("email", username);
    urlencoded.append("password", password);
    urlencoded.append("re_password", re_password);
    urlencoded.append("free_chip", freechip);
    urlencoded.append("mainBalance", rbalance);
    urlencoded.append("balance", cbalance);
    urlencoded.append("type", userType);
    urlencoded.append("remark", remark);

    for (const part of patnership) {
      urlencoded.append(`active_${part.play}`, part.visible ? "on" : "");
      urlencoded.append(`downline_${part.play}`, part.downline);
    }

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded
    };

    fetch(import.meta.env.VITE_API_HOST + "/addUser", requestOptions).then((response) => {
      if (response.status === 401) {
        setLoading(false);
      } else {
        return response.json();
      }
    }).then((result) => {
      if (result && result.success) {
        props.modelClose("alert-success", result.message)
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

  const update = (id, event) => {
    let newval = parseInt(event.target.value);
    if (newval === 'undefined' || newval < 0 || Number.isNaN(newval))
      newval = 0;
    let patnershipItems = patnership.map(
      el => el.play_mode === id ? { ...el, ownership: parseInt(el.partnership - newval), downline: newval } : el
    )
    setPatnership(patnershipItems);
  }

  const updateMode = (id, visible) => {
    let patnershipItems = patnership.map(
      el => el.play_mode === id ? { ...el, visible: visible } : el
    )
    setPatnership(patnershipItems);
  }

  let userData = [{ id: '', text: 'Select Role' }];
  if (props.role && props.role < 2) {
    userData.push({ id: 3, text: 'Admin' })
  }
  if (props.role && props.role < 3) {
    userData.push({ id: 3, text: 'Master' })
  }
  if (props.role && props.role < 4) {
    userData.push({ id: 4, text: 'Super Master' })
  }
  if (props.role && props.role < 5) {
    userData.push({ id: 5, text: 'Client' })
  }

  const modesdata = patnership.map((mode, key) => (
    <tr key={key}>
      <td>
        <div className="form-check">
          <input className="form-check-input"
            defaultChecked={true}
            value={patnership.length > 0 ? patnership[key].visible : true}
            type="checkbox" onChange={() => { updateMode(mode.play_mode, !patnership[key].visible) }} />
          <label className="form-check-label">
            {mode.play}
          </label>
        </div>
      </td>
      <td><input type="text" value={patnership.length > 0 ? mode.partnership : ""} className="form-control" readOnly={true} /></td>
      <td><input type="number" min="0" max={mode.partnership} onChange={(e) => { update(mode.play_mode, e) }} className="form-control" readOnly={userType === "5"} required /></td>
      <td><input type="text" value={patnership.length > 0 ? mode.ownership : ""} className="form-control" readOnly={true} /></td>
    </tr>
  ));

  return (
    <Modal closeModal={props.closeModal} title={"Create NEW Admin/OPERATOR"} >
    <div className="col-12">
      <form className="mt-3" autoComplete="off" onSubmit={saveNewUser}>
        <div className="form-row">
          <div className="col-6 form-group mt-1 input__custom">
            <input className="form-control name"
              placeholder="Name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength="20"
              required />
          </div>
          <div className="col-6 form-group mt-1 input__custom">
            <input className="form-control email"
              placeholder="Username"
              type="text"
              value={username}
              onChange={e => setUserName(e.target.value)}
              pattern="[^\s]+"
              title="please dont use the white space :)"
              maxLength="12"
              required
            />
          </div>
          <div className="col-6 form-group mt-1 input__custom">
            <input className="form-control password"
              placeholder="Password"
              type="password"
              onChange={e => setPassword(e.target.value)}
              value={password}
              autoComplete="off"
              minLength="6"
              maxLength="20"
              required />
          </div>

          <div className="col-6 form-group mt-1 input__custom">
            <input className="form-control password"
              placeholder="Re-Password"
              type="password"
              onChange={e => setRepassword(e.target.value)}
              value={re_password}
              autoComplete="off"
              minLength="6"
              maxLength="20"
              required />
          </div>
          <div className="col-6 form-group mt-1 input__custom">
            <input
              className="form-control"
              placeholder="Free Chip"
              type="number"
              onChange={e => { setFreeChip(e.target.value); setRbalance(parseInt(cbalance - e.target.value)) }}
              min="0" max={cbalance} required />
          </div>

          <div className="col-6 form-group mt-1 input__custom">
            <select name="userstype" className="form-control" onChange={e => { setUserType(e.target.value); getUserPaternShip(e) }} required>
              {userData.map((user, index) => (
                <option key={index} value={user.id}>{user.text}</option>
              ))}
            </select>
          </div>
          <div className="col-6 form-group mt-1 input__custom">
            <label >Remaining Chips</label>
            <input type="text"
              value={rbalance}
              readOnly={true} className="form-control" />

          </div>
          <div className="col-6 form-group mt-1 input__custom">
            <label >Current Chips</label>
            <input type="text"
              name="cbalance"
              defaultValue={cbalance}
              readOnly={true} className="form-control" />
          </div>
          <div className="col-12 form-group">
            <label >Remark</label>
            <input maxLength="100" placeholder="Reference" type="text" defaultValue={remark} onChange={e => setRemark(e.target.value)} className="form-control" />
          </div>
          {modesdata.length > 0 &&
            <div className="col-12 table-reponsive">
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th width="10%">Play Type</th>
                    <th width="30%">UpLine</th>
                    <th width="30%">Downline</th>
                    <th width="30%">Our Part</th>
                  </tr>
                </thead>
                <tbody>
                  {modesdata.length > 0 && modesdata}
                </tbody>
              </table>
            </div>}
          <div className="col-6 form-group mt-1 input__custom">
            <button title="Create User" type="submit" disabled={loading} className="btn btn-sm btn-theme btn-primary">Create</button>
          </div>
          <div className="col-6 form-group mt-1 input__custom">
            <button className="btn btn-sm btn-danger float-right" onClick={props.modelClose}>Cancel</button>
          </div>
          <div className="form-group col-12">
            {error && <p className="alert alert-danger">{error}</p>}
          </div>
        </div>
      </form>
    </div>
    </Modal>
  )
}

export default AddUserPopup;
