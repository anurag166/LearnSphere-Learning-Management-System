const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// In production, default to same-origin API path to avoid accidental localhost calls.
const defaultApiBaseUrl = import.meta.env.DEV
  ? "http://localhost:4000/api/v1"
  : "/api/v1";

export const API_BASE_URL = (envApiBaseUrl || defaultApiBaseUrl).replace(/\/$/, "");

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
