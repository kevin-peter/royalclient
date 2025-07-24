//import React from "react";
import React, { useEffect, useState, useContext } from "react";

class AllExpo extends React.Component {
  constructor() {
    super();
    this.state = {
      showModal: true,
      expo_data: [],
      title: "",
    };
  }

  getExposure() {
    //const getExposure = () => {
    let urlencoded = new URLSearchParams();
    urlencoded.append("event", "all");
    if (this.props.user && this.props.user.u_id) {
      urlencoded.append("user_id", this.props.user.u_id);
    }
    fetch(import.meta.env.VITE_API_HOST + "/event/getExposerTable", {
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
              window.location.href = import.meta.env.PUBLIC_URL + "/login";
            }
          );
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result && result.data) {
          this.setState({
            expo_data: result.data,
            //bal: result.data.bal,
            // title: this.props.user ? this.props.user.u_name : ''
          });
        }
        // if (result && result.data
        //   && result.data.events.length === 0
        //   && this.props.user
        //   && this.props.user.u_id
        //   && this.props.updateExpo) {
        //   this.props.updateExpo(this.props.user.u_id)
        // }
      });
  }

  componentDidMount() {
    this.getExposure();
    // const intervalId = setInterval(() => {
    //   this.getExposure();
    // }, 5000);

    // return () => {
    //   clearInterval(intervalId);
    // };
  }

  render() {
    let ALL_EXP = "";
    if (this.state.expo_data && this.state.expo_data.length > 0) {
      ALL_EXP = this.state.expo_data.map((v, k) => (
        <tr key={k}>
          <td className="text-center">{v.event_name}</td>
          <td className="text-center">{v.event_type}</td>
          <td
            className={
              "text-right " + (v.exp < 0 ? "text-danger" : "text-success")
            }
          >
            {v.exp ? parseInt(v.exp) : ""}
          </td>
          <td className={"text-center text-success"}>{v.trades.length}</td>
        </tr>
      ));
    } else {
      ALL_EXP = [0].map((v, k) => (
        <tr key={k}>
          <td className="text-center" colSpan="3">
            No Data Found
          </td>
        </tr>
      ));
    }
    return (
      <div className="custom-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header book-header">
              <h5 className="modal-title">ALL EXPOSER</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span onClick={this.props.closeBook} aria-hidden="true">
                  ×
                </span>
              </button>
            </div>
            <div className="modal-body p-0">
              <table className="table table-sm table-odds">
                <thead>
                  <tr className="row-header-betlist">
                    <th className="text-center">EVENT NAME</th>
                    <th className="text-center">EVENT TYPE</th>
                    <th className="text-right">EXPOSER</th>
                    <th className="text-center">Trades (Markets)</th>
                  </tr>
                </thead>
                {ALL_EXP.length > 0 && <tbody>{ALL_EXP}</tbody>}
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default AllExpo;
