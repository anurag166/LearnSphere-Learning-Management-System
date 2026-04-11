import ProgressBar from "./ProgressBar";
import React from "react";
export default function EnrolledCourseCard({ course }) {
  return (
    <div className="bg-richblack-800 p-4 rounded">
      <h3 className="font-semibold mb-2">{course.title}</h3>
      <ProgressBar progress={course.progress} />
    </div>
  );
}
