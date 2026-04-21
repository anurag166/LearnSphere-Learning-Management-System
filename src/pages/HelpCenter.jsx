import React from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const faqs = [
  {
    q: "Why is my course/lecture not visible?",
    a: "Ensure the course has at least one section and lecture, and check if you are enrolled with the same account used for purchase.",
  },
  {
    q: "How do I reset my password?",
    a: "Go to Login > Forgot Password, enter your email, and follow the reset link sent to your inbox.",
  },
  {
    q: "My payment succeeded but access is missing.",
    a: "Wait 1-2 minutes and refresh the dashboard. If still missing, contact support with your payment ID and course name.",
  },
  {
    q: "What is the maximum lecture upload size?",
    a: "Lecture upload limit is currently set to 100MB unless configured differently on the server.",
  },
];

export default function HelpCenter() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", padding: "48px 5%", background: "var(--bg1)", color: "var(--text1)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 34 }}>Help Center</h1>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>Find quick answers and support resources.</p>

          <section style={{ marginTop: 20, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>Contact Support</h2>
            <p style={{ color: "var(--muted)" }}>Email: <a href="mailto:support@learnsphere.com" style={{ color: "var(--accent2)", textDecoration: "none" }}>support@learnsphere.com</a></p>
            <p style={{ color: "var(--muted)" }}>Phone: <a href="tel:+911800123456" style={{ color: "var(--accent2)", textDecoration: "none" }}>+91 1800 123 456</a></p>
          </section>

          <section style={{ marginTop: 16, display: "grid", gap: 12 }}>
            {faqs.map((item) => (
              <details key={item.q} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>{item.q}</summary>
                <p style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>{item.a}</p>
              </details>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
