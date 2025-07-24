import React from "react";
import { Listbox } from "@headlessui/react";

const DropdownFullPage = ({ menuItems, onMenuItemClick, closeDropDown, active_user, changeUserSatus, index }) => {
  return (
    <>
      <div className="fixed top-0 right-0 h-full w-full" onClick={closeDropDown}></div>
      <div className="">
        <Listbox as="div">
          {(open) => (
            <>
              {open && (
                <div className="fixed top-10 right-0 right-0 mt-5 z-10 w-56 origin-top-right divide-y divide-primary-800 rounded-md bg-primary-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Listbox.Option className={"list-none"}>
                    <p
                      role="button"
                      className={`w-full block px-4 py-2 text-center bg-black dark:bg-primary-700 text-white`}
                    >
                      {active_user.p_code}
                    </p>
                  </Listbox.Option>
                  <Listbox.Option className={"list-none"}>
                    <p
                      role="button"
                      className={`w-full block px-4 py-2 text-center bg-primary-900 hover:bg-primary-700 ${!active_user.status ? "text-pink-500" : "text-green-500"}`}
                      onClick={() => {
                        changeUserSatus(active_user, "visible", !active_user.status, index)
                        closeDropDown()
                      }}
                    >
                      {active_user.status ? "Active" : "InActive"}
                    </p>
                  </Listbox.Option>
                  <Listbox.Option className={`list-none`}>
                    <p
                      onClick={() => {
                        changeUserSatus(active_user, "locked", !active_user.bet_lock, index)
                        closeDropDown()
                      }}
                      role="button"
                      className={`w-full block px-4 py-2 text-center bg-primary-900  hover:bg-primary-700 ${!active_user.bet_lock ? "text-green-500" : "text-pink-500"}`}
                    >
                      BET {active_user.bet_lock ? "OFF" : "ON"}
                    </p>
                  </Listbox.Option>
                  {menuItems.map((menuItem, k) => (
                    <Listbox.Option key={k} value={menuItem.label} className={"list-none"}>
                      {({ active, selected }) => (
                        <p
                          role="button"
                          onClick={() => {
                            onMenuItemClick(menuItem);
                            closeDropDown()
                          }}
                          className={`w-full block px-4 py-2 text-sm bg-primary-700 hover:bg-primary-700 hover:text-white ${active
                            ? "bg-primary-800 text-white"
                            : "bg-primary-900 text-primary-300"
                            } ${selected && "font-semibold"}`}
                        >
                          {menuItem.label}
                        </p>
                      )}
                    </Listbox.Option>
                  ))}
                </div>
              )}
            </>
          )}
        </Listbox>
      </div>
    </>

  );
};

export default DropdownFullPage;
