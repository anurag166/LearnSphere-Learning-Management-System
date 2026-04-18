import React from "react";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/common/Sidebar";
import { API_BASE_URL } from "../services/apis";
import styles from "./InstructorDashboard.module.css";
import dashStyles from "./DashBoard.module.css";

const GRADIENTS = [
  "linear-gradient(135deg,#1e1b4b,#4c1d95)",
  "linear-gradient(135deg,#042f2e,#0f766e)",
  "linear-gradient(135deg,#1c1917,#7c2d12)",
  "linear-gradient(135deg,#0f172a,#1d4ed8)",
];
const EMOJI = ["⚡","🚀","💡","🎯","🔥","💻"];

export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [courses, setCourses] = useState([]);
  const [realCourses, setRealCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [createMsg, setCreateMsg] = useState({ type:"", text:"" });
  const [builderMsg, setBuilderMsg] = useState({ type:"", text:"" });
  const [creating, setCreating] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const [addingLecture, setAddingLecture] = useState(false);
  const thumbRef = useRef(null);
  const lectureVideoRef = useRef(null);
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name:"", price:"", desc:"", whatYouWillLearn:"", category:"",
    tags:"", instructions:"", level:"Beginner", language:"English",
  });
  const introVideoRef = useRef(null);
  const [lessonCourseId, setLessonCourseId] = useState("");
  const [sections, setSections] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [lectureForm, setLectureForm] = useState({
    sectionId: "",
    title: "",
    timeDuration: "",
    description: "",
  });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    setUser(u);
    loadCategories();
    loadCourses(u);
    loadReviews();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/course/showAllCategory`);
      const data = await res.json();
      const categoryList = data.allCategory || data.data || data.categories || [];
      if (data.success && Array.isArray(categoryList) && categoryList.length) {
        setCategories(categoryList);
      }
    } catch {}
  }

  async function loadCourses(u) {
    try {
      const res = await fetch(`${API_BASE_URL}/course/showAllCourses`);
      const data = await res.json();
      if (data.success) {
        const mine = data.data.filter(c =>
          c.instructor?._id === u?._id || c.instructor === u?._id
        );
        setRealCourses(mine);
        setCourses(mine.length ? mine : getDummy());
        return;
      }
    } catch {}
    setRealCourses([]);
    setCourses(getDummy());
  }

  async function loadCourseSections(courseId) {
    if (!courseId) {
      setSections([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/course/getCourseDetails/${courseId}`);
      const data = await res.json();
      const courseData = data.data || {};
      const content = Array.isArray(courseData.courseContent) ? courseData.courseContent : [];

      const normalized = content.map((item, idx) => ({
        _id: item?._id || item || `section-${idx}`,
        sectionName: item?.sectionName || `Section ${idx + 1}`,
      }));

      setSections(normalized);
      if (normalized.length && !lectureForm.sectionId) {
        setLectureForm((prev) => ({ ...prev, sectionId: normalized[0]._id }));
      }
    } catch {
      setSections([]);
    }
  }

  async function loadReviews() {
    try {
      const res = await fetch(`${API_BASE_URL}/course/getAllRatingAndReviews`);
      const data = await res.json();
      if (data.success && data.data?.length) { setReviews(data.data); return; }
    } catch {}
    setReviews([
      {id:1,stars:5,text:"Absolutely brilliant course. The instructor explains complex concepts so clearly!",name:"Rahul K.",course:"Full Stack Web Development"},
      {id:2,stars:5,text:"Best investment I made for my career. Got a job offer within 2 months!",name:"Priya S.",course:"React Masterclass"},
      {id:3,stars:4,text:"Great content and well-structured. Would love more practice exercises.",name:"Amit M.",course:"Full Stack Web Development"},
    ]);
  }

  async function createCourse(e) {
    e.preventDefault();
    setCreateMsg({ type:"", text:"" });
    const thumb = thumbRef.current?.files[0];
    const introVideo = introVideoRef.current?.files[0];
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
    fd.append("tags", form.tags);
    fd.append("instructions", form.instructions);
    fd.append("level", form.level);
    fd.append("language", form.language);
    fd.append("thumbnailImage", thumb);
    if (introVideo) {
      fd.append("introVideo", introVideo);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/course/createCourse`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setCreateMsg({ type:"success", text:"Course created successfully!" });
        setBuilderMsg({ type:"success", text:"Now add sections and lecture videos below." });
        setForm({
          name:"", price:"", desc:"", whatYouWillLearn:"", category:"",
          tags:"", instructions:"", level:"Beginner", language:"English",
        });
        if (thumbRef.current) thumbRef.current.value = "";
        if (introVideoRef.current) introVideoRef.current.value = "";
        const createdCourse = data.data;
        if (createdCourse?._id) {
          setLessonCourseId(createdCourse._id);
          setRealCourses((prev) => [createdCourse, ...prev]);
          await loadCourseSections(createdCourse._id);
        }
        loadCourses(user);
      } else {
        setCreateMsg({ type:"error", text: data.message || "Failed to create course." });
      }
    } catch { setCreateMsg({ type:"error", text:"Server error." }); }
    setCreating(false);
  }

  async function addSection(e) {
    e.preventDefault();
    setBuilderMsg({ type:"", text:"" });

    if (!lessonCourseId || !sectionName.trim()) {
      setBuilderMsg({ type:"error", text:"Select a course and enter section name." });
      return;
    }

    try {
      setAddingSection(true);
      const res = await fetch(`${API_BASE_URL}/course/createSection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ courseId: lessonCourseId, sectionName: sectionName.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setBuilderMsg({ type:"success", text:"Section added successfully." });
        setSectionName("");
        const createdSection = data.newSection;
        if (createdSection?._id) {
          setSections((prev) => [...prev, createdSection]);
          setLectureForm((prev) => ({ ...prev, sectionId: createdSection._id }));
        } else {
          await loadCourseSections(lessonCourseId);
        }
      } else {
        setBuilderMsg({ type:"error", text: data.message || "Failed to add section." });
      }
    } catch {
      setBuilderMsg({ type:"error", text:"Server error while adding section." });
    } finally {
      setAddingSection(false);
    }
  }

  async function addLecture(e) {
    e.preventDefault();
    setBuilderMsg({ type:"", text:"" });

    const video = lectureVideoRef.current?.files[0];
    if (!lessonCourseId || !lectureForm.sectionId || !lectureForm.title || !lectureForm.timeDuration || !lectureForm.description || !video) {
      setBuilderMsg({ type:"error", text:"Fill all lecture fields and upload a video." });
      return;
    }

    try {
      setAddingLecture(true);
      const fd = new FormData();
      fd.append("sectionId", lectureForm.sectionId);
      fd.append("title", lectureForm.title);
      fd.append("timeDuration", lectureForm.timeDuration);
      fd.append("description", lectureForm.description);
      fd.append("videoFile", video);

      const res = await fetch(`${API_BASE_URL}/course/createSubSection`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: fd,
      });
      const data = await res.json();

      if (data.success) {
        setBuilderMsg({ type:"success", text:"Lecture video added successfully." });
        setLectureForm((prev) => ({ ...prev, title:"", timeDuration:"", description:"" }));
        if (lectureVideoRef.current) lectureVideoRef.current.value = "";
      } else {
        setBuilderMsg({ type:"error", text: data.message || "Failed to add lecture." });
      }
    } catch {
      setBuilderMsg({ type:"error", text:"Server error while adding lecture." });
    } finally {
      setAddingLecture(false);
    }
  }

  function getDummy() {
    return [
      {_id:"d1",courseName:"Full Stack Web Development",courseDescription:"Complete MERN stack course",price:999,studentsEnrolled:[...Array(312)]},
      {_id:"d2",courseName:"React & Node.js Masterclass",courseDescription:"Advanced React patterns",price:799,studentsEnrolled:[...Array(245)]},
    ];
  }

  const totalStudents = courses.reduce((s,c) => s+(c.studentsEnrolled?.length||0),0);
  const revenue = courses.reduce((s,c) => s+(c.price||0)*(c.studentsEnrolled?.length||0),0);

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
                {icon:"⭐",num:"4.8",lbl:"Avg. Rating",change:"Across courses"},
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
                    <div className={styles.overviewMeta}>{c.studentsEnrolled?.length||0} students</div>
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
                  <div className={styles.tdEnrolled}>{c.studentsEnrolled?.length||0}</div>
                  <div className={styles.tdVal}>⭐ 4.8</div>
                  <div><button className={styles.btnEdit}>Edit</button></div>
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
                    <label>Thumbnail *</label>
                    <input type="file" accept="image/*" ref={thumbRef} />
                  </div>
                  <div className="form-group">
                    <label>Intro Video</label>
                    <input type="file" accept="video/*" ref={introVideoRef} />
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
                  <div className="form-group" style={{gridColumn:"1/-1"}}>
                    <label>Tags</label>
                    <input type="text" placeholder="e.g. react, node, fullstack"
                      value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} />
                  </div>
                  <div className="form-group" style={{gridColumn:"1/-1"}}>
                    <label>Requirements / Instructions</label>
                    <textarea placeholder="One per line or comma separated" rows={3}
                      value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})} />
                  </div>
                </div>
                <button type="submit" className={styles.btnCreate} disabled={creating}>
                  {creating ? "Creating..." : "Create Course"}
                </button>
              </form>

              <div className={styles.builderPanel}>
                <h3>Course Builder: Sections & Lectures</h3>
                <p className={styles.builderHint}>After creating a course, add sections and upload lesson videos here.</p>

                {builderMsg.text && <div className={`alert alert-${builderMsg.type}`}>{builderMsg.text}</div>}

                <div className="form-group">
                  <label>Select Course</label>
                  <select
                    value={lessonCourseId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setLessonCourseId(value);
                      loadCourseSections(value);
                    }}
                  >
                    <option value="">Select your course</option>
                    {realCourses.map((c) => (
                      <option key={c._id} value={c._id}>{c.courseName}</option>
                    ))}
                  </select>
                </div>

                <form onSubmit={addSection} className={styles.inlineForm}>
                  <div className="form-group" style={{flex:1}}>
                    <label>New Section Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Introduction"
                      value={sectionName}
                      onChange={(e)=>setSectionName(e.target.value)}
                    />
                  </div>
                  <button type="submit" className={styles.btnSecondary} disabled={addingSection}>
                    {addingSection ? "Adding..." : "Add Section"}
                  </button>
                </form>

                {sections.length > 0 && (
                  <div className={styles.sectionList}>
                    {sections.map((s) => (
                      <span key={s._id} className={styles.sectionChip}>{s.sectionName}</span>
                    ))}
                  </div>
                )}

                <form onSubmit={addLecture} className={styles.lectureForm}>
                  <div className="form-group">
                    <label>Section</label>
                    <select
                      value={lectureForm.sectionId}
                      onChange={(e)=>setLectureForm({...lectureForm,sectionId:e.target.value})}
                    >
                      <option value="">Select section</option>
                      {sections.map((s) => (
                        <option key={s._id} value={s._id}>{s.sectionName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Lecture Title</label>
                    <input
                      type="text"
                      placeholder="e.g. What is React?"
                      value={lectureForm.title}
                      onChange={(e)=>setLectureForm({...lectureForm,title:e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Time Duration (HH:MM:SS)</label>
                    <input
                      type="text"
                      placeholder="e.g. 00:12:30"
                      value={lectureForm.timeDuration}
                      onChange={(e)=>setLectureForm({...lectureForm,timeDuration:e.target.value})}
                    />
                  </div>
                  <div className="form-group" style={{gridColumn:"1/-1"}}>
                    <label>Lecture Description</label>
                    <textarea
                      rows={3}
                      placeholder="Explain this lecture..."
                      value={lectureForm.description}
                      onChange={(e)=>setLectureForm({...lectureForm,description:e.target.value})}
                    />
                  </div>
                  <div className="form-group" style={{gridColumn:"1/-1"}}>
                    <label>Lecture Video</label>
                    <input type="file" accept="video/*" ref={lectureVideoRef} />
                  </div>
                  <button type="submit" className={styles.btnCreate} disabled={addingLecture}>
                    {addingLecture ? "Uploading..." : "Add Lecture Video"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === "reviews" && (
          <div>
            <div className={dashStyles.dashHeader}><h1>Reviews</h1><p>What students say about your courses.</p></div>
            <div className={styles.reviewsGrid}>
              {reviews.map((r,i) => (
                <div key={r.id||i} className={styles.reviewCard}>
                  <div className={styles.reviewStars}>{"★".repeat(r.stars||r.rating||5)}</div>
                  <p className={styles.reviewText}>"{r.text||r.review}"</p>
                  <div className={styles.reviewerInfo}>
                    <div className={styles.revAvatar}>{(r.name||r.user?.firstName||"?")[0]}</div>
                    <div>
                      <div className={styles.revName}>{r.name||r.user?.firstName||"Student"}</div>
                      <div className={styles.revCourse}>{r.course||r.course?.courseName||"Course"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}


