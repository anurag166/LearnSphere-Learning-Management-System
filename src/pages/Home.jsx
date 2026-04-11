import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import styles from "./Home.module.css";

const EMOJI_MAP = ["🚀","💡","⚡","🎯","🔥","🌟","💻","🎨"];
const GRADIENTS = [
  "linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)",
  "linear-gradient(135deg,#042f2e,#134e4a,#0f766e)",
  "linear-gradient(135deg,#0f172a,#1e3a5f,#1d4ed8)",
  "linear-gradient(135deg,#14532d,#166534,#15803d)",
  "linear-gradient(135deg,#1c1917,#44403c,#78716c)",
  "linear-gradient(135deg,#0c0a09,#292524,#7c2d12)",
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCourses(), fetchCategories()]);
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch("http://localhost:4000/api/v1/course/showAllCourses");
      const data = await res.json();
      if (data.success && data.data.length) { setCourses(data.data.slice(0, 6)); }
      else setCourses(getDummy());
    } catch { setCourses(getDummy()); }
    setLoading(false);
  }

  async function fetchCategories() {
    try {
      const res = await fetch("http://localhost:4000/api/v1/course/showAllCategory");
      const data = await res.json();
      if (data.success && data.data?.length) setCategories(data.data);
    } catch {}
  }

  function getDummy() {
    return [
      {_id:"1",courseName:"Full Stack Web Development",price:999,instructor:{firstName:"Anurag",lastName:"Sharma"},studentsEnrolled:[...Array(312)]},
      {_id:"2",courseName:"React & Node.js Masterclass",price:799,instructor:{firstName:"Priya",lastName:"Patel"},studentsEnrolled:[...Array(245)]},
      {_id:"3",courseName:"Data Science with Python",price:1199,instructor:{firstName:"Raj",lastName:"Kumar"},studentsEnrolled:[...Array(189)]},
      {_id:"4",courseName:"UI/UX Design Fundamentals",price:599,instructor:{firstName:"Sneha",lastName:"Gupta"},studentsEnrolled:[...Array(421)]},
      {_id:"5",courseName:"DevOps & Cloud Computing",price:899,instructor:{firstName:"Vikram",lastName:"Singh"},studentsEnrolled:[...Array(156)]},
      {_id:"6",courseName:"Machine Learning A-Z",price:1299,instructor:{firstName:"Anjali",lastName:"Rao"},studentsEnrolled:[...Array(278)]},
    ];
  }

  const defaultCategories = [
    {_id:"1",name:"Web Development",icon:"💻"},
    {_id:"2",name:"Mobile Apps",icon:"📱"},
    {_id:"3",name:"AI & Machine Learning",icon:"🤖"},
    {_id:"4",name:"UI/UX Design",icon:"🎨"},
    {_id:"5",name:"Cloud & DevOps",icon:"☁️"},
    {_id:"6",name:"Data Science",icon:"📊"},
  ];
  const displayCats = categories.length ? categories : defaultCategories;
  const catIcons = ["💻","📱","🤖","🎨","☁️","📊","🔐","📡"];

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroBg} />
          <div className={styles.heroGrid}>
            <div>
              <div className={`${styles.heroBadge} fade-up`}>India's fastest-growing EdTech platform</div>
              <h1 className={`${styles.heroH1} fade-up delay-1`}>
                Learn without <em>limits</em>, grow without bounds
              </h1>
              <p className={`${styles.heroSub} fade-up delay-2`}>
                Expert-led courses in tech, design & business. Learn at your own pace, get certified, and advance your career.
              </p>
              <div className={`${styles.heroActions} fade-up delay-3`}>
                <a href="#courses" className={styles.btnHero}>Explore Courses</a>
                <Link to="/signup" className={styles.btnOutline}>Become an Instructor →</Link>
              </div>
              <div className={`${styles.heroStats} fade-up delay-4`}>
                <div className={styles.statItem}><div className={styles.statNum}>12K+</div><div className={styles.statLbl}>Students Enrolled</div></div>
                <div className={styles.statItem}><div className={styles.statNum}>200+</div><div className={styles.statLbl}>Expert Courses</div></div>
                <div className={styles.statItem}><div className={styles.statNum}>4.8★</div><div className={styles.statLbl}>Avg. Rating</div></div>
              </div>
            </div>
            <div className={`${styles.heroVisual} fade-up delay-2`}>
              <div style={{position:"relative"}}>
                <div className={styles.heroCardMain}>
                  <div className={styles.coursePreviewImg}>⚡</div>
                  <div className={styles.coursePreviewTitle}>Full-Stack Web Development</div>
                  <div className={styles.coursePreviewMeta}>
                    <span>By Anurag Sharma</span>
                    <span className={styles.rating}>★★★★★ 4.9</span>
                  </div>
                  <div className={styles.enrollBadge}>🎯 48 students enrolled this week</div>
                </div>
                <div className={`${styles.badgeFloat} ${styles.topRight}`}>
                  <div className={styles.bfNum} style={{color:"var(--teal)"}}>98%</div>
                  <div className={styles.bfLbl}>Completion rate</div>
                </div>
                <div className={`${styles.badgeFloat} ${styles.bottomLeft}`}>
                  <div className={styles.bfNum} style={{color:"var(--gold)"}}>₹499</div>
                  <div className={styles.bfLbl}>Avg. course price</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className={styles.categoriesSection} id="categories">
          <div className={styles.sectionInner}>
            <div className={styles.sectionTag}>Browse by Topic</div>
            <div className={styles.sectionRow}>
              <h2 className={styles.sectionTitle}>Explore Categories</h2>
              <a href="#" className={styles.viewAll}>View all →</a>
            </div>
            <div className={styles.catsGrid}>
              {displayCats.map((cat, i) => (
                <div key={cat._id} className={styles.catCard}>
                  <span className={styles.catIcon}>{cat.icon || catIcons[i % catIcons.length]}</span>
                  <div className={styles.catName}>{cat.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COURSES */}
        <section id="courses" style={{padding:"80px 5%"}}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionTag}>What We Offer</div>
            <div className={styles.sectionRow}>
              <h2 className={styles.sectionTitle}>Featured Courses</h2>
              <Link to="/courses" className={styles.viewAll}>View all courses →</Link>
            </div>
            {loading ? (
              <div style={{textAlign:"center",padding:"60px",color:"var(--muted)"}}>
                <div className="spinner" />
                <p>Loading courses...</p>
              </div>
            ) : (
              <div className={styles.coursesGrid}>
                {courses.map((c, i) => {
                  const instructor = c.instructor
                    ? `${c.instructor.firstName || ""} ${c.instructor.lastName || ""}`.trim()
                    : "Expert Instructor";
                  const enrolled = c.studentsEnrolled?.length || 0;
                  return (
                    <Link to={`/courses/${c._id}`} key={c._id} className={styles.courseCard}>
                      <div className={styles.courseThumb} style={{background: GRADIENTS[i % GRADIENTS.length]}}>
                        {EMOJI_MAP[i % EMOJI_MAP.length]}
                      </div>
                      <div className={styles.courseBody}>
                        <div className={styles.courseCat}>Featured Course</div>
                        <div className={styles.courseTitle}>{c.courseName}</div>
                        <div className={styles.courseInstructor}>By {instructor}</div>
                        <div className={styles.courseFooter}>
                          <div className={styles.coursePrice}>₹{c.price?.toLocaleString("en-IN") || "499"}</div>
                          <div className={styles.courseEnrolled}>{enrolled} enrolled</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{background:"var(--bg2)",padding:"80px 5%"}} id="how">
          <div className={styles.sectionInner}>
            <div className={styles.sectionTag}>The Process</div>
            <h2 className={styles.sectionTitle}>How LearnSphere Works</h2>
            <div className={styles.howGrid}>
              {[
                {n:"1",title:"Create an Account",text:"Sign up in seconds with email verification. Choose your role — Student or Instructor — and start your journey."},
                {n:"2",title:"Browse & Enroll",text:"Explore hundreds of curated courses. Enroll with secure Razorpay payments and get instant access."},
                {n:"3",title:"Learn & Grow",text:"Watch video lessons, track your progress, and earn certificates to showcase on your portfolio."},
              ].map(s => (
                <div key={s.n} className={styles.howStep} data-step={s.n}>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{background:"var(--bg2)",padding:"80px 5%"}}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionTag}>Student Stories</div>
            <h2 className={styles.sectionTitle}>What Our Students Say</h2>
            <div className={styles.testiGrid}>
              {[
                {initials:"RK",color:"#7c5cfc",text:"I landed my first dev job 3 months after completing the Full Stack course. The content is incredibly practical.",name:"Rahul Kumar",role:"Frontend Developer",stars:5},
                {initials:"PS",color:"#14b8a6",text:"Best EdTech platform I've used. The courses are affordable, the quality is outstanding, and support is super responsive.",name:"Priya Sharma",role:"Data Analyst",stars:5},
                {initials:"AM",color:"#f59e0b",text:"As an instructor, I can create and manage my courses effortlessly. The platform handles payments and enrollments beautifully.",name:"Amit Mishra",role:"Course Instructor",stars:4},
              ].map((t,i) => (
                <div key={i} className={styles.testiCard}>
                  <div className={styles.stars}>{"★".repeat(t.stars)}{"☆".repeat(5-t.stars)}</div>
                  <p className={styles.testiText}>"{t.text}"</p>
                  <div className={styles.testiAuthor}>
                    <div className={styles.testiAvatar} style={{background:t.color}}>{t.initials}</div>
                    <div><div className={styles.testiName}>{t.name}</div><div className={styles.testiRole}>{t.role}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.sectionInner}>
            <div className={styles.ctaInner}>
              <h2>Ready to start learning today?</h2>
              <p>Join thousands of students already building their future on LearnSphere.</p>
              <Link to="/signup" className={styles.btnHero} style={{fontSize:"1.05rem",padding:"16px 40px"}}>Join for Free →</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
