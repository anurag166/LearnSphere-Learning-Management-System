import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStoredUser } from "../../utils/getStoredUser";
import styles from "./Sidebar.module.css";

export default function Sidebar({ activeTab, onTabChange, isInstructor }) {
  const navigate = useNavigate();
  const user = getStoredUser();
  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "?";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const studentLinks = [
    { tab: "overview", icon: "🏠", label: "Overview" },
    { tab: "courses",  icon: "📚", label: "My Courses" },
  ];
  const instructorLinks = [
    { tab: "overview",   icon: "🏠", label: "Overview" },
    { tab: "my-courses", icon: "📚", label: "My Courses" },
    { tab: "create",     icon: "➕", label: "Create Course" },
    { tab: "reviews",    icon: "⭐", label: "Reviews" },
  ];
  const links = isInstructor ? instructorLinks : studentLinks;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoWrap}>
        <Link to="/" className="logo">Learn<span>Sphere</span></Link>
        {isInstructor && <div className={styles.roleBadge}>Instructor</div>}
      </div>
      <nav className={styles.nav}>
        <div className={styles.sectionLabel}>Main</div>
        {links.map((l) => (
          <button
            key={l.tab}
            className={`${styles.navItem} ${activeTab === l.tab ? styles.active : ""}`}
            onClick={() => onTabChange(l.tab)}
          >
            <span className={styles.icon}>{l.icon}</span>{l.label}
          </button>
        ))}
        <Link to="/courses" className={styles.navItem}>
          <span className={styles.icon}>🔍</span>Browse Courses
        </Link>
        <div className={styles.sectionLabel} style={{ marginTop: 16 }}>Account</div>
        <button
          className={`${styles.navItem} ${activeTab === "profile" ? styles.active : ""}`}
          onClick={() => onTabChange("profile")}
        >
          <span className={styles.icon}>👤</span>Profile
        </button>
        <button
          className={`${styles.navItem} ${activeTab === "security" ? styles.active : ""}`}
          onClick={() => onTabChange("security")}
        >
          <span className={styles.icon}>🔒</span>Security
        </button>
      </nav>
      <div className={styles.bottom}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <div className={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : "User"}</div>
            <div className={styles.userRole}>{isInstructor ? "Instructor" : "Student"}</div>
          </div>
        </div>
        <button className={styles.navItem} onClick={logout}>
          <span className={styles.icon}>🚪</span>Sign Out
        </button>
      </div>
    </aside>
  );
}


