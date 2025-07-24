import React, { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoreContext from "../../../Store";

import Loader from "../../../utilities/Loader";

const Profile = () => {
  const store = useContext(StoreContext);
  const navigate = useNavigate();
  let { eventid, eventtype } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Error : New passwords do not match");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_HOST}/user/changepassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
          body: JSON.stringify({
            current_password: oldPassword,
            new_password: newPassword,
            new_confirm_password: confirmPassword,

          }),
        }
      );

      if (response.status === 403) {
        navigate(`/login`);
        return;
      }

      const result = await response.json();
      setError(result.message);
      setTimeout(() => setError(""), 3000);
    } catch (error) {
      setError("An error occurred. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = async (e) => {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
  };
  

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
          <div className="card rounded shadow my-5">
            <div className="card-body">
              <h5 className="card-title text-center">Change Password</h5>
              <hr />
              <form
                className="form-inline"
                autoComplete="off"
                onSubmit={changePassword}
              >
                <div className="text-center">
                  {error && (
                    <span
                      className={`px-2 py-1 ${
                        error.toLowerCase().includes("error")
                          ? "alert alert-danger"
                          : "alert alert-success"
                      }`}
                    >
                      {error}
                    </span>
                  )}
                </div>
                <div className="form-group mt-1">
                  <input
                    placeholder="Old Password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="form-control form-control-lg"
                    maxLength="50"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <div className="form-group mt-1">
                  <input
                    placeholder="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-control form-control-lg"
                    maxLength="50"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="form-group mt-1">
                  <input
                    placeholder="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control form-control-lg"
                    maxLength="50"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="clear-both h-0 col-span-12" />
                <div className="form-group mt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-md btn-theme"
                  >
                    {loading ? "Loading..." : "Change Password"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger ml-3"
                    onClick={() => resetForm()}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
