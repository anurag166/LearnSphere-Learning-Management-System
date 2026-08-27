import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../services/apis";

// ─── helpers ─────────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  { _id: "web-dev",  name: "Web Development" },
  { _id: "mobile",   name: "Mobile Apps" },
  { _id: "ai-ml",    name: "AI & Machine Learning" },
  { _id: "uiux",     name: "UI/UX Design" },
  { _id: "cloud",    name: "Cloud & DevOps" },
  { _id: "data-sci", name: "Data Science" },
];

function detectVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const t = Math.round(video.duration);
      resolve(`${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, "0")}`);
    };
    video.onerror = () => resolve("0:00");
    video.src = URL.createObjectURL(file);
  });
}

// ─── shared styles ────────────────────────────────────────────────────────────

const cardStyle = {
  background: "var(--card, rgba(255,255,255,0.04))",
  border: "1px solid var(--border, rgba(255,255,255,0.1))",
  borderRadius: 16,
  padding: "28px 32px",
};

const inpStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,12,24,0.7)",
  color: "var(--text1, #e2e8f0)",
  fontSize: 14,
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text2, #94a3b8)",
};

function mkBtn(variant) {
  const base = { padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all .2s" };
  if (variant === "primary") return { ...base, background: "linear-gradient(135deg,#7c5cff,#14b8a6)", color: "#fff" };
  if (variant === "danger")  return { ...base, background: "rgba(248,113,113,0.15)", color: "#fca5a5", border: "1px solid rgba(248,113,113,0.3)" };
  return { ...base, background: "rgba(124,92,252,0.12)", color: "#a78bfa", border: "1px solid rgba(124,92,252,0.25)" };
}

function Alert({ type, text }) {
  if (!text) return null;
  return (
    <div style={{
      padding: "12px 16px", borderRadius: 10, marginBottom: 18, fontSize: 14,
      background: type === "success" ? "rgba(34,197,94,0.12)" : "rgba(248,113,113,0.12)",
      color:      type === "success" ? "#86efac"              : "#fca5a5",
      border: `1px solid ${type === "success" ? "rgba(34,197,94,0.25)" : "rgba(248,113,113,0.25)"}`,
    }}>
      {type === "success" ? "✓ " : "✕ "}{text}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function EditCourse() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const token      = localStorage.getItem("token");
  const videoRef   = useRef(null);

  const [step,       setStep]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [msg,        setMsg]        = useState({ type: "", text: "" });
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // step 1 — info
  const [form,   setForm]   = useState({ courseName:"", courseDescription:"", price:"", whatWillYouLearn:"", category:"", tags:"", instructions:"", level:"Beginner", language:"English" });
  const [saving, setSaving] = useState(false);

  // step 2 — builder
  const [sections,         setSections]         = useState([]);
  const [newSectionName,   setNewSectionName]   = useState("");
  const [addingSection,    setAddingSection]    = useState(false);
  const [expandedSection,  setExpandedSection]  = useState(null);
  const [lectureForm,      setLectureForm]      = useState({ title:"", description:"", videoFile:null });
  const [addingLecture,    setAddingLecture]    = useState(false);
  const [uploadProgress,   setUploadProgress]   = useState("");

  useEffect(() => { fetchCourse(); fetchCategories(); }, [id]); // eslint-disable-line

  function showMsg(type, text) {
    setMsg({ type, text });
    if (type === "success") setTimeout(() => setMsg({ type:"", text:"" }), 4000);
  }

  async function fetchCategories() {
    try {
      const res  = await fetch(`${API_BASE_URL}/course/showAllCategory`);
      const data = await res.json();
      const list = data.allCategory || data.data || [];
      if (Array.isArray(list) && list.length > 0) setCategories(list);
    } catch {}
  }

  async function fetchCourse() {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/course/getCourseDetails/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const c    = data.data || data;
      setForm({
        courseName:        c.courseName        || "",
        courseDescription: c.courseDescription || "",
        price:             c.price             ?? "",
        whatWillYouLearn:  c.whatWillYouLearn  || "",
        category:          c.category?._id     || c.category || "",
        tags:              Array.isArray(c.tag)          ? c.tag.join(", ")          : c.tag          || "",
        instructions:      Array.isArray(c.instructions) ? c.instructions.join("\n") : c.instructions || "",
        level:             c.level    || "Beginner",
        language:          c.language || "English",
      });
      setSections(Array.isArray(c.courseContent) ? c.courseContent : []);
    } catch { showMsg("error", "Failed to load course details."); }
    finally  { setLoading(false); }
  }

  // ── step 1 save ────────────────────────────────────────────────────────────
  async function saveInfo(e) {
    e.preventDefault();
    setSaving(true); setMsg({ type:"", text:"" });
    try {
      const res  = await fetch(`${API_BASE_URL}/course/updateCourse/${id}`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ courseName:form.courseName, courseDescription:form.courseDescription, price:form.price, whatWillYouLearn:form.whatWillYouLearn, category:form.category, tags:form.tags, instructions:form.instructions, level:form.level, language:form.language }),
      });
      const data = await res.json();
      data.success ? (showMsg("success","Course info saved!"), setStep(2)) : showMsg("error", data.message || "Failed to save.");
    } catch { showMsg("error","Server error."); }
    finally  { setSaving(false); }
  }

  // ── add section ────────────────────────────────────────────────────────────
  async function addSection() {
    if (!newSectionName.trim()) return;
    setAddingSection(true); setMsg({ type:"", text:"" });
    try {
      const res  = await fetch(`${API_BASE_URL}/course/createSection`, {
        method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ sectionName:newSectionName.trim(), courseId:id }),
      });
      const data = await res.json();
      if (data.success && data.newSection) {
        setSections(prev => [...prev, { ...data.newSection, subSection:[] }]);
        setNewSectionName("");
        showMsg("success", `Section "${data.newSection.sectionName}" added.`);
      } else { showMsg("error", data.message || "Failed to add section."); }
    } catch { showMsg("error","Server error."); }
    finally  { setAddingSection(false); }
  }

  // ── delete section ─────────────────────────────────────────────────────────
  async function deleteSection(sectionId, sectionName) {
    if (!window.confirm(`Delete section "${sectionName}" and all its lectures?`)) return;
    setMsg({ type:"", text:"" });
    try {
      const res  = await fetch(`${API_BASE_URL}/course/deleteSection/${sectionId}?courseId=${id}`, {
        method:"DELETE", headers:{ Authorization:`Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSections(prev => prev.filter(s => s._id !== sectionId));
        if (expandedSection === sectionId) setExpandedSection(null);
        showMsg("success","Section deleted.");
      } else { showMsg("error", data.message || "Failed to delete."); }
    } catch { showMsg("error","Server error."); }
  }

  // ── add lecture ────────────────────────────────────────────────────────────
  async function addLecture(sectionId) {
    const { title, description, videoFile } = lectureForm;
    if (!title.trim() || !description.trim() || !videoFile) {
      showMsg("error","Title, description and a video file are all required."); return;
    }
    setAddingLecture(true); setMsg({ type:"", text:"" });
    setUploadProgress("Detecting video duration...");
    try {
      const duration = await detectVideoDuration(videoFile);
      setUploadProgress("Uploading video to Cloudinary… this may take a moment");
      const fd = new FormData();
      fd.append("sectionId",    sectionId);
      fd.append("title",        title.trim());
      fd.append("description",  description.trim());
      fd.append("timeDuration", duration || "0:00");
      fd.append("videoFile",    videoFile);
      const res  = await fetch(`${API_BASE_URL}/course/createSubSection`, { method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:fd });
      const data = await res.json();
      if (data.success && data.updatedSection) {
        setSections(prev => prev.map(s => s._id === sectionId ? data.updatedSection : s));
        setLectureForm({ title:"", description:"", videoFile:null });
        if (videoRef.current) videoRef.current.value = "";
        setExpandedSection(null);
        showMsg("success","Lecture added successfully!");
      } else { showMsg("error", data.message || "Failed to add lecture."); }
    } catch { showMsg("error","Server error while uploading."); }
    finally  { setAddingLecture(false); setUploadProgress(""); }
  }

  // ── delete lecture ─────────────────────────────────────────────────────────
  async function deleteLecture(sectionId, subSectionId, title) {
    if (!window.confirm(`Delete lecture "${title}"?`)) return;
    setMsg({ type:"", text:"" });
    try {
      const res  = await fetch(`${API_BASE_URL}/course/deleteSubSection`, {
        method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ subSectionId, sectionId }),
      });
      const data = await res.json();
      if (data.success) {
        setSections(prev => prev.map(s => s._id === sectionId ? { ...s, subSection: s.subSection.filter(sub => sub._id !== subSectionId) } : s));
        showMsg("success","Lecture deleted.");
      } else { showMsg("error", data.message || "Failed to delete."); }
    } catch { showMsg("error","Server error."); }
  }

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg1,#0a0c18)", color:"var(--text1,#e2e8f0)", fontSize:18 }}>
      Loading course...
    </div>
  );

  const totalLectures = sections.reduce((a, s) => a + (s.subSection?.length || 0), 0);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg1,#0a0c18)", padding:"32px 5% 80px", color:"var(--text1,#e2e8f0)" }}>
      <div style={{ maxWidth:860, margin:"0 auto" }}>

        {/* header */}
        <button onClick={() => navigate("/instructor-dashboard")} style={{ ...mkBtn("ghost"), marginBottom:24 }}>
          ← Back to Dashboard
        </button>
        <h1 style={{ fontSize:"1.75rem", fontWeight:700, marginBottom:4 }}>Course Builder</h1>
        <p style={{ color:"var(--muted,#64748b)", marginBottom:28, fontSize:14 }}>{form.courseName || "Untitled Course"}</p>

        {/* step tabs */}
        <div style={{ display:"flex", marginBottom:32, borderRadius:12, overflow:"hidden", border:"1px solid var(--border,rgba(255,255,255,0.1))" }}>
          {["Course Info","Course Content"].map((lbl, i) => (
            <button key={i} onClick={() => setStep(i+1)} style={{
              flex:1, padding:"14px", border:"none", cursor:"pointer", fontWeight:600, fontSize:14, transition:"all .2s",
              background: step === i+1 ? "linear-gradient(135deg,#7c5cff,#14b8a6)" : "rgba(255,255,255,0.03)",
              color:      step === i+1 ? "#fff" : "var(--muted,#64748b)",
              borderRight: i === 0 ? "1px solid var(--border,rgba(255,255,255,0.1))" : "none",
            }}>
              Step {i+1} — {lbl}
              {i === 1 && sections.length > 0 && <span style={{ marginLeft:8, fontSize:11, opacity:.8 }}>({sections.length} sections · {totalLectures} lectures)</span>}
            </button>
          ))}
        </div>

        <Alert type={msg.type} text={msg.text} />

        {/* ═══ STEP 1 — INFO ═══ */}
        {step === 1 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize:"1.1rem", fontWeight:700, marginBottom:24 }}>Course Details</h2>
            <form onSubmit={saveInfo} style={{ display:"grid", gap:20 }}>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={labelStyle}>Course Name *</label>
                  <input style={inpStyle} required placeholder="e.g. Full Stack Web Development" value={form.courseName} onChange={e => setForm({...form, courseName:e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Price (₹) *</label>
                  <input style={inpStyle} type="number" min="0" required placeholder="e.g. 999" value={form.price} onChange={e => setForm({...form, price:e.target.value})} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description *</label>
                <textarea style={{ ...inpStyle, minHeight:110, fontFamily:"inherit", resize:"vertical" }} required placeholder="Describe your course..." value={form.courseDescription} onChange={e => setForm({...form, courseDescription:e.target.value})} />
              </div>

              <div>
                <label style={labelStyle}>What Students Will Learn</label>
                <textarea style={{ ...inpStyle, minHeight:90, fontFamily:"inherit", resize:"vertical" }} placeholder="List key outcomes..." value={form.whatWillYouLearn} onChange={e => setForm({...form, whatWillYouLearn:e.target.value})} />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select style={inpStyle} required value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Level</label>
                  <select style={inpStyle} value={form.level} onChange={e => setForm({...form, level:e.target.value})}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Language</label>
                  <input style={inpStyle} placeholder="e.g. English" value={form.language} onChange={e => setForm({...form, language:e.target.value})} />
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <label style={labelStyle}>Tags</label>
                  <input style={inpStyle} placeholder="react, node, css (comma separated)" value={form.tags} onChange={e => setForm({...form, tags:e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Requirements / Instructions</label>
                  <input style={inpStyle} placeholder="One item per line or comma separated" value={form.instructions} onChange={e => setForm({...form, instructions:e.target.value})} />
                </div>
              </div>

              <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginTop:4 }}>
                <button type="button" onClick={() => navigate("/instructor-dashboard")} style={mkBtn("ghost")}>Cancel</button>
                <button type="submit" disabled={saving} style={{ ...mkBtn("primary"), opacity:saving?.7:1, minWidth:160 }}>
                  {saving ? "Saving..." : "Save & Continue →"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══ STEP 2 — CONTENT ═══ */}
        {step === 2 && (
          <div>
            <div style={cardStyle}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <h2 style={{ fontSize:"1.1rem", fontWeight:700 }}>Course Content</h2>
                <span style={{ fontSize:12, color:"var(--muted,#64748b)" }}>{sections.length} section{sections.length!==1?"s":""} · {totalLectures} lecture{totalLectures!==1?"s":""}</span>
              </div>
              <p style={{ fontSize:13, color:"var(--muted,#64748b)", marginBottom:24 }}>Add sections then add video lectures under each section.</p>

              {/* add section row */}
              <div style={{ display:"flex", gap:10, marginBottom:28 }}>
                <input
                  style={{ ...inpStyle, flex:1 }}
                  placeholder="New section name  e.g. Introduction"
                  value={newSectionName}
                  onChange={e => setNewSectionName(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && (e.preventDefault(), addSection())}
                />
                <button onClick={addSection} disabled={addingSection || !newSectionName.trim()} style={{ ...mkBtn("primary"), whiteSpace:"nowrap", opacity:!newSectionName.trim()?.5:1 }}>
                  {addingSection ? "Adding..." : "+ Add Section"}
                </button>
              </div>

              {/* sections */}
              {sections.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 20px", color:"var(--muted,#64748b)", fontSize:14 }}>No sections yet — add your first section above.</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {sections.map((section, si) => (
                    <div key={section._id} style={{ border:"1px solid var(--border,rgba(255,255,255,0.1))", borderRadius:12, overflow:"hidden" }}>

                      {/* section header */}
                      <div
                        style={{ display:"flex", alignItems:"center", padding:"14px 18px", background:"rgba(255,255,255,0.03)", cursor:"pointer", gap:10 }}
                        onClick={() => setExpandedSection(expandedSection===section._id ? null : section._id)}
                      >
                        <span style={{ fontSize:12, color:"var(--muted,#64748b)", minWidth:16 }}>{expandedSection===section._id?"▼":"▶"}</span>
                        <span style={{ fontWeight:600, flex:1, fontSize:14 }}>Section {si+1}: {section.sectionName}</span>
                        <span style={{ fontSize:12, color:"var(--muted,#64748b)", marginRight:12 }}>{section.subSection?.length||0} lecture{(section.subSection?.length||0)!==1?"s":""}</span>
                        <button onClick={e => { e.stopPropagation(); deleteSection(section._id, section.sectionName); }} style={{ ...mkBtn("danger"), padding:"5px 10px", fontSize:12 }}>Delete</button>
                      </div>

                      {/* section body */}
                      {expandedSection === section._id && (
                        <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:10 }}>

                          {/* existing lectures */}
                          {(section.subSection||[]).map(sub => (
                            <div key={sub._id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:8, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
                              <span style={{ fontSize:16 }}>🎬</span>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:13, fontWeight:500 }}>{sub.title}</div>
                                <div style={{ fontSize:12, color:"var(--muted,#64748b)", marginTop:2 }}>{sub.timeDuration} · {(sub.description||"").slice(0,60)}{sub.description?.length>60?"...":""}</div>
                              </div>
                              {sub.videoUrl && <a href={sub.videoUrl} target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#60a5fa", textDecoration:"none" }}>▶ Preview</a>}
                              <button onClick={() => deleteLecture(section._id, sub._id, sub.title)} style={{ ...mkBtn("danger"), padding:"4px 10px", fontSize:11 }}>Delete</button>
                            </div>
                          ))}

                          {/* add lecture form */}
                          <div style={{ marginTop:6, padding:18, borderRadius:10, background:"rgba(124,92,252,0.05)", border:"1px solid rgba(124,92,252,0.15)" }}>
                            <p style={{ fontSize:13, fontWeight:600, marginBottom:14, color:"#a78bfa" }}>+ Add Lecture</p>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                              <div>
                                <label style={labelStyle}>Lecture Title *</label>
                                <input style={inpStyle} placeholder="e.g. Introduction to Variables" value={lectureForm.title} onChange={e => setLectureForm({...lectureForm, title:e.target.value})} />
                              </div>
                              <div>
                                <label style={labelStyle}>Video File * <span style={{ fontWeight:400, color:"var(--muted,#64748b)" }}>(duration auto-detected)</span></label>
                                <input ref={videoRef} type="file" accept="video/*" style={{ ...inpStyle, padding:"8px 14px" }} onChange={e => setLectureForm({...lectureForm, videoFile:e.target.files[0]||null})} />
                              </div>
                            </div>
                            <div style={{ marginBottom:14 }}>
                              <label style={labelStyle}>Description *</label>
                              <textarea style={{ ...inpStyle, minHeight:70, fontFamily:"inherit", resize:"vertical" }} placeholder="What will students learn in this lecture?" value={lectureForm.description} onChange={e => setLectureForm({...lectureForm, description:e.target.value})} />
                            </div>
                            {uploadProgress && (
                              <div style={{ fontSize:13, color:"#60a5fa", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                                <span style={{ display:"inline-block", width:14, height:14, border:"2px solid #60a5fa", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
                                {uploadProgress}
                              </div>
                            )}
                            <button onClick={() => addLecture(section._id)} disabled={addingLecture} style={{ ...mkBtn("primary"), opacity:addingLecture?.7:1 }}>
                              {addingLecture ? "Uploading..." : "Upload & Add Lecture"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display:"flex", gap:12, marginTop:24, justifyContent:"flex-end" }}>
              <button onClick={() => setStep(1)} style={mkBtn("ghost")}>← Edit Course Info</button>
              <button onClick={() => navigate("/instructor-dashboard")} style={mkBtn("primary")}>✓ Finish & Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
