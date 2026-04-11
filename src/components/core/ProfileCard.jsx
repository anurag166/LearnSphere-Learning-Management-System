import React from "react";

export default function ProfileCard({ user }) {
  return (
    <div className="bg-richblack-800 rounded-xl p-6 flex items-center gap-6 shadow-md">
      <img
        src={user?.profileImage || "https://i.pravatar.cc/100"}
        alt="profile"
        className="w-20 h-20 rounded-full border-2 border-yellow-300"
      />

      <div>
        <h3 className="text-xl font-semibold">
          {user?.firstName} {user?.lastName}
        </h3>
        <p className="text-richblack-300">{user?.email}</p>
        <span className="text-sm text-yellow-300">
          {user?.accountType}
        </span>
      </div>
    </div>
  );
}
