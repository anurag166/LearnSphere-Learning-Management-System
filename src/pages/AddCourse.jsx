import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { API_BASE_URL } from "../services/apis";

export default function AddCourse() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    courseName: "",
    courseDescription: "",
    whatWillYouLearn: "",
    price: "",
    category1: "",
    tags: "",
    instructions: "",
    level: "Beginner",
    language: "English",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [introVideo, setIntroVideo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/course/showAllCategory`);
      const data = await res.json();
      const cats = data.allCategory || data.data || data.categories || [];
      
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setCategories([]);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    setThumbnail(e.target.files[0]);
  }

  function handleIntroVideoChange(e) {
    setIntroVideo(e.target.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Validation
    if (!formData.courseName || !formData.courseDescription || !formData.whatWillYouLearn || !formData.price || !formData.category1) {
      setMessage({ type: "error", text: "Please fill all required fields" });
      return;
    }

    if (!thumbnail) {
      setMessage({ type: "error", text: "Please upload a thumbnail" });
      return;
    }

    if (!token) {
      setMessage({ type: "error", text: "You must be logged in as an instructor" });
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      // Create FormData for multipart file upload
      const uploadData = new FormData();
      uploadData.append("courseName", formData.courseName);
      uploadData.append("courseDescription", formData.courseDescription);
      uploadData.append("whatWillYouLearn", formData.whatWillYouLearn);
      uploadData.append("price", formData.price);
      uploadData.append("category1", formData.category1);
      uploadData.append("tags", formData.tags);
      uploadData.append("instructions", formData.instructions);
      uploadData.append("level", formData.level);
      uploadData.append("language", formData.language);
      uploadData.append("thumbnailImage", thumbnail);
      if (introVideo) {
        uploadData.append("introVideo", introVideo);
      }

      const res = await fetch(`${API_BASE_URL}/course/createCourse`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: uploadData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Course created successfully! Redirecting..." });
        setTimeout(() => navigate("/instructor-dashboard"), 2000);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to create course" });
      }
    } catch (err) {
      console.error("Error creating course:", err);
      setMessage({ type: "error", text: "Server error. Try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "80vh", background: "var(--bg1)", padding: "60px 5%" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", background: "var(--bg2)", borderRadius: "12px", padding: "40px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "30px", color: "var(--text1)" }}>Create New Course</h1>

          {message.text && (
            <div style={{
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              background: message.type === "success" ? "#d1fae5" : "#fee2e2",
              color: message.type === "success" ? "#065f46" : "#991b1b",
              border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fca5a5"}`,
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
            {/* Course Name */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--text1)" }}>
                Course Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                placeholder="e.g., Python for Beginners"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "var(--bg1)",
                  color: "var(--text1)",
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--text1)" }}>
                Description <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                name="courseDescription"
                value={formData.courseDescription}
                onChange={handleInputChange}
                placeholder="Describe your course..."
                rows="4"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "var(--bg1)",
                  color: "var(--text1)",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* What Students Will Learn */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--text1)" }}>
                What Students Will Learn <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                name="whatWillYouLearn"
                value={formData.whatWillYouLearn}
                onChange={handleInputChange}
                placeholder="List key skills (e.g., Python basics, OOP, Web scraping)"
                rows="3"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "var(--bg1)",
                  color: "var(--text1)",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--text1)" }}>
                Category <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="category1"
                value={formData.category1}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "var(--bg1)",
                  color: "var(--text1)",
                  cursor: "pointer",
                }}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--text1)" }}>
                Price (₹) <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 499"
                min="0"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "var(--bg1)",
                  color: "var(--text1)",
                }}
              />
            </div>

            {/* Tags */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--text1)" }}>
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., javascript, react, frontend"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "var(--bg1)",
                  color: "var(--text1)",
                }}
              />
            </div>

            {/* Level */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--text1)" }}>
                Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "var(--bg1)",
                  color: "var(--text1)",
                  cursor: "pointer",
                }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--text1)" }}>
                Language
              </label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                placeholder="e.g., English"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "var(--bg1)",
                  color: "var(--text1)",
                }}
              />
            </div>

            {/* Requirements / Instructions */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--text1)" }}>
                Requirements / Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                placeholder="One per line or comma separated"
                rows="3"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "var(--bg1)",
                  color: "var(--text1)",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--text1)" }}>
                Thumbnail <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "var(--bg1)",
                  color: "var(--text1)",
                }}
              />
              {thumbnail && (
                <p style={{ marginTop: "8px", fontSize: "12px", color: "var(--success)" }}>
                  ✓ {thumbnail.name} selected
                </p>
              )}
            </div>

              {/* Intro Video */}
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "var(--text1)" }}>
                  Intro Video (Optional)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleIntroVideoChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: "var(--bg1)",
                    color: "var(--text1)",
                  }}
                />
                {introVideo && (
                  <p style={{ marginTop: "8px", fontSize: "12px", color: "var(--success)" }}>
                    ✓ {introVideo.name} selected
                  </p>
                )}
              </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 20px",
                background: loading ? "var(--muted)" : "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Creating Course..." : "Create Course"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}


