import React, { useState } from "react";
import { useParams } from "react-router-dom";
import EventLayout from "../../../layouts/EventLayout"
const EventPage = React.lazy(() => import("./index"));
const MyMarket = React.lazy(() => import("./MyMarket"));

const EventController = () => {

  const { eventid, marketid, modeid } = useParams();
  let event_d_str = localStorage.getItem(eventid);
  let eventdata = [];
  if (event_d_str) {
    eventdata = JSON.parse(event_d_str);
  }
  let [exp, setExp] = useState(localStorage.getItem("exp") ? localStorage.getItem("exp") : "");
  let [bal, setBal] = useState(localStorage.getItem("bal") ? localStorage.getItem("bal") : "");
  let [eventname, setEvent] = useState(eventdata.eventname ? eventdata.eventname : "");
  let bet_str = localStorage.getItem("betlist_" + eventid);
  let btns = [];
  let btns_str = localStorage.getItem("btns") ? localStorage.getItem("btns") : "";
  let message = localStorage.getItem("message") ? localStorage.getItem("message") : "";
  let fcp = localStorage.getItem("fcp") ? localStorage.getItem("fcp") : "";
  const role = localStorage.getItem("rl") ? parseInt(localStorage.getItem("rl")) : "";
  let ps = localStorage.getItem("ps") ? localStorage.getItem("ps") : "";
  let play_mods = [];
  let play_mods_str = localStorage.getItem("client_play_mods") ? localStorage.getItem("client_play_mods") : "";
  if (play_mods_str) {
    play_mods = JSON.parse(play_mods_str);
  }
  let betdata = [];
  if (bet_str) {
    betdata = JSON.parse(bet_str);
  }
  if (btns_str) {
    btns = JSON.parse(btns_str);
  }
  if (parseInt(fcp) === 1) {
    window.location.href = process.env.PUBLIC_URL + "/changepassword";
    return null;
  }
  const setEventName = (nm) => {
    setEvent(nm)
  }
  const updateBal = (obj) => {
    if ('exp' in obj) {
      setExp(obj.exp);
      localStorage.setItem("exp", obj.exp);
    }
    if ('bal' in obj) {
      setBal(obj.bal);
      localStorage.setItem("bal", obj.bal);
    }
  }
  if (marketid && eventid) {
    return (
      <EventLayout eventname={eventname} role={role} message={message} bal={bal} exp={exp}>
        <React.Suspense fallback={""}>
          <EventPage
            modeid={parseInt(modeid)}
            eventid={eventid}
            marketid={marketid}
            betdata={betdata}
            eventdata={eventdata}
            btns={btns}
            ps={ps}
            role={role}
            setEventName={setEventName}
            updateBal={updateBal}
            play_mods={play_mods}
          />
        </React.Suspense>
      </EventLayout>
    );
  } else {
    let mymarket = localStorage.getItem("mymarket") ? JSON.parse(localStorage.getItem("mymarket")) : "";
    let marketid = [];
    for (let i = 0; i < mymarket.length; i++) {
      if (!marketid.includes(mymarket[i].market_id)) {
        marketid.push(mymarket[i].market_id)
      }
    }
    return (
      <EventLayout eventname="My Markets" role={role} message={message} bal={bal} exp={exp}>
        <React.Suspense fallback={""}>
          <MyMarket
            marketid={marketid}
            modeid={parseInt(modeid)}
            betdata={betdata}
            eventdata={eventdata}
            btns={btns}
            role={role}
            ps={ps}
            updateBal={updateBal}
          />
        </React.Suspense>
      </EventLayout>
    );
  }
};
export default EventController;
