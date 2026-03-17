-- ============================================================
-- Student Internship Tracking System - Database Schema
-- ============================================================

-- Drop tables if they exist (for clean re-initialization)
DROP TABLE IF EXISTS CERTIFICATE;
DROP TABLE IF EXISTS REPORT;
DROP TABLE IF EXISTS PROGRESS_TRACKING;
DROP TABLE IF EXISTS INTERNSHIP;
DROP TABLE IF EXISTS INDUSTRY;
DROP TABLE IF EXISTS STUDENTS;
DROP TABLE IF EXISTS USERS;

-- ============================================================
-- USERS TABLE
-- Stores login credentials for both students and teachers
-- ============================================================
CREATE TABLE USERS (
    user_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    role       TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'admin')),
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- STUDENTS TABLE
-- Stores student profile information
-- ============================================================
CREATE TABLE STUDENTS (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    name       TEXT NOT NULL,
    roll_no    TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    year       INTEGER NOT NULL,
    phone      TEXT,
    email      TEXT,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);

-- ============================================================
-- INDUSTRY TABLE
-- Stores company/industry information for internships
-- ============================================================
CREATE TABLE INDUSTRY (
    industry_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name   TEXT NOT NULL,
    contact_person TEXT,
    phone          TEXT,
    email          TEXT,
    address        TEXT
);

-- ============================================================
-- INTERNSHIP TABLE
-- Links students to their internship company
-- ============================================================
CREATE TABLE INTERNSHIP (
    internship_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id    INTEGER NOT NULL,
    industry_id   INTEGER NOT NULL,
    start_date    TEXT NOT NULL,
    end_date      TEXT NOT NULL,
    domain        TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'ongoing' CHECK(status IN ('ongoing', 'completed')),
    FOREIGN KEY (student_id)  REFERENCES STUDENTS(student_id),
    FOREIGN KEY (industry_id) REFERENCES INDUSTRY(industry_id)
);

-- ============================================================
-- PROGRESS_TRACKING TABLE
-- Weekly progress reports submitted by students
-- ============================================================
CREATE TABLE PROGRESS_TRACKING (
    progress_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_id INTEGER NOT NULL,
    week_no       INTEGER NOT NULL,
    report        TEXT NOT NULL,
    submitted_at  TEXT DEFAULT (datetime('now')),
    status        TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    FOREIGN KEY (internship_id) REFERENCES INTERNSHIP(internship_id)
);

-- ============================================================
-- REPORT TABLE
-- Final internship report submitted by students
-- ============================================================
CREATE TABLE REPORT (
    report_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_id   INTEGER NOT NULL,
    submission_date TEXT DEFAULT (datetime('now')),
    file_path       TEXT,
    FOREIGN KEY (internship_id) REFERENCES INTERNSHIP(internship_id)
);

-- ============================================================
-- CERTIFICATE TABLE
-- Certificate issued upon internship completion
-- ============================================================
CREATE TABLE CERTIFICATE (
    certificate_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_id    INTEGER NOT NULL,
    issue_date       TEXT DEFAULT (datetime('now')),
    certificate_file TEXT,
    FOREIGN KEY (internship_id) REFERENCES INTERNSHIP(internship_id)
);

-- ============================================================
-- SEED DATA - Sample data for testing the prototype
-- ============================================================

-- Admin account
INSERT INTO USERS (username, password, role) VALUES
    ('admin', 'admin123', 'admin');

-- Faculty/Teacher accounts
INSERT INTO USERS (username, password, role) VALUES
    ('teacher1', 'teacher123', 'faculty'),
    ('teacher2', 'teacher123', 'faculty');

-- Student accounts
INSERT INTO USERS (username, password, role) VALUES
    ('student1', 'student123', 'student'),
    ('student2', 'student123', 'student'),
    ('student3', 'student123', 'student');

-- Student profiles (user_id 3, 4, 5)
INSERT INTO STUDENTS (user_id, name, roll_no, department, year, phone, email) VALUES
    (3, 'Alice Johnson', 'CS2021001', 'Computer Science', 3, '9876543210', 'alice@college.edu'),
    (4, 'Bob Smith',     'CS2021002', 'Computer Science', 3, '9876543211', 'bob@college.edu'),
    (5, 'Carol Davis',   'EC2021001', 'Electronics',      3, '9876543212', 'carol@college.edu');

-- Industry / Companies
INSERT INTO INDUSTRY (company_name, contact_person, phone, email, address) VALUES
    ('TechCorp Solutions', 'Mr. Raj Sharma',  '9001234567', 'hr@techcorp.com',  '123 Tech Park, Bangalore'),
    ('DataMinds Pvt Ltd',  'Ms. Priya Menon', '9001234568', 'hr@dataminds.com', '456 IT Hub, Hyderabad'),
    ('CloudNine Systems',  'Mr. Arun Kumar',  '9001234569', 'hr@cloudnine.com', '789 Cyber City, Chennai');

-- Internships
INSERT INTO INTERNSHIP (student_id, industry_id, start_date, end_date, domain, status) VALUES
    (1, 1, '2026-06-01', '2026-07-31', 'Web Development', 'ongoing'),
    (2, 2, '2026-06-01', '2026-07-31', 'Data Science',    'ongoing'),
    (3, 3, '2026-06-01', '2026-07-31', 'Cloud Computing', 'completed');

-- Weekly progress reports
INSERT INTO PROGRESS_TRACKING (internship_id, week_no, report, status) VALUES
    (1, 1, 'Set up development environment and learned project structure. Completed onboarding tasks.', 'approved'),
    (1, 2, 'Built REST API endpoints using Node.js. Integrated with frontend components.', 'approved'),
    (1, 3, 'Worked on database design and optimization. Wrote unit tests.', 'pending'),
    (2, 1, 'Introduction to data pipelines. Explored datasets using Pandas and NumPy.', 'approved'),
    (2, 2, 'Built a classification model using Scikit-learn. Achieved 87% accuracy.', 'pending'),
    (3, 1, 'Configured cloud infrastructure on AWS. Learned EC2 and S3 basics.', 'approved'),
    (3, 2, 'Deployed containerized apps using Docker and ECS.', 'approved'),
    (3, 3, 'Implemented auto-scaling and load balancing.', 'approved'),
    (3, 4, 'Final project presentation and documentation.', 'approved');

-- Final report (for completed internship)
INSERT INTO REPORT (internship_id, submission_date, file_path) VALUES
    (3, '2026-08-01', '/reports/carol_final_report.pdf');

-- Certificate (for completed internship)
INSERT INTO CERTIFICATE (internship_id, issue_date, certificate_file) VALUES
    (3, '2026-08-05', '/certificates/carol_certificate.pdf');
