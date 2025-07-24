import React, { useState, useEffect, useContext } from 'react'
import StoreContext from './../../../../store';
import Loader from "../../../../utilities/loader/loader";
import { GrClose } from "react-icons/gr";

const AccountSummary = (props) => {

    const [limit] = useState(50);
    const [noMore, setNoMore] = useState(false);
    const [data_ob, setAcData] = useState([]);
    const [active_user, setActiveUser] = useState(0);
    const store = useContext(StoreContext);
    let [page, setPage] = useState(1);


    const handleSubmit = (u_id = '') => {
        let headers = new Headers();
        headers.append("Authorization", "Bearer " + localStorage.getItem("jwt"));
        let urlencoded = new URLSearchParams();
        urlencoded.append("page", page);
        urlencoded.append("limit", limit);
        if (u_id) {
            urlencoded.append("uid", u_id);
        }
        let requestOptions = {
            method: "POST",
            headers: headers,
            body: urlencoded,
            redirect: "follow",
        };
        fetch(import.meta.env.VITE_API_HOST + "/getacsummary", requestOptions)
            .then((response) => {
                if (response.status === 401) {
                    window.location.href = process.env.PUBLIC_URL + "/login";
                } else {
                    return response.json();
                }
            })
            .then((result) => {
                if (result.success && result.data) {
                    let ac_data = [...data_ob];
                    if (result.data.length > 0) {
                        setPage(page + 1);
                    } else {
                        setNoMore(true);
                    }
                    ac_data = [...result.data]
                    setAcData(ac_data);
                }
                setIsFetching(false)
            })
            .catch((error) => {
                if (error) {
                    setIsFetching(false)
                }
            });
    };

    const [isFetching, setIsFetching] = useState(true);;

    useEffect(() => {
        const active_user = store.getItem("active_user");
        setActiveUser(active_user.u_id ? active_user : {});
        let u_id = active_user.u_id ? active_user.u_id : "";
        handleSubmit(u_id);
    }, []);


    const resetFilter = (event) => {
        event.preventDefault();
        store.setItem("active_user", {});
        setAcData([])
        setPage(1);
        setActiveUser({})
        window.history.back();
    }


    let ac_data = [];
    let total = 0;
    let total_upline = 0;

    if (data_ob.length > 0) {
        ac_data = data_ob.map((v, k) => {
            total += parseFloat(v.total);
            total_upline += parseFloat(v.upline * (-1));
            return (
                <React.Fragment key={k}>
                    <tr className={`text-black dark:text-white ${(k) % 2 === 0 ? "bg-white" : "bg-light"}`} >

                        <td className="px-2 py-0.5 text-center">{k + 1}</td>
                        <td className="px-2 py-0.5">{v.play}</td>
                        <td className={`px-2 py-0.5 text-right ${(v.total) < 0 ? "text-danger" : "text-success"}`}>
                            {v.total}
                        </td>
                        {props.role < 5 && <td className={`px-2 py-0.5 text-right ${(v.upline) > 0 ? "text-danger" : "text-success"}`}>
                            {v.upline * (-1)}
                        </td>}
                    </tr>
                </React.Fragment>
            )
        });
    }

    return (
        <React.Fragment>
            <div className='py-2 mx-n3'>
                <h5 className="text-center  bg-white dark:bg-primary-800">-: Account Summary {active_user.u_name && <span className="text-green-500">Of {active_user.u_name}</span>}{active_user.u_id && <GrClose role="button" type="reset" title="Reset Filter" onClick={(e) => { resetFilter(e) }} className="inline-flex float-right justify-center w-8 h-8  focus:outline-none text-red-500  dark:text-red-400  hover:text-red-400 dark:hover:text-red-300  float-right">X</GrClose>}: -</h5>
                <div className="d-flex justify-content-center table-responsive">
                    <table style={{ maxWidth: "100%", width: "414px" }} className="table table-bordered table-sm report-table">
                        <thead className='text-black dark:text-white bg-light'>
                            <tr className="tracking-wide text-left">
                                <th className="px-2 py-0.5 text-center">Sr</th>
                                <th className="px-2 py-0.5">Play</th>
                                <th className="px-2 py-0.5 text-right">Total:<span className={`pl-2 py-0.5 text-right ${(total) < 0 ? "text-danger" : "text-success"}`}>{total.toFixed(2)}</span></th>
                                {props.role < 5 && <th className="pl-2 py-0.5 text-right">Upline:<span className={`px-2 py-0.5 text-right ${(total) > 0 ? "text-danger" : "text-success"}`}>{total_upline.toFixed(2)}</span></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {ac_data}
                        </tbody>
                    </table>
                </div>
                {isFetching && !noMore && <Loader></Loader>}
            </div>
        </React.Fragment>
    )
}

export default AccountSummary;