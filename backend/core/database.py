import sqlite3
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "threat_logs.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS threat_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        vision_risk REAL,
        audio_risk REAL,
        context_risk REAL,
        threat_score REAL,
        threat_level TEXT,
        location TEXT,
        latitude REAL,
        longitude REAL
    )
    """)
    conn.commit()
    conn.close()

def log_threat(vision_risk, audio_risk, context_risk, threat_score,
               threat_level, location=None, latitude=None, longitude=None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO threat_logs (
        timestamp, vision_risk, audio_risk, context_risk, threat_score,
        threat_level, location, latitude, longitude
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        vision_risk, audio_risk, context_risk, threat_score,
        threat_level, location or "unknown", latitude, longitude
    ))
    conn.commit()
    conn.close()
