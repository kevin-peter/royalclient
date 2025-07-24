import React, { useRef, useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import Loader from "../utilities/Loader";
//import { dateReport } from '../../Utils';
import { dateReport } from '../utilities/Util';
import { XCircleIcon } from '@heroicons/react/24/solid';

function ErrorIcon() {
  return <XCircleIcon className="h-6 w-6 text-red-600" />;
}
export default function BetsModal(props) {
  const listInnerRef = useRef();
  const [isFetching, setFetching] = useState(false);
  const [betFiler, setFilter] = useState({
    m_type: "MATCHED"
  });

  const onScroll = () => {
    if (listInnerRef.current && isBottom(listInnerRef.current) && !isFetching && props.loadMore && !props.noMore) {
      setFetching(true)
      props.loadMore();
    }
  };

  const isBottom = (el) => {
    return el.getBoundingClientRect().bottom <= window.innerHeight + 60;
  }

  useEffect(() => {
    if (!props.more_disable) {
      setFetching(false)
    }
  }, [props.more_disable]);
  let [isOpen] = useState(true)
  let BET_ARR = [];
  let BET = "";
  if (props.betlist.length > 0) {
    BET_ARR = props.betlist.filter((v, k) => {
      if (props.book_marketid) return v.market_id === props.book_marketid;
      if (betFiler.m_type === 'MATCHED') {
        return v.formula !== 'FANCY'
      } else if (betFiler.m_type === 'FANCY') {
        return v.formula === 'FANCY'
      }
    });
  } else {
    BET_ARR = [...props.betlist];
  }

  if (BET_ARR.length > 0) {
    BET = BET_ARR.map((v, k) => (
      <tr key={k} className={`border-b border-primary-700 ${v.bet_type === 'back' ? "bg-blue-300" : "bg-pink-300"}`}>
        <td className='text-center'>{k + 1}</td>
        <td className='px-2 py-0.5'>{v.r_name}{(v.market_id.startsWith("9.") || v.market_id.startsWith("16.")) && " | BM"}{v.market_id.startsWith("17.") && " | Mini BM"}{v.market_id.startsWith("18.") && " | New BM"}</td>
        <td className="text-right px-2 py-0.5">{v.rate}{v.formula === 'FANCY' && ("/" + v.size)}</td>

        <td className="text-right px-2 py-0.5">{v.stake}</td>
        <td className="text-right px-2 py-0.5">
          {(v.formula !== "FANCY" && v.formula !== "FANCY" && v.formula !== "BOOK_MAKER") &&
            (v.stake * (v.rate - 1)).toFixed(0)}
          {(v.formula === "FANCY" || v.formula === "FANCY") && (v.stake * v.size / 100).toFixed(0)}

          {(v.formula === "BOOK_MAKER") &&
            (v.stake * v.rate / 100).toFixed(0)}
        </td>
        {props.role === 5 && <td className="text-center px-2 py-0.5">
          {dateReport(v.created_at)}
        </td>}
        {props.role < 5 && (
          <React.Fragment>
            <td className='text-right px-2 py-0.5'>{v.email}</td>
            <td className="text-center px-2 py-0.5">{dateReport(v.created_at)}</td>
            <td className='text-center px-2 py-0.5'>{v.webref}</td>
            <td className="text-center"><span role="button" title={v.device_info}>{v.ip_addr}</span></td>
          </React.Fragment>)}
      </tr>
    ));
  }
  useEffect(() => {
    const handlePopstate = () => {
      props.closeModal(true);
    };
    window.addEventListener('popstate', handlePopstate);
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => {
            return
          }}
          static={true}
        >
          <div className="min-h-screen text-center w-full">
            <Transition.Child
              as={Fragment}
              enter="ease-out"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className={`fixed inset-0  ${props.bgClass ? props.bgClass : 'bg-white dark:bg-primary-900'} ${props.opacity ? props.opacity : ''}`} />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-top"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-screen-md overflow-hidden text-left align-top transition-all transform bg-white dark:bg-primary-800 shadow-xl md:p-2">
                <Dialog.Title
                  as="h3"
                  className="grid grid-flow-col grid-cols-12 text-sm font-medium leading-6 text-blue-900 dark:text-blue-300 w-full px-2"
                >
                  <div className="col-span-11">{props.title}</div>
                  <div className="col-span-1 hidden md:block">
                    <XCircleIcon
                      role="button"
                      title="Close"
                      onClick={(e) => props.closeModal()}
                      className='inline-flex float-right justify-center w-8 h-8  focus:outline-none text-red-500  dark:text-red-400  hover:text-red-400 dark:hover:text-red-300  float-right '></XCircleIcon>
                  </div>

                </Dialog.Title>
                <div>
                  <button className={`${betFiler.m_type === 'FANCY' ? 'bg-primary-800' : 'active-hl'} text-white text-xs uppercase font-semibold py-1 ms-1 px-2 text-center`} onClick={(e) => {
                    setFilter({
                      "m_type": "MATCHED"
                    })
                  }}>Matched ({props.mb})</button>
                  <button className={`${betFiler.m_type === 'FANCY' ? 'active-hl' : 'bg-primary-800'} text-white text-xs uppercase font-semibold py-1 ms-1 px-2 text-center`} onClick={(e) => {
                    setFilter({
                      "m_type": "FANCY"
                    })
                  }}>Fancy ({props.fb})</button>
                </div>
                <div onScroll={() => onScroll()} style={{ "minHeight": "30px", "maxHeight": "96vh" }} className="overflow-auto w-full text-black">
                  <table ref={listInnerRef} className="mx-auto max-w-4xl w-full whitespace-nowrap overflow-hidden text-sm">
                    <thead className='bg-primary-200 dark:bg-secondary-700'>
                      <tr className="text-black dark:text-white text-left">
                        <th className="px-1 text-center">Sr.</th>
                        <th className="px-2 py-0.5">Runner</th>
                        <th className="text-right px-2 py-0.5">Rate</th>
                        <th className="text-right px-2 py-0.5">Stake</th>
                        <th className="text-right px-2 py-0.5">P/L</th>
                        {props.role < 5 && (
                          <th className="text-right uppercase px-2 py-0.5">USER</th>)}
                        <th className="text-center uppercase px-2 py-0.5">Time</th>
                        {props.role < 5 && (
                          <th className="text-center uppercase px-2 py-0.5">Ref.</th>)}
                        {props.role < 5 && (
                          <th className="text-center uppercase px-1 py-0.5">IP</th>)}
                      </tr>
                    </thead>
                    {BET_ARR.length > 0 && <tbody className='divide-y font-light'>{BET}</tbody>}
                  </table>
                </div>
                {isFetching && !props.noMore && <div className="relative h-20"><div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"><Loader></Loader></div></div>}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
