import React, { Component } from "react";
import { NavLink } from "react-router-dom";

import {
  LockClosedIcon,
  ArrowLeftCircleIcon,
  UserCircleIcon,
  CogIcon,
} from "@heroicons/react/24/solid";

import Loader from "../../../utilities/Loader";
import DropdownFullPage from '../../../components/DropdownFullPage';

import StoreContext from "../../../Store";
import ModelPopup from "./ModelPopup";
import socketIOClient from "socket.io-client";
//import NS from "./../assets/sound/short_notification.mp3"

// const Message = React.lazy(() => import("../Component/Message"));
// const AllExpo = React.lazy(() => import("../Component/AllExpo"));
const ENDPOINT = process.env.REACT_APP_SOCKET;

class Users extends Component {
  static contextType = StoreContext;
  constructor(props) {
    super(props);
    this.state = {
      isError: false,
      modeltype: false,
      users: [],
      parent: {},
      pname: "",
      user_ids: [],
      ptitle: "",
      modeluser: false,
      mode: false,
      message: "",
      loading: true,
      exp: false,
      sw: "",
      alertclass: 1,
      flash_user: {},
      cng_usr: false,
    };
  }

  componentDidMount() {
    
    this.getAllUsers(this.state.flash_user);
    
    let mi = [
      { label: "Create Client/Master", action: this.addUser },
      { label: "Free Chip Deposit", action: this.dipositeAmount },
      { label: "Free Chip Withdraw", action: this.withDrawAmount },
      { label: "Account Statement", link: "/report/accountstatement" },
      { label: "Profit Loss", link: "/report/profitloss" },
      { label: "Sports P/L", link: "/report/accountsummary" },
      { label: "Live Bets", link: "/report/livebet" },

      { label: "Bet History", link: "/report/mybets" },
      { label: "Settings", action: this.changeSetting },
      { label: "Sport Settings", action: this.modeSetting },
      { label: "Reset Password", action: this.resetPassword },
    ];

    this.setState({ menu: mi });
  }
  componentWillUnmount() {
   // this.socket.disconnect();
    clearInterval(this.ref_user);
  }

  closeDropDown = () => {
    this.setState({
      showside: false,
      active_user: {},
    });
  };

  closeBook = () => {
    this.setState({
      exp: false,
    });
  };

