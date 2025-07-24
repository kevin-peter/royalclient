import React, { useEffect, useState } from "react"
import { NavLink } from "react-router-dom";
import CreateEvent from "./CreateEvent";
import AsignEvent from "./AssignEvent";

const MyEventList = (props) => {
  const [loading, setLoading] = useState(false);
  const [eventList, setList] = useState([]);
  const [activeRow, setAcvRow] = useState(0);
  const [create, setCreate] = useState(false);
  const [assign, setAssign] = useState(false);
  const [event_id, setEventId] = useState("");


  useEffect(() => {
    getEvents()
  }, [])

  const getEvents = async (e) => {
    setLoading(true)
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));


    const urlencoded = {
      "event_id": props.event_id,
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded)
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/getassignevent", requestOptions).then((response) => {
      if (response.status === 401) {

      } else {
        return response.json();
      }
    }).then(async (result) => {
      if (result.data) {
        setList(result.data)
      }
    }).catch((err) => {
      console.log(err)
    }).finally(() => {
      setLoading(false)
    })
  }

  const closeModal = async (e) => {
    setCreate(false)
    setAssign(false)
  }

  useEffect(() => {
  }, [])
  return (
    <>
      <div className="row">
        <div className="col-12">
          <h1 className="text-center">-: MY EVENT :-</h1>
        </div>
        {props.role === 3 && <div className="col-6">
          <button onClick={(e) => { setCreate(true) }} className="btn btn-sm btn-secondary float-end">+</button>
        </div>}
      </div>
      <div className="table-responsive">
        <table className="table table-striped m-0">
          <thead>
            <tr>
              <th width="5%" className='text-center px-2 py-0.5'>Sr.</th>
              <th className="px-2 py-1 text-left">Event Id</th>
              <th className="px-2 py-1 text-left">Event Name</th>
              <th className="px-2 py-1 text-left">Start Time</th>
              <th className="px-2 py-1 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {eventList.map((v, k) => (
              <tr key={k} role={"button"} title={v.event_name} className={`${k % 2 === 0 ? "bg-white dark:bg-sky-300/10" : "bg-white/90 dark:bg-primary-900"} ${activeRow === k ? "dark:border-blue-500 border-primary-300" : ""}`} >
                <td className='text-center px-2 py-1' width="5%" >{k + 1}</td>
                <td className="px-2 py-0.5">{v.event_id}</td>
                <td className='text-left px-2 py-0.5'><u><NavLink className="btn btn-sm btn-success ms-1"
                  target="_blank"
                  to={`/event/eventdata/${v.event_id}/${v.market_id}`}
                >{v.event_name}</NavLink></u></td>
                <td className='text-left px-2 py-0.5'>{v.opendate}</td>
                <td className='text-center text-xs'> {props.role === 3 &&
                  <button className="btn btn-sm btn-dark" onClick={(e) => {
                    setAssign(true)
                    setEventId(v.event_id)
                  }}>O</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {create && <CreateEvent closeModal={closeModal} ></CreateEvent>}
      {assign && <AsignEvent event_id={event_id} closeModal={closeModal} ></AsignEvent>}
    </>
  )
}

export default MyEventList