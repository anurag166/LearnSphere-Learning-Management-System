import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { authEndpoints } from "../services/apis";
import styles from "./AuthSplit.module.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const data = await apiConnector("POST", authEndpoints.LOGIN, { email, password });
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          navigate(data.user?.accountType === "Instructor" ? "/instructor-dashboard" : "/dashboard");
        }, 1000);
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Server error. Make sure the backend is running on port 4000.");
    }
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.leftPanel}>
        <div className={styles.panelContent}>
          <Link to="/" className="logo">Learn<span>Sphere</span></Link>
          <h2 className={styles.panelTitle}>Welcome <em>back</em> to your learning journey</h2>
          <p className={styles.panelSub}>Pick up right where you left off. Your courses, progress, and certificates await.</p>
          <ul className={styles.featureList}>
            <li>Access 200+ expert-led courses</li>
            <li>Track your learning progress</li>
            <li>Earn shareable certificates</li>
            <li>Connect with instructors directly</li>
          </ul>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formBox}>
          <div className={styles.formHeader}>
            <h2>Sign In</h2>
            <p>New to LearnSphere? <Link to="/signup">Create an account</Link></p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className={styles.passwordWrap}>
                <input type={showPw ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className={styles.togglePw} onClick={() => setShowPw(!showPw)}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            <div className={styles.forgot}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? <><span className={styles.dot}/><span className={styles.dot}/><span className={styles.dot}/></> : "Sign In"}
            </button>
          </form>

          <div className={styles.divider}>or</div>
          <p style={{textAlign:"center",color:"var(--muted)",fontSize:"0.875rem"}}>
            Don't have an account? <Link to="/signup" style={{color:"var(--accent2)"}}>Sign up for free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}