  getProfile() {
    let urlencoded = new URLSearchParams();

    fetch(import.meta.env.VITE_API_HOST + "/user/profile", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: urlencoded,
      method: "POST",
    })
      .then((response) => {
        if (response.status === 401) {
          this.setState(
            {
              isLoggenin: false,
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
        if (result.data && result.data.profile) {
          let obj = {
            exp: result.data.profile[0].exposer,
            bal: result.data.profile[0].amount,
          };
          this.props.updateBal(obj);
        }
      });
  }

  getAllUsers(user = {}, flag = false) {
    let headers = new Headers();
    let urlencoded = new URLSearchParams();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let user_ids = [...this.state.user_ids];
    if (user && user.id) {
      urlencoded.append("user_id", user.id);
      if (!user_ids.includes(user.id)) {
        user_ids.push(user.id);
      }
    } else {
      if (!flag) {
        user_ids.pop();
      }
      let flash_user = {};
      if (user_ids.length > 0) {
        urlencoded.append("user_id", user_ids[user_ids.length - 1]);
        flash_user.u_id = user_ids[user_ids.length - 1];
      }
      this.setState({
        flash_user: {
          u_id: user_ids[user_ids.length - 1],
        },
      });
    }
    if (user && user.type) {
      urlencoded.append("type", user.type);
    }
    if (user && user.uname) {
      urlencoded.append("uname", user.uname);
    }

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
      redirect: "follow",
    };

    fetch(import.meta.env.VITE_API_HOST + "/user/getusers", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result && result.success) {
          this.setState({
            user_ids: user_ids,
            users: result.data ? result.data : [],
            isError: false,
            parent: user,
            loading: false,
            pname: result.data.parent ? result.data.parent : user.p_code,
          });
        }
      });
  }
  withDrawAmount = (user) => {
    this.setState({
      modeltype: "wd",
      ptitle: "Withdraw Chips From " + user.p_code,
      modeluser: user,
    });
    window.history.pushState({ dummyUrl: true }, null, null);
  };
  dipositeAmount = (user) => {
    this.setState({
      modeltype: "dp",
      ptitle: "Deposite Chips To " + user.p_code,
      modeluser: user,
    });
    window.history.pushState({ dummyUrl: true }, null, null);
  };
  changeSetting = (user) => {
    this.setState({
      modeltype: "cs",
      ptitle: "User Settings Of " + user.p_code,
      modeluser: user,
    });
    window.history.pushState({ dummyUrl: true }, null, null);
  };
  modeSetting = (user) => {
    this.setState({
      modeltype: "ms",
      ptitle: "Sport Settinng Of " + user.p_code,
      mode: true,
      modeluser: user,
    });
    window.history.pushState({ dummyUrl: true }, null, null);
  };
  setPl = (user) => {
    let m_type =
      (user.up_line < 0 && user.u_role < 5) ||
      (user.up_line > 0 && user.u_role > 4)
        ? "withdraw"
        : "deposit";
    let rmk =
      (user.up_line < 0 && user.u_role < 5) ||
      (user.up_line > 0 && user.u_role > 4)
        ? `Deposit to Pocket Of ${user.p_code}`
        : `Withdraw from Pocket Of ${user.p_code}`;
    this.setState({ modeltype: m_type, ptitle: rmk, modeluser: user });
    window.history.pushState({ dummyUrl: true }, null, null);
  };
  modelClose = (cls = "", msg = "", flag = false) => {
    if (!flag) window.history.go(-1);
    if (
      this.state.modeltype === "aduser" ||
      this.state.modeltype === "wd" ||
      this.state.modeltype === "withdraw" ||
      this.state.modeltype === "dp" ||
      this.state.modeltype === "deposit"
    ) {
      this.getAllUsers(this.state.flash_user);
      this.getProfile();
    }

    this.setState(
      {
        modeltype: false,
        mode: false,
        modeluser: false,
        message: msg,
        alertclass: cls,
      },
      () => {
        setTimeout(() => {
          this.setState({
            message: "",
          });
        }, 2000);
      }
    );
  };
  addUser = () => {
    this.setState({
      modeltype: "aduser",
      ptitle: "Add New User",
      modeluser: false,
    });
    window.history.pushState({ dummyUrl: true }, null, null);
  };

  changeUserSatus = (user, cstatus, flag, index) => {
    this.setState({
      cng_usr: true,
    });
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    const urlencoded = {
      user_id: user.id,
    };
    
    
    if (cstatus === "visible") {
      urlencoded.visible = flag;
    } else if (cstatus === "locked") {
      urlencoded.locked = flag;
    }
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };
    //fetch(import.meta.env.VITE_API_HOST + "/user/moduser", requestOptions)
    fetch(import.meta.env.VITE_API_HOST + "/user/changeStatus", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        let alertclass = 1;

        if (result && result.success) {
          let users = [...this.state.users];
          if (cstatus === "visible") {
            users[index].status = flag;
          } else if (cstatus === "locked") {
            users[index].bet_lock = flag;
          }
          this.setState({
            users: [...users],
          });
        } else {
          alertclass = 1;
        }
        this.setMessage(result.message, alertclass);
      })
      .finally(() => {
        setTimeout(() => {
          this.setState({
            cng_usr: false,
          });
        }, 3000);
      });
  };
  setMessage = (message, alertclass, time = 3000) => {
    this.setState(
      {
        message: message,
        alertclass: alertclass,
      },
      () => {
        setTimeout(() => {
          this.setState({
            message: "",
            alertclass: "",
          });
        }, time);
      }
    );
  };
  resetPassword = (user) => {
    if (!window.confirm("Resettin Password For " + user.p_code + "?")) {
      return;
    }
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
    let urlencoded = new URLSearchParams();
    if (user && user.id) {
      urlencoded.append("user_id", user.id);
    }
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
    };
    fetch(
      import.meta.env.VITE_API_HOST + "/user/resetpassword",
      requestOptions
    )
      .then((response) => {
        if (response.status === 401) {
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        this.setMessage(result.message, 1, 7000);
      });
  };
  handleMenuItemClick = (v) => {
    const { link, action } = v;
    if (typeof action === "function") {
      action.call(this, this.state.active_user);
    } else {
      const store = this.context;
      store.setItem("active_user", this.state.active_user);
      this.props.navigate(link);
    }
  };
  render() {
    const users = [...this.state.users];
    let usr = [];
    
    const store = this.context;
    if (users && users.length > 0) {
      usr = users.map((user, k) => (
        <tr
          key={k}
          className={`px-2 text-black ${
            k % 2 === 0
              ? "bg-light"
              : "bg-white"
          }`}
        >
          <td className="px-2 text-center">{k + 1}</td>

          <td
            className={`text-left kbr-sticky-col text-black`}>
            {user.u_role > 4 && (
              <button className="px-2 py-1 badge text-white bg-primary">
                C
              </button>
            )}
            {user.u_role === 4 && (
              <button className="px-2 py-1 badge text-white bg-success">
                M
              </button>
            )}
            {user.u_role === 3 && (
              <button className="px-2 py-1 badge text-white bg-success">
                SM
              </button>
            )}
            <span
              role="button"
              onClick={(e) => {
                this.setState({ flash_user: user }, () => {
                  this.getAllUsers(user);
                });
              }}
              title={user.name}
              className="p-1 badge badge-secondary"
            >
              {user.p_code}
            </span>
          </td>
          <td className="px-2 text-right">{user.name}</td>
          <td
            className={`px-2 text-right ${
              user.pl < 0
                ? "text-danger"
                : "text-success"
            }`}
          >
            {user.pl}
          </td>
          <td
            className={`px-2 text-right ${
              (user.up_line < 0 && user.u_role < 5) ||
              (user.up_line > 0 && user.u_role > 4)
                ? "text-danger"
                : "text-success"
            }`}
            onClick={() => {
              this.setPl(user);
            }}
          >
            <span
              role="button"
              className={`text-center w-10 py-1 px-2 rounded-full transition-all duration-300 ${
                (user.up_line < 0 && user.u_role < 5) ||
                (user.up_line > 0 && user.u_role > 4)
                  ? "text-danger"
                  : "text-success"
              }`}
            >
              {user.u_role < 5 ? user.up_line : user.up_line * -1}
            </span>
          </td>
          <td
            className={`px-2 text-right ${
              user.amount < 0
                ? "text-danger"
                : "text-success"
            }`}
          >
            {user.amount}
          </td>

          <td
           
            onClick={() => {
              this.setState({
                modaluser: user,
                exp: true,
              });
            }}
            className={`px-2 text-right ${
              user.exposer < 0
                ? "text-danger"
                : "text-success"
            }`}
          >
            {user.exposer}
          </td>
          <td className="text-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                this.changeUserSatus(user, "visible", !user.status, k);
              }}
              title={user.status ? "Active" : "Deactive"}
              className={`text-white border-0 ${
                user.status ? "bg-success" : "bg-danger"
              }`}
            >
              <UserCircleIcon className="w-6 p-1"></UserCircleIcon>
            </button>
          </td>
          

          <td className="text-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                this.changeUserSatus(user, "locked", !user.bet_lock, k);
              }}
              title={user.bet_lock ? "bet lock" : "bet unlock"}
              className={`text-white border-0 ${
                user.bet_lock ? "bg-danger" : "bg-success"
              }`}
            >
              <LockClosedIcon className="w-6 h-6 p-1"></LockClosedIcon>
            </button>
          </td>

          <td className="px-2 text-left">
            {/* <button
              className="bg-info"
              onClick={() => {
                this.setState({
                  showside: true,
                  active_user: user,
                  index: k,
                });
              }}
            >
              <CogIcon className="w-6 h-6"></CogIcon>
            </button> */}
            <div className="">
              {this.state.user_ids.length === 0 && (
                <React.Fragment>
                  <button
                    onClick={() => {
                      this.withDrawAmount(user);
                    }}
                    title="Withdraw Amount"
                    className="bg-info text-white text-center w-12 ml-2 px-2 border-0"
                  >
                    W
                  </button>
                  <button
                    onClick={() => {
                      this.dipositeAmount(user);
                    }}
                    title="Deposite Amount"
                    className="bg-info text-white text-center w-12 ml-2 px-2 border-0"
                  >
                    D
                  </button>
                  <button
                    onClick={() => {
                      this.changeSetting(user);
                    }}
                    title="Change Settings"
                    className="bg-info text-white text-center w-12 ml-2 px-2 border-0"
                  >
                    SS
                  </button>
                  <button
                    onClick={() => this.resetPassword(user)}
                    title="Reset Password"
                    className="bg-info text-white text-center w-12 ml-2 px-2 border-0"
                  >
                    R/P
                  </button>
                  <button
                    onClick={() => {
                      this.modeSetting(user);
                    }}
                    title="Mode Setting"
                    className="bg-info text-white text-center w-12 ml-2 px-2 border-0"
                  >
                    Mode
                  </button>
                </React.Fragment>
              )}
              <NavLink
                to={{
                  pathname: `${process.env.PUBLIC_URL}/report/accountstatement`,
                }}
                onClick={() => {
                  store.setItem("active_user", user);
                }}
                title="Account Statement"
                className="bg-info text-white text-center w-12 ml-2 px-2 border-0"
              >
                A/C
              </NavLink>
              <NavLink
                to={{
                  pathname: `${process.env.PUBLIC_URL}/report/profitloss`,
                }}
                onClick={() => {
                  store.setItem("active_user", user);
                }}
                title="Profit And Loss"
                className="bg-info text-white text-center w-12 ml-2 px-2"
              >
                P/L
              </NavLink>
            </div>
          </td>
          <td className="px-2 text-right">{user.remark}</td>
        </tr>
      ));
    }
    return (
      <React.Fragment>
        <div className="container-fluid content-report">
          
        <div className="p-0">
          
          <div className="p-0 float-left text-black dark:text-white">
            <div className="flex content-center">
              {this.state.user_ids.length > 0 && (
                <React.Fragment>
                  <button
                    title="go Back"
                    className="mt-1 btn btn-sm btn-theme shadow"
                    onClick={(e) => {
                      e.preventDefault();
                      this.getAllUsers(this.flash_user);
                    }}
                  >
                    <ArrowLeftCircleIcon className="w-6 h-6"></ArrowLeftCircleIcon>
                  </button>
                  <strong className="ml-2 h-6">{this.state.pname}</strong>
                </React.Fragment>
              )}
            </div>
          </div>
          <div className="flex content-center text-sm float-left">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                let user = {};
                user.uname = this.state.sw;
                user.type = "ser";
                this.getAllUsers(user);
              }}
            >
              <input
                type="search"
                required
                value={this.state.sw}
                onInput={(event) =>
                  this.setState(
                    {
                      sw: event.target.value,
                      flash_user: {},
                    },
                    () => {
                      if (!event.target.value) {
                        this.getAllUsers(this.state.flash_user);
                      }
                    }
                  )
                }
                placeholder="Search User"
                className="border-b border-blue-600 focus:border-blue-500 text-center text-primary-800 dark:text-white focus:bg-primary-100 dark:bg-primary-700 outline-none w-1/2"
              />
              <button
                type="submit"
                title="go for search"
                className="ml-2 btn btn-sm btn-theme shadow"
              >
                Go
              </button>
              {this.state.sw.length > 0 && (
                <button
                  type="reset"
                  onClick={(event) =>
                    this.setState(
                      {
                        sw: "",
                        flash_user: {},
                      },
                      () => {
                        this.getAllUsers(this.state.flash_user);
                      }
                    )
                  }
                  title="reset search"
                  className="ml-2 btn btn-sm btn-theme shadow"
                >
                  X
                </button>
              )}
            </form>
          </div>
          <div className="flex content-center text-sm float-right px-2">
            <label className="text-xs text-black dark:text-white leading-5">
              Add User
            </label>
            <button
              title="Add New User"
              type="button"
              className="ml-2 btn btn-sm btn-theme shadow"
              onClick={(e) => {
                this.addUser();
              }}
            >
              {" "}
              +
            </button>
          </div>
        </div>
        {this.state.modeltype && (
          <ModelPopup {...this.props} modelClose={this.modelClose} mtitle={this.state.ptitle} user={this.state.modeluser} modeltype={this.state.modeltype} />
        )}
        <h1 className="text-center text-success text-sm">
          <span className="mb-0 text-center text-sm">-: User List :-</span>
        </h1>

        <div className="table-responsive">
          <table className="table table-bordered table-striped table-sm report-table">
            <thead className="text-black bg-secondary">
              <tr>
                <th className="text-center px-2">SR.</th>
                <th className="text-left px-2">
                  User Name
                </th>
                <th className="text-right px-2">
                  Full Name
                </th>
                <th className="text-right px-2">P&L</th>
                <th className="text-right px-2">
                  General
                </th>
                <th className="text-right px-2">Balance</th>
                <th className="text-right px-2">Exposer</th>
                <th className="text-center px-2">
                  Status
                </th>
                <th className="text-center px-2">
                  Bet Lock
                </th>
                <th className="text-left px-2">Options</th>
                <th className="text-left px-2">Remark</th>
              </tr>
            </thead>
            <tbody>{usr.length > 0 && usr}</tbody>
          </table>
        </div>
        {/* {this.state.message && <React.Suspense fallback={""}><Message success={this.state.alertclass} message={this.state.message} /></React.Suspense>} */}
        {/* {this.state.exp && <React.Suspense fallback={""}><AllExpo updateExpo={this.getProfile} user={this.state.modaluser} closeBook={this.closeBook}></AllExpo></React.Suspense>} */}
        {this.state.loading && <Loader />}
        {this.state.showside && <DropdownFullPage menuItems={this.state.menu} selectedOption={"Details"}
          onMenuItemClick={(v) => {
            this.handleMenuItemClick(v)
            
          }}
          index={this.state.index}
          changeUserSatus={this.changeUserSatus}
          active_user={this.state.active_user}
          closeDropDown={this.closeDropDown}
        />}
        </div>
      </React.Fragment>
    );
  }
}

export default Users;
