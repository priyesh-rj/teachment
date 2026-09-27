# 🎓 TEACHMENT - AI-Powered Teacher-School Recruitment Platform

**TEACHMENT** is a modern, full-stack recruitment platform designed to seamlessly connect educators with schools and educational institutions. With integrated AI resume parsing and smart profile-to-job matching, TEACHMENT eliminates friction in education hiring.

---

## 🌟 Key Features

### 👩‍🏫 For Teachers & Educators
- **AI Resume Parsing**: Upload resumes (PDF) to automatically extract qualifications, years of experience, and key skills.
- **Smart Job Matching**: Get real-time match scores for open positions based on skillset and teaching requirements.
- **Application Tracking**: Monitor the status of job applications in real-time.
- **Educator Profile**: Showcase subjects, grades taught, certifications, and teaching portfolio.

### 🏫 For Schools & Educational Institutions
- **Job Posting & Management**: Post and manage teaching vacancies across grades, subjects, and contract types.
- **Teacher Directory**: Search and filter verified educators by subject, experience, location, and rating.
- **Applicant Review**: Review candidate resumes, match percentages, and manage candidate pipelines.
- **Direct Connect**: Shortlist and communicate directly with prospective educators.

### 🤖 AI Engine
- **FastAPI Python Service**: Microservice powered by FastAPI, Scikit-Learn, and PyPDF2.
- **TF-IDF & Cosine Similarity Match Engine**: Computes accurate semantic match scores between candidate profiles and job specifications.
- **Automated Skill Extraction**: Natural language processing to detect pedagogical and domain skills.

---

## 🏗️ Architecture & Tech Stack

```
teachment-project/
├── client/          # Frontend Web Application (React + Vite + Tailwind CSS)
├── server/          # Backend REST API (Node.js + Express + SQLite / PostgreSQL)
└── ai-service/      # AI Microservice (Python FastAPI + Scikit-Learn + PyPDF2)
```

| Component | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend API** | Node.js, Express.js, JWT, Bcrypt, Multer |
| **Database** | SQLite3 (Zero-setup local fallback) / PostgreSQL |
| **AI Service** | Python 3.11+, FastAPI, Uvicorn, Scikit-learn, PyPDF2 |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Git**

---

### 2. Setup & Run Backend (Server)

```bash
cd server
npm install
cp .env.example .env
npm run seed     # (Optional) Populates sample schools, jobs, and teachers
npm start
```
> Server runs on `http://localhost:5000`

---

### 3. Setup & Run AI Service

```bash
cd ai-service
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
> AI microservice runs on `http://localhost:8000`

---

### 4. Setup & Run Frontend (Client)

```bash
cd client
npm install
npm run dev
```
> Client runs on `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (`server/.env`)
```ini
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
AI_SERVICE_URL=http://localhost:8000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/teachment_db
USE_SQLITE_FALLBACK=true
```

---

## 📄 License
This project is licensed under the MIT License.
