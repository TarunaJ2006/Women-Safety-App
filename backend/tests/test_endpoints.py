from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_dashboard_status():
    response = client.get("/api/v1/dashboard/status")
    assert response.status_code == 200
    data = response.json()
    assert "vision" in data
    assert "audio" in data
    assert "risk" in data

def test_emergency_contacts_empty():
    # Assuming clean DB or mock
    response = client.get("/api/v1/contacts/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_settings_get():
    response = client.get("/api/v1/settings/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
