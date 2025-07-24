import React, { Component } from "react";
import Loader from "./Component/Loader";
import ModelPopup from "./Users/ModelPopup";
import StoreContext from '../store';

const Message = React.lazy(() => import("./Component/Message"));

class AccountGeneral extends Component {
  static contextType = StoreContext
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      ac_data: [],
      p_data: [],
      n_data: [],
      profile: {},
      p_total: 0,
      n_total: 0,
      n_sri: 0,
      p_sri: 0,
      sw: "",
      settl: false,
      m_ttl: "",
      m_uname: "",
      user_chips: 0,
      cpf: false,
      m_uid: "",
      s_amt: 0,
      message: "",
      alertclass: "",
      modeltype: false,
    };
  }
  setPl = (user) => {
    let m_type = (user.up_line < 0 && user.u_role < 5) || (user.up_line > 0 && user.u_role > 4) ? 'withdraw' : 'deposit';
    let rmk = (user.up_line < 0 && user.u_role < 5) || (user.up_line > 0 && user.u_role > 4) ? `Deposit to Pocket Of ${user.p_code}` : `Withdraw from Pocket Of ${user.p_code}`;

    this.setState({ modeltype: m_type, ptitle: rmk, modeluser: user });
    window.history.pushState({ dummyUrl: true }, null, null);

  }
  handleSubmit = () => {
    let headers = new Headers();
    let urlencoded = new URLSearchParams();
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };

    this.setState({
      s_disabled: true,
      loading: true,
    });

    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

    fetch(import.meta.env.VITE_API_HOST + "/user/getusers", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = import.meta.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result && result.data) {
          let p_data = []
          let n_data = []
          let p_total = 0
          let n_total = 0
          let n_sri = 0
          let p_sri = 0

          for (let i = 0; i < result.data.length; i++) {
            if (result.data[i].up_line) {
              if (result.data[i].up_line && Number(result.data[i].up_line) < 0) {
                if (Number(result.data[i].u_role) < 5) {
                  p_data.push({ ...result.data[i] })
                  p_total += Number(result.data[i].up_line)
                } else {
                  n_data.push({ ...result.data[i] })
                  n_total += Number(result.data[i].up_line * (-1))
                }

              } else {
                if (Number(result.data[i].u_role) < 5) {
                  n_data.push({ ...result.data[i] })
                  n_total += Number(result.data[i].up_line)
                } else {
                  p_data.push({ ...result.data[i] })
                  p_total += Number(result.data[i].up_line * (-1))
                }
              }

            }

          }

          if (result.profile && Number(result.profile.up_line) < 0) {
            n_total += Number(result.profile.up_line) * (-1)
          }



          if (result.profile && Number(result.profile.up_line) > 0) {
            p_total += Number(result.profile.up_line) * (-1)
          }

          if (Math.abs(n_total) < Math.abs(p_total)) {
            n_sri = Math.abs(p_total) - Math.abs(n_total)
          }
          if (Math.abs(p_total) < Math.abs(n_total)) {
            p_sri = Math.abs(p_total) - Math.abs(n_total)
          }

          let p_net_pl = 0
          let n_net_pl = 0
          let p_net_pocket = 0
          let n_net_pocket = 0

          if (result.profile.pocket > 0) {
            n_net_pocket += Number(result.profile.pocket)
          } else {
            p_net_pocket += Number(result.profile.pocket)

          }

          if (result.profile.net_pl < 0) {
            n_net_pl += Number(result.profile.net_pl) * (-1)
          } else {
            p_net_pl += Number(result.profile.net_pl) * (-1)
          }

          if (Math.abs(result.profile.net_pl) < Math.abs(result.profile.pocket)) {

            //p_net_pl += (result.profile.net_pl) * (-1)
          } else {
            //n_net_pl += (result.profile.net_pl)
            //p_net_pocket += (result.profile.pocket) * (-1)
          }

          n_total += n_net_pl;
          p_total += p_net_pl;

          n_total += n_net_pocket;
          p_total += p_net_pocket;

          // n_total += n_sri;
          // p_total += p_sri;


          this.setState({
            ac_data: result.data,
            profile: result.profile,
            p_data: p_data,
            n_data: n_data,
            p_net_pl: p_net_pl,
            n_net_pl: n_net_pl,
            p_net_pocket: p_net_pocket,
            n_net_pocket: n_net_pocket,
            p_total: p_total.toFixed(2),
            n_total: n_total.toFixed(2),
            n_sri: n_sri.toFixed(2),
            p_sri: p_sri.toFixed(2)
          })
        }
      })
      .catch((error) => {
        console.log(error)
      }).finally(() => {
        this.setState({
          s_disabled: false,
          more_disable: false,
          loading: false,
        });
      })
  };
  searchUser = (event) => {
    event.preventDefault();
    if (this.state.sw.length > 1) {
      window.find(this.state.sw)
    }
  }
  componentDidMount = () => {
    this.handleSubmit()
  }

  closePopUp = (cls = '', msg = '') => {
    this.setState({
      settl: false,
      message: msg,
      alertclass: cls
    }, () => {
      if (msg) {
        this.handleSubmit();
      }
      setTimeout(() => {
        this.setState({
          message: "",
          alertclass: ""
        })
      }, 2000)
    });
  };

  modelClose = (cls = '', msg = '', flag = false) => {
    if (!flag) window.history.go(-1)
    if (this.state.modeltype === 'aduser'
      || this.state.modeltype === 'wd' || this.state.modeltype === 'withdraw'
      || this.state.modeltype === 'dp' || this.state.modeltype === 'deposit'

    ) {
      this.handleSubmit();
    }

    this.setState(
      {
        modeltype: false,
        mode: false,
        modeluser: false,
        message: msg,
        alertclass: cls
      }, () => {
        setTimeout(() => {
          this.setState({
            message: ""
          })
        }, 2000);
      });

  }

  render() {
    const store = this.context
    return (
      <React.Fragment>
        <div className="py-2 md:px-2">
          <form className="grid  grid-cols-3 lg:grid-cols-6 gap-1" onSubmit={event => this.searchUser(event)}>
            <div className="border-b border-gray-600 flex content-center">
              <input type="search" value={this.state.sw} onInput={event =>
                this.setState({
                  sw: event.target.value
                })
              } placeholder="Search By User Name" className="px-2 py-0.5 text-primary-800 dark:text-white bg-primary-200 dark:bg-primary-800 outline-none w-full" />
            </div>
            <div className="flex content-center">
              <button type="submit" className="px-2 py-0.5 bg-primary-300 dark:bg-gray-600 hover:bg-primary-200 dark:hover:bg-gray-500 text-black dark:text-white focus:outline-none">Enter</button>
            </div>
          </form>
        </div>
        <div className="font-semibold  text-sm">
          <h1 className="text-center bg-primary-700 text-white">-: Chip Summary :-</h1>
          <div className="overflow-auto">
            <table className="w-full">
              <thead className='text-white dark:text-white bg-green-500 dark:bg-green-600'>
                <tr>
                  <th className="text-center">UT</th>
                  <th className="px-2 py-1 text-left">USERNAME</th>
                  <th width="20%" className="px-2 py-1 text-right">CHIP</th>
                  <th width="30%">Action</th>
                </tr>
              </thead>
              <tbody>{this.state.p_data.map((v, k) => (
                <tr key={k} className="text-black dark:text-white bg-white dark:bg-secondary-900 border-b border-primary-700">
                  <td className="text-center">{v.u_role === 5 && <button
                    className="rounded-sm px-1 py-0.5 text-white bg-primary-600 hover:bg-primary-500 text-xs">C</button>}{v.u_role === 4 && <button className="rounded-sm px-1 py-0.5 text-white bg-green-600 hover:bg-green-500 text-xs">M</button>}{v.u_role === 3 && <button className="rounded-sm px-1 py-0.5 text-white bg-green-600 hover:bg-green-500 text-xs">SM</button>}
                  </td>
                  <td className="px-2 py-1">{<span title={v.name}>{v.p_code}{" "}[{v.name}]</span>}</td>
                  <td className="px-2 py-1 text-right"><span role="button" onClick={() => { this.setPl(v) }} className={`text-green-600 text-center w-10 py-1 rounded-full transition-all duration-300 text-base`}>{v.u_role < 5 ? v.up_line * (-1) : v.up_line}</span>
                  </td>
                  <td className="px-2 py-1 text-center">
                    <p role="button" onClick={() => { this.setPl(v) }} className={`bg-black hover:bg-primary-800 text-white text-center px-2 py-0.5 rounded transition-all duration-300 mx-0.5 my-1 md:inline-block text-xs font-medium`} >SETTLEMENT</p>
                    <p role="button" onClick={() => {
                      const flt = { ...v }
                      flt.filter = {
                        ac_type: "settlement"
                      }
                      store.setItem("active_user", flt)
                      this.props.navigate(`/report/accountstatement`)
                    }
                    } className={`bg-black hover:bg-primary-800 text-white text-center px-2 py-0.5 rounded transition-all duration-300 mx-0.5 my-1 md:inline-block text-xs font-medium`} >HISTORY</p>
                  </td>
                </tr>
              ))}

                {
                  this.state.p_net_pl !== 0 && <tr className='text-black dark:text-white bg-white dark:bg-secondary-900 border-b border-primary-700'>
                    <td className="text-center">#</td>
                    <td className="px-2 py-1">Own P/L</td>
                    <td className="px-2 py-1 text-right"><span role="button" className={`text-green-600 text-center w-10 py-1 rounded-full transition-all duration-300 text-base`}>{this.state.p_net_pl * (-1)}</span></td>
                    <td></td>
                  </tr>
                }
                {
                  this.state.p_net_pocket !== 0 && <tr className='text-black dark:text-white bg-white dark:bg-secondary-900 border-b border-primary-700'>
                    <td className="text-center">#</td>
                    <td className="px-2 py-1">Own Chip</td>
                    <td className="px-2 py-1 text-right"><span role="button" className={`text-green-600 text-center w-10 py-1 rounded-full transition-all duration-300 text-base`}>{this.state.p_net_pocket * (-1)}</span></td>
                    <td className="text-center"><p role="button" onClick={() => {
                      const flt = {}
                      flt.filter = {
                        ac_type: "settlement"
                      }
                      store.setItem("active_user", flt)
                      this.props.navigate(`/report/accountstatement`)
                    }
                    } className={`bg-black hover:bg-primary-800 text-white text-center px-2 py-0.5 rounded transition-all duration-300 mx-0.5 my-1 md:inline-block text-xs font-medium`} >HISTORY</p></td>
                  </tr>
                }
                {
                  this.state.profile.up_line && this.state.profile.up_line > 0 && <tr
                    className='text-black dark:text-white bg-white dark:bg-secondary-900 border-b border-primary-700'>
                    <td className="text-center">#</td>
                    <td className="px-2 py-1">Parent P/L</td>
                    <td className="px-2 py-1 text-right"><span role="button" className={`text-green-600 text-center w-10 py-1 rounded-full transition-all duration-300 text-base`}>{this.state.profile.up_line}</span></td>
                    <td></td>
                  </tr>
                }
                {
                  this.state.p_sri < 0 && <tr className='text-black dark:text-white bg-white dark:bg-secondary-900'>
                    <td className="text-center">#</td>
                    <td className="px-2 py-1">My Running P/L</td>
                    <td className="px-2 py-1 text-right"><span role="button" className={`text-green-600 text-center w-10 py-1 rounded-full transition-all duration-300 text-base`}>{this.state.p_sri * (-1)}</span></td>
                    <td className="text-center"></td>
                  </tr>
                }
                <tr className='text-white dark:text-white bg-green-500 dark:bg-green-600'>
                  <td></td>
                  <td className="px-2 py-1 text-right">TOTAL</td>
                  <td className="px-2 py-1 text-right"><span role="button" className={`text-white text-center w-10 py-1 rounded-full transition-all duration-300 text-base`}>{this.state.p_total * (-1)}</span></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-auto">
            <table className="w-full my-2">
              <thead className='text-white dark:text-white bg-red-600 dark:bg-red-700'>
                <tr>
                  <th className="text-center">UT</th>
                  <th className="px-2 py-1 text-left">USERNAME</th>
                  <th width="20%" className="px-2 py-1 text-right">CHIP</th>
                  <th width="30%">Action</th>
                </tr>
              </thead>
              <tbody>{this.state.n_data.map((v, k) => (
                <tr key={k} className="text-black dark:text-white bg-white dark:bg-secondary-900 border-b border-primary-700">
                  <td className="text-center">{v.u_role === 5 && <button
                    className="rounded-sm px-1 py-0.5 text-white bg-primary-600 hover:bg-primary-500 text-xs">C</button>}{v.u_role === 4 && <button className="rounded-sm px-1 py-0.5 text-white bg-green-600 hover:bg-green-500 text-xs">M</button>}{v.u_role === 3 && <button className="rounded-sm px-1 py-0.5 text-white bg-green-600 hover:bg-green-500 text-xs">SM</button>}</td>
                  <td className="px-2 py-1">{<span title={v.name}>{v.p_code}{" "}[{v.name}]</span>}</td>
                  <td className="px-2 py-1 text-right"><span role="button" onClick={() => { this.setPl(v) }} className={`text-red-600 dark:text-pink-300 text-center w-10 py-1 rounded-full transition-all duration-300 text-base`}
                  >{v.u_role < 5 ? v.up_line * (-1) : v.up_line}</span>
                  </td>
                  <td className="px-2 py-1 text-center"><p role="button" onClick={() => { this.setPl(v) }} className={`bg-black hover:bg-primary-800 text-white text-center px-2 py-0.5 rounded transition-all duration-300 mx-0.5 my-1 md:inline-block text-xs font-medium`} >SETTLEMENT</p>
                    <p role="button" onClick={() => {
                      const flt = { ...v }
                      flt.filter = {
                        ac_type: "settlement"
                      }
                      store.setItem("active_user", flt)
                      this.props.navigate(`/report/accountstatement`)
                    }
                    }
                      className={`bg-black hover:bg-primary-800 text-white text-center px-2 py-0.5 rounded transition-all duration-300 mx-0.5 my-1 md:inline-block text-xs font-medium`} >
                      HISTORY</p>
                  </td>
                </tr>
              ))}

                {
                  this.state.profile.up_line && this.state.profile.up_line < 0 && <tr
                    className='text-black dark:text-white bg-white dark:bg-secondary-900 border-b border-primary-700'>
                    <td className="text-center">#</td>
                    <td className="px-2 py-1">Parent P/L</td>
                    <td className="px-2 py-1 text-right"><span role="button" className={`text-red-600 dark:text-pink-300 text-center w-10 py-1 rounded-full transition-all duration-300 text-base`}>{this.state.profile.up_line}</span>
                    </td>
                    <td></td>
                  </tr>
                }
                {
                  this.state.n_net_pl !== 0 && <tr className='text-black dark:text-white bg-white dark:bg-secondary-900 border-b border-primary-700'>
                    <td className="text-center">#</td>
                    <td className="px-2 py-1">Own P/L</td>
                    <td className="px-2 py-1 text-right"><span role="button" className={`text-red-600 dark:text-pink-300 text-center w-10 py-1 rounded-full transition-all duration-300 text-base`}>{this.state.n_net_pl * (-1)}</span></td>
                    <td></td>
                  </tr>
                }
                {
                  this.state.n_net_pocket !== 0 && <tr className='text-black dark:text-white bg-white dark:bg-secondary-900 border-b border-primary-700'>
                    <td className="text-center">#</td>
                    <td className="px-2 py-1 text-right">Own Chip</td>
                    <td className="px-2 py-1 text-right"><span role="button" className={`text-red-600 dark:text-pink-300 text-center w-10 py-1 rounded-full transition-all duration-300 text-base`}>{this.state.n_net_pocket * (-1)}</span></td>
                    <td className="text-center"><p role="button" onClick={() => {
                      const flt = {}
                      flt.filter = {
                        ac_type: "settlement"
                      }
                      store.setItem("active_user", flt)
                      this.props.navigate(`/report/accountstatement`)
                    }
                    } className={`bg-black hover:bg-primary-800 text-white text-center px-2 py-0.5 rounded transition-all duration-300 mx-0.5 my-1 md:inline-block text-xs font-medium`} >HISTORY</p></td>
                  </tr>
                }
                {
                  this.state.n_sri > 0 && <tr className='text-black dark:text-white bg-white dark:bg-secondary-900'>
                    <td className="text-center">#</td>
                    <td className="px-2 py-1">My Running P/L</td>
                    <td className="px-2 py-1 text-right"><span role="button" className={`text-red-600 dark:text-pink-300 text-center w-10 py-1 rounded-full transition-all duration-300 text-base`}>{this.state.n_sri * (-1)}</span></td>
                    <td className="text-center"></td>
                  </tr>
                }
                <tr className='text-white dark:text-white bg-red-600 dark:bg-red-700'>
                  <td></td>
                  <td className="px-2 py-1 text-right">TOTAL</td>
                  <td className="px-2 py-1 text-right"><span role="button" className={`text-white text-center w-10 py-1 rounded-full transition-all duration-300 text-base`}>{this.state.n_total * (-1)}</span>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {this.state.message && <React.Suspense fallback={<Loader></Loader>}><Message success={this.state.alertclass} message={this.state.message} /></React.Suspense>}
        {this.state.loading && <Loader />}
        {this.state.modeltype && (
          <ModelPopup {...this.props} modelClose={this.modelClose} mtitle={this.state.ptitle} user={this.state.modeluser} modeltype={this.state.modeltype} />
        )}
      </React.Fragment>
    );
  }
}

export default AccountGeneral;