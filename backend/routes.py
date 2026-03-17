"""
routes.py
---------
Defines all Flask REST-style API routes for the application.

Endpoints:
  POST /login                   - Authenticate student or teacher
  GET  /student/dashboard       - Get student profile + internship summary
  GET  /student/internship      - Get full internship details
  GET  /student/progress        - Get weekly progress history
  POST /student/submit-report   - Submit a weekly progress report
  GET  /teacher/dashboard       - Get all students and internship stats
  GET  /teacher/reports         - Get all progress reports (for review)
  POST /teacher/approve-report  - Approve or reject a progress report
"""

from flask import Blueprint, request, jsonify, session
from database import query_db, execute_db
import models

# Create a Flask Blueprint for clean separation
api = Blueprint('api', __name__)


# ─────────────────────────────────────────────────────────
# UTILITY: JSON error/success helpers
# ─────────────────────────────────────────────────────────

def success(data=None, message="Success", code=200):
    response = {"status": "success", "message": message}
    if data is not None:
        response["data"] = data
    return jsonify(response), code


def error(message="An error occurred", code=400):
    return jsonify({"status": "error", "message": message}), code


def require_login():
    """Return the current session user or None."""
    return session.get('user')


def require_role(role):
    """Check that the logged-in user has the required role."""
    user = require_login()
    if not user:
        return None, error("Unauthorized. Please log in.", 401)
    if user.get('role') != role:
        return None, error(f"Access denied. Required role: {role}", 403)
    return user, None


# ─────────────────────────────────────────────────────────
# AUTH ROUTES
# ─────────────────────────────────────────────────────────

@api.route('/login', methods=['POST'])
def login():
    """
    POST /login
    Body: { "username": "...", "password": "...", "role": "student|faculty" }
    Authenticates the user and stores session data.
    """
    data = request.get_json()
    if not data:
        return error("Request body must be JSON.", 400)

    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    role     = data.get('role', '').strip()

    if not username or not password or not role:
        return error("username, password, and role are required.", 400)

    # Validate credentials against DB
    user = models.get_user_by_credentials(username, password)
    if not user or user['role'] != role:
        return error("Invalid credentials. Check username, password, and role.", 401)

    # Store user info in session
    session['user'] = {
        'user_id':  user['user_id'],
        'username': user['username'],
        'role':     user['role']
    }

    return success(
        data={"user_id": user['user_id'], "username": user['username'], "role": user['role']},
        message=f"Welcome, {username}!"
    )


@api.route('/logout', methods=['POST'])
def logout():
    """POST /logout - Clear the session."""
    session.clear()
    return success(message="Logged out successfully.")


# ─────────────────────────────────────────────────────────
# STUDENT ROUTES
# ─────────────────────────────────────────────────────────

@api.route('/student/dashboard', methods=['GET'])
def student_dashboard():
    """
    GET /student/dashboard
    Returns the student's profile and a summary of their internship.
    """
    user, err = require_role('student')
    if err:
        return err

    # Get student profile - return gracefully if not yet created
    student = models.get_student_by_user_id(user['user_id'])
    if not student:
        return success(data={
            "student": None,
            "internship": None,
            "progress_stats": {},
            "certificate": None
        }, message="Student profile not yet created.")

    # Get internship summary
    internship = models.get_internship_by_student(student['student_id'])

    # Get progress stats if internship exists
    progress_stats = {}
    certificate    = None
    if internship:
        progress = models.get_progress_by_internship(internship['internship_id'])
        progress_stats = {
            "total":    len(progress),
            "approved": sum(1 for p in progress if p['status'] == 'approved'),
            "pending":  sum(1 for p in progress if p['status'] == 'pending'),
            "rejected": sum(1 for p in progress if p['status'] == 'rejected'),
        }
        certificate = models.get_certificate_by_internship(internship['internship_id'])

    return success(data={
        "student":       student,
        "internship":    internship,
        "progress_stats": progress_stats,
        "certificate":   certificate
    })


@api.route('/student/internship', methods=['GET'])
def student_internship():
    """
    GET /student/internship
    Returns full internship details for the logged-in student.
    """
    user, err = require_role('student')
    if err:
        return err

    student = models.get_student_by_user_id(user['user_id'])
    if not student:
        return error("Student profile not found.", 404)

    internship = models.get_internship_by_student(student['student_id'])
    if not internship:
        return error("No internship found for this student.", 404)

    # Include final reports
    reports = models.get_reports_by_internship(internship['internship_id'])

    return success(data={"internship": internship, "reports": reports})


