import React, { useEffect, useState, useContext } from "react";
import StoreContext from "../../../Store";
//import Message from '../../../components/Message'
import { amountFormate, mapColor, priceToWords } from "../../../utilities/Util";
//import Loader from '../../../utilities/Loader'
import Loader from "../../../utilities/Loader";
import {
  EyeIcon,
  LockClosedIcon,
  ArrowLeftCircleIcon,
  UserCircleIcon,
  CogIcon,
} from "@heroicons/react/24/solid";

const UserSettingPopup = React.lazy(() => import("./UserSettingPopup"));
const CreateParty = React.lazy(() => import("./CreateParty"));
//const CreateParty = React.lazy(() => import("./AddUserPopup"));
const WithdrawAndDeposite = React.lazy(() => import("./WithdrawAndDeposite"));
const SetPl = React.lazy(() => import("./SetPl"));
const ChangeUserMode = React.lazy(() => import("./ChangeUserMode"));

const PartyList = (props) => {
  const store = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const [userList, setList] = useState([]);
  const [create, setCreate] = useState(false);
  const [f_setting, setFsett] = useState(false);
  const [f_with, setFwith] = useState(false);
  const [t_type, setTtype] = useState("deposit");
  const [f_mode, setFmode] = useState(false);
  const [message, setMessage] = useState();
  const [f_pl, setFpl] = useState(false);
  const [errorClass, setErrorClass] = useState("alert alert-success");
  const [a_usr, setActiveUser] = useState(null);

  const closeModal = async (m, c) => {
    setMessage(m);
    setTimeout(() => {
      setMessage("");
    }, 3000);
    setErrorClass(c);
    setFsett(false);
    setCreate(false);
    setFwith(false);
    setFmode(false);
    setFpl(false);
    getUsers();
    setActiveUser(null);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const mapRole = (r) => {
    let rn = "USER";
    if (r === 7) rn = "Operator";
    if (r === 2) rn = "ADMIN";
    if (r === 3) rn = "M";
    if (r === 4) rn = "SM";
    if (r === 5) rn = "C";
    return rn;
  };

  const getUsers = async () => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    let requestOptions = {
      method: "POST",
      headers: headers,
    };

    fetch(import.meta.env.VITE_API_HOST + "/user/getusers", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.data) setList(result.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const resetPwd = async (p_code) => {
    if (!window.confirm(`resetting password for ${p_code} ?`)) return;
    const urlencoded = {
      email: p_code,
    };
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(
      import.meta.env.VITE_API_HOST + "/user/resetpassword",
      requestOptions
    )
      .then((response) => {
        if (response.status === 401) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result) {
          setErrorClass("alert alert-success");
          setMessage(result.message);
          setTimeout(() => {
            setMessage("");
          }, 3000);
        }
      })
      .catch((err) => {
        setMessage(err);
        setErrorClass("alert alert-danger");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const lockUser = async (flag, type, user_id, index) => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

    const urlencoded = {
      user_id: user_id,
    };

    if (type === "visible") {
      urlencoded.visible = flag;
    } else if (type === "locked") {
      urlencoded.locked = flag;
    }

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/user/changeStatus", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.message) {
          let rn = [...userList];
          if (type === "visible") {
            rn[index].status = flag;
          } else if (type === "locked") {
            rn[index].bet_lock = flag;
          }
          setMessage(result.message);
          setErrorClass("alert alert-success");
        }
      })
      .catch((err) => {
        setMessage(err);
        setErrorClass("alert alert-danger");
      })
      .finally(async () => {
        setTimeout(() => {
          setErrorClass("");
          setMessage("");
        }, 3000);
        setLoading(false);
      });
  };

  return (
    <>
      <div className="row pt-2 pb-1">
        <div className="col">
          {/* <h3 className="text-center text-light">- : USER LIST : -</h3> */}
          <button
            onClick={() => {
              setFsett(true);
            }}
            className="btn btn-sm btn-outline-info float-right"
          >
            SET
          </button>
          <button
            onClick={() => {
              setCreate(true);
            }}
            className="btn btn-sm btn-secondary shadow float-right"
          >
            ADD New User(+)
          </button>
        </div>
      </div>
      <div className="row">
        <div className="col-12 p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-sm table-warning shadow align-middle kbr-table">
              <thead className="">
                <tr>
                  <th width="5%" className="text-center px-2 py-0.5">
                    Sr.
                  </th>
                  <th className="px-2 py-1 text-center">Name</th>
                  <th className="px-2 py-1 text-center kbr-sticky-col">
                    USER ID
                  </th>
                  <th className="px-2 py-1 text-center">Role</th>
                  <th className="px-2 py-1 text-right">Upline</th>
                  <th className="px-2 py-1 text-right">Amount</th>
                  <th className="px-2 py-1 text-center">Part</th>
                  <th className="px-2 py-1 text-center">Status</th>
                  <th className="px-2 py-1 text-center">Bet Lock</th>
                  <th className="px-2 py-1 text-center">Action</th>
                  <th className="px-2 py-1 text-right">Remark</th>
                </tr>
              </thead>
              <tbody>
                {userList &&
                  userList.map((v, k) => (
                    <tr key={k}>
                      <td className="text-center px-2 py-1" width={"5%"}>
                        {k + 1}
                      </td>
                      <td className="px-2 py-0.5 nowrap text-center">
                        {v.name}
                      </td>
                      <td className="text-center px-2 py-0.5 kbr-sticky-col">
                        {" "}
                        {v.p_code}
                      </td>
                      <td className="text-center px-2 py-0.5">
                        <span
                          role="button"
                          title={mapRole(v.u_role, v.cutting)}
                          className={`px-2 py-1 ${mapColor(v.u_role)}`}
                        >
                          {mapRole(v.u_role)}
                        </span>
                      </td>

                      <td className="px-2 py-0.5 text-success text-right">
                        <button
                          className={
                            v.up_line >= 0
                              ? "btn btn-sm btn-success"
                              : "btn btn-sm btn-danger"
                          }
                          title={v.up_line}
                          onClick={() => {
                            let type =
                              parseInt(v.up_line) < 0 ? `withdraw` : `deposit`;
                            setTtype(type);
                            setFpl(true);
                            setActiveUser(v);
                          }}
                        >
                          {v.up_line != null
                            ? Number(v.up_line).toFixed(2)
                            : "0.00"}
                        </button>
                      </td>
                      <td className="px-2 py-0.5 text-success text-right">
                        <button
                          className={
                            v.amount > 0
                              ? "btn btn-sm btn-success"
                              : "btn btn-sm btn-danger"
                          }
                          title={v.amount}
                        >
                          {v.amount != null
                            ? Number(v.amount).toFixed(2)
                            : "0.00"}
                        </button>
                      </td>
                      <td className="px-2 py-0.5 text-success text-center">
                        {v.part}%
                      </td>
                      <td className="text-center px-2 py-0.5">
                        <button
                          title="Status lock"
                          onClick={async () => {
                            await lockUser(
                              v.status === null ? false : !v.status,
                              "visible",
                              v.id,
                              k
                            );
                          }}
                          className={`btn btn-sm ${
                            v.status === null || Boolean(v.status) === true
                              ? "btn-success"
                              : "btn-danger"
                          }`}
                        >
                          {`${
                            v.status === null || Boolean(v.status) === true
                              ? ""
                              : ""
                          }`}
                          <UserCircleIcon className="w-6"></UserCircleIcon>
                        </button>
                      </td>
                      <td className="text-center px-2 py-0.5">
                        <button
                          title="Bet lock"
                          onClick={async () => {
                            await lockUser(
                              v.bet_lock === null ? false : !v.bet_lock,
                              "locked",
                              v.id,
                              k
                            );
                          }}
                          className={`btn btn-sm ${
                            v.bet_lock === null || Boolean(v.bet_lock) === true
                              ? "btn-success"
                              : "btn-danger"
                          }`}
                        >
                          {`${
                            v.bet_lock === null || Boolean(v.bet_lock) === true
                              ? ""
                              : ""
                          }`}
                          <LockClosedIcon className="w-6"></LockClosedIcon>
                        </button>
                      </td>
                      <td className="text-center nowrap">
                        <>
                          <button
                            title="withdraw"
                            onClick={() => {
                              setTtype("withdraw");
                              setFwith(true);
                              setActiveUser(v);
                            }}
                            className="btn btn-sm btn-info ml-1 shadow"
                          >
                            W
                          </button>
                          <button
                            title="deposit"
                            onClick={() => {
                              setTtype("deposit");
                              setFwith(true);
                              setActiveUser(v);
                            }}
                            className="btn btn-sm btn-info ml-1 shadow"
                          >
                            D
                          </button>
                          <button
                            title="user settings"
                            onClick={() => {
                              setFsett(true);
                              setActiveUser(v);
                            }}
                            className="btn btn-sm btn-info ml-1 shadow"
                          >
                            SS
                          </button>
                          <button
                            title="mode change"
                            onClick={() => {
                              setFmode(true);
                              setActiveUser(v);
                            }}
                            className="btn btn-sm btn-info ml-1 shadow"
                          >
                            Mode
                          </button>
                          <button
                            onClick={async () => {
                              await store.setItem("active_user", v);
                              props.navigate("/ac");
                            }}
                            title="account statement"
                            className="btn btn-sm btn-info ml-1 shadow"
                          >
                            A/C
                          </button>
                          <button
                            onClick={async () => {
                              await store.setItem("active_user", v);
                              props.navigate("/pl");
                            }}
                            title="profit loss"
                            className="btn btn-sm btn-info ml-1 shadow"
                          >
                            P/L
                          </button>
                        </>
                        <button
                          title="reset password"
                          onClick={() => {
                            resetPwd(v.p_code);
                          }}
                          className="btn btn-sm btn-danger ml-1 shadow"
                        >
                          R/P
                        </button>
                      </td>
                      <td className="text-right px-2 py-0.5 nowrap">
                        {v.remark}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {create && (
        <React.Suspense fallback={<Loader></Loader>}>
          <CreateParty closeModal={closeModal}></CreateParty>
        </React.Suspense>
      )}
      {f_with && (
        <React.Suspense fallback={<Loader></Loader>}>
          <WithdrawAndDeposite
            user={a_usr}
            closeModal={closeModal}
            t_type={t_type}
          />
        </React.Suspense>
      )}
      {f_mode && (
        <React.Suspense fallback={<Loader></Loader>}>
          <ChangeUserMode user={a_usr} closeModal={closeModal} />
        </React.Suspense>
      )}
      {f_setting && (
        <React.Suspense fallback={<Loader></Loader>}>
          <UserSettingPopup user={a_usr} closeModal={closeModal} />
        </React.Suspense>
      )}
      {f_pl && (
        <React.Suspense fallback={<Loader></Loader>}>
          <SetPl user={a_usr} closeModal={closeModal} t_type={t_type} />
        </React.Suspense>
      )}
      {/* {message && <Message message={message} alertclass={errorClass}></Message>} */}
      {loading && <Loader></Loader>}
    </>
  );
};

export default PartyList;
