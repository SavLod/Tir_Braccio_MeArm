FROM python:3.13-slim


WORKDIR /Tirocinio

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Expose Flask port
EXPOSE 5000

ENV FLASK_APP=run.py
CMD ["python", "run.py", "--host=0.0.0.0"]
