import React, { useEffect, useState, useContext } from "react";
import Modal from "../../../components/Model";
import StoreContext from "../../../Store";
let home_team = [];

const AddMarket = (props) => {
  const store = useContext(StoreContext);
  const [hometeam, setHomeTeam] = useState(home_team);

  const [playerList, setPlayerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setMessage] = useState("");

  const [errorClass, setErrorClass] = useState("alert alert-success");

  useEffect(() => {
    getMarkets();
  }, []);

  const getMarkets = async (e) => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    const urlencoded = {
      event_id: props.event_id,
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/getPlayers", requestOptions)
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.data) setPlayerList(result.data);
        //home_team = result.data
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // console.log(home_team)
  return (
    <Modal closeModal={props.closeModal} title={`${props.title}`} sub_title="">
      <div className="model-table-content">
        <div className="grid grid-cols-10 gap-1 text-blue-900 dark:text-dark px-1 py-1">
          {/* <h3>Team - 1</h3> */}
          {playerList.length > 0 &&
            playerList.map((v, k) => (
              <div className="form-group mt-1" key={k}>
                <label className="float-start col-md-1">{k + 1}</label>
                <label className="text-dark" key={k}>
                  {v.name}
                </label>
              </div>
            ))}

          <div style={{ clear: "both" }}>
            <hr />
          </div>
          {/* <div className='col-10'>
            <button className='btn btn-sm btn-primary float-start'>Update</button>
            <button type='button' className='btn btn-sm btn-danger float-end' onClick={props.closeModal}>Cancle</button>
          </div> */}
        </div>
      </div>
    </Modal>
  );
};

export default AddMarket;
