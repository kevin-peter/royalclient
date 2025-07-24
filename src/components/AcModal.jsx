import React from "react";
import { dateReport } from '../../Utils'

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
    window.addEventListener('popstate', this.handlePopstate);
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopstate);
  }
  getStatements = () => {
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("event_id", this.props.event_id);
    urlencoded.append("fromdate", this.props.fromdate);
    urlencoded.append("todate", this.props.todate);
    if (this.props.active_user.id) {
      urlencoded.append("uid", this.props.active_user.id);
    }
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };
    fetch(import.meta.env.VITE_API_HOST + "/report/getstatement", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = import.meta.env.PUBLIC_URL + "/login";
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
    if (this.props.active_user.id) {
      urlencoded.append("uid", this.props.active_user.id);
    }
    fetch(import.meta.env.VITE_API_HOST + "/event/resulttrade", {
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
              window.location.href = import.meta.env.PUBLIC_URL + "/login";
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
  handlePopstate = () => {
    if(this.props.modelClose){
      this.props.modelClose(true);
    }
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
          <td className="text-right text-red-600 dark:text-pink-300">{v.loss}</td>
          <td
            className={
              `${k + 1 === this.state.ac_data.length
                ? 'text-center' : 'text-right'
              }`}>{v.pname}
          </td>
          <td className="text-right text-green-700 dark:text-green-300">{v.profit}</td>
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
            <tr key={k} className={`${k % 2 === 0 ? "bg-white dark:bg-secondary-900" : "bg-secondary-100 dark:bg-secondary-700"}`}>
              <td onClick={() => {
                this.setState({
                  market_id: v.market_id
                }, () => {
                  this.getBetList(v.market_id);
                })
              }} className={`px-1 py-0.5  ${v.market_id === this.state.market_id ? "text-left text-primary" : "text-center"}`} role="button" style={{ 'textDecoration': 'underline' }}>
                {v.remark}
               
              </td>
              <td className={`px-1 py-0.5 text-right ${v.type === "DR" ? "text-red-600 dark:text-pink-300" : "text-green-700 dark:text-green-300"}`}>
                {v.type === "DR" ? v.amount * (-1) : v.amount}
              </td>
              {this.props.role < 5 &&
                <td className={`px-1 py-0.5 text-right ${v.up_line < 0 ? "text-green-700 dark:text-green-300" : "text-red-600 dark:text-pink-300"}`}>{v.up_line * (-1)}</td>}
            </tr>
          </React.Fragment>
        )
      });
    }
    let ttl = out_cash + in_cash;
    let ac_total = [0].map((v, k) => (
      <tr key={k}>
        <td className="text-right px-1 py-0.5">Total</td>
        <td className={`text-right px-1 py-0.5 ${(out_cash + in_cash) < 0 ? "text-red-600 dark:text-pink-300" : "text-green-700 dark:text-green-300"}`}>{ttl.toFixed(2)}</td>
        {this.props.role < 5 && <td className={`text-right px-1 py-0.5 ${ttl_upline < 0 ? "text-red-600 dark:text-pink-300" : "text-green-700 dark:text-green-300"}`}>{ttl_upline.toFixed(2)}</td>}
      </tr>
    ));
    return (
      <React.Fragment>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs text-black dark:text-white">
            <thead className='bg-primary-200 dark:bg-secondary-700'>
              {
                this.props.active_user.id && (
                  <tr className="text-center bg-primary-200 dark:bg-secondary-700">
                    <th colSpan="7" className="p-1">
                      <span className="text-primary">-: Viewing Account Summary Of : {this.props.active_user.p_code} :-</span>
                    </th>
                  </tr>
                )
              }
              <tr>
                <th className='text-center px-1 py-0.5'>Market Name</th>
                <th className='text-right px-1 py-0.5'>P/L</th>
                {this.props.role < 5 && <th className='text-right px-1 py-0.5s'>Upline</th>}
              </tr>
            </thead>
            <tbody>{ac_data.length > 0 && ac_data}{ac_total}</tbody>
          </table>
        </div>
        {this.state.bet_list.length > 0 &&
          <div className="w-full overflow-x-auto">
            <table className="w-full whitespace-nowrap text-xs">
              <thead className='text-black dark:text-white bg-secondary-200 dark:bg-secondary-700'>
                <tr className="row-header-betlist shadow-sm">
                  <th className="px-1 py-0.5">Runner</th>
                  <th className="text-right px-1 py-0.5">Rate</th>
                  <th className="text-right px-1 py-0.5">Stake</th>
                  <th className="text-right px-1 py-0.5">P/L</th>
                  {this.props.role < 5 && (
                    <React.Fragment>
                      <th className='text-right px-1 py-0.5'>USER NAME</th>
                      <th className="text-center">Ref.</th>
                      <th className="text-center">IP</th>
                    </React.Fragment>
                  )}
                  <th className="text-center">Time</th>
                </tr>
              </thead>
              {
                this.state.bet_list && this.state.bet_list.length > 0 &&
                <tbody className='divide-y font-light'>
                  {
                    this.state.bet_list.map((v, k) => (
                      <tr
                        key={k}
                        className={`border-b border-primary-700 ${v.bet_type === 'back' ? "bg-blue-300" : "bg-pink-300"}`}
                      >
                        <td className="px-1 py-0.5">{v.r_name}</td>
                        <td className="text-right px-1 py-0.5">{v.rate}{v.formula === 'FANCY' && ("/" + v.size)}</td>
                        <td className="text-right px-1 py-0.5">{v.stake}</td>
                        <td className="text-right px-1 py-0.5">
                          {(v.formula !== "FANCY" && v.formula !== "FANCY" && v.formula !== "BOOK_MAKER") &&
                            (v.stake * (v.rate - 1)).toFixed(0)}
                          {(v.formula === "FANCY" || v.formula === "FANCY") && (v.stake * v.size / 100).toFixed(0)}

                          {(v.formula === "BOOK_MAKER") &&
                            (v.stake * v.rate / 100).toFixed(0)}
                        </td>
                        {this.props.role < 5 && (
                          <React.Fragment>
                            <td className='text-right px-1 py-0.5'>{v.email}</td>
                            <td className='text-center px-1 py-0.5'>{v.webref}</td>
                            <td className="text-center px-1 py-0.5"><span role="button" title={v.device_info}>{v.ip_addr}</span></td>
                          </React.Fragment>)}
                        <td className="text-center">
                          {dateReport(v.updated_at)}
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
