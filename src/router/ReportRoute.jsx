import React from "react";
import { Route, Routes } from "react-router-dom";
import ReportController from "../controller/ReportController";

const ReportRoute = (props) => {
  return (
    <Routes>
      <Route
        path="/accountstatement"
        element={<ReportController path="as" />}
      />
      <Route
        path="/accountgen"
        element={<ReportController path="ag" />}
      />
      <Route
        path="/setling"
        element={<ReportController path="stl" />}
      />
      <Route element={<div>404 Page Not Found2</div>} exact path="/*" />
    </Routes>
  );
};

export default ReportRoute;
