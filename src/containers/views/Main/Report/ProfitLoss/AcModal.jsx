import React from "react";

class AcModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      ac_data: [],
      bet_list: [],
      market_id: ""
    };
  }
  componentDidMount() {
    this.getStatements()
  }
  getStatements = () => {
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("event_id", this.props.event_id);
    urlencoded.append("fromDate", this.props.fromdate);
    urlencoded.append("toDate", this.props.todate);
    urlencoded.append("mode", this.props.mode);
    urlencoded.append("type", "game");
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };
    fetch(import.meta.env.VITE_API_HOST + "/getStatements", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        let ac_data = [];
        if (result.success && result.data) {
          ac_data = result.data
        }
        this.setState({
          ac_data: ac_data,
        });
      })
      .catch((error) => {
        console.log(error)
      });
  }
  dateReport = (date) => {
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
  parseLastTxt(str, first) {
    let arr = str.split("/");
    let last_el = arr.length > 1 ? arr[arr.length - 1] : arr[0];
    arr.pop();
    if (first) {
      if (arr.length > 1) {
        return arr[1] + "/";
      } else {
        return arr[0];
      }
    } else {
      return last_el;
    }
  }

  getBetList = (mid) => {
    let urlencoded = new URLSearchParams();
    urlencoded.append("market_id", mid);
    urlencoded.append("limit", 5000);
    fetch(import.meta.env.VITE_API_HOST + "/getBets", {
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
            result.data ? result.data : [];
          this.setState(
            {
              bet_list: matched
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
    let ac_data = [];
    if (this.state.ac_data.length > 0) {
      ac_data = this.state.ac_data.map((v, k) => (
        <tr key={k}>
          <td
            className={`${(k + 1) === this.state.ac_data.length
              ? 'text-center' : 'text-right'
              }`}>{v.lname}</td>
          <td className="text-right text-danger">{v.loss}</td>
          <td
            className={
              `${k + 1 === this.state.ac_data.length
                ? 'text-center' : 'text-right'
              }`}>{v.pname}
          </td>
          <td className="text-right text-success">{v.profit}</td>
        </tr>
      ));
    }

    let out_cash = 0;
    let in_cash = 0;
    let ttl_upline = 0;

    if (this.state.ac_data.length > 0) {
      ac_data = this.state.ac_data.map((v, k) => {
        out_cash = v.type === "CR" ? parseFloat(v.amount) + out_cash : out_cash;
        in_cash = v.type === "DR" ? parseFloat(v.amount) + in_cash : in_cash;
        ttl_upline += v.up_line * (-1);
        return (
          <React.Fragment key={k}>
            <tr>
              <td onClick={() => {
                this.setState({
                  market_id: v.market_id
                }, () => {
                  this.getBetList(v.market_id);
                })
              }} className={`${v.market_id === this.state.market_id ? "text-left text-primary" : "text-center"}`} role="button" style={{ 'textDecoration': 'underline' }}>
                {this.parseLastTxt(v.remark, true)}
                <span className="text-winner">
                  {this.parseLastTxt(v.remark, false)}
                </span>
              </td>
              <td className={`text-right ${v.type === "DR" ? "text-danger" : "text-success"}`}>
                {v.type === "DR" ? v.amount * (-1) : v.amount}
              </td>
              {this.props.role < 5 &&
                <td className={`text-right ${v.up_line < 0 ? "text-success" : "text-danger"}`}>{v.up_line * (-1)}</td>}
            </tr>
          </React.Fragment>
        )
      });
    }
    let ttl = out_cash - in_cash;
    let ac_total = [0].map((v, k) => (
      <tr key={k}>
        <td className="text-right">Total</td>
        <td className={`text-right ${(out_cash - in_cash) < 0 ? "text-danger" : "text-success"}`}>{ttl.toFixed(2)}</td>
        {this.props.role < 5 && <td className={`text-right ${ttl_upline < 0 ? "text-danger" : "text-success"}`}>{ttl_upline.toFixed(2)}</td>}
      </tr>
    ));
    return (
      <React.Fragment>
        <div className="table-responsive">
          <table className="table table-bordered table-striped table-sm">
            <thead>
              {
                this.props.active_user.u_id && (
                  <tr className="text-center">
                    <th colSpan="7" className="p-1">
                      <span className="text-primary">-: Viewing Account Statement Of : {this.state.active_user.u_name} :-</span>
                      <button type="reset" title="Reset Filter" onClick={(e) => { this.resetFilter(e) }} className="btn btn-xs badge-danger float-right">X</button>
                    </th>
                  </tr>
                )
              }
              <tr>
                <th className='text-center'>Market Name</th>
                <th className='text-right'>P/L</th>
                {this.props.role < 5 && <th className='text-right'>Upline</th>}
              </tr>
            </thead>
            <tbody>{ac_data.length > 0 && ac_data}{ac_total}</tbody>
          </table>
        </div>
        {this.state.bet_list.length > 0 &&
          <div className="table-responsive">
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
        }
      </React.Fragment>
    )
  };
};

export default AcModal;
