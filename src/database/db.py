import sqlite3

DB_NAME = "study_planner.db"

def get_connection():
    return sqlite3.connect(DB_NAME)