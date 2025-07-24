import React, { Component } from "react";
import Loader from "../../../../utilities/loader/loader";
import { GrDocumentPdf } from "react-icons/gr";

const PdfExport = React.lazy(() => import("./PdfExport"));

export default class MyBets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      event_obj: [],
      isLoggenin: true,
      mindate: "",
      fromdate: "",
      todate: "",
      betlist: [],
      s_disabled: false,
      page: 1,
      limit: 50,
      more_disable: false,
      pdf: false,
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
  componentDidMount() {
    this.setState({
      mindate: this.setDate(
        new Date(new Date().setDate(new Date().getDate() - 90))
      ),
      fromdate: this.setDate(
        new Date(new Date().setDate(new Date().getDate() - 15))
      ),
      todate: this.setDate(new Date()),
    });
  }
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
  getBetList = (event) => {
    event.preventDefault();
    this.setState({
      s_disabled: true,
      loading: true,
    });
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("fromDate", this.state.fromdate);
    urlencoded.append("toDate", this.state.todate);
    urlencoded.append("limit", this.state.limit);
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };
    fetch(import.meta.env.VITE_API_HOST + "/getBets", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result && result.data) {
          this.setState(
            {
              betlist: result.data,
              book_marketid:
                result.data.length > 0 ? result.data[0].market_id : "",
            },
            () => {
              this.setState({
                openbook: true,
                s_disabled: false,
                loading: false,
              });
            }
          );
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
  loadMore = () => {
    this.setState({
      more_disable: true,
      loading: true,
    });
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
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
    fetch(import.meta.env.VITE_API_HOST + "/getBets", requestOptions)
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
            betlist: [...this.state.betlist, ...result.data],
            s_disabled: false,
            more_disable: false,
            page: this.state.page + 1,
            loading: false,
          });
        }
      });
  };
  onPDFDownload = (event) => {
    this.setState({
      pdf: true
    }, () => {
      setTimeout(() => {
        this.setState({
          pdf: false
        })
      }, 500)
    })
  }
  render() {
    let BET_ARR = [...this.state.betlist];
    let BET = "";
    if (BET_ARR.length > 0) {
      BET = BET_ARR.map((v, k) => (
        <tr key={k} className={`row-betlist ${v.bet_type ? v.bet_type : ""}`}>
          <td className="text-center">{k + 1}</td>
          <td className="text-center">{this.dateFormate(v.created)}</td>
          <td className="text-center">{v.play}</td>
          <td className="text-left">{v.event_name}</td>
          <td className="text-left">{v.runner}</td>
          <td className="text-right">{v.rate}{v.table_name === 'tbl_fancy_runners' && ("/" + v.size)}</td>
          <td className="text-right">{v.stake}</td>
          <td className="text-right">
            {(v.table_name !== "tbl_line_runners" && v.table_name !== "tbl_fancy_runners") &&
              parseInt(v.stake * (v.rate - 1))}
            {(v.table_name === "tbl_line_runners" || v.table_name === "tbl_fancy_runners") && parseInt(v.stake * v.size / 100)}
          </td>
          {this.props.role < 5 && (
            <React.Fragment>
              <td className='text-right'>{v.u_name}</td>
              <td className='text-center'>{v.webref}</td>
              <td className="text-primary"><span role="button" title={v.device_info}>{v.ip_addr}</span></td>
            </React.Fragment>)}
        </tr>
      ));
    }
    return (
      <React.Fragment>
        <div className="row">
          <form className="col-md-12 p-0" onSubmit={this.getBetList}>
            <div className="col-12 col-md-15 float-left p-1">
              <label className="invisible d-none d-md-block">Submit</label>
              <div
                className="btn-group-toggle btn-group"
                role="radiogroup"
                tabIndex={-1}
              >
                <label className="btn btn-sm btn btn-theme active">
                  <input autoComplete="off" type="radio" />
                  Matched
                </label>
                <label className="btn btn-sm btn btn-theme">
                  <input autoComplete="off" type="radio" />
                  Deleted
                </label>
              </div>
            </div>
            <div className="col-4 col-md-2 float-left p-1">
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
            <div className="col-4 col-md-2 float-left p-1">
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
            <div className="col-4 col-md-2 float-left p-1">
              <label className="invisible col-12" htmlFor="Button">submit</label>
              <button
                type="submit"
                className="mt-1 btn btn-sm btn-theme shadow"
                disabled={this.state.s_disabled}
              >
                Submit
              </button>
              {BET_ARR.length > 0 && (
                <button title="Download PDF" className='ml-2 btn btn-sm btn-outline-success shadow' type="button" onClick={(e) => this.onPDFDownload(e)}><GrDocumentPdf></GrDocumentPdf></button>
              )}
            </div>
          </form>
        </div>
        <div className="row">
          {this.state.loading && <Loader />}
          <div className="table-responsive">
            <table id="pr-div" className="table table-bordered table-striped table-sm report-table">
              <thead>
                <tr>
                  <th width="3%" className="text-center">Sr.</th>
                  <th width="11%" className="text-center">Date</th>
                  <th width="7%" className="text-center">Event Type</th>
                  <th className="text-center">Event Name</th>
                  <th className="text-left">Runner</th>
                  <th width="10%" className="text-right">Rate</th>
                  <th width="10%" className="text-right">Stake</th>
                  <th width="10%" className="text-right">P & L</th>
                  {this.props.role < 5 && (
                    <React.Fragment>
                      {this.props.role < 5 && (
                        <React.Fragment>
                          <th className='text-right'>USER NAME</th>
                          <th className="text-center">Ref.</th>
                          <th>IP</th>
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  )}
                </tr>
              </thead>
              {BET_ARR.length > 0 && <tbody>{BET}</tbody>}
            </table>
          </div>

        </div>
        <div className="p-1 d-flex justify-content-center">
          {BET_ARR.length > (this.state.limit - 1) && (
            <button
              disabled={this.state.more_disable}
              onClick={() => this.loadMore()}
              title="Dil Mange More"
              className="col-12 col-md-1 btn btn-sm btn-theme shadow"
            >
              Load More
            </button>
          )}
        </div>
        {this.state.pdf && (
          <PdfExport
            printable="pr-div"
            documentTitle="-: Report Bet List :-"
            type="html"
          ></PdfExport>
        )}
      </React.Fragment>
    );
  }
}
