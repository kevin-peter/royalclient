import React, { Component } from "react";

export default class ChipsSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      event_obj: [],
      isLoggenin: true,
      mindate: "",
      fromdate: "12-12-2020",
      todate: "12-12-3000",
      ac_type: "balance",
      mode_type: "all",
      ac_data: [],
      s_disabled: false,
      betlist: [],
      book_marketid: "",
      page: 1,
      limit: 50,
      more_disable: false,
      title: "",
    };
  }
  setDate(dtToday) {
    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10) month = "0" + month.toString();
    if (day < 10) day = "0" + day.toString();
    return year + "-" + month + "-" + day;
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
    let arr = [];
    let last_el = "";

    if (str) {
      arr = str.split("/");
      last_el = arr.length > 1 ? arr[arr.length - 1] : arr[0];
      arr.pop();
    }

    if (first) {
      if (arr.length > 1) {
        return arr.join("/") + "/";
      } else {
        return arr[0];
      }
    } else {
      return last_el;
    }
  }
  componentDidMount() {
    this.handleSubmit();
  }
  handleSubmit = (event) => {
    this.setState({
      s_disabled: true,
    });
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("mode", this.state.mode_type);
    urlencoded.append("type", this.state.ac_type);
    urlencoded.append("fromDate", this.state.fromdate);
    urlencoded.append("toDate", this.state.todate);
    urlencoded.append("page", 1);
    urlencoded.append("limit", this.state.limit);
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
        if (result && result.data) {
          this.setState({
            ac_data: result.data,
            s_disabled: false,
            more_disable: false,
          });
        }
      })
      .catch((error) => {
        if (error) {
          this.setState({
            s_disabled: false,
            more_disable: false,
          });
        }
      });
  };
  loadMore = () => {
    this.setState({
      more_disable: true,
    });
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("mode", this.state.mode_type);
    urlencoded.append("type", this.state.ac_type);
    urlencoded.append("fromDate", this.state.fromdate);
    urlencoded.append("toDate", this.state.todate);
    urlencoded.append("page", this.state.page + 1);
    urlencoded.append("limit", this.state.limit);
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
        if (result && result.data) {
          this.setState({
            ac_data: [...this.state.ac_data, ...result.data],
            s_disabled: false,
            more_disable: false,
            page: this.state.page + 1,
          });
        }
      });
  };
  render() {
    let ac_data = [];
    if (this.state.ac_data.length > 0) {
      ac_data = this.state.ac_data.map((v, k) => (
        <tr key={k}>
          <td className="text-center">{this.dateReport(v.created_at)}</td>
          <td className="text-center">{k + 1}</td>
          <td className="text-right text-success">
            {v.type === "CR" ? v.amount : ""}
          </td>
          <td className="text-right text-danger">
            {v.type === "DR" ? v.amount : ""}
          </td>
          <td className="text-right">{v.new_bal}</td>
          <td className="text-left">
            {this.parseLastTxt(v.remark, true)}
            <span className="text-winner">
              {this.parseLastTxt(v.remark, false)}
            </span>
          </td>
        </tr>
      ));
    }
    return (
      <React.Fragment>
        <h5 className="mb-0 p-2 text-center">-: CHIPS SUMMARY :-</h5>
        <div className="row"><div className="table-responsive">
          <table className="table table-bordered mt-0 table-striped table-sm report-table">
            <thead>
              <tr>
                <th width="8%" className="text-center">Date</th>
                <th width="3%" className="text-center">Sr.</th>
                <th width="10%" className="text-left">Credit</th>
                <th width="10%" className="text-left">Debit</th>
                <th width="10%" className="text-left">Amount</th>
                <th className="text-left">Remark</th>
              </tr>
            </thead>
            <tbody>{ac_data.length > 0 && ac_data}</tbody>
          </table>
        </div>
        </div>

        <div className="p-1 d-flex justify-content-center">
          {ac_data.length > (this.state.limit - 1) && (
            <button
              disabled={this.state.more_disable}
              onClick={() => this.loadMore()}
              title="Dil Mange More"
              className="col-4 col-md-1 btn btn-sm btn-theme shadow"
            >
              Load More
            </button>
          )}
        </div>
      </React.Fragment>
    );
  }
}
