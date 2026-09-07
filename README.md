# 🎓 Campus Flow — College Placement Portal

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-indigo.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#-license)

A modern, enterprise-ready **College Placement Portal** designed to streamline campus recruitment for **Students**, **Training & Placement Officers (TPO / Admins)**, and **Recruiters**.

Featuring **AI-powered assessment generation (Google Gemini AI)**, **real-time Socket.io notifications**, **automated eligibility verification**, **live mock interview management**, and **PDF report generation**.

---

## 🌟 Key Features

### 🎓 Student Portal
- **Dashboard & Analytics**: Track applied jobs, interview invitations, assessment scores, and upcoming campus drives.
- **Automated Eligibility Engine**: Real-time evaluation against company cutoffs (CGPA, active backlogs, department, batch year).
- **AI Practice & Assessments**: Take timed online coding & MCQ assessments generated dynamically by Google Gemini AI.
- **Mock Interviews**: Access scheduled technical & HR mock interviews with feedback & score cards.
- **Profile & Resume Management**: Upload resumes (Cloudinary) and manage personal, academic, and project achievements.

### 🏢 TPO / Admin Portal
- **Placement Dashboard**: Live stats on overall placement percentage, top recruiting companies, active job posts, and pending reviews.
- **Job Drive Management**: Create, publish, update, and manage job postings with customized eligibility criteria.
- **AI Assessment Generator**: Generate topic-specific MCQs & coding questions with customizable difficulty using Google Gemini AI.
- **Question Bank Repository**: Store, categorize, search, and reuse interview & test question sets.
- **Applicant Tracking System (ATS)**: Filter candidates by status (Applied, Shortlisted, Selected, Rejected) and export student lists to PDF.
- **Campus Announcements**: Broadcast targeted notifications to specific batches, branches, or all students via Socket.io.

---

## 🏗️ Architecture & Tech Stack

```
college-placement-Portal/
├── backend/          # Express.js REST API, Prisma ORM, Socket.io, Gemini AI
└── student-portal/   # React 19, Redux Toolkit, Tailwind CSS v4, Lucide Icons
```

### Backend (`/backend`)
* **Core**: Node.js, Express.js
* **Database & ORM**: PostgreSQL / MongoDB with Prisma ORM
* **Authentication**: JWT (JSON Web Tokens) + HTTP-Only Secure Cookies, Bcrypt.js password hashing
* **AI Integration**: Google Gemini AI API (`@google/genai`) for automated question creation & evaluation
* **Real-time Engine**: Socket.io for instant alerts and live updates
* **File Storage**: Cloudinary + Multer for resumes & document uploads
* **PDF Engine**: PDFKit for generating candidate export lists & reports
* **Security & Reliability**: Helmet HTTP headers, express-rate-limit, Morgan logging, Winston logger

### Frontend (`/student-portal`)
* **Framework & Build**: React 19, Vite
* **Routing**: React Router v7
* **State Management**: Redux Toolkit (RTK Query) + Redux Persist
* **Styling**: Tailwind CSS v4, Radix UI accessible primitives
* **Icons & UI**: Lucide React, Framer Motion animations
* **Real-time Client**: Socket.io Client

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed locally:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** or **MongoDB** database instance
- **Google Gemini API Key** (for AI features)
- **Cloudinary Account** (for resume uploads)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Abhishek-Sharma-21/college-placement-Portal.git
cd college-placement-Portal
```

---

### 2. Configure & Run Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/placement_db?schema=public"

# Authentication Secrets
JWT_SECRET=your_jwt_access_secret_key_12345
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_67890

# Frontend URLs (for CORS)
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Google Gemini AI Key
GEMINI_API_KEY=your_google_gemini_api_key

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Initialize Prisma Database & Start Backend:

```bash
# Push Prisma schema to database
npx prisma db push

# Start backend dev server
npm run dev
```

The backend server will run at: `http://localhost:5000`

---

### 3. Configure & Run Frontend (`student-portal`)

```bash
cd ../student-portal
npm install
```

Create a `.env` file in `student-portal/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start Frontend dev server:

```bash
npm run dev
```

The application will run at: `http://localhost:5173`

---

## 🔌 Main API Routes

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new Student or TPO user |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT cookies |
| `POST` | `/api/auth/logout` | Authenticated | Logout user & clear HTTP cookies |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user details |
| `GET` | `/api/jobs` | Authenticated | List all active job postings |
| `POST` | `/api/jobs` | TPO / Admin | Create a new job drive posting |
| `POST` | `/api/job-applications` | Student | Submit job application (auto-checks criteria) |
| `POST` | `/api/ai-assessment/generate` | TPO / Admin | Generate AI questions via Gemini API |
| `GET` | `/api/assessments` | Authenticated | View assigned / available assessments |
| `POST` | `/api/assessments/:id/submit` | Student | Submit completed assessment answers |
| `GET` | `/api/question-bank` | TPO / Admin | Search and retrieve question repository |
| `GET` | `/api/interviews` | Authenticated | View scheduled mock & drive interviews |
| `POST` | `/api/announcements` | TPO / Admin | Broadcast announcement to candidates |

---

## 🔒 Security & Best Practices

- **Role-Based Access Control (RBAC)**: Strict middleware guards (`protect`, `authorize("tpo")`) restricting administrative endpoints.
- **Environment Variable Protection**: All secrets, database URLs, and API credentials are kept in `.env` files and excluded from Git version control via `.gitignore`.
- **Password Security**: Passwords are standardly hashed using `bcryptjs` with salt rounds.
- **HTTP Security Headers**: Hardened using `helmet` middleware and restricted CORS origin origin checks.

---

## 🧪 Testing & Verification

Run automated backend unit & integration tests:

```bash
cd backend
npm test
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
