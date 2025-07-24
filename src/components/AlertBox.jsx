import React, { useEffect, useState } from "react";
const AlertBox = (props) => {

  return (
    <>
      <div
        
        className={`alert ${
          props.className ? props.className : "alert-success"
        } alert-dismissible slideUp show `}
        role="alert"
        style={{ position: "fixed", width: "auto", right: "10px", bottom: "0" }}
      >
        {props.message}
        <button
          onClick={props.closeMessage}
          type="button"
          className="close"
          data-dismiss="alert"
          aria-label="Close"
          style={{ padding: "7px" }}
        ><span aria-hidden="true">&times;</span></button>
      </div>
    </>
  );
};

export default AlertBox;