@api.route('/student/progress', methods=['GET'])
def student_progress():
    """
    GET /student/progress
    Returns all weekly progress entries for the logged-in student's internship.
    """
    user, err = require_role('student')
    if err:
        return err

    student = models.get_student_by_user_id(user['user_id'])
    if not student:
        return error("Student profile not found.", 404)

    internship = models.get_internship_by_student(student['student_id'])
    if not internship:
        return error("No internship found.", 404)

    progress = models.get_progress_by_internship(internship['internship_id'])
    return success(data={"progress": progress, "internship_id": internship['internship_id']})


@api.route('/student/submit-report', methods=['POST'])
def student_submit_report():
    """
    POST /student/submit-report
    Body: { "week_no": 4, "report": "This week I did..." }
    Submits a new weekly progress report.
    """
    user, err = require_role('student')
    if err:
        return err

    data = request.get_json()
    if not data:
        return error("Request body must be JSON.", 400)

    week_no     = data.get('week_no')
    report_text = data.get('report', '').strip()

    if not week_no or not report_text:
        return error("week_no and report are required.", 400)

    try:
        week_no = int(week_no)
        if week_no < 1:
            raise ValueError()
    except ValueError:
        return error("week_no must be a positive integer.", 400)

    student = models.get_student_by_user_id(user['user_id'])
    if not student:
        return error("Student profile not found.", 404)

    internship = models.get_internship_by_student(student['student_id'])
    if not internship:
        return error("No internship found.", 404)

    # Submit the report
    progress_id = models.submit_progress_report(
        internship['internship_id'], week_no, report_text
    )

    return success(
        data={"progress_id": progress_id, "week_no": week_no},
        message=f"Week {week_no} report submitted successfully.",
        code=201
    )


# ─────────────────────────────────────────────────────────
# TEACHER ROUTES
# ─────────────────────────────────────────────────────────

@api.route('/teacher/dashboard', methods=['GET'])
def teacher_dashboard():
    """
    GET /teacher/dashboard
    Returns overall stats: all students, internships, and report counts.
    """
    user, err = require_role('faculty')
    if err:
        return err

    internships = models.get_all_internships()
    all_reports = models.get_all_progress_reports()

    stats = {
        "total_students":    len(internships),
        "ongoing":           sum(1 for i in internships if i['status'] == 'ongoing'),
        "completed":         sum(1 for i in internships if i['status'] == 'completed'),
        "pending_reports":   sum(1 for r in all_reports if r['status'] == 'pending'),
        "approved_reports":  sum(1 for r in all_reports if r['status'] == 'approved'),
        "rejected_reports":  sum(1 for r in all_reports if r['status'] == 'rejected'),
    }

    return success(data={
        "stats":        stats,
        "internships":  internships
    })


@api.route('/teacher/reports', methods=['GET'])
def teacher_reports():
    """
    GET /teacher/reports
    Returns all weekly progress reports across all students.
    Optional query param: ?status=pending|approved|rejected
    """
    user, err = require_role('faculty')
    if err:
        return err

    reports = models.get_all_progress_reports()

    # Optional filter by status
    status_filter = request.args.get('status')
    if status_filter in ('pending', 'approved', 'rejected'):
        reports = [r for r in reports if r['status'] == status_filter]

    return success(data={"reports": reports, "count": len(reports)})


@api.route('/teacher/approve-report', methods=['POST'])
def teacher_approve_report():
    """
    POST /teacher/approve-report
    Body: { "progress_id": 3, "status": "approved" | "rejected" }
    Updates the status of a weekly progress report.
    """
    user, err = require_role('faculty')
    if err:
        return err

    data = request.get_json()
    if not data:
        return error("Request body must be JSON.", 400)

    progress_id = data.get('progress_id')
    new_status  = data.get('status', '').strip()

    if not progress_id:
        return error("progress_id is required.", 400)
    if new_status not in ('approved', 'rejected'):
        return error("status must be 'approved' or 'rejected'.", 400)

    models.update_progress_status(progress_id, new_status)

    return success(
        data={"progress_id": progress_id, "status": new_status},
        message=f"Report {progress_id} has been {new_status}."
    )


# ─────────────────────────────────────────────────────────
# CERTIFICATE ROUTES
# ─────────────────────────────────────────────────────────

