// router/index.js
// import Login from "../pages/Login";
import HomeRoute from "./HomeRoute";
import EventRoute from "./EventRoute";
import { Navigate } from "react-router-dom";
import Login from "../containers/views/Main/Login";

const jwt = localStorage.getItem("jwt"); // or however you're managing auth

const Routers = [
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/event/*",
    element: <EventRoute />,
  },
  {
    path: "/logout/*",
    element: (
      <Navigate to={`/login?${Math.random()}`} key={3} />
    ),
  },
  {
    path: "/*",
    element: jwt ? <HomeRoute /> : <Navigate to="/login" />,
  },
];

export default Routers;
