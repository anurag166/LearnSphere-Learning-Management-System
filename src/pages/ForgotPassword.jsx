import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { authEndpoints } from "../services/apis";
import styles from "./ForgotPassword.module.css";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function sendToken(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const data = await apiConnector("POST", authEndpoints.RESET_PASSWORD_TOKEN, { email });
      if (data?.success === true) {
        setSuccess(data.message || "Reset link sent! Check your email.");
        setStep(2);
      } else {
        setStep(1);
        setError(data?.message || "Failed to send reset link.");
      }
    } catch (error) {
      setStep(1);
      setError(
        error?.response?.data?.message ||
          "Server error. Make sure the backend is running."
      );
    }
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/login" className={styles.backLink}>← Back to Sign In</Link>
        <Link to="/" className="logo" style={{fontSize:"1.4rem",display:"block",marginBottom:28}}>Learn<span>Sphere</span></Link>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {step === 1 && (
          <>
            <h1 className={styles.h1}>Forgot Password?</h1>
            <p className={styles.subtitle}>No worries! Enter your email and we'll send you a reset link.</p>
            <form onSubmit={sendToken}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <div style={{textAlign:"center"}}>
            <div className={styles.successIcon}>📧</div>
            <h1 className={styles.h1}>Check Your Email</h1>
            <p className={styles.subtitle}>
              We've sent a password reset link to <strong>{email}</strong>.
              Open your email and use the link to reset your password.
            </p>
            <p className={styles.subtitle} style={{marginTop: 16}}>
              If you prefer, you can also paste the reset token on the reset page at <strong>/reset-password</strong>.
            </p>
            <Link to="/reset-password" className={styles.btn} style={{display:"block",marginTop:24,textAlign:"center",textDecoration:"none"}}>
              Open Reset Password Page →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


