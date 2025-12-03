# Use Ubuntu 22.04 as base
FROM ubuntu:22.04

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    python3-dev \
    libpq-dev \
    libgl1 \
    libglib2.0-0 \
    libportaudio2 \
    portaudio19-dev \
    libsndfile1 \
    ffmpeg \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set python3.10 as default python
RUN ln -s /usr/bin/python3.10 /usr/bin/python

# Set work directory
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Install Python dependencies using uv
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

# Copy project
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["python3", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
