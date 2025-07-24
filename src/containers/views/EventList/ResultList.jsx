import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import Modal from "../../../components/Model";
import StoreContext from "../../../Store";
let home_team = [];

const ResultList = (props) => {
  const store = useContext(StoreContext);
  const [hometeam, setHomeTeam] = useState(home_team);

  const [marketList, setMarketList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setMessage] = useState("");

  const [errorClass, setErrorClass] = useState("alert alert-success");

  useEffect(() => {
    getMarkets();
  }, []);

  const getMarkets = async (e) => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    const urlencoded = {
      event_id: props.event_id,
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/event/getMarkets", requestOptions)
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.data) setMarketList(result.data);
        //home_team = result.data
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // console.log(home_team)
  return (
    <Modal
      closeModal={props.closeModal}
      title={props.title}
      sub_title={"#ID: " + props.event_id}
    >
      <div className="model-table-content">
        <div className="table-responsive mt-2">
          <table className="table table-bordered table-secondary table-sm ">
            <thead>
              <tr>
                <th width="5%" className="text-center px-2 py-0.5">
                  Sr.
                </th>
                <th className="px-2 py-1 text-left">Market</th>
                <th className="px-2 py-1 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
            {marketList.map((v, k) => (
              <tr key={k}>
                <td width={"5%"}>{k + 1}</td>
                <td>{v.market_name}</td>
                <td>
                <NavLink
                      className="btn btn-sm btn-dark ms-1"
                      to={"/result/" + v.event_id + "/" + props.event_type + "/" + v.main_market_id}
                    >
                      Set Result
                    </NavLink>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

export default ResultList;
