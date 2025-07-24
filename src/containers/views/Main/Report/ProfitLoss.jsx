import React, { Component } from "react";
import Book from "./../../Main/Event/Book";
import Loader from "../../../../utilities/loader/loader";
import { GrDocumentPdf } from "react-icons/gr";
import StoreContext from './../../../../store';

const GenModal = React.lazy(() => import("./ProfitLoss/GenModal"));
const AcModal = React.lazy(() => import("./ProfitLoss/AcModal"));
const PopUp = React.lazy(() => import("../../../../Helper/PopUp"));
const PdfExport = React.lazy(() => import("./PdfExport"));


export default class ProfitLoss extends Component {
  static contextType = StoreContext
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      mindate: "",
      fromdate: "",
      todate: "",
      s_disabled: false,
      openbook: false,
      more_disable: false,
      ac_data: [],
      title: "",
      mode: "all",
      total: 0,
      d_total: 0,
      g_modal: false,
      ac_modal: false,
      mode_id: "",
      event_id: "",
      uid: "",
      page: 1,
      limit: 50,
      pdf: false,
      active_user: {}
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
  getBetList = (event_id, title) => {
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("event_id", event_id);
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
              book_marketid:
                result.data.length > 0 ? result.data[0].market_id : "",
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
      active_user: active_user.u_id ? active_user : {},
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
      page: 1
    });
    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("fromDate", this.state.fromdate);
    urlencoded.append("toDate", this.state.todate);
    urlencoded.append("mode", this.state.mode);
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
    fetch(import.meta.env.VITE_API_HOST + "/getprofit", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        let ac_data = [];
        let ttl = 0;
        let d_total = 0;
        if (result.success && result.data && result.data.data) {
          for (let i = 0; i < result.data.data.length; i++) {
            d_total += parseFloat(result.data.data[i].total);
          }
          ac_data = result.data.data;
          ttl = result.data.total ? result.data.total : 0;
        }
        this.setState({
          ac_data: ac_data,
          s_disabled: false,
          total: ttl,
          d_total: d_total,
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
  closeBook = () => {
    this.setState({
      openbook: false,
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
    urlencoded.append("mode", this.state.mode);
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
    fetch(import.meta.env.VITE_API_HOST + "/getprofit", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        let d_total = this.state.d_total;
        if (result.success && result.data && result.data.data) {
          for (let i = 0; i < result.data.data.length; i++) {
            d_total += parseFloat(result.data.data[i].total);
          }
        }
        if (result && result.data) {
          this.setState({
            ac_data: [...this.state.ac_data, ...result.data.data],
            s_disabled: false,
            more_disable: false,
            page: this.state.page + 1,
            d_total: d_total,
            loading: false,
          });
        }
      });
  };
  closePopUp = () => {
    this.setState({
      g_modal: false,
      ac_modal: false,
      event_id: "",
      mode_id: "",
      uid: "",
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
  render() {
    let ac_data = "";
    ac_data = this.state.ac_data.map((v, k) => (
      <tr key={k}>
        <td className="text-center">{k + 1}</td>
        <td className="text-left">{v.play}</td>
        <td className="text-left" style={{ 'textDecoration': 'underline' }} role="button" onClick={() => {
          this.setState({
            ac_modal: true,
            title: "-: " + v.event_name + " A/c Summary :-",
            event_id: v.event_id,
            mode_id: v.mode_id
          })
        }}>{v.event_name}</td>
        <td
          className={`text-right ${v.total < 0 ? "text-danger" : "text-success"
            }`}
        >
          {v.total}
        </td>
        <td className="text-center">{this.dateReport(v.created_at)}</td>
        <td className="text-left">
          <button
            onClick={() => {
              this.getBetList(v.event_id, v.event_name);
            }}
            title="Bet List"
            className="btn btn-xs btn-theme"
          >
            Bets
          </button>
          {this.props.role < 5 &&
            (<button
              onClick={() => {
                this.setState({
                  g_modal: true,
                  title: "-: " + v.event_name + " General Report :-",
                  event_id: v.event_id,
                  mode_id: v.mode_id
                })
              }}
              title="Account General"
              className="ml-1 btn btn-xs btn-theme"
            >
              Ac/G
            </button>)}
        </td>
      </tr>
    ));
    let ac_total = [0].map((v, k) => (
      <tr key={k}>

        <td colSpan='3' className="text-right">Net PL</td>
        <td

          className={`text-right ${this.state.total < 0 ? "text-danger" : "text-success"
            }`}
        >
          {this.state.total}
        </td>
        <td className="text-right">PL</td>
        <td className={`text-left ${this.state.d_total < 0 ? "text-danger" : "text-success"
          }`}>{this.state.d_total.toFixed(2)}</td>
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
              <label>Market</label>
              <select
                type="text"
                value={this.state.mode_type}
                onChange={(e) => {
                  this.setState({
                    mode: e.target.value,
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
            <div className="col-4 col-md-1 float-left p-1">
              <label className="invisible col-12" htmlFor="Button">submit</label>
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
                      <th colSpan="6" className="p-1">
                        <span className="text-primary">-: Viewing Profit And Loss Of : {this.state.active_user.u_name} :-</span>
                        <button type="reset" title="Reset Filter" onClick={(e) => { this.resetFilter(e) }} className="btn btn-xs badge-danger float-right">X</button>
                      </th>
                    </tr>
                  )
                }
                <tr>
                  <th width="3%" className="text-center">Sr.</th>
                  <th width="7%" className="text-center">Event Type</th>
                  <th width="50%" className="text-left">Event Name</th>
                  <th width="10%" className="text-right">Profilt Loss</th>
                  <th width="8%" className="text-center">Date</th>
                  <th className="text-left">View</th>
                </tr>
              </thead>
              <tbody>{ac_data.length > 0 && ac_total}{ac_data}</tbody>
            </table>
          </div>
        </div><div className="p-1 d-flex justify-content-center">
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
            dateFormate={this.dateReport}
            title={this.state.title}
            {...this.props}
          ></Book>
        )}
        {
          this.state.g_modal &&
          <PopUp title={this.state.title} closePopUp={this.closePopUp}>
            <GenModal uid={this.state.active_user.u_id && this.state.active_user.u_id} event_id={this.state.event_id} mode_id={this.state.mode_id}></GenModal>
          </PopUp>
        }
        {
          this.state.ac_modal &&
          <PopUp title={this.state.title} closePopUp={this.closePopUp}>
            <AcModal {...this.state} {...this.props}></AcModal>
          </PopUp>
        }
        {this.state.pdf && (
          <PdfExport
            printable="pr-div"
            documentTitle="-: Report Profit Loss :-"
            type="html"
          ></PdfExport>
        )}
      </React.Fragment>
    );
  }
}
