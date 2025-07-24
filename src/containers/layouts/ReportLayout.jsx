import React, { useState } from "react";
import TopHeader from "../../components/Common/Header/TopHeader";
import { NavLink } from "react-router-dom";
import { IoMdHeart, IoMdArrowBack } from "react-icons/io";
import {
  MdViewHeadline, MdGradient, MdLock,
  MdEqualizer, MdDescription, MdSettings,

} from "react-icons/md";
import { FaCoins, FaPiggyBank, FaUserEdit } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { GrBold } from "react-icons/gr";
const SideMenu = React.lazy(() => import("../../components/Common/Sidebar/index"));

const ReportLayout = (props) => {
  const [isMenuOpen, setMenu] = useState("");
  const toggleMenu = () => {
    setMenu(!isMenuOpen)
  }
  return (
    <React.Fragment>
      <TopHeader {...props}>
        <React.Suspense fallback={""}>
          <SideMenu
            isMenuOpen={isMenuOpen}
            onMenuToggle={toggleMenu}
            {...props}
          ></SideMenu>
        </React.Suspense>
        <span className="toggle" onClick={toggleMenu}>
          <MdViewHeadline></MdViewHeadline>
        </span>
        <NavLink to={`/inplay`} className="nav-logo">
          {process.env.REACT_APP_NAME}
        </NavLink>
      </TopHeader>
      <ul className="header">
        <li>
          <NavLink
            extact="true"
            title="Account Statement"
            to={`/report/accountstatement`}
          >
            <span className="inplay">
              <MdDescription></MdDescription>
            </span>
            <br></br>a/c
          </NavLink>
        </li>
        <li>
          <NavLink
            extact="true"
            title="Profilt & Loss"
            to={`/report/profitloss`}
          >
            <span className="inplay">
              <MdEqualizer></MdEqualizer>
            </span>
            <br></br>P&L
          </NavLink>
        </li>
        {parseInt(props.role) < 5 &&
          (<li>
            <NavLink
              extact="true"
              title="General Ledger"
              to={`/report/general`}
            >
              <span className="inplay">
                <FaPiggyBank></FaPiggyBank>
              </span>
              <br></br>GL
            </NavLink>
          </li>)
        }
        {parseInt(props.role) < 5 &&
          <li>
            <NavLink
              extact="true"
              title="Chips Summary"
              to={`/report/daily`}
            >
              <span className="inplay">
                <FaPiggyBank></FaPiggyBank>
              </span>
              <br></br>Daily
            </NavLink>
          </li>}
        <li>
          <NavLink
            extact="true"
            title="Chips Summary"
            to={`/report/chipsummary`}
          >
            <span className="inplay">
              <FaCoins></FaCoins>
            </span>
            <br></br>Chips
          </NavLink>
        </li>

        <li>
          <NavLink
            extact="true"
            title="View Bets"
            to={`/report/mybets`}
          >
            <span className="inplay">
              <GrBold></GrBold>
            </span>
            <br></br>Bets
          </NavLink>
        </li>
        <li>
          <NavLink
            extact="true"
            title="Terms & cond"
            to={`/report/termsncodition`}
          >
            <span className="inplay">
              <MdGradient></MdGradient>
            </span>
            <br></br>Rules
          </NavLink>
        </li>
        {parseInt(props.role) < 5 &&
          (<li>
            <NavLink
              extact="true"
              title="Edit Users"
              to={`/report/users`}
            >
              <span className="inplay">
                <FaUserEdit></FaUserEdit>
              </span>
              <br></br>Users
            </NavLink>
          </li>)}
        <li>
          <NavLink
            extact="true"
            title="Profile"
            to={`/report/profile`}
          >
            <span className="inplay">
              <CgProfile></CgProfile>
            </span>
            <br></br>Prof
          </NavLink>
        </li>
        <li>
          <NavLink
            extact="true"
            title="Change Password"
            to={`/report/changepassword`}
          >
            <span className="inplay">
              <MdLock></MdLock>
            </span>
            <br></br>PWD
          </NavLink>
        </li>
        {props.role === 5 &&
          <li>
            <NavLink
              extact="true"
              title="Change Buttons"
              to={`/report/buttons`}
            >
              <span className="inplay">
                <MdSettings></MdSettings>
              </span>
              <br></br>Butt
            </NavLink>
          </li>}
        
        <li>
          <NavLink
            extact="true"
            title="Account Summary"
            to={`/report/accountsummary`}
          >
            <span className="inplay">
              <MdDescription></MdDescription>
            </span>
            <br></br>A/c.Sum
          </NavLink>
        </li>
        <li>
          <NavLink
            extact="true"
            title="Back"
            to={`/inplay`}
          >
            <span className="inplay">
              <IoMdArrowBack></IoMdArrowBack>
            </span>
            <br></br>Back
          </NavLink>
        </li>
      </ul>
      {/* <div className="shadow-bg"></div> */}
      <div className="container-fluid content-report">
        {props.children}
      </div>
    </React.Fragment>
  );
};

export default ReportLayout;
