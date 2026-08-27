import React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import styles from "./InstructorDashboard.module.css";
import dashStyles from "./DashBoard.module.css";
import { API_BASE_URL } from "../services/apis";
import Profile from "./Profile";

const DEFAULT_CATEGORIES = [
  { _id: "web-dev",    name: "Web Development" },
  { _id: "mobile",     name: "Mobile Apps" },
  { _id: "ai-ml",      name: "AI & Machine Learning" },
  { _id: "uiux",       name: "UI/UX Design" },
  { _id: "cloud",      name: "Cloud & DevOps" },
  { _id: "data-sci",   name: "Data Science" },
];

const GRADIENTS = [
  "linear-gradient(135deg,#1e1b4b,#4c1d95)",
  "linear-gradient(135deg,#042f2e,#0f766e)",
  "linear-gradient(135deg,#1c1917,#7c2d12)",
  "linear-gradient(135deg,#0f172a,#1d4ed8)",
];
const EMOJI = ["⚡","🚀","💡","🎯","🔥","💻"];

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [createMsg, setCreateMsg] = useState({ type:"", text:"" });
  const [creating, setCreating] = useState(false);
  const thumbRef = useRef(null);
  const token = localStorage.getItem("token");

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState({ type:"", text:"" });
  const [supportMsg, setSupportMsg] = useState({ type:"", text:"" });
  const [supportForm, setSupportForm] = useState({
    topic: "Course Access",
    priority: "Medium",
    message: "",
  });

  const [form, setForm] = useState({
    name:"", price:"", desc:"", whatYouWillLearn:"", category:"",
    level:"Beginner", language:"English",
  });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    setUser(u);
    loadCategories();
    loadCourses(u);
  }, []);

  // Refresh reviews periodically while the Reviews tab is open, and
  // immediately whenever the instructor's course list changes — this is
  // what makes new student reviews show up without a manual page reload.
  useEffect(() => {
    if (courses.length === 0) {
      setReviews([]);
      return;
    }
    loadReviews(courses);
    if (activeTab !== "reviews") return;
    const interval = setInterval(() => loadReviews(courses), 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, activeTab]);

  async function loadCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/course/showAllCategory`);
      const data = await res.json();
      const categoryList = data.allCategory || data.data || data.categories || [];
      // Only replace the fallback defaults when the API returns real data
      if (Array.isArray(categoryList) && categoryList.length > 0) {
        setCategories(categoryList);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      // Keep DEFAULT_CATEGORIES already in state
    }
  }


  async function loadCourses(u) {
    try {
      const res = await fetch(`${API_BASE_URL}/course/getInstructorCourses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("📚 Instructor courses loaded:", data);
      if (data.success && Array.isArray(data.data)) {
        setCourses(data.data);
        return;
      }
    } catch (err) {
      console.error("❌ Error loading courses:", err);
    }
    setCourses([]);
  }

  async function loadReviews(courseList) {
    try {
      const res = await fetch(`${API_BASE_URL}/course/getAllRatingAndReviews`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Only show reviews that belong to THIS instructor's own courses —
        // the endpoint returns platform-wide reviews otherwise.
        const ownCourseIds = new Set((courseList || courses).map((c) => c._id));
        const ownReviews = data.data.filter((r) => ownCourseIds.has(r.course?._id));
        setReviews(ownReviews);
        return;
      }
    } catch (err) {
      console.error("❌ Error loading reviews:", err);
    }
    setReviews([]);
  }

  async function createCourse(e) {
    e.preventDefault();
    setCreateMsg({ type:"", text:"" });
    const thumb = thumbRef.current?.files[0];
    if (!form.name||!form.price||!form.desc||!form.category||!thumb) {
      setCreateMsg({ type:"error", text:"Please fill all required fields and upload a thumbnail." });
      return;
    }
    setCreating(true);
    const fd = new FormData();
    fd.append("courseName", form.name);
    fd.append("price", form.price);
    fd.append("courseDescription", form.desc);
    fd.append("whatWillYouLearn", form.whatYouWillLearn);
    fd.append("category1", form.category);
    fd.append("level", form.level);
    fd.append("language", form.language);
    fd.append("thumbnailImage", thumb);
    try {
      const res = await fetch(`${API_BASE_URL}/course/createCourse`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setCreateMsg({ type:"success", text:"Course created! Redirecting to course builder..." });
        setTimeout(() => navigate(`/edit-course/${data.data._id}`), 800);
      } else {
        setCreateMsg({ type:"error", text: data.message || "Failed to create course." });
      }
    } catch { setCreateMsg({ type:"error", text:"Server error." }); }
    setCreating(false);
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
    window.location.href = `mailto:anuragyadav31660@gmail.com?subject=${subject}&body=${body}`;
    setSupportMsg({ type:"success", text:"Opening your email client to send the ticket..." });
    setSupportForm({ topic:"Course Access", priority:"Medium", message:"" });
  }

  const totalStudents = courses.reduce((s,c) => s+(c.enrolledCount||c.studentsEnrolled?.length||0),0);
  const revenue = courses.reduce((s,c) => s+(c.price||0)*(c.enrolledCount||c.studentsEnrolled?.length||0),0);
  const avgRating = courses.length
    ? (courses.reduce((s,c) => s + (c.averageRating || 0), 0) / courses.length).toFixed(1)
    : "0.0";

  // Instructor accounts must be approved by an admin before they get access
  // to the dashboard. Show a pending-approval screen until that happens.
  if (user && user.instructorStatus !== "approved") {
    return (
      <div className={dashStyles.layout}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isInstructor={true} />
        <main className={dashStyles.main}>
          <div style={{
            maxWidth: 520, margin: "80px auto", textAlign: "center",
            padding: "40px 32px", background: "#fff", borderRadius: 16,
            border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <h2 style={{ margin: "0 0 12px" }}>Approval Pending</h2>
            <p style={{ color: "#64748b", lineHeight: 1.6, margin: 0 }}>
              Thanks for signing up as an instructor, {user?.firstName || ""}! Your account
              is currently under review by our admin team. You'll receive a confirmation
              email as soon as you're approved, and you'll then get full access to create
              and manage courses.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={dashStyles.layout}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isInstructor={true} />
      <main className={dashStyles.main}>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div className={dashStyles.dashHeader}>
              <h1>Welcome, {user?.firstName || "Instructor"} 👋</h1>
              <p>Here's an overview of your teaching activity.</p>
            </div>
            <div className={dashStyles.statsRow}>
              {[
                {icon:"📚",num:courses.length,lbl:"Total Courses",change:"Published"},
                {icon:"👥",num:totalStudents.toLocaleString("en-IN"),lbl:"Total Students",change:"Enrolled"},
                {icon:"💰",num:`₹${revenue.toLocaleString("en-IN")}`,lbl:"Total Revenue",change:"All time"},
                {icon:"⭐",num:avgRating,lbl:"Avg. Rating",change:"Across courses"},
              ].map((s,i) => (
                <div key={i} className={dashStyles.statCard}>
                  <div className={dashStyles.scIcon}>{s.icon}</div>
                  <div className={dashStyles.scNum}>{s.num}</div>
                  <div className={dashStyles.scLbl}>{s.lbl}</div>
                  <div className={`${dashStyles.scChange} ${dashStyles.up}`}>{s.change}</div>
                </div>
              ))}
            </div>
            <div className={dashStyles.sectionHd}><h2>Your Courses</h2></div>
            <div className={styles.overviewList}>
              {courses.map((c,i) => (
                <div key={c._id} className={styles.overviewRow}>
                  <div className={styles.overviewThumb} style={{background:GRADIENTS[i%GRADIENTS.length]}}>{EMOJI[i%EMOJI.length]}</div>
                  <div style={{flex:1}}>
                    <div className={styles.overviewName}>{c.courseName}</div>
                    <div className={styles.overviewMeta}>{c.enrolledCount||c.studentsEnrolled?.length||0} students</div>
                  </div>
                  <div className={styles.overviewPrice}>₹{c.price?.toLocaleString("en-IN")||0}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY COURSES */}
        {activeTab === "my-courses" && (
          <div>
            <div className={dashStyles.dashHeader}><h1>My Courses</h1><p>Manage and track your published courses.</p></div>
            <div className={styles.coursesTable}>
              <div className={styles.tableHeader}>
                <span>Course</span><span>Price</span><span>Students</span><span>Rating</span><span>Actions</span>
              </div>
              {courses.length === 0 ? (
                <div className={styles.emptyTable}>
                  <div style={{fontSize:"2.5rem",marginBottom:12}}>📚</div>
                  <p>No courses yet. <button onClick={()=>setActiveTab("create")} style={{color:"var(--accent2)",background:"none",border:"none",cursor:"pointer",fontSize:"inherit"}}>Create one →</button></p>
                </div>
              ) : courses.map((c,i) => (
                <div key={c._id} className={styles.tableRow}>
                  <div className={styles.courseInfo}>
                    <div className={styles.ciThumb} style={{background:GRADIENTS[i%GRADIENTS.length]}}>{EMOJI[i%EMOJI.length]}</div>
                    <div>
                      <div className={styles.ciName}>{c.courseName}</div>
                      <div className={styles.ciDesc}>{(c.courseDescription||"").slice(0,50)}...</div>
                    </div>
                  </div>
                  <div className={styles.tdPrice}>₹{c.price?.toLocaleString("en-IN")||0}</div>
                  <div className={styles.tdEnrolled}>{c.enrolledCount||c.studentsEnrolled?.length||0}</div>
                  <div className={styles.tdVal}>⭐ {Number(c.averageRating||0).toFixed(1)}</div>
                  <div><button className={styles.btnEdit} onClick={() => navigate(`/edit-course/${c._id}`)}>Edit</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREATE COURSE */}
        {activeTab === "create" && (
          <div>
            <div className={dashStyles.dashHeader}><h1>Create Course</h1><p>Add a new course to your catalogue.</p></div>
            <div className={styles.createPanel}>
              {createMsg.text && <div className={`alert alert-${createMsg.type}`}>{createMsg.text}</div>}
              <form onSubmit={createCourse}>
                <div className={styles.formGrid}>
                  <div className="form-group">
                    <label>Course Name *</label>
                    <input type="text" placeholder="e.g. Full Stack Web Development"
                      value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input type="number" placeholder="e.g. 999"
                      value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                      <option value="">Select category</option>
                      {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Level</label>
                    <select value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <input type="text" placeholder="e.g. English"
                      value={form.language} onChange={e=>setForm({...form,language:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Thumbnail *</label>
                    <input type="file" accept="image/*" ref={thumbRef} />
                  </div>
                  <div className="form-group" style={{gridColumn:"1/-1"}}>
                    <label>Description *</label>
                    <textarea placeholder="Describe your course..." rows={4}
                      value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} />
                  </div>
                  <div className="form-group" style={{gridColumn:"1/-1"}}>
                    <label>What Students Will Learn</label>
                    <textarea placeholder="List key outcomes, one per line..." rows={3}
                      value={form.whatYouWillLearn} onChange={e=>setForm({...form,whatYouWillLearn:e.target.value})} />
                  </div>
                </div>
                <button type="submit" className={styles.btnCreate} disabled={creating}>
                  {creating ? "Creating..." : "Create Course"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === "reviews" && (
          <div>
            <div className={dashStyles.dashHeader}><h1>Reviews</h1><p>What students say about your courses — updates automatically.</p></div>
            {reviews.length === 0 ? (
              <div className={dashStyles.panel} style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
                No reviews yet. Once students rate and review your courses, they'll show up here in real time.
              </div>
            ) : (
              <div className={styles.reviewsGrid}>
                {reviews.map((r,i) => (
                  <div key={r._id||r.id||i} className={styles.reviewCard}>
                    <div className={styles.reviewStars}>{"★".repeat(r.rating||r.stars||5)}</div>
                    <p className={styles.reviewText}>"{r.review||r.text}"</p>
                    <div className={styles.reviewerInfo}>
                      <div className={styles.revAvatar}>
                        {r.user?.profileImage ? (
                          <img src={r.user.profileImage} alt="Student" style={{width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover"}} />
                        ) : (r.user?.firstName||r.name||"?")[0]}
                      </div>
                      <div>
                        <div className={styles.revName}>{r.user ? `${r.user.firstName} ${r.user.lastName||""}`.trim() : (r.name||"Student")}</div>
                        <div className={styles.revCourse}>{r.course?.courseName||r.course||"Course"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <Profile />
        )}

        {/* SECURITY */}
        {activeTab === "security" && (
          <div>
            <div className={dashStyles.dashHeader}><h1>Security</h1><p>Manage your password and account security.</p></div>
            <div className={dashStyles.panel} style={{maxWidth:480}}>
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
                <button type="submit" className={dashStyles.btnSave}>Update Password</button>
              </form>
            </div>
          </div>
        )}

        {/* SUPPORT */}
        {activeTab === "support" && (
          <div>
            <div className={dashStyles.dashHeader}><h1>Support</h1><p>Get help with courses, payouts, and account issues.</p></div>
            <div className={dashStyles.twoCol}>
              <div className={dashStyles.panel}>
                <h3>Quick Help</h3>
                <p style={{ color:"var(--muted)", fontSize:"0.85rem", lineHeight:1.6 }}>
                  For urgent issues, include your course name and screenshot details.
                </p>
                <div style={{ display:"grid", gap:10, marginTop:14 }}>
                  <a href="mailto:anuragyadav31660@gmail.com" style={{ color:"var(--accent2)", textDecoration:"none" }}>Email: anuragyadav31660@gmail.com</a>
                  <a href="tel:+918950900612" style={{ color:"var(--accent2)", textDecoration:"none" }}>Phone: +91 8950900612</a>
                </div>
              </div>
              <div className={dashStyles.panel}>
                <h3>Raise a Ticket</h3>
                {supportMsg.text && <div className={`alert alert-${supportMsg.type}`} style={{ marginBottom: 12 }}>{supportMsg.text}</div>}
                <form onSubmit={submitSupport}>
                  <div className="form-group">
                    <label>Topic</label>
                    <select value={supportForm.topic} onChange={(e)=>setSupportForm({...supportForm,topic:e.target.value})}>
                      <option>Course Access</option>
                      <option>Payout Issue</option>
                      <option>Video Upload</option>
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
                  <button type="submit" className={dashStyles.btnSave}>Submit Ticket</button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}


