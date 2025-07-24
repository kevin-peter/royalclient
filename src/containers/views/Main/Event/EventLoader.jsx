import React from "react";
import { FiLock } from "react-icons/fi";
import { IoMdArrowBack } from "react-icons/io";
import "./../../../../css/eventpage.css";
class EventLoader extends React.Component {
  render() {
    let E_T = [0].map((v, k) => (
      <table className="table table-sm table-odds" key={0}>
        <thead>
          <tr className="text-center">
            <th width="60%" className="eventtype">
              ...
              <button className="btn book-btn btn-theme float-right">
                B
              </button>
            </th>
            <th width="20%" className="back">
              Back
            </th>
            <th className="lay">Lay</th>
          </tr>
        </thead>
        <tbody>
          <tr key={0}>
            <td className="runner">
              20 over Run Line
              <br />
              <small className="bold text-success"> 0 </small>
            </td>
            <td className="back">
              0
              <br />
              <span className="size">0</span>
              <span className="lock">
                <FiLock></FiLock>
              </span>
            </td>
            <td className="lay">
              0
              <br />
              <span className="size">0</span>
              <span className="lock">
                <FiLock></FiLock>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    ));

    let MATCH_ODDS = [0].map((v, k) => (
      <tr key={0}>
        <td className="runner" width="60%">
          ...
          <br />
          <small className="bold text-green">0</small>
        </td>
        <td className="back" width="20%">
          0
          <span className="lock">
            <FiLock></FiLock>
          </span>
          <br />
          <span className="size">0</span>
        </td>
        <td className="lay" width="20%">
          0
          <span className="lock">
            <FiLock></FiLock>
          </span>
          <br />
          <span className="size">0</span>
        </td>
      </tr>
      
    ));
    let LINE_SESSION = [0].map((v, k) => (
      <tr key={k}>
        <td className="runner" width="60%">
          ...
          <button className="btn book-btn btn-theme float-right">B</button>
          <br />
          <button className="btn btn-sm btn-postion">-1000</button>
        </td>
        <td className="lay" width="20%">
          0
          <br />
          <span className="size">0</span>
        </td>
        <td
          className="back"
          width="20%"
        >
          <span className="lock">
            <FiLock></FiLock>
          </span>

          <br />
          <span className="size">0</span>
        </td>
      </tr>
    ));

    return (
      <React.Fragment>
        <div className="header-bg theme-show">
          <nav className="header-nav">
            <span title="Back" className="btn-back ull-left">
              {" "}
              <IoMdArrowBack></IoMdArrowBack>
            </span>
            <div className="marquee">
              <marquee>Welcome To JECKPOT...</marquee>
            </div>
          </nav>
        </div>
        <div className="container-fluid">
          <div className="row">
            <div className="mo col-md-4 p-0 theme-shadow">
              <table className="table table-sm table-odds">
                <thead>
                  <tr className="event-title">
                    <th colSpan="3">...</th>
                  </tr>
                  <tr className="text-center">
                    <th className="eventtype">
                      Match Odds
                      <button className="btn book-btn btn-theme float-right">
                        B
                      </button>
                    </th>
                    <th className="back">Back</th>
                    <th className="lay">Lay</th>
                  </tr>
                </thead>
                <tbody>{MATCH_ODDS}{MATCH_ODDS}</tbody>
              </table>
              {LINE_SESSION && (
                <table className="table table-sm table-odds">
                  <thead>
                    <tr className="text-center">
                      <th className="eventtype">Line Session</th>
                      <th className="back">No</th>
                      <th className="lay">Yes</th>
                    </tr>
                  </thead>
                  <tbody>{LINE_SESSION}</tbody>
                </table>
              )}
              {E_T}
              <table className="table table-sm table-odds">
                <thead>
                  <tr className="text-center">
                    <th colSpan="5" className="eventtype">
                      Matched Bet List
                    </th>
                  </tr>
                  <tr className="row-header-betlist">
                    <th>Runner</th>
                    <th>Rate</th>
                    <th className="text-right">Stake</th>
                    <th className="text-center">P/L</th>
                    <th className="text-center">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr key={0} className="row-betlist back">
                    <td>...</td>
                    <td>2.0</td>
                    <td className="text-right">50000</td>
                    <td className="text-center"></td>
                    <td className="text-center">12-12-2020</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export default EventLoader;
