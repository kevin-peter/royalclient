import React from "react";

class TV extends React.Component {
  constructor() {
    super();
    this.frameRef = React.createRef();
    this.state = {};
  }
  componentDidMount() { this.openTv() }
  openTv() {
    let urlencoded = new URLSearchParams();
    urlencoded.append("event_id", this.props.eventid);
    fetch(import.meta.env.VITE_API_HOST + "/openTv", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: urlencoded,
      method: "POST",
    })
      .then((response) => {
        if (response.status === 401) {
          window.location.href = process.env.PUBLIC_URL + "/login";
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.data && this.frameRef.current && this.frameRef.current.contentWindow) {
          if (result.data && result.data.url)
            this.frameRef.current.contentWindow.location.replace(result.data.url);
          if (result.data && result.data.html) {
            this.frameRef.current.contentWindow.document.write(result.data.html);
          }
        }
      });
  }
  render() {
    let T_V = [0].map((v, k) => (
      <table key={k} className="table table-sm mb-1 bg-dark">
        <tbody key={k}>
          <tr key={k}>
            <td key={k} style={{ borderTop: 0 }} className="p-0 m-0 text-center">{(
              <React.Fragment>
                <iframe ref={this.frameRef} style={{ maxWidth: 400 }} frameBorder='0' height="220" title="Live Tv"></iframe>
              </React.Fragment>
            )}</td>
          </tr>
        </tbody>
      </table>
    ));
    return (
      T_V
    );
  }
}
export default TV;
