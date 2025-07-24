import React, { Component } from "react";

export default class ChanagePwd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggenin: true,
      current_password: "",
      new_password: "",
      new_confirm_password: "",
      no_error: "",
      btn_disable: false,
      message: ""
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
  componentDidMount() {
    this.setState({
      mindate: this.setDate(
        new Date(new Date().setDate(new Date().getDate() - 90))
      ),
    });
  }
  handleClick = (e) => {
    e.preventDefault();
    this.setState({
      btn_disable: true,
    });
    var urlencoded = new URLSearchParams();

    urlencoded.append("current_password", this.state.current_password);
    urlencoded.append("new_password", this.state.new_password);
    urlencoded.append("new_confirm_password", this.state.new_confirm_password);

    fetch(import.meta.env.VITE_API_HOST + "/changepassword", {
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
        if (result && result.message) {
          if (result.success) {
            this.setState(
              {
                no_error: true,
                new_password: "",
                current_password: "",
                new_confirm_password: "",
                message: result.message
              },
              () => {
                setTimeout(() => {
                  window.location.href = process.env.PUBLIC_URL + "/login";
                }, 1000);
              }
            );
          } else {
            this.setState({
              has_error: true,
              new_password: "",
              current_password: "",
              new_confirm_password: "",
              btn_disable: false,
              message: result.message
            });
          }
        }
      })
      .catch((e) => {
        this.setState({
          has_error: true,
          new_password: "",
          current_password: "",
          new_confirm_password: "",
          btn_disable: false,
        });
      });
  };
  render() {
    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
              <div className="card rounded shadow my-5">
                <div className="card-body">
                  <h5 className="card-title text-center">Change Password</h5>
                  <hr />
                  <form
                    onSubmit={(e) => this.handleClick(e)}
                    className="form-signin"
                  >
                    <div className="form-label-group">
                      <input
                        id="cp"
                        type="password"
                        className="form-control"
                        placeholder="Current Password"
                        autoFocus
                        required
                        value={this.state.current_password}
                        onChange={(event) => {
                          this.setState({
                            current_password: event.target.value,
                            has_error: false,
                          });
                        }}
                      />
                      <label htmlFor="cp">Old Password</label>
                    </div>
                    <div className="form-label-group">
                      <input
                        id="np"
                        type="password"
                        className="form-control"
                        placeholder="New Password"
                        required
                        value={this.state.new_password}
                        onChange={(event) => {
                          this.setState({
                            new_password: event.target.value,
                            has_error: false,
                          });
                        }}
                      />
                      <label htmlFor="np">New Password</label>
                    </div>
                    <div className="form-label-group">
                      <input
                        id="ncp"
                        type="password"
                        className="form-control"
                        placeholder="Confirm Password"
                        required
                        value={this.state.new_confirm_password}
                        onChange={(event) => {
                          this.setState({
                            new_confirm_password: event.target.value,
                          });
                        }}
                      />
                      <label htmlFor="ncp">Confirm Password</label>
                    </div>

                    <button
                      className="btn btn-lg btn-theme btn-block text-uppercase"
                      type="submit"
                      disabled={this.state.btn_disable}
                    >
                      Change Password
                    </button>
                    {this.state.has_error && (
                      <div
                        className="mt-3 alert alert-danger alert-dismissible fade show"
                        role="alert"
                      >
                        {this.state.message}
                      </div>
                    )}
                    {this.state.no_error && (
                      <div
                        className="mt-3 alert alert-success alert-dismissible fade show"
                        role="alert"
                      >
                        Password Change SuccessFully Please Relogin!!
                        <br />
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
