import React, { Component } from "react";

class Buttons extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggenin: true,
            current_password: "",
            new_password: "",
            new_confirm_password: "",
            no_error: "",
            btn_disable: false,
            message: "",
            btns: [],
        };
    }
    componentDidMount() {
        this.getButtons();
    }
    handleClick = (e) => {
        e.preventDefault();
        this.setState({
            btn_disable: true,
        });
        var urlencoded = new URLSearchParams();
        for (let i = 0; i < this.state.btns.length; i++) {
            urlencoded.append("lbl" + (i + 1), this.state.btns[i]["b_name"]);
            urlencoded.append("val" + (i + 1), this.state.btns[i]["b_value"]);
        }

        fetch(import.meta.env.VITE_API_HOST + "/updateButton", {
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
                                message: result.message
                            },
                            () => {
                                localStorage.setItem("btns", JSON.stringify(this.state.btns))
                                setTimeout(() => {
                                    this.setState({
                                        message: "",
                                        no_error: ""
                                    })
                                }, 2000);
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
    getButtons() {
        fetch(import.meta.env.VITE_API_HOST + "/buttons", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            method: "POST",
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
                    btns: result.data ? result.data : [],
                }, () => {
                    localStorage.setItem("btns", JSON.stringify(result.data))
                });
            })
    }
    handleLblChange(k, type, event) {
        let values = [...this.state.btns];
        values[k][type] = event.target.value;
        this.setState({
            btns: values
        });
    }
    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
                        <div className="card rounded shadow my-2">
                            <div className="card-body p-2">
                                <h6 className="card-title text-center mb-1">Change Buttons</h6>
                                <hr />
                                <form
                                    onSubmit={(e) => this.handleClick(e)}
                                    className="form-signin"
                                >
                                    <table className='table table-sm'>
                                        <tbody>
                                            {this.state.btns.map((v, k) => (
                                                <tr key={k}>
                                                    <td>
                                                        <input
                                                            className="form-control"
                                                            value={this.state.btns[k].b_name}
                                                            type="text"
                                                            onChange={this.handleLblChange.bind(this, k, 'b_name')}

                                                        /></td>
                                                    <td>
                                                        <input
                                                            className="form-control"
                                                            value={this.state.btns[k].b_value}
                                                            type="text"
                                                            onChange={this.handleLblChange.bind(this, k, 'b_value')}

                                                        /></td>
                                                </tr>))
                                            }
                                        </tbody>
                                    </table>
                                    {this.state.no_error && (
                                        <div
                                            className="mt-3 alert alert-success alert-dismissible fade show"
                                            role="alert"
                                        >
                                            {this.state.message}
                                            <br />
                                        </div>
                                    )}
                                    <button type="submit" className="btn btn-lg btn-theme btn-block text-uppercase" value="Submit">Submit</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Buttons;