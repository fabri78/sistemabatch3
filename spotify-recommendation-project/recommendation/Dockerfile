# Dockerfile para el script de Python de recomendación
FROM python:3.9

WORKDIR /app

# Instalar las dependencias necesarias para el script de recomendación
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copiar el script de recomendación
COPY . ./

CMD ["python", "recommendation.py"]
