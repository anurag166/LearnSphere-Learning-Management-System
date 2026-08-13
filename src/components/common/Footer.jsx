import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link to="/" className="logo">Learn<span>Sphere</span></Link>
            <p>
              Empowering learners and educators with practical online courses, expert guidance, and
              a thriving learning community.
            </p>
          </div>

          <div className={styles.section}>
            <h4>Explore</h4>
            <Link to="/courses">Courses</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/signup">Become Instructor</Link>
          </div>

          <div className={styles.section}>
            <h4>Resources</h4>
            <Link to="/help-center">Help Center</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>

          <div className={styles.section}>
            <h4>Community</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {currentYear} LearnSphere. All rights reserved.</span>
          <span>Built for students, instructors, and lifelong learners.</span>
        </div>
      </div>
    </footer>
  );
}


