import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { course } from "../models/course.model.js";
import { category } from "../models/category.model.js";
import { RatingAndReviews } from "../models/RatingAndReviews.model.js";
import { User } from "../models/user.model.js";

// ─────────────────────────────────────────────────────────────────────────────
// Intent detection keywords
// ─────────────────────────────────────────────────────────────────────────────
const INTENT_PATTERNS = {
  listCourses:    /\b(all courses?|available courses?|show courses?|list courses?|what courses?|course catalog|browse courses?|courses? available|courses? you have|courses? offered|courses? on learnsphere|what do you (offer|have)|what can i (learn|study))\b/i,
  courseDetails:  /\b(tell me about|details? (of|about|for)|what is|describe|overview of|about the course|what does .+ cover|what (will|would) i learn|curriculum|syllabus)\b/i,
  mentorInfo:     /\b(who (is|teaches|created|made)|instructor|mentor|teacher|who made|who built|by whom|professor|tutor)\b/i,
  ratingReview:   /\b(rating|review|rated|stars?|feedback|how (good|popular)|testimonials?)\b/i,
  duration:       /\b(how long|duration|hours?|time|length|how many (lectures?|lessons?|videos?|sections?|modules?))\b/i,
  enrollment:     /\b(enroll|buy|purchase|how (to|do i) (join|get|access|enroll|buy|start)|sign up for|register for|how (much|to pay))\b/i,
  beginner:       /\b(beginner|beginner.friendly|beginner courses?|easiest|for (newbies?|beginners?|starters?|novices?)|start (from scratch|learning)|no experience|zero experience|first (course|time)|which course (should i|to) start)\b/i,
  pricing:        /\b(price|cost|fee|how much|₹|free|paid|expensive|cheap|affordable)\b/i,
  faq:            /\b(how (do|can) i|how to|register|become (a|an)|help|support|contact|policy|refund|certificate|payment|account|login|signup|password)\b/i,
  searchByName:   /\b(course (named?|called|titled?)|find|search for|looking for|want to (learn|study)|interested in)\b/i,
};

// ─────────────────────────────────────────────────────────────────────────────
// DB helpers — fetch real LearnSphere data
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all courses with instructor populated (lightweight) */
async function fetchAllCourses() {
  return course
    .find({})
    .select("courseName courseDescription price level language tag studentsEnrolled studentEnrolled instructor ratingsAndReviews category courseContent")
    .populate("instructor", "firstName lastName email")
    .populate("category", "name")
    .populate("ratingsAndReviews", "rating review")
    .populate({
      path: "courseContent",
      populate: { path: "subSection", model: "subSection", select: "title timeDuration" },
    })
    .lean()
    .exec();
}

