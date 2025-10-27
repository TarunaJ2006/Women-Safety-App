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
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        relationship TEXT,
        is_primary INTEGER DEFAULT 0,
        created_at TEXT
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS auto_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        threat_level TEXT,
        threat_score REAL,
        contacts_notified TEXT,
        latitude REAL,
        longitude REAL,
        status TEXT
    )
    """)
    
    # Initialize default settings
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_emergency_enabled', 'true')")
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('threat_threshold', '0.7')")
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('alert_cooldown_seconds', '300')")
    
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

def add_emergency_contact(name, phone_number, relationship="", is_primary=False):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO emergency_contacts (name, phone_number, relationship, is_primary, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, (name, phone_number, relationship, 1 if is_primary else 0, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
    conn.commit()
    contact_id = cursor.lastrowid
    conn.close()
    return contact_id

def get_emergency_contacts():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, phone_number, relationship, is_primary FROM emergency_contacts ORDER BY is_primary DESC, name ASC")
    contacts = cursor.fetchall()
    conn.close()
    return [{"id": c[0], "name": c[1], "phone_number": c[2], "relationship": c[3], "is_primary": bool(c[4])} for c in contacts]

def delete_emergency_contact(contact_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM emergency_contacts WHERE id = ?", (contact_id,))
    conn.commit()
    conn.close()

def get_setting(key, default=None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else default

def set_setting(key, value):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))
    conn.commit()
    conn.close()

def log_auto_alert(threat_level, threat_score, contacts_notified, latitude=None, longitude=None, status="sent"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO auto_alerts (timestamp, threat_level, threat_score, contacts_notified, latitude, longitude, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), threat_level, threat_score, contacts_notified, latitude, longitude, status))
    conn.commit()
    conn.close()

def get_last_auto_alert_time():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp FROM auto_alerts ORDER BY id DESC LIMIT 1")
    result = cursor.fetchone()
    conn.close()
    if result:
        return datetime.strptime(result[0], "%Y-%m-%d %H:%M:%S")
    return None
