import React from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "80vh", padding: "48px 5%", background: "var(--bg1)", color: "var(--text1)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
          <h1 style={{ marginTop: 0 }}>Terms of Service</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            By using LearnSphere, you agree to these terms for account use, course access, payments, and content conduct.
          </p>
          <h2>Accounts</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>Keep your credentials secure and provide accurate account information.</p>
          <h2>Payments and Access</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>Course access is granted after successful payment verification.</p>
          <h2>Instructor Content</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>Instructors are responsible for legality and originality of uploaded content.</p>
          <h2>Support</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>Contact <a href="mailto:anuragyadav31660@gmail.com" style={{ color: "var(--accent2)", textDecoration: "none" }}>anuragyadav31660@gmail.com</a> for policy or account concerns.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
