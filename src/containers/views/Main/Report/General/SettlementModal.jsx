import React from "react";
import BounceLoader from "react-spinners/BounceLoader";

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
      lock: false
    };
  }

  componentDidMount() {
    let my_chips = 0;
    if (localStorage.getItem("bal")) {
      my_chips = parseFloat(localStorage.getItem("bal"));
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
    if (this.state.lock) {
      urlencoded.append("lock", this.state.lock);
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
          this.props.closePopUp("alert-success", result.message);
        } else {
          this.alerMessage("alert-danger", result.message);
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
      <div className="col-12">
        <form className="mt-2" onSubmit={event => this.handleSubmit(event)}>
          <div className="form-row">
            <div className="form-group col-6">
              <label >Available Chips [{this.state.my_nm}]</label>
              <input type="text" readOnly={true} value={this.state.my_chips} className="form-control" />
            </div>
            <div className="form-group col-6">
              <label>[{this.props.username}]</label>
              <input type="text" value={this.props.user_chips} readOnly={true} className="form-control" />
            </div>
            <div className="form-group col-6">
              <label>Remaining Chips</label>
              <input type="text" value={this.state.rm_chips} readOnly={true} className="form-control" />
            </div>
            <div className="form-group col-6">
              <label>{this.state.sel}</label>
              <input step="0.01" type="number" value={this.state.amount} min="0" max={this.props.amount} onInput={(e) => {
                this.changeBal(e);
              }} className="form-control" required />
            </div>
            <div className="form-group col-6">
              <label>Remark</label>
              <input onInput={e => this.setState({ remark: e.target.value })} type="text" minLength="2" maxLength="70" className="form-control" required />
            </div>
            <div className="form-group col-6">
              <label>Admin Password:</label>
              <input onInput={e => this.setState({ pwd: e.target.value })} type="password" className="form-control" required />
            </div>
            <div className="form-group col-12">
              {
                this.state.loading &&
                <div style={sweetLoad} className="sweet-loading">
                  <BounceLoader
                    size={30}
                    color="#28a745"
                    loading={this.state.loading}
                  />
                </div>
              }
              <button disabled={this.state.loading} type="submit" className="btn btn-theme">Update</button>
              {(<div className="custom-control custom-switch float-right">
                <input checked={this.state.lock} type="checkbox" className="custom-control-input" id="lk"
                  onChange={(event) => {
                    this.setState({
                      lock: !this.state.lock
                    }, () => {

                    })
                  }} />
                <label className={`custom-control-label font-weight-bold ` +(this.state.lock?
                "bg-red":"bg-green")} htmlFor="lk">Lock User</label>
              </div>)
              }
            </div>
            <div className="form-group col-12">
              {this.state.message && <p className={`alert ${this.state.alertclass}`} >{this.state.message}</p>}
            </div>
          </div>
        </form>
      </div>
    )
  };
};

export default SettlementModal;
