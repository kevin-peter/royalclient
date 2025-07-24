import React from "react";

const notifyMessage = (props) => {
    return <p className={`notify alert ${props.alertclass}`} >{props.message}</p>;
}

export default notifyMessage