@api.route('/teacher/generate-certificate', methods=['POST'])
def teacher_generate_certificate():
    """
    POST /teacher/generate-certificate
    Body: { "internship_id": 3 }
    Generates a certificate for a completed internship.
    Only allowed if internship status is 'completed'.
    """
    user, err = require_role('faculty')
    if err:
        return err

    data = request.get_json()
    if not data:
        return error("Request body must be JSON.", 400)

    internship_id = data.get('internship_id')
    if not internship_id:
        return error("internship_id is required.", 400)

    # Check internship exists and is completed
    internship = query_db(
        "SELECT * FROM INTERNSHIP WHERE internship_id = ?", (internship_id,), one=True
    )
    if not internship:
        return error("Internship not found.", 404)
    if dict(internship)['status'] != 'completed':
        return error("Certificate can only be issued for completed internships. Please mark the internship as completed first.", 400)

    # Check if certificate already exists
    existing = query_db(
        "SELECT * FROM CERTIFICATE WHERE internship_id = ?", (internship_id,), one=True
    )
    if existing:
        return success(
            data={"certificate": dict(existing), "already_existed": True},
            message="Certificate already issued for this internship."
        )

    # Get student info for certificate file path
    student_info = query_db(
        """SELECT s.name, s.roll_no FROM STUDENTS s
           JOIN INTERNSHIP i ON i.student_id = s.student_id
           WHERE i.internship_id = ?""",
        (internship_id,), one=True
    )
    student_name = dict(student_info)['name'].replace(' ', '_').lower() if student_info else 'student'
    cert_file = f"/certificates/{student_name}_certificate.pdf"

    # Insert certificate record
    cert_id = execute_db(
        "INSERT INTO CERTIFICATE (internship_id, certificate_file) VALUES (?, ?)",
        (internship_id, cert_file)
    )

    # Also mark internship as completed (in case it wasn't)
    execute_db(
        "UPDATE INTERNSHIP SET status = 'completed' WHERE internship_id = ?",
        (internship_id,)
    )

    cert = query_db("SELECT * FROM CERTIFICATE WHERE certificate_id = ?", (cert_id,), one=True)
    return success(
        data={"certificate": dict(cert), "already_existed": False},
        message="Certificate issued successfully!",
        code=201
    )


@api.route('/teacher/mark-completed', methods=['POST'])
def teacher_mark_completed():
    """
    POST /teacher/mark-completed
    Body: { "internship_id": 3 }
    Marks an internship as completed.
    """
    user, err = require_role('faculty')
    if err:
        return err

    data = request.get_json()
    if not data:
        return error("Request body must be JSON.", 400)

    internship_id = data.get('internship_id')
    if not internship_id:
        return error("internship_id is required.", 400)

    internship = query_db(
        "SELECT * FROM INTERNSHIP WHERE internship_id = ?", (internship_id,), one=True
    )
    if not internship:
        return error("Internship not found.", 404)

    execute_db(
        "UPDATE INTERNSHIP SET status = 'completed' WHERE internship_id = ?",
        (internship_id,)
    )
    return success(message="Internship marked as completed.")


@api.route('/certificate/<int:internship_id>', methods=['GET'])
def get_certificate(internship_id):
    """
    GET /certificate/<internship_id>
    Returns certificate details for a given internship.
    Accessible by both student and faculty.
    """
    user = require_login()
    if not user:
        return error("Unauthorized.", 401)

    cert = query_db(
        """SELECT c.*, s.name AS student_name, s.roll_no, s.department,
                  ind.company_name, i.domain, i.start_date, i.end_date
           FROM CERTIFICATE c
           JOIN INTERNSHIP i  ON c.internship_id = i.internship_id
           JOIN STUDENTS s    ON i.student_id    = s.student_id
           JOIN INDUSTRY ind  ON i.industry_id   = ind.industry_id
           WHERE c.internship_id = ?""",
        (internship_id,), one=True
    )
    if not cert:
        return error("No certificate found for this internship.", 404)

    return success(data={"certificate": dict(cert)})


@api.route('/teacher/all-certificates', methods=['GET'])
def teacher_all_certificates():
    """
    GET /teacher/all-certificates
    Returns all issued certificates with student and internship details.
    """
    user, err = require_role('faculty')
    if err:
        return err

    rows = query_db(
        """SELECT c.certificate_id, c.internship_id, c.issue_date, c.certificate_file,
                  s.name AS student_name, s.roll_no, s.department,
                  ind.company_name, i.domain, i.start_date, i.end_date, i.status
           FROM CERTIFICATE c
           JOIN INTERNSHIP i  ON c.internship_id = i.internship_id
           JOIN STUDENTS s    ON i.student_id    = s.student_id
           JOIN INDUSTRY ind  ON i.industry_id   = ind.industry_id
           ORDER BY c.issue_date DESC"""
    )
    return success(data={"certificates": [dict(r) for r in rows]})


