import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { API_BASE_URL } from "../services/apis";
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
  const [instructors, setInstructors] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, avgRating: 0, ratingCount: 0 });

  useEffect(() => {
    Promise.all([fetchCourses(), fetchCategories(), fetchStats(), fetchInstructors(), fetchTestimonials()]);
  }, []);

  useEffect(() => {
    const wordTimer = window.setInterval(() => {
      setHeroWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 2800);
    return () => window.clearInterval(wordTimer);
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch(`${API_BASE_URL}/course/showAllCourses`);
      const data = await res.json();
      const courseList = Array.isArray(data.data) ? data.data : [];
      setCourses(data.success ? courseList.slice(0, 6) : []);
    } catch { setCourses([]); }
    setLoading(false);
  }

  async function fetchCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/course/showAllCategory`);
      const data = await res.json();
      const allCategory = Array.isArray(data.allCategory) ? data.allCategory : [];
      const dataCategory = Array.isArray(data.data) ? data.data : [];
      const categoryList = allCategory.length ? allCategory : dataCategory;
      if (data.success && categoryList.length) {
        setCategories(categoryList);
      }
    } catch {}
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/course/platformStats`);
      const data = await res.json();
      if (data.success && data.data) setStats(data.data);
    } catch {}
  }

  async function fetchInstructors() {
    try {
      const res = await fetch(`${API_BASE_URL}/course/topInstructors`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setInstructors(data.data);
    } catch {}
  }

  async function fetchTestimonials() {
    try {
      const res = await fetch(`${API_BASE_URL}/course/getAllRatingAndReviews`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Prefer the best-rated, most recent reviews for the homepage.
        const sorted = [...data.data].sort((a, b) => (b.rating||0) - (a.rating||0));
        setTestimonials(sorted.slice(0, 3));
      }
    } catch {}
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

  const heroWords = ["skills", "confidence", "a career", "real projects"];

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroBg} />
          <div className={styles.heroGlow} />
          <div className={styles.heroShape} />
          <div className={styles.heroShapeTwo} />
          <div className={styles.heroGrid}>
            <div>
              <div className={`${styles.heroBadge} fade-up`}>India's fastest-growing EdTech platform</div>
              <h1 className={`${styles.heroH1} fade-up delay-1`}>
                Learn without <em>{heroWords[heroWordIndex]}</em>, grow without bounds
              </h1>
              <p className={`${styles.heroSub} fade-up delay-2`}>
                Expert-led courses in tech, design & business. Learn at your own pace, get certified, and advance your career.
              </p>
              <div className={`${styles.heroActions} fade-up delay-3`}>
                <a href="#courses" className={styles.btnHero}>Explore Courses</a>
                <Link to="/signup" className={styles.btnOutline}>Become an Instructor →</Link>
              </div>
              <div className={`${styles.heroStats} fade-up delay-4`}>
                <div className={styles.statItem}><div className={styles.statNum}>{stats.totalStudents.toLocaleString()}+</div><div className={styles.statLbl}>Students Enrolled</div></div>
                <div className={styles.statItem}><div className={styles.statNum}>{stats.totalCourses}+</div><div className={styles.statLbl}>Expert Courses</div></div>
                <div className={styles.statItem}><div className={styles.statNum}>{stats.ratingCount ? `${stats.avgRating.toFixed(1)}★` : "—"}</div><div className={styles.statLbl}>Avg. Rating</div></div>
              </div>
            </div>
            <div className={`${styles.heroVisual} fade-up delay-2`}>
              <div style={{position:"relative"}}>
                {courses[0] ? (
                  <div className={styles.heroCardMain}>
                    <div className={styles.coursePreviewImg}>⚡</div>
                    <div className={styles.coursePreviewTitle}>{courses[0].courseName}</div>
                    <div className={styles.coursePreviewMeta}>
                      <span>By {courses[0].instructor ? `${courses[0].instructor.firstName||""} ${courses[0].instructor.lastName||""}`.trim() : "Instructor"}</span>
                      {courses[0].ratingsAndReviews?.length > 0 && (
                        <span className={styles.rating}>★ {(courses[0].ratingsAndReviews.reduce((s,r)=>s+(r.rating||0),0)/courses[0].ratingsAndReviews.length).toFixed(1)}</span>
                      )}
                    </div>
                    <div className={styles.enrollBadge}>
                      {(courses[0].studentsEnrolled?.length||0) + (courses[0].studentEnrolled?.length||0)} students enrolled
                    </div>
                  </div>
                ) : (
                  <div className={styles.heroCardMain}>
                    <div className={styles.coursePreviewImg}>🎓</div>
                    <div className={styles.coursePreviewTitle}>Your first course could be here</div>
                    <div className={styles.coursePreviewMeta}><span>Instructors are publishing now</span></div>
                  </div>
                )}
                <div className={`${styles.badgeFloat} ${styles.topRight}`}>
                  <div className={styles.bfNum} style={{color:"var(--teal)"}}>{stats.totalCourses}</div>
                  <div className={styles.bfLbl}>Courses live</div>
                </div>
                <div className={`${styles.badgeFloat} ${styles.bottomLeft}`}>
                  <div className={styles.bfNum} style={{color:"var(--gold)"}}>{stats.totalStudents}</div>
                  <div className={styles.bfLbl}>Students on LearnSphere</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className={styles.benefitsSection}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionRow}>
              <div>
                <div className={styles.sectionTag}>Why Choose LearnSphere</div>
                <h2 className={styles.sectionTitle}>Learning that fits your goals</h2>
                <p className={styles.benefitsIntro}>
                  From career-ready projects to expert mentorship, LearnSphere helps you grow faster with the right guidance and real-world skills.
                </p>
              </div>
              <div className={styles.benefitStats}>
                <div className={styles.statPanel}>
                  <div className={styles.statNum}>{stats.ratingCount ? `${stats.avgRating.toFixed(1)}/5` : "No ratings yet"}</div>
                  <div className={styles.statLbl}>Average course rating</div>
                </div>
                <div className={styles.statPanel}>
                  <div className={styles.statNum}>{stats.totalEnrollments || 0}</div>
                  <div className={styles.statLbl}>Total course enrollments</div>
                </div>
              </div>
            </div>

            <div className={styles.benefitGrid}>
              {[
                {icon:"🚀", title:"Project-Based Learning", text:"Build real products with guided hands-on lessons and live assignments."},
                {icon:"🎓", title:"Verified Certificates", text:"Earn certificates you can showcase on resumes and profiles."},
                {icon:"🤝", title:"Mentor Support", text:"Get one-on-one help from instructors and peer study groups."},
                {icon:"⏱️", title:"Flexible Schedule", text:"Learn at your own pace with bite-sized lessons for busy learners."},
              ].map((item, idx) => (
                <div key={idx} className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className={styles.categoriesSection} id="categories">
          <div className={styles.sectionInner}>
            <div className={styles.sectionTag}>Browse by Topic</div>
            <div className={styles.sectionRow}>
              <h2 className={styles.sectionTitle}>Explore Categories</h2>
              <Link to="/courses" className={styles.viewAll}>View all →</Link>
            </div>
            <div className={styles.catsGrid}>
              {displayCats.map((cat, i) => (
                <Link key={cat._id} to={`/courses?category=${cat._id}`} className={styles.catCard}>
                  <span className={styles.catIcon}>{cat.icon || catIcons[i % catIcons.length]}</span>
                  <div className={styles.catName}>{cat.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED INSTRUCTORS */}
        <section className={styles.instructorSection}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionRow}>
              <div>
                <div className={styles.sectionTag}>Meet Our Instructors</div>
                <h2 className={styles.sectionTitle}>Top educators shaping your learning path</h2>
              </div>
              <Link to="/signup" className={styles.viewAll}>Become an instructor →</Link>
            </div>
            {instructors.length === 0 ? (
              <div className={styles.instructorGrid}>
                <div className={styles.instructorCard} style={{gridColumn:"1/-1", textAlign:"center", color:"var(--muted)"}}>
                  No instructors have published courses yet. Be the first!
                </div>
              </div>
            ) : (
              <div className={styles.instructorGrid}>
                {instructors.map((inst) => {
                  const name = `${inst.firstName} ${inst.lastName}`.trim();
                  const scoreLabel = inst.avgRating != null ? `${Math.round((inst.avgRating/5)*100)}%` : "New";
                  return (
                    <div key={inst._id} className={styles.instructorCard}>
                      <div className={styles.instructorAvatar}>{name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                      <div className={styles.instructorMeta}>
                        <div className={styles.instructorName}>{name}</div>
                        <div className={styles.instructorTitle}>{inst.courseCount} course{inst.courseCount===1?"":"s"} · {inst.studentCount} student{inst.studentCount===1?"":"s"}</div>
                      </div>
                      <p>{inst.about || "Building courses on LearnSphere."}</p>
                      <div className={styles.instructorFooter}>
                        <span>Course quality</span>
                        <strong>{scoreLabel}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
            ) : courses.length === 0 ? (
              <div style={{textAlign:"center",padding:"60px",color:"var(--muted)"}}>
                No courses published yet — check back soon, or <Link to="/signup" style={{color:"var(--accent2)"}}>become an instructor</Link> and add the first one.
              </div>
            ) : (
              <div className={styles.coursesGrid}>
                {courses.map((c, i) => {
                  const instructor = c.instructor
                    ? `${c.instructor.firstName || ""} ${c.instructor.lastName || ""}`.trim()
                    : "Expert Instructor";
                  const enrolled = (c.studentsEnrolled?.length || 0) + (c.studentEnrolled?.length || 0);
                  return (
                    <Link to={`/courses/${c._id}`} key={c._id} className={styles.courseCard}>
                      <div className={styles.courseThumb} style={c.thumbnail ? {backgroundImage:`url(${c.thumbnail})`, backgroundSize:"cover", backgroundPosition:"center"} : {background: GRADIENTS[i % GRADIENTS.length]}}>
                        {!c.thumbnail && EMOJI_MAP[i % EMOJI_MAP.length]}
                      </div>
                      <div className={styles.courseBody}>
                        <div className={styles.courseCat}>{c.category?.name || "Featured Course"}</div>
                        <div className={styles.courseTitle}>{c.courseName}</div>
                        <div className={styles.courseInstructor}>By {instructor}</div>
                        <div className={styles.courseFooter}>
                          <div className={styles.coursePrice}>{c.price === 0 ? "Free" : `₹${c.price?.toLocaleString("en-IN")}`}</div>
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
            {testimonials.length === 0 ? (
              <div className={styles.testiGrid}>
                <div className={styles.testiCard} style={{gridColumn:"1/-1", textAlign:"center", color:"var(--muted)"}}>
                  No student reviews yet. Once learners rate courses, their stories will appear here.
                </div>
              </div>
            ) : (
              <div className={styles.testiGrid}>
                {testimonials.map((t) => {
                  const name = t.user ? `${t.user.firstName} ${t.user.lastName||""}`.trim() : "Student";
                  const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
                  const stars = t.rating || 0;
                  return (
                    <div key={t._id} className={styles.testiCard}>
                      <div className={styles.stars}>{"★".repeat(stars)}{"☆".repeat(5-stars)}</div>
                      <p className={styles.testiText}>"{t.review}"</p>
                      <div className={styles.testiAuthor}>
                        <div className={styles.testiAvatar} style={{background:"#7c5cfc", padding: t.user?.profileImage ? 0 : undefined, overflow: "hidden"}}>
                          {t.user?.profileImage ? (
                            <img src={t.user.profileImage} alt="Student" style={{width:"100%", height:"100%", objectFit:"cover"}} />
                          ) : initials}
                        </div>
                        <div><div className={styles.testiName}>{name}</div><div className={styles.testiRole}>{t.course?.courseName || "LearnSphere student"}</div></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
