import { apiConnector } from "../apiConnector";
import { chatbotEndpoints } from "../apis";

/**
 * Send a general chat message to the LearnSphere AI Chatbot backend.
 * Works for guests and logged-in users alike.
 *
 * @param {string} message - The current user query
 * @param {Array}  history - Previous messages [{ role: "user"|"ai", text: string }]
 * @param {Object|null} courseContext - Optional lightweight course hint (not for auth-gated content)
 * @returns {Promise<Object>} Response with AI reply
 */
export async function sendChatMessage(message, history = [], courseContext = null) {
  const headers = { "Content-Type": "application/json" };

  const authToken = localStorage.getItem("token");
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return apiConnector(
    "POST",
    chatbotEndpoints.CHAT,
    { message, history, courseContext },
    headers
  );
}

/**
 * Send a course-aware chat message.
 * Requires the user to be logged in AND enrolled in the course.
 * The backend verifies enrollment before exposing any course content.
 *
 * @param {string} message   - The student's question
 * @param {string} courseId  - MongoDB _id of the course currently being viewed
 * @param {string|null} lectureId - MongoDB _id of the active subSection (optional)
 * @param {Array}  history   - Previous messages [{ role: "user"|"ai", text: string }]
 * @returns {Promise<Object>} Response with AI reply
 */
export async function sendCourseChatMessage(message, courseId, lectureId = null, history = []) {
  const headers = { "Content-Type": "application/json" };

  const authToken = localStorage.getItem("token");
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return apiConnector(
    "POST",
    chatbotEndpoints.COURSE_CHAT,
    { message, courseId, lectureId, history },
    headers
  );
}
