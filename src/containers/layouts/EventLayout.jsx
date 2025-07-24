import React from "react";
const EventLayout = (props) => {
  return (
      <div className="container-fluid">
          {props.children}
      </div>
  );
};

export default EventLayout;
