import React from "react";

export default function ProgressBar({ value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>Progress</span>
        <span>{value}%</span>
      </div>

      <div className="w-full bg-richblack-700 rounded-full h-2">
        <div
          className="bg-yellow-300 h-2 rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
