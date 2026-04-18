import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { API_BASE_URL, profileEndpoints } from "../services/apis";
import styles from "./Profile.module.css";

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().split("T")[0];
}

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await apiConnector("GET", profileEndpoints.GET_USER_DETAILS, null, {
          Authorization: `Bearer ${token}`,
        });

        const userData = res.data;
        if (!userData) {
          return;
        }

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.error("PROFILE FETCH ERROR:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, token]);

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const updatePasswordHandler = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);

      await apiConnector(
        "POST",
        `${API_BASE_URL}/auth/changepassword`,
        {
          oldpassword: oldPassword,
          newPassword,
          confirmPassword: confirmNewPassword,
        },
        {
          Authorization: `Bearer ${token}`,
        }
      );

      setPasswordMessage("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordMessage(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setPhotoMessage("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoMessage("Please choose a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoMessage("Image size must be under 5MB.");
      return;
    }

    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const updateProfilePicture = async () => {
    if (!selectedImage) {
      setPhotoMessage("Please select an image first.");
      return;
    }

    try {
      setPhotoLoading(true);
      setPhotoMessage("");

      const formData = new FormData();
      formData.append("displayPicture", selectedImage);

      const res = await apiConnector(
        "PUT",
        profileEndpoints.UPDATE_DISPLAY_PICTURE,
        formData,
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        }
      );

      const updatedUser = res.data || res.user || res.updatedUser;
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setSelectedImage(null);
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage("");
      setPhotoMessage("Profile picture updated successfully.");
    } catch (err) {
      setPhotoMessage(err.response?.data?.message || "Failed to update profile picture.");
    } finally {
      setPhotoLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  if (!user) {
    return <div className={styles.error}>Failed to load profile.</div>;
  }

  const profile = user.additionalDetails || {};
  const accountInitials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;

  return (
    <div className={styles.page}>
      <div className={styles.gradientOrbOne} />
      <div className={styles.gradientOrbTwo} />

      <div className={styles.profileShell}>
        <section className={styles.heroCard}>
          <div className={styles.avatarBlock}>
            {user.profileImage ? (
              <img src={previewImage || user.profileImage} alt="profile" className={styles.avatar} />
            ) : (
              <div className={styles.avatarFallback}>{accountInitials || "U"}</div>
            )}

            <label className={styles.uploadLabel}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.hiddenInput}
              />
              Choose new photo
            </label>

            <button
              type="button"
              onClick={updateProfilePicture}
              disabled={photoLoading}
              className={styles.savePhotoBtn}
            >
              {photoLoading ? "Uploading..." : "Save photo"}
            </button>

            {photoMessage && <p className={styles.helperText}>{photoMessage}</p>}
          </div>

          <div className={styles.identityBlock}>
            <h1 className={styles.name}>
              {user.firstName} {user.lastName}
            </h1>
            <p className={styles.email}>{user.email}</p>
            <span className={styles.roleChip}>{user.accountType}</span>

            <div className={styles.metaGrid}>
              <InfoTile label="Joined As" value={user.accountType || "-"} />
              <InfoTile label="Date of Birth" value={formatDate(profile.dob)} />
              <InfoTile label="Gender" value={profile.gender || "-"} />
              <InfoTile label="Contact" value={profile.contactNumber || "-"} />
            </div>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2>About</h2>
              <p>Your profile summary and personal details</p>
            </div>
            <p className={styles.aboutText}>
              {profile.about || "Tell learners more about yourself from settings."}
            </p>
          </section>

          <section className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2>Security</h2>
              <p>Keep your account protected</p>
            </div>

            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className={styles.togglePasswordBtn}
              type="button"
            >
              {showPasswordForm ? "Hide password form" : "Change password"}
            </button>

            {showPasswordForm && (
              <form onSubmit={updatePasswordHandler} className={styles.passwordForm}>
                <input
                  type="password"
                  placeholder="Current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />

                {passwordMessage && <p className={styles.helperText}>{passwordMessage}</p>}

                <button type="submit" disabled={passwordLoading} className={styles.passwordBtn}>
                  {passwordLoading ? "Updating..." : "Update password"}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className={styles.infoTile}>
      <p>{label}</p>
      <h4>{value || "-"}</h4>
    </div>
  );
}
