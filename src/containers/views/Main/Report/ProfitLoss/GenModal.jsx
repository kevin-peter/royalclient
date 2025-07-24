import React from "react";

class GenModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            ac_data: [],
        };
    }
    componentDidMount() {
        this.getAcGen(this.props.event_id, this.props.mode_id)
    }
    getAcGen = (event_id, mode_id, uid = '') => {
        let headers = new Headers();
        headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
        let urlencoded = new URLSearchParams();
        urlencoded.append("event_id", event_id);
        urlencoded.append("mode_id", mode_id);
        if (this.props.market_id) {
            urlencoded.append("market_id", this.props.market_id);
        }
        if (this.props.uid) {
            urlencoded.append("uid", this.props.uid);
        }

        urlencoded.append("limit", 500);
        let requestOptions = {
            method: "POST",
            headers: headers,
            body: urlencoded,
            redirect: "follow",
        };
        fetch(import.meta.env.VITE_API_HOST + "/getacdetail", requestOptions)
            .then((response) => {
                if (response.status === 401) {
                    window.location.href = process.env.PUBLIC_URL + "/login";
                } else {
                    return response.json();
                }
            })
            .then((result) => {
                if (result && result.data) {
                    this.generalFilter(result.data);
                    if (result.data.parent.length > 0) {
                        localStorage.setItem("bal", result.data.parent[0].amount)
                    }
                }
            });
    };

    generalFilter = (data) => {
        let ac_data = [];
        let sum = 0;

        let p_ttl = 0;
        let l_ttl = 0;

        for (let i = 0; i < data.childs.length; i++) {
            let pl = parseFloat(data.childs[i].pl);
            if (pl !== 0) {
                ac_data.push({
                    lname: (pl < 0) ? data.childs[i].u_name : "",
                    loss: (pl < 0) ? pl.toFixed(2) : "",
                    pname: (pl > 0) ? data.childs[i].u_name : "",
                    profit: (pl > 0) ? pl.toFixed(2) : "",
                    client: true,
                    amount: data.childs[i].amount,
                    uid: data.childs[i].u_id,
                });
                sum += pl;
                p_ttl = (pl > 0) ? p_ttl + pl : p_ttl;
                l_ttl = (pl < 0) ? l_ttl + pl : l_ttl;
            }
        }

        for (let i = 0; i < data.parent.length; i++) {
            let pl = parseFloat(data.parent[i].pl);
            if (pl !== 0) {
                ac_data.push({
                    lname: (pl < 0) ? "Up Line" : "",
                    loss: (pl < 0) ? pl.toFixed(2) : "",
                    pname: (pl > 0) ? "Up Line" : "",
                    profit: (pl > 0) ? pl.toFixed(2) : "",
                    client: false,
                });
                p_ttl = (pl > 0) ? p_ttl + pl : p_ttl;
                l_ttl = (pl < 0) ? l_ttl + pl : l_ttl;
                sum += pl;
            }
        }

        ac_data.push(
            {
                lname: (sum > 0) ? "SRI A/c" : "",
                loss: (sum > 0) ? ((-1) * sum).toFixed(2) : "",
                pname: (sum < 0) ? "SRI A/c" : "",
                profit: (sum < 0) ? (sum * (-1)).toFixed(2) : "",
                client: false
            },
            {
                lname: "-: TOTAL : -",
                loss: (sum > 0) ? (l_ttl + (sum * (-1))).toFixed(2) : l_ttl.toFixed(2),
                pname: "-: TOTAL : -",
                profit: (sum < 0) ? (p_ttl + (sum * (-1))).toFixed(2) : p_ttl.toFixed(2),
                client: false
            }
        );

        this.setState({
            loading: false,
            ac_data: ac_data
        })

    }


    render() {
        let ac_data = [];
        if (this.state.ac_data.length > 0) {
            ac_data = this.state.ac_data.map((v, k) => (
                <tr key={k}>
                    <td
                        className={`${(k + 1) === this.state.ac_data.length
                            ? 'text-center' : 'text-right'
                            }`}>{v.lname}</td>
                    <td className="text-right text-danger">{v.loss}</td>
                    <td
                        className={
                            `${k + 1 === this.state.ac_data.length
                                ? 'text-center' : 'text-right'
                            }`}>{v.pname}
                    </td>
                    <td className="text-right text-success">{v.profit}</td>
                </tr>
            ));
        }
        return (
            <div className="row">
                <div className="col-12">
                    <table className="table table-bordered mt-0 table-striped table-sm report-table">
                        <thead>
                            <tr>
                                <th className="text-right">Name</th>
                                <th className="text-right">Amount</th>
                                <th className="text-right">Name</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>{ac_data.length > 0 && ac_data}</tbody>
                    </table>
                </div>
            </div>
        )
    };
};

export default GenModal;
