import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from "socket.io-client";
const ScoreCard = (props) => {
  let emt_ob = {
    "mid": props.marketid,
    "h": "",
    "a": "",
    "h1": {
      "r": 0,
      "w": 0,
      "o": 0,
      "b": 0,
      "cr": 0,
      "rr": 0,
    },
    "h2": {
      "r": 0,
      "w": 0,
      "o": 0,
      "b": 0,
      "cr": 0,
      "rr": 0
    },
    "a1": {
      "r": 0,
      "w": 0,
      "o": 0,
      "b": 0,
      "cr": 0,
      "rr": 0
    },
    "a2": {
      "r": 0,
      "w": 0,
      "o": 0,
      "b": 0,
      "cr": 0,
      "rr": 0
    },
    "lst": "a1",
    "act": "h1",
    "p_o": [],
    "lb": [],
    "st": "",
    "ns": "",
    "bl": "",
    "com": "",
    "tbls": 120
  }
  const [score_ob, setDomObj] = useState(emt_ob);
  const [mount, setMount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [event_name, setEventName] = useState("");
  const [socket, setCurrentSocket] = useState(null)

  const frameRef = useRef(null);

  useEffect(() => {
    const getRunner = async (e) => {
      setLoading(true)
      let headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));

      const urlencoded = {
        "event_id": props.eventid,
        "market_id": props.marketid,
      };

      let requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(urlencoded)
      };

      fetch(import.meta.env.VITE_API_HOST + "/event/getrunner", requestOptions).then((response) => {
        if (response.status === 403) {
          props.navigate(`/login`)
        } else {
          return response.json();
        }
      }).then((result) => {
        if (result.data) {
          let en = ""
          if (result.data.length > 0) {
            en += result.data[0].name
          }
          if (result.data.length > 1) {
            en += " vs ";
            en += result.data[1].name
          }
          if (en) {
            setEventName(en)
          }
        }
      }).catch((err) => {
        console.log(err)
      }).finally(() => {
        setLoading(false)
      })
    }
    getRunner();
  }, []);

  useEffect(() => {
    const skt = socketIOClient(
      process.env.REACT_APP_SOCKET, {
      transports: ["websocket"],
      upgrade: false
    }, {
      secure: true
    }
    );
    skt.on('connection', () => {
      if (!socket) {
        skt.emit('subscribe_score', {
          mid: [props.marketid]
        });
      }
    })
    skt.on('score', async function (s_data) {
      if (score_ob.mid === props.marketid && !mount) {
        if (s_data && s_data !== null) {
          setDomObj(s_data)
        }
        setMount(true)
      }
    })
    skt.on('html_score', async function (s_data) {
      if (frameRef && frameRef.current) {
        frameRef.current.contentWindow.document.open();
        frameRef.current.contentWindow.document.write(s_data);
        frameRef.current.contentWindow.document.close();
      }

    })

    setCurrentSocket(skt)
    return () => { if (socket) { socket.disconnect() } }
  }, []);


  let passRun = async (run, ext = 0, wide = '') => {
    try {
      let obj = { ...score_ob }
      let r_st = false;

      if (parseInt(obj[obj.act].b) + parseInt(obj[obj.act].o) * 6 > parseInt(obj.tbls) - 1) {
        throw new Error("Over Game Or Increser Balls")
      }

      if (obj[obj.act].b % 6 === 0 && !wide) {
        obj = await resetSix(obj)
      }

      if (w_arr.includes(run)) {
        obj = await wicketDown(obj);
      }
      if (ext === 0) {
        obj = await addBall(obj)
      }
      if (obj.act in obj && obj[obj.act].b === 6) {
        obj = await resetBall(obj)
        obj = await addOver(obj)
        if (run % 2 === 0 && w_arr.indexOf(run) % 2 !== 0) r_st = true;
      } else {
        if (run % 2 !== 0 && w_arr.indexOf(run) % 2 !== 0) r_st = true;
      }
      obj = await addLastSix(run + wide, obj)
      obj = await addRun(run, ext, obj)
      obj = await addRR(obj)
      obj = await addRRR(obj)
      obj = await rotateStrike(r_st, obj);
      setDomObj(obj)
      setScore(obj)
      return obj;
    } catch (error) {
      alert(error)
    } finally {
      return;
    }
  }

  let rotateStrike = async (r_st = false, obj) => {
    let st = obj.st;
    if (r_st) {
      obj.st = obj.ns
      obj.ns = st;
    }
    return obj;
  }

  let wicketDown = async (obj) => {
    obj[score_ob.act].w += 1;
    return obj;
  }

  let addRun = async (r, ext = 0, obj) => {
    if (obj.act in obj) {
      obj[obj.act].r = parseInt(obj[obj.act].r) + parseInt(r) + parseInt(ext);
    }
    return obj;
  }

  let addRR = async (obj) => {
    if (score_ob.act in score_ob) {
      obj[obj.act].cr = parseInt(obj[obj.act].r) * 6 / (parseInt(obj[obj.act].o) * 6 + parseInt(obj[obj.act].b)).toFixed(2)
      obj[obj.act].cr = Math.round(obj[obj.act].cr * 1e2) / 1e2;
    }
    return obj;
  }

  let addRRR = async (obj) => {

    if (obj.act in obj) {
      let run = 0;
      let ball = 0;
      let t_r = 0;
      if (obj.act === 'h1' && parseInt(obj["a1"].r) > 0) {
        t_r = parseInt(obj["a1"].r) + parseInt(obj["a2"].r);
      }
      else if (obj.act === 'a1' && parseInt(obj["h1"].r) > 0) {
        t_r = parseInt(obj["h1"].r) + parseInt(obj["h2"].r);
      }
      run = parseInt(t_r - obj[obj.act].r) + 1;
      ball = parseInt(parseInt(obj.tbls) - (parseInt(obj[obj.act].o) * 6 + parseInt(obj[obj.act].b)))
      if (t_r > 0 && parseInt(run * 6 / ball) > 0) {
        obj[obj.act].rr = run * 6 / ball;
        obj[obj.act].rr = Math.round(obj[obj.act].rr * 1e2) / 1e2;
      } else {
        obj[obj.act].rr = 0;
      }
    }
    return obj;
  }

  let addBall = async (obj) => {
    if (obj.act in obj) {
      obj[obj.act].b += parseInt(1);
    }
    return obj;
  }

  let addOver = async (obj) => {
    obj[obj.act].o += parseInt(1);
    return obj;
  }

  let resetBall = async (obj) => {
    obj[obj.act].b = 0;
    return obj;
  }

  let changeStriker = async (st = "") => {
    let obj = { ...score_ob }
    obj.st = st;
    setDomObj(obj)
    return;
  }

  let changeNoStriker = async (ns = "") => {
    let obj = { ...score_ob }
    obj.ns = ns;
    setDomObj(obj)
    return;
  }

  let changeBaller = async (bl = "") => {
    let obj = { ...score_ob }
    obj.bl = bl;
    setDomObj(obj)
    return;
  }

  const changeInning = async (act = "") => {
    let obj = { ...score_ob }
    obj.act = act;
    setDomObj(obj)
    return;
  }

  const changeHome = async (h = "") => {
    let obj = { ...score_ob }
    console.log(obj)
    obj.h = h;
    setDomObj(obj)
    return;
  }

  const changeAway = async (a = "") => {
    let obj = { ...score_ob }
    obj.a = a;
    setDomObj(obj)
    return;
  }

  const changeRun = async (a = 0) => {
    let obj = { ...score_ob }
    obj[obj.act].r = parseInt(a);
    setDomObj(obj)
    return;
  }

  const changeW = async (a = 0) => {
    let obj = { ...score_ob }
    obj[score_ob.act].w = parseInt(a);
    setDomObj(obj)
    return;
  }


  const changeO = async (a = 0) => {
    let obj = { ...score_ob }
    obj[score_ob.act].o = parseInt(a);
    setDomObj(obj)
    return;
  }

  let changeComm = async (a = "") => {
    let obj = { ...score_ob }
    obj.com = a;
    setDomObj(obj)
    return;
  }

  let changeBall = async (a) => {
    let obj = { ...score_ob }
    obj.tbls = a;
    setDomObj(obj)
    return;
  }

  let changeB = async (a) => {
    let obj = { ...score_ob }
    obj[score_ob.act].b = parseInt(a);
    setDomObj(obj)
    return;
  }

  let changeRR = async (a) => {
    let obj = { ...score_ob }
    obj[obj.act].cr = Math.round(a * 1e2) / 1e2;
    setDomObj(obj)
    return;
  }

  let changeRRR = async (a) => {
    let obj = { ...score_ob }
    obj[obj.act].rr = 0;
    setDomObj(obj)
    return;
  }

  const addLastSix = async (run, obj) => {
    obj.lb.push(run)
    return obj;
  }

  const resetSix = async (obj) => {
    obj.p_o = obj.lb
    obj.lb = []
    return obj;
  }

  const resetScore = async () => {
    setDomObj(emt_ob)
    await setScore(emt_ob);
    window.location.reload();
    return;
  }
  const w_arr = ["0w", "1w", "2w", "3w", "4w", "5w", "6w"];

  const revertScore = async () => {
    let obj = { ...score_ob }
    if (obj.lb[obj.lb.length - 1].includes("wd") || obj.lb[obj.lb.length - 1].includes("nb")) {
      obj.lb[obj.lb.length - 1] = parseInt(obj.lb[obj.lb.length - 1]) + 1;
    } else {
      if (obj[obj.act].b > 0) {
        obj[obj.act].b = parseInt(obj[obj.act].b) - 1;
      } else {
        obj[obj.act].b = 5;
        obj[obj.act].o = parseInt(obj[obj.act].o) - 1;
      }
    }
    if (w_arr.includes(obj.lb[obj.lb.length - 1])) {
      obj[obj.act].w = parseInt(obj[obj.act].w) - 1;
    }
    obj[obj.act].r = parseInt(obj[obj.act].r) - parseInt(obj.lb[obj.lb.length - 1]);
    obj.lb.pop();
    setDomObj(obj)
    return;
  }


  let setComm = async (msg) => {
    let obj = { ...score_ob }
    obj.com = msg
    setDomObj(obj)
    setScore(obj)
    return;
  }


  const setScore = async (obj) => {
    socket.emit('set_score', {
      mid: props.marketid,
      score: obj
    });
    return
  }

  useEffect(() => {
    const keydownHandler = async (e) => {
      let keyCode = e.keyCode;
      if (keyCode === 48 && e.ctrlKey) {
        e.preventDefault()
        await passRun(0, 0)
        //zero
      } else if (keyCode === 49 && e.ctrlKey) {
        e.preventDefault()
        await passRun(1, 0)
        //single
      }
      else if (keyCode === 50 && e.ctrlKey) {
        e.preventDefault()
        await passRun(2, 0)
        //dubble
      }
      else if (keyCode === 51 && e.ctrlKey) {
        e.preventDefault()
        await passRun(3, 0)
        //three
      }
      else if (keyCode === 52 && e.ctrlKey) {
        e.preventDefault()
        await passRun(4, 0)
        //foure
      }
      else if (keyCode === 53 && e.ctrlKey) {
        e.preventDefault()
        await passRun(5, 0)
        //five
      }
      else if (keyCode === 54 && e.ctrlKey) {
        e.preventDefault()
        await passRun(6, 0)
        //six
      }
      else if (keyCode === 55 && e.ctrlKey) {
        e.preventDefault()
        await passRun(0, 1, 'wd')
        //7 key wide 0
      }
      else if (keyCode === 56 && e.ctrlKey) {
        e.preventDefault()
        await passRun(0, 1, 'nb')
        //8 key noball 0
      }
      else if (keyCode === 57 && e.ctrlKey) {
        e.preventDefault()
        await passRun('0w', 0)
        //9 key wicket 0
      }
      return;
    }
    window.addEventListener('keydown', keydownHandler);
    return () => { window.removeEventListener('keydown', keydownHandler); }
  })

  return (<><iframe height={"300px"} ref={frameRef} width="100%" title="Live Score"></iframe></>)
}

export default ScoreCard;