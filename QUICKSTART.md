# Women Safety App - Quick Start Guide

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
# Start with Docker
./launch.sh start docker

# Stop
./launch.sh stop docker
```

### Option 2: Native
```bash
# First time setup
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
cd frontend && npm install && cd ..

# Start
./launch.sh start native

# Stop
./launch.sh stop native
```

## 📋 Available Commands

```bash
./launch.sh start [docker|native]   # Start application
./launch.sh stop [docker|native]    # Stop application
./launch.sh restart [docker|native] # Restart application
./launch.sh logs [docker|native]    # View logs
./launch.sh status                  # Check status
./launch.sh cli                     # Manage contacts
./launch.sh test                    # Run tests
./launch.sh help                    # Show help
```

## 🔧 Configuration

1. Copy `.env.example` to `.env`
2. Add your Twilio credentials
3. Configure emergency contacts (optional)

## 📱 Access Points

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 📊 Manage Emergency Contacts

```bash
# Via CLI
./launch.sh cli

# Via Web UI
Open http://localhost:5173/settings
```

## 🧪 Testing

```bash
# Run integration tests
./launch.sh test

# Test backend API
curl http://localhost:8000/audio/status
curl http://localhost:8000/vision/status
```

## 🛑 Troubleshooting

**Docker Issues:**
```bash
docker-compose down
docker-compose build --no-cache
./launch.sh start docker
```

**Native Issues:**
```bash
# Check logs
./launch.sh logs native

# Or view directly
tail -f backend.log
tail -f frontend.log
```

## 📝 Project Structure

```
women-safety-app/
├── launch.sh              # Unified launcher
├── manage_contacts.py     # CLI contact manager
├── test_integration.sh    # Integration tests
├── docker-compose.yml     # Docker configuration
├── .env.example           # Environment template
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   └── ...
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── ...
```