# ─────────────────────────────────────────────────────────
# ADMIN ROUTES
# ─────────────────────────────────────────────────────────

def require_admin():
    """Check that the logged-in user is an admin."""
    user = require_login()
    if not user:
        return None, error("Unauthorized. Please log in.", 401)
    if user.get('role') != 'admin':
        return None, error("Access denied. Admin only.", 403)
    return user, None


@api.route('/admin/dashboard', methods=['GET'])
def admin_dashboard():
    """GET /admin/dashboard - Summary stats for admin."""
    user, err = require_admin()
    if err: return err

    users        = query_db("SELECT * FROM USERS")
    students     = query_db("SELECT * FROM STUDENTS")
    faculty      = query_db("SELECT * FROM USERS WHERE role='faculty'")
    industries   = query_db("SELECT * FROM INDUSTRY")
    internships  = query_db("SELECT * FROM INTERNSHIP")
    reports      = query_db("SELECT * FROM PROGRESS_TRACKING")

    return success(data={
        "stats": {
            "total_users":       len(users),
            "total_students":    len(students),
            "total_faculty":     len(faculty),
            "total_industries":  len(industries),
            "total_internships": len(internships),
            "total_reports":     len(reports),
            "pending_reports":   sum(1 for r in reports if dict(r)['status'] == 'pending'),
        }
    })


# ── USERS ──────────────────────────────────────────────────

@api.route('/admin/users', methods=['GET'])
def admin_get_users():
    """GET /admin/users - List all users."""
    user, err = require_admin()
    if err: return err
    rows = query_db("SELECT user_id, username, role, created_at FROM USERS ORDER BY user_id")
    return success(data={"users": [dict(r) for r in rows]})


@api.route('/admin/users', methods=['POST'])
def admin_create_user():
    """POST /admin/users - Create a new user (student or faculty)."""
    user, err = require_admin()
    if err: return err

    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    role     = data.get('role', '').strip()

    if not username or not password or not role:
        return error("username, password, and role are required.", 400)
    if role not in ('student', 'faculty', 'admin'):
        return error("role must be student, faculty, or admin.", 400)

    existing = query_db("SELECT user_id FROM USERS WHERE username=?", (username,), one=True)
    if existing:
        return error(f"Username '{username}' already exists.", 409)

    uid = execute_db("INSERT INTO USERS (username, password, role) VALUES (?,?,?)",
                     (username, password, role))
    return success(data={"user_id": uid, "username": username, "role": role},
                   message=f"User '{username}' created successfully.", code=201)


@api.route('/admin/users/<int:user_id>', methods=['PUT'])
def admin_update_user(user_id):
    """PUT /admin/users/<id> - Update username, password, or role."""
    user, err = require_admin()
    if err: return err

    data     = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    role     = data.get('role', '').strip()

    existing = query_db("SELECT * FROM USERS WHERE user_id=?", (user_id,), one=True)
    if not existing:
        return error("User not found.", 404)

    new_username = username or dict(existing)['username']
    new_password = password or dict(existing)['password']
    new_role     = role     or dict(existing)['role']

    if new_role not in ('student', 'faculty', 'admin'):
        return error("role must be student, faculty, or admin.", 400)

    execute_db("UPDATE USERS SET username=?, password=?, role=? WHERE user_id=?",
               (new_username, new_password, new_role, user_id))
    return success(message=f"User {user_id} updated successfully.")


@api.route('/admin/users/<int:user_id>', methods=['DELETE'])
def admin_delete_user(user_id):
    """DELETE /admin/users/<id> - Delete a user."""
    user, err = require_admin()
    if err: return err

    existing = query_db("SELECT * FROM USERS WHERE user_id=?", (user_id,), one=True)
    if not existing:
        return error("User not found.", 404)
    if dict(existing)['role'] == 'admin':
        return error("Cannot delete admin accounts.", 400)

    execute_db("DELETE FROM USERS WHERE user_id=?", (user_id,))
    return success(message=f"User {user_id} deleted successfully.")


