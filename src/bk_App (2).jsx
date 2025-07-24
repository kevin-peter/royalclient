import React from "react";
import Routers from "./router";
import NetworkDetector from "./Helper/NetworkDetector";
import "./css/app.scss";


function App() {
  return <Routers />;
}

export default NetworkDetector(App);
