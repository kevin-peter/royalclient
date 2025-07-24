import React, { useEffect } from 'react';
import Loader from "../../../utilities/Loader";

const PopUp = React.lazy(() => import("../../../components/PopUp"));
const AddUserPopup = React.lazy(() => import("./AddUserPopup"));
const ChangeUserMode = React.lazy(() => import("./ChangeUserMode"));
const UserSettingPopup = React.lazy(() => import("./UserSettingPopup"));
const WithdrawAndDeposite = React.lazy(() => import("./WithdrawAndDeposite"));
const SetPl = React.lazy(() => import("./SetPl"));

const ModelPopup = (props) => {
  useEffect(() => {
    const handlePopstate = () => {
      props.modelClose('', '', true);
    };
    window.addEventListener('popstate', handlePopstate);
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  //console.log(props.modeltype)
  if (props.modeltype && props.modeltype === "ms") {
    return (
      <React.Suspense fallback={<Loader></Loader>}>
        <PopUp modelClose={props.modelClose} title={props.mtitle}>
          <ChangeUserMode {...props} modelClose={props.modelClose} user={props.user} />
        </PopUp>
      </React.Suspense>
    );
  } else if (props.modeltype && (props.modeltype === 'wd' || props.modeltype === 'dp')) {
    return (
      <React.Suspense fallback={<Loader></Loader>}>
        <PopUp modelClose={props.modelClose} title={props.mtitle}>
          <WithdrawAndDeposite {...props} modeltype={props.modeltype} modelClose={props.modelClose} mtitle={props.mtitle} user={props.user} />
        </PopUp>
      </React.Suspense>
    );
  }
  else if (props.modeltype && (props.modeltype === 'withdraw' || props.modeltype === 'deposit')) {
    return (
      <React.Suspense fallback={<Loader></Loader>}>
        <PopUp modelClose={props.modelClose} title={props.mtitle}>
          <SetPl {...props} modeltype={props.modeltype} modelClose={props.modelClose} mtitle={props.mtitle} user={props.user} />
        </PopUp>
      </React.Suspense>
    );
  }
  else if (props.modeltype && props.modeltype === "cs") {

    let modeData = [{ play: "Select Mode", visible: 1, id: 0 }, ...props.play_mods];
    return (
      <React.Suspense fallback={<Loader></Loader>}>
        <PopUp modelClose={props.modelClose} title={props.mtitle}>
          <UserSettingPopup modes={modeData} user={props.user} modelClose={props.modelClose} />
        </PopUp>
      </React.Suspense>
    )
  } else if (props.modeltype && props.modeltype === "aduser") {

    return (
      <React.Suspense fallback={<Loader></Loader>}>
        <PopUp modelClose={props.modelClose} title={props.mtitle}>
          <AddUserPopup {...props} user={props.user} modelClose={props.modelClose} />
        </PopUp>
      </React.Suspense>
    )
  }
}

export default ModelPopup;