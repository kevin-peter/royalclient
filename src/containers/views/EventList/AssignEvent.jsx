import React, { useState, useContext, useEffect } from 'react';
import Modal from "../../../components/Model"
import StoreContext from '../../../Store';


const AssignEvent = (props) => {

  const store = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const [pmod, setPmod] = useState(false);
  const [userList, setList] = useState([]);
  const [activeRow, setAcvRow] = useState(0);
  const [create, setCreate] = useState(false);

  const closeModal = async (e) => {
    setCreate(false)
  }

  useEffect(() => {
    getUsers()

  }, [])

  const mapRole = (r) => {
    let rn = "Party"
    if (r === 6) rn = "Operator"

    return rn;
  }

  const getUsers = async (e) => {
    setLoading(true)
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    let requestOptions = {
      method: "POST",
      headers: headers,
    };

    fetch(import.meta.env.VITE_API_HOST + "/user/getusers", requestOptions).then((response) => {
      if (response.status === 403) {
        props.navigate(`/login`)
      } else {
        return response.json();
      }
    }).then((result) => {
      if (result.data) getassignevent(result.data)
      getassignevent(result.data)
    }).catch((err) => {
      console.log(err)
    }).finally(() => {
      setLoading(false)
    })
  }


  const getassignevent = async (u_data) => {
    setLoading(true)
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    const urlencoded = {
      "event_id": props.event_id,
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded)
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/getassignevent", requestOptions).then((response) => {
      if (response.status === 403) {
        props.navigate(`/login`)
      } else {
        return response.json();
      }
    }).then((result) => {
      if (result.data) {
        let usr = [];
        for (let i = 0; i < u_data.length; i++) {
          usr[i] = u_data[i]
          for (let j = 0; j < result.data.length; j++) {
            if (result.data[j].op_id === u_data[i].id) {
              usr[i].checked = true
            }
          }
        }
        setList(usr)
      }

    }).catch((err) => {
      console.log(err)
    }).finally(() => {
      setLoading(false)
    })
  }

  const assignEvent = async (op_id) => {
    setLoading(true)
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    const urlencoded = {
      "event_id": props.event_id,
      "op_id": op_id
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded)
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/assignevent", requestOptions).then((response) => {
      if (response.status === 403) {
        props.navigate(`/login`)
      } else {
        return response.json();
      }
    }).then((result) => {
      let usr = [...userList];
      for (let i = 0; i < usr.length; i++) {
        if (op_id === usr[i].id) {
          usr[i].checked = true
        }
      }
      setList(usr)
      alert("SuccessFully Asigned Event To Operator")
    }).catch((err) => {
      console.log(err)
    }).finally(() => {
      setLoading(false)
    })
  }

  const removeEvent = async (op_id) => {
    setLoading(true)
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    const urlencoded = {
      "event_id": props.event_id,
      "op_id": op_id
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded)
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/removeassignevent", requestOptions).then((response) => {
      if (response.status === 403) {
        props.navigate(`/login`)
      } else {
        return response.json();
      }
    }).then((result) => {
      let usr = [...userList];
      for (let i = 0; i < usr.length; i++) {
        if (op_id === usr[i].id) {
          usr[i].checked = false
        }
      }
      setList(usr)
      alert("SuccessFully Removed Asigned Event From Operator")
    }).catch((err) => {
      console.log(err)
    }).finally(() => {
      setLoading(false)
    })
  }


  return (<Modal closeModal={props.closeModal} title={`${props.title}`} sub_title={"Assign Event"} >
    <div className="model-table-content">
      <div className="table-responsive">
        <table className="table table-striped m-0">
          <thead className="light-table-bg">
            <tr>
              <th width="5%" className='text-center px-2 py-0.5'>Sr.</th>
              <th className="px-2 py-1 text-left">Operator Name</th>
              <th className="px-2 py-1 text-left">Operator ID</th>
              <th className="px-2 py-1 text-left">Role</th>
              <th className="px-2 py-1 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((v, k) => (
              <tr>
                <td className='text-center px-2 py-1' width={"5%"}>{k + 1}</td>
                <td className="px-2 py-0.5">{v.name}</td>
                <td className='text-left px-2 py-0.5'> {v.p_code}{v.cutting ? "/C" : ""}</td>
                <td className='text-left px-2 py-0.5'><span role="button" title={mapRole(v.u_role, v.cutting)} className={`px-2 py-1 ${(v.u_role)}`}>{mapRole(v.u_role)}</span></td>

                <td className='text-center text-xs'>
                  <input type='checkbox' checked={v.checked} onChange={async (e) => {
                    if (e.target.checked) {
                      await assignEvent(v.id)
                    } else {
                      await removeEvent(v.id)
                    }
                  }} />
                </td>
                <td className='text-right px-2 py-0.5'>{v.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </Modal>)
}
export default AssignEvent