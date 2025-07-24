import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XCircleIcon } from '@heroicons/react/24/solid'
const PopUp = (props) => {
  return (
    <>
      <Transition appear show={true} as={Fragment}>
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
              className="inline-block h-screen align-middle"
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
              <div className="inline-block w-full max-w-screen-md overflow-hidden text-left align-top transition-all transform bg-white dark:bg-primary-700 shadow-xl p-2">
                <Dialog.Title
                  as="h3"
                  className="grid grid-flow-col grid-cols-12 text-sm font-medium leading-6 text-blue-900 dark:text-blue-300 w-full px-2"
                >
                  <div className="col-span-11 text-lg font-semibold">{props.title}</div>
                  <div className="col-span-1 hidden md:block"
                    role="button"
                    title="Close">
                    <XCircleIcon
                      role="button"
                      title="Close"
                      onClick={(e) => props.modelClose()}
                      className='inline-flex float-right justify-center w-8 h-8  focus:outline-none text-red-500  dark:text-red-400  hover:text-red-400 dark:hover:text-red-300  float-right'></XCircleIcon>
                  </div>
                </Dialog.Title>
                {props.children}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

    </>)
}
export default PopUp;