import React from "react";

class Score extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    render() {
        return (
            <React.Fragment>
                {this.props.scoredata && <div className="frame-container" dangerouslySetInnerHTML={{ __html: this.props.scoredata }}>
                </div>}
            </React.Fragment>
        );
    }
}
export default Score;
