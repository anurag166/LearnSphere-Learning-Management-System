import React from "react";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import styles from "./CourseDetails.module.css";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]);
  const [enrollMsg, setEnrollMsg] = useState({ type:"", text:"" });
  const token = localStorage.getItem("token");

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  useEffect(() => {
    loadCourse();
    loadReviews();
  }, [id]);

  async function loadCourse() {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/course/getCourseDetails/${id}`);
      const data = await res.json();
      if (data.success) { setCourse(data.data); setLoading(false); return; }
    } catch {}
    // fallback dummy
    setCourse({
      _id: id,
      courseName: "Full Stack Web Development",
      courseDescription: "Master the complete MERN stack from scratch. Build real-world projects and get job-ready.",
      price: 999,
      instructor: { firstName: "Anurag", lastName: "Sharma" },
      studentsEnrolled: [...Array(312)],
      whatYouWillLearn: "React, Node.js, MongoDB, Express, REST APIs, Authentication, Deployment",
      category: { name: "Web Development" },
    });
    setLoading(false);
  }

  async function loadReviews() {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/course/getAllRatingAndReviews/${id}`);
      const data = await res.json();
      if (data.success && data.data?.length) { setReviews(data.data); return; }
    } catch {}
    setReviews([
      { _id:"r1", user:{firstName:"Rahul"}, rating:5, review:"Excellent course! Very practical and well-structured." },
      { _id:"r2", user:{firstName:"Priya"}, rating:5, review:"Best course I've taken. Highly recommended!" },
    ]);
  }

  async function handleEnroll() {
    if (!token) { navigate("/login"); return; }
    setEnrollMsg({ type:"", text:"" });
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setEnrollMsg({ type:"error", text:"Razorpay SDK failed to load." });
        return;
      }

      const res = await fetch(`http://localhost:4000/api/v1/payment/capturePayment`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ courseId: id }),
      });
      const data = await res.json();
      if (!data.success) {
        setEnrollMsg({ type:"error", text: data.message || "Enrollment failed." });
        return;
      }

      const options = {
        key: data.key,
        amount: Number(data.amount),
        currency: data.currency,
        name: "StudyNotion",
        description: `${data.courseName} - ₹${Math.round(Number(data.amount) / 100).toLocaleString("en-IN")}`,
        image: data.thumbnail,
        order_id: data.order_id,
        notes: {
          courseId: id,
          courseName: data.courseName,
          courseDescription: data.courseDescription,
          amountInRupees: Math.round(Number(data.amount) / 100).toString(),
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch("http://localhost:4000/api/v1/payment/verifyPayment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
              body: JSON.stringify({
                courseId: id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setEnrollMsg({ type:"success", text:"Payment successful! Course enrolled." });
            } else {
              setEnrollMsg({ type:"error", text: verifyData.message || "Payment verification failed." });
            }
          } catch (error) {
            setEnrollMsg({ type:"error", text:"Payment completed, but verification failed." });
          }
        },
        prefill: {
          name: localStorage.getItem("userName") || "Student",
          email: localStorage.getItem("userEmail") || "",
        },
        theme: {
          color: "#0f766e",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function () {
        setEnrollMsg({ type:"error", text:"Payment failed. Please try again." });
      });
      paymentObject.open();
    } catch { setEnrollMsg({ type:"error", text:"Server error. Try again." }); }
  }

  async function submitReview(e) {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }
    try {
      await fetch("http://localhost:4000/api/v1/course/createRatingAndReview", {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ courseId: id, rating, review }),
      });
      loadReviews();
      setRating(0); setReview("");
    } catch {}
  }

  if (loading) return <><Navbar /><div style={{textAlign:"center",padding:"100px",color:"var(--muted)"}}><div className="spinner" /></div></>;
  if (!course) return <><Navbar /><div style={{textAlign:"center",padding:"100px",color:"var(--muted)"}}>Course not found.</div></>;

  const instructor = course.instructor
    ? `${course.instructor.firstName||""} ${course.instructor.lastName||""}`.trim()
    : "Expert Instructor";
  const initials = instructor.split(" ").map(w=>w[0]||"").join("").toUpperCase().slice(0,2);
  const enrolled = course.studentsEnrolled?.length || 0;
  const learns = (course.whatYouWillLearn || "").split(",").map(s=>s.trim()).filter(Boolean);
  const curriculum = [
    { title:"Introduction & Setup", lessons:4 },
    { title:"Core Concepts", lessons:8 },
    { title:"Building Projects", lessons:12 },
    { title:"Advanced Topics", lessons:6 },
    { title:"Deployment & Beyond", lessons:4 },
  ];

  return (
    <>
      <Navbar />
      <div className={styles.courseHero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={styles.breadcrumb}>
              <Link to="/">Home</Link> / <Link to="/courses">Courses</Link> / {course.courseName}
            </div>
            <div className={styles.heroBadge}>{course.category?.name || "Course"}</div>
            <h1 className={styles.courseTitle}>{course.courseName}</h1>
            <p className={styles.courseDesc}>{course.courseDescription}</p>
            <div className={styles.metaRow}>
              <div className={styles.metaItem}><span className={styles.ratingStars}>★★★★★</span> <strong>4.9</strong> rating</div>
              <div className={styles.metaItem}>👥 <strong>{enrolled}</strong> students</div>
              <div className={styles.metaItem}>🎬 <strong>34</strong> lessons</div>
            </div>
            <div className={styles.instructorChip}>
              <div className={styles.icAvatar}>{initials}</div>
              <div className={styles.icName}>By {instructor}</div>
            </div>
          </div>

          <div className={styles.purchaseCard}>
            <div className={styles.courseThumbBig}>⚡</div>
            <div className={styles.priceDisplay}>
              <div className={styles.priceMain}>₹{course.price?.toLocaleString("en-IN") || "999"}</div>
              <div className={styles.priceOrig}>₹{Math.floor((course.price||999)*1.4).toLocaleString("en-IN")}</div>
              <div className={styles.discountBadge}>28% off</div>
            </div>
            {enrollMsg.text && <div className={`alert alert-${enrollMsg.type}`}>{enrollMsg.text}</div>}
            <button className={styles.btnEnrollBig} onClick={handleEnroll}>Enroll Now</button>
            <ul className={styles.courseIncludes}>
              <li>Full lifetime access</li>
              <li>Access on mobile & desktop</li>
              <li>Certificate of completion</li>
              <li>Direct instructor Q&A</li>
              <li>30-day money-back guarantee</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.courseContent}>
        <div className={styles.contentLeft}>
          {learns.length > 0 && (
            <div className={styles.learnsBox}>
              <h2>What You'll Learn</h2>
              <div className={styles.learnsGrid}>
                {learns.map((l,i) => <div key={i} className={styles.learnItem}>{l}</div>)}
              </div>
            </div>
          )}

          <div className={styles.curriculumSection}>
            <h2>Course Curriculum</h2>
            {curriculum.map((s,i) => (
              <div key={i} className={styles.sectionItem}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>📁 {s.title}</div>
                  <div className={styles.sectionMeta}>{s.lessons} lessons</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.reviewsSection}>
            <h2>Student Reviews</h2>
            {token && (
              <div className={styles.reviewForm}>
                <h3>Leave a Review</h3>
                <div className={styles.starsInput}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" className={`${styles.starBtn} ${rating >= n ? styles.activeStar : ""}`}
                      onClick={() => setRating(n)}>★</button>
                  ))}
                </div>
                <form onSubmit={submitReview}>
                  <textarea placeholder="Share your experience..." value={review}
                    onChange={e => setReview(e.target.value)} rows={3}
                    style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid var(--border2)",color:"var(--text)",padding:"12px",borderRadius:"8px",fontFamily:"DM Sans,sans-serif",fontSize:"0.875rem",resize:"vertical",outline:"none",marginBottom:12}} />
                  <button type="submit" className={styles.btnReview}>Submit Review</button>
                </form>
              </div>
            )}
            <div className={styles.reviewsList}>
              {reviews.map((r,i) => (
                <div key={r._id||i} className={styles.reviewItem}>
                  <div className={styles.riHeader}>
                    <div className={styles.riUser}>
                      <div className={styles.riAvatar}>{(r.user?.firstName||"S")[0]}</div>
                      <div className={styles.riName}>{r.user?.firstName || "Student"}</div>
                    </div>
                    <div className={styles.riStars}>{"★".repeat(r.rating||5)}</div>
                  </div>
                  <p style={{color:"var(--muted)",fontSize:"0.875rem",lineHeight:1.6}}>{r.review}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}


