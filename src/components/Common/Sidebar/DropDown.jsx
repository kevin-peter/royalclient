import React from "react";
import { BsCaretDown } from "react-icons/bs";
import SideMenuRight from "./SideMenuRight";
import AllExpo from "./../Header/AllExpo";
import * as serviceWorkerRegistration from './../../../serviceWorkerRegistration';

class DropDown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      opendropdown: false,
      openbook: false
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }
  toggleMenu() {
    
    this.setState({ opendropdown: !this.state.opendropdown });
  }
  closeBook = () => {
    
    this.setState({
      openbook: false,
    });
  };
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
    setTimeout(function () { window.location.replace(""); }, 300)
  }
  render() {
    const username = localStorage.getItem("name");
    return (
      <React.Fragment>
        <div className="dropdown-right">
          <span onClick={() => {
            this.setState({
              openbook: !this.state.openbook,
            });
          }} className="exposure">
            Exp : {('exp' in this.props) ? parseInt(this.props.exp) : ""}
            </span>
          <div
            className="dropdown-user"
            onClick={() => {
              this.setState({
                opendropdown: !this.state.opendropdown,
              });
            }}
          >
            <button className="username btn btn-sm btn-username">
              {/* {username && username.substring(0, 6)} */}
              {('email' in this.props && this.props.email) ? <strong>{this.props.email.substring(0, 6)}</strong> : ""}
              <span className="arrow-bottom">
                <BsCaretDown></BsCaretDown>
              </span>
              <div className='small'>
                {('bal' in this.props && this.props.bal) ? <strong>{parseInt(this.props.bal)}</strong> : ""}
                
              </div>
            </button>
          </div>

          <SideMenuRight
            isMenuOpen={this.state.opendropdown}
            onMenuToggle={this.toggleMenu}
            {...this.props}
          />

        </div>
        {this.state.openbook && <AllExpo closeBook={this.closeBook} />}

      </React.Fragment>
    );
  }
}
export default DropDown;
