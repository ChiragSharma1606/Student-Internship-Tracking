"""
models.py
---------
Model helper functions that query the database and return
plain Python dicts (JSON-serializable) for use in routes.
"""

from database import query_db, execute_db


# ─────────────────────────────────────────────
# USER MODELS
# ─────────────────────────────────────────────

def get_user_by_credentials(username, password):
    """Return a user row matching username + password, or None."""
    row = query_db(
        "SELECT * FROM USERS WHERE username = ? AND password = ?",
        (username, password),
        one=True
    )
    return dict(row) if row else None


def get_user_by_id(user_id):
    """Return a user row by primary key."""
    row = query_db("SELECT * FROM USERS WHERE user_id = ?", (user_id,), one=True)
    return dict(row) if row else None


# ─────────────────────────────────────────────
# STUDENT MODELS
# ─────────────────────────────────────────────

def get_student_by_user_id(user_id):
    """Return the student profile linked to the given user_id."""
    row = query_db(
        "SELECT * FROM STUDENTS WHERE user_id = ?", (user_id,), one=True
    )
    return dict(row) if row else None


def get_all_students():
    """Return all student profiles."""
    rows = query_db("SELECT * FROM STUDENTS")
    return [dict(r) for r in rows]


# ─────────────────────────────────────────────
# INTERNSHIP MODELS
# ─────────────────────────────────────────────

def get_internship_by_student(student_id):
    """
    Return full internship details (joined with industry info)
    for a given student.
    """
    row = query_db(
        """
        SELECT i.internship_id, i.start_date, i.end_date, i.domain, i.status,
               ind.company_name, ind.contact_person, ind.phone AS industry_phone,
               ind.email AS industry_email, ind.address
        FROM   INTERNSHIP i
        JOIN   INDUSTRY ind ON i.industry_id = ind.industry_id
        WHERE  i.student_id = ?
        ORDER BY i.internship_id DESC
        """,
        (student_id,),
        one=True
    )
    return dict(row) if row else None


def get_all_internships():
    """Return all internships joined with student and industry info."""
    rows = query_db(
        """
        SELECT i.internship_id, i.start_date, i.end_date, i.domain, i.status,
               s.name AS student_name, s.roll_no, s.department,
               ind.company_name
        FROM   INTERNSHIP i
        JOIN   STUDENTS s   ON i.student_id  = s.student_id
        JOIN   INDUSTRY ind ON i.industry_id = ind.industry_id
        ORDER BY i.internship_id
        """
    )
    return [dict(r) for r in rows]


# ─────────────────────────────────────────────
# PROGRESS TRACKING MODELS
# ─────────────────────────────────────────────

def get_progress_by_internship(internship_id):
    """Return all weekly progress entries for an internship."""
    rows = query_db(
        """
        SELECT * FROM PROGRESS_TRACKING
        WHERE  internship_id = ?
        ORDER BY week_no
        """,
        (internship_id,)
    )
    return [dict(r) for r in rows]


def get_all_progress_reports():
    """
    Return all progress reports joined with student and internship info.
    Used by the teacher dashboard.
    """
    rows = query_db(
        """
        SELECT pt.progress_id, pt.week_no, pt.report, pt.status, pt.submitted_at,
               s.name AS student_name, s.roll_no, s.department,
               ind.company_name, i.domain, i.internship_id
        FROM   PROGRESS_TRACKING pt
        JOIN   INTERNSHIP i  ON pt.internship_id = i.internship_id
        JOIN   STUDENTS s    ON i.student_id     = s.student_id
        JOIN   INDUSTRY ind  ON i.industry_id    = ind.industry_id
        ORDER BY pt.submitted_at DESC
        """
    )
    return [dict(r) for r in rows]


def submit_progress_report(internship_id, week_no, report_text):
    """Insert a new weekly progress report. Returns the new progress_id."""
    return execute_db(
        """
        INSERT INTO PROGRESS_TRACKING (internship_id, week_no, report, status)
        VALUES (?, ?, ?, 'pending')
        """,
        (internship_id, week_no, report_text)
    )


def update_progress_status(progress_id, status):
    """Approve or reject a progress report. Returns rows affected."""
    execute_db(
        "UPDATE PROGRESS_TRACKING SET status = ? WHERE progress_id = ?",
        (status, progress_id)
    )


# ─────────────────────────────────────────────
# REPORT MODELS
# ─────────────────────────────────────────────

def get_reports_by_internship(internship_id):
    """Return all final reports for a given internship."""
    rows = query_db(
        "SELECT * FROM REPORT WHERE internship_id = ? ORDER BY submission_date DESC",
        (internship_id,)
    )
    return [dict(r) for r in rows]


def submit_final_report(internship_id, file_path=""):
    """Insert a final internship report. Returns the new report_id."""
    return execute_db(
        "INSERT INTO REPORT (internship_id, file_path) VALUES (?, ?)",
        (internship_id, file_path)
    )


# ─────────────────────────────────────────────
# CERTIFICATE MODELS
# ─────────────────────────────────────────────

def get_certificate_by_internship(internship_id):
    """Return the certificate for a given internship, if issued."""
    row = query_db(
        "SELECT * FROM CERTIFICATE WHERE internship_id = ?",
        (internship_id,),
        one=True
    )
    return dict(row) if row else None
