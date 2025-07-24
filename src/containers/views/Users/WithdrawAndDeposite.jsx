import React, { useState } from 'react'
import Modal from "../../../components/Model"

export default function WithdrawAndDeposite(props) {


  const [remainingChimp, setremainingChimp] = useState("");
  const [withdraw, setWithdraw] = useState("");
  const [password, setPassword] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setMessage] = useState("");
  const [errorClass, setErrorClass] = useState("alert alert-success");

  const countRemainChimp = (event) => {
    let withdraw = parseInt(event.target.value);

    if (Number.isNaN(withdraw) || withdraw < 0)
      withdraw = 0;
    if (props.t_type === 'withdraw')
      setremainingChimp(Number(props.user.amount) - Number(withdraw));
    else
      setremainingChimp(Number(props.user.amount) + Number(withdraw));

  }
  const withdrawAndDepositeSubmit = (e) => {
    e.preventDefault();
    setLoading(true)
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("user_id", props.user.id);
    urlencoded.append("deposite_bal", withdraw);
    urlencoded.append("t_type", props.t_type);
    urlencoded.append("remark", remark);
    urlencoded.append("p_code", props.user.p_code);
    urlencoded.append("admin_password", password);

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded
    };

    let path = "/user/updateChips";

    fetch(import.meta.env.VITE_API_HOST + path, requestOptions)
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
      }).then((result) => {
        setMessage(result.message)
        if (result && result.success) {
          setErrorClass("alert alert-success")
          resetSetting()
          props.closeModal(result.message, "alert alert-success")
        } else {
          setErrorClass("alert alert-danger")
        }
        setTimeout((e) => {
          setMessage("")
        }, 2000);
        setLoading(false);
      }).catch((e) => {
        setLoading(false);
      })

  }
  const resetSetting = () => {
    setWithdraw("")
    setPassword("")
    setRemark("")
    setremainingChimp("")
    return;
  }
  return (
    <Modal closeModal={props.closeModal} title={props.t_type && props.t_type === 'withdraw' ? `Withdraw from ${props.user.p_code}` : `Deposit to ${props.user.p_code}`}>
      <form autoComplete="off" className="my-1 text-left align-middle" onSubmit={withdrawAndDepositeSubmit}>
        <div className="row">
          <div className="col-6 form-group mt-1 input__custom">
            <label>Available Chips [{props.user && props.user.p_code}]</label>
            <input type="text"
              readOnly={true}
              className="form-control"
              name="current_bal_user"
              defaultValue={props.user && props.user.amount} required />
          </div>
          <div className="col-6 form-group mt-1 input__custom">
            <label >{props.t_type && props.t_type === 'withdraw' ? "Withdraw Chips" : "Deposite Chips"}</label>
            <input type="number"
              value={withdraw}
              onChange={e => { setWithdraw(e.target.value); countRemainChimp(e) }}
              min="0"
              max={props.t_type && props.t_type === 'withdraw' ? props.user.amount : props.bal}
              className="form-control"
              autoFocus
              required />
          </div>

          <div className="col-6 form-group mt-1 input__custom">
            <label >Remark</label>
            <input type="text"
              value={remark}
              onChange={e => setRemark(e.target.value)}
              maxLength="70"
              className="form-control"
              required />
          </div>

          <div className="col-6 form-group mt-1 input__custom">
            <label >Chips After</label>
            <input type="text"
              readOnly={true}
              disabled={true}
              tabIndex={-1}
              value={remainingChimp}
              className="form-control"
              name="remaining_bal"
              required />
          </div>

          <div className="col-6 form-group mt-1 input__custom">
            <label >Admin Password:</label>
            <input type="password"
              autoComplete="off"
              onChange={e => setPassword(e.target.value)}
              className="form-control"
              maxLength="20"
              required />
          </div>
          <div className="col-12 form-group mt-3 input__custom">
            <button type="submit" disabled={loading} className="btn btn-sm btn-primary float-end">Transfer</button>
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
    </Modal>
  );
}
