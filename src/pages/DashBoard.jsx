import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import { API_BASE_URL } from "../services/apis";
import Profile from "./Profile";
import styles from "./DashBoard.module.css";

const GRADIENTS = [
  "linear-gradient(135deg,#1e1b4b,#4c1d95)",
  "linear-gradient(135deg,#042f2e,#0f766e)",
  "linear-gradient(135deg,#1c1917,#7c2d12)",
  "linear-gradient(135deg,#0f172a,#1d4ed8)",
];
const EMOJI = ["⚡","🚀","💡","🎯","🔥","💻"];

export default function DashBoard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [profile, setProfile] = useState({ gender:"", dob:"", contactNumber:"", about:"" });
  const [profileMsg, setProfileMsg] = useState({ type:"", text:"" });
  const [pwMsg, setPwMsg] = useState({ type:"", text:"" });
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    setUser(u);
    loadUserDetails();
  }, []);

  async function loadUserDetails() {
    try {
      const res = await fetch(`${API_BASE_URL}/profile/getAllUserDetails`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.data) {
        const p = data.data.additionalDetails || {};
        setProfile({ gender: p.gender||"", dob: p.dob ? p.dob.split("T")[0] : "", contactNumber: p.contactNumber||"", about: p.about||"" });
        const enrolled = Array.isArray(data.data.courses) ? data.data.courses : [];
        if (enrolled.length) setEnrolledCourses(enrolled);
      }
    } catch {}
  }

  async function saveProfile(e) {
    e.preventDefault();
    setProfileMsg({ type:"", text:"" });
    try {
      const res = await fetch(`${API_BASE_URL}/profile/updateProfile`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ gender: profile.gender, dateOfBirth: profile.dob, contactNumber: profile.contactNumber, about: profile.about }),
      });
      const data = await res.json();
      setProfileMsg(data.success
        ? { type:"success", text:"Profile updated successfully!" }
        : { type:"error", text: data.message || "Update failed." });
    } catch { setProfileMsg({ type:"error", text:"Server error." }); }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwMsg({ type:"error", text:"Passwords do not match." }); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/changepassword`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ oldpassword: oldPw, newPassword: newPw, confirmPassword: confirmPw }),
      });
      const data = await res.json();
      setPwMsg(data.success
        ? { type:"success", text:"Password changed!" }
        : { type:"error", text: data.message || "Failed." });
      if (data.success) { setOldPw(""); setNewPw(""); setConfirmPw(""); }
    } catch { setPwMsg({ type:"error", text:"Server error." }); }
  }

  const initials = user ? `${user.firstName?.[0]||""}${user.lastName?.[0]||""}`.toUpperCase() : "?";

  function EnrolledGrid({ courses, max }) {
    const list = max ? courses.slice(0, max) : courses;
    if (!list.length) return (
      <div className={styles.emptyEnrolled}>
        <div style={{fontSize:"2rem",marginBottom:12}}>🎓</div>
        <p>You haven't enrolled in any courses yet.</p>
        <Link to="/courses" style={{color:"var(--accent2)",fontSize:"0.875rem"}}>Browse courses →</Link>
      </div>
    );
    return (
      <div className={styles.enrolledGrid}>
        {list.map((c, i) => {
          const name = c.courseName || `Course ${i+1}`;
          const prog = Math.floor(Math.random()*70+10);
          return (
            <div key={c._id || i} className={styles.enrolledCard}>
              <div className={styles.ecThumb} style={{background: GRADIENTS[i % GRADIENTS.length]}}>
                {EMOJI[i % EMOJI.length]}
              </div>
              <div className={styles.ecBody}>
                <div className={styles.ecTitle}>{name}</div>
                <div className={styles.ecInstructor}>Enrolled Course</div>
                <div className={styles.progressWrap}><div className={styles.progressBar} style={{width:`${prog}%`}} /></div>
                <div className={styles.progressText}><span>{prog}% complete</span><span>{Math.floor(prog/10)} / 10 lessons</span></div>
                <button className={styles.btnContinue}>Continue Learning →</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isInstructor={false} />
      <main className={styles.main}>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div className={styles.dashHeader}>
              <h1>Welcome back, {user?.firstName || "Student"} 👋</h1>
              <p>Here's what's happening with your learning today.</p>
            </div>
            <div className={styles.statsRow}>
              {[
                {icon:"📚",num:enrolledCourses.length || 0,lbl:"Enrolled Courses",change:"Total enrolled"},
                {icon:"⏱",num:"24h",lbl:"Learning Time",change:"↑ 3h this week",up:true},
                {icon:"🏆",num:2,lbl:"Certificates",change:"↑ 1 this month",up:true},
                {icon:"🔥",num:7,lbl:"Day Streak",change:"Keep it up!",up:true},
              ].map((s,i) => (
                <div key={i} className={styles.statCard}>
                  <div className={styles.scIcon}>{s.icon}</div>
                  <div className={styles.scNum}>{s.num}</div>
                  <div className={styles.scLbl}>{s.lbl}</div>
                  <div className={`${styles.scChange} ${s.up ? styles.up : ""}`}>{s.change}</div>
                </div>
              ))}
            </div>
            <div className={styles.sectionHd}>
              <h2>Continue Learning</h2>
              <Link to="/courses" style={{color:"var(--accent2)",fontSize:"0.85rem",textDecoration:"none"}}>Browse more →</Link>
            </div>
            <EnrolledGrid courses={enrolledCourses} max={3} />
          </div>
        )}

        {/* MY COURSES */}
        {activeTab === "courses" && (
          <div>
            <div className={styles.dashHeader}>
              <h1>My Courses</h1>
              <p>All your enrolled courses in one place.</p>
            </div>
            <EnrolledGrid courses={enrolledCourses} />
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <Profile />
        )}

        {/* SECURITY */}
        {activeTab === "security" && (
          <div>
            <div className={styles.dashHeader}><h1>Security</h1><p>Manage your password and account security.</p></div>
            <div className={styles.panel} style={{maxWidth:480}}>
              <h3>Change Password</h3>
              {pwMsg.text && <div className={`alert alert-${pwMsg.type}`} style={{marginTop:16}}>{pwMsg.text}</div>}
              <form onSubmit={changePassword}>
                <div className="form-group"><label>Current Password</label>
                  <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} required />
                </div>
                <div className="form-group"><label>New Password</label>
                  <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required />
                </div>
                <div className="form-group"><label>Confirm New Password</label>
                  <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
                </div>
                <button type="submit" className={styles.btnSave}>Update Password</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}


