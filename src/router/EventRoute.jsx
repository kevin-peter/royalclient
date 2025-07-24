import React from "react";
import { Route, Routes } from "react-router-dom";
import EventController from "../controller/EventController";

const EventRoute = (props) => {
   
  return (
    <React.Fragment>
      <Routes>
        <Route
          path="/eventdata/:eventid/:marketid"
          element={<EventController path="eventdata" />}
        />
      </Routes>
    </React.Fragment>
  );
};

export default EventRoute;
