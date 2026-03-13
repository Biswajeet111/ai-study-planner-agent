from .db import get_connection

def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        semester INTEGER,
        daily_hours INTEGER
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subjects(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        subject_name TEXT,
        difficulty INTEGER,
        last_score INTEGER
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schedules(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        subject TEXT,
        hours INTEGER,
        day TEXT
    )
    """)

    conn.commit()
    conn.close()