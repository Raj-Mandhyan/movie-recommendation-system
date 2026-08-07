# Use a lightweight official Python runtime as base
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Set work directory
WORKDIR /app

# Install system dependencies required for Git and FAISS execution
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first to leverage Docker layer caching
COPY requirements.txt /app/

# Install Python packages
RUN pip install --no-cache-dir -U pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy database corpus and models needed for recommendation engine execution
COPY src/ /app/src/
COPY data/ /app/data/
COPY models/ /app/models/

# Expose port
EXPOSE 8000

RUN python -c "import faiss; print('Docker FAISS:', faiss.__version__)"
RUN python -c "f=open('/app/models/faiss.index','rb'); print(f.read(64))"
# Start FastAPI server using uvicorn
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
