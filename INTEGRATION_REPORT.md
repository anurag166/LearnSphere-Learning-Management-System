# LearnSphere — Integration & Debug Report

Both zips you uploaded (`LearnSphere-...`, `Educhar-2.zip`) contained the **same
project** — one connected React + Express + MongoDB app (frontend and backend
already live in one repo, under `src/` and `server/`). There was nothing
separate to "connect" — I merged the small differences between the two copies
and then audited the whole thing end-to-end. This zip is the fixed result.

## Bugs found and fixed

1. **Frontend wouldn't build at all.** `Chatbot.jsx` imported `FiSparkles`
   from `react-icons/fi`, which doesn't exist in that icon set — `vite build`
   failed immediately. Fixed by importing `HiSparkles` from `react-icons/hi2`
   (this was actually the fix already present in your `Educhar-2.zip` copy;
   I applied it here).

2. **Backend crashed on startup whenever Razorpay keys were blank** — which
   they are by default in `.env`. `new Razorpay(...)` throws synchronously if
   `key_id`/`key_secret` are missing, taking the *entire* server down before
   it could even listen on a port (so nothing worked, not just payments).
   Fixed with a lazy-init proxy in `server/config/razorpay.js` — the server
   now boots fine without Razorpay configured, and only errors (cleanly, as
   a normal API error) if you actually try to buy a paid course before
   setting `RAZORPAY_KEY`/`RAZORPAY_SECRET`.

3. **In-course chatbot was completely broken.** The lecture-player chatbot
   calls `POST /api/v1/chatbot/course-chat`, but that route never existed on
   the backend — every course-context chat request 404'd. Implemented
   `handleCourseChat` (verifies the user is logged in **and** enrolled in the
   course before answering, uses the course + current lecture as context for
   the AI) and wired up the route.

4. **Instructor Dashboard hardcoded `http://localhost:4000`** in 4 places
   instead of using the shared `API_BASE_URL`. This silently broke the
   instructor dashboard the moment the backend ran on a different host/port
   (e.g. any real deployment). Fixed to use `API_BASE_URL` like the rest of
   the app.

5. **Duplicate-enrollment check never worked.** It compared Mongo
   `ObjectId` objects with `Array.includes()`, which checks object identity,
   not value equality — so it always returned `false`, meaning a student
   could re-attempt "purchasing" a course they already own. Fixed to compare
   by string.

6. **Free courses (₹0) could never be enrolled in.** Every enrollment went
   through Razorpay, but Razorpay rejects ₹0 orders — so any course priced
   "Free" was actually unpurchasable. Fixed: the backend now enrolls the
   student directly (no Razorpay order) when `price === 0`, and the frontend
   skips the payment popup and shows success immediately.

7. **`createCategory` had no auth guard at all** — any anonymous request
   could create categories. Locked it down to `auth + isAdmin`.

8. **Admin role existed only in name.** The schema/middleware supported an
   `Admin` accountType, but there was no admin UI, no admin API, and no way
   to even become an Admin (`Signup` only offers Student/Instructor — by
   design, so admins can't self-register through a public form). Added:
   - `server/src/controllers/Admin.js` + `server/src/routes/Admin.js` —
     `/api/v1/admin/*`, all guarded by `auth + isAdmin`: platform stats,
     list/promote/delete users, list/delete courses, delete categories.
   - `src/pages/AdminDashboard.jsx` at `/admin-dashboard` — overview stats,
     user management (role dropdown + delete), course management (delete).
   - Login/Navbar now route Admins to `/admin-dashboard` correctly.
   - `server/scripts/createAdmin.js` — a one-off script to create your first
     Admin (see below), since admins intentionally aren't self-serve.

## What I verified but left alone

- `src/pages/Cart.jsx`, `Checkout.jsx`, `EnrolledCourses.jsx` are placeholder
  stubs (a few lines each) and **aren't wired into any route** in `App.jsx` —
  they're dead code from the original template, not part of the live app.
  Course purchase happens directly from `CourseDetails.jsx` via Razorpay,
  which is the flow I tested and fixed above.
- All other REST endpoints used by the frontend (auth, profile, course CRUD,
  sections/subsections, ratings/reviews) were cross-checked against the
  Express routes and matched correctly.
- Ran `vite build` (passes) and booted the Express server directly (boots
  and listens cleanly) to catch real compile/runtime errors, not just a
  read-through.

## Before you run it

- **MongoDB**: `server/.env` points at `mongodb://localhost:27017/learnsphere`.
  You'll need a MongoDB instance (local `mongod`, or a free MongoDB Atlas
  cluster with the URL swapped in) — there's no way around this, the app is
  useless without a real database connection.
- **Gemini key**: I added the key you gave me to
  `server/.env` → `GEMINI_API_KEY`. One flag: it doesn't match the usual
  Gemini key format (`AIzaSy...`) — yours starts with `AQ.`, which looks more
  like a different kind of Google token. I couldn't test it live (this sandbox
  can't reach `generativelanguage.googleapis.com`), so if the chatbot replies
  with the fallback ("I couldn't reach the AI service…") instead of real AI
  answers, regenerate a proper Gemini API key at
  https://aistudio.google.com/apikey and drop it in.
- **Razorpay/Cloudinary/Email**: still blank in `.env` — fine for browsing,
  free-course enrollment, and the chatbot; paid checkout, thumbnail uploads,
  and OTP emails need their own keys filled in.

## Running it locally

```bash
# Backend
cd server
npm install
node scripts/createAdmin.js "admin@example.com" "SomeStrongPassword123" "First" "Last"
npm run dev      # or: node index.js

# Frontend (new terminal, project root)
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:4000`.
Sign up as Student/Instructor normally through the UI; log in with the
seeded account above to reach `/admin-dashboard`.
