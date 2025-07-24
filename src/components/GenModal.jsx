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
    window.addEventListener('popstate', this.handlePopstate);
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopstate);
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
    fetch(import.meta.env.VITE_API_HOST + "/report/geteventgen", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          window.location.href = import.meta.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result && result.data) {
          this.generalFilter(result.data);
          // if (result.data.parent.length > 0) {
          //   localStorage.setItem("balance", result.data.parent[0].amount)
          // }
        }
      });
  };

  generalFilter = (data) => {
    let ac_data = [];
    let sum = 0;

    let p_ttl = 0;
    let l_ttl = 0;

    for (let i = 0; i < data.length; i++) {
      let pl = parseFloat(data[i].amount);
      if (pl !== 0) {
        ac_data.push({
          lname: (pl < 0) ? data[i].p_code : "",
          loss: (pl < 0) ? pl.toFixed(2) : "",
          pname: (pl > 0) ? data[i].p_code : "",
          profit: (pl > 0) ? pl.toFixed(2) : "",
          client: true,
          amount: data[i].amount,
          uid: data[i].u_id,
        });
        sum += pl;
        p_ttl = (pl > 0) ? p_ttl + pl : p_ttl;
        l_ttl = (pl < 0) ? l_ttl + pl : l_ttl;
      }
    }

    ac_data.push({
      lname: Math.abs(p_ttl) > Math.abs(l_ttl) ? "Up Line" : "",
      loss: Math.abs(p_ttl) > Math.abs(l_ttl) ? (l_ttl + p_ttl) * (-1) : "",
      pname: Math.abs(l_ttl) > Math.abs(p_ttl) ? "Up Line" : "",
      profit: Math.abs(l_ttl) > Math.abs(p_ttl) ? (p_ttl + l_ttl) * (-1) : "",
      client: false,
    });

    ac_data.push(

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
  handlePopstate = () => {
    if(this.props.modelClose){
      this.props.modelClose(true);
    }
  };

  render() {
    let ac_data = [];
    if (this.state.ac_data.length > 0) {
      ac_data = this.state.ac_data.map((v, k) => (
        <tr key={k} className={`${k % 2 === 0 ? "bg-white dark:bg-secondary-900" : "bg-secondary-100 dark:bg-secondary-700"}`}>
          <td
            className={`px-2 ${(k + 1) === this.state.ac_data.length
              ? 'text-center' : 'text-center'
              }`}>{v.lname}</td>
          <td className="text-right text-red-600 dark:text-pink-300 px-2">{v.loss}</td>
          <td
            className={
              `${k + 1 === this.state.ac_data.length
                ? 'text-center' : 'text-center'
              }`}>{v.pname}
          </td>
          <td className="text-right text-green-700 dark:text-green-300 px-2">{v.profit}</td>
        </tr>
      ));
    }
    return (
      <>
        <div className="w-full overflow-x-auto">
          <table className="w-full whitespace-nowrap text-xs text-primary-800 dark:text-white">
            <thead className='bg-primary-200 dark:bg-secondary-700 text-black dark:text-white'>
              <tr>
                <th className="text-center">Name</th>
                <th className="text-right px-2">Amount</th>
                <th className="text-center">Name</th>
                <th className="text-right px-2">Amount</th>
              </tr>
            </thead>
            <tbody>{ac_data.length > 0 && ac_data}</tbody>
          </table>
        </div>
      </>
    )
  };
};

export default GenModal;
