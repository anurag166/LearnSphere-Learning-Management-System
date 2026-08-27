import React, { useState, useEffect, useRef } from "react";
import { FiX, FiSend, FiAlertCircle, FiBookOpen } from "react-icons/fi";
import { HiSparkles as FiSparkles } from "react-icons/hi2";
import { sendChatMessage, sendCourseChatMessage } from "../../services/operations/chatbotAPI";
import styles from "./Chatbot.module.css";

const GENERAL_SUGGESTIONS = [
  "What courses are available?",
  "How do I earn certificates?",
  "How to create a course as an instructor?",
  "Help with password reset",
];

const COURSE_SUGGESTIONS = [
  "Explain this concept more simply",
  "Give me an example",
  "What was covered in the previous topic?",
  "I'm stuck — can you help?",
];

function buildWelcomeMessage(courseContext) {
  if (courseContext?.courseTitle) {
    const lecturePart = courseContext.lectureTitle
      ? ` You're currently on **"${courseContext.lectureTitle}"**.`
      : "";
    return `Hi! 👋 I'm your LearnSphere AI course assistant.${lecturePart} Ask me anything about this course or the current lecture!`;
  }
  return "Hello! 👋 I am your LearnSphere AI assistant. How can I help you with your courses or learning path today?";
}

export default function Chatbot({ courseContext = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Reset messages and show context-aware welcome whenever courseContext changes
  useEffect(() => {
    setMessages([
      {
        id: "welcome-1",
        sender: "ai",
        text: buildWelcomeMessage(courseContext),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setErrorMessage("");
  }, [courseContext?.courseId, courseContext?.lectureId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      if (messages.length <= 1) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    }
  }, [isOpen, messages, loading]);

  const isCourseMode = Boolean(courseContext?.courseId);
  const suggestions = isCourseMode ? COURSE_SUGGESTIONS : GENERAL_SUGGESTIONS;

  const handleSendMessage = async (textToSend) => {
    const text = typeof textToSend === "string" ? textToSend : inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setErrorMessage("");
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "ai",
        text: m.text,
      }));

      let res;
      if (isCourseMode) {
        // Use the enrollment-gated course chat endpoint
        res = await sendCourseChatMessage(
          userMsg.text,
          courseContext.courseId,
          courseContext.lectureId || null,
          historyPayload
        );
      } else {
        // General chat endpoint
        res = await sendChatMessage(userMsg.text, historyPayload, null);
      }

      const replyText = res?.data?.reply || res?.reply;
      if (replyText) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        throw new Error(res?.message || "Failed to receive response from assistant");
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Could not connect to AI service. Please try again.";
      setErrorMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.chatWidget}>
      {/* Floating Action Trigger Button */}
      <button
        type="button"
        className={`${styles.chatToggleBtn} ${isOpen ? styles.active : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        title={isCourseMode ? "Course AI Assistant" : "LearnSphere AI Assistant"}
      >
        {isOpen ? <FiX size={24} /> : isCourseMode ? <FiBookOpen size={22} /> : <FiSparkles size={24} />}
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow} role="dialog" aria-label="LearnSphere AI Chatbot">
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <div className={styles.botAvatar}>
                {isCourseMode ? <FiBookOpen size={18} color="#fff" /> : <FiSparkles size={18} color="#fff" />}
              </div>
              <div>
                <div className={styles.headerTitle}>
                  {isCourseMode ? "Course Assistant" : "LearnSphere AI"}
                </div>
                <div className={styles.headerStatus}>
                  <span className={styles.statusDot} />
                  <span>
                    {isCourseMode && courseContext?.lectureTitle
                      ? `${courseContext.lectureTitle.slice(0, 28)}${courseContext.lectureTitle.length > 28 ? "…" : ""}`
                      : "Online Assistant"}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className={styles.chatMessages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageWrapper} ${
                  msg.sender === "user" ? styles.userWrapper : styles.aiWrapper
                }`}
              >
                <div
                  className={`${styles.messageBubble} ${
                    msg.sender === "user" ? styles.userBubble : styles.aiBubble
                  }`}
                >
                  {msg.text}
                  <div className={styles.msgTime}>{msg.timestamp}</div>
                </div>
              </div>
            ))}

            {/* Quick suggestions on start */}
            {messages.length <= 1 && !loading && (
              <div className={styles.quickSuggestions}>
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={styles.suggestionBtn}
                    onClick={() => handleSendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Loading / typing indicator */}
            {loading && (
              <div className={`${styles.messageWrapper} ${styles.aiWrapper}`}>
                <div className={styles.typingIndicator}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            {/* Error banner */}
            {errorMessage && (
              <div className={styles.errorBanner}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FiAlertCircle /> {errorMessage}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={styles.chatInputArea}>
            <input
              ref={inputRef}
              type="text"
              className={styles.chatInput}
              placeholder={
                isCourseMode
                  ? "Ask about this course or lecture…"
                  : "Ask LearnSphere AI a question…"
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="button"
              className={styles.sendBtn}
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              aria-label="Send Message"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
