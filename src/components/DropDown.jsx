import React, { useState } from 'react';

const Dropdown = (props) => {
  const [toggle, setToggle] = useState(false);
  return (<>
    <li className={`nav-item dropdown ${toggle ? "show" : ""}`}>
      <a
        onFocus={(e) => {

          setToggle(true)
        }}
        href
        onBlur={(e) => {
          setTimeout(() => {
            setToggle(false)
          }, 200)

        }}
        className={`nav-link dropdown-toggle ${props.active ? "active" : ""}`} href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        &lt;<span>{props.name}</span>&gt;
      </a>

      <ul className={`dropdown-menu ${toggle ? "show" : ""}`}>
        {
          props.menuItem.map((v, i) => (
            <li
            ><a className="dropdown-item" href={v.to} data-bs-toggle="modal" data-bs-target="#Oneday">&lt; <span>{v.name}</span> &gt;</a></li>))
        }
      </ul>
    </li>
  </>)
}

export { Dropdown } 