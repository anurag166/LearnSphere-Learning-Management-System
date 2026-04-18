import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { API_BASE_URL, profileEndpoints } from "../services/apis";

// 📅 Date formatter (YYYY-MM-DD)
function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toISOString().split("T")[0];
}

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  //  Profile states
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
 const [showPasswordForm, setShowPasswordForm] = useState(false);

  //  Fetch profile on load
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await apiConnector(
          "GET",
          profileEndpoints.GET_USER_DETAILS,
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );

        // apiConnector already returns response.data
        const userData = res.data;

        if (!userData) {
          console.error("User data missing");
          return;
        }

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.error("PROFILE FETCH ERROR:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, token]);

  // Update password handler
  const updatePasswordHandler = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage("New passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);

      await apiConnector(
        "POST",
        `${API_BASE_URL}/auth/change-password`,
        {
          oldPassword,
          newPassword,
          confirmNewPassword,
        },
        {
          Authorization: `Bearer ${token}`,
        }
      );

      setPasswordMessage("Password updated successfully ");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordMessage(
        err.response?.data?.message || "Failed to update password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  //  Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  //  Error state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Failed to load profile
      </div>
    );
  }

  const profile = user.additionalDetails || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-richblack-900 via-richblack-800 to-black px-6 py-16 text-white">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-richblack-800/90 border border-richblack-700 rounded-2xl p-8 flex items-center gap-6">
          <img
            src={user.profileImage}
            alt="profile"
            className="w-24 h-24 rounded-full"
          />

          <div>
            <h1 className="text-3xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-richblack-300">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-richblack-700 text-yellow-300">
              {user.accountType}
            </span>
          </div>
        </div>

        {/*  Personal Info */}
        <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">
            Personal Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <Field label="Gender" value={profile.gender} />
            <Field label="Date of Birth" value={formatDate(profile.dob)} />
            <Field label="Contact Number" value={profile.contactNumber} />

            <div className="md:col-span-2">
              <p className="text-richblack-400 mb-1">About</p>
              <p className="bg-richblack-700 rounded-md p-3">
                {profile.about || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Update Password */}
        {/* Change Password (Minimal UX) */}
<div className="bg-richblack-800 border border-richblack-700 rounded-xl p-6">
  <button
    onClick={() => setShowPasswordForm(!showPasswordForm)}
    className="text-yellow-300 hover:underline text-sm font-medium"
  >
    {showPasswordForm ? "Cancel" : "Change password"}
  </button>

  {showPasswordForm && (
    <form
      onSubmit={updatePasswordHandler}
      className="mt-4 space-y-4 max-w-md"
    >
      <input
        type="password"
        placeholder="Current password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-md bg-richblack-700 text-white outline-none focus:ring-2 focus:ring-yellow-300"
      />

      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-md bg-richblack-700 text-white outline-none focus:ring-2 focus:ring-yellow-300"
      />

      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        required
        className="w-full px-3 py-2 rounded-md bg-richblack-700 text-white outline-none focus:ring-2 focus:ring-yellow-300"
      />

      {passwordMessage && (
        <p className="text-sm text-yellow-300">
          {passwordMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={passwordLoading}
        className="bg-yellow-300 text-black px-5 py-2 rounded-md font-semibold hover:bg-yellow-400 transition disabled:opacity-70"
      >
        {passwordLoading ? "Updating..." : "Update password"}
      </button>
    </form>
  )}
</div>

      </div>
    </div>
  );
}

// 🔹 Reusable field
function Field({ label, value }) {
  return (
    <div>
      <p className="text-richblack-400 mb-1">{label}</p>
      <p className="bg-richblack-700 rounded-md p-3">
        {value || "—"}
      </p>
    </div>
  );
}
