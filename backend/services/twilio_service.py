import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load .env file
load_dotenv()

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE_NUMBER")

if not all([TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE]):
    print("❌ Twilio credentials not found. Please check .env file.")
else:
    print("✅ Twilio credentials loaded successfully.")

client = Client(TWILIO_SID, TWILIO_TOKEN)

def send_emergency_alert(to_number: str, message: str):
    try:
        msg = client.messages.create(
            body=message,
            from_=TWILIO_PHONE,
            to=to_number
        )
        print(f"✅ SMS sent to {to_number}: SID={msg.sid}")
        return {"status": "sent", "sid": msg.sid}
    except Exception as e:
        print(f"❌ Twilio Error: {e}")
        return {"status": "error", "message": str(e)}
