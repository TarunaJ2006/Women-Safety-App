#!/bin/bash

###############################################################################
# Women Safety App - Unified Launcher
# Supports Docker and Native modes
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   🛡️  WOMEN SAFETY APP - UNIFIED LAUNCHER${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_docker() {
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        return 0
    else
        return 1
    fi
}

check_python() {
    if command -v python3 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

check_node() {
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        return 0
    else
        return 1
    fi
}

start_docker() {
    print_header
    print_info "Starting application in Docker mode..."
    echo ""
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        cat > .env << EOF
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Emergency Contacts (comma-separated)
EMERGENCY_CONTACTS=+1234567890,+0987654321
EOF
        print_warning "Please edit .env file with your Twilio credentials"
    fi
    
    # Build and start containers
    print_info "Building Docker images..."
    docker-compose build
    
    print_info "Starting containers..."
    docker-compose up -d
    
    echo ""
    print_success "Application started in Docker!"
    echo ""
    print_info "📍 Backend:  http://localhost:8000"
    print_info "📍 Frontend: http://localhost:5173"
    print_info "📍 API Docs: http://localhost:8000/docs"
    echo ""
    print_info "View logs: docker-compose logs -f"
    print_info "Stop:      docker-compose down"
    echo ""
}

start_native() {
    print_header
    print_info "Starting application in Native mode..."
    echo ""
    
    # Check dependencies
    if ! check_python; then
        print_error "Python 3 is not installed!"
        exit 1
    fi
    
    if ! check_node; then
        print_error "Node.js/npm is not installed!"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "backend/main.py" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check if virtual environment exists
    if [ ! -d "env" ]; then
        print_warning "Virtual environment not found. Please run setup first."
        print_info "Run: python3 -m venv env && source env/bin/activate && pip install -r requirements.txt"
        exit 1
    fi
    
    # Start backend in background
    print_info "Starting Backend Server..."
    cd backend
    ../env/bin/python main.py > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    cd ..
    
    # Wait for backend to start
    print_info "Waiting for backend to initialize..."
    sleep 5
    
    # Check if backend started successfully
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_error "Backend failed to start. Check backend.log for errors."
        exit 1
    fi
    
    # Start frontend
    print_info "Starting Frontend..."
    cd frontend
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    cd ..
    
    # Wait for frontend to start
    sleep 3
    
    echo ""
    print_success "Application started in Native mode!"
    echo ""
    print_info "📍 Backend:  http://localhost:8000"
    print_info "📍 Frontend: http://localhost:5173"
    print_info "📍 API Docs: http://localhost:8000/docs"
    echo ""
    print_info "Backend PID:  $BACKEND_PID (logged to backend.log)"
    print_info "Frontend PID: $FRONTEND_PID (logged to frontend.log)"
    echo ""
    print_info "Stop: ./launch.sh stop"
    echo ""
    
    # Create stop script
    cat > stop.sh << 'EOF'
#!/bin/bash
if [ -f backend.pid ]; then
    kill $(cat backend.pid) 2>/dev/null && echo "✅ Backend stopped"
    rm backend.pid
fi
if [ -f frontend.pid ]; then
    kill $(cat frontend.pid) 2>/dev/null && echo "✅ Frontend stopped"
    rm frontend.pid
fi
EOF
    chmod +x stop.sh
}

stop_docker() {
    print_info "Stopping Docker containers..."
    docker-compose down
    print_success "Docker containers stopped!"
}

stop_native() {
    if [ -f backend.pid ]; then
        kill $(cat backend.pid) 2>/dev/null && print_success "Backend stopped"
        rm backend.pid
    fi
    if [ -f frontend.pid ]; then
        kill $(cat frontend.pid) 2>/dev/null && print_success "Frontend stopped"
        rm frontend.pid
    fi
}

show_logs() {
    if [ "$1" = "docker" ]; then
        docker-compose logs -f
    else
        print_info "Backend logs:"
        tail -f backend.log &
        print_info "Frontend logs:"
        tail -f frontend.log &
        wait
    fi
}

show_status() {
    print_header
    echo ""
    
    # Check Docker
    if docker ps | grep -q "women-safety"; then
        print_success "Docker containers are running"
        docker ps | grep "women-safety"
    else
        print_info "Docker containers are not running"
    fi
    
    echo ""
    
    # Check Native
    if [ -f backend.pid ] && kill -0 $(cat backend.pid) 2>/dev/null; then
        print_success "Native backend is running (PID: $(cat backend.pid))"
    else
        print_info "Native backend is not running"
    fi
    
    if [ -f frontend.pid ] && kill -0 $(cat frontend.pid) 2>/dev/null; then
        print_success "Native frontend is running (PID: $(cat frontend.pid))"
    else
        print_info "Native frontend is not running"
    fi
    echo ""
}

show_help() {
    print_header
    echo ""
    echo "Usage: ./launch.sh [COMMAND] [MODE]"
    echo ""
    echo "Commands:"
    echo "  start [docker|native]  - Start the application"
    echo "  stop  [docker|native]  - Stop the application"
    echo "  restart [docker|native] - Restart the application"
    echo "  logs  [docker|native]  - View application logs"
    echo "  status                 - Show application status"
    echo "  cli                    - Launch CLI contact manager"
    echo "  test                   - Run integration tests"
    echo "  help                   - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./launch.sh start docker   # Start with Docker"
    echo "  ./launch.sh start native   # Start without Docker"
    echo "  ./launch.sh stop docker    # Stop Docker containers"
    echo "  ./launch.sh cli            # Manage emergency contacts"
    echo ""
}

run_cli() {
    print_info "Launching Emergency Contacts Manager CLI..."
    python3 manage_contacts.py
}

run_tests() {
    print_info "Running integration tests..."
    ./test_integration.sh
}

# Main script logic
case "$1" in
    start)
        if [ "$2" = "docker" ]; then
            if check_docker; then
                start_docker
            else
                print_error "Docker or docker-compose not found!"
                print_info "Install Docker: https://docs.docker.com/get-docker/"
                exit 1
            fi
        elif [ "$2" = "native" ]; then
            start_native
        else
            print_error "Please specify mode: docker or native"
            show_help
            exit 1
        fi
        ;;
    stop)
        if [ "$2" = "docker" ]; then
            stop_docker
        elif [ "$2" = "native" ]; then
            stop_native
        else
            stop_docker
            stop_native
        fi
        ;;
    restart)
        $0 stop "$2"
        sleep 2
        $0 start "$2"
        ;;
    logs)
        show_logs "$2"
        ;;
    status)
        show_status
        ;;
    cli)
        run_cli
        ;;
    test)
        run_tests
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        show_help
        exit 1
        ;;
esac
