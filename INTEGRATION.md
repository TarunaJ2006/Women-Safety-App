# Women Safety App - Integration Guide

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Copy and configure environment variables
cp ../.env.example .env
# Edit .env with your Twilio credentials

# Run the backend
python main.py
```

Backend will run on `http://127.0.0.1:8000`

### Frontend Setup
```bash
cd frontend
npm install

# Copy and configure environment variables (optional)
cp .env.example .env

# Run the frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔗 API Integration

### Available Backend Endpoints

#### 1. Audio Status
```
GET /audio/status
Returns: { emotion: string, confidence: float, active: bool }
```

#### 2. Vision Status
```
GET /vision/status
Returns: { people_count: int, risk_level: string, is_crowded: bool, active: bool }
```

#### 3. Threat Analysis
```
POST /threat/status
Body: { latitude?: float, longitude?: float }
Returns: {
  current_threat: {
    threat_level: string,
    threat_score: float,
    vision_risk: float,
    audio_risk: float,
    context_risk: float
  },
  gps: { latitude?: float, longitude?: float },
  recent_logs: Array
}
```

#### 4. Emergency SOS
```
POST /emergency/send-sos
Body: {
  phone_number: string,
  message: string,
  latitude?: float,
  longitude?: float
}
Returns: { status: string, sid?: string, message?: string }
```

#### 5. Twilio Test
```
POST /twilio/test?number=+1234567890
Returns: { status: string, sid?: string }
```

## 🎯 Frontend Services

### API Service (`src/services/api.js`)
- `getAudioStatus()` - Fetch audio/emotion analysis
- `getVisionStatus()` - Fetch vision/crowd detection
- `getThreatStatus(lat, lon)` - Get comprehensive threat assessment
- `sendEmergencySOS(phone, message, lat, lon)` - Send emergency alert

### Custom Hooks
- `useAudioStatus()` - Audio data with auto-polling
- `useVisionStatus()` - Vision data with auto-polling  
- `useSafetyData()` - Combined safety metrics with GPS
- `useLocation()` - GPS coordinates from browser

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Frontend (.env)
```
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_EMERGENCY_CONTACT=+911234567890
```

## 🧪 Testing Integration

1. **Start Backend**: `cd backend && python main.py`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: `http://localhost:5173`
4. **Check Console**: Look for successful API calls
5. **Test Features**:
   - Dashboard should show real-time emotion data
   - Vision system should display people count
   - Threat level should update automatically
   - GPS coordinates should be visible
   - Emergency button should navigate to emergency page

## 🐛 Troubleshooting

### Backend not connecting?
- Check if backend is running on port 8000
- Verify CORS is enabled in backend
- Check browser console for errors

### Location not working?
- Allow location permissions in browser
- Use HTTPS or localhost (required by browsers)
- Check browser compatibility

### Twilio not sending?
- Verify .env file has correct credentials
- Check Twilio account balance
- Verify phone number format (+country code)

### Frontend build errors?
- Run `npm install` in frontend directory
- Clear node_modules and reinstall if needed
- Check React and Vite versions

## 📊 Data Flow

```
User Browser
    ↓ (requests location)
Browser Geolocation API
    ↓ (lat, lon)
React useLocation Hook
    ↓ (provides to components)
useSafetyData Hook
    ↓ (polls every 2s with GPS)
Backend /threat/status
    ↓ (processes)
Decision Engine
    ↓ (returns threat assessment)
Dashboard UI
```

## 🎨 Key Features Integrated

✅ Real-time audio emotion detection  
✅ Live vision/crowd analysis  
✅ GPS location tracking  
✅ Threat score calculation  
✅ Emergency SOS with location sharing  
✅ Auto-polling for live updates  
✅ Error handling and fallbacks  
✅ Responsive UI with Tailwind CSS  

## 📱 Emergency Workflow

1. User presses EMERGENCY button
2. 10-second countdown starts
3. GPS coordinates are captured
4. SMS sent via Twilio with:
   - Custom message
   - GPS coordinates
   - Google Maps link
5. Event logged in database
6. UI shows confirmation

## 🔐 Security Notes

- Never commit .env files to git
- Use environment variables for all secrets
- Validate all user inputs on backend
- Implement rate limiting for production
- Use HTTPS in production

## 🚀 Production Deployment

### Backend
- Use gunicorn/uvicorn for production
- Set up reverse proxy (nginx)
- Enable HTTPS
- Configure firewall rules
- Set proper CORS origins

### Frontend
- Build with `npm run build`
- Deploy to Vercel/Netlify/etc.
- Update VITE_API_BASE_URL to production backend
- Enable HTTPS

## 📞 Support

For issues or questions:
1. Check console logs (browser and backend)
2. Verify environment variables
3. Test individual endpoints with curl/Postman
4. Check network tab in browser DevTools
