# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install git
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV FLASK_APP=pack.py
ENV FLASK_ENV=production

# Expose port 8080 for Google Cloud
EXPOSE 8080

# Run the application with gunicorn
CMD exec gunicorn --bind :8080 --workers 1 --threads 8 --timeout 0 pack:app 