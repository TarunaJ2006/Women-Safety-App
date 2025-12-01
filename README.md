# Gramin Swasthya - Women Safety & Telemedicine Platform

Gramin Swasthya is a comprehensive, multi-modal telemedicine and safety application designed to provide accessible healthcare and emergency response systems. It integrates real-time risk detection (audio/vision), secure telemedicine appointments, and a community marketplace.

## 🚀 Quick Start (Locally)

Prerequisites: **Docker** and **Docker Compose**.

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd Women-Safety-App
    ```

2.  **Start the Application**:
    ```bash
    docker-compose up --build
    ```

3.  **Access the Services**:
    *   **Patient Portal**: [http://localhost:5173](http://localhost:5173)
    *   **Doctor Portal**: [http://localhost:3001](http://localhost:3001)
    *   **Responder Portal**: [http://localhost:3050](http://localhost:3050)
    *   **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🏗️ Project Structure

The project is organized into a modular microservices-ready architecture:

```
.
├── backend/                # FastAPI Backend & AI Engine
│   ├── app/
│   │   ├── ai/             # Audio (Whisper) & Vision (YOLO/MediaPipe) Engines
│   │   ├── api/            # REST API Endpoints (v1)
│   │   ├── core/           # Config & Security (JWT, CORS)
│   │   ├── db/             # Database Models & Seeds (PostgreSQL)
│   │   └── services/       # Business Logic (Auth, Appointments)
│   └── Dockerfile          # Python Environment
│
├── frontend/               # Patient/User Web App (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Application Routes (Dashboard, Alert, Shop)
│   │   └── services/       # API Integration
│   └── Dockerfile
│
├── responder-frontend/     # Emergency Responder Dashboard
│   └── ...
│
├── docs/                   # Documentation & Planning
└── docker-compose.yml      # Orchestration
```

## 🌟 Key Features

*   **Real-time Threat Detection**: Uses local AI models to analyze audio for distress and video for potential threats.
*   **Telemedicine**: Book appointments with doctors, secure video calls (simulated/integrated).
*   **Marketplace**: Purchase ayurvedic and medical remedies.
*   **Emergency Response**: Dedicated portal for responders to track alerts.
*   **Secure Auth**: JWT-based authentication with Role-Based Access Control (RBAC).

## 🛠️ Technology Stack

*   **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL
*   **AI/ML**: PyTorch, Whisper, YOLOv8
*   **Frontend**: React, TailwindCSS, Vite
*   **Containerization**: Docker

## 🤝 Contributors

*   **Hasan**: Full Stack Development, Backend Architecture, API Pipelines, Infrastructure, & Testing.
*   **Tarunaj**: Vision AI Model Implementation.