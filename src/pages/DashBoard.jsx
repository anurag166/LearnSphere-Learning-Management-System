import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [profile, setProfile] = useState({ gender:"", dob:"", contactNumber:"", about:"" });
  const [profileMsg, setProfileMsg] = useState({ type:"", text:"" });
  const [pwMsg, setPwMsg] = useState({ type:"", text:"" });
  const [supportMsg, setSupportMsg] = useState({ type:"", text:"" });
  const [supportForm, setSupportForm] = useState({
    topic: "Course Access",
    priority: "Medium",
    message: "",
  });
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
        const enrolled = Array.isArray(data.data.courses)
          ? data.data.courses
          : (data.data.courses ? [data.data.courses] : []);
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

  function submitSupport(e) {
    e.preventDefault();
    setSupportMsg({ type:"", text:"" });

    if (!supportForm.message.trim()) {
      setSupportMsg({ type:"error", text:"Please describe your issue before submitting." });
      return;
    }

    const userEmail = user?.email || "";
    const subject = encodeURIComponent(`[${supportForm.priority}] ${supportForm.topic}`);
    const body = encodeURIComponent(
      `User: ${user?.firstName || ""} ${user?.lastName || ""}\nEmail: ${userEmail}\n\nIssue:\n${supportForm.message.trim()}`
    );

    window.location.href = `mailto:support@learnsphere.com?subject=${subject}&body=${body}`;
    setSupportMsg({ type:"success", text:"Support draft opened in your email app." });
    setSupportForm((prev) => ({ ...prev, message: "" }));
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
                <button
                  className={styles.btnContinue}
                  onClick={() => navigate(`/view-course/${c._id}`)}
                >
                  Continue Learning →
                </button>
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

        {activeTab === "support" && (
          <div>
            <div className={styles.dashHeader}><h1>Support</h1><p>Get help with courses, payments, and account issues.</p></div>
            <div className={styles.twoCol}>
              <div className={styles.panel}>
                <h3>Quick Help</h3>
                <p style={{ color:"var(--muted)", fontSize:"0.85rem", lineHeight:1.6 }}>
                  For urgent issues, include your course name and screenshot details.
                </p>
                <div style={{ display:"grid", gap:10, marginTop:14 }}>
                  <a href="mailto:support@learnsphere.com" style={{ color:"var(--accent2)", textDecoration:"none" }}>Email: support@learnsphere.com</a>
                  <a href="tel:+911800123456" style={{ color:"var(--accent2)", textDecoration:"none" }}>Phone: +91 1800 123 456</a>
                  <Link to="/help-center" style={{ color:"var(--accent2)", textDecoration:"none" }}>Open Help Center →</Link>
                </div>
              </div>

              <div className={styles.panel}>
                <h3>Raise a Ticket</h3>
                {supportMsg.text && <div className={`alert alert-${supportMsg.type}`} style={{ marginBottom: 12 }}>{supportMsg.text}</div>}
                <form onSubmit={submitSupport}>
                  <div className="form-group">
                    <label>Topic</label>
                    <select value={supportForm.topic} onChange={(e)=>setSupportForm({...supportForm,topic:e.target.value})}>
                      <option>Course Access</option>
                      <option>Payment Issue</option>
                      <option>Video Playback</option>
                      <option>Account & Login</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={supportForm.priority} onChange={(e)=>setSupportForm({...supportForm,priority:e.target.value})}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Issue Details</label>
                    <textarea
                      rows={5}
                      placeholder="Describe what is not working..."
                      value={supportForm.message}
                      onChange={(e)=>setSupportForm({...supportForm,message:e.target.value})}
                    />
                  </div>
                  <button type="submit" className={styles.btnSave}>Submit Ticket</button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}


