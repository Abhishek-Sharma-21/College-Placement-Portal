# 🎓 College Placement Portal

A full-stack web application for managing college campus placements — connecting students with job opportunities, assessments, and announcements from a centralized portal.

---

## 📁 Project Structure

```
college-placement-Portal/
├── backend/          # Node.js + Express REST API
└── student-portal/   # React + Vite frontend
```

---

## 🚀 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| JWT + Cookies | Authentication & sessions |
| Bcrypt.js | Password hashing |
| Cloudinary + Multer | File / resume uploads |
| Helmet | HTTP security headers |
| Morgan | Request logging |
| PDFKit | PDF generation |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Router v7 | Client-side routing |
| Redux Toolkit + redux-persist | Global state management |
| Axios | HTTP requests |
| Tailwind CSS v4 | Styling |
| Radix UI | Accessible UI components |
| Lucide React | Icons |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- A MongoDB Atlas account
- A Cloudinary account

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd college-placement-Portal
```

---

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Fill in your values in `.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>
JWT_SECRET=your_strong_secret_here

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend dev server:

```bash
npm run dev
```

The API will run at `http://localhost:5000` (or your configured port).

---

### 3. Set Up the Student Portal (Frontend)

```bash
cd ../student-portal
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive session cookie |
| POST | `/api/auth/logout` | Logout and clear session |
| GET | `/api/auth/me` | Get current logged-in user |
| GET/POST | `/api/jobs` | Browse / post job listings |
| GET/POST | `/api/job-applications` | Apply for / view applications |
| GET/POST | `/api/assessments` | View / take assessments |
| GET/POST | `/api/announcements` | View placement announcements |
| GET | `/api/health` | Server health check |

---

## 🔒 Security

- Passwords are hashed with **bcrypt** before storing
- Sessions use **HTTP-only JWT cookies** (not localStorage)
- HTTP headers hardened with **Helmet**
- All sensitive credentials stored in `.env` — **never committed to git**
- See `backend/.env.example` for the required environment variables template

---

## 📜 Available Scripts

### Backend (`/backend`)
| Script | Command |
|---|---|
| Development | `npm run dev` |
| Production | `npm start` |

### Frontend (`/student-portal`)
| Script | Command |
|---|---|
| Development | `npm run dev` |
| Production Build | `npm run build` |
| Preview Build | `npm run preview` |
| Lint | `npm run lint` |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes.
