import React from "react";
const url = "";
class Volume extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    render() {
        return (
            <React.Fragment>
                <div style={{
                    position: "relative",
                    display: "inline-block",
                    width: "100%",
                    float: "left",
                    maxHeight: "30px"
                }}>
                    <iframe title="volume Up"
                        allow="autoplay"
                        style={{
                            width: "25px",
                            height: "25px",
                            position: "absolute",
                            left: "60%",
                            bottom: "-4px",
                        }}
                        src={`${url + this.props.gameid}`}
                        height="30"
                        width="30">
                    </iframe>
                </div>
            </React.Fragment>
        );
    }
}
export default Volume;
