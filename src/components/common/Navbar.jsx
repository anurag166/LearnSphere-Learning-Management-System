import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStoredUser } from "../../utils/getStoredUser";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className="logo">
        Learn<span>Sphere</span>
      </Link>
      <div className={styles.navLinks}>
        <Link to="/courses">Courses</Link>
        <a href="/#categories">Categories</a>
        <a href="/#how">How It Works</a>
      </div>
      <div className={styles.navCta}>
        {token && user ? (
          <>
            <Link
              to={user.accountType === "Instructor" ? "/instructor-dashboard" : "/dashboard"}
              className="btn-ghost"
            >
              Dashboard
            </Link>
            <span className={styles.greeting}>Hi, {user.firstName}!</span>
            <button className="btn-ghost" onClick={logout}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">Sign In</Link>
            <Link to="/signup" className="btn-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}


