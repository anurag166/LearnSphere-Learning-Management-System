import React from "react";
import EnrolledCourseCard from "../components/dashboard/EnrolledCourseCard";

export default function EnrolledCourses() {
  const courses = [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Enrolled Courses</h1>

      {courses.length === 0 ? (
        <p className="text-richblack-200">
          You have not enrolled in any course.
        </p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <EnrolledCourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}


