import React, { Component } from "react";
import Book from "./../../Main/Event/Book";
import Loader from "../../../../utilities/loader/loader";
import { GrDocumentPdf } from "react-icons/gr";
import StoreContext from './../../../../store';

const GenModal = React.lazy(() => import("./ProfitLoss/GenModal"));
const PopUp = React.lazy(() => import("../../../../Helper/PopUp"));
const PdfExport = React.lazy(() => import("./PdfExport"));

export default class Report extends Component {
  static contextType = StoreContext
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      event_obj: [],
      isLoggenin: true,
      mindate: "",
      fromdate: "",
      todate: "",
      ac_type: "all",
      mode_type: "all",
      ac_data: [],
      s_disabled: false,
      openbook: false,
      betlist: [],
      book_marketid: "",
      g_modal: false,
      page: 1,
      limit: 50,
      more_disable: false,
      title: "",
      pdf: false,
      active_user: {}
    };
  }
  closeBook = () => {
    this.setState({
      openbook: false,
    });
  };
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
    let arr = str.split("/");
    let last_el = arr.length > 1 ? arr[arr.length - 1] : arr[0];
    arr.pop();
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
    const store = this.context;
    const active_user = store.getItem("active_user");
    this.setState({
      mindate: this.setDate(
        new Date(new Date().setDate(new Date().getDate() - 90))
      ),
      fromdate: this.setDate(
        new Date(new Date().setDate(new Date().getDate() - 15))
      ),
      todate: this.setDate(new Date()),
      active_user: active_user.u_id ? active_user : {}
    }, () => {
      if (this.state.active_user.u_id) {
        this.handleSubmit();
      }
    });
  }
  handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    this.setState({
      s_disabled: true,
      loading: true,
      page:1
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
    if (this.state.active_user.u_id) {
      urlencoded.append("uid", this.state.active_user.u_id);
    }
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
          s_disabled: false,
          more_disable: false,
          loading: false,
        });
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
  getBetList = (event_id, market_id, title) => {
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("event_id", event_id);
    urlencoded.append("market_id", market_id);
    urlencoded.append("limit", 500);
    if (this.state.active_user.u_id) {
      urlencoded.append("uid", this.state.active_user.u_id);
    }
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
              book_marketid: market_id,
              title: title,
            },
            () => {
              this.setState({
                openbook: true,
              });
            }
          );
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
    urlencoded.append("mode", this.state.mode_type);
    urlencoded.append("type", this.state.ac_type);
    urlencoded.append("fromDate", this.state.fromdate);
    urlencoded.append("toDate", this.state.todate);
    urlencoded.append("page", this.state.page + 1);
    urlencoded.append("limit", this.state.limit);
    if (this.state.active_user.u_id) {
      urlencoded.append("uid", this.state.active_user.u_id);
    }
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
  resetFilter = (event) => {
    event.preventDefault();
    const store = this.context;
    store.setItem("active_user", {});
    this.setState({
      ac_data: [],
      page: 1,
      active_user: {}
    }, () => {
      window.history.back();
    })
  }
  closePopUp = () => {
    this.setState({
      g_modal: false,
      event_id: "",
      mode_id: "",
      uid: "",
    });
  };
  render() {
    let ac_data = [];
    let out_cash = 0;
    let in_cash = 0;

    if (this.state.ac_data.length > 0) {
      ac_data = this.state.ac_data.map((v, k) => {
        out_cash = v.type === "CR" ? parseFloat(v.amount) + out_cash : out_cash;
        in_cash = v.type === "DR" ? parseFloat(v.amount) + in_cash : in_cash;
        return (
          <React.Fragment key={k}>
            <tr>
              <td className="text-center">{this.dateReport(v.created_at)}</td>
              <td className="text-center">{k + 1}</td>
              <td className="text-right text-success">
                {v.type === "CR" ? v.amount : ""}
              </td>
              <td className="text-right text-danger">
                {v.type === "DR" ? v.amount : ""}
              </td>
              {this.state.ac_type !== 'sri' && this.state.ac_type !== 'upline' && <td className="text-right">{v.new_bal}</td>}
              <td className="text-left">
                {this.parseLastTxt(v.remark, true)}
                <span className="text-winner">
                  {this.parseLastTxt(v.remark, false)}
                </span>
              </td>
              {this.state.ac_type !== 'sri' && this.state.ac_type !== 'upline' && <td className="text-left">
                {v.market_id !== "0" && (
                  <button
                    onClick={() => {
                      this.getBetList(
                        v.event_id,
                        v.market_id,
                        this.parseLastTxt(v.remark, false)
                      );
                    }}
                    title="Bet List"
                    className="btn btn-sm btn-theme btn-postion"
                  >
                    Bets
                  </button>

                )}
                {v.market_id !== "0" && this.props.role < 5 &&
                  (<button
                    onClick={() => {
                      this.setState({
                        g_modal: true,
                        title: "-: " + v.remark + " General Report :-",
                        event_id: v.event_id,
                        mode_id: v.mode_id,
                        book_marketid: v.market_id,
                      })
                    }}
                    title="Account General"
                    className="ml-1 btn btn-xs btn-theme"
                  >
                    Ac/G
                  </button>)}

              </td>}
            </tr>
          </React.Fragment>
        )
      });
    }
    let ac_total = [0].map((v, k) => (
      <tr key={k}>
        <td className="text-right" colSpan="2">Total</td>
        <td className="text-right text-success">{out_cash.toFixed(2)}</td>
        <td className="text-right text-danger" >{in_cash.toFixed(2)}</td>
        <td className={in_cash < out_cash ? "text-danger" : "text-success"}>{this.state.ac_type==='sri'?"Pocket":"UPLINE"} : {(in_cash - out_cash).toFixed(2)}</td>
      </tr>
    ));
    return (
      <React.Fragment>
        <div className="row">
          <form className="col-md-12 p-0" onSubmit={this.handleSubmit}>
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
            <div className="col-4 col-md-2 float-left p-1">
              <label>A/c Type</label>
              <select
                value={this.state.ac_type}
                onChange={(e) => {
                  this.setState({
                    ac_type: e.target.value,
                  }, () => {
                    this.handleSubmit()
                  });
                }}
                type="text"
                className="form-control"
              >
                <option value="all">All</option>
                <option value="balance">Chips Report</option>
                <option value="game">Game Report</option>
                <option value="sri">Pocket</option>
                <option value="upline">Upline</option>
              </select>
            </div>
            <div className="col-4 col-md-2 float-left p-1">
              <label>Market</label>
              <select
                type="text"
                value={this.state.mode_type}
                onChange={(e) => {
                  this.setState({
                    mode_type: e.target.value,
                  });
                }}
                className="form-control"
              >
                <option value="all">All</option>
                {this.props.play_mods.map((v, k) => (
                  <option key={k} value={v.id}>{v.play}</option>
                ))}
              </select>
            </div>
            <div className="col-4 col-md-2 float-left p-1">
              <label className="invisible d-block">submit</label>
              <button
                type="submit"
                className="mt-1 btn btn-sm btn-theme shadow"
                disabled={this.state.s_disabled}
              >
                Submit
              </button>
              {ac_data.length > 0 && (
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
                {
                  this.state.active_user.u_id && (
                    <tr className="text-center">
                      <th colSpan="7" className="p-1">
                        <span className="text-primary">-: Viewing Account Statement Of : {this.state.active_user.u_name} :-</span>
                        <button type="reset" title="Reset Filter" onClick={(e) => { this.resetFilter(e) }} className="btn btn-xs badge-danger float-right">X</button>
                      </th>
                    </tr>
                  )
                }
                <tr>
                  <th width="8%" className="text-center">Date</th>
                  <th width="3%" className="text-center">Sr.</th>
                  <th width="10%" className="text-right">Credit</th>
                  <th width="10%" className="text-right">Debit</th>
                  {(this.state.ac_type !== 'sri' && this.state.ac_type !== 'upline') && <th width="10%" className="text-right">Amount</th>}
                  <th className="text-left">Remark</th>
                  {(this.state.ac_type !== 'sri' && this.state.ac_type !== 'upline') && <th width="5%" className="text-left">View</th>}
                </tr>
              </thead>
              <tbody>{(this.state.ac_type === 'sri' || this.state.ac_type === 'upline') && ac_total}{ac_data.length > 0 && ac_data}</tbody>
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
        {this.state.openbook && (
          <Book
            closeBook={this.closeBook}
            betlist={this.state.betlist}
            market_id={this.state.book_marketid}
            dateFormate={this.dateReport}
            title={`Winner ` + this.state.title}
            {...this.props}
          ></Book>
        )}
        {this.state.pdf && (
          <PdfExport
            printable="pr-div"
            documentTitle="-: Report Account Statement :-"
            type="html"
          ></PdfExport>
        )}
        {
          this.state.g_modal &&
          <PopUp title={this.state.title} closePopUp={this.closePopUp}>
            <GenModal uid={this.state.active_user.u_id && this.state.active_user.u_id} event_id={this.state.event_id} mode_id={this.state.mode_id} market_id={this.state.book_marketid}></GenModal>
          </PopUp>
        }
      </React.Fragment>
    );
  }
}
