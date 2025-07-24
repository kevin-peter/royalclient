import React from "react";
class PopUp extends React.Component {
  constructor() {
    super();
    this.state = {
    };
  }
  render() {
    return (
      <div className="custom-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header book-header">
              <h5 className="modal-title">{this.props.title}</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                title="Close"
              >
                <span onClick={this.props.closePopUp} aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body p-0">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default PopUp;
