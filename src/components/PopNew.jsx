import { Popover, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export const PopNew = (props) => {
  return (
    <div className="relative">
      <Popover>
        {({ open }) => (
          <>
            <Popover.Button className={``} >
              <span>{props.title}</span>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel  className="absolute top-0 left-1/2 z-10 w-auto max-w-sm translate-x-1/2 transform px-2 sm:px-0 opacity-95">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                  <div className="bg-primary-700 text-white relative grid px-2 py-2 whitespace-nowrap">
                    {props.children}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  )
}
