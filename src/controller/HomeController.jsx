import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import HomeLayout from "../containers/layouts/HomeLayout";
import FrontLayout from "../containers/layouts/FrontLayout";
import Loader from '../utilities/Loader'
import StoreContext from '../Store';

const DashBoard = React.lazy(() => import("../containers/views/Dash"));
const EventList = React.lazy(() => import("../containers/views/EventList"));
const Events = React.lazy(() => import("../containers/views/EventList/allEvents.jsx"));
const Results = React.lazy(() => import("../containers/views/EventList/Results.jsx"));
const MarketList = React.lazy(() => import("../containers/views/MarketList"));
const LiveMarket = React.lazy(() => import("../containers/views/MarketList/MarketsC.jsx"));
const LiveMarket2 = React.lazy(() => import("../containers/views/MarketList/TopBatter.jsx"));
const OddEven = React.lazy(() => import("../containers/views/MarketList/OddEven.jsx"));
const InningScore = React.lazy(() => import("../containers/views/MarketList/InningScore.jsx"));
const InningScore2 = React.lazy(() => import("../containers/views/MarketList/TotalScore.jsx"));
const PairBet = React.lazy(() => import("../containers/views/MarketList/pairBet.jsx"));

const MyMarkets = React.lazy(() => import("../containers/views/MyMarkets"));
const MyPlayers = React.lazy(() => import("../containers/views/MyPlayers"));
const PL = React.lazy(() => import("../containers/views/PL"));
const AC = React.lazy(() => import("../containers/views/AC"));
const Profile = React.lazy(() => import("../containers/views/Profile"));
const Users = React.lazy(() => import("../containers/views/Users"));
const Gl = React.lazy(() => import("../containers/views/Users/AccountGeneral"));
const Customers = React.lazy(() => import("../containers/views/Customers"));
const ChangePassword = React.lazy(() => import("../containers/views/Profile/ChangePassword"));
const MyPlayersSystem = React.lazy(() => import("../containers/views/MyPlayersSystem"));
const Bets = React.lazy(() => import("../containers/views/Bets"));
const AccountSummary = React.lazy(() => import("../containers/views/Summary/AccountSummary"));


const HomeController = (props) => {
  let { eventid, marketid, event_name } = useParams();
  let navigate = useNavigate();
  const store = useContext(StoreContext);
  const [role, setRole] = useState(parseInt(store.getItem("role")));
  const [email, setEmail] = useState(store.getItem("email"));
  const [part, setPart] = useState(store.getItem("part"));
  const [exp, setExp] = useState(store.getItem("exp"));
  const [bal, setBal] = useState(store.getItem("bal"));

  useEffect(() => {
    setRole(parseInt(store.getItem("role")))
    setEmail(store.getItem("email"))
    setPart(store.getItem("part"))
    setExp(store.getItem("exp"))
    setBal(store.getItem("bal"))
    //console.log("controller call")
  }, [store])

  //console.log(exp)
  return (
    <>
    {email ? 
    <HomeLayout email={email} part={part} navigate={navigate} role={role} menu={props.menu ? props.menu : false} >
      <React.Suspense fallback={<Loader></Loader>}>
        
        {props.path === 'dashboard' && <DashBoard role={role} exp={exp} bal={bal} navigate={navigate} message="Welcome to "></DashBoard>}
        {props.path === 'eventlist' && <EventList role={role} exp={exp} bal={bal} navigate={navigate}></EventList>}
        {props.path === 'events' && <Events role={role} exp={exp} bal={bal} navigate={navigate}></Events>}
        {props.path === 'marketlist' && role === 5 && <MarketList role={role} exp={exp} bal={bal} navigate={navigate}></MarketList>}
        {props.path === 'liveMarket' && role === 5 && <LiveMarket role={role} exp={exp} bal={bal} navigate={navigate}></LiveMarket>}
        {props.path === 'liveMarket2' && role === 5 && <LiveMarket2 role={role} exp={exp} bal={bal} navigate={navigate}></LiveMarket2>}
        {props.path === 'pairBet' && role === 5 && <PairBet role={role} exp={exp} bal={bal} navigate={navigate}></PairBet>}
        {props.path === 'oddEven' && role === 5 && <OddEven role={role} exp={exp} bal={bal} navigate={navigate}></OddEven>}
        {props.path === 'inningScore' && role === 5 && <InningScore role={role} exp={exp} bal={bal} navigate={navigate}></InningScore>}
        {props.path === 'inningScore2' && role === 5 && <InningScore2 role={role} exp={exp} bal={bal} navigate={navigate}></InningScore2>}
        {props.path === 'mymarkets' && <MyMarkets role={role} exp={exp} bal={bal} navigate={navigate}></MyMarkets>}
        {props.path === 'myplayers' && <MyPlayers role={role} exp={exp} bal={bal} navigate={navigate}></MyPlayers>}
        {props.path === 'pl' && <PL role={role} exp={exp} bal={bal} navigate={navigate}></PL>}
        {props.path === 'ac' && <AC role={role} exp={exp} bal={bal} navigate={navigate}></AC>}
        {props.path === 'profile' && <Profile role={role} exp={exp} bal={bal} navigate={navigate}></Profile>}
        {props.path === 'users' && <Users role={role} exp={exp} bal={bal} navigate={navigate}></Users>}
        {props.path === 'gl' && <Gl role={role} exp={exp} bal={bal} navigate={navigate}></Gl>}
        {props.path === 'customers' && <Customers role={role} exp={exp} bal={bal} navigate={navigate}></Customers>}
        
        {props.path === 'changepassword' && <ChangePassword role={role}  navigate={navigate}></ChangePassword>}
        {props.path === 'results' && <Results role={role} exp={exp} bal={bal} navigate={navigate}></Results>}
        {props.path === 'myplayersystem' && <MyPlayersSystem role={role} exp={exp} bal={bal} navigate={navigate}></MyPlayersSystem>}
        {props.path === 'bets' && <Bets role={role} exp={exp} bal={bal} navigate={navigate}></Bets>}
        {props.path === 'acsummary' && <AccountSummary role={role} exp={exp} bal={bal} navigate={navigate}></AccountSummary>}
      </React.Suspense>
    </HomeLayout>
    :
    null
    }
    </>
  );

};

export default HomeController;
