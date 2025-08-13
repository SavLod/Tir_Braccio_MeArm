FROM python:3.13-slim


WORKDIR /Tirocinio

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y ffmpeg
RUN pip install openai-whisper
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN python -c "import whisper; whisper.load_model('base')"


# Copy app
COPY . .

# Expose Flask port
EXPOSE 5000

ENV FLASK_APP=run.py
CMD ["python", "run.py", "--host=0.0.0.0"]
