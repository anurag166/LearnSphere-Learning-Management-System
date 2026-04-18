const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const renderProductionApiBaseUrl =
  "https://studynotion-learning-management-system.onrender.com/api/v1";

const defaultApiBaseUrl = import.meta.env.DEV
  ? "http://localhost:4000/api/v1"
  : renderProductionApiBaseUrl;

const isLocalhostApiUrl = (url = "") => /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);

// Guard against accidentally deploying with localhost API URL in frontend env vars.
const resolvedApiBaseUrl = !import.meta.env.DEV && isLocalhostApiUrl(envApiBaseUrl)
  ? renderProductionApiBaseUrl
  : (envApiBaseUrl || defaultApiBaseUrl);

export const API_BASE_URL = resolvedApiBaseUrl.replace(/\/$/, "");

const BASE_URL = `${API_BASE_URL}/`;

export const authEndpoints = {
  SEND_OTP: `${BASE_URL}auth/sendOTP`,
  SIGNUP: `${BASE_URL}auth/signup`,
  LOGIN: `${BASE_URL}auth/login`,
  RESET_PASSWORD_TOKEN: `${BASE_URL}auth/reset-password-token`,
  RESET_PASSWORD: `${BASE_URL}auth/reset-password`,
};

export const profileEndpoints = {
  GET_USER_DETAILS: `${BASE_URL}profile/getAllUserDetails`,
  UPDATE_PROFILE: `${BASE_URL}profile/updateProfile`,
};

export const courseEndpoints = {
  GET_ALL_COURSES: `${BASE_URL}course/showAllCourses`,
  GET_ALL_CATEGORIES: `${BASE_URL}course/showAllCategory`,
  GET_COURSE_DETAILS: (id) => `${BASE_URL}course/getCourseDetails/${id}`,
  CREATE_COURSE: `${BASE_URL}course/createCourse`,
  GET_ALL_REVIEWS: `${BASE_URL}course/getAllRatingAndReviews`,
};
