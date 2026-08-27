import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * ChatbotContext
 * Allows any page (e.g. ViewCourse) to push a course/lecture context into
 * the globally-mounted Chatbot without prop-drilling through App.
 *
 * Shape of courseContext:
 * {
 *   courseId:          string   — MongoDB _id of the course
 *   courseTitle:       string   — human-readable course name
 *   lectureId:         string   — MongoDB _id of the active subSection (optional)
 *   lectureTitle:      string   — human-readable lecture title  (optional)
 *   lectureDescription:string   — lecture description text      (optional)
 * }
 */
const ChatbotContext = createContext(null);

export function ChatbotContextProvider({ children }) {
  const [courseContext, setCourseContext] = useState(null);

  const clearCourseContext = useCallback(() => setCourseContext(null), []);

  return (
    <ChatbotContext.Provider value={{ courseContext, setCourseContext, clearCourseContext }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbotContext() {
  return useContext(ChatbotContext);
}
