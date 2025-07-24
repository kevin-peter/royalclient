import React from "react";

import { Switch } from '@headlessui/react'
import Loader from "../../Component/Loader";

class SettlementModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      my_chips: 0,
      my_nm: "",
      amount: 0,
      remark: "",
      pwd: "",
      sel: "Withdraw Chips",
      rm_chips: 0,
      message: "",
      alertclass: "",
      locked: false
    };
  }

  componentDidMount() {
    let my_chips = 0;
    if (localStorage.getItem("balance")) {
      my_chips = parseFloat(localStorage.getItem("balance"));
    }
    let my_nm = localStorage.getItem("username") ? localStorage.getItem("username") : "";
    let rm_chips = 0
    if (this.props.cpf) {
      rm_chips = parseFloat(my_chips) + parseFloat(this.props.amount);
    } else {
      rm_chips = my_chips - this.props.amount;
    }
    this.setState({
      my_chips: my_chips,
      my_nm: my_nm,
      amount: this.props.amount,
      sel: (this.props.cpf) ? "Deposite Chips" : "Withdraw Chips",
      rm_chips: +rm_chips.toFixed(2)
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    let url_sel = (this.props.cpf) ? "/sDeposite" : "/swithdraw";
    let headers = new Headers();
    let urlencoded = new URLSearchParams();
    urlencoded.append("admin_password", this.state.pwd);
    urlencoded.append("remark", this.state.remark);
    urlencoded.append("uid", this.props.uid);
    urlencoded.append("deposite_bal", this.state.amount);
    if (this.state.locked) {
      urlencoded.append("lock", this.state.locked);
    }
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };
    this.setState({
      loading: true,
    });
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    fetch(import.meta.env.VITE_API_HOST + url_sel, requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.success) {
          this.props.closePopUp(1, result.message);
        } else {
          this.alerMessage(0, result.message);
        }
        this.setState({
          loading: false,
        });
      })
      .catch((error) => {
        if (error) {
          this.setState({
            loading: false,
          });
        }
      });
  }

  alerMessage = (cls, msg) => {
    this.setState({
      alertclass: cls,
      message: msg
    }, () => {
      setTimeout(() => {
        this.setState({
          alertclass: "",
          message: ""
        })
      }, 3000)
    })
  }

  changeBal = (e) => {
    let rm_chips = 0
    if (this.props.cpf) {
      rm_chips = parseFloat(this.state.my_chips) + parseFloat(e.target.value);
    } else {
      rm_chips = this.state.my_chips - e.target.value;
    }
    this.setState({
      amount: e.target.value,
      rm_chips: +rm_chips.toFixed(2)
    })
  }

  render() {
    const sweetLoad = {
      left: '10%',
      bottom: '5%',
    };
    return (
      <>
        <form autoComplete={"off"} className="bg-primary-200 dark:bg-secondary-700 opacity-95 inline-block p-2 my-1 overflow-hidden text-left align-middle transition-all transform w-full" onSubmit={event => this.handleSubmit(event)}>
          <div className="grid grid-cols-2 gap-1 text-blue-900 dark:text-blue-300  px-1 py-1">
            <div>
              <label >Available Chips [{this.state.my_nm}]</label>
              <input type="text" readOnly={true} value={this.state.my_chips} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" />
            </div>
            <div>
              <label>[{this.props.username}]</label>
              <input type="text" value={this.props.user_chips} readOnly={true} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" />
            </div>
            <div>
              <label>Remaining Chips</label>
              <input type="text" value={this.state.rm_chips} readOnly={true} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" />
            </div>
            <div>
              <label>{this.state.sel}</label>
              <input step="0.01" type="number" value={this.state.amount} min="0" max={this.props.amount} onInput={(e) => {
                this.changeBal(e);
              }} className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" required />
            </div>
            <div>
              <label>Remark</label>
              <input onInput={e => this.setState({ remark: e.target.value })} type="text" minLength="2" maxLength="70" className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" required />
            </div>
            <div>
              <label>Admin Password:</label>
              <input autoComplete={"off"} onInput={e => this.setState({ pwd: e.target.value })} type="password" className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent w-full py-2 px-4 text-primary-800 dark:text-white mb-2 bg-white dark:bg-primary-700" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="col-span-6">
              <button disabled={this.state.loading} type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-full focus:outline-none">Update</button>
            </div>
            <div className="col-span-6 float-right">
              <Switch
                checked={this.state.locked}
                onChange={() => {
                  this.setState({
                    locked: !this.state.locked
                  })
                }}
                className={`${this.state.locked ? 'bg-red-500' : 'bg-green-600'
                  } relative inline-flex items-center h-6 rounded-full w-11 m-2`}
              >
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className={`${this.state.locked ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full`}
                />
              </Switch>
              <span className="relative inline-flex items-center h-6  m-2 font-semibold text-black dark:text-white">Lock User</span>
            </div>
            <div className="col-span-12">
              {
                this.state.loading &&
                <div style={sweetLoad} className="sweet-loading">
                  <Loader
                    size={30}
                    color="#28a745"
                    loading={this.state.loading}
                  />
                </div>
              }
              {this.state.message && <p className={`text-center text-red-600 dark:text-pink-300 ${this.state.alertclass}`} >{this.state.message}</p>}
            </div>

          </div>
        </form>
      </>
    )
  };
};

export default SettlementModal;