# ── STUDENTS ───────────────────────────────────────────────

@api.route('/admin/students', methods=['GET'])
def admin_get_students():
    """GET /admin/students - List all students with user info."""
    user, err = require_admin()
    if err: return err
    rows = query_db("""
        SELECT s.*, u.username, u.role
        FROM STUDENTS s JOIN USERS u ON s.user_id = u.user_id
        ORDER BY s.student_id
    """)
    return success(data={"students": [dict(r) for r in rows]})


@api.route('/admin/students', methods=['POST'])
def admin_create_student():
    """POST /admin/students - Create student profile for an existing user."""
    user, err = require_admin()
    if err: return err

    data       = request.get_json() or {}
    user_id    = data.get('user_id')
    name       = data.get('name', '').strip()
    roll_no    = data.get('roll_no', '').strip()
    department = data.get('department', '').strip()
    year       = data.get('year')
    phone      = data.get('phone', '').strip()
    email      = data.get('email', '').strip()

    if not all([user_id, name, roll_no, department, year]):
        return error("user_id, name, roll_no, department, and year are required.", 400)

    sid = execute_db("""
        INSERT INTO STUDENTS (user_id, name, roll_no, department, year, phone, email)
        VALUES (?,?,?,?,?,?,?)
    """, (user_id, name, roll_no, department, year, phone, email))
    return success(data={"student_id": sid}, message=f"Student '{name}' created.", code=201)


@api.route('/admin/students/<int:student_id>', methods=['PUT'])
def admin_update_student(student_id):
    """PUT /admin/students/<id> - Update student profile."""
    user, err = require_admin()
    if err: return err

    data = request.get_json() or {}
    existing = query_db("SELECT * FROM STUDENTS WHERE student_id=?", (student_id,), one=True)
    if not existing:
        return error("Student not found.", 404)
    e = dict(existing)

    execute_db("""
        UPDATE STUDENTS SET name=?, roll_no=?, department=?, year=?, phone=?, email=?
        WHERE student_id=?
    """, (
        data.get('name', e['name']),
        data.get('roll_no', e['roll_no']),
        data.get('department', e['department']),
        data.get('year', e['year']),
        data.get('phone', e['phone']),
        data.get('email', e['email']),
        student_id
    ))
    return success(message=f"Student {student_id} updated.")


@api.route('/admin/students/<int:student_id>', methods=['DELETE'])
def admin_delete_student(student_id):
    """DELETE /admin/students/<id> - Delete student profile."""
    user, err = require_admin()
    if err: return err
    existing = query_db("SELECT * FROM STUDENTS WHERE student_id=?", (student_id,), one=True)
    if not existing:
        return error("Student not found.", 404)
    execute_db("DELETE FROM STUDENTS WHERE student_id=?", (student_id,))
    return success(message=f"Student {student_id} deleted.")


# ── FACULTY ────────────────────────────────────────────────

@api.route('/admin/faculty', methods=['GET'])
def admin_get_faculty():
    """GET /admin/faculty - List all faculty users."""
    user, err = require_admin()
    if err: return err
    rows = query_db("SELECT user_id, username, role, created_at FROM USERS WHERE role='faculty' ORDER BY user_id")
    return success(data={"faculty": [dict(r) for r in rows]})


# ── INDUSTRY ───────────────────────────────────────────────

@api.route('/admin/industry', methods=['GET'])
def admin_get_industry():
    """GET /admin/industry - List all companies."""
    user, err = require_admin()
    if err: return err
    rows = query_db("SELECT * FROM INDUSTRY ORDER BY industry_id")
    return success(data={"industry": [dict(r) for r in rows]})


@api.route('/admin/industry', methods=['POST'])
def admin_create_industry():
    """POST /admin/industry - Add a new company."""
    user, err = require_admin()
    if err: return err

    data         = request.get_json() or {}
    company_name = data.get('company_name', '').strip()
    if not company_name:
        return error("company_name is required.", 400)

    iid = execute_db("""
        INSERT INTO INDUSTRY (company_name, contact_person, phone, email, address)
        VALUES (?,?,?,?,?)
    """, (company_name,
          data.get('contact_person', ''),
          data.get('phone', ''),
          data.get('email', ''),
          data.get('address', '')))
    return success(data={"industry_id": iid}, message=f"Company '{company_name}' added.", code=201)


