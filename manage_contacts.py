#!/usr/bin/env python3
"""
Emergency Contacts Manager CLI
Manage emergency contacts for the Women Safety App
"""

import sqlite3
import os
import sys
from datetime import datetime

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), "backend/core/threat_logs.db")

class ContactManager:
    def __init__(self):
        if not os.path.exists(DB_PATH):
            print(f"❌ Database not found at {DB_PATH}")
            print("Please run the backend server first to initialize the database.")
            sys.exit(1)
        self.conn = sqlite3.connect(DB_PATH)
        self.cursor = self.conn.cursor()

    def list_contacts(self):
        """Display all emergency contacts"""
        self.cursor.execute("""
            SELECT id, name, phone_number, relationship, is_primary, created_at 
            FROM emergency_contacts 
            ORDER BY is_primary DESC, name ASC
        """)
        contacts = self.cursor.fetchall()
        
        if not contacts:
            print("\n📭 No emergency contacts found.")
            print("💡 Add contacts using option 2 from the menu.\n")
            return
        
        print("\n" + "="*80)
        print("📞 EMERGENCY CONTACTS")
        print("="*80)
        for c in contacts:
            contact_id, name, phone, relationship, is_primary, created = c
            primary_badge = "⭐ PRIMARY" if is_primary else ""
            rel_text = f" ({relationship})" if relationship else ""
            print(f"\n  ID: {contact_id}")
            print(f"  Name: {name}{rel_text} {primary_badge}")
            print(f"  Phone: {phone}")
            print(f"  Added: {created}")
        print("\n" + "="*80 + "\n")

    def add_contact(self):
        """Add a new emergency contact"""
        print("\n" + "="*80)
        print("➕ ADD NEW EMERGENCY CONTACT")
        print("="*80)
        
        name = input("\n  Enter name: ").strip()
        if not name:
            print("❌ Name cannot be empty!")
            return
        
        phone = input("  Enter phone number (e.g., +1234567890): ").strip()
        if not phone:
            print("❌ Phone number cannot be empty!")
            return
        
        relationship = input("  Enter relationship (optional): ").strip()
        
        primary = input("  Set as primary contact? (y/n): ").strip().lower()
        is_primary = 1 if primary == 'y' else 0
        
        try:
            self.cursor.execute("""
                INSERT INTO emergency_contacts (name, phone_number, relationship, is_primary, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (name, phone, relationship, is_primary, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
            self.conn.commit()
            print(f"\n✅ Contact '{name}' added successfully!")
        except Exception as e:
            print(f"\n❌ Error adding contact: {e}")

    def delete_contact(self):
        """Delete an emergency contact"""
        self.list_contacts()
        
        try:
            contact_id = int(input("Enter contact ID to delete (0 to cancel): ").strip())
            if contact_id == 0:
                print("❌ Cancelled.")
                return
            
            # Check if contact exists
            self.cursor.execute("SELECT name FROM emergency_contacts WHERE id = ?", (contact_id,))
            result = self.cursor.fetchone()
            
            if not result:
                print(f"❌ Contact with ID {contact_id} not found!")
                return
            
            confirm = input(f"\n⚠️  Delete '{result[0]}'? (yes/no): ").strip().lower()
            if confirm == 'yes':
                self.cursor.execute("DELETE FROM emergency_contacts WHERE id = ?", (contact_id,))
                self.conn.commit()
                print(f"✅ Contact deleted successfully!")
            else:
                print("❌ Cancelled.")
        except ValueError:
            print("❌ Invalid ID!")
        except Exception as e:
            print(f"❌ Error: {e}")

    def view_threat_logs(self):
        """Display recent threat logs"""
        self.cursor.execute("""
            SELECT timestamp, threat_level, threat_score, location, latitude, longitude
            FROM threat_logs
            ORDER BY id DESC
            LIMIT 20
        """)
        logs = self.cursor.fetchall()
        
        if not logs:
            print("\n📭 No threat logs found.\n")
            return
        
        print("\n" + "="*80)
        print("🚨 RECENT THREAT LOGS (Last 20)")
        print("="*80)
        for log in logs:
            timestamp, level, score, location, lat, lon = log
            color = "🔴" if level == "HIGH" else "🟡" if level == "MEDIUM" else "🟢"
            loc_text = f" at {location}" if location else ""
            gps_text = f" ({lat:.4f}, {lon:.4f})" if lat and lon else ""
            print(f"\n  {color} {level} - Score: {score:.2f}")
            print(f"  Time: {timestamp}{loc_text}{gps_text}")
        print("\n" + "="*80 + "\n")

    def view_auto_alerts(self):
        """Display auto-alert history"""
        self.cursor.execute("""
            SELECT timestamp, threat_level, threat_score, contacts_notified, status
            FROM auto_alerts
            ORDER BY id DESC
            LIMIT 10
        """)
        alerts = self.cursor.fetchall()
        
        if not alerts:
            print("\n📭 No auto-alerts sent yet.\n")
            return
        
        print("\n" + "="*80)
        print("📱 AUTO-ALERT HISTORY (Last 10)")
        print("="*80)
        for alert in alerts:
            timestamp, level, score, contacts, status = alert
            status_icon = "✅" if status == "sent" else "❌"
            print(f"\n  {status_icon} {level} - Score: {score:.2f}")
            print(f"  Time: {timestamp}")
            print(f"  Notified: {contacts}")
        print("\n" + "="*80 + "\n")

    def view_settings(self):
        """Display current settings"""
        self.cursor.execute("SELECT key, value FROM settings")
        settings = self.cursor.fetchall()
        
        print("\n" + "="*80)
        print("⚙️  CURRENT SETTINGS")
        print("="*80)
        for key, value in settings:
            if key == "auto_emergency_enabled":
                display = "✅ Enabled" if value == "true" else "❌ Disabled"
                print(f"\n  Auto-Emergency Alerts: {display}")
            elif key == "threat_threshold":
                print(f"  Threat Threshold: {value}")
            elif key == "alert_cooldown_seconds":
                print(f"  Alert Cooldown: {value}s ({int(value)//60} minutes)")
        print("\n" + "="*80 + "\n")

    def close(self):
        """Close database connection"""
        self.conn.close()


def main():
    print("\n" + "="*80)
    print("🛡️  WOMEN SAFETY APP - Emergency Contacts Manager")
    print("="*80)
    
    manager = ContactManager()
    
    while True:
        print("\n📋 MENU:")
        print("  1. List all emergency contacts")
        print("  2. Add new contact")
        print("  3. Delete contact")
        print("  4. View threat logs")
        print("  5. View auto-alert history")
        print("  6. View settings")
        print("  0. Exit")
        
        choice = input("\nEnter your choice: ").strip()
        
        if choice == "1":
            manager.list_contacts()
        elif choice == "2":
            manager.add_contact()
        elif choice == "3":
            manager.delete_contact()
        elif choice == "4":
            manager.view_threat_logs()
        elif choice == "5":
            manager.view_auto_alerts()
        elif choice == "6":
            manager.view_settings()
        elif choice == "0":
            print("\n👋 Goodbye!\n")
            manager.close()
            sys.exit(0)
        else:
            print("\n❌ Invalid choice! Please try again.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!\n")
        sys.exit(0)
