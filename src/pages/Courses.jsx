import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { API_BASE_URL } from "../services/apis";
import styles from "./Courses.module.css";

const GRADIENTS = [
  "linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)",
  "linear-gradient(135deg,#042f2e,#134e4a,#0f766e)",
  "linear-gradient(135deg,#1c1917,#44403c,#78716c)",
  "linear-gradient(135deg,#0c0a09,#292524,#7c2d12)",
  "linear-gradient(135deg,#0f172a,#1e3a5f,#1d4ed8)",
  "linear-gradient(135deg,#14532d,#166534,#15803d)",
];
const EMOJI = ["⚡","🚀","💡","🎯","🔥","💻","🌟","🎨"];

function getDummy() {
  return [
    {_id:"1",courseName:"Full Stack Web Development",price:999,instructor:{firstName:"Anurag",lastName:"Sharma"},studentsEnrolled:[...Array(312)]},
    {_id:"2",courseName:"React & Node.js Masterclass",price:799,instructor:{firstName:"Priya",lastName:"Patel"},studentsEnrolled:[...Array(245)]},
    {_id:"3",courseName:"Data Science with Python",price:1199,instructor:{firstName:"Raj",lastName:"Kumar"},studentsEnrolled:[...Array(189)]},
    {_id:"4",courseName:"UI/UX Design Fundamentals",price:599,instructor:{firstName:"Sneha",lastName:"Gupta"},studentsEnrolled:[...Array(421)]},
    {_id:"5",courseName:"DevOps & Cloud Computing",price:899,instructor:{firstName:"Vikram",lastName:"Singh"},studentsEnrolled:[...Array(156)]},
    {_id:"6",courseName:"Machine Learning A-Z",price:1299,instructor:{firstName:"Anjali",lastName:"Rao"},studentsEnrolled:[...Array(278)]},
    {_id:"7",courseName:"JavaScript Algorithms & DSA",price:699,instructor:{firstName:"Karan",lastName:"Mehta"},studentsEnrolled:[...Array(334)]},
    {_id:"8",courseName:"AWS Cloud Practitioner",price:1099,instructor:{firstName:"Neha",lastName:"Joshi"},studentsEnrolled:[...Array(201)]},
  ];
}

export default function Courses() {
  const [allCourses, setAllCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadCourses(), loadCategories()]);
  }, []);

  async function loadCourses() {
    try {
      const res = await fetch(`${API_BASE_URL}/course/showAllCourses`);
      const data = await res.json();
      setAllCourses(data.success ? data.data : getDummy());
    } catch { setAllCourses(getDummy()); }
    setLoading(false);
  }

  async function loadCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/course/showAllCategory`);
      const data = await res.json();
      if (data.success && data.data?.length) setCategories(data.data);
    } catch {}
  }

  const filtered = (() => {
    let list = allCourses.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.courseName?.toLowerCase().includes(q) ||
        `${c.instructor?.firstName} ${c.instructor?.lastName}`.toLowerCase().includes(q);
      const matchCat = activeCat === "all" || c.category === activeCat;
      return matchSearch && matchCat;
    });
    if (sort === "price-asc") list.sort((a,b) => (a.price||0)-(b.price||0));
    else if (sort === "price-desc") list.sort((a,b) => (b.price||0)-(a.price||0));
    else if (sort === "enrolled") list.sort((a,b) => (b.studentsEnrolled?.length||0)-(a.studentsEnrolled?.length||0));
    return list;
  })();

  function enrollNow(e, id) {
    e.preventDefault(); e.stopPropagation();
    if (!localStorage.getItem("token")) { window.location.href = "/login"; return; }
    window.location.href = `/courses/${id}`;
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>All Courses</h1>
          <p>Explore our full catalogue of expert-led courses</p>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <input type="text" placeholder="Search courses..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <div className={styles.filterBtns}>
            <button className={`${styles.filterBtn} ${activeCat === "all" ? styles.active : ""}`}
              onClick={() => setActiveCat("all")}>All</button>
            {categories.map(cat => (
              <button key={cat._id}
                className={`${styles.filterBtn} ${activeCat === cat._id ? styles.active : ""}`}
                onClick={() => setActiveCat(cat._id)}>{cat.name}</button>
            ))}
          </div>
          <select className={styles.sortSel} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="enrolled">Most Enrolled</option>
          </select>
        </div>

        <div className={styles.resultsMeta}>Showing {filtered.length} course{filtered.length !== 1 ? "s" : ""}</div>

        {loading ? (
          <div style={{textAlign:"center",padding:"80px",color:"var(--muted)"}}>
            <div className="spinner" /><p>Loading courses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <p>No courses found. Try a different search.</p>
          </div>
        ) : (
          <div className={styles.coursesGrid}>
            {filtered.map((c, i) => {
              const instructor = c.instructor
                ? `${c.instructor.firstName||""} ${c.instructor.lastName||""}`.trim()
                : "Expert Instructor";
              const initials = instructor.split(" ").map(w=>w[0]||"").join("").toUpperCase().slice(0,2);
              const enrolled = c.studentsEnrolled?.length || 0;
              const price = c.price ? `₹${Number(c.price).toLocaleString("en-IN")}` : "Free";
              return (
                <Link to={`/courses/${c._id}`} key={c._id} className={styles.courseCard}>
                  <div className={styles.courseThumb} style={{background: GRADIENTS[i % GRADIENTS.length]}}>
                    {EMOJI[i % EMOJI.length]}
                  </div>
                  <div className={styles.courseBody}>
                    <div className={styles.courseCatBadge}>Course</div>
                    <div className={styles.courseTitle}>{c.courseName || "Untitled Course"}</div>
                    <div className={styles.courseInstructor}>
                      <div className={styles.instructorAvatar}>{initials}</div>
                      {instructor}
                    </div>
                    <div className={styles.courseStats}>
                      <div className={styles.cs}>👥 {enrolled} students</div>
                      <div className={styles.cs}>⭐ 4.8</div>
                      <div className={styles.cs}>🎬 24 lessons</div>
                    </div>
                    <div className={styles.courseFooter}>
                      <div className={styles.coursePrice}>{price}</div>
                      <button className={styles.btnEnroll} onClick={e => enrollNow(e, c._id)}>
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}


