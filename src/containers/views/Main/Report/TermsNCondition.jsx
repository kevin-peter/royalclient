import React, { Component } from "react";

export default class TermsNCondition extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <React.Fragment>
        <div className="row">
          <div className="table-responsive">
            <table className="table table-bordered table-striped table-sm report-table">
              <thead>
                <tr>
                  <th>Sr.</th>
                  <th>Terms And Condtion</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Due to any technical issue software not work properly at that time we are not responsible for any loss.</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Cheating bets deleted automatically or manual. No Claim.</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>All Advance Fancy 1`st Inning Valid Only</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>In case of a Tie match, only match odds will be cancelled , completed sessions will be continue.</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td className="text-danger font-weight-bold">Admin decision is final and no claim on it.</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>All Fancy are based on Haar - Jeet.</td>
                </tr>
                <tr>
                  <td>7</td>
                  <td>Tv & ScoreBorad third party provider,bet on your risk.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
