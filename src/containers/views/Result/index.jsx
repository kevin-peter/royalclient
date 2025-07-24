import React, { useEffect, useState, useContext } from "react";
import { NavLink, useParams } from "react-router-dom";

import { GiCheckMark } from "react-icons/gi";
import StoreContext from "../../../Store";

import CreateEvent from "./CreateEvent";

const Result = (props) => {
  const store = useContext(StoreContext);
  let { eventid, eventtype } = useParams();
  const [market_id, setMarketId] = useState(0);
  const [marketList, setMarketList] = useState([]);

  const [loading, setLoading] = useState(false);
  // const [resultData, setResultData] = useState(false);
  const [eventData, setEventData] = useState(false);
  const [tossData, setTossData] = useState([]);
  const [pairEventRunners, setpairEventRunners] = useState(0);
  const [team, setTeam] = useState([]);
  const [activeMarkets, setActiveMarkets] = useState([]);

  // const [teamBetter, setBetterTeam] = useState([]);
  // const [teamBowler, setBowlerTeam] = useState([]);

  //Runners data container
  const [fieldsT1_NOCUT, setFieldsT1_NOCUT] = useState([]);
  const [fieldsT2_NOCUT, setFieldsT2_NOCUT] = useState([]);
  const [fieldsT1_CUT, setFieldsT1_CUT] = useState([]);
  const [fieldsT2_CUT, setFieldsT2_CUT] = useState([]);
  const [fieldsT1_NOCUT_W, setFieldsT1_NOCUT_W] = useState([]);
  const [fieldsT2_NOCUT_W, setFieldsT2_NOCUT_W] = useState([]);
  const [fieldsT1_CUT_W, setFieldsT1_CUT_W] = useState([]);
  const [fieldsT2_CUT_W, setFieldsT2_CUT_W] = useState([]);
  const [fieldsT1_TOP_BATTER, setFieldsT1_TOP_BATTER] = useState([]);
  const [fieldsT2_TOP_BATTER, setFieldsT2_TOP_BATTER] = useState([]);
  const [fieldsT1_TOP_BOWLER, setFieldsT1_TOP_BOWLER] = useState([]);
  const [fieldsT2_TOP_BOWLER, setFieldsT2_TOP_BOWLER] = useState([]);
  const [fieldsT1_ODD_EVEN, setFieldsT1_ODD_EVEN] = useState([]);
  const [fieldsT2_ODD_EVEN, setFieldsT2_ODD_EVEN] = useState([]);
  const [fieldsT1_SCORE, setFieldsT1_SCORE] = useState([]);
  const [fieldsT1_SCORE2, setFieldsT1_SCORE2] = useState([]);

  const [fieldsT1_PAIR_EVENT, setFieldsT1_PAIR_EVENT] = useState([]);
  const [fieldsT2_PAIR_EVENT, setFieldsT2_PAIR_EVENT] = useState([]);

  //Result market flag for revoke & update button
  const [resultRUNNOCUT, setResultRUNNOCUT] = useState(false);
  const [resultRUNCUT, setResultRUNCUT] = useState(false);
  const [resultWktNOCUT, setResultWktNOCUT] = useState(false);
  const [resultWktCUT, setResultWktCUT] = useState(false);
  const [resultTOP_BATTER, setResultTOP_BATTER] = useState(false);
  const [resultTOP_BOWLER, setResultTOP_BOWLER] = useState(false);
  const [resultODD_EVEN, setResultODD_EVEN] = useState(false);
  const [resultTOSS, setResultTOSS] = useState(false);
  const [resultFIRST_KHADO, setResultFIRST_KHADO] = useState(false);
  const [resultFIRST_SCORE, setResultFIRST_SCORE] = useState(false);
  const [resultPAIR_EVENT, setResultPAIR_EVENT] = useState(false);

  const [selectedMarket, setSelectedMarket] = useState("");

  useEffect(() => {
    getMarkets();
    getEvents();

    getRuns();
  }, []);

  const getMarkets = async (e) => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));

    const urlencoded = {
      event_id: eventid,
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

  const getEvents = async (e) => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));
    const urlencoded = {
      event_id: eventid,
    };
    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(
      import.meta.env.VITE_API_HOST + "/result/getEventRunners",
      requestOptions
    )
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.data) setTeam(result.data);
        if (result.activeMarkets) setActiveMarkets(result.activeMarkets);
        // if (result.runsmktdata) setBetterTeam(result.runsmktdata);
        // if (result.wktmktdata) setBowlerTeam(result.wktmktdata);
        if (result.event) setEventData(result.event);
        if (result.toss) setTossData(result.toss);
        if (result.pair_event_runners)
          setpairEventRunners(result.pair_event_runners);

        //console.log(result.data.length);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  //get run & wickets both
  const getRuns = async (e) => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));
    const urlencoded = {
      event_id: eventid,
      eventtype: eventtype,
      result_type: "RUN",
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/result/getResults", requestOptions)
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        let markets = [];

        //******************************TOSS************ */
        if (result.result_toss.length > 0) {
          setResultTOSS(result.result_toss);
        }

        //******************1ST INNING KHADO**********

        //team1 runs
        if (result.result_1st_inning_khado.length > 0) {
          let fields1 = { ...fieldsT1_SCORE };

          for (let i = 0; i < result.result_1st_inning_khado.length; i++) {
            fields1 = {
              ...fields1,
              [result.result_1st_inning_khado[i][0]]:
                result.result_1st_inning_khado[i][1],
            };
          }

          setFieldsT1_SCORE(fields1);
          setResultFIRST_KHADO(true);
        }

        //******************1ST INNING TOTAL SCORE**********
        //team1 runs
        if (result.result_1st_inning_total_score.length > 0) {
          let fields1 = { ...fieldsT1_SCORE2 };

          for (
            let i = 0;
            i < result.result_1st_inning_total_score.length;
            i++
          ) {
            fields1 = {
              ...fields1,
              [result.result_1st_inning_total_score[i][0]]:
                result.result_1st_inning_total_score[i][1],
            };
          }

          setFieldsT1_SCORE2(fields1);
          setResultFIRST_SCORE(true);
        }

        //************************NO CUT RUN************ */
        //team1 runs
        if (result.runs_team1_nocut.length > 0) {
          let fields1 = { ...fieldsT1_NOCUT };

          for (let i = 0; i < result.runs_team1_nocut.length; i++) {
            fields1 = {
              ...fields1,
              [result.runs_team1_nocut[i][0]]: result.runs_team1_nocut[i][1],
            };
          }

          setFieldsT1_NOCUT(fields1);
        }

        //team2 runs
        if (result.runs_team2_nocut.length > 0) {
          let fields2 = { ...fieldsT2_NOCUT };

          for (let i = 0; i < result.runs_team2_nocut.length; i++) {
            fields2 = {
              ...fields2,
              [result.runs_team2_nocut[i][0]]: result.runs_team2_nocut[i][1],
            };
          }

          setFieldsT2_NOCUT(fields2);
          setResultRUNNOCUT(true);
        }

        //*************************2. CUT RUN************ */
        //team1 runs
        if (result.runs_team1_cut.length > 0) {
          let fields1 = { ...fieldsT1_CUT };

          for (let i = 0; i < result.runs_team1_cut.length; i++) {
            fields1 = {
              ...fields1,
              [result.runs_team1_cut[i][0]]: result.runs_team1_cut[i][1],
            };
          }

          setFieldsT1_CUT(fields1);
        }

        //team2 runs cut
        if (result.runs_team2_cut.length > 0) {
          let fields2 = { ...fieldsT2_CUT };

          for (let i = 0; i < result.runs_team2_cut.length; i++) {
            fields2 = {
              ...fields2,
              [result.runs_team2_cut[i][0]]: result.runs_team2_cut[i][1],
            };
          }

          setFieldsT2_CUT(fields2);
          setResultRUNCUT(true);
        }

        //**************3. NO_CUT WICKET************************************** */

        //team 1 wicket
        if (result.wickets_team1_nocut.length > 0) {
          //team1 wickets
          let fields1 = { ...fieldsT1_NOCUT_W };
          for (let i = 0; i < result.wickets_team1_nocut.length; i++) {
            fields1 = {
              ...fields1,
              [result.wickets_team1_nocut[i][0]]:
                result.wickets_team1_nocut[i][1],
            };
          }
          setFieldsT1_NOCUT_W(fields1);
        }
        //team2
        if (result.wickets_team2_nocut.length > 0) {
          let fields2 = { ...fieldsT2_NOCUT_W };
          for (let i = 0; i < result.wickets_team2_nocut.length; i++) {
            fields2 = {
              ...fields2,
              [result.wickets_team2_nocut[i][0]]:
                result.wickets_team2_nocut[i][1],
            };
          }

          setFieldsT2_NOCUT_W(fields2);
          setResultWktNOCUT(true);
        }

        //4. CUT WICKET************ */

        //team 1
        if (result.wickets_team1_cut.length > 0) {
          //team1 wickets
          let fields1 = { ...fieldsT1_CUT_W };
          for (let i = 0; i < result.wickets_team1_cut.length; i++) {
            fields1 = {
              ...fields1,
              [result.wickets_team1_cut[i][0]]: result.wickets_team1_cut[i][1],
            };
          }
          setFieldsT1_CUT_W(fields1);
        }
        //team2
        if (result.wickets_team2_cut.length > 0) {
          let fields2 = { ...fieldsT2_NOCUT_W };
          for (let i = 0; i < result.wickets_team2_cut.length; i++) {
            fields2 = {
              ...fields2,
              [result.wickets_team2_cut[i][0]]: result.wickets_team2_cut[i][1],
            };
          }

          setFieldsT2_CUT_W(fields2);
          setResultWktCUT(true);
        }

        //*****************TOP BATTER RUN********************** */
        //team1 runs
        if (result.runs_team1_top.length > 0) {
          let fields1 = { ...fieldsT1_TOP_BATTER };

          for (let i = 0; i < result.runs_team1_top.length; i++) {
            fields1 = {
              ...fields1,
              [result.runs_team1_top[i][0]]: result.runs_team1_top[i][1],
            };
          }

          setFieldsT1_TOP_BATTER(fields1);
        }

        //team2 runs
        if (result.runs_team2_top.length > 0) {
          let fields2 = { ...fieldsT2_TOP_BATTER };

          for (let i = 0; i < result.runs_team2_top.length; i++) {
            fields2 = {
              ...fields2,
              [result.runs_team2_top[i][0]]: result.runs_team2_top[i][1],
            };
          }

          setFieldsT2_TOP_BATTER(fields2);
          setResultTOP_BATTER(true);
        }

        //****************TOP BOWLER RUN***************************** */
        //team1 runs
        if (result.runs_team1_top_bowler.length > 0) {
          let fields1 = { ...fieldsT1_TOP_BOWLER };

          for (let i = 0; i < result.runs_team1_top_bowler.length; i++) {
            fields1 = {
              ...fields1,
              [result.runs_team1_top_bowler[i][0]]:
                result.runs_team1_top_bowler[i][1],
            };
          }

          setFieldsT1_TOP_BOWLER(fields1);
        }

        //team2 runs
        if (result.runs_team2_top_bowler.length > 0) {
          let fields2 = { ...fieldsT2_TOP_BATTER };

          for (let i = 0; i < result.runs_team2_top_bowler.length; i++) {
            fields2 = {
              ...fields2,
              [result.runs_team2_top_bowler[i][0]]:
                result.runs_team2_top_bowler[i][1],
            };
          }

          setFieldsT2_TOP_BOWLER(fields2);
          setResultTOP_BOWLER(true);
        }

        //*****************ODD_EVEN RUN****************************** */
        //team1 runs
        if (result.runs_team1_odd_even.length > 0) {
          let fields1 = { ...fieldsT1_ODD_EVEN };

          for (let i = 0; i < result.runs_team1_odd_even.length; i++) {
            fields1 = {
              ...fields1,
              [result.runs_team1_odd_even[i][0]]:
                result.runs_team1_odd_even[i][1],
            };
          }

          setFieldsT1_ODD_EVEN(fields1);
        }

        //team2 runs
        if (result.runs_team2_odd_even.length > 0) {
          let fields2 = { ...fieldsT2_ODD_EVEN };

          for (let i = 0; i < result.runs_team2_odd_even.length; i++) {
            fields2 = {
              ...fields2,
              [result.runs_team2_odd_even[i][0]]:
                result.runs_team2_odd_even[i][1],
            };
          }

          setFieldsT2_ODD_EVEN(fields2);
          setResultODD_EVEN(true);
        }

        //***************** PAIR_EVENT RUNS****************************** */
        //team1 runs
        if (result.runs_team1_pairEvent.length > 0) {
          let fields1 = { ...fieldsT1_PAIR_EVENT };

          for (let i = 0; i < result.runs_team1_pairEvent.length; i++) {
            fields1 = {
              ...fields1,
              [result.runs_team1_pairEvent[i][0]]:
                result.runs_team1_pairEvent[i][1],
            };
          }

          setFieldsT1_PAIR_EVENT(fields1);
        }

        //team2 runs
        if (result.runs_team2_pairEvent.length > 0) {
          let fields2 = { ...fieldsT2_PAIR_EVENT };

          for (let i = 0; i < result.runs_team2_pairEvent.length; i++) {
            fields2 = {
              ...fields2,
              [result.runs_team2_pairEvent[i][0]]:
                result.runs_team2_pairEvent[i][1],
            };
          }

          setFieldsT2_PAIR_EVENT(fields2);
          setResultPAIR_EVENT(true);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /*
   * Batter Runs Player Runs Score No_CUT, CUT, TOP_BATTER
   */

  const resultRun = async (mType, t1, t2, revoke) => {
    setLoading(true);

    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));
    const urlencoded = {
      event_id: eventid,
      eventtype: eventtype,
      fieldsT1: t1,
      fieldsT2: t2,
      event_name: eventData[0] ? eventData[0].event_name : null,
      type: "runs",
      mType: mType,
      revoke: revoke,
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/result/updateRuns", requestOptions)
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (revoke == "yes" && mType == "NO_CUT") {
          setResultRUNNOCUT(false);

          let fields1 = { ...fieldsT1_NOCUT };
          let fields2 = { ...fieldsT2_NOCUT };
          team.forEach((item) => {
            if (item["main_market_id"] == 1 && item["team"] == 1) {
              fields1[item["runnerId"]] = "";
            }
          });
          team.forEach((item) => {
            if (item["main_market_id"] == 1 && item["team"] == 2) {
              fields2[item["runnerId"]] = "";
            }
          });

          setFieldsT1_NOCUT(fields1);
          setFieldsT2_NOCUT(fields2);
        }

        if (revoke == "yes" && mType == "CUT") {
          setResultRUNCUT(false);

          let fields1 = { ...fieldsT1_CUT };
          let fields2 = { ...fieldsT2_CUT };
          team.forEach((item) => {
            if (item["main_market_id"] == 2 && item["team"] == 1) {
              fields1[item["runnerId"]] = "";
            }
          });
          team.forEach((item) => {
            if (item["main_market_id"] == 2 && item["team"] == 2) {
              fields2[item["runnerId"]] = "";
            }
          });

          setFieldsT1_CUT(fields1);
          setFieldsT2_CUT(fields2);
        }

        if (revoke == "yes" && mType == "TOP_BATTER") {
          setResultTOP_BATTER(false);

          let fields1 = { ...fieldsT1_TOP_BATTER };
          let fields2 = { ...fieldsT2_TOP_BATTER };
          team.forEach((item) => {
            if (item["main_market_id"] == 8 && item["team"] == 1) {
              fields1[item["runnerId"]] = "";
            }
          });
          team.forEach((item) => {
            if (item["main_market_id"] == 8 && item["team"] == 2) {
              fields2[item["runnerId"]] = "";
            }
          });

          setFieldsT1_TOP_BATTER(fields1);
          setFieldsT2_TOP_BATTER(fields2);
        }

        if (revoke == "yes" && mType == "TOP_BOWLER") {
          setResultTOP_BOWLER(false);

          let fields1 = { ...fieldsT1_TOP_BOWLER };
          let fields2 = { ...fieldsT2_TOP_BOWLER };
          team.forEach((item) => {
            if (item["main_market_id"] == 10 && item["team"] == 1) {
              fields1[item["runnerId"]] = "";
            }
          });
          team.forEach((item) => {
            if (item["main_market_id"] == 10 && item["team"] == 2) {
              fields2[item["runnerId"]] = "";
            }
          });

          setFieldsT1_TOP_BOWLER(fields1);
          setFieldsT2_TOP_BOWLER(fields2);
        }

        if (revoke == "yes" && mType == "ODD_EVEN") {
          setResultODD_EVEN(false);

          let fields1 = { ...fieldsT1_ODD_EVEN };
          let fields2 = { ...fieldsT2_ODD_EVEN };
          team.forEach((item) => {
            if (item["main_market_id"] == 3 && item["team"] == 1) {
              fields1[item["runnerId"]] = "";
            }
          });
          team.forEach((item) => {
            if (item["main_market_id"] == 3 && item["team"] == 2) {
              fields2[item["runnerId"]] = "";
            }
          });

          setFieldsT1_ODD_EVEN(fields1);
          setFieldsT2_ODD_EVEN(fields2);
        }

        if (revoke == "yes" && mType == "PAIR_EVENT") {
          
          setResultPAIR_EVENT(false);
          
          let fields1 = { ...fieldsT1_PAIR_EVENT };
          let fields2 = { ...fieldsT2_PAIR_EVENT };
          let i = 0;
          team.forEach((item) => {
            if (item["main_market_id"] == 9 && item["team"] == 1) {
              //fields1[item["runnerId"]] = "";
              fields1[i] = "";
              i++;
            }
          });
          i = 0;
          team.forEach((item) => {
            if (item["main_market_id"] == 9 && item["team"] == 2) {
              //fields2[item["runnerId"]] = "";
              fields2[i] = "";
              i++;
            }
          });

          console.log(team);
          console.log(fieldsT1_PAIR_EVENT);
          setFieldsT1_PAIR_EVENT(fields1);
          setFieldsT2_PAIR_EVENT(fields2);
        }

        if (revoke == "yes" && mType == "1ST_INNING_KHADO") {
          setResultFIRST_KHADO(false);

          let fields1 = { ...fieldsT1_SCORE };
          let fields2 = [];
          team.forEach((item) => {
            if (item["main_market_id"] == 4 && item["team"] == 1) {
              fields1[item["runnerId"]] = "";
            }
          });

          setFieldsT1_SCORE(fields1);
          //setFieldsT2_SCORE(fields2);
        }

        if (revoke == "yes" && mType == "1ST_INNING_TOTAL_SCORE") {
          setResultFIRST_SCORE(false);

          let fields1 = { ...fieldsT1_SCORE2 };
          let fields2 = [];
          team.forEach((item) => {
            if (item["main_market_id"] == 5 && item["team"] == 1) {
              fields1[item["runnerId"]] = "";
            }
          });

          setFieldsT1_SCORE2(fields1);
          //setFieldsT2_SCORE(fields2);
        }

        getRuns();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const mTypeValue = event.target.elements.mType.value;
    const revokeValue = event.target.elements.revoke.value;

    if (mTypeValue == "NO_CUT") {
      resultRun(mTypeValue, fieldsT1_NOCUT, fieldsT2_NOCUT, revokeValue);
    }
    if (mTypeValue == "CUT") {
      resultRun(mTypeValue, fieldsT1_CUT, fieldsT2_CUT, revokeValue);
    }
    if (mTypeValue == "TOP_BATTER") {
      resultRun(
        mTypeValue,
        fieldsT1_TOP_BATTER,
        fieldsT2_TOP_BATTER,
        revokeValue
      );
    }

    if (mTypeValue == "TOP_BOWLER") {
      resultRun(
        mTypeValue,
        fieldsT1_TOP_BOWLER,
        fieldsT2_TOP_BOWLER,
        revokeValue
      );
    }

    if (mTypeValue == "ODD_EVEN") {
      resultRun(mTypeValue, fieldsT1_ODD_EVEN, fieldsT2_ODD_EVEN, revokeValue);
    }

    if (mTypeValue == "1ST_INNING_KHADO") {
      resultRun(mTypeValue, fieldsT1_SCORE, "-", revokeValue);
    }

    if (mTypeValue == "1ST_INNING_TOTAL_SCORE") {
      resultRun(mTypeValue, fieldsT1_SCORE2, "-", revokeValue);
    }

    if (mTypeValue == "PAIR_EVENT") {
      resultRun(mTypeValue, fieldsT1_PAIR_EVENT, fieldsT2_PAIR_EVENT, revokeValue);
    }
  };

  function handleChangeT1NOCUT(i, event) {
    const { name, value } = event.target;
    setFieldsT1_NOCUT({
      ...fieldsT1_NOCUT,
      [name]: value,
    });
  }

  function handleChangeT2NOCUT(i, event) {
    const { name, value } = event.target;
    setFieldsT2_NOCUT({
      ...fieldsT2_NOCUT,
      [name]: value,
    });
  }

  function handleChangeT1CUT(i, event) {
    const { name, value } = event.target;
    setFieldsT1_CUT({
      ...fieldsT1_CUT,
      [name]: value,
    });
  }

  function handleChangeT2CUT(i, event) {
    const { name, value } = event.target;
    setFieldsT2_CUT({
      ...fieldsT2_CUT,
      [name]: value,
    });
  }

  function handleChangeT1_TOP_BATTER(i, event) {
    const { name, value } = event.target;
    setFieldsT1_TOP_BATTER({
      ...fieldsT1_TOP_BATTER,
      [name]: value,
    });
  }

  function handleChangeT2_TOP_BATTER(i, event) {
    const { name, value } = event.target;
    setFieldsT2_TOP_BATTER({
      ...fieldsT2_TOP_BATTER,
      [name]: value,
    });
  }

  function handleChangeT1_ODD_EVEN(i, event) {
    const { name, value } = event.target;
    setFieldsT1_ODD_EVEN({
      ...fieldsT1_ODD_EVEN,
      [name]: value,
    });
  }

  function handleChangeT2_ODD_EVEN(i, event) {
    const { name, value } = event.target;
    setFieldsT2_ODD_EVEN({
      ...fieldsT2_ODD_EVEN,
      [name]: value,
    });
  }

  function handleChangeT1_PAIR_EVENT(i, event) {
    const { name, value } = event.target;
    
    setFieldsT1_PAIR_EVENT({
      ...fieldsT1_PAIR_EVENT,
      [name]: value,
    });
  }

  function handleChangeT2_PAIR_EVENT(i, event) {
    const { name, value } = event.target;
    setFieldsT2_PAIR_EVENT({
      ...fieldsT2_PAIR_EVENT,
      [name]: value,
    });
  }

  function handleChangeT1_SCORE(i, event, mk) {
    const { name, value } = event.target;

    if (mk == "1ST_INNING_KHADO") {
      setFieldsT1_SCORE({
        ...fieldsT1_SCORE,
        [name]: value,
      });
    } else if (mk == "1ST_INNING_TOTAL_SCORE") {
      setFieldsT1_SCORE2({
        ...fieldsT1_SCORE2,
        [name]: value,
      });
    }
  }
  /*
   * Wickets Markets
   * Bowler Wicket Player Wickets Score WKT_NO_CUT, WKTCUT, TOP_BOWLER
   */

  const updateWickets = async (mType, t1, t2, revoke) => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));
    const urlencoded = {
      event_id: eventid,
      eventtype: eventtype,
      fieldsT1: t1,
      fieldsT2: t2,
      event_name: eventData[0] ? eventData[0].event_name : null,
      type: "wickets",
      mType: mType,
      revoke: revoke,
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/result/updateRuns", requestOptions)
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (revoke == "yes" && mType == "NO_CUT") {
          setResultWktNOCUT(false);

          let fields1 = { ...fieldsT1_NOCUT_W };
          let fields2 = { ...fieldsT2_NOCUT_W };
          team.forEach((item) => {
            if (item["main_market_id"] == 7 && item["team"] == 1) {
              fields1[item["runnerId"]] = "";
            }
          });
          team.forEach((item) => {
            if (item["main_market_id"] == 7 && item["team"] == 2) {
              fields2[item["runnerId"]] = "";
            }
          });

          setFieldsT1_NOCUT_W(fields1);
          setFieldsT2_NOCUT_W(fields2);
        }

        if (revoke == "yes" && mType == "CUT") {
          setResultWktCUT(false);

          let fields1 = { ...fieldsT1_CUT_W };
          let fields2 = { ...fieldsT2_CUT_W };
          team.forEach((item) => {
            if (item["main_market_id"] == 6 && item["team"] == 1) {
              fields1[item["runnerId"]] = "";
            }
          });
          team.forEach((item) => {
            if (item["main_market_id"] == 6 && item["team"] == 2) {
              fields2[item["runnerId"]] = "";
            }
          });

          setFieldsT1_CUT_W(fields1);
          setFieldsT2_CUT_W(fields2);
        }

        getRuns();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmitWkt = async (event) => {
    event.preventDefault();
    const mTypeValue = event.target.elements.mType.value;
    const revokeValue = event.target.elements.revoke.value;

    if (mTypeValue == "NO_CUT") {
      updateWickets(
        mTypeValue,
        fieldsT1_NOCUT_W,
        fieldsT2_NOCUT_W,
        revokeValue
      );
    }
    if (mTypeValue == "CUT") {
      updateWickets(mTypeValue, fieldsT1_CUT_W, fieldsT2_CUT_W, revokeValue);
    }
    //updateWickets();
  };

  function handleChangeT1WktNOCUT(i, event) {
    const { name, value } = event.target;
    setFieldsT1_NOCUT_W({
      ...fieldsT1_NOCUT_W,
      [name]: value,
    });
  }

  function handleChangeT2WktNOCUT(i, event) {
    const { name, value } = event.target;
    setFieldsT2_NOCUT_W({
      ...fieldsT2_NOCUT_W,
      [name]: value,
    });
  }

  function handleChangeT1WktCUT(i, event) {
    const { name, value } = event.target;
    setFieldsT1_CUT_W({
      ...fieldsT1_CUT_W,
      [name]: value,
    });
  }

  function handleChangeT2WktCUT(i, event) {
    const { name, value } = event.target;
    setFieldsT2_CUT_W({
      ...fieldsT2_CUT_W,
      [name]: value,
    });
  }

  function handleChangeT1_TOP_BOWLER(i, event) {
    const { name, value } = event.target;
    setFieldsT1_TOP_BOWLER({
      ...fieldsT1_TOP_BOWLER,
      [name]: value,
    });
  }

  function handleChangeT2_TOP_BOWLER(i, event) {
    const { name, value } = event.target;
    setFieldsT2_TOP_BOWLER({
      ...fieldsT2_TOP_BOWLER,
      [name]: value,
    });
  }

  /*
   * TOSS Markets
   */

  const updateToss = async (mType, team, revoke) => {
    setLoading(true);
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + store.getItem("jwt"));
    const urlencoded = {
      event_id: eventid,
      eventtype: eventtype,
      team: team,
      t1: tossData[0].runnerId,
      t2: tossData[1].runnerId,
      event_name: eventData[0] ? eventData[0].event_name : null,
      type: "toss",
      mType: mType,
      revoke: revoke,
    };

    let requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(urlencoded),
    };

    fetch(import.meta.env.VITE_API_HOST + "/result/updateToss", requestOptions)
      .then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (revoke == "yes" && mType == "TOSS") {
          setResultTOSS(false);
        }
        getRuns();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmitToss = async (event) => {
    event.preventDefault();
    const mTypeValue = event.target.elements.mType.value;
    const team = event.target.elements.team.value;
    const revokeValue = event.target.elements.revoke.value;
    //console.log(team);

    if (mTypeValue == "TOSS") {
      updateToss(mTypeValue, team, revokeValue);
    }
  };

  // Handler for when the selection changes
  const handleMarketChange = (e) => {
    setSelectedMarket(e.target.value);
    setMarketId(e.target.value);
  };

  //console.log(activeMarkets);
  //console.log(fieldsT1_PAIR_EVENT)

  return (
    <>
      <div className="row">
        <div className="col-12 mt-3">
          <select
            name="market"
            value={selectedMarket} // Bind to state
            onChange={handleMarketChange} // Handle selection change
          >
            <option value="">Select Market</option>
            {marketList.map((v) => (
              <option key={v.main_market_id} value={v.main_market_id}>
                {v.market_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row" key="results">
        {activeMarkets.includes(11) && market_id == 11 && (
          <div className="col-12 col-md-4 p-2  ">
            <div className="card">
              <div className="card-body">
                <div className="card-title">
                  <h5 className="text-left text-border text-dark font-weight-bold text-xl-left">
                    {eventData[0] ? eventData[0].event_name : null}
                  </h5>
                  <h4>TOSS</h4>
                </div>
                <div className="container">
                  <form onSubmit={handleSubmitToss}>
                    <input type="hidden" name="mType" value="TOSS" />
                    <div className="row">
                      <div className="col-6">
                        {resultTOSS === false && (
                          <input
                            className="form-check-input"
                            type="radio"
                            name="team"
                            id={tossData[0].runnerId}
                            value={tossData[0].runnerId}
                            // checked={resultTOSS === tossData[0].runnerId}
                          />
                        )}
                        <label className="form-check-label" htmlFor="team1">
                          {tossData[0].name}
                          {resultTOSS == tossData[0].runnerId && (
                            <GiCheckMark className="w-6 text-success"></GiCheckMark>
                          )}
                        </label>
                      </div>
                      <div className="col-6">
                        {resultTOSS === false && (
                          <input
                            className="form-check-input"
                            type="radio"
                            name="team"
                            id={tossData[1].runnerId}
                            value={tossData[1].runnerId}
                            // checked={resultTOSS === tossData[1].runnerId}
                          />
                        )}
                        <label className="form-check-label" htmlFor="team2">
                          {tossData[1].name}
                          {resultTOSS == tossData[1].runnerId && (
                            <GiCheckMark className="w-6 text-dark"></GiCheckMark>
                          )}
                        </label>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col mt-2">
                        {resultTOSS == false ? (
                          <>
                            <input type="hidden" name="revoke" value="no" />
                            <button
                              type="submit"
                              className="btn btn-lg btn-success float-right"
                            >
                              Update
                            </button>
                          </>
                        ) : (
                          <>
                            <input type="hidden" name="revoke" value="yes" />
                            <input
                              type="hidden"
                              name="team"
                              value={resultTOSS}
                            />
                            <button
                              type="submit"
                              className="btn btn-lg btn-danger float-left"
                            >
                              Revoke
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMarkets.includes(1) && market_id == 1 && (
          <div className="col-12 col-md-4 p-2  ">
            <div className="card">
              <div className="card-body">
                <div className="btn btn-sm btn-light">
                  <div className="card-title">
                    <h6 className="text-left text-border text-dark font-weight-bold text-xl-left">
                      {eventData[0] ? eventData[0].event_name : null}
                    </h6>
                    <h4 className="">NO_CUT RUNS MARKET</h4>
                  </div>
                  <div className="container">
                    <form onSubmit={handleSubmit}>
                      <input type="hidden" name="mType" value="NO_CUT" />
                      <div className="row">
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team1 : "Team-1"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] == 1 &&
                                item["team"] == 1 && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={fieldsT1_NOCUT[item["runnerId"]]}
                                        onChange={(e) =>
                                          handleChangeT1NOCUT(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team2 : "Team-2"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] === 1 &&
                                item["team"] === "2" && (
                                  <React.Fragment key={index}>
                                    {/* <li
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                    key={index}
                                  > */}
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={fieldsT2_NOCUT[item["runnerId"]]}
                                        onChange={(e) =>
                                          handleChangeT2NOCUT(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col mt-2">
                          {resultRUNNOCUT == false ? (
                            <>
                              <input type="hidden" name="revoke" value="no" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-success float-right"
                              >
                                Update
                              </button>
                            </>
                          ) : (
                            <>
                              <input type="hidden" name="revoke" value="yes" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-danger float-left"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMarkets.includes(2) && market_id == 2 && (
          <div className="col-12 col-md-4 p-2  ">
            <div className="card">
              <div className="card-body">
                <div className="btn btn-sm btn-light">
                  <div className="card-title">
                    <h6 className="text-left text-border text-dark font-weight-bold text-xl-left">
                      {eventData[0] ? eventData[0].event_name : null}
                    </h6>
                    <h4 className="">CUT RUN MARKET</h4>
                  </div>
                  <div className="container">
                    <form onSubmit={handleSubmit}>
                      <input type="hidden" name="mType" value="CUT" />
                      <div className="row">
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team1 : "Team-1"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] == 2 &&
                                item["team"] == 1 && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={fieldsT1_CUT[item["runnerId"]]}
                                        onChange={(e) =>
                                          handleChangeT1CUT(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team2 : "Team-2"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] === 2 &&
                                item["team"] === "2" && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={fieldsT2_CUT[item["runnerId"]]}
                                        onChange={(e) =>
                                          handleChangeT2CUT(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col mt-2">
                          {resultRUNCUT == false ? (
                            <>
                              <input type="hidden" name="revoke" value="no" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-success float-right"
                              >
                                Update
                              </button>
                            </>
                          ) : (
                            <>
                              <input type="hidden" name="revoke" value="yes" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-danger float-left"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMarkets.includes(7) && market_id == 7 && (
          <div className="col-12 col-md-4 p-2  ">
            <div className="card">
              <div className="card-body">
                <div className="btn btn-sm btn-light">
                  <div className="card-title">
                    <h5 className="text-left text-border text-dark font-weight-bold text-xl-left">
                      {eventData[0] ? eventData[0].event_name : null}
                    </h5>
                    <h4>NO_CUT BOWLER WICKETS</h4>
                  </div>
                  <div className="container">
                    <form onSubmit={handleSubmitWkt}>
                      <input type="hidden" name="mType" value="NO_CUT" />
                      <div className="row">
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team1 : "Team-1"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] == 7 &&
                                item["team"] == 1 && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={
                                          fieldsT1_NOCUT_W[item["runnerId"]]
                                        }
                                        onChange={(e) =>
                                          handleChangeT1WktNOCUT(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team2 : "Team-2"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] === 7 &&
                                item["team"] === "2" && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={
                                          fieldsT2_NOCUT_W[item["runnerId"]]
                                        }
                                        onChange={(e) =>
                                          handleChangeT2WktNOCUT(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col mt-2">
                          {resultWktNOCUT == false ? (
                            <>
                              <input type="hidden" name="revoke" value="no" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-success float-right"
                              >
                                Update
                              </button>
                            </>
                          ) : (
                            <>
                              <input type="hidden" name="revoke" value="yes" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-danger float-left"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMarkets.includes(6) && market_id == 6 && (
          <div className="col-12 col-md-4 p-2  ">
            <div className="card">
              <div className="card-body">
                <div className="btn btn-sm btn-light">
                  <div className="card-title">
                    <h5 className="text-left text-border text-dark font-weight-bold text-xl-left">
                      {eventData[0] ? eventData[0].event_name : null}
                    </h5>
                    <h4>CUT BOWLER WICKETS</h4>
                  </div>
                  <div className="container">
                    <form onSubmit={handleSubmitWkt}>
                      <input type="hidden" name="mType" value="CUT" />
                      <div className="row">
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team1 : "Team-1"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] == 6 &&
                                item["team"] == 1 && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={fieldsT1_CUT_W[item["runnerId"]]}
                                        onChange={(e) =>
                                          handleChangeT1WktCUT(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team2 : "Team-2"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] === 6 &&
                                item["team"] === "2" && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={fieldsT2_CUT_W[item["runnerId"]]}
                                        onChange={(e) =>
                                          handleChangeT2WktCUT(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col mt-2">
                          {resultWktCUT == false ? (
                            <>
                              <input type="hidden" name="revoke" value="no" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-success float-right"
                              >
                                Update
                              </button>
                            </>
                          ) : (
                            <>
                              <input type="hidden" name="revoke" value="yes" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-danger float-left"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMarkets.includes(8) && market_id == 8 && (
          <div className="col-12 col-md-4 p-2  ">
            <div className="card">
              <div className="card-body">
                <div className="btn btn-sm btn-light">
                  <div className="card-title">
                    <h6 className="text-left text-border text-dark font-weight-bold text-xl-left">
                      {eventData[0] ? eventData[0].event_name : null}
                    </h6>
                    <h4 className="">TOP BATTER</h4>
                  </div>
                  <div className="container">
                    <form onSubmit={handleSubmit}>
                      <input type="hidden" name="mType" value="TOP_BATTER" />
                      <div className="row">
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team1 : "Team-1"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] == 8 &&
                                item["team"] == 1 && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={
                                          fieldsT1_TOP_BATTER[item["runnerId"]]
                                        }
                                        onChange={(e) =>
                                          handleChangeT1_TOP_BATTER(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team2 : "Team-2"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] === 8 &&
                                item["team"] === "2" && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={
                                          fieldsT2_TOP_BATTER[item["runnerId"]]
                                        }
                                        onChange={(e) =>
                                          handleChangeT2_TOP_BATTER(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col mt-2">
                          {resultTOP_BATTER == false ? (
                            <>
                              <input type="hidden" name="revoke" value="no" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-success float-right"
                              >
                                Update
                              </button>
                            </>
                          ) : (
                            <>
                              <input type="hidden" name="revoke" value="yes" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-danger float-left"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMarkets.includes(10) && market_id == 10 && (
          <div className="col-12 col-md-4 p-2  ">
            <div className="card">
              <div className="card-body">
                <div className="btn btn-sm btn-light">
                  <div className="card-title">
                    <h6 className="text-left text-border text-dark font-weight-bold text-xl-left">
                      {eventData[0] ? eventData[0].event_name : null}
                    </h6>
                    <h4 className="">TOP BOWLER</h4>
                  </div>
                  <div className="container">
                    <form onSubmit={handleSubmit}>
                      <input type="hidden" name="mType" value="TOP_BOWLER" />
                      <div className="row">
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team1 : "Team-1"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] == 10 &&
                                item["team"] == 1 && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={
                                          fieldsT1_TOP_BOWLER[item["runnerId"]]
                                        }
                                        onChange={(e) =>
                                          handleChangeT1_TOP_BOWLER(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team2 : "Team-2"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] === 10 &&
                                item["team"] === "2" && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={
                                          fieldsT2_TOP_BOWLER[item["runnerId"]]
                                        }
                                        onChange={(e) =>
                                          handleChangeT2_TOP_BOWLER(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col mt-2">
                          {resultTOP_BOWLER == false ? (
                            <>
                              <input type="hidden" name="revoke" value="no" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-success float-right"
                              >
                                Update
                              </button>
                            </>
                          ) : (
                            <>
                              <input type="hidden" name="revoke" value="yes" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-danger float-left"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMarkets.includes(3) && market_id == 3 && (
          <div className="col-12 col-md-4 p-2  ">
            <div className="card">
              <div className="card-body">
                <div className="btn btn-sm btn-light">
                  <div className="card-title">
                    <h6 className="text-left text-border text-dark font-weight-bold text-xl-left">
                      {eventData[0] ? eventData[0].event_name : null}
                    </h6>
                    <h4 className="">ODD-EVEN RUNS</h4>
                  </div>
                  <div className="container">
                    <form onSubmit={handleSubmit}>
                      <input type="hidden" name="mType" value="ODD_EVEN" />
                      <div className="row">
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team1 : "Team-1"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] == 3 &&
                                item["team"] == 1 && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={
                                          fieldsT1_ODD_EVEN[item["runnerId"]]
                                        }
                                        onChange={(e) =>
                                          handleChangeT1_ODD_EVEN(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team2 : "Team-2"}
                            </li>
                            {team.map(
                              (item, index) =>
                                item["main_market_id"] === 3 &&
                                item["team"] === "2" && (
                                  <React.Fragment key={index}>
                                    <li
                                      className="list-group-item list-group-item-secondary"
                                      key={index}
                                    >
                                      <input
                                        key={index}
                                        type="text"
                                        name={item["runnerId"]}
                                        className="form-control form-control-sm"
                                        value={
                                          fieldsT2_ODD_EVEN[item["runnerId"]]
                                        }
                                        onChange={(e) =>
                                          handleChangeT2_ODD_EVEN(item, e)
                                        }
                                        required
                                      />

                                      <span className="">{item["name"]}</span>
                                    </li>
                                  </React.Fragment>
                                )
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col mt-2">
                          {resultODD_EVEN == false ? (
                            <>
                              <input type="hidden" name="revoke" value="no" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-success float-right"
                              >
                                Update
                              </button>
                            </>
                          ) : (
                            <>
                              <input type="hidden" name="revoke" value="yes" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-danger float-left"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMarkets.includes(4) && market_id == 4 && (
          <div className="col-12 col-md-4 p-2  ">
            <div className="card">
              <div className="card-body">
                <div className="btn btn-sm btn-light">
                  <div className="card-title">
                    <h6 className="text-left text-border text-dark font-weight-bold text-xl-left">
                      {eventData[0] ? eventData[0].event_name : null}
                    </h6>
                    <h4 className="">1ST INNING KHADO</h4>
                  </div>
                  <div className="container">
                    <form onSubmit={handleSubmit}>
                      <input
                        type="hidden"
                        name="mType"
                        value="1ST_INNING_KHADO"
                      />
                      <div className="row">
                        <div className="col">
                          {team.map(
                            (item, index) =>
                              item["main_market_id"] == 4 &&
                              item["team"] == 1 && (
                                <React.Fragment key={item["runnerId"]}>
                                  <input
                                    key={item["runnerId"]}
                                    type="text"
                                    name={item["runnerId"]}
                                    className="form-control-lg"
                                    value={
                                      fieldsT1_SCORE[item["runnerId"]] || ""
                                    }
                                    onChange={(e) =>
                                      handleChangeT1_SCORE(
                                        item,
                                        e,
                                        "1ST_INNING_KHADO"
                                      )
                                    }
                                    placeholder="RUNS"
                                    required
                                  />
                                  <small className="form-text text-muted">
                                    {/* {item["runnerId"]} */}
                                    (Enter First Inning Total Score)
                                  </small>
                                </React.Fragment>
                              )
                          )}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col mt-2">
                          {resultFIRST_KHADO == false ? (
                            <>
                              <input type="hidden" name="revoke" value="no" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-success float-right"
                              >
                                Update
                              </button>
                            </>
                          ) : (
                            <>
                              <input type="hidden" name="revoke" value="yes" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-danger float-left"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMarkets.includes(5) && market_id == 5 && (
          <div className="col-12 col-md-4 p-2  ">
            <div className="card">
              <div className="card-body">
                <div className="btn btn-sm btn-light">
                  <div className="card-title">
                    <h6 className="text-left text-border text-dark font-weight-bold text-xl-left">
                      {eventData[0] ? eventData[0].event_name : null}
                    </h6>
                    <h4 className="">1ST INNING TOTAL SCORE</h4>
                  </div>
                  <div className="container">
                    <form onSubmit={handleSubmit}>
                      <input
                        type="hidden"
                        name="mType"
                        value="1ST_INNING_TOTAL_SCORE"
                      />
                      <div className="row">
                        <div className="col">
                          {team.map(
                            (item, index) =>
                              item["main_market_id"] == 5 &&
                              item["team"] == 1 && (
                                <React.Fragment key={item["runnerId"]}>
                                  <input
                                    key={item["runnerId"]}
                                    type="text"
                                    name={item["runnerId"]}
                                    className="form-control-lg"
                                    value={
                                      fieldsT1_SCORE2[item["runnerId"]] || ""
                                    }
                                    onChange={(e) =>
                                      handleChangeT1_SCORE(
                                        item,
                                        e,
                                        "1ST_INNING_TOTAL_SCORE"
                                      )
                                    }
                                    placeholder="RUNS"
                                    required
                                  />
                                  <small className="form-text text-muted">
                                    {/* {item["runnerId"]} */}
                                    (Enter First Inning Total Score)
                                  </small>
                                </React.Fragment>
                              )
                          )}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col mt-2">
                          {resultFIRST_SCORE == false ? (
                            <>
                              <input type="hidden" name="revoke" value="no" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-success float-right"
                              >
                                Update
                              </button>
                            </>
                          ) : (
                            <>
                              <input type="hidden" name="revoke" value="yes" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-danger float-left"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMarkets.includes(9) && market_id == 9 && (
          <div className="col-12 col-md-4 p-2  ">
            <div className="card">
              <div className="card-body">
                <div className="btn btn-sm btn-light">
                  <div className="card-title">
                    <h6 className="text-left text-border text-dark font-weight-bold text-xl-left">
                      {eventData[0] ? eventData[0].event_name : null}
                    </h6>
                    <h4 className="">PAIR EVENT RUNS</h4>
                  </div>
                  <div className="container">
                    <form onSubmit={handleSubmit}>
                      <input type="hidden" name="mType" value="PAIR_EVENT" />
                      <div className="row">
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team1 : "Team-1"}
                            </li>
                            {[...Array(pairEventRunners)].map((_, i) => (
                              <React.Fragment key={i}>
                                <li className="list-group-item list-group-item-secondary">
                                  <input
                                    type="text"
                                    name={i}
                                    className="form-control form-control-sm"
                                    value={fieldsT1_PAIR_EVENT[i] || ""}
                                    onChange={(e) =>
                                      handleChangeT1_PAIR_EVENT(i, e)
                                    }
                                    required
                                  />
                                  <span>Runner {i + 1}</span>
                                </li>
                              </React.Fragment>
                            ))}
                          </ul>
                        </div>
                        <div className="col-6">
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-info">
                              {eventData[0] ? eventData[0].team2 : "Team-2"}
                            </li>
                            {[...Array(pairEventRunners)].map((_, i) => (
                              <React.Fragment key={i}>
                                <li className="list-group-item list-group-item-secondary">
                                  <input
                                    type="text"
                                    name={i}
                                    className="form-control form-control-sm"
                                    value={fieldsT2_PAIR_EVENT[i] || ""}
                                    onChange={(e) =>
                                      handleChangeT2_PAIR_EVENT(i, e)
                                    }
                                    required
                                  />
                                  <span>Runner {i + 1}</span>
                                </li>
                              </React.Fragment>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col mt-2">
                          {resultPAIR_EVENT == false ? (
                            <>
                              <input type="hidden" name="revoke" value="no" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-success float-right"
                              >
                                Update
                              </button>
                            </>
                          ) : (
                            <>
                              <input type="hidden" name="revoke" value="yes" />
                              <button
                                type="submit"
                                className="btn btn-lg btn-danger float-left"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Result;
