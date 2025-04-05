# docker file for the recommendation cron job
FROM python:3.10.11-slim 
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    gcc \
    g++ \
    libatlas-base-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /FLICKS
RUN pip install --upgrade pip
RUN pip install --no-cache-dir numpy==1.26.2 
COPY backend/cronjob_requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/cronjob_requirements.txt
COPY . .
ENV PYTHONPATH=/FLICKS
CMD ["python", "backend/training.py"]