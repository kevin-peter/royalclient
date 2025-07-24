import React from "react";
class ToolTip extends React.Component {
  constructor() {
    super();
    this.state = {
      m_s: {
        min_bet: 0,
        max_bet: 0,
        max_profit: 0,
        max_market_profit: 0,
        max_liability: 0,
        max_market_liability: 0,
        bet_delay: 0
      },
      mode_id: '',
      type_id: '',
      types: [],
      typ_s: {
        min_bet: 0,
        max_bet: 0,
        max_profit: 0,
        max_market_profit: 0,
        max_liability: 0,
        max_market_liability: 0,
        bet_delay: 0
      },
      disabled: false
    };
  }
  componentDidMount() {
    this.marketSettings();
  }
  marketSettings() {
    let urlencoded = new URLSearchParams();
    let m_s = { ...this.state.m_s }
    urlencoded.append("market_id", this.props.mid);
    fetch(import.meta.env.VITE_API_HOST + "/getDefaultEventSetting", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      method: "POST",
      body: urlencoded
    }).then((response) => {
      if (response.status === 401) {
        window.location.href = process.env.PUBLIC_URL + "/login";
      } else {
        return response.json();
      }
    }).then((result) => {
      if (result.data) {
        this.setState({
          m_s: result.data ? result.data : m_s,
        });
      }
    })
  }
  setMarketSetting(e) {
    e.preventDefault();
    let urlencoded = new URLSearchParams();
    urlencoded.append("market_id", this.props.mid);
    urlencoded.append("min_bet", this.state.m_s.min_bet ? this.state.m_s.min_bet : 0);
    urlencoded.append("max_bet", this.state.m_s.max_bet ? this.state.m_s.max_bet : 0);
    urlencoded.append("max_profit", this.state.m_s.max_profit ? this.state.m_s.max_profit : 0);
    urlencoded.append("max_market_profit", this.state.m_s.max_market_profit ? this.state.m_s.max_market_profit : 0);
    urlencoded.append("max_liability", this.state.m_s.max_liability ? this.state.m_s.max_liability : 0);
    urlencoded.append("max_market_liability", this.state.m_s.max_market_liability ? this.state.m_s.max_market_liability : 0);
    this.setState({
      disabled: true
    })
    fetch(import.meta.env.VITE_API_HOST + "/setMarketSetting", {
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
    }).then((result) => {
      if (result.message) {
        let alertclass;
        if (result.success) {
          alertclass = "alert-success";
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
            setTimeout(() => {
              this.setState({
                message: ""
              })
            }, 3000);
          }
        );
      }
    }).finally(() => {
      this.setState({
        disabled: false
      })
    })
  }
  selectModes = (e) => {
    let mode_id = e.target.value;
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("mode_id", mode_id);
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded
    };
    this.setState({
      mode_id: mode_id,
      type_id: '',
      types: []
    })
    fetch(import.meta.env.VITE_API_HOST + "/getDefaultTypes", requestOptions).then((response) => {
      if (response.status === 401) {
      } else {
        return response.json();
      }
    }).then((result) => {
      if (result && result.data) {
        this.setState({
          types: result.data
        })
      }
    });
  };

  getTypeSettings = (e) => {
    let type_id = e.target.value;
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    urlencoded.append("type_id", type_id);
    let typ_s = { ...this.state.typ_s }
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded
    };
    this.setState({
      type_id: type_id
    })
    fetch(import.meta.env.VITE_API_HOST + "/getTypeSettings", requestOptions).then((response) => {
      if (response.status === 401) {
      } else {
        return response.json();
      }
    }).then((result) => {
      if (result && result.success) {
        this.setState({
          typ_s: result.data[0] ? result.data[0] : typ_s
        })
      }
    });
  }

  setTypeSetting(e) {
    e.preventDefault();
    let urlencoded = new URLSearchParams();
    urlencoded.append("type_id", this.state.type_id);
    urlencoded.append("min_bet", this.state.typ_s.min_bet ? this.state.typ_s.min_bet : 0);
    urlencoded.append("max_bet", this.state.typ_s.max_bet ? this.state.typ_s.max_bet : 0);
    urlencoded.append("max_profit", this.state.typ_s.max_profit ? this.state.typ_s.max_profit : 0);
    urlencoded.append("max_market_profit", this.state.typ_s.max_market_profit ? this.state.typ_s.max_market_profit : 0);
    urlencoded.append("max_liability", this.state.typ_s.max_liability ? this.state.typ_s.max_liability : 0);
    urlencoded.append("max_market_liability", this.state.typ_s.max_market_liability ? this.state.typ_s.max_market_liability : 0);
    this.setState({
      disabled: true
    })
    fetch(import.meta.env.VITE_API_HOST + "/setDefaultsettings", {
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
    }).then((result) => {
      if (result.message) {
        let alertclass;
        if (result.success) {
          alertclass = "alert-success";
        } else {
          alertclass = "alert-danger";
        }
        this.setState(
          {
            message: result.message,
            alertclass: alertclass
          },
          () => {
            setTimeout(() => {
              this.setState({
                message: ""
              })
            }, 3000);
          }
        );
      }
      if (result.success) {
        this.marketSettings();
      }
    }).finally(() => {
      this.setState({
        disabled: false
      })
    })
  }
  render() {

    return (
      <div className="custom-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header book-header">
              <h5 className="modal-title">{this.props.title} / Information</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span onClick={this.props.closeToolTip} aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body p-0">
              <div className='col-12'>
                <form className='mt-2' onSubmit={(e) => this.setMarketSetting(e)}>
                  <table className="table table-sm table-bordered">
                    {this.state.m_s &&
                      <tbody>
                        <tr>
                          <td>Min Bet</td>
                          <td> {this.state.m_s.min_bet && this.state.m_s.min_bet}</td>
                          {
                            this.props.role === 2 &&
                            <td>
                              <input className="form-control" onChange={(e) => {
                                let m_s = { ...this.state.m_s }
                                m_s.min_bet = e.target.value;
                                this.setState({
                                  m_s: m_s
                                })
                              }}

                                value={this.state.m_s.min_bet && this.state.m_s.min_bet} type="text"></input></td>
                          }
                        </tr>
                        <tr>
                          <td>Max Bet</td>
                          <td> {this.state.m_s.max_bet && this.state.m_s.max_bet}</td>
                          {
                            this.props.role === 2 &&
                            <td><input className="form-control" onChange={(e) => {
                              let m_s = { ...this.state.m_s }
                              m_s.max_bet = e.target.value;
                              this.setState({
                                m_s: m_s
                              })
                            }}
                              value={this.state.m_s.max_bet && this.state.m_s.max_bet} type="text"></input></td>
                          }
                        </tr>
                        <tr>
                          <td>Max Profit</td>
                          <td> {this.state.m_s.max_profit && this.state.m_s.max_profit}</td>
                          {
                            this.props.role === 2 &&
                            <td><input className="form-control"
                              onChange={(e) => {
                                let m_s = { ...this.state.m_s }
                                m_s.max_profit = e.target.value;
                                this.setState({
                                  m_s: m_s
                                })
                              }}
                              value={this.state.m_s.max_profit && this.state.m_s.max_profit} type="text"></input></td>
                          }
                        </tr>
                        <tr>
                          <td>Max Market Profit</td>
                          <td> {this.state.m_s.max_market_profit && this.state.m_s.max_market_profit}</td>
                          {
                            this.props.role === 2 &&
                            <td><input className="form-control"
                              onChange={(e) => {
                                let m_s = { ...this.state.m_s }
                                m_s.max_market_profit = e.target.value;
                                this.setState({
                                  m_s: m_s
                                })
                              }}
                              value={this.state.m_s.max_market_profit && this.state.m_s.max_market_profit} type="text"></input></td>
                          }
                        </tr>
                        <tr>
                          <td>Max Liability</td>
                          <td> {this.state.m_s.max_liability && this.state.m_s.max_liability}</td>
                          {
                            this.props.role === 2 &&
                            <td><input className="form-control" onChange={(e) => {
                              let m_s = { ...this.state.m_s }
                              m_s.max_liability = e.target.value;
                              this.setState({
                                m_s: m_s
                              })
                            }} value={this.state.m_s.max_liability && this.state.m_s.max_liability} type="text"></input></td>
                          }
                        </tr>
                        <tr>
                          <td>Max Market Liability</td>
                          <td> {this.state.m_s.max_market_liability && this.state.m_s.max_market_liability}</td>
                          {
                            this.props.role === 2 &&
                            <td><input className="form-control"
                              onChange={(e) => {
                                let m_s = { ...this.state.m_s }
                                m_s.max_market_liability = e.target.value;
                                this.setState({
                                  m_s: m_s
                                })
                              }}
                              value={this.state.m_s.max_market_liability && this.state.m_s.max_market_liability} type="text"></input></td>
                          }
                        </tr>
                        <tr>
                          <td>Bet Delay</td>
                          <td> {this.state.m_s.bet_delay && this.state.m_s.bet_delay}</td>
                          {
                            this.props.role === 2 &&
                            <td><input className="form-control" disabled readOnly value={this.state.m_s.bet_delay && this.state.m_s.bet_delay} type="text"></input></td>
                          }
                        </tr>
                      </tbody>
                    }
                  </table>
                  {
                    this.props.role === 2 &&
                    <div className="row">

                      <div className='col-10 form-group'>
                        {this.state.message && (
                          <div className={`alert ${this.state.alertclass}`} role="alert">
                            {this.state.message}
                          </div>
                        )}
                      </div>
                      <div className="col-2 form-group">
                        <button disabled={this.state.disabled} className="btn btn-sm btn-theme float-right" type="submit">Submit</button>
                      </div>
                    </div>
                  }
                </form>
                <hr />
                {this.props.role === 2 &&
                  <form className='mt-2' onSubmit={(e) => this.setTypeSetting(e)}>
                    <div className="row">
                      <div className="col-6 form-group">
                        <label>Play Mode</label>
                        <select defaultValue={this.state.mode_id} name="modes" className="form-control" onChange={this.selectModes}>
                          <option value={""}>Select Mode</option>
                          {this.props.modes && this.props.modes.map((mode, index) => (
                            <option key={index} value={mode.id}>{mode.play}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6 form-group">
                        <label>Types</label>
                        <select defaultValue={this.state.type_id} name="types" className="form-control" onChange={this.getTypeSettings}>
                          <option value={""}>Select Type</option>
                          {this.state.types.map((type, index) => (
                            <option key={index} value={type.id}>{type.type_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {this.state.type_id && (<div className="row">
                      <div className="col-6 form-group">
                        <label>Min Bet</label>
                        <input type="number"
                          onChange={(e) => {
                            let typ_s = { ...this.state.typ_s }
                            typ_s.min_bet = e.target.value;
                            this.setState({
                              typ_s: typ_s
                            })
                          }}
                          value={this.state.typ_s.min_bet && this.state.typ_s.min_bet}
                          className="form-control" name="min_bet" min="0" required />
                      </div>
                      <div className="col-6 form-group">
                        <label>Max Bet</label>
                        <input type="number"
                          onChange={(e) => {
                            let typ_s = { ...this.state.typ_s }
                            typ_s.max_bet = e.target.value;
                            this.setState({
                              typ_s: typ_s
                            })
                          }}
                          value={this.state.typ_s.max_bet && this.state.typ_s.max_bet}
                          className="form-control" name="max_bet" required />
                      </div>
                      <div className="col-6 form-group">
                        <label>Max Profit</label>
                        <input type="number"
                          onChange={(e) => {
                            let typ_s = { ...this.state.typ_s }
                            typ_s.max_profit = e.target.value;
                            this.setState({
                              typ_s: typ_s
                            })
                          }}
                          value={this.state.typ_s.max_profit && this.state.typ_s.max_profit}
                          className="form-control" name="max_profit" required />
                      </div>

                      <div className="col-6 form-group">
                        <label>Max Market Profit</label>
                        <input type="number"
                          onChange={(e) => {
                            let typ_s = { ...this.state.typ_s }
                            typ_s.max_market_profit = e.target.value;
                            this.setState({
                              typ_s: typ_s
                            })
                          }}
                          value={this.state.typ_s.max_market_profit && this.state.typ_s.max_market_profit}
                          className="form-control" name="max_market_profit" required />
                      </div>
                      <div className="col-6 form-group">
                        <label> Max Liability</label>
                        <input type="number"
                          onChange={(e) => {
                            let typ_s = { ...this.state.typ_s }
                            typ_s.max_liability = e.target.value;
                            this.setState({
                              typ_s: typ_s
                            })
                          }}
                          value={this.state.typ_s.max_liability && this.state.typ_s.max_liability}
                          className="form-control" name="max_liability" required />
                      </div>
                      <div className="col-6 form-group">
                        <label >Max Market Liability</label>
                        <input type="number"
                          onChange={(e) => {
                            let typ_s = { ...this.state.typ_s }
                            typ_s.max_market_liability = e.target.value;
                            this.setState({
                              typ_s: typ_s
                            })
                          }}
                          value={this.state.typ_s.max_market_liability && this.state.typ_s.max_market_liability}
                          className="form-control" name="max_market_liability" required />
                      </div>
                      <div className="col-6 form-group">
                        <button
                          type='reset'
                          title="close"
                          onClick={this.props.closeToolTip} className="btn btn-sm btn-danger float-left">Cancel</button>
                      </div>
                      <div className="col-6 form-group">
                        <button type="submit" disabled={this.state.disabled} className="btn btn-sm btn-theme float-right" >Change</button>
                      </div>
                    </div>)}
                  </form>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default ToolTip;
