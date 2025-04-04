FROM python:3.10-slim AS build

RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    gcc \
    g++ \
    libatlas-base-dev \
    && rm -rf /var/lib/apt/lists/*
    
WORKDIR /FLICKS
RUN pip install --upgrade pip
RUN pip install --no-cache-dir numpy==1.21.6 cython==0.29.32 scikit-build
RUN pip install --no-cache-dir --no-binary=scikit-surprise scikit-surprise
COPY backend/backend_requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/backend_requirements.txt
FROM python:3.10-slim AS production
WORKDIR /FLICKS
COPY --from=build /usr/local /usr/local
COPY . . 
CMD ["uvicorn","backend.userMain:app","--host", "0.0.0.0","--port","8000"]