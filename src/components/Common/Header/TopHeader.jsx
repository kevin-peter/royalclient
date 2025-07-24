import React from "react";
import DropDown from "../Sidebar/DropDown";
const TopHeader = (props) => {
  return (
    <div className="header-bg shadow">
      <nav className="header-nav">
        {props.children}
        <DropDown {...props}></DropDown>
        <div className="marquee">
          <marquee scrollamount="4">{props.message}</marquee>
        </div>
      </nav>
    </div>  
  );
};
export default TopHeader;
