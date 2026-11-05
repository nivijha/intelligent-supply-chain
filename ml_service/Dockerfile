FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY ml_service/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY public_supply_chain_synthetic /app/public_supply_chain_synthetic
COPY ml_service /app/ml_service

WORKDIR /app/ml_service
RUN PYTHONPATH=/app/ml_service/src python scripts/train_demand.py

ENV PYTHONPATH=/app/ml_service/src
EXPOSE 8000

CMD ["uvicorn", "ml_service.api.app:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "/app/ml_service/src"]
