# 🛡️ Women Safety App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node](https://img.shields.io/badge/Node-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![CI](https://github.com/username/women-safety-app/workflows/CI/badge.svg)](https://github.com/username/women-safety-app/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> An AI-powered full-stack safety monitoring system with real-time threat detection and emergency response capabilities.

**[Quick Start](#-quick-start)** • **[Features](#-features)** • **[Documentation](#-documentation)** • **[Contributing](CONTRIBUTING.md)**

---

## ✨ Features

- 🎤 **Real-time Audio Emotion Detection** - Detects emotions from speech using Whisper Large V3
- 📹 **Vision-based Crowd Detection** - YOLOv8 for people counting and posture analysis  
- 🧠 **Multi-modal Threat Assessment** - AI decision engine combining audio, vision, and context
- 📍 **GPS Location Tracking** - Real-time location sharing with Google Maps integration
- 📱 **Emergency SOS System** - One-click alert with 10-second countdown
- 💬 **Twilio SMS Integration** - Automatic alerts to emergency contacts
- ⚙️ **Auto-Emergency Alerts** - Configurable automatic notifications on high threat
- 📊 **SQLite Database** - Persistent storage for contacts, logs, and settings
- 🖥️ **CLI Contact Manager** - Command-line interface for emergency contacts
- 🐳 **Docker Support** - Containerized deployment with docker-compose

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
# Clone and navigate
git clone <repository-url>
cd women-safety-app

# Configure environment
cp .env.example .env
# Edit .env with your Twilio credentials

# Start with Docker
./launch.sh start docker

# Access the app
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Native Installation
```bash
# First time setup
python3 -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install
cd ..

# Start application
./launch.sh start native
```

## 📋 Additional Commands

### CLI Tools

```bash
# Manage emergency contacts via CLI
./launch.sh cli
# Or directly:
python3 manage_contacts.py

# View database status and logs
./test_integration.sh

# Run integration tests
./launch.sh test
```

### Docker Management

```bash
# View logs
docker-compose logs -f

# Rebuild containers
docker-compose build --no-cache

# Stop and remove containers
docker-compose down
```

### Local Development

For advanced usage or development, activate the virtual environment:
- **macOS/Linux**: `source env/bin/activate`
- **Windows**: `env\Scripts\activate.bat`

## 🛠️ Unified Launcher Commands

All launcher commands work on **Windows, macOS, and Linux**:

```bash
# Start/Stop
./launch.sh start [docker|native]   # Start application
./launch.sh stop [docker|native]    # Stop application
./launch.sh restart [docker|native] # Restart application

# Monitoring
./launch.sh status                  # Check app status
./launch.sh logs [docker|native]    # View logs

# Tools
./launch.sh cli                     # Manage emergency contacts
./launch.sh test                    # Run integration tests
./launch.sh help                    # Show help
```

## 📞 Emergency Contacts Management

**Via CLI:**
```bash
./launch.sh cli
# Interactive menu to add/delete/list contacts
```

**Via Web UI:**
```
Navigate to http://localhost:5173/settings
```

**Via API:**
```bash
# List contacts
curl http://localhost:8000/emergency/contacts

# Add contact
curl -X POST http://localhost:8000/emergency/contacts \
  -H 'Content-Type: application/json' \
  -d '{"name":"John Doe","phone_number":"+1234567890","relationship":"Family","is_primary":true}'
```

## 🧪 Testing the System

```bash
# Run integration tests
./launch.sh test

# Test individual endpoints
curl http://localhost:8000/audio/status
curl http://localhost:8000/vision/status
curl -X POST http://localhost:8000/threat/status \
  -H 'Content-Type: application/json' \
  -d '{"latitude":28.6139,"longitude":77.2090}'
```

## 📂 Project Structure

```
women-safety-app/
├── launch.sh                 # 🚀 Unified launcher script
├── manage_contacts.py        # 📞 CLI contact manager
├── test_integration.sh       # 🧪 Integration tests
├── docker-compose.yml        # 🐳 Docker configuration
├── .env.example              # ⚙️ Environment template
├── QUICKSTART.md             # 📖 Quick start guide
├── PROJECT_ANALYSIS.md       # 📊 Comprehensive analysis
│
├── backend/                  # Python/FastAPI Backend
│   ├── Dockerfile
│   ├── main.py              # Main API server
│   ├── requirements.txt
│   ├── core/
│   │   ├── decision_engine.py    # Threat assessment
│   │   ├── database.py           # SQLite operations
│   │   └── threat_logs.db        # Database file
│   ├── services/
│   │   ├── audio_service.py      # Speech emotion detection
│   │   ├── vision_service.py     # Crowd detection
│   │   └── twilio_service.py     # SMS alerts
│   ├── api/
│   │   └── routes_*.py           # API endpoints
│   └── yolov8n*.pt              # YOLO models
│
└── frontend/                 # React/Vite Frontend
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx              # Router setup
## 🎯 Core Components

### 🎤 Audio Emotion Detection
- Uses Hugging Face Whisper Large V3 model
- 7 emotions: Happy, Sad, Angry, Neutral, Disgust, Fearful, Surprised
- Real-time microphone processing (3-second chunks)
- Confidence scores and probability distributions
- Background thread processing with FastAPI compatibility

### 📹 Vision System
- YOLOv8n for people detection
- YOLOv8n-pose for posture analysis
- Motion detection via frame differencing
- Real-time camera feed processing
- Crowd density calculation

### 🧠 Decision Engine
- Multi-modal threat assessment (Audio 40% + Vision 50% + Context 10%)
- Risk scoring: LOW / MEDIUM / HIGH
- Contextual factors: time of day, location type
- Adaptive sensitivity thresholds

### 📱 Emergency System
- One-click SOS with 10-second countdown
- Automatic SMS alerts via Twilio
- Google Maps location sharing
- Multiple emergency contacts support
- Auto-alert with configurable threshold and cooldown
- Database logging of all events
## License

This project is licensed under the MIT License - see the LICENSE file for details.
## 🔧 Configuration

### Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Required variables:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Settings (Configurable via UI)
- **Auto-Emergency Alerts**: Enable/disable automatic notifications
- **Threat Threshold**: 0.5-1.0 (sensitivity level)
- **Alert Cooldown**: 60-600 seconds (prevent spam)

## 🧪 Development

### Backend Development
```bash
cd backend
source ../env/bin/activate
python main.py
# API docs: http://localhost:8000/docs
```

### Frontend Development
```bash
cd frontend
npm run dev
# Hot reload enabled
```

### Database Management
```bash
# CLI manager
./launch.sh cli

# Direct access
sqlite3 backend/core/threat_logs.db

# View tables
.tables

# Query contacts
SELECT * FROM emergency_contacts;
```

## 📊 Tech Stack

### Backend
- **Framework**: FastAPI (async, high-performance)
- **AI/ML**: Transformers, Ultralytics YOLOv8, PyTorch, OpenCV
- **Audio**: sounddevice, librosa
- **Database**: SQLite3
- **SMS**: Twilio API
- **Server**: Uvicorn (ASGI)

### Frontend
- **Framework**: React 18.3
- **Router**: React Router DOM 6.22
- **Build Tool**: Vite 5.2
- **HTTP**: Axios 1.7
- **Styling**: Tailwind CSS

## 📚 Documentation

- **[README.md](README.md)** - Main documentation (you are here)
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md)** - Complete project analysis
- **[INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md)** - Integration status
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[MAINTAINERS.md](MAINTAINERS.md)** - Maintainer guide
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
- **[API Docs](http://localhost:8000/docs)** - Interactive API documentation (when running)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI Whisper** for speech emotion recognition
- **Ultralytics YOLOv8** for computer vision
- **Hugging Face** for AI model hosting
- **Twilio** for SMS infrastructure
- **FastAPI** for the amazing backend framework
- **React** and **Vite** for the frontend

## 📧 Support

For questions and support:
- Open an [Issue](https://github.com/username/women-safety-app/issues)
- Check [Discussions](https://github.com/username/women-safety-app/discussions)
- Read the [Documentation](#-documentation)

## ⚠️ Disclaimer

This application is designed as a safety tool but should not be relied upon as the sole means of protection. In case of emergency, always contact local authorities (112, 911, or your local emergency number) directly.

---

**Made with ❤️ for women's safety**

*Star ⭐ this repository if you find it helpful!*
