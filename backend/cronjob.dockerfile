# docker file for the recommendation cron job
FROM python:3.10-slim 
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    gcc \
    g++ \
    libatlas-base-dev \
    && rm -rf /var/lib/apt/lists/*
    
WORKDIR /
RUN pip install --upgrade pip
RUN pip install --no-cache-dir numpy==1.21.6 cython==0.29.32 scikit-build
RUN pip install --no-cache-dir --no-binary=scikit-surprise scikit-surprise
COPY cronjob_requirements.txt .
RUN pip install --no-cache-dir -r cronjob_requirements.txt
COPY . .
CMD ["python", "training.py"]