import React, { useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import HomeLayout from "../containers/layouts/HomeLayout";  


// const AccountStatement = React.lazy(() => import("./AccountStatement"));
// const AcGen = React.lazy(() => import("./AccountGeneral"));
// const Settlement = React.lazy(() => import("./DailyGeneral"));

const ReportController = (props) => {
  let navigate = useNavigate();
  return (
    <HomeLayout>
      {/* <React.Suspense fallback={""}>
        {props.path === 'as' && <AccountStatement navigate={navigate}></AccountStatement>}
        {props.path === 'ag' && <AcGen navigate={navigate}></AcGen>}
        {props.path === 'stl' && <Settlement navigate={navigate}></Settlement>}
      </React.Suspense> */}
    </HomeLayout>
  );
};

export default ReportController;
