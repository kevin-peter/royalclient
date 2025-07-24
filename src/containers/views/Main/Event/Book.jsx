import React from "react";
class Book extends React.Component {
  constructor() {
    super();
    this.state = {
      showModal: true,
    };
  }
  componentDidMount() { }
  render() {
    let BET_ARR = [];
    let BET = "";
    if (this.props.market_id && this.props.betlist.length > 0) {
      BET_ARR = this.props.betlist.filter((v, k) => {
        if (this.props.book_type) {
          return v.table_name === this.props.book_type;
        } else {
          return v.market_id === this.props.market_id;
        }

      });
    } else {
      BET_ARR = [...this.props.betlist];
    }

    if (BET_ARR.length > 0) {
      BET = BET_ARR.map((v, k) => (
        <tr key={k} className={`row-betlist ${v.bet_type ? v.bet_type : ""}`}>
          <td>{k + 1}</td>
          <td>{v.runner}{(v.market_id.startsWith("9.") || v.market_id.startsWith("16.")) && " | BM"}{v.market_id.startsWith("17.") && " | Mini BM"}{v.market_id.startsWith("18.") && " | New BM"}</td>
          <td className="text-right">{v.rate}{v.table_name === 'tbl_fancy_runners' && ("/" + v.size)}</td>

          <td className="text-right">{v.stake}</td>
          <td className="text-right">
            {(v.table_name !== "tbl_line_runners" && v.table_name !== "tbl_fancy_runners" && v.table_name !== "tbl_odds_runners") &&
              (v.stake * (v.rate - 1)).toFixed(0)}
            {(v.table_name === "tbl_line_runners" || v.table_name === "tbl_fancy_runners") && (v.stake * v.size / 100).toFixed(0)}

            {(v.table_name === "tbl_odds_runners") &&
              (v.stake * v.rate / 100).toFixed(0)}
          </td>
          {this.props.role < 5 && (
            <React.Fragment>
              <td className='text-right'>{v.u_name}</td>
              <td className='text-center'>{v.webref}</td>
              <td className="text-center text-primary"><span role="button" title={v.device_info}>{v.ip_addr}</span></td>
            </React.Fragment>)}
          <td className='text-center'>{this.props.dateFormate(v.created)}</td>
        </tr>
      ));
    }
    return (
      <div className="custom-modal">
        <div className={`modal-dialog ${this.props.role < 5 ? " modal-lg" : ""}`}>
          <div className="modal-content">
            <div className="modal-header book-header">
              <h5 className="modal-title">{this.props.title} / Bets</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                title="close book"
              >
                <span onClick={this.props.closeBook} aria-hidden="true">
                  ×
                </span>
              </button>
            </div>
            <div className="modal-body p-0">
              <table className="table table-bordered table-sm table-odds">
                <thead>
                  <tr className="row-header-betlist">
                    <th width="1%">Sr.</th>
                    <th>Runner</th>
                    <th width="8%" className="text-right">Rate</th>
                    <th width="10%" className="text-right">Stake</th>
                    <th width="10%" className="text-right">P/L</th>
                    {this.props.role < 5 && (
                      <React.Fragment>
                        <th className='text-right'>USER NAME</th>
                        <th className="text-center">Ref.</th>
                        <th className="text-center">IP</th>
                      </React.Fragment>
                    )}
                    <th className="text-center">Time</th>
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
export default Book;
