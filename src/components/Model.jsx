import React, { useEffect } from "react";

const Modal = (props) => {
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);
  return (
    <>
      <div
        className="modal fade show"
        id="create_new_party"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-modal="true"
        role="dialog"
        style={{ display: "block", paddingLeft: "0px" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg model-content-box">
          <div
            className={`modal-content rounded-0 ${
              props.className ? props.className : "blue-light-bg"
            }`}
          >
            <div className="modal-header">
              <h3 className="modal-title center badge badge-pill badge-warning" id="exampleModalLabel">
                {props.title}
              </h3>
              {props.sub_title != '' && ( 
              <p className="modal-title right badge badge-pill badge-warning ml-1" id="exampleModalLabel">
                {props.sub_title}
              </p>
              )}
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={(e) => {
                  props.closeModal();
                }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">{props.children}</div>
            <div className="modal-footer">
              {/* <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
                onClick={(e) => {
                  props.closeModal();
                }}
              >
                Close
              </button> */}
              {/* <button type="button" className="btn btn-sm btn-success">
                Save changes
              </button> */}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default Modal;
