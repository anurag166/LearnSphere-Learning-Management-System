import React from "react";
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { authEndpoints } from "../services/apis";
import styles from "./ForgotPassword.module.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(token ? 2 : 1);
  const [resetToken, setResetToken] = useState(token || "");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleReset(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (newPw !== confirmPw) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const data = await apiConnector("POST", authEndpoints.RESET_PASSWORD, {
        password: newPw, confirmPassword: confirmPw, token: resetToken,
      });
      if (data.success) { setSuccess("Password reset!"); setStep(3); }
      else setError(data.message || "Reset failed.");
    } catch { setError("Server error."); }
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/login" className={styles.backLink}>← Back to Sign In</Link>
        <Link to="/" className="logo" style={{fontSize:"1.4rem",display:"block",marginBottom:28}}>Learn<span>Sphere</span></Link>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {step !== 3 && (
          <>
            <h1 className={styles.h1}>Set New Password</h1>
            <p className={styles.subtitle}>Enter your new password below. Make it strong!</p>
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Min. 8 characters" value={newPw}
                  onChange={e => setNewPw(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Repeat new password" value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)} required />
              </div>
              {!token && (
                <div className="form-group">
                  <label>Reset Token (from email)</label>
                  <input type="text" placeholder="Paste your reset token" value={resetToken}
                    onChange={e => setResetToken(e.target.value)} required />
                </div>
              )}
              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div style={{textAlign:"center"}}>
            <div className={styles.successIcon}>🎉</div>
            <h1 className={styles.h1}>Password Reset!</h1>
            <p className={styles.subtitle}>Your password has been changed successfully. You can now sign in.</p>
            <Link to="/login" className={styles.btn} style={{display:"block",marginTop:16,textAlign:"center",textDecoration:"none"}}>
              Sign In →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


