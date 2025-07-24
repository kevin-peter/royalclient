import React from "react";
import Loader from "../../../../utilities/loader/loader";

class DailyGeneral extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      mindate: "",
      fromdate: "",
      todate: "",
      ac_data: [],
    };
  }
  componentDidMount() {
    this.setState({
      mindate: this.setDate(
        new Date(new Date().setDate(new Date().getDate() - 90))
      ),
      fromdate: this.setDate(
        new Date(new Date().setDate(new Date().getDate() - 1))
      ),
      todate: this.setDate(new Date())
    }, () => {
      this.getAcGen();
    });

  }
  setDate(dtToday) {
    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10) month = "0" + month.toString();
    if (day < 10) day = "0" + day.toString();
    return year + "-" + month + "-" + day;
  }
  getAcGen = (e = false) => {
    if (e) {
      e.preventDefault();
    }
    this.setState({ loading: true })
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    if (this.props.market_id) {
      urlencoded.append("market_id", this.props.market_id);
    }
    if (this.props.uid) {
      urlencoded.append("uid", this.props.uid);
    }
    urlencoded.append("fromDate", this.state.fromdate);
    urlencoded.append("toDate", this.state.todate);
    urlencoded.append("limit", 500);
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };
    fetch(import.meta.env.VITE_API_HOST + "/getacdetail", requestOptions)
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
        }
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
          lname: (pl < 0) ? "Up Line" : "",
          loss: (pl < 0) ? pl.toFixed(2) : "",
          pname: (pl > 0) ? "Up Line" : "",
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
        lname: (sum > 0) ? "SRI A/c" : "",
        loss: (sum > 0) ? ((-1) * sum).toFixed(2) : "",
        pname: (sum < 0) ? "SRI A/c" : "",
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
    return (
      <React.Fragment>
        <div className="row">
          <form className="col-md-12 p-0" onSubmit={this.getAcGen}>
            <div className="col-6 col-md-2 float-left p-1">
              <label htmlFor="First name">From Date</label>
              <input
                type="date"
                min={this.state.mindate}
                className="form-control"
                value={this.state.fromdate}
                placeholder="From"
                onChange={(e) => {
                  this.setState({
                    fromdate: e.target.value,
                  });
                }}
              />
            </div>
            <div className="col-6 col-md-2 float-left p-1">
              <label htmlFor="inputLastname">To Date</label>
              <input
                type="date"
                min={this.state.mindate}
                className="form-control"
                value={this.state.todate}
                placeholder="to"
                onChange={(e) => {
                  this.setState({
                    todate: e.target.value,
                  });
                }}
              />
            </div>

            <div className="col-12 col-md-1 float-left p-1  text-md-left text-center">
              <label className="d-none d-md-block invisible col-12" htmlFor="Button">submit</label>
              <button
                type="submit"
                className="col-4 col-md-7 mt-1 btn btn-sm btn-theme shadow"
                disabled={this.state.s_disabled}
              >
                Submit
              </button>

            </div>
          </form>
        </div>

        <div className="row">
          <div className="table-responsive">
            {this.state.loading && <Loader />}
            <table className="table table-bordered mt-0 table-striped table-sm report-table">
              <thead>
                <tr>
                  <th colSpan="4" className='text-center'>-: DAILY COLLECTION FROM  {this.state.fromdate}  TO  {this.state.todate} :-</th>
                </tr>
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
      </React.Fragment>
    )
  };
};

export default DailyGeneral;
