# LearnSphere — EdTech Learning Platform

A full-stack ed-tech web app where students can browse and buy courses, and instructors can create and manage their own courses. Built with React (Vite + Tailwind) on the frontend and Node.js/Express + MongoDB on the backend.

<img width="1883" height="913" alt="image" src="https://github.com/user-attachments/assets/626f217d-5ac2-417e-8139-5b2ddd329f67" />

<img width="1910" height="917" alt="image" src="https://github.com/user-attachments/assets/8af06a44-9de3-443a-bb17-9d334f7761a5" />


## ✨ Features

- **Student & Instructor roles** with separate dashboards
- **Auth** — signup, login, OTP-based email verification, forgot/reset password
- **Course catalog** — browse, view details, ratings & reviews
- **Cart & checkout** with **Razorpay** payment integration
- **Instructor tools** — create, edit, and manage courses, sections & sub-sections
- **Enrolled courses & progress tracking** for students
- **Profile management** with image upload via **Cloudinary**
- **Responsive UI** built with Tailwind CSS
- Protected routes, help center, privacy policy & terms pages

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios, Framer Motion, React Icons

**Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT auth, Bcrypt

**Integrations:** Cloudinary (media storage), Razorpay (payments), Nodemailer (emails/OTP)

**Deployment:** Vercel (frontend), Render (backend)

## 📁 Project Structure

```
edtech project/
├── src/                    # React frontend
│   ├── components/         # Reusable UI (core, dashboard, common)
│   ├── pages/               # Route-level pages (Home, Courses, Dashboard, etc.)
│   ├── services/             # API connector & endpoint definitions
│   └── utils/                 # Helpers
├── server/                  # Node/Express backend
│   ├── config/                # DB, Cloudinary, Razorpay config
│   └── src/
│       ├── controllers/       # Route logic
│       ├── models/             # Mongoose schemas
│       ├── routes/              # Express routers
│       └── middlewares/         # Auth & other middleware
├── public/                  # Static assets
└── vercel.json              # Vercel deployment config
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local instance or MongoDB Atlas)
- Cloudinary account (for image uploads)
- Razorpay account (for payments)
- Email/SMTP credentials (for OTP & notifications)

### 1. Clone the repo

```bash
git clone https://github.com/anurag166/LearnSphere-Learning-Management-System.git
cd "edtech project"
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/` with the following variables:

```env
MONGODB_URL=
PORT=4000
RAZORPAY_KEY=
RAZORPAY_SECRET=
MAIL_HOST=
MAIL_PORT=
MAIL_SECURE=
MAIL_USER=
MAIL_PASS=
API_KEY=
API_SECRET=
CLOUD_NAME=
FOLDER_NAME=
FRONTEND_URL=http://localhost:5173
JWT_SECRET=
APP_NAME=LearnSphere
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd ..
npm install
```

Optionally create a `.env` file in the project root to point at your API:


Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📦 Build for Production

```bash
npm run build
```

## 📸 Screenshots

<img width="1883" height="913" alt="image" src="https://github.com/user-attachments/assets/40e9f84f-2226-49ab-9ebf-2d26b41cdae0" />

<img width="1886" height="902" alt="image" src="https://github.com/user-attachments/assets/9c05c7bc-dec6-4f1c-913e-e4b7e451c4ab" />

<img width="1877" height="907" alt="image" src="https://github.com/user-attachments/assets/b0c9e5a0-607a-4d97-a8d8-304d2ef80684" />
<img width="1900" height="897" alt="image" src="https://github.com/user-attachments/assets/ac3b4e2a-5e8f-49da-8b30-da7215e1fd25" />
<img width="1880" height="906" alt="image" src="https://github.com/user-attachments/assets/fbf2e7e0-fc42-4898-bfa8-0705e559c01d" />




## 🌐 Live Demo

- Frontend: `https://studynotion-mu-five.vercel.app/`
- Backend: `https://studynotion-learning-management-system.onrender.com`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
