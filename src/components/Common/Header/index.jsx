import React from "react";
import { NavLink } from "react-router-dom";
import { MdViewHeadline} from "react-icons/md";
import { FcSportsMode } from "react-icons/fc";
import { GiTennisRacket, GiCricketBat, GiCardPlay } from "react-icons/gi";
import { IoIosFootball,IoMdHeart } from "react-icons/io";
import DropDown from "../Sidebar/DropDown";
const SideMenu = React.lazy(() => import("../Sidebar/index"));

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMenuOpen: false,
      isLoggenin: true,
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }
  toggleMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  }
  render() {
    let LIST_GROP = [];
    if (this.props.play_mods && this.props.play_mods.length > 0) {
      LIST_GROP = this.props.play_mods.map((v, k) => (
        <li key={k}>
          <NavLink title={v.play}  to={`/` + v.play.toLowerCase()}>
            <span className="inplay">
              {v.id === 4 && <GiCricketBat></GiCricketBat>}
              {v.id === 2 && <GiTennisRacket></GiTennisRacket>}
              {v.id === 1 && <IoIosFootball></IoIosFootball>}
              {v.id === 10 && <GiCardPlay></GiCardPlay>}
            </span>
            <br></br>{v.play}
          </NavLink>
        </li>
      ));
    }
    return (
      <React.Fragment>
        <nav className="header-nav">
          <span className="toggle" onClick={this.toggleMenu}>
            <MdViewHeadline></MdViewHeadline>
          </span>
          <NavLink  to={`/eventlist`} className="nav-logo">
            {import.meta.env.VITE_NAME}
          </NavLink>
          <DropDown {...this.props}></DropDown>
          <div className="marquee">
            <marquee>{this.props.message}</marquee>
          </div>
        </nav>
        <React.Suspense fallback={""}>
          <SideMenu
            isMenuOpen={this.state.isMenuOpen}
            onMenuToggle={this.toggleMenu}
            {...this.props}
          ></SideMenu>
        </React.Suspense>
        <ul className="header">
          <li>
            <NavLink title="Inplay"  to={`/inplay`}>
              <span className="inplay">
                <FcSportsMode></FcSportsMode>
              </span>
              <br></br>In-play
            </NavLink>
          </li>
          {LIST_GROP.length > 0 && LIST_GROP}
          <li>
            <NavLink title="Other"  to={`/mymarket`}>
              <span className="inplay">
                <IoMdHeart></IoMdHeart>
              </span>
              <br></br>MyMarket
            </NavLink>
          </li>
        </ul>
        <div className="shadow-bg"></div>
      </React.Fragment>
    );
  }
}
export default Header;
