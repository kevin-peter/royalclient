import React, { Component } from "react";
import Loader from "../../../../utilities/loader/loader";

const PopUp = React.lazy(() => import("../../../../Helper/PopUp"));
const SettlementModal = React.lazy(() => import("./General/SettlementModal"));
const Message = React.lazy(() => import("../../../../Helper/notifyMessage"));

class AccountGeneral extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      ac_data: [],
      sw: "",
      settl: false,
      m_ttl: "",
      m_uname: "",
      user_chips: 0,
      cpf: false,
      m_uid: "",
      s_amt: 0,
      message: "",
      alertclass: ""
    };
  }
  handleSubmit = () => {
    let headers = new Headers();
    let urlencoded = new URLSearchParams();
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };

    this.setState({
      s_disabled: true,
      loading: true,
    });

    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

    fetch(import.meta.env.VITE_API_HOST + "/general", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result && result.data) {
          this.generalFilter(result.data);
          if (result.data.parent.length > 0) {
            localStorage.setItem("bal", result.data.parent[0].amount)
          }
        }
      })
      .catch((error) => {
        if (error) {
          this.setState({
            s_disabled: false,
            more_disable: false,
            loading: false,
          });
        }
      });
  };
  searchUser = (event) => {
    event.preventDefault();
    if (this.state.sw.length > 1) {
      window.find(this.state.sw)
    }
  }
  componentDidMount = () => {
    this.handleSubmit()
  }

  closePopUp = (cls = '', msg = '') => {
    this.setState({
      settl: false,
      message: msg,
      alertclass: cls
    }, () => {
      if (msg) {
        this.handleSubmit();
      }
      setTimeout(() => {
        this.setState({
          message: "",
          alertclass: ""
        })
      }, 2000)
    });
  };
  generalFilter = (data) => {
    let ac_data = [];
    let sum = 0;

    let p_ttl = 0;
    let l_ttl = 0;

    for (let i = 0; i < data.childs.length; i++) {
      let pl = parseFloat(data.childs[i].pl);
      if (pl !== 0) {
        ac_data.push({
          lname: (pl < 0) ? data.childs[i].u_name : "",
          loss: (pl < 0) ? pl.toFixed(2) : "",
          pname: (pl > 0) ? data.childs[i].u_name : "",
          profit: (pl > 0) ? pl.toFixed(2) : "",
          client: true,
          amount: data.childs[i].amount,
          uid: data.childs[i].u_id,
        });
        sum += pl;
        p_ttl = (pl > 0) ? p_ttl + pl : p_ttl;
        l_ttl = (pl < 0) ? l_ttl + pl : l_ttl;
      }
    }

    for (let i = 0; i < data.parent.length; i++) {
      let pl = parseFloat(data.parent[i].pl);
      if (pl !== 0) {
        ac_data.push({
          lname: (pl < 0) ? "SRI A/c" : "",
          loss: (pl < 0) ? pl.toFixed(2) : "",
          pname: (pl > 0) ? "SRI A/c" : "",
          profit: (pl > 0) ? pl.toFixed(2) : "",
          client: false,
        });
        p_ttl = (pl > 0) ? p_ttl + pl : p_ttl;
        l_ttl = (pl < 0) ? l_ttl + pl : l_ttl;
        sum += pl;
      }
    }

    ac_data.push(
      {
        lname: (sum > 0) ? "Up Line" : "",
        loss: (sum > 0) ? ((-1) * sum).toFixed(2) : "",
        pname: (sum < 0) ? "Up Line" : "",
        profit: (sum < 0) ? (sum * (-1)).toFixed(2) : "",
        client: false
      },
      {
        lname: "-: TOTAL : -",
        loss: (sum > 0) ? (l_ttl + (sum * (-1))).toFixed(2) : l_ttl.toFixed(2),
        pname: "-: TOTAL : -",
        profit: (sum < 0) ? (p_ttl + (sum * (-1))).toFixed(2) : p_ttl.toFixed(2),
        client: false
      }
    );

    this.setState({
      loading: false,
      ac_data: ac_data
    })

  }


  render() {
    let ac_data = [];
    if (this.state.ac_data.length > 0) {
      ac_data = this.state.ac_data.map((v, k) => (
        <tr key={k}>
          <td
            className={`${(k + 1) === this.state.ac_data.length
              ? 'text-center' : 'text-right'
              }`}>
            {v.lname && v.client &&
              <button
                onClick={(e) => this.setState({
                  settl: true,
                  m_ttl: "Deposite Chips To Sri/Ac",
                  m_uname: v.lname,
                  user_chips: v.amount,
                  s_amt: parseFloat(v.loss * (-1)),
                  cpf: true,
                  m_uid: v.uid
                })}
                className="btn btn-xs btn-info float-left shadow">
                SETTL
                </button>
            }
            {v.lname}</td>
          <td className="text-right text-danger">{v.loss}</td>
          <td
            className={
              `${k + 1 === this.state.ac_data.length
                ? 'text-center' : 'text-right'
              }`}>
            {v.pname && v.client &&
              <button
                onClick={(e) => this.setState({
                  settl: true,
                  m_ttl: "Withdraw Chips From Sri/Ac",
                  m_uname: v.pname,
                  user_chips: v.amount,
                  s_amt: parseFloat(v.profit),
                  cpf: false,
                  m_uid: v.uid
                })}
                className="btn btn-xs btn-info float-left shadow">
                SETTL
                </button>
            }
            {v.pname}
          </td>
          <td className="text-right text-success">{v.profit}</td>
        </tr>
      ));
    }
    return (
      <React.Fragment>
        <div className="row">
          <form className="col-md-12 p-0" onSubmit={event => this.searchUser(event)}>
            <div className="col-5 col-md-2 float-left p-1">
              <input type="search" value={this.state.sw} onInput={event =>
                this.setState({
                  sw: event.target.value
                })
              } placeholder="Search By User Name" className="form-control" />
            </div>

            <div className="d-none d-md-block float-left p-1">
              <button type="submit" className="form-control btn btn-sm btn-success">Enter</button>
            </div>
            <div className="col-7 col-md-7 float-left p-1">
              <h5 className="mb-0 p-1 text-center">-: GENERAL REPORT :-</h5>
            </div>
          </form>
        </div>
        <div className="row">
          {this.state.loading && <Loader />}
          <div className="table-responsive">
            <table className="table table-bordered mt-0 table-striped table-sm report-table">
              <thead>
                <tr>
                  <th className="text-right">Name</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Name</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>{ac_data.length > 0 && ac_data}</tbody>
            </table>
          </div>
        </div>
        {
          this.state.settl &&
          <PopUp title={this.state.m_ttl} closePopUp={this.closePopUp}>
            <SettlementModal
              username={this.state.m_uname}
              user_chips={this.state.user_chips}
              amount={this.state.s_amt}
              cpf={this.state.cpf}
              uid={this.state.m_uid}
              closePopUp={this.closePopUp}
            />
          </PopUp>
        }
        { this.state.message && <React.Suspense fallback={""}><Message alertclass={this.state.alertclass} message={this.state.message} /></React.Suspense>}
      </React.Fragment>
    );
  }
}

export default AccountGeneral;