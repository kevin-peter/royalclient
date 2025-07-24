import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, useContext } from "react";
import { useNavigate, NavLink } from "react-router-dom";

// import Loader from '../../../../utilities/Loader'
import * as serviceWorkerRegistration from "../../../../serviceWorkerRegistration";
import StoreContext from "../../../../Store";


import "./../../../../css/app.scss";
import "./../../../../css/login.scss";

// import background from '/login-bg.jpg';
// import mobile_bg from '/login-bg-mobile.jpg';
//import Loader from "../../../../utilities/loader/loader";

const Login = (props) => {
  const store = useContext(StoreContext);
  let navigate = useNavigate();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("text");
  const [showlogin, setLogin] = useState(false);

  const handleClick = async (e) => {
    try {
      e.preventDefault();
      var headers = new Headers();
      headers.append("Content-Type", "application/x-www-form-urlencoded");

      var urlencoded = new URLSearchParams();
      urlencoded.append("email", username);
      urlencoded.append("password", password);
      //urlencoded.append("role", 'client');

      var requestOptions = {
        method: "POST",
        headers: headers,
        body: urlencoded,
        redirect: "follow",
      };
      setLoading(true);
      let response = await fetch(
        import.meta.env.VITE_API_LOGIN + "/user/login",
        requestOptions
      );
      setLoading(false);
      if (response.ok) {
        let result = await response.json();

        if(result.role == 1) {
          window.location.href = "/";
          return false;
        }
        await store.setItem("email", username);
        await store.setItem("name", result.name);
        await store.setItem("role", result.role);
        await store.setItem("part", result.part);
        await store.setItem("bal", result.bal);
        await store.setItem("exp", result.exp);
        await store.setItem("modes", result.mode);
        setType("text")
        await store.setItem("jwt", result.token).then(() => {
          //console.log('loggedin')
        if(result.role == 2 || result.role == 3 || result.role == 4) {
          window.location.href = "/profile";
        } else {
          window.location.href = "/eventlist";
        }  
          
          //navigate("/eventlist")
        });
      } else {
        setError("Faild Login");
        setTimeout(() => {
          setError("");
        }, 3000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const keydownHandler = (e) => {
      //console.log(e.keyCode)
      if (e.ctrlKey && e.keyCode === 76) {
        e.preventDefault();
        setLogin(!showlogin);
      }
      return;
    };
    document.addEventListener("keydown", keydownHandler);
    const refreshCacheAndReload = () => {
      console.log("cache cleared");
      if ("serviceWorker" in navigator) {
        serviceWorkerRegistration.unregister();
        caches
          .keys()
          .then((cacheNames) => {
            cacheNames.forEach((cacheName) => {
              caches.delete(cacheName);
            });
          })
          .then(() => {
            serviceWorkerRegistration.register();
          });
      }
    };
    refreshCacheAndReload();
    return () => window.removeEventListener("keydown", keydownHandler);
  }, []);

  // let div_style = {
  //   backgroundImage: (window.innerWidth > 640) ? `linear-gradient(var(--theme-color),rgba(255,255,255,0.2)),url(${background})` : `linear-gradient(var(--theme-color),rgba(255,255,255,0.2)),url(${mobile_bg})`
  // }

  let div_style = {
    backgroundImage:
      window.innerWidth > 640
        ? `linear-gradient(var(--theme-color), rgba(255,255,255,0.2)), url('/login-bg.jpg')`
        : `linear-gradient(var(--theme-color), rgba(255,255,255,0.2)), url('/login-bg-mobile.jpg')`,
    backgroundPosition: 'center',
    // marginTop: '10px'
  };
  
  return (
    
    <main className="content-login" style={div_style}>
      <div className="animation-container">
        <div className="lightning-container">
          <div className="lightning white" />
          <div className="lightning red" />
        </div>
        <div className="boom-container">
          <div className="shape circle big white" />
          <div className="shape circle white" />
          <div className="shape triangle big yellow" />
          <div className="shape disc white" />
          <div className="shape triangle blue" />
        </div>
        <div className="boom-container second">
          <div className="shape circle big white" />
          <div className="shape circle white" />
          <div className="shape disc white" />
          <div className="shape triangle blue" />
        </div>
      </div>
      <div className="card card-signin theme-bg my-5">
        <div className="card-body">
          <NavLink to={`/`} className="nav-logo">
            <img
              src={`/logo192.png`}
              alt="Logo"
              className="App-logo"
              width="150px"
              height="50px"
            />
          </NavLink>
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h1 className="App-logo">Main Host</h1>
          <hr style={{ marginTop: 0, marginBottom: 10 }} />
          <form
            onSubmit={(e) => handleClick(e)}
            className="form-signin"
            autoComplete={"off"}
          >
            <div className="form-label-group">
              <input
                id="inputEmail"
                className="form-control"
                placeholder="Email address"
                required
                autoFocus
                value={username}
                onChange={(e) => {
                  setUserName(e.target.value);
                }}
              />
              <label htmlFor="inputEmail">User Name</label>
            </div>
            <div className="form-label-group">
              <input
                type="password"
                id="inputPassword"
                className="form-control"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setType("password");
                }}
              />
              <label htmlFor="inputPassword">Password</label>
            </div>
            <div className="custom-control custom-checkbox mb-3">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck1"
                value={true}
                // checked={true}
                defaultChecked={true}
              />
              <label className="custom-control-label" htmlFor="customCheck1">
                Remember password
              </label>
            </div>
            <button
              className="btn btn-lg btn-login btn-block text-uppercase"
              type="submit"
              disabled={loading}
            >
              Sign in
            </button>
            {error && (
              <div
                className="mt-3 alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                wrong username or password
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
    
  );
};

export default Login;