/** Fuzzy-find a course by partial name match */
async function findCourseByName(nameQuery) {
  const regex = new RegExp(nameQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  return course
    .findOne({ courseName: regex })
    .populate("instructor", "firstName lastName email")
    .populate("category", "name")
    .populate("ratingsAndReviews", "rating review user")
    .populate({
      path: "courseContent",
      populate: { path: "subSection", model: "subSection", select: "title timeDuration" },
    })
    .lean()
    .exec();
}

/** Summarise an array of courses into a concise markdown string */
function summariseCourseList(courses) {
  if (!courses || courses.length === 0) {
    return "There are currently no courses available on LearnSphere.";
  }

  const lines = courses.map((c, i) => {
    const instructor = c.instructor
      ? `${c.instructor.firstName || ""} ${c.instructor.lastName || ""}`.trim()
      : "Unknown";
    const enrolled = (c.studentsEnrolled?.length || 0) + (c.studentEnrolled?.length || 0);
    const price = c.price === 0 ? "Free" : `₹${Number(c.price).toLocaleString("en-IN")}`;
    const avgRating = computeAvgRating(c.ratingsAndReviews);
    const ratingStr = avgRating ? ` | ⭐ ${avgRating}` : "";
    const level = c.level || "Beginner";
    return `${i + 1}. **${c.courseName}** — ${price} | ${level} | By ${instructor} | 👥 ${enrolled} students${ratingStr}`;
  });

  return `Here are the courses available on LearnSphere:\n\n${lines.join("\n")}`;
}

/** Summarise a single course's full details */
function summariseCourseDetails(c, focusOn = "all") {
  if (!c) return null;

  const instructor = c.instructor
    ? `${c.instructor.firstName || ""} ${c.instructor.lastName || ""}`.trim()
    : "Unknown";
  const price = c.price === 0 ? "Free" : `₹${Number(c.price).toLocaleString("en-IN")}`;
  const enrolled = (c.studentsEnrolled?.length || 0) + (c.studentEnrolled?.length || 0);
  const avgRating = computeAvgRating(c.ratingsAndReviews);
  const reviewCount = c.ratingsAndReviews?.length || 0;
  const tags = Array.isArray(c.tag) && c.tag.length ? c.tag.join(", ") : null;

  // Curriculum summary
  let lectureCount = 0;
  let totalMinutes = 0;
  const sections = c.courseContent || [];
  sections.forEach((sec) => {
    (sec.subSection || []).forEach((sub) => {
      lectureCount++;
      // timeDuration may be "10:30" or "10" (minutes)
      const parts = (sub.timeDuration || "0").split(":");
      const mins = parseInt(parts[0], 10) || 0;
      const secs = parseInt(parts[1], 10) || 0;
      totalMinutes += mins + secs / 60;
    });
  });
  const durationStr =
    totalMinutes > 0
      ? totalMinutes >= 60
        ? `~${(totalMinutes / 60).toFixed(1)} hrs (${lectureCount} lectures)`
        : `~${Math.round(totalMinutes)} mins (${lectureCount} lectures)`
      : lectureCount > 0
      ? `${lectureCount} lectures`
      : "Duration info not available";

  if (focusOn === "mentor") {
    return `**Instructor for "${c.courseName}":** ${instructor}`;
  }

  if (focusOn === "rating") {
    if (!reviewCount) {
      return `"${c.courseName}" has no ratings or reviews yet.`;
    }
    const recent = (c.ratingsAndReviews || [])
      .slice(0, 3)
      .map((r) => `• ⭐${r.rating}/5 — "${r.review}"`)
      .join("\n");
    return `**"${c.courseName}"** — ⭐ ${avgRating}/5 (${reviewCount} review${reviewCount > 1 ? "s" : ""})\n\n${recent}`;
  }

  if (focusOn === "duration") {
    return `**"${c.courseName}"** has **${durationStr}**.`;
  }

  if (focusOn === "price") {
    return `**"${c.courseName}"** costs **${price}**.${c.price === 0 ? " It's completely free!" : ""}`;
  }

  // Full details
  let details = `## ${c.courseName}\n\n`;
  details += `**Price:** ${price}  |  **Level:** ${c.level || "Beginner"}  |  **Language:** ${c.language || "English"}\n`;
  details += `**Instructor:** ${instructor}\n`;
  details += `**Duration:** ${durationStr}\n`;
  if (c.category?.name) details += `**Category:** ${c.category.name}\n`;
  if (enrolled) details += `**Students Enrolled:** ${enrolled}\n`;
  if (avgRating) details += `**Rating:** ⭐ ${avgRating}/5 (${reviewCount} reviews)\n`;
  if (tags) details += `**Tags:** ${tags}\n`;
  details += `\n**Description:** ${c.courseDescription || "N/A"}\n`;
  if (c.whatWillYouLearn) details += `\n**What you'll learn:** ${c.whatWillYouLearn}\n`;

  if (sections.length) {
    details += `\n**Curriculum:**\n`;
    sections.slice(0, 5).forEach((sec) => {
      details += `- ${sec.sectionName || "Section"}\n`;
      (sec.subSection || []).slice(0, 3).forEach((sub) => {
        details += `  • ${sub.title} (${sub.timeDuration || "?"})\n`;
      });
    });
    if (sections.length > 5) details += `  *(…and ${sections.length - 5} more sections)*\n`;
  }

  return details;
}

function computeAvgRating(ratingsArray) {
  if (!ratingsArray || ratingsArray.length === 0) return null;
  const sum = ratingsArray.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  return (sum / ratingsArray.length).toFixed(1);
}

/** Extract a likely course name keyword from the user's query */
function extractCourseName(query) {
  // Remove common filler phrases
  const cleaned = query
    .replace(/tell me about|details? (of|about|for)?|what (is|are)|describe|overview of|about the course|who (is|teaches|created|made) (the |)?|instructor (of|for|in)?|mentor (of|for|in)?|teacher (of|for|in)?|rating (of|for)?|review (of|for)?|how long (is|does)?|duration (of|for)?|price (of|for)?|cost (of|for)?|how much (is|does|for)?|enroll (in|for)?|buy|course named?|course called|course titled?/gi, "")
    .replace(/\?|!|\./g, "")
    .trim();
  return cleaned || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Intent router — decides what DB data to fetch and how to format it
// ─────────────────────────────────────────────────────────────────────────────
async function resolveLearnSphereContext(message) {
  const q = message;

  // Beginner courses — check before generic listCourses to avoid early exit
  if (INTENT_PATTERNS.beginner.test(q)) {
    const courses = await fetchAllCourses();
    const beginnerCourses = courses.filter(
      (c) => !c.level || c.level.toLowerCase() === "beginner"
    );
    if (beginnerCourses.length === 0) {
      return "I could not find any beginner-level courses at the moment. Please check back later!";
    }
    const list = summariseCourseList(beginnerCourses);
    return `Here are our beginner-friendly courses:\n\n${list.replace(/^.*?\n\n/, "")}`;
  }

  // List all courses
  if (INTENT_PATTERNS.listCourses.test(q)) {
    const courses = await fetchAllCourses();
    return summariseCourseList(courses);
  }

  // Mentor / instructor focus
  // Exclude generic "how do I become an instructor" career questions —
  // those are FAQ/platform questions, not "who teaches this course".
  const isBecomeInstructorQuery = /\bbecome\s+(a|an)?\s*(instructor|mentor|teacher|tutor)\b/i.test(q);
  if (INTENT_PATTERNS.mentorInfo.test(q) && !isBecomeInstructorQuery) {
    const namePart = extractCourseName(q);
    if (namePart) {
      const found = await findCourseByName(namePart);
      if (found) return summariseCourseDetails(found, "mentor");
      // Fallback: search across all
      const all = await fetchAllCourses();
      const match = all.find((c) =>
        c.courseName.toLowerCase().includes(namePart.toLowerCase())
      );
      if (match) return summariseCourseDetails(match, "mentor");
      return `I couldn't find a course matching "${namePart}". Please check the course name and try again.`;
    }
    // No course name given — list all instructors
    const all = await fetchAllCourses();
    if (!all.length) return "No courses found in the database.";
    const lines = all.map((c) => {
      const ins = c.instructor
        ? `${c.instructor.firstName || ""} ${c.instructor.lastName || ""}`.trim()
        : "Unknown";
      return `• **${c.courseName}** → Instructor: ${ins}`;
    });
    return `Here are the instructors for all courses:\n\n${lines.join("\n")}`;
  }

  // Rating / review focus
  if (INTENT_PATTERNS.ratingReview.test(q)) {
    const namePart = extractCourseName(q);
    if (namePart) {
      const found = await findCourseByName(namePart);
      if (found) return summariseCourseDetails(found, "rating");
      return `I couldn't find a course matching "${namePart}". Please check the course name and try again.`;
    }
    // Top-rated courses
    const all = await fetchAllCourses();
    const rated = all
      .filter((c) => c.ratingsAndReviews?.length > 0)
      .map((c) => ({ ...c, avg: parseFloat(computeAvgRating(c.ratingsAndReviews)) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
    if (!rated.length) return "No ratings or reviews are available yet on LearnSphere.";
    const lines = rated.map(
      (c) => `• **${c.courseName}** — ⭐ ${c.avg}/5 (${c.ratingsAndReviews.length} reviews)`
    );
    return `Here are the top-rated courses on LearnSphere:\n\n${lines.join("\n")}`;
  }

  // Duration focus
  if (INTENT_PATTERNS.duration.test(q)) {
    const namePart = extractCourseName(q);
    if (namePart) {
      const found = await findCourseByName(namePart);
      if (found) return summariseCourseDetails(found, "duration");
      return `I couldn't find a course matching "${namePart}". Please check the course name and try again.`;
    }
    return null; // Let the LLM handle generic duration questions
  }

  // Pricing focus
  if (INTENT_PATTERNS.pricing.test(q)) {
    const namePart = extractCourseName(q);
    if (namePart) {
      const found = await findCourseByName(namePart);
      if (found) return summariseCourseDetails(found, "price");
      return `I couldn't find a course matching "${namePart}". Please check the course name and try again.`;
    }
    // List all prices
    const all = await fetchAllCourses();
    if (!all.length) return "No courses found in the database.";
    const lines = all.map((c) => {
      const price = c.price === 0 ? "Free" : `₹${Number(c.price).toLocaleString("en-IN")}`;
      return `• **${c.courseName}** — ${price}`;
    });
    return `Here is the pricing for all LearnSphere courses:\n\n${lines.join("\n")}`;
  }

  // Enrollment focus
  if (INTENT_PATTERNS.enrollment.test(q)) {
    const namePart = extractCourseName(q);
    if (namePart) {
      const found = await findCourseByName(namePart);
      if (found) {
        const price = found.price === 0 ? "Free" : `₹${Number(found.price).toLocaleString("en-IN")}`;
        return `To enroll in **"${found.courseName}"** (${price}):\n1. Visit the **Courses** page.\n2. Click on the course card.\n3. Click **Enroll Now** and proceed to checkout.\n4. Complete payment via Razorpay (if applicable).`;
      }
    }
    return `To enroll in a course on LearnSphere:\n1. Go to the **Courses** page.\n2. Browse and click on a course.\n3. Click **Enroll Now**.\n4. Complete checkout with Razorpay (for paid courses).\nYou must be logged in to enroll.`;
  }

  // Course details / curriculum / search by name
  const detailsMatch = INTENT_PATTERNS.courseDetails.test(q) || INTENT_PATTERNS.searchByName.test(q);
  if (detailsMatch) {
    const namePart = extractCourseName(q);
    // Only commit to "this must be a course lookup" if the query itself
    // references a course/class/program explicitly. Otherwise generic
    // questions like "what is programming" would get treated as a failed
    // course search instead of falling through to the general AI answer.
    const explicitlyAboutACourse = /\b(course|class|program|lecture|module|tutorial)\b/i.test(q);
    if (namePart) {
      const found = await findCourseByName(namePart);
      if (found) return summariseCourseDetails(found, "all");
      if (explicitlyAboutACourse) {
        return `I couldn't find a course matching "${namePart}" in the LearnSphere catalog. You can browse all available courses by visiting the **Courses** page or by asking me to "show all courses".`;
      }
      // Not clearly a course-name search — let the LLM answer normally.
    }
  }

  // FAQ / general platform questions
  if (INTENT_PATTERNS.faq.test(q)) {
    return buildFaqAnswer(q);
  }

  return null; // Not a LearnSphere-specific query
}

function buildFaqAnswer(q) {
  const lower = q.toLowerCase();
  if (/become\s+(a|an)?\s*(instructor|mentor|teacher|tutor)/.test(lower)) {
    return "To become an instructor on LearnSphere:\n1. Click **Sign Up** and choose **Instructor** as your account type.\n2. Verify your email with the OTP sent to you.\n3. Once logged in, go to your **Instructor Dashboard → Create Course** to publish your first course.";
  }
  if (/register|enroll/.test(lower) && /course/.test(lower)) {
    return "To register/enroll in a course:\n1. Browse the **Courses** page and open the one you want.\n2. Click **Enroll Now**.\n3. Free courses enroll instantly; paid courses go through a quick Razorpay checkout.\nYou'll need to be logged in first.";
  }
  if (/certificate/.test(lower)) {
    return "You can earn a **completion certificate** on LearnSphere by watching all lectures in a course. Certificates appear on your Dashboard after you complete 100% of the course content.";
  }
  if (/refund/.test(lower)) {
    return "For refund-related queries, please contact our support team via **Dashboard → Support → Raise a Ticket** or email us directly.";
  }
  if (/payment/.test(lower)) {
    return "LearnSphere uses **Razorpay** for secure payments. We accept UPI, cards, net banking, and wallets.";
  }
  if (/password/.test(lower)) {
    return "To reset your password, click **Forgot Password** on the Login page. A reset link will be sent to your registered email.";
  }
  if (/contact|support/.test(lower)) {
    return "You can reach LearnSphere support via:\n• **Dashboard → Support** (raise a ticket)\n• **Help Center** page\n• Email: anuragyadav31660@gmail.com";
  }
  if (/account|login|signup|register/.test(lower)) {
    return "To create an account, click **Sign Up** on the homepage. You'll receive an OTP on your email for verification. Once verified, you can log in and start learning!";
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM call helpers (same as before, no changes)
// ─────────────────────────────────────────────────────────────────────────────
async function callGemini(systemPrompt, historyMessages, userQuery) {
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const contents = [];
  for (const msg of historyMessages.slice(-6)) {
    if (msg.role && msg.text) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }
  }
  contents.push({
    role: "user",
    parts: [{ text: `${systemPrompt}\n\nUser: ${userQuery}` }],
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });
  if (!response.ok) {
    console.warn("Gemini call failed:", response.status, await response.text().catch(() => ""));
    return null;
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

async function callOpenAI(systemPrompt, historyMessages, userQuery) {
  const openaiModel = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
  // Configurable base URL so any OpenAI-compatible provider works here too
  // (e.g. Groq: https://api.groq.com/openai/v1, OpenRouter:
  // https://openrouter.ai/api/v1, Together AI, etc.) — just set
  // OPENAI_BASE_URL and OPENAI_API_KEY/OPENAI_MODEL to match your provider.
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const messages = [{ role: "system", content: systemPrompt }];
  for (const msg of historyMessages.slice(-6)) {
    if (msg.role && msg.text) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      });
    }
  }
  messages.push({ role: "user", content: userQuery });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: openaiModel, messages, max_tokens: 900 }),
  });
  if (!response.ok) {
    console.warn("OpenAI-compatible call failed:", response.status, await response.text().catch(() => ""));
    return null;
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main controller
// ─────────────────────────────────────────────────────────────────────────────
export const handleChat = asyncHandler(async (req, res) => {
  const { message, history = [], courseContext = null } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    throw new ApiError(400, "Message cannot be empty");
  }

  const userQuery = message.trim();

  // ── Step 1: Try to resolve with real LearnSphere DB data ──────────────────
  let dbContext = null;
  try {
    dbContext = await resolveLearnSphereContext(userQuery);
  } catch (dbErr) {
    console.warn("DB context resolution error:", dbErr.message);
  }

  let aiReply = "";

  // If we have a crisp DB-driven answer and no external LLM, use it directly
  if (dbContext && !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    aiReply = dbContext;
  } else {
    // ── Step 2: Build system prompt (inject DB context if available) ────────
    let systemPrompt = `You are LearnSphere AI, the official intelligent assistant for the LearnSphere EdTech Learning Platform.
Your job is to help students and instructors with questions about LearnSphere itself: courses, mentors/instructors, ratings & reviews, pricing, enrollment, certificates, payments, account/login/signup, refunds, and how to use the platform. You may also help with study strategies and course-related learning topics (e.g. explaining a concept that a LearnSphere course covers), but ONLY when it's reasonably tied to learning on this platform.

STRICT SCOPE RULE — this is a hard boundary, not a suggestion:
- You must ONLY answer questions about LearnSphere (the platform, its courses, instructors, pricing, enrollment, policies, account help) or genuine learning/study help connected to it.
- You must NOT answer general-knowledge questions, trivia, current events, coding help unrelated to a LearnSphere course, personal advice, creative writing, or any other off-topic request — even if you know the answer.
- If a question is off-topic or unrelated to LearnSphere/learning, do NOT answer it. Instead, politely say that you can only help with questions about LearnSphere and its courses, and invite the user to ask something related (e.g. about courses, enrollment, pricing, or their account).
- Never invent course names, mentors, prices, or ratings — if information about LearnSphere is not available, say so clearly.

Always be concise, helpful, and friendly. Use markdown formatting (bold, lists, etc.) where it improves clarity.`;

    if (req.user) {
      systemPrompt += `\nCurrent logged-in user: ${req.user.firstName || "User"} (${req.user.accountType || "Student"}).`;
    }
    if (courseContext?.courseName) {
      systemPrompt += `\nUser is currently viewing course: "${courseContext.courseName}". Description: ${courseContext.courseDescription || "N/A"}.`;
    }
    if (dbContext) {
      systemPrompt += `\n\n--- REAL LEARNSPHERE DATABASE DATA (use this as your authoritative source) ---\n${dbContext}\n--- END OF DATA ---\nBased on the above real data, answer the user's question accurately. Do not add information that is not in this data.`;
    }

    // ── Step 3: Try LLM ─────────────────────────────────────────────────────
    try {
      if (process.env.GEMINI_API_KEY) {
        aiReply = (await callGemini(systemPrompt, history, userQuery)) || "";
      }
      if (!aiReply && process.env.OPENAI_API_KEY) {
        aiReply = (await callOpenAI(systemPrompt, history, userQuery)) || "";
      }
    } catch (llmErr) {
      console.warn("LLM error:", llmErr.message);
    }

    // ── Step 4: If LLM failed but we have DB data, use DB data directly ─────
    if (!aiReply && dbContext) {
      aiReply = dbContext;
    }

    // ── Step 5: Final fallback ───────────────────────────────────────────────
    if (!aiReply) {
      aiReply = generateFallbackResponse(userQuery, req.user);
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reply: aiReply,
        sender: "ai",
        timestamp: new Date().toISOString(),
      },
      "Chat message processed successfully"
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Course-aware chat — used inside the lecture player (ViewCourse.jsx)
// Requires the requester to be logged in AND enrolled in the course.
// ─────────────────────────────────────────────────────────────────────────────

export const handleCourseChat = asyncHandler(async (req, res) => {
  const { message, courseId, lectureId = null, history = [] } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    throw new ApiError(400, "Message cannot be empty");
  }
  if (!courseId) {
    throw new ApiError(400, "courseId is required");
  }

  const foundCourse = await course
    .findById(courseId)
    .populate("instructor", "firstName lastName email")
    .populate("category", "name")
    .populate({
      path: "courseContent",
      populate: { path: "subSection", model: "subSection" },
    })
    .lean()
    .exec();

  if (!foundCourse) {
    throw new ApiError(404, "Course not found");
  }

  // Verify enrollment: user must appear in either legacy or current enrolled-students field.
  const enrolledIds = [
    ...(foundCourse.studentsEnrolled || []),
    ...(foundCourse.studentEnrolled || []),
  ].map((id) => id.toString());

  const isEnrolled = enrolledIds.includes(req.user._id.toString());
  const isOwner = foundCourse.instructor?._id?.toString() === req.user._id.toString();
  const isPrivileged = req.user.accountType === "Admin" || isOwner;

  if (!isEnrolled && !isPrivileged) {
    throw new ApiError(403, "You must be enrolled in this course to use course chat");
  }

  // Locate the active lecture, if any, for extra context.
  let lectureContext = "";
  if (lectureId) {
    for (const sec of foundCourse.courseContent || []) {
      const sub = (sec.subSection || []).find((s) => s._id.toString() === lectureId);
      if (sub) {
        lectureContext = `\nCurrent lecture: "${sub.title}" (Section: "${sec.sectionName}").\nLecture description: ${sub.description || "N/A"}`;
        break;
      }
    }
  }

  const courseContent = (foundCourse.courseContent || [])
    .map((sec) => {
      const subs = (sec.subSection || []).map((s) => `  • ${s.title}`).join("\n");
      return `- ${sec.sectionName}\n${subs}`;
    })
    .join("\n");

  const instructor = foundCourse.instructor
    ? `${foundCourse.instructor.firstName || ""} ${foundCourse.instructor.lastName || ""}`.trim()
    : "Unknown";

  const systemPrompt = `You are LearnSphere AI, acting as an in-course tutor for the student currently watching "${foundCourse.courseName}".
Instructor: ${instructor}
Course description: ${foundCourse.courseDescription || "N/A"}
${lectureContext}

Full curriculum:
${courseContent || "N/A"}

Answer the student's question with reference to this course's content where relevant. If the question is a general concept question related to the lecture topic, answer it helpfully like a tutor would. Be concise, friendly, and use markdown formatting where useful.`;

  let aiReply = "";
  try {
    if (process.env.GEMINI_API_KEY) {
      aiReply = (await callGemini(systemPrompt, history, message.trim())) || "";
    }
    if (!aiReply && process.env.OPENAI_API_KEY) {
      aiReply = (await callOpenAI(systemPrompt, history, message.trim())) || "";
    }
  } catch (llmErr) {
    console.warn("Course chat LLM error:", llmErr.message);
  }

  if (!aiReply) {
    aiReply = `I couldn't reach the AI service right now, but here's what I know: you're on **"${foundCourse.courseName}"**${lectureContext ? `, currently viewing the lecture noted above.` : "."} Please try again in a moment, or ask a general question.`;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reply: aiReply,
        sender: "ai",
        timestamp: new Date().toISOString(),
      },
      "Course chat message processed successfully"
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Generic fallback for non-LearnSphere, non-LLM scenarios
// ─────────────────────────────────────────────────────────────────────────────
function generateFallbackResponse(query, user) {
  const q = query.toLowerCase();
  const name = user?.firstName ? ` ${user.firstName}` : "";

  if (/\b(hello|hi|hey|greetings|howdy)\b/.test(q)) {
    return `Hello${name}! 👋 I'm your LearnSphere AI assistant. Ask me about courses, mentors, prices, ratings, or anything else about the platform!`;
  }
  if (/\b(thank|thanks|thank you)\b/.test(q)) {
    return `You're welcome${name}! 😊 Let me know if you need anything else.`;
  }
  return `I'm here to help${name} with anything related to LearnSphere! You can ask me things like:\n- "What courses are available?"\n- "Tell me about the React course"\n- "Who teaches Data Science?"\n- "What is the price of Full Stack Development?"\n- "Show me beginner courses"\n- "How do I enroll?" or "How do I become an instructor?"\n\nI can only help with LearnSphere-related questions, so feel free to ask me anything about our courses, instructors, pricing, or your account!`;
}
