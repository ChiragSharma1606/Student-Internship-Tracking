"""
database.py
-----------
Handles SQLite database connection and initialization.
Reads schema.sql to create tables and seed data.
"""

import sqlite3
import os

# Path to the SQLite database file
DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

# Path to the SQL schema file
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')


def get_db():
    """
    Open and return a new database connection.
    Rows are returned as sqlite3.Row objects (dict-like access).
    """
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Allows column access by name
    conn.execute("PRAGMA foreign_keys = ON")  # Enforce FK constraints
    return conn


def init_db():
    """
    Initialize the database by executing schema.sql.
    This drops and recreates all tables, then inserts seed data.
    Call this once on first run or to reset the database.
    """
    with open(SCHEMA_PATH, 'r') as f:
        schema = f.read()

    conn = get_db()
    try:
        conn.executescript(schema)
        conn.commit()
        print("[DB] Database initialized successfully.")
    except Exception as e:
        print(f"[DB] Error initializing database: {e}")
    finally:
        conn.close()


def query_db(query, args=(), one=False):
    """
    Helper to run a SELECT query.
    Returns one row if one=True, otherwise a list of rows.
    """
    conn = get_db()
    try:
        cur = conn.execute(query, args)
        rows = cur.fetchall()
        return (rows[0] if rows else None) if one else rows
    finally:
        conn.close()


def execute_db(query, args=()):
    """
    Helper to run INSERT / UPDATE / DELETE queries.
    Returns the last inserted row ID.
    """
    conn = get_db()
    try:
        cur = conn.execute(query, args)
        conn.commit()
        return cur.lastrowid
    finally:
        conn.close()
