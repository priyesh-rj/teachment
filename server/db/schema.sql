-- TEACHMENT Relational Database Schema
-- Compatible with PostgreSQL & SQLite

-- 1. Users & Auth (Role-based: 'teacher' or 'school')
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('teacher', 'school')),
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Teacher Profiles
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(100),
    post VARCHAR(50),               -- PRT, TGT, PGT
    qualifications VARCHAR(150),    -- B.Ed, M.Sc, etc.
    syllabus VARCHAR(50),           -- CBSE, ICSE, State
    experience_years INT DEFAULT 0,
    medium VARCHAR(50),             -- English, Hindi
    state VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    pin_code VARCHAR(10),
    gender VARCHAR(20),
    resume_path VARCHAR(255),
    parsed_skills TEXT,
    profile_completion INT DEFAULT 0
);

-- 3. School Profiles
CREATE TABLE IF NOT EXISTS school_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    school_name VARCHAR(200) NOT NULL,
    principal_name VARCHAR(150),
    board VARCHAR(100),             -- CBSE, ICSE, State
    about_text TEXT,
    state VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    logo_path VARCHAR(255),
    profile_completion INT DEFAULT 0
);

-- 4. Job Vacancies
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INT REFERENCES school_profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    post_level VARCHAR(50) NOT NULL,
    experience_required INT DEFAULT 0,
    min_salary INT,
    max_salary INT,
    shift_timings VARCHAR(100),
    openings INT DEFAULT 1,
    job_type VARCHAR(20) DEFAULT 'Onsite', -- Onsite / Online
    required_skills TEXT,                  -- Comma-separated or tag list: Python, AI, Data Science
    status VARCHAR(20) DEFAULT 'Open',     -- Open / Closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Applications & AI Score Mapping
CREATE TABLE IF NOT EXISTS job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
    teacher_id INT REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    ai_match_score DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'Applied', -- Applied, Shortlisted, Contacted, Rejected
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, teacher_id)
);
