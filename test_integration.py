#!/usr/bin/env python3
"""
Integration Test Script for Women Safety App
Tests all backend endpoints to ensure proper integration
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
COLORS = {
    "GREEN": "\033[92m",
    "RED": "\033[91m",
    "YELLOW": "\033[93m",
    "BLUE": "\033[94m",
    "RESET": "\033[0m"
}

def print_header(text):
    print(f"\n{COLORS['BLUE']}{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}{COLORS['RESET']}\n")

def print_success(text):
    print(f"{COLORS['GREEN']}✅ {text}{COLORS['RESET']}")

def print_error(text):
    print(f"{COLORS['RED']}❌ {text}{COLORS['RESET']}")

def print_info(text):
    print(f"{COLORS['YELLOW']}ℹ️  {text}{COLORS['RESET']}")

def test_endpoint(method, endpoint, data=None, expected_keys=None):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        else:
            print_error(f"Unsupported method: {method}")
            return False
        
        if response.status_code in [200, 201]:
            print_success(f"{method} {endpoint} - Status: {response.status_code}")
            
            if expected_keys:
                json_data = response.json()
                missing_keys = [key for key in expected_keys if key not in json_data]
                if missing_keys:
                    print_error(f"Missing keys: {missing_keys}")
                    return False
                else:
                    print_info(f"Response keys: {list(json_data.keys())}")
            
            print_info(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print_error(f"{method} {endpoint} - Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error(f"Cannot connect to {url}")
        print_error("Is the backend running? Start it with: python backend/main.py")
        return False
    except Exception as e:
        print_error(f"Error testing {endpoint}: {str(e)}")
        return False

def main():
    print_header("Women Safety App - Integration Test")
    print(f"Testing backend at: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    results = []
    
    # Test 1: Root endpoint
    print_header("Test 1: Root Endpoint")
    results.append(test_endpoint("GET", "/", expected_keys=["status", "services"]))
    
    time.sleep(1)
    
    # Test 2: Audio Status
    print_header("Test 2: Audio Status")
    results.append(test_endpoint("GET", "/audio/status", expected_keys=["emotion", "confidence"]))
    
    time.sleep(1)
    
    # Test 3: Vision Status
    print_header("Test 3: Vision Status")
    results.append(test_endpoint("GET", "/vision/status"))
    
    time.sleep(1)
    
    # Test 4: Threat Status (without GPS)
    print_header("Test 4: Threat Status (No GPS)")
    results.append(test_endpoint("POST", "/threat/status", data={}, expected_keys=["current_threat"]))
    
    time.sleep(1)
    
    # Test 5: Threat Status (with GPS)
    print_header("Test 5: Threat Status (With GPS)")
    results.append(test_endpoint(
        "POST", 
        "/threat/status", 
        data={"latitude": 40.7128, "longitude": -74.0060},
        expected_keys=["current_threat", "gps"]
    ))
    
    time.sleep(1)
    
    # Test 6: Emergency SOS (will fail if Twilio not configured, which is expected)
    print_header("Test 6: Emergency SOS Endpoint")
    print_info("Note: This may fail if Twilio is not configured (expected)")
    test_endpoint(
        "POST",
        "/emergency/send-sos",
        data={
            "phone_number": "+1234567890",
            "message": "Test SOS message",
            "latitude": 40.7128,
            "longitude": -74.0060
        }
    )
    
    time.sleep(1)
    
    # Test 7: Twilio Test (optional)
    print_header("Test 7: Twilio Test Endpoint")
    print_info("Note: This may fail if Twilio is not configured (expected)")
    test_endpoint("POST", "/twilio/test?number=+1234567890")
    
    # Summary
    print_header("Test Summary")
    passed = sum(results)
    total = len(results)
    
    print(f"Total Tests: {total}")
    print_success(f"Passed: {passed}")
    if total - passed > 0:
        print_error(f"Failed: {total - passed}")
    
    if passed == total:
        print_success("\n🎉 All critical tests passed! Integration is working correctly.")
    else:
        print_error(f"\n⚠️  {total - passed} test(s) failed. Check the errors above.")
    
    print("\n" + "="*60 + "\n")
    
    # Frontend integration check
    print_header("Frontend Integration Check")
    print_info("Frontend should be running on http://localhost:5173")
    print_info("Backend is running on http://127.0.0.1:8000")
    print("\nTo test full integration:")
    print("1. Start backend: cd backend && python main.py")
    print("2. Start frontend: cd frontend && npm run dev")
    print("3. Open http://localhost:5173 in your browser")
    print("4. Check browser console for API calls")
    print("5. Verify data updates every 2 seconds")
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()
