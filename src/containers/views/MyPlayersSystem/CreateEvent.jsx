import React, { useState, useContext } from 'react';
import Modal from "../../../components/Model"
import StoreContext from "../../../Store";

const CreateEvent = (props) => {
  let txtInp = null;

  /** statue for Add new user */
  const store = useContext(StoreContext);
  const [marketname, setMarketName] = useState("");
   
  const [loading, setLoading] = useState(false);
  const [error, setMessage] = useState("");
  const [errorClass, setErrorClass] = useState("alert alert-success");

  const resetForm = () => {
    setMarketName("");
    txtInp.focus();
  }
  
  const createMarket = (e) => {
    e.preventDefault();
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

    const urlencoded = {
      "name": marketname,
      
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded)
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/createMarket", requestOptions).then((response) => {
      if (!response.ok) {
        setErrorClass("alert alert-danger")
      } else {
        setErrorClass("alert alert-success")
        resetForm()
      }
      if (response.status === 403) {
        props.navigate(`/login`)
      } else {
        return response.json();
      }
    }).then((result) => {
      setMessage(result.message)
      setTimeout(() => {
        setMessage("")
      }, 3000)
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    })
  }

  
  
  //console.log(store.getItem("event_data"));

  return (<Modal closeModal={props.closeModal} title={"CREATE NEW MARKET"} >
    <div className="model-table-content">
      <form className="form-inline" autoComplete={"off"} onSubmit={createMarket}>
        <div className="grid grid-cols-12 gap-1 text-blue-900 dark:text-white  px-1 py-1">
          <div className="form-group mt-1">
            <label className='float-start col-12 col-md-2 '>Market Name</label>
            <input
              placeholder="Market Name"
              type="text"
              value={marketname}
              onChange={e => setMarketName(e.target.value)}
              maxLength="50"
              required
              ref={(tx) => { txtInp = tx; }}

            />
          </div>

          
          
          <div className='clear-both h-0 col-span-12' />
          <div className="form-group mt-1">
            <button title="Create User" type="submit" disabled={loading} className="btn btn-sm btn-primary">Create</button>
            <button className="btn btn-sm btn-danger float-end" onClick={props.closeModal}>Cancel</button>
          </div>
          <div className="col-span-8 md:col-span-10 text-center">
            {error && <span className={`px-2 py-1 bg-primary-900 ${errorClass} `}>{error}</span>}
          </div>
        </div>
      </form>
    </div>
  </Modal>)
}
export default CreateEvent