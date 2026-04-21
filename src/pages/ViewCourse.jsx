import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { API_BASE_URL } from "../services/apis";

export default function ViewCourse() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLectureId, setActiveLectureId] = useState("");

  useEffect(() => {
    loadCourse();
  }, [id]);

  async function loadCourse() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/course/getCourseDetails/${id}`);
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setCourse(data.data);
      } else {
        setError(data.message || "Unable to load course content.");
      }
    } catch {
      setError("Unable to load course content.");
    } finally {
      setLoading(false);
    }
  }

  const sections = useMemo(() => {
    if (!course) return [];
    return Array.isArray(course.courseContent) ? course.courseContent : [];
  }, [course]);

  const allLectures = useMemo(() => {
    return sections.flatMap((section, sectionIndex) => {
      const lectures = Array.isArray(section.subSection) ? section.subSection : [];
      return lectures.map((lecture, lectureIndex) => ({
        ...lecture,
        sectionName: section.sectionName || `Section ${sectionIndex + 1}`,
        sectionIndex,
        lectureIndex,
      }));
    });
  }, [sections]);

  const activeLecture = useMemo(() => {
    if (!allLectures.length) return null;

    if (activeLectureId) {
      const selected = allLectures.find((lecture) => lecture._id === activeLectureId);
      if (selected) return selected;
    }

    return allLectures[0];
  }, [allLectures, activeLectureId]);

  useEffect(() => {
    if (!allLectures.length) {
      setActiveLectureId("");
      return;
    }

    const selectedExists = allLectures.some((lecture) => lecture._id === activeLectureId);
    if (!activeLectureId || !selectedExists) {
      setActiveLectureId(allLectures[0]._id || "");
    }
  }, [allLectures, activeLectureId]);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", padding: "48px 5%", background: "var(--bg1)", color: "var(--text1)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <Link to="/dashboard" style={{ color: "var(--accent2)", textDecoration: "none", fontWeight: 600 }}>
              ← Back to Dashboard
            </Link>
          </div>

          {loading ? (
            <p style={{ color: "var(--muted)" }}>Loading course content...</p>
          ) : error ? (
            <div style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: 10, padding: 14 }}>
              {error}
            </div>
          ) : !course ? (
            <p style={{ color: "var(--muted)" }}>Course not found.</p>
          ) : (
            <>
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.2 }}>{course.courseName || "Untitled Course"}</h1>
                <p style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
                  {course.courseDescription || "No course description available."}
                </p>
              </div>

              {activeLecture && activeLecture.videoUrl ? (
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                  <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>{activeLecture.title || "Current Lecture"}</h2>
                  <p style={{ margin: "0 0 12px", color: "var(--muted)", fontSize: 14 }}>
                    {activeLecture.sectionName} • {activeLecture.timeDuration || "--:--"}
                  </p>
                  <video
                    key={activeLecture._id || `${activeLecture.sectionIndex}-${activeLecture.lectureIndex}`}
                    controls
                    preload="metadata"
                    src={activeLecture.videoUrl}
                    style={{ width: "100%", borderRadius: 10, background: "#000" }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  {activeLecture.description ? (
                    <p style={{ margin: "12px 0 0", color: "var(--muted)", fontSize: 14 }}>
                      {activeLecture.description}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {sections.length === 0 ? (
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
                  <h2 style={{ margin: "0 0 8px" }}>Course Content</h2>
                  <p style={{ margin: 0, color: "var(--muted)" }}>No sections have been added yet.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {sections.map((section, sectionIndex) => {
                    const lectures = Array.isArray(section.subSection) ? section.subSection : [];
                    return (
                      <section key={section._id || sectionIndex} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
                        <h2 style={{ margin: 0, fontSize: 20 }}>
                          {section.sectionName || `Section ${sectionIndex + 1}`}
                        </h2>
                        <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: 14 }}>
                          {lectures.length} lecture{lectures.length === 1 ? "" : "s"}
                        </p>

                        {lectures.length === 0 ? (
                          <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 14 }}>No lectures added to this section yet.</p>
                        ) : (
                          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                            {lectures.map((lecture, lectureIndex) => (
                              <div
                                key={lecture._id || lectureIndex}
                                style={{
                                  border: "1px solid var(--border)",
                                  borderRadius: 10,
                                  padding: 12,
                                  background: activeLecture?._id === lecture._id ? "rgba(14,165,233,0.1)" : "var(--bg1)",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                  <h3 style={{ margin: 0, fontSize: 16 }}>
                                    {lecture.title || `Lecture ${lectureIndex + 1}`}
                                  </h3>
                                  <span style={{ color: "var(--muted)", fontSize: 12 }}>
                                    {lecture.timeDuration || "--:--"}
                                  </span>
                                </div>
                                {lecture.description ? (
                                  <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 14 }}>
                                    {lecture.description}
                                  </p>
                                ) : null}
                                {lecture.videoUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => setActiveLectureId(lecture._id || "")}
                                    style={{
                                      display: "inline-block",
                                      marginTop: 8,
                                      color: "var(--accent2)",
                                      textDecoration: "none",
                                      fontWeight: 600,
                                      background: "none",
                                      border: "none",
                                      padding: 0,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {activeLecture?._id === lecture._id ? "Now Playing" : "Play Lecture"}
                                  </button>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}


