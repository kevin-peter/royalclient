import React, { useEffect, useState, useContext } from "react";
import Modal from "../../../components/Model";
import StoreContext from "../../../Store";

const ConfirmPlayers = (props) => {
  const store = useContext(StoreContext);

  //console.log(props)
  const [playerList, setPlayerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
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

    fetch(
      import.meta.env.VITE_API_HOST + "/event/getSelRuners",
      requestOptions
    )
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.all) setPlayerList(result.all);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleConfirm = (event_id, market_id) => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    const urlencoded = {
      event_id: event_id,
      market_id: market_id,
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(
      import.meta.env.VITE_API_HOST + "/event/confirmPlayers",
      requestOptions
    )
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        //if (result.data) setConfirm(true);
        props.returnConfirmModal()
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <Modal
      closeModal={props.closeModal}
      title={`${props.title}`}
      sub_title=""
      className="modal modal-fullscreen"
    >
      {!confirm && (
      <>
      <table
        className="table table-secondary table-striped"
        key={props.market_id}
      >
        <thead className="thead-dark">
          <tr>
            <th scope="col">No.</th>
            <th scope="col">Name</th>
            <th scope="col">Exp</th>
            <th scope="col">Selected Date</th>
            <th scope="col">Market Name</th>
          </tr>
        </thead>
        <tbody>
          {playerList.length > 0 &&
            playerList.map((v, k) =>
              v.market_id == props.market_id && v.type == "user" ? (
                <tr key={k}>
                  <td>{k + 1}</td>
                  <td>{v.runner_name}</td>
                  <td>{v.exp}</td>
                  <td>{v.updated_at}</td>
                  <td>{props.market_name}</td>
                </tr>
              ) : null
            )}
        </tbody>
      </table>
      <div style={{ clear: "both" }}>
        <hr />
      </div>
      <button
        type="button"
        className="btn btn-sm btn-success"
        onClick={() => handleConfirm(props.event_id, props.market_id)}
      >
        Confirm to Play
      </button>
      </>
)}
{confirm && (
      <>
      <h1>Player Confirmed Successfully!</h1>
      </>
)}
    </Modal>
  );
};

export default ConfirmPlayers;
