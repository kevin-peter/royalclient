import React from "react";
import BounceLoader from "react-spinners/BounceLoader";
class BetSlip extends React.Component {
  constructor() {
    super();
    this.state = {
      showModal: true,
      amount: "",
      stack: "",
      o_rate: "",
      mounted: false,
      slip_runners: [],
      d_pb: false,
      message: "",
      dis_spinner: true,
      alertclass: "alert-success",
      loading: false,
      m_s: {},
      cp: false
    };
  }
  handleOpenModal = () => {
    this.setState({ showModal: true });
  };
  handleCloseModal = () => {
    let runners = [...this.state.slip_runners];
    for (let i = 0; i < runners.length; i++) {
      runners[i].next_exp = "";
    }
    this.setState(
      {
        slip_runners: [],
        amount: "",
        showModal: false,
        stack: "",
        o_rate: "",
      },
      () => {
        this.props.closeBetSlip(this.state.message, this.state.alertclass);
      }
    );
  };
  placeBet = (e) => {
    e.preventDefault()
    this.setState({
      d_pb: true,
      loading: true
    });
    let rate = this.state.stack;

    if (this.state.cp) {
      if (this.props.slip_type === 'back') {
        rate = (this.state.m_s.min_odd) ? this.state.m_s.min_odd : 1.01;
      } else {
        rate = (this.state.m_s.max_odd && this.state.m_s.max_odd > this.state.stack) ? this.state.m_s.max_odd : this.state.stack;
      }
    }

    let headers = new Headers();
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();

    urlencoded.append("rate", rate);
    urlencoded.append("o_rate", this.state.o_rate);
    urlencoded.append("stake", this.state.amount);
    urlencoded.append("runner_id", this.props.runner_name);
    urlencoded.append("rId", this.props.runner_id);
    urlencoded.append("event_id", this.props.eventid);
    urlencoded.append("mode_id", this.props.modeid);
    urlencoded.append("bet_type", this.props.slip_type);
    urlencoded.append("mid", this.props.mid);

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };
    fetch(import.meta.env.VITE_API_HOST + "/submitBet", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        this.props.getBetList();
        this.props.getRunnerPostion(this.props.mid);
        if (result.message) {
          let alertclass;
          if (result.success) {
            alertclass = "alert-success";
            this.props.socket.emit("runner", {
              eid: this.props.eventid,
              mid: this.props.mid,
              action: "placebet",
              data: {
                ps: result.data && result.data.ps ? result.data.ps : [],
                upline: result.data && result.data.upline ? result.data.upline : []
              }
            });
          } else {
            alertclass = "alert-danger";
          }
          this.setState(
            {
              amount: "",
              message: result.message,
              alertclass: alertclass
            },
            () => {
              this.handleCloseModal();
            }
          );
        }
      });
  };
  componentDidMount() {
    let slip_runners = JSON.parse(JSON.stringify(this.props.slip_runners));
    let dis_spinner = (this.props.active_market_type === 'Line Session') ? true : false;
    this.setState({
      o_rate: this.props.o_rate,
      stack: this.props.stack,
      slip_runners: slip_runners,
      mounted: true,
      dis_spinner: dis_spinner,
      size: this.props.size ? this.props.size : 1,
      cp: (this.props.mid.startsWith("12.") ||
        localStorage.getItem(this.props.mid + "_cp") === 'true')
        ? true : false
    });
    this.marketSettings();
  }

  isInt = (n) => {
    return n % 1 === 0;
  };

  nextExposurre = () => {
    let runners = [...this.state.slip_runners];
    let market_type = ["Match Odds", "Extra Market", "Line Session", "Book Maker"];
    if (market_type.includes(this.props.active_market_type)) {
      let formula = this.state.amount * (this.state.stack - 1);
      if (this.props.active_market_type === 'Book Maker') {
        formula = (this.state.amount / 100) * (this.state.stack);
      }
      for (let i = 0; i < runners.length; i++) {
        if (this.props.slip_type === "back") {
          if (runners[i].rid === this.props.runner_id) {
            runners[i].next_exp =
              Number(runners[i].exp) +
              formula;
          } else {
            runners[i].next_exp =
              Number(runners[i].exp) - Number(this.state.amount);
          }
        } else {
          if (runners[i].rid === this.props.runner_id) {
            runners[i].next_exp =
              Number(runners[i].exp) -
              formula;
          } else {
            runners[i].next_exp =
              Number(runners[i].exp) + Number(this.state.amount);
          }
        }
        if (!this.isInt(runners[i].next_exp)) {
          runners[i].next_exp = runners[i].next_exp.toFixed(2);
        }
      }
    }
    if (this.props.active_market_type === "Line Session") {
      runners[0].exp = this.state.amount;
      runners[0].next_exp = this.state.amount * -1;
    }
    if (this.props.active_market_type === "Fancy") {
      runners[0].exp = this.props.slip_type === 'lay' ? this.state.amount : this.state.size * this.state.amount;
      runners[0].next_exp = this.props.slip_type === 'lay' ? this.state.size * this.state.amount * -1 : this.state.amount * -1;
    }

    this.setState({
      slip_runners: runners,
    });
  };

  getIncremantal = () => {
    let val = this.state.stack;
    var step;
    if (val < 2) {
      step = 0.01;
    } else if (val >= 2 && val < 3) {
      step = 0.02;
    } else if (val >= 3 && val < 4) {
      step = 0.05;
    } else if (val >= 4 && val < 6) {
      step = 0.1;
    } else if (val >= 6 && val < 10) {
      step = 0.2;
    } else if (val >= 10 && val < 20) {
      step = 0.5;
    } else if (val >= 20 && val < 30) {
      step = 1;
    } else if (val >= 30 && val < 50) {
      step = 2;
    } else if (val >= 50 && val < 100) {
      step = 5;
    } else if (val >= 100 && val < 1000) {
      step = 10;
    } else if (val > 1000) {
      step = null;
    }
    this.setState(
      {
        stack: Math.round((val + step) * 1e12) / 1e12,
      },
      () => {
        this.nextExposurre();
      }
    );
  };

  getDecremantal = () => {
    let val = this.state.stack;
    var step;
    if (val <= 2) {
      step = 0.01;
    } else if (val > 2 && val <= 3) {
      step = 0.02;
    } else if (val > 3 && val <= 4) {
      step = 0.05;
    } else if (val > 4 && val <= 6) {
      step = 0.1;
    } else if (val > 6 && val <= 10) {
      step = 0.2;
    } else if (val > 10 && val <= 20) {
      step = 0.5;
    } else if (val > 20 && val <= 30) {
      step = 1;
    } else if (val > 30 && val <= 50) {
      step = 2;
    } else if (val > 50 && val <= 100) {
      step = 5;
    } else if (val > 100 && val <= 1000) {
      step = 10;
    } else if (val > 1000) {
      step = null;
    }
    this.setState(
      {
        stack: Math.round((val - step) * 1e12) / 1e12,
      },
      () => {
        this.nextExposurre();
      }
    );
  };

  marketSettings = () => {
    let urlencoded = new URLSearchParams();
    urlencoded.append("market_id", this.props.mid);
    fetch(import.meta.env.VITE_API_HOST + "/getDefaultEventSetting", {
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
        this.setState({
          m_s: result.data ? result.data : [],
        });
      })
  }

  render() {
    let modal_title = this.props.title;
    return (
      <div className="custom-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            {
              this.state.loading &&
              <div className="blur-modal-content"></div>
            }
            <div
              className={`modal-header ${this.props.slip_type && this.props.slip_type
                ? this.props.slip_type
                : ""
                }`}
            >
              <h5 className="modal-title">
                {modal_title}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                title="Close Slip"
              >
                <span onClick={this.handleCloseModal} aria-hidden="true">
                  ×
                </span>
              </button>
            </div>
            <div className={`modal-body ${this.props.slip_type === 'back' ? 'back-light' : 'lay-light'}`}>
              <div className="row">
                {this.props.slip_obj &&
                  <div className="col-7 float-left">
                    <h6 className='small-text'><span style={{ minHeight: '20px' }} className='d-inline-block'>{this.props.slip_obj.n}</span> <small className={`p-1  ${this.props.active_market_type === 'Line Session' || this.props.active_market_type === 'Fancy' ? "lay" : "back"
                      }`}>{this.props.active_market_type === 'Line Session' ? Math.ceil(this.props.slip_obj.b[0]) : this.props.active_market_type === 'Fancy' ? this.props.slip_obj.l[0] : this.props.slip_obj.b[0]}</small><small className={`p-1  ${this.props.active_market_type === 'Line Session' || this.props.active_market_type === 'Fancy' ? "back" : "lay"
                        }`}>{this.props.active_market_type === 'Line Session' ? Math.ceil(this.props.slip_obj.l[0]) : this.props.active_market_type === 'Fancy' ? this.props.slip_obj.b[0] : this.props.slip_obj.l[0]}</small></h6>
                  </div>
                }
                <div className="col-5 float-right p-0">
                  <small className='small-text text-primary d-block text-right mr-2'>MAX BET : {this.state.m_s.max_bet && this.state.m_s.max_bet}</small>
                  <small className='small-text text-primary d-block text-right mr-2'>MARKET PROFIT : {this.state.m_s.max_market_profit && this.state.m_s.max_market_profit}</small>
                </div>
              </div>
              <div className="row">
                <form onSubmit={(e) => this.placeBet(e)}>
                  <div className="input-group col-4 col-md-4 float-left p-1">
                    <div className="input-group-prepend">
                      <button
                        onClick={this.getDecremantal}
                        className="input-group-text"
                        type="button"
                        disabled={this.state.dis_spinner}
                      >
                        -
                      </button>
                    </div>
                    <input
                      type="number"
                      className="form-control p-1"
                      placeholder=""
                      aria-label="Stack"
                      aria-describedby="basic-addon1"
                      style={{ maxWidth: "100px" }}
                      value={this.state.stack}
                      min="0"
                      max="1000"
                      disabled
                      onChange={(event) => {
                        this.setState({
                          stack: event.target.value,
                        });
                      }}
                    />
                    <div className="input-group-append">
                      <button
                        onClick={this.getIncremantal}
                        className="input-group-text"
                        type="button"
                        disabled={this.state.dis_spinner}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="input-group col-4 col-md-4 float-left p-1">
                    <input
                      className="form-control ml-2 bg-light"
                      type="number"
                      placeholder=""
                      min="0"
                      max="999999999"
                      required
                      value={this.state.amount}
                      onChange={(event) => {
                        this.setState(
                          {
                            amount: event.target.value,
                          },
                          () => {
                            this.nextExposurre();
                          }
                        );
                      }}
                    ></input>
                  </div>
                  <div className="col-4 col-md-4 float-right mt-1 p-1">
                    {this.state.loading && <div className="sweet-loading">
                      <BounceLoader
                        size={50}
                        color="#1977ff"
                        loading={this.state.loading}
                      />
                    </div>}
                    <button
                      disabled={this.state.d_pb}

                      type="submit"
                      className="col-12 btn btn btn-theme p-1"
                    >
                      PLACE BET
                    </button>
                  </div>
                </form>
              </div>
              <div className="row">
                <div className="col-12 text-center justify-content-center">
                  {this.state.mounted &&
                    this.props.btns.map((v, k) => (
                      <button
                        onClick={(event) => {
                          this.setState(
                            {
                              amount: v.b_value,
                            },
                            () => {
                              this.nextExposurre();
                            }
                          );
                        }}
                        type="button"
                        className="btn btn-secondary mr-1 mt-1"
                        key={k}
                      >
                        {v.b_name}
                      </button>
                    ))}
                </div>
              </div>
            </div>
            <div className={`modal-footer p-0 ${this.props.slip_type === 'back' ? 'back-light' : 'lay-light'}`}>
              {!this.state.message && (
                <table className="table table-sm table-betlist">
                  <thead>
                    <tr>
                      <th width="60%" scope="col"></th>
                      {(this.props.active_market_type !== "Line Session" && this.props.active_market_type !== "Fancy") && (
                        <>
                          <th className="text-right">Before</th>
                          <th className="text-right">After</th>
                        </>
                      )}
                      {(this.props.active_market_type === "Line Session" || this.props.active_market_type === "Fancy") && (
                        <>
                          <th className="text-right">Profit</th>
                          <th className="text-right">Loss</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.mounted &&
                      this.state.slip_runners.map((v, key) => (
                        <tr key={key}>
                          <td>{v.n}</td>
                          <td
                            className={`text-right bold ${v.exp < 0 ? "text-danger" : "text-success"
                              }`}
                          >
                            {v.exp}
                          </td>
                          <td
                            className={`text-right bold ${v.next_exp < 0 ? "text-danger" : "text-success"
                              }`}
                          >
                            {parseInt(v.next_exp) || ''}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}{" "}
              {this.state.message && (
                <div className={`table alert ${this.state.alertclass}`} role="alert">
                  {this.state.message}
                </div>
              )}
              {(this.props.active_market_type === 'Match Odds'
                || this.props.active_market_type === "Extra Market")
                && (<div className="custom-control custom-switch">
                  <input checked={this.state.cp} type="checkbox" className="custom-control-input" id="cp"
                    onChange={(event) => {
                      this.setState({
                        cp: !this.state.cp
                      }, () => {
                        localStorage.setItem(this.props.mid + "_cp", this.state.cp)
                      })
                    }} />
                  <label className="custom-control-label font-weight-bold" htmlFor="cp">Current Price</label>
                </div>)
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default BetSlip;
