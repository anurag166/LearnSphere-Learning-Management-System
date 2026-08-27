import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../services/apis";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u) {
      navigate("/login");
      return;
    }
    if (u.accountType !== "Admin") {
      // Not an admin — send them to the dashboard that matches their role.
      navigate(u.accountType === "Instructor" ? "/instructor-dashboard" : "/dashboard");
      return;
    }
    setUser(u);
    loadStats();
    loadUsers();
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showMsg(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  }

  async function loadStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {}
  }

  async function loadUsers() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setUsers(data.data);
    } catch {}
  }

  async function loadCourses() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setCourses(data.data);
    } catch {}
  }

  async function changeRole(id, accountType) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accountType }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg("success", "User role updated");
        loadUsers();
      } else {
        showMsg("error", data.message || "Failed to update role");
      }
    } catch {
      showMsg("error", "Network error updating role");
    }
  }

  async function approveInstructor(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/approve-instructor`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showMsg("success", "Instructor approved and confirmation email sent");
        loadUsers();
      } else {
        showMsg("error", data.message || "Failed to approve instructor");
      }
    } catch {
      showMsg("error", "Network error approving instructor");
    }
  }

  async function removeUser(id) {
    if (!window.confirm("Delete this user permanently? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showMsg("success", "User deleted");
        loadUsers();
      } else {
        showMsg("error", data.message || "Failed to delete user");
      }
    } catch {
      showMsg("error", "Network error deleting user");
    }
  }

  async function removeCourse(id) {
    if (!window.confirm("Delete this course permanently? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showMsg("success", "Course deleted");
        loadCourses();
      } else {
        showMsg("error", data.message || "Failed to delete course");
      }
    } catch {
      showMsg("error", "Network error deleting course");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{
        width: 240, minHeight: "100vh", background: "#0f172a", color: "#fff",
        padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>
          Learn<span style={{ color: "#818cf8" }}>Sphere</span>
          <div style={{ fontSize: 12, opacity: 0.6, fontWeight: 400 }}>Admin Panel</div>
        </div>
        {["overview", "users", "courses"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "none",
              cursor: "pointer", background: activeTab === tab ? "#1e293b" : "transparent",
              color: "#fff", fontSize: 14, textTransform: "capitalize",
            }}
          >
            {tab === "overview" ? "📊 Overview" : tab === "users" ? "👥 Users" : "📚 Courses"}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={logout}
          style={{
            textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "none",
            cursor: "pointer", background: "transparent", color: "#fca5a5", fontSize: 14,
          }}
        >
          🚪 Sign Out
        </button>
      </aside>

      <main style={{ flex: 1, padding: 32 }}>
        {msg.text && (
          <div style={{
            padding: "10px 16px", borderRadius: 8, marginBottom: 16,
            background: msg.type === "error" ? "#fee2e2" : "#dcfce7",
            color: msg.type === "error" ? "#991b1b" : "#166534",
          }}>
            {msg.text}
          </div>
        )}

        {activeTab === "overview" && (
          <>
            <h2>Platform Overview</h2>
            {!stats ? (
              <p>Loading stats…</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16, marginTop: 20 }}>
                {[
                  ["Total Users", stats.totalUsers],
                  ["Students", stats.totalStudents],
                  ["Instructors", stats.totalInstructors],
                  ["Pending Instructors", stats.pendingInstructors],
                  ["Courses", stats.totalCourses],
                  ["Categories", stats.totalCategories],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
                    <div style={{ color: "#6b7280", fontSize: 14 }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "users" && (
          <>
            <h2>All Users ({users.length})</h2>
            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: 8 }}>Name</th>
                    <th style={{ padding: 8 }}>Email</th>
                    <th style={{ padding: 8 }}>Role</th>
                    <th style={{ padding: 8 }}>Status</th>
                    <th style={{ padding: 8 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: 8 }}>{u.firstName} {u.lastName}</td>
                      <td style={{ padding: 8 }}>{u.email}</td>
                      <td style={{ padding: 8 }}>
                        <select
                          value={u.accountType}
                          onChange={(e) => changeRole(u._id, e.target.value)}
                          style={{ padding: 4, borderRadius: 6 }}
                        >
                          <option value="Student">Student</option>
                          <option value="Instructor">Instructor</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: 8 }}>
                        {u.accountType === "Instructor" ? (
                          u.instructorStatus === "approved" ? (
                            <span style={{
                              color: "#16a34a", background: "#dcfce7", padding: "2px 8px",
                              borderRadius: 999, fontSize: 12, fontWeight: 600,
                            }}>Approved</span>
                          ) : (
                            <span style={{
                              color: "#b45309", background: "#fef3c7", padding: "2px 8px",
                              borderRadius: 999, fontSize: 12, fontWeight: 600,
                            }}>Pending</span>
                          )
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: 8, display: "flex", gap: 12, alignItems: "center" }}>
                        {u.accountType === "Instructor" && u.instructorStatus !== "approved" && (
                          <button
                            onClick={() => approveInstructor(u._id)}
                            style={{ color: "#16a34a", border: "none", background: "none", cursor: "pointer", fontWeight: 600 }}
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => removeUser(u._id)}
                          style={{ color: "#dc2626", border: "none", background: "none", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "courses" && (
          <>
            <h2>All Courses ({courses.length})</h2>
            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: 8 }}>Course</th>
                    <th style={{ padding: 8 }}>Instructor</th>
                    <th style={{ padding: 8 }}>Category</th>
                    <th style={{ padding: 8 }}>Price</th>
                    <th style={{ padding: 8 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: 8 }}>{c.courseName}</td>
                      <td style={{ padding: 8 }}>
                        {c.instructor ? `${c.instructor.firstName} ${c.instructor.lastName}` : "—"}
                      </td>
                      <td style={{ padding: 8 }}>{c.category?.name || "—"}</td>
                      <td style={{ padding: 8 }}>{c.price === 0 ? "Free" : `₹${c.price}`}</td>
                      <td style={{ padding: 8 }}>
                        <button
                          onClick={() => removeCourse(c._id)}
                          style={{ color: "#dc2626", border: "none", background: "none", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
