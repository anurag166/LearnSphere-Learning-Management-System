import ProgressBar from "./ProgressBar";
import React from "react";

export default function CourseCard() {
  return (
    <div className="bg-richblack-800 rounded-xl p-5 shadow hover:scale-[1.02] transition">
      <div className="h-32 bg-richblack-700 rounded mb-4" />

      <h3 className="font-semibold text-lg">
        Full Stack Web Development
      </h3>
      <p className="text-sm text-richblack-300 mb-3">
        by Instructor Name
      </p>

      <ProgressBar value={60} />
    </div>
  );
}
