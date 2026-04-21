import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link to="/" className="logo">Learn<span>Sphere</span></Link>
            <p>Empowering learners and educators across India with world-class online education.</p>
          </div>
          <div className={styles.col}>
            <h4>Platform</h4>
            <Link to="/courses">All Courses</Link>
            <Link to="/signup">Become Instructor</Link>
          </div>
          <div className={styles.col}>
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className={styles.col}>
            <h4>Support</h4>
            <Link to="/help-center">Help Center</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© 2025 LearnSphere. All rights reserved.</span>
          <span>Made with ♥ in India</span>
        </div>
      </div>
    </footer>
  );
}


