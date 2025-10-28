# Changelog

All notable changes to the Women Safety App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Unified `launch.sh` launcher for cross-platform deployment
- Docker support with docker-compose configuration
- CLI contact manager (`manage_contacts.py`)
- Integration test suite (`test_integration.sh`)
- GitHub Actions CI pipeline
- Comprehensive documentation (README, QUICKSTART, MAINTAINERS, CONTRIBUTING)
- `.dockerignore` files for optimized builds
- Auto-emergency alert system with configurable thresholds
- SQLite database logging for threats and auto-alerts

### Changed
- Removed hardcoded phone numbers (now uses database contacts)
- Migrated Emergency.jsx styling from inline to Tailwind CSS
- Updated README with launcher-based workflow
- Improved `.env.example` with detailed comments
- Cleaned up repository (removed duplicates and old files)

### Fixed
- Duplicate code in `Settings.jsx`
- Emergency SOS now sends to all contacts from database
- Consistent styling across Dashboard and Emergency pages

### Removed
- `file.txt` (unnecessary)
- `test_integration.py` (replaced by shell script)
- Root-level model files (moved to backend/)
- `INTEGRATION.md` (superseded by other docs)
- `launcher.py` from root (archived to scripts/)

## [1.0.0] - 2025-10-28

### Added
- Initial release
- Real-time audio emotion detection (Whisper Large V3)
- Vision-based crowd detection (YOLOv8)
- Multi-modal threat assessment engine
- Emergency SOS system with Twilio SMS
- GPS location tracking
- React frontend with Dashboard, Emergency, and Settings pages
- FastAPI backend with auto-generated API docs
- SQLite database for persistence

[Unreleased]: https://github.com/username/women-safety-app/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/username/women-safety-app/releases/tag/v1.0.0
