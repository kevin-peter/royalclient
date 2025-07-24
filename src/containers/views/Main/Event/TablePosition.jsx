import React from "react";
import { IoMdArrowBack } from "react-icons/io";

class TablePosition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      th: ["User Name"],
      dyn_data: [],
      market_id: "",
      p_id: "",
      user_ids: [],
      bet_list: [],
      user_name: "",
      bets: ""
    };
  }

  componentDidMount() {
    this.setState({
      market_id: this.props.market_id
    }, () => {
      this.getRunnerTable()
    })
  }

  componentDidUpdate(prevProps) {
    if (this.props.bets !== prevProps.bets) {
      this.getLiveTable()
    }
  }

  generateHeader() {
    let res = [];
    if (this.state.th.length > 1)
      for (let i = 0; i < this.state.th.length; i++) {
        res.push(<th className="text-center" key={i}>{this.state.th[i]}</th>)
      }
    return res;
  }

  /* change this function in future */
  generateTable = () => {
    let data = this.state.dyn_data;
    let user_nm = '';
    let rows = [];
    let cols = [];
    let total = {};
    if (data.length > 0) {
      rows = [];
      for (let k = 0; k < data.length; k++) {
        cols = [];
        for (let key in data[k]) {
          if (user_nm !== data[k][key].user_nm) {
            cols.push(<td role="button" data-market_id={this.props.market_id} key={key} data-id={data[k][key].p_id}
              className={
                (data[k][key].user_nm === this.state.user_name ? "active" : "text-center")
              }
              onClick={() => {
                this.setState({
                  p_id: data[k][key].p_id
                }, () => {
                  if (data[k][key].u_role < 5) {
                    this.getRunnerTable(false, data[k][key].user_nm);
                  } else {
                    this.getBetList(data[k][key].user_nm);
                  }
                })
              }
              }
            ><span title={data[k][key].user_nm} className={`p-1 badge ${parseInt(data[k][key].u_role) < 5 ? "badge-success" : "badge-secondary"}`}>{data[k][key].user_nm}{data[k][key].u_role === 2 && "[A]"}{data[k][key].u_role === 3 && "[SM]"}{data[k][key].u_role === 4 && "[M]"}{data[k][key].u_role === 5 && "[C]"}</span></td>)
          }
          user_nm = data[k][key].user_nm;
          if (key in total) {
            total[key] += parseInt(data[k][key].exp);
          } else {
            total[key] = parseInt(data[k][key].exp);
          }
          cols.push(<td key={key + 1} className={`text-right ${parseInt(data[k][key].exp) < 0 ? "text-danger" : "text-success"}`}>{parseInt(data[k][key].exp)}</td>);
        }
        rows.push(<tr key={k}>{cols}</tr>);
      }

      let our_col = [];
      let upline_col = [];

      our_col.push(<td key={798} className='text-right'>Our : </td>);
      if (this.state.user_ids.length === 1) {
        upline_col.push(<td key={888} className='text-right text-danger'><span className='badge badge-secondary'></span>UpLine</td>);
      }

      let old_exp = 0;
      for (let key in total) {
        for (let i = 0; i < this.props.runners.length; i++) {
          if (key === this.props.runners[i].rid) {
            old_exp = this.props.runners[i].exp ? this.props.runners[i].exp : 0;
            our_col.push(<td key={1899 + i} className={`text-right ${old_exp < 0 ? "text-danger" : "text-success"}`}>{old_exp}</td>);
            if (this.state.user_ids.length === 1) {
              upline_col.push(<td key={1900 + i} className={`text-right ${old_exp - total[key] < 0 ? "text-danger" : "text-success"}`}>
                {old_exp - total[key]}
              </td>);
            }
          }
        }
      }
      if (this.state.user_ids.length === 1) {
        rows.push(<tr key={2000}>{upline_col}</tr>)
      }
    }
    return rows;
  }

  mapRunnerName(rid, data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].rid === rid) {
        return data[i].n;
      }
    }
  }

  getRunnerTable = (back = false, user_name = "") => {
    let p_id = this.state.p_id;
    let urlencoded = new URLSearchParams();
    urlencoded.append("market_id", this.state.market_id);
    let user_ids = [...this.state.user_ids];
    if (!back) {
      urlencoded.append("user_id", p_id);
      user_ids.push(p_id)
    } else {
      user_ids.pop();
      if (user_ids.length > 0) {
        urlencoded.append("user_id", user_ids[user_ids.length - 1]);
      }
    }

    fetch(import.meta.env.VITE_API_HOST + "/getRunnerTable", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      method: "POST",
      body: urlencoded
    }).then((response) => {
      if (response.status === 401) {
        this.socket.disconnect();
        window.location.href = process.env.PUBLIC_URL + "/login";
      } else {
        return response.json();
      }
    })
      .then((result) => {
        if (result && result.data.length > 0) {
          let th = ["User Name"];
          for (var key in result.data[0]) {
            let rn = this.mapRunnerName(key, this.props.runners)
            th.push(rn)
          }
          this.setState({
            th: th,
            dyn_data: result.data,
            user_ids: user_ids,
            user_name: user_name,
            bet_list: []
          })
        }
      })
  }

  getLiveTable = () => {
    let p_id = this.state.p_id;
    let urlencoded = new URLSearchParams();
    urlencoded.append("market_id", this.state.market_id);
    let user_ids = [...this.state.user_ids];
    urlencoded.append("user_id", p_id);
    user_ids.push(p_id);
    fetch(import.meta.env.VITE_API_HOST + "/getRunnerTable", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      method: "POST",
      body: urlencoded
    }).then((response) => {
      if (response.status === 401) {
        this.socket.disconnect();
        window.location.href = process.env.PUBLIC_URL + "/login";
      } else {
        return response.json();
      }
    })
      .then((result) => {
        if (result && result.data.length > 0) {
          this.setState({
            dyn_data: result.data
          })
        }
      })
  }

  getBetList = (username) => {

    let urlencoded = new URLSearchParams();
    urlencoded.append("market_id", this.state.market_id);
    urlencoded.append("username", username);
    urlencoded.append("limit", 5000);

    fetch(import.meta.env.VITE_API_HOST + "/getAllBets", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: urlencoded,
      method: "POST",
    })
      .then((response) => {
        if (response.status === 401) {
          this.socket.disconnect();
          this.setState(
            {
              isLoggenin: false,
              eventdata: {},
              runners: [],
            },
            () => {
              window.location.href = process.env.PUBLIC_URL + "/login";
            }
          );
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result && result.success) {

          let matched =
            result.data && result.data.matched ? result.data.matched : [];
          this.setState(
            {
              bet_list: matched,
              user_name: username
            }
          );
        }
      })
  };
  dateFormate = (date) => {
    let arr = date.split("-");
    let new_date = arr.join("/");
    new_date = new_date + "+00:00";
    let d = new Date(new_date);
    return d.toLocaleTimeString("en-IN", {
      month: "numeric",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  render() {
    return (
      <div className="row">
        <div className="col-12">
          <div className="float-left p-0">
            {this.state.user_ids.length > 1 && <React.Fragment><button title="go Back" className="btn btn-sm btn-theme shadow" onClick={e => { e.preventDefault(); this.getRunnerTable(true) }} ><IoMdArrowBack></IoMdArrowBack>
            </button><strong className="ml-2">{this.state.user_name}</strong></React.Fragment>}
          </div>
        </div>
        <div className="col-12">
          <div className="table-reponsive">
            <table className="table table-sm table-bordered">
              <thead>
                <tr>{this.state.dyn_data.length > 0 && this.generateHeader()}</tr>
              </thead>
              {this.state.dyn_data.length > 0 &&
                <tbody>
                  {this.state.dyn_data.length > 0 && this.generateTable()}
                </tbody>
              }
            </table>
          </div>
        </div>
        {this.state.user_ids.length > 0 && this.state.bet_list.length > 0 &&
          <div className="col-12">
            <div className="table-reponsive">
              <table className="table table-sm table-bordered">
                <thead>
                  <tr className="row-header-betlist shadow-sm">
                    <th>Runner</th>
                    <th className="text-right">Rate</th>
                    <th className="text-right">Stake</th>
                    <th className="text-right">P/L</th>
                    {this.props.role < 5 && (
                      <React.Fragment>
                        <th className='text-right'>USER NAME</th>
                        <th className="text-center">Ref.</th>
                        <th className="text-center">IP</th>
                      </React.Fragment>
                    )}
                    <th className="text-center">Time</th>
                  </tr>
                </thead>
                {
                  this.state.bet_list && this.state.bet_list.length > 0 &&
                  <tbody>
                    {
                      this.state.bet_list.map((v, k) => (
                        <tr
                          key={k}
                          className={`row-betlist ${v.bet_type ? v.bet_type : ""
                            }`}
                        >
                          <td>{v.runner}</td>
                          <td className="text-right">{v.rate}{v.table_name === 'tbl_fancy_runners' && ("/" + v.size)}</td>
                          <td className="text-right">{v.stake}</td>
                          <td className="text-right">
                            {(v.table_name !== "tbl_line_runners" && v.table_name !== "tbl_fancy_runners" && v.table_name !== "tbl_odds_runners") &&
                              (v.stake * (v.rate - 1)).toFixed(0)}
                            {(v.table_name === "tbl_line_runners" || v.table_name === "tbl_fancy_runners") && (v.stake * v.size / 100).toFixed(0)}

                            {(v.table_name === "tbl_odds_runners") &&
                              (v.stake * v.rate / 100).toFixed(0)}
                          </td>
                          {this.props.role < 5 && (
                            <React.Fragment>
                              <td className='text-right'>{v.u_name}</td>
                              <td className='text-center'>{v.webref}</td>
                              <td className="text-center text-primary"><span role="button" title={v.device_info}>{v.ip_addr}</span></td>
                            </React.Fragment>)}
                          <td className="text-center">
                            {this.dateFormate(v.created)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                }
              </table>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default TablePosition;
