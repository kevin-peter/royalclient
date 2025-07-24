import React from "react";
class Position extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() { }
  render() {
    let BET_ARR = [...this.props.position];
    let BET = "";

    if (BET_ARR.length > 0) {
      BET = BET_ARR.map((v, k) => (
        <tr key={k}>
          <td className="bold text-center">{v.run}</td>
          <td
            className={`bold text-right ${v.exp < 0 ? "text-danger" : "text-success"
              }`}
          >
            {v.exp ? parseInt(v.exp) : ""}
          </td>
        </tr>
      ));
    }
    return (
      <div className="custom-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header book-header">
              <h5 className="modal-title">{this.props.title} / Position</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span onClick={this.props.closePosition} aria-hidden="true">
                  ×
                </span>
              </button>
            </div>
            <div className="modal-body">
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th className="text-center">Run</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                {BET_ARR.length > 0 && <tbody>{BET}</tbody>}
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Position;
