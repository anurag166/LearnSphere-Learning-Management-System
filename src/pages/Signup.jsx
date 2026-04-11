import React from "react";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { authEndpoints } from "../services/apis";
import styles from "./AuthSplit.module.css";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("Student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const otpRefs = useRef([]);

  async function sendOtp() {
    setError(""); 
    if (!email) { setError("Enter your email first."); return; }
    setOtpSending(true);
    try {
      const data = await apiConnector("POST", authEndpoints.SEND_OTP, { email });
      if (data.success) { setSuccess("OTP sent to your email!"); setStep(2); }
      else setError(data.message || "Failed to send OTP.");
    } catch { setError("Server error. Make sure the backend is running."); }
    setOtpSending(false);
  }

  function handleOtpInput(val, idx) {
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) otpRefs.current[idx+1]?.focus();
  }

  function handleOtpKey(e, idx) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx-1]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const data = await apiConnector("POST", authEndpoints.SIGNUP, {
        firstName, lastName, email, password, confirmPassword,
        accountType: role,
        otp: otp.join(""),
      });
      if (data.success) {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch { setError("Server error. Make sure the backend is running."); }
    setLoading(false);
  }

  const stepLabels = ["Account", "Verify", "Done"];

  return (
    <div className={styles.page}>
      <div className={styles.leftPanel}>
        <div className={styles.panelContent}>
          <Link to="/" className="logo">Learn<span>Sphere</span></Link>
          <h2 className={styles.panelTitle}>Start your <em>journey</em> today</h2>
          <p className={styles.panelSub}>Join thousands of learners and educators on LearnSphere. Free to sign up, learn at your own pace.</p>
          <div className={styles.roleCards}>
            <div className={styles.roleCard}>
              <span className={styles.ri}>🎓</span>
              <h4>Student</h4>
              <p>Browse & enroll in courses to build new skills</p>
            </div>
            <div className={styles.roleCard}>
              <span className={styles.ri}>🏫</span>
              <h4>Instructor</h4>
              <p>Create & sell courses to thousands of students</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formBox}>
          <div className={styles.formHeader}>
            <h2>Create Account</h2>
            <p>Already have one? <Link to="/login">Sign in</Link></p>
          </div>

          {/* Steps */}
          <div className={styles.steps}>
            {stepLabels.map((lbl, i) => (
              <>
                <div key={lbl} className={styles.stepItem}>
                  <div className={`${styles.stepCircle} ${step === i+1 ? styles.active : step > i+1 ? styles.done : ""}`}>
                    {step > i+1 ? "✓" : i+1}
                  </div>
                  <div className={`${styles.stepLabel} ${step === i+1 ? styles.active : ""}`}>{lbl}</div>
                </div>
                {i < stepLabels.length-1 && <div key={`line-${i}`} className={styles.stepLine} />}
              </>
            ))}
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={e => { e.preventDefault(); sendOtp(); }}>
              <div className={styles.roleSelect}>
                {["Student","Instructor"].map(r => (
                  <button key={r} type="button"
                    className={`${styles.roleBtn} ${role === r ? styles.selected : ""}`}
                    onClick={() => setRole(r)}>
                    <span className={styles.re}>{r === "Student" ? "🎓" : "🏫"}</span>{r}
                  </button>
                ))}
              </div>
              <div className={styles.formRow}>
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" placeholder="Rahul" value={firstName}
                    onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" placeholder="Kumar" value={lastName}
                    onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Min. 8 characters" value={password}
                  onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Repeat password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className={styles.btnSubmit} disabled={otpSending}>
                {otpSending ? <><span className={styles.dot}/><span className={styles.dot}/><span className={styles.dot}/></> : "Send OTP →"}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <p style={{color:"var(--muted)",fontSize:"0.9rem",marginBottom:24}}>
                Enter the 6-digit OTP sent to <strong style={{color:"var(--text)"}}>{email}</strong>
              </p>
              <div className={styles.otpInputs}>
                {otp.map((d, i) => (
                  <input key={i} type="text" inputMode="numeric" maxLength={1}
                    className={styles.otpDigit} value={d}
                    ref={el => otpRefs.current[i] = el}
                    onChange={e => handleOtpInput(e.target.value, i)}
                    onKeyDown={e => handleOtpKey(e, i)} />
                ))}
              </div>
              <button type="submit" className={styles.btnSubmit} style={{marginTop:24}} disabled={loading}>
                {loading ? <><span className={styles.dot}/><span className={styles.dot}/><span className={styles.dot}/></> : "Create Account"}
              </button>
              <button type="button" className={styles.btnBack} onClick={() => setStep(1)}>← Back</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