@api.route('/admin/industry/<int:industry_id>', methods=['PUT'])
def admin_update_industry(industry_id):
    """PUT /admin/industry/<id> - Update company details."""
    user, err = require_admin()
    if err: return err

    data = request.get_json() or {}
    existing = query_db("SELECT * FROM INDUSTRY WHERE industry_id=?", (industry_id,), one=True)
    if not existing:
        return error("Company not found.", 404)
    e = dict(existing)

    execute_db("""
        UPDATE INDUSTRY SET company_name=?, contact_person=?, phone=?, email=?, address=?
        WHERE industry_id=?
    """, (
        data.get('company_name', e['company_name']),
        data.get('contact_person', e['contact_person']),
        data.get('phone', e['phone']),
        data.get('email', e['email']),
        data.get('address', e['address']),
        industry_id
    ))
    return success(message=f"Company {industry_id} updated.")


@api.route('/admin/industry/<int:industry_id>', methods=['DELETE'])
def admin_delete_industry(industry_id):
    """DELETE /admin/industry/<id> - Delete a company."""
    user, err = require_admin()
    if err: return err
    existing = query_db("SELECT * FROM INDUSTRY WHERE industry_id=?", (industry_id,), one=True)
    if not existing:
        return error("Company not found.", 404)
    execute_db("DELETE FROM INDUSTRY WHERE industry_id=?", (industry_id,))
    return success(message=f"Company {industry_id} deleted.")


# ── INTERNSHIPS ────────────────────────────────────────────

@api.route('/admin/internships', methods=['GET'])
def admin_get_internships():
    """GET /admin/internships - List all internships."""
    user, err = require_admin()
    if err: return err
    rows = query_db("""
        SELECT i.*, s.name AS student_name, s.roll_no, ind.company_name
        FROM INTERNSHIP i
        JOIN STUDENTS s   ON i.student_id  = s.student_id
        JOIN INDUSTRY ind ON i.industry_id = ind.industry_id
        ORDER BY i.internship_id
    """)
    return success(data={"internships": [dict(r) for r in rows]})


@api.route('/admin/internships', methods=['POST'])
def admin_create_internship():
    """POST /admin/internships - Assign an internship to a student."""
    user, err = require_admin()
    if err: return err

    data        = request.get_json() or {}
    student_id  = data.get('student_id')
    industry_id = data.get('industry_id')
    start_date  = data.get('start_date', '').strip()
    end_date    = data.get('end_date', '').strip()
    domain      = data.get('domain', '').strip()
    status      = data.get('status', 'ongoing').strip()

    if not all([student_id, industry_id, start_date, end_date, domain]):
        return error("student_id, industry_id, start_date, end_date, domain are required.", 400)

    iid = execute_db("""
        INSERT INTO INTERNSHIP (student_id, industry_id, start_date, end_date, domain, status)
        VALUES (?,?,?,?,?,?)
    """, (student_id, industry_id, start_date, end_date, domain, status))
    return success(data={"internship_id": iid}, message="Internship assigned successfully.", code=201)


@api.route('/admin/internships/<int:internship_id>', methods=['PUT'])
def admin_update_internship(internship_id):
    """PUT /admin/internships/<id> - Update internship details."""
    user, err = require_admin()
    if err: return err

    data = request.get_json() or {}
    existing = query_db("SELECT * FROM INTERNSHIP WHERE internship_id=?", (internship_id,), one=True)
    if not existing:
        return error("Internship not found.", 404)
    e = dict(existing)

    execute_db("""
        UPDATE INTERNSHIP SET student_id=?, industry_id=?, start_date=?, end_date=?, domain=?, status=?
        WHERE internship_id=?
    """, (
        data.get('student_id',  e['student_id']),
        data.get('industry_id', e['industry_id']),
        data.get('start_date',  e['start_date']),
        data.get('end_date',    e['end_date']),
        data.get('domain',      e['domain']),
        data.get('status',      e['status']),
        internship_id
    ))
    return success(message=f"Internship {internship_id} updated.")


@api.route('/admin/internships/<int:internship_id>', methods=['DELETE'])
def admin_delete_internship(internship_id):
    """DELETE /admin/internships/<id> - Delete an internship."""
    user, err = require_admin()
    if err: return err
    existing = query_db("SELECT * FROM INTERNSHIP WHERE internship_id=?", (internship_id,), one=True)
    if not existing:
        return error("Internship not found.", 404)
    execute_db("DELETE FROM INTERNSHIP WHERE internship_id=?", (internship_id,))
    return success(message=f"Internship {internship_id} deleted.")
