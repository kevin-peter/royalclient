import React from "react";
import { useParams } from 'react-router-dom';
import EventLayout from "../containers/layouts/EventLayout";
import Loader from '../utilities/Loader'



const EventData = React.lazy(() => import("../containers/views/EventData"));
const ScoreCard = React.lazy(() => import("../containers/views/EventData/ScoreCard"));

const EventController = (props) => {
  let { eventid, marketid } = useParams();
  return (
    <EventLayout title={"IND vs AUS"}>
      <React.Suspense fallback={<Loader></Loader>}>
        {props.path === 'eventdata' && <EventData marketid={marketid} eventid={eventid}></EventData>}
        {props.path === 'scoredata' && <ScoreCard marketid={marketid} eventid={eventid}></ScoreCard>}
        {props.path === '*' && <h1 className="text-center mt-10">Page Not Found</h1>}
      </React.Suspense>
    </EventLayout>
  );

};

export default EventController;
