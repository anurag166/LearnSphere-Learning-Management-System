import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import BackToTop from "./components/common/BackToTop";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import DashBoard from "./pages/DashBoard";
import InstructorDashboard from "./pages/InstructorDashboard";
import ViewCourse from "./pages/ViewCourse";
import EditCourse from "./pages/EditCourse";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><DashBoard /></ProtectedRoute>
        } />
        <Route path="/view-course/:id" element={
          <ProtectedRoute><ViewCourse /></ProtectedRoute>
        } />
        <Route path="/instructor-dashboard" element={
          <ProtectedRoute><InstructorDashboard /></ProtectedRoute>
        } />
        <Route path="/edit-course/:id" element={
          <ProtectedRoute><EditCourse /></ProtectedRoute>
        } />
      </Routes>
      <BackToTop />
    </>
  );
}
