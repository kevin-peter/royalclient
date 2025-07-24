import React, { useEffect, useState, useContext } from "react";
import Modal from "../../../components/Model";
import StoreContext from "../../../Store";

const AddAmountBox = (props) => {
  const store = useContext(StoreContext);

  //console.log(props)
  const [Amount, setAmount] = useState(props.amount);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  //const [error, setMessage] = useState("");

  const [message, setMessage] = useState();
  const [errorClass, setErrorClass] = useState("alert-success");
  useEffect(() => {
    // getMarkets();
  }, []);

  const handleConfirm = (event_id, market_id) => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    const urlencoded = {
      event_id: event_id,
      market_id: market_id,
      amount: Amount,
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
        props.closeModal();
        props.messageModal(result.message);
        if (!result.success) {
          setErrorClass("alert-danger");
        }
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
      title={`${props.event_name}` + " : " + `${props.market_name}`}
      sub_title={"Amount: " + Amount + ", Exp: " + props.exposer }
      className="modal modal-fullscreen"
    >
      <>
        {/* <div className="form-group">{"Maximum Runs " + props.exposer}</div> */}
        <div className="form-group mt-1">
          <label className="float-left pl-1 pr-2">Update Amount:</label>
          <input
            placeholder="Enter Amount"
            type="text"
            value={Amount}
            onChange={(e) => setAmount(e.target.value)}
            maxLength="50"
            required
            // ref={(tx) => {
            //   txtInp = tx;
            // }}
          />

          {/* <div className="badge badge-dark ">Max ({props.exposer})</div> */}
        </div>

        <button
          type="button"
          className="btn btn-sm btn-success"
          onClick={() => handleConfirm(props.event_id, props.market_id)}
        >
          Place Bet
        </button>
      </>
    </Modal>
  );
};

export default AddAmountBox;
