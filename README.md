# 🎓 InternTrack – Student Internship Tracking System

A full-stack web application for managing student internships from start to certification.

**Backend:** Python Flask + SQLite &nbsp;|&nbsp; **Frontend:** React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion

---

## 📁 Project Structure

```
interntrack/
├── backend/
│   ├── app.py           # Flask app entry point
│   ├── database.py      # SQLite connection & helpers
│   ├── models.py        # Data access functions
│   ├── routes.py        # REST API route handlers
│   ├── schema.sql       # DB schema + seed data
│   ├── requirements.txt # Python dependencies
│   └── database.db      # SQLite DB (auto-created on first run)
│
├── frontend/
│   └── interntrack-react/          # React app (Vite + Tailwind + Framer Motion)
│       ├── src/
│       │   ├── App.jsx             # Router + protected routes
│       │   ├── main.jsx            # React entry point
│       │   ├── index.css           # Tailwind CSS import
│       │   ├── context/
│       │   │   └── AuthContext.jsx # Auth state (login/logout/session)
│       │   ├── utils/
│       │   │   └── api.js          # Axios API client (all endpoints)
│       │   ├── components/
│       │   │   ├── Navbar.jsx      # Animated sticky navbar
│       │   │   └── StatCard.jsx    # Animated stat card component
│       │   └── pages/
│       │       ├── Home.jsx                    # Landing page
│       │       ├── auth/
│       │       │   ├── StudentLogin.jsx         # Student login (split-screen)
│       │       │   ├── TeacherLogin.jsx         # Faculty login (split-screen)
│       │       │   └── AdminLogin.jsx           # Admin login (split-screen)
│       │       ├── student/
│       │       │   ├── Dashboard.jsx            # Student dashboard
│       │       │   ├── SubmitReport.jsx         # Weekly report submission
│       │       │   ├── MyReports.jsx            # View all reports
│       │       │   └── Certificate.jsx          # Printable certificate
│       │       ├── teacher/
│       │       │   ├── Dashboard.jsx            # Faculty dashboard + cert issuance
│       │       │   └── Reports.jsx              # Review + approve reports
│       │       └── admin/
│       │           └── Dashboard.jsx            # Full CRUD admin panel
│       ├── vite.config.js
│       ├── postcss.config.js
│       └── package.json
│
├── README.md
└── PROJECT_REPORT.md
```

---

## 🚀 Getting Started

You need **two terminals** — one for the backend, one for the frontend.

---

### Backend Setup (Flask)

**Requirements:** Python 3.8+

```bash
# Terminal 1 – Backend
cd backend
pip install -r requirements.txt
python app.py
```

Backend starts at: **http://127.0.0.1:5000**

> ✅ On **first run**, the database is auto-created and seeded with sample data.
> 🔄 To **reset** the database: delete `backend/database.db` and restart Flask.

---

### Frontend Setup (React + Vite)

**Requirements:** Node.js 18+ and npm 9+

```bash
# Terminal 2 – Frontend
cd frontend/interntrack-react
npm install
npm run dev

Frontend starts at: **http://localhost:3000**

> The Vite dev server **automatically proxies** all `/api` requests to Flask on port 5000.
> No CORS issues — just open **http://localhost:3000** and use the app.

---

### Build for Production

```bash
cd frontend/interntrack-react
npm run build
# Output in: frontend/interntrack-react/dist/
```

To serve the production build via Flask:
```bash
cd backend
python app.py
# Open http://127.0.0.1:5000
```

---

## 🔑 Demo Credentials

| Role    | Username  | Password    | Portal |
|---------|-----------|-------------|--------|
| Student | student1  | student123  | http://localhost:3000/student/login |
| Student | student2  | student123  | http://localhost:3000/student/login |
| Student | student3  | student123  | Completed internship + certificate |
| Faculty | teacher1  | teacher123  | http://localhost:3000/teacher/login |
| Faculty | teacher2  | teacher123  | http://localhost:3000/teacher/login |
| Admin   | admin     | admin123    | http://localhost:3000/admin/login   |

> 💡 `student3` (Carol Davis) already has a **completed internship and certificate** — great for demoing the certificate feature.

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api` and return JSON: `{ status, message, data }`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Login (student/faculty/admin) |
| POST | `/api/logout` | Logout |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/dashboard` | Profile + internship + stats |
| GET | `/api/student/progress` | All weekly reports |
| POST | `/api/student/submit-report` | Submit weekly report |

### Teacher
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teacher/dashboard` | All students + stats |
| GET | `/api/teacher/reports` | All progress reports |
| POST | `/api/teacher/approve-report` | Approve/reject report |
| POST | `/api/teacher/mark-completed` | Mark internship complete |
| POST | `/api/teacher/generate-certificate` | Issue certificate |
| GET | `/api/teacher/all-certificates` | All issued certificates |

### Certificate
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/certificate/<internship_id>` | Get certificate details |

### Admin (Full CRUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/admin/users` | List/create users |
| PUT/DELETE | `/api/admin/users/<id>` | Update/delete user |
| GET/POST | `/api/admin/students` | List/create students |
| PUT/DELETE | `/api/admin/students/<id>` | Update/delete student |
| GET | `/api/admin/faculty` | List faculty |
| GET/POST | `/api/admin/industry` | List/add companies |
| PUT/DELETE | `/api/admin/industry/<id>` | Update/delete company |
| GET/POST | `/api/admin/internships` | List/assign internships |
| PUT/DELETE | `/api/admin/internships/<id>` | Update/delete internship |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3, Flask 2.3+, SQLite3 |
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| HTTP Client | Axios |
| Routing | React Router DOM v7 |
| Notifications | React Hot Toast |
| Auth | Flask server-side sessions + sessionStorage |

---

## 📝 Notes

- Passwords stored in plaintext for prototype. Use `bcrypt` in production.
- Vite proxies `/api` to `http://127.0.0.1:5000` — no CORS config needed in dev.
- Session cookies use `SameSite=Lax` for cross-origin compatibility.
- Database auto-initializes from `schema.sql` on first run.
