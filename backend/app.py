"""
app.py
------
Main Flask application entry point.
Initializes the database, registers routes, and serves frontend static files.

Run with:
    cd backend
    python app.py
"""

import os
import sys
from flask import Flask, send_from_directory, request

# Add backend directory to path so sibling modules resolve correctly
sys.path.insert(0, os.path.dirname(__file__))

from database import init_db
from routes import api

# ─────────────────────────────────────────────────────────
# App Configuration
# ─────────────────────────────────────────────────────────

# Path to the frontend folder (one level up from backend/)
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')

# Secret key for session management (change this in production!)
app.secret_key = 'interntrack-secret-key-2024'

# Session cookie settings
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Register API blueprint (all routes prefixed with /api)
app.register_blueprint(api, url_prefix='/api')


# ─────────────────────────────────────────────────────────
# Frontend Static File Serving
# ─────────────────────────────────────────────────────────

@app.route('/')
def index():
    """Serve the homepage (index.html)."""
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    """Serve any other static file from the frontend directory."""
    return send_from_directory(FRONTEND_DIR, filename)


# ─────────────────────────────────────────────────────────
# CORS Headers (for development convenience)
# ─────────────────────────────────────────────────────────

@app.after_request
def add_cors_headers(response):
    """
    Allow cross-origin requests from the frontend dev server (port 3000)
    AND from Flask itself (port 5000). Supports credentials (cookies).
    """
    origin = request.headers.get('Origin', '')
    # Allow requests from the Node.js frontend dev server or same origin
    allowed_origins = [
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://127.0.0.1:5000',
        'http://localhost:5000',
    ]
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin']      = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


@app.route('/api/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    """Handle preflight CORS OPTIONS requests."""
    from flask import jsonify
    response = jsonify({})
    origin = request.headers.get('Origin', '')
    allowed_origins = [
        'http://127.0.0.1:3000', 'http://localhost:3000',
        'http://127.0.0.1:5000', 'http://localhost:5000',
    ]
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin']      = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response, 200


# ─────────────────────────────────────────────────────────
# Application Entry Point
# ─────────────────────────────────────────────────────────

if __name__ == '__main__':
    print("=" * 55)
    print("  Student Internship Tracking System")
    print("=" * 55)

    # Initialize the database (creates tables + seed data)
    db_path = os.path.join(os.path.dirname(__file__), 'database.db')
    if not os.path.exists(db_path):
        print("[INFO] Creating fresh database...")
        init_db()
    else:
        print("[INFO] Database already exists. Skipping init.")
        print("[INFO] To reset, delete backend/database.db and restart.")

    print("[INFO] Starting Flask server on http://127.0.0.1:5000")
    print("[INFO] Press Ctrl+C to stop.\n")

    app.run(debug=True, host='127.0.0.1', port=5000)
