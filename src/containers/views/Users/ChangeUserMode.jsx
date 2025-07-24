import React, { useState, useEffect, useContext } from 'react';
import Modal from "../../../components/Model"
import StoreContext from '../../../Store';

const ChangeUserMode = (props) => {
  const store = useContext(StoreContext);
  const [modesdata, setModData] = useState(store.getItem("modes"));
  const [error, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorClass, setErrorClass] = useState("alert alert-success");
  const [password, setPassword] = useState("");

  useEffect(() => {
    getModes();
  }, []);

  useEffect(() => {
    let md = [...modesdata];
    for (let i = 0; i < md.length; i++) {
      md[i].our = 100
      md[i].downline = 0
      md[i].active = 1
    }
    setModData(md)
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
          let md = [...modesdata];
          let found = 0;
          for (let i = 0; i < md.length; i++) {
            found = 0;
            for (let j = 0; j < data.length; j++) {
              if (md[i].mode_id === data[i].mode_id) {
                found = 1
                md[i].our = 100 - data[i].downline;
                md[i].downline = data[i].downline
                md[i].active = data[i].active
              }
            }
            if (found === 0) {
              md[i].our = 90
              md[i].downline = 10
              md[i].active = 1
            }
          }
          setModData(md)
        }
      })
      .then(() => {

      })
      .catch((e) => { });
  };

  const updateModes = (e) => {
    e.preventDefault();
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

    let ro = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        partArr: modesdata,
        user_id: props.user.id,
        admin_password: password
      })
    };

    fetch(import.meta.env.VITE_API_HOST + '/user/updatepart', ro)
      .then((response) => {
        if (!response.ok) {
          setErrorClass("alert alert-danger")
        } else {
          setErrorClass("alert alert-success")
        }
        if (response.status === 401) {
          props.navigate(`/login`)
        } else {
          return response.json();
        }
      })
      .then((result) => {
        setMessage(result.message)
        if (result && result.success) {
          props.closeModal(result.message, "alert alert-success")
        }
        setTimeout(() => {
          setMessage("")
        }, 3000)
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };



  return (
    <Modal closeModal={props.closeModal} title={"Change Sports Partership "}>
      <form className="my-1 text-left align-middle" autoComplete="off" onSubmit={updateModes}>
        <div className="row">
          {modesdata.length > 0 && (
            <div className="col-12 table-reponsive mt-2">
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th width="10%">Play_Type</th>
                    <th width="30%">UpLine</th>
                    <th width="30%">Downline</th>
                    <th width="30%">Our Part</th>
                  </tr>
                </thead>
                <tbody>{
                  modesdata.map((v, k) => (
                    <tr key={k}>
                      <td>
                        <div>
                          <input className="form-check-input" onChange={() => {
                            let pl = [...modesdata];
                            pl[k].active = !v.active
                            setModData(pl)
                          }} type="checkbox" checked={v.active} />
                          <label className="ms-1">{v.play}</label>
                        </div>
                      </td>
                      <td className="input__custom"><input type="number" className="form-control" value={0} readOnly disabled={true} /></td>
                      <td className="input__custom"><input type="number" onChange={(e) => {
                        let pl = [...modesdata];
                        pl[k].our = e.target.value ? 100 - parseInt(e.target.value) : 100
                        pl[k].downline = e.target.value ? parseInt(e.target.value) : ""
                        setModData(pl)
                      }} min={0} max={100} className="form-control" value={v.downline} required /></td>
                      <td className="input__custom"><input type="number" className="form-control" value={(100 - v.downline)} readOnly disabled={true} /></td>
                    </tr>
                  ))}</tbody>
              </table>
            </div>
          )}
          <div className="col-6 form-group mt-1 input__custom">
            <label >Admin Password:</label>
            <input type="password"
              autoComplete="off"
              onChange={e => setPassword(e.target.value)}
              className="form-control"
              maxLength="20"
              required />
          </div>
          <div className="col-12 form-group mt-3">
            <button title="Modify User" type="submit" disabled={loading} className="btn btn-sm btn-primary float-end shadow">Create</button>
            <button className="btn btn-sm btn-danger float-start shadow" onClick={()=>props.closeModal()}>Cancel</button>
          </div>
          <div className="text-center">
            {error && <span className={`px-2 py-1 ${errorClass} `}>{error}</span>}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ChangeUserMode;
