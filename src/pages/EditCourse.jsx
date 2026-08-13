import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { API_BASE_URL } from "../services/apis";

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    courseName: "",
    courseDescription: "",
    price: "",
    whatWillYouLearn: "",
    category: "",
    tags: "",
    instructions: "",
    level: "Beginner",
    language: "English",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await apiConnector("GET", `${API_BASE_URL}/course/getCourseDetails/${id}`, null, {
          Authorization: `Bearer ${token}`,
        });
        const course = data?.data || data;
        setForm({
          courseName: course?.courseName || "",
          courseDescription: course?.courseDescription || "",
          price: course?.price ?? "",
          whatWillYouLearn: course?.whatWillYouLearn || "",
          category: course?.category?._id || course?.category || "",
          tags: Array.isArray(course?.tag) ? course.tag.join(", ") : course?.tag || "",
          instructions: Array.isArray(course?.instructions) ? course.instructions.join("\n") : course?.instructions || "",
          level: course?.level || "Beginner",
          language: course?.language || "English",
        });
      } catch (err) {
        setMessage({ type: "error", text: err.response?.data?.message || "Failed to load course details." });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        courseName: form.courseName,
        courseDescription: form.courseDescription,
        price: form.price,
        whatWillYouLearn: form.whatWillYouLearn,
        category: form.category,
        tags: form.tags,
        instructions: form.instructions,
        level: form.level,
        language: form.language,
      };

      await apiConnector("PUT", `${API_BASE_URL}/course/updateCourse/${id}`, payload, {
        Authorization: `Bearer ${token}`,
      });

      setMessage({ type: "success", text: "Course updated successfully." });
      setTimeout(() => navigate("/instructor-dashboard"), 600);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update course." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "100px 5%", color: "var(--text)", minHeight: "100vh" }}>Loading course...</div>;
  }

  return (
    <div style={{ padding: "100px 5%", color: "var(--text)", minHeight: "100vh", maxWidth: "900px", margin: "0 auto" }}>
      <button type="button" onClick={() => navigate("/instructor-dashboard")} style={{ marginBottom: 20, background: "transparent", border: "1px solid var(--border)", color: "var(--text)", padding: "8px 14px", borderRadius: 999, cursor: "pointer" }}>
        ← Back to dashboard
      </button>
      <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", marginBottom: 8 }}>Edit Course</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Update your course details and publish the changes instantly.</p>

      {message.text ? <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 12, background: message.type === "error" ? "rgba(248,113,113,0.14)" : "rgba(34,197,94,0.16)", color: message.type === "error" ? "#fda4af" : "#86efac" }}>{message.text}</div> : null}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Course Name</label>
          <input value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} style={inputStyle} required />
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Description</label>
          <textarea rows={4} value={form.courseDescription} onChange={(e) => setForm({ ...form, courseDescription: e.target.value })} style={{ ...inputStyle, minHeight: 120 }} required />
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Price (₹)</label>
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} required />
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <label>What Students Will Learn</label>
          <textarea rows={3} value={form.whatWillYouLearn} onChange={(e) => setForm({ ...form, whatWillYouLearn: e.target.value })} style={{ ...inputStyle, minHeight: 100 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <label>Level</label>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} style={inputStyle}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <label>Language</label>
            <input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Tags</label>
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} style={inputStyle} placeholder="react, node, fullstack" />
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Requirements / Instructions</label>
          <textarea rows={3} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} style={{ ...inputStyle, minHeight: 100 }} placeholder="One item per line" />
        </div>
        <button type="submit" disabled={saving} style={{ padding: "12px 16px", borderRadius: 12, background: "linear-gradient(135deg, #7c5cff, #14b8a6)", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10, 12, 24, 0.7)",
  color: "var(--text)",
};


