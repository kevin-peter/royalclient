import React, {useContext } from "react";
import { NavLink } from "react-router-dom";
import StoreContext from '../../Store';
import { BackgroundSyncPlugin } from "workbox-background-sync";

const HomeLayout = (props) => {
  const store = useContext(StoreContext);

  return (
    <>
      <header className="navbar navbar-expand flex-column flex-md-row navbar-dark">
        <div className="navbar-nav-scroll">
          {/* <ul className="navbar-nav bd-navbar-nav flex-row">
            <li className="nav-item btn shadow-sm">
              <NavLink className="nav-link" to="/fancyDemo">Home</NavLink>
            </li>
            
            
          </ul> */}
        </div>
      </header>
      <div className="container-fluid" style={{background: "linear-gradient(102.7deg,#201056 27.3%,#39195f 51.81%,#4b1a62 84.46%,#221156 111.45%,#210f55 0);"}}>
        <div className="row flex-xl-nowrap">
          <main className="col-12 col-md-12 py-md-3 pl-md-5">
            {props.children}
          </main>
        </div>
      </div>

    </>
  );
};

export default HomeLayout;
