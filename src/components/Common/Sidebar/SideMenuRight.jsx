import React from "react";
import { NavLink } from "react-router-dom";
import "../../../css/rightsidemenu.scss";
import "../../../css/style.scss";
import { IoMdHeart } from "react-icons/io";
import {
  MdClose,
  MdEqualizer,
  MdLock,
  MdDescription,
  MdGradient,
  MdSettings,
  MdPowerSettingsNew
} from "react-icons/md";
import { FaCoins, FaPiggyBank, FaUserEdit } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { GrBold } from "react-icons/gr";
class SideMenuRight extends React.Component {
  constructor() {
    super();
    //console.log(this.props.role)
    this.state = {
      /* Awesome State Not Yet Used */
    };
  }
  
  
  render() {
    return (
      <div
        className={`sidebar-menu-right${this.props.isMenuOpen === true ? " open" : ""
          }`}
      >
        <ul className="vertical menu">
          <li>
            <div className="sidebar-toggler-div">
              <span
                className="close-sidebar float-right"
                onClick={this.props.onMenuToggle}
                title="Close"
              >
                <MdClose></MdClose>
              </span>
            </div>
          </li>
          <li>
            <NavLink
              extact="true"
              to={`/inplay`}
              onClick={this.props.onMenuToggle}
              title="Free Chips"
            >
              <span className="sport-icon">
                <FaCoins></FaCoins>
              </span>
              Free Chips : <span className="txt-bal">{this.props.bal}</span>
            </NavLink>
          </li>
          {parseInt(this.props.role) == 5 &&
          <li>
            <NavLink title="My Market" to={`/mymarkets`}>
              <span className="sport-icon text-danger">
                <IoMdHeart></IoMdHeart>
              </span>
              MY Market
            </NavLink>
          </li>
          }
          {parseInt(this.props.role) < 5 &&
            (<li>
              <NavLink
                extact="true"
                to={`/users`}
                title="Users List"
                onClick={this.props.onMenuToggle}
              >
                <span className="sport-icon">
                  <FaUserEdit></FaUserEdit>
                </span>
                Users
              </NavLink>
            </li>)
          }

          <li>
            <NavLink
              extact="true"
              to={`/profile`}
              onClick={this.props.onMenuToggle}
              title="Profile"
            >
              <span className="sport-icon">
                <CgProfile></CgProfile>
              </span>
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink
              extact="true"
              to={`/pl`}
              onClick={this.props.onMenuToggle}
              title="Profit and Loss"
            >
              <span className="sport-icon">
                <MdEqualizer></MdEqualizer>
              </span>
              Profit and Loss
            </NavLink>
          </li>
          <li>
            <NavLink
              extact="true"
              to={`/ac`}
              onClick={this.props.onMenuToggle}
              title="Account Statement"
            >
              <span className="sport-icon">
                <MdDescription></MdDescription>
              </span>
              Account Statement
            </NavLink>
          </li>
          {parseInt(this.props.role) < 5 && (<li>
            <NavLink
              extact="true"
              to={`/acsummary`}
              onClick={this.props.onMenuToggle}
              title="Account Statement"
            >
              <span className="sport-icon">
                <MdDescription></MdDescription>
              </span>
              Account Summary
            </NavLink>
          </li>)}
          {parseInt(this.props.role) < 5 && (<li>
            <NavLink
              extact="true"
              to={`/report/general`}
              onClick={this.props.onMenuToggle}
              title="A/c General"
            >
              <span className="sport-icon">
                <FaPiggyBank></FaPiggyBank>
              </span>
              A/c General
            </NavLink>
          </li>)}
          <li>
            <NavLink
              extact="true"
              to={`/chipsummary`}
              onClick={this.props.onMenuToggle}
              title="Chips Summary"
            >
              <span className="sport-icon">
                <FaCoins></FaCoins>
              </span>
              Chips Summary
            </NavLink>
          </li>
          <li>
            <NavLink
              extact="true"
              to={`/rules`}
              onClick={this.props.onMenuToggle}
              title="Rules"
            >
              <span className="sport-icon">
                <MdGradient></MdGradient>
              </span>
              Rules
            </NavLink>
          </li>
          
          <li>
            <NavLink
              extact="true"
              to={`/changepassword`}
              onClick={this.props.onMenuToggle}
              title="Change Password"
            >
              <span className="sport-icon">
                <MdLock></MdLock>
              </span>
              Change Password
            </NavLink>
          </li>
          <li>
            <NavLink
              extact="true"
              to={`/logout`}
              onClick={this.props.onMenuToggle}
              title="Logout"
            >
              <span className="sport-icon">
                <MdPowerSettingsNew></MdPowerSettingsNew>
              </span>
              Logout
            </NavLink>
          </li>
        </ul>
      </div>
    );
  }
}
export default SideMenuRight;
