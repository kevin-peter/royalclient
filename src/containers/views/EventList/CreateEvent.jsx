import React, { useState, useContext } from "react";
import Modal from "../../../components/Model";
import StoreContext from "../../../Store";

const defaultDate = () => {
  return `${new Date().getFullYear()}-${`${new Date().getMonth() + 1}`.padStart(
    2,
    0
  )}-${`${new Date().getDate()}`.padStart(
    2,
    0
  )}T${`${new Date().getHours()}`.padStart(
    2,
    0
  )}:${`${new Date().getMinutes()}`.padStart(2, 0)}`;
};

const CreateEvent = (props) => {
  let txtInp = null;

  //console.log(props)
  /** statue for Add new user */
  const store = useContext(StoreContext);
  const [eventname, setEventName] = useState(props.title);
  const [eventid, setEventId] = useState(props.event_id);
  const [marketid, setMarketId] = useState(props.market_id);
  // const [opendate, setOpenDate] = useState(defaultDate());
  // const [closedate, setCloseDate] = useState(defaultDate());
  const [opendate, setOpenDate] = useState(props.event_id ? props.opendate : defaultDate());
  const [closedate, setCloseDate] = useState(props.event_id ? props.closedate : defaultDate());
  const [weakTeam, setWeakTeam] = useState(0);
  const [maxrunner, setMaxRunner] = useState(2);
  const [m_type, setMtype] = useState("OneDay");

  const [team1, setTeam1] = useState(props.team1);
  const [team2, setTeam2] = useState(props.team2);

  const [runners, setRunners] = useState([
    {
      selectionId: 1,
      runnerName: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setMessage] = useState("");

  const [errorClass, setErrorClass] = useState("alert alert-success");

  const resetForm = () => {
    setTeam1("");
    setTeam2("");
    setEventName("");
    setOpenDate(defaultDate());
    setCloseDate(defaultDate());
    setWeakTeam(0)
    setMaxRunner(2);
    setEventId("");
    txtInp.focus();
    setRunners([
      {
        selectionId: 1,
        runnerName: "",
      },
    ]);
  };

  const addRunner = (k, v) => {
    const rn = [...runners];
    if (k + 1 === runners.length && maxrunner > runners.length) {
      rn.push({
        selectionId: rn.length + 1,
        runnerName: v,
      });
    }
    rn[k].runnerName = v;
    setRunners(rn);
  };

  const addEvent = (e) => {
    e.preventDefault();
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

    const urlencoded = {
      event_name: team1 + " VS " + team2,
      //"event_id": eventid,
      team1: team1,
      team2: team2,
      opendate: opendate,
      closedate: closedate,
      weak_team: weakTeam,

      status: 1,
      m_type: m_type,
      runners: [...runners],
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/setting/addevent", requestOptions)
      .then((response) => {
        if (!response.ok) {
          setErrorClass("alert alert-danger");
        } else {
          setErrorClass("alert alert-success");
          resetForm();
        }
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        setMessage(result.message);
        setTimeout(() => {
          setMessage("");
        }, 3000);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const updateEvent = async (e) => {
    e.preventDefault();
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

    const urlencoded = {
      event_name: team1 + " VS " + team2,
      team1: team1,
      team2: team2,
      event_id: eventid,
      market_id: marketid,
      opendate: opendate,
      closedate: closedate,
      status: 1,
      m_type: m_type,
      runners: [...runners],
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/setting/updateEvent", requestOptions)
      .then((response) => {
        if (!response.ok) {
          setErrorClass("alert alert-danger");
        } else {
          setErrorClass("alert alert-success");
          resetForm();
        }
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        setMessage(result.message);
        setTimeout(() => {
          setMessage("");
        }, 3000);
        setLoading(false);
        props.closeModal();
      })
      .catch(() => {
        setLoading(false);
      });
  };

  //console.log(weakTeam)

  return (
    <Modal
      closeModal={props.closeModal}
      title={props.event_id ? "EDIT EVENT " + props.title : "CREATE NEW EVENT"}
    >
      <div className="model-table-content">
        <form
          className="my-1 text-left align-middle"
          autoComplete={"off"}
          onSubmit={props.event_id ? updateEvent : addEvent}
        >
          <div className="grid grid-cols-12 gap-1">
            <div className="form-group mt-1">
              <label className="float-start col-12 col-md-2 ">Team-1</label>
              <input
                placeholder="Team-1"
                type="text"
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                maxLength="50"
                required
                ref={(tx) => {
                  txtInp = tx;
                }}
              />
            </div>

            <div className="form-group mt-1">
              <label className="float-start col-12 col-md-2 ">Team-2</label>
              <input
                placeholder="Team-2"
                type="text"
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
                maxLength="50"
                required
                ref={(tx) => {
                  txtInp = tx;
                }}
              />
            </div>

            <div className="form-group mt-1">
              <label className="float-start col-12 col-md-2 ">Event Name</label>
              <input
                placeholder="Event Name"
                type="text"
                value={team1 + " VS " + team2}
                onChange={(e) => setEventName(e.target.value)}
                maxLength="50"
                required
                ref={(tx) => {
                  txtInp = tx;
                }}
                readOnly
                disabled
              />
            </div>

            {!props.event_id && (
            <div className="form-group mt-1">

              <label className="float-start col-12 col-md-2 ">Weak Team</label>
             
              <div className="form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="w_team"
                  id="w_team1"
                  value={1}
                  onChange={(e) => setWeakTeam(e.target.value)}
                />
                <label className="form-check-label" htmlFor="w_team1">
                  {team1 ? team1 : "Team1"}
                </label>
              </div>

              <div className="form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="w_team"
                  id="w_team2"
                  value={2}
                  onChange={(e) => setWeakTeam(e.target.value)}
                />
                <label className="form-check-label" htmlFor="w_team2">
                  {team2 ? team2 : "Team2"}
                </label>
              </div>

              <div className="form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="w_team"
                  id="w_none"
                  value={0}
                  onChange={(e) => setWeakTeam(e.target.value)}
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="flexRadioDefault1">
                 None
                </label>
              </div>

              <label className="col-12 col-md-2 ">(Optional IF)</label>
            </div>
            ) }
            {/* <div className="form-group mt-1">
            <label className='float-start col-12 col-md-2 '>Event ID</label>
            <input
              placeholder="Event Id"
              type="number"
              value={eventid}
              onChange={e => setEventId(e.target.value)}
              maxLength="50"
              required
            />
          </div> */}
          {!props.event_id && (
            <div className="form-group mt-1">
              <label className="float-start col-12 col-md-2 ">Event Type</label>
              <select
                name="userstype"
                value={m_type}
                required
                onChange={(e) => {
                  setMtype(e.target.value);
                }}
              >
                <option value={"Ten"}>Ten</option>
                <option value={"Twenty"}>Twenty</option>
                <option value={"OneDay"}>OneDay</option>
                <option value={"Test"}>Test</option>
                <option value={"One"}>SuperOver</option>
              </select>
            </div>
            ) }
            {!props.event_id && runners.map((v, k) => (
              <div className="form-group mt-1" key={k}>
                <label className="float-start col-12 col-md-2 ">
                  Runner Name
                </label>
                <input
                  maxLength="100"
                  required
                  placeholder="Runner Name"
                  type="text"
                  value={v.runnerName}
                  onChange={(e) => {
                    let go_c = false;
                    for (let z = k; z > 0; z--) {
                      if (
                        k > 0 &&
                        runners[k - z].runnerName.charAt(0) === e.target.value
                      ) {
                        addRunner(k, "");
                        go_c = true;
                      }
                    }
                    if (!go_c) addRunner(k, e.target.value);
                  }}
                  onFocus={() => addRunner(k, "")}
                  className="uppercase"
                />
              </div>
            ))}
            <div className="form-group mt-1">
              <label className="float-start col-12 col-md-2 ">
                Event Start Time
              </label>
              <input
                placeholder="Start Time"
                type="datetime-local"
                value={opendate}
                onChange={(e) => setOpenDate(e.target.value)}
                maxLength="5"
                required
              />
            </div>
            <div className="form-group mt-1">
              <label className="float-start col-12 col-md-2 ">
                Event End Time
              </label>
              <input
                placeholder="End Time"
                type="datetime-local"
                value={closedate}
                onChange={(e) => setCloseDate(e.target.value)}
                maxLength="5"
                required
              />
            </div>
            <div className="clear-both h-0 col-span-12" />
            <div className="form-group mt-1">
              <button
                title="Create User"
                type="submit"
                disabled={loading}
                className="btn btn-sm btn-theme"
              >
               {props.event_id ? 'Update' : 'Create'}
              </button>
              <button
                className="btn btn-sm btn-danger float-end"
                onClick={props.closeModal}
              >
                Cancel
              </button>
            </div>
            <div className="col-span-8 md:col-span-10 text-center">
              {error && (
                <span className={`px-2 py-1 bg-primary-900 ${errorClass} `}>
                  {error}
                </span>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
export default CreateEvent;
