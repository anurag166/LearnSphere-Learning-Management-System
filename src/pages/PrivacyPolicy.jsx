import React from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", padding: "110px 5% 48px", background: "var(--bg1)", color: "var(--text1)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <h1 style={{ marginTop: 0 }}>Privacy Policy</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            LearnSphere collects essential account, course, and payment metadata to provide learning services.
            We do not sell personal data. Data is processed for authentication, course access, support, and analytics.
          </p>
          <h2>Data We Collect</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>Name, email, profile details, enrollment records, and payment transaction identifiers.</p>
          <h2>How We Use Data</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>To deliver courses, verify purchases, personalize dashboards, and resolve support tickets.</p>
          <h2>Contact</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>For privacy questions: <a href="mailto:privacy@learnsphere.com" style={{ color: "var(--accent2)", textDecoration: "none" }}>privacy@learnsphere.com</a>.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
