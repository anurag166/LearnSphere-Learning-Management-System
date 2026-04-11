import Sidebar from "../common/Sidebar";
import { Outlet } from "react-router-dom";
import React from "react";
export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-richblack-900 text-white">
      <Sidebar />
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}
