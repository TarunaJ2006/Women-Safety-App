# Women Safety App (Guardia)

**Guardia** is an AI-powered women's safety application that provides real-time threat detection and emergency response capabilities. It uses advanced machine learning models to analyze audio and video streams for potential threats, enabling proactive intervention through a dedicated responder dashboard.

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed

### Launch the Application

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Women-Safety-App
   ```

2. **Start all services**:
   ```bash
   docker compose up --build
   ```

3. **Access the portals**:
   - **Patient/User Portal**: [http://localhost:5173](http://localhost:5173)
   - **Responder Portal**: [http://localhost:3050](http://localhost:3050)
   - **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🏗️ Architecture

The application follows a microservices-ready architecture with separated frontends and a unified backend:

```
.
├── backend/                # FastAPI Backend & AI Engine
│   ├── app/
│   │   ├── ai/             # AI Inference Engines
│   │   │   ├── audio/      # Speech Emotion Recognition (SER)
│   │   │   └── vision/     # YOLOv8 Person/Pose Detection
│   │   ├── api/            # REST API Endpoints (v1)
│   │   ├── core/           # Config & Security (JWT, CORS)
│   │   ├── db/             # Database Models & Seeds
│   │   ├── models/         # SQLAlchemy Models
│   │   ├── schemas/        # Pydantic Schemas
│   │   ├── services/       # Business Logic
│   │   └── risk_engine/    # Threat Score Calculation
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/               # User/Patient Web App (React + Vite)
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Routes (Dashboard, Alert, etc.)
│   │   └── services/       # API Integration
│   └── Dockerfile
│
├── responder-frontend/     # Emergency Responder Dashboard
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Alert Monitoring Interface
│   │   └── services/       # API Integration
│   └── Dockerfile
│
├── docs/                   # Documentation
├── docker-compose.yml      # Multi-container Orchestration
└── .github/workflows/      # CI/CD Pipeline
```

---

## 🌟 Key Features

### 🎯 Real-Time Threat Detection
- **Audio Analysis**: Speech Emotion Recognition (SER) model detects distress in voice patterns
- **Vision Analysis**: YOLOv8-based person detection and pose estimation to identify threatening situations
- **Risk Scoring**: Weighted fusion algorithm (50% Vision + 40% Audio + 10% Context) generates threat scores (0-100)

### 🚨 Emergency Response System
- **Instant Alerts**: Automatic alert creation when threat threshold is exceeded
- **Responder Dashboard**: Dedicated portal for emergency responders to view and manage active alerts
- **Real-time Monitoring**: Live alert feed with location and threat details

### 🔒 Secure Authentication
- **JWT-based Auth**: Industry-standard token-based authentication
- **Role-Based Access Control (RBAC)**: Separate permissions for users and responders
- **Password Hashing**: bcrypt for secure credential storage

### 🤖 AI Architecture (Passive Mode)
The backend operates in **passive mode** - it doesn't access system hardware (camera/mic) directly. Instead:
- Frontends capture media from user devices
- Media is sent to backend endpoints as Base64/binary streams
- AI models process data server-side using ONNX Runtime
- Results (threat scores, detections) are returned to frontends

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Authentication**: python-jose (JWT), bcrypt
- **AI/ML**: 
  - ONNX Runtime (optimized inference)
  - YOLOv8 (ONNX format) - person detection & pose estimation
  - Custom SER model (ONNX format) - emotional speech analysis
- **Audio Processing**: librosa, soundfile
- **Vision Processing**: OpenCV, Pillow

### Frontend (User Portal)
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Responder Portal
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **Real-time Updates**: Polling-based alert monitoring

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **API Documentation**: FastAPI Auto-generated (OpenAPI/Swagger)

---

## 📊 AI Models

### Vision Engine
- **Model**: YOLOv8n (ONNX format)
- **Tasks**: 
  - Person detection in video frames
  - Pose estimation for threat assessment
- **Location**: `backend/app/artifacts/vision/`

### Audio Engine  
- **Model**: Speech Emotion Recognition (SER) - ONNX format
- **Task**: Detect emotional distress from audio samples
- **Processing**: 16kHz mono audio resampling via librosa
- **Location**: `backend/app/artifacts/audio/`

### Risk Decision Engine
- **Logic**: `backend/app/services/decision.py`
- **Algorithm**: Weighted fusion of vision, audio, and contextual data
- **Output**: Threat score (0-100) with alert threshold

---

## 🔧 Development

### Environment Setup

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables** (see `.env.example` for details):
   - Database credentials
   - JWT secret key
   - API endpoints

### Running Without Docker

**Backend**:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

**Responder Frontend**:
```bash
cd responder-frontend
npm install
npm run dev
```

### Database Management

The database is automatically initialized on startup with:
- Table creation via SQLAlchemy models
- Seed data for development/testing

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Build Validation
```bash
cd frontend
npm run build
```

---

## 🤝 Contributors

- **Hasan**: Full Stack Development, Backend Architecture, API Design, Infrastructure, Testing
- **Tarunaj**: Vision AI Model Implementation

---

## 📝 License

See [LICENSE](LICENSE) file for details.

---

## 🔗 Additional Documentation

- [AI Architecture](backend/AI_ARCHITECTURE.md) - Detailed explanation of AI engines and passive mode
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to this project