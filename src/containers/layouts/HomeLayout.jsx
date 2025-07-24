import React, { useEffect, useContext, useState } from "react";

import StoreContext from "../../Store";
import TopHeader from "../../components/Common/Header/TopHeader";
import { NavLink } from "react-router-dom";
import {
  MdViewHeadline,
  MdEqualizer,
  MdGradient,
  MdDescription,
} from "react-icons/md";
import { FcSportsMode } from "react-icons/fc";
import { CiTrophy } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { FaCoins } from "react-icons/fa";
import { GiTennisRacket, GiCricketBat, GiCardPlay, GiCricket } from "react-icons/gi";
import { IoIosFootball, IoMdHeart } from "react-icons/io";
const SideMenu = React.lazy(() =>
  import("../../components/Common/Sidebar/index")
);

const HomeLayout = (props) => {
  const store = useContext(StoreContext);
  const currDate = new Date().toLocaleString("en-US");
  let message = localStorage.getItem("message")
    ? localStorage.getItem("message")
    : "Now is: " + currDate;
  let exp = localStorage.getItem("exp") ? localStorage.getItem("exp") : "0.0";
  let bal = localStorage.getItem("bal") ? localStorage.getItem("bal") : "0.0";
  let role = localStorage.getItem("rl") ? localStorage.getItem("rl") : "5";
  let email = localStorage.getItem("email")
    ? localStorage.getItem("email")
    : "";

  const [isMenuOpen, setMenu] = useState("");
  let LIST_GROP = [];
  const toggleMenu = () => {
    setMenu(!isMenuOpen);
  };

  useEffect(() => {
    getBal();
    const intervalId = setInterval(() => {
      getBal();
    }, 4000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const getBal = async (e) => {
    const urlencoded = {};

    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    let requestOptions = {
      method: "POST",
      headers: headers,
      redirect: "follow",
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/getBal", requestOptions)
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.data.length > 0) {
          store.setItem("bal", result.data[0]["amount"]);
          store.setItem("exp", result.data[0]["exposer"]);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        //setLoading(false);
      });
  };

  return (
    <>
      {/* <header className="navbar navbar-expand flex-column flex-md-row navbar-dark">
        <div className="navbar-nav-scroll">
          <ul className="navbar-nav bd-navbar-nav flex-row">
            {props.role === 5 && (
              <li className="nav-item btn shadow-sm">
                <NavLink className="nav-link" to="/dashboard">
                  Home
                </NavLink>
              </li>
            )}
            {props.role === 5 && (
              <li className="nav-item btn shadow-sm">
                <NavLink className="nav-link" to="/eventlist">
                  All Event
                </NavLink>
              </li>
            )}
            

            {props.role === 5 && (
              <li className="nav-item btn shadow-sm">
                <NavLink className="nav-link" to="/users">
                  Users 
                </NavLink>
              </li>
            )}
            
            {props.role === 5 && (
              <li className="nav-item btn shadow-sm">
                <NavLink
                  onClick={(e) => {
                    store.flushItem();
                  }}
                  className="nav-link"
                  to="/login"
                >
                  Logout
                </NavLink>
              </li>
            )}
          </ul>
        </div>
        
      </header>

                  
      
      <div className="container-fluid">
        <div className="row flex-xl-nowrap">
          
          <main className="col-12 col-md-12 py-md-3 pl-md-5">
            
            {props.children}
          </main>
        </div>
      </div> */}

      <TopHeader
        role={role}
        bal={bal}
        email={email}
        exp={exp}
        message={message}
        {...props}
      >
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
        <NavLink to={`/eventlist`} className="nav-logo">
          {/* {process.env.REACT_APP_NAME} */}
          <img
            src={`/logo_main.png`}
            alt="Logo"
            width="150px"
            height="50px"
          />
        </NavLink>
      </TopHeader>
      <ul className="header">
        
        <li>
          <NavLink title="Inplay" to={`/eventlist`}>
            <span className="inplay">
              <FcSportsMode></FcSportsMode>
            </span>
            <br></br>In-play
          </NavLink>
        </li>

        <li>
          <NavLink title="Inplay" to={`/events`}>
            <span className="inplay">
              <GiCricketBat></GiCricketBat>
            </span>
            <br></br>Events
          </NavLink>
        </li>
       
        {props.role === 5 && (
          <li>
            <NavLink title="Other" to={`/mymarkets/`}>
              <span className="inplay">
                <IoMdHeart></IoMdHeart>
              </span>
              <br></br>MyMarket
            </NavLink>
          </li>
        )}
        {props.role === 5 && (
          <li>
            <NavLink title="Other" to={`/myplayers`}>
              <span className="inplay">
                <FcSportsMode></FcSportsMode>
              </span>
              <br></br>My Players
            </NavLink>
          </li>
        )}
        {props.role === 5 && (
          <li>
            <NavLink title="Other" to={`/results`}>
              <span className="inplay">
                <CiTrophy></CiTrophy>
              </span>
              <br></br>Results
            </NavLink>
          </li>
        )}
        <li>
          <NavLink title="Other" to={`/bets`}>
            <span className="inplay">
              <FcSportsMode></FcSportsMode>
            </span>
            <br></br>Bets
          </NavLink>
        </li>
        <li>
          <NavLink title="Other" to={`/acsummary`}>
            <span className="inplay">
              <MdDescription></MdDescription>
            </span>
            <br></br>A/C Sum.
          </NavLink>
        </li>
        
        {(props.role == 5 ||
          props.role == 4 ||
          props.role == 3 ||
          props.role == 2) && (
          <li>
            <NavLink title="Other" to={`/pl`}>
              <span className="inplay">
                <MdEqualizer></MdEqualizer>
              </span>
              <br></br>P&L
            </NavLink>
          </li>
        )}
        {(props.role == 5 ||
          props.role == 4 ||
          props.role == 3 ||
          props.role == 2) && (
          <li>
            <NavLink title="Other" to={`/ac`}>
              <span className="inplay">
                <MdDescription></MdDescription>
              </span>
              <br></br>A/C
            </NavLink>
          </li>
        )}
        {/* {(props.role == 5 || props.role == 4 || props.role == 3 || props.role == 2) && (
          <li>
            <NavLink title="Other" to={`/chips`}>
              <span className="inplay">
                <MdDescription></MdDescription>
              </span>
              <br></br>Chips
            </NavLink>
          </li>
        )} */}
        {props.role != 5 && (
          <li>
            <NavLink title="Other" to={`/gl`}>
              <span className="gl">
                <MdDescription></MdDescription>
              </span>
              <br></br>General
            </NavLink>
          </li>
        )}
        {props.role != 5 && (
          <li>
            <NavLink title="Other" to={`/users`}>
              <span className="inplay">
                <MdDescription></MdDescription>
              </span>
              <br></br>Users
            </NavLink>
          </li>
        )}
        
        <li>
            <NavLink title="Other" to={`/profile`}>
              <span className="inplay">
                <CgProfile></CgProfile>
              </span>
              <br></br>Prof
            </NavLink>
          </li>
        
        {(props.role == 5 || props.role == 3 || props.role == 2) && (
          <li>
            <NavLink title="Other" to={`/rules`}>
              <span className="inplay">
                <MdGradient></MdGradient>
              </span>
              <br></br>Rules
            </NavLink>
          </li>
        )}
      </ul>
      <div className="shadow-bg"></div>
      <div className="container-fluid content">{props.children}</div>
    </>
  );
};

export default HomeLayout;
