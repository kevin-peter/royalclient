import React from "react";
import { NavLink } from "react-router-dom";
import "../../../css/sidemenu.scss";
import { MdClose, MdPowerSettingsNew } from "react-icons/md";
import { GiTennisRacket, GiCricketBat, GiCardPlay } from "react-icons/gi";
import { IoIosFootball, IoMdHeart } from "react-icons/io";
import { FcAndroidOs } from "react-icons/fc";
import { BiRefresh } from "react-icons/bi";
import * as serviceWorkerRegistration from './../../../serviceWorkerRegistration';

class SideMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }
  componentDidUpdate() {
    if (!this.state.open) {
      this.setState({
        open: true
      })
    }
  }
  refreshCacheAndReload = () => {
    if ('serviceWorker' in navigator) {
      serviceWorkerRegistration.unregister();
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      }).then(() => {
        serviceWorkerRegistration.register();
      })
    }
    setTimeout(function () { window.location.replace(""); }, 100)
  }
  render() {
    let LIST_GROP = [];
    if (this.props.play_mods && this.props.play_mods.length > 0) {
      LIST_GROP = this.props.play_mods.map((v, k) => (
        <li key={k}>
          <NavLink onClick={() => {
            this.setState({
              open: false
            }, () => { this.props.onMenuToggle() })
          }} title={v.play} to={`/` + v.play.toLowerCase()}>
            <span className="sport-icon">
              {v.id === 4 && <GiCricketBat></GiCricketBat>}
              {v.id === 2 && <GiTennisRacket></GiTennisRacket>}
              {v.id === 1 && <IoIosFootball></IoIosFootball>}
              {v.id === 10 && <GiCardPlay></GiCardPlay>}
            </span>
            {v.play}
          </NavLink>
        </li>
      ));
    }
    return (
      <div
        className={`sidebar-menu${this.props.isMenuOpen === true && this.state.open ? " open" : ""
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
            <NavLink title="My Market" to={`/mymarket`}>
              <span className="sport-icon text-danger">
                <IoMdHeart></IoMdHeart>
              </span>
              MY Market
            </NavLink>
          </li>

          {LIST_GROP.length > 0 && LIST_GROP}
          <li className="sidebar-logout text-center">
            <NavLink
              to={`/logout`}
              onClick={this.props.onMenuToggle}
            >
              <span className="logout-icon">
                <MdPowerSettingsNew></MdPowerSettingsNew>
              </span>
              <span className="sidebar-logout-txt">Logout</span>
            </NavLink>
          </li>

          <li>
            <NavLink title="Refresh" to={`#refresh`} onClick={() => {
              this.refreshCacheAndReload()
            }}>
              <span className="sport-icon text-danger">
                <BiRefresh></BiRefresh>
              </span>
              Refresh
            </NavLink>
          </li>

          <li>
            <NavLink title="My Market" to={`/${import.meta.env.VITE_NAME}.apk`}>
              <span className="sport-icon text-danger">
                <FcAndroidOs></FcAndroidOs>
              </span>
              Apk
            </NavLink>
          </li>
        </ul>
      </div>
    );
  }
}

export default SideMenu;
