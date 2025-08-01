FROM python:3.11-slim

WORKDIR /app

# Copy requirements file (create one if it doesn't exist)
COPY requirements.txt* ./

# Install dependencies if requirements.txt exists
RUN pip install --no-cache-dir --upgrade pip && \
    if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

# Copy source code
COPY . .

# Set environment variables
ENV PYTHONPATH=/app

# Start the application
CMD ["python", "bot.py"] 