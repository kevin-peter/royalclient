import React, { useEffect, useState, useContext } from "react"
import Modal from "../../../components/Model"
import StoreContext from '../../../Store';

const CreateParty = (props) => {
  let txtInp = null;
  const store = useContext(StoreContext);

  /** statue for Add new user */

  const [username, setUserName] = useState("");
  const [pass, setPass] = useState("");
  const [userType, setUserType] = useState(store.getItem("role"));
  const [freechip, setFreeChip] = useState(0);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [remark, setRemark] = useState("");
  const [webref, setWebRef] = useState("");
  const [modeList] = useState(store.getItem("modes"));
  const [partList, setPartList] = useState(store.getItem("modes"));
  const [loading, setLoading] = useState(false);
  const [error, setMessage] = useState("");
  const [errorClass, setErrorClass] = useState("alert alert-success");
  const [password, setPassword] = useState("");
  let u_role = store.getItem("role");
  let part = store.getItem("modes");
  useEffect(() => {
    let ml = [...modeList];
    // for (let i = 0; i < ml.length; i++) {
    //   ml[i].active = 1;
    //   ml[i].upline = 0;
    //   ml[i].our = 10;
    //   ml[i].downline = 90;
    // }
    //console.log(ml)
    setPartList(ml)
  }, []);

  const resetForm = () => {
    setName("");
    setUserName("");
    setMobile("");
    setRemark("");
    setFreeChip(100000);
    setUserType(2)
    txtInp.focus();
  }

  const saveNewUser = (e) => {
    e.preventDefault();
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        name: name,
        email: username,
        password: pass,
        mobile: mobile,
        free_chip: freechip,
        u_role: userType,
        partArr: partList,
        webref: webref,
        remark: remark,
        admin_password: password
      })
    };
    fetch(import.meta.env.VITE_API_HOST + "/user/adduser", requestOptions).then((response) => {
      if (!response.ok) {
        setErrorClass("alert alert-danger")
      } else {
        setErrorClass("alert alert-success")
        resetForm()
      }
      if (response.status === 401) {
        props.navigate(`/login`)
      } else {
        return response.json();
      }
    }).then((result) => {
      setMessage(result.message)
      if (result && result.success) {
        props.closeModal(result.message, "alert alert-success")
      }
      setTimeout(() => {
        setMessage("")
      }, 3000)
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    })
  }

  console.log(partList)

  return (<Modal closeModal={props.closeModal} title={"Create NEW Admin/OPERATOR"} >
    <form className="my-1 text-left align-middle" autoComplete={"off"} onSubmit={saveNewUser}>
      <div className="row">
        <div className="col-6 form-group mt-1 input__custom">
          <label>USER ID</label>
          <input
            placeholder="USER ID"
            minLength={2}
            type="text"
            value={username}
            onChange={e => setUserName(e.target.value)}
            pattern="[^\s]+"
            title="please dont use the white space :)"
            maxLength={16}
            required
            ref={(tx) => { txtInp = tx; }}
            className="form-control"
          />
        </div>
        <div className="col-6 form-group mt-1 input__custom">
          <label>Password</label>
          <input maxLength="100" placeholder="Password" type="password" value={pass} required onChange={e => setPass(e.target.value)} className="form-control" autoComplete="off" />
        </div>
        <div className="col-6 form-group mt-1 input__custom">
          <label>Name</label>
          <input maxLength="100" placeholder="Name" type="text" value={name} required onChange={e => setName(e.target.value)} className="form-control" />
        </div>
        <div className="col-6 form-group mt-1 input__custom">
          <label>Remark</label>
          <input maxLength="100" placeholder="Remark" type="text" value={remark} onChange={e => setRemark(e.target.value)} className="form-control" />
        </div>

        <div className="col-6 form-group mt-1 input__custom">
          <label>Free Chips</label>
          <input maxLength="100" placeholder="Free Chips" type="number" value={freechip} onChange={e => setFreeChip(e.target.value)} className="form-control" />
        </div>

        <div className="col-6 form-group mt-1 input__custom">
          <label>Role</label>
          <select value={userType} className="form-control" onChange={(e) => {
            setUserType(e.target.value)
          }} required>
            <option value="">Select Role</option>
            {u_role < 2 ? (<option value={2}>ADMIN</option>) : null }
            {u_role < 4 ? (<option value={3}>Master</option>) : null }
            {u_role < 5 ? (<option value={4}>Super Master</option>) : null }
            {u_role < 6 ? (<option value={5}>Client</option>) : null }
            <option value={7}>OPERATOR</option>
          </select>
        </div>
        {parseInt(u_role) === 1 &&
          <div className="col-6 form-group mt-1 input__custom">
            <label>WEBREF</label>
            <input maxLength="100" placeholder="Webref" type="text" value={webref} onChange={e => setWebRef(e.target.value)} className="form-control" />
          </div>}
          <div className="col-6 form-group mt-1 input__custom">
            <label>Mobile Number</label>
            <input maxLength="100" placeholder="Mobile Number" type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="form-control" />
          </div>
        {parseInt(userType) != 5 && parseInt(userType) != 7 && <div className="col-12 table-reponsive mt-2">
          <table className="table table-bordered table-sm table-dark">
            <thead>
              <tr>
                <th>Play Type</th>
                <th>UpLine</th>
                <th>Downline</th>
                <th>Our Part</th>
              </tr>
            </thead>
            <tbody>
              {partList.map((v, k) => (
                <tr key={k}>
                  <td>
                    <div>
                      <input className="form-check-input" onChange={() => {
                        let pl = [...partList];
                        pl[k].active = !v.active
                        setPartList(pl)
                      }} type="checkbox" checked={v.active} />
                      <label>{v.play}</label>
                    </div>
                  </td>
                  <td className="input__custom"><input type="number" className="form-control" value={100 - parseInt(part[0].our)} readOnly disabled={true} /></td>
                  <td className="input__custom">
                    <input type="number" onChange={(e) => {

                    let pl = [...partList];
                    pl[k].our = e.target.value ? parseInt(part[0].our) - parseInt(e.target.value) : parseInt(part[0].our)
                    pl[k].downline = e.target.value ? parseInt(e.target.value) : ""
                    setPartList(pl)
                  }} min={0} max={parseInt(part[0].our)} className="form-control" value={v.downline} required />
                  </td>
                  <td className="input__custom"><input type="number" className="form-control" value={v.our} readOnly disabled={true} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
        <div className="col-6 form-group mt-1 input__custom">
          <label >Admin Password:</label>
          <input type="password"
            autoComplete="off"
            onChange={e => setPassword(e.target.value)}
            className="form-control"
            maxLength="20"
            required />
        </div>
        <div className="col-12 form-group mt-2">
          <button title="Create User" type="submit" disabled={loading} className="btn btn-sm btn-primary float-end">Create</button>
          <button type="reset" className="btn btn-sm btn-danger float-start" onClick={(e) => {
            e.preventDefault()
            props.closeModal()
          }}>Cancel</button>
        </div>
        <div className="text-center">
          {error && <span className={`px-2 py-1 ${errorClass} `}>{error}</span>}
        </div>
      </div>
    </form>
  </Modal>)
}

export default CreateParty