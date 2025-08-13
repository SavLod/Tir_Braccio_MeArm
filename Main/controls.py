from flask import Flask, render_template, Response, Blueprint, request, redirect, url_for, session, jsonify
import whisper
import os
import io
import torch
import numpy as np
import tempfile

bp =Blueprint('controls', __name__)

model = whisper.load_model("base")

@bp.route('/stream')
def stream():
    if "user" not in session:
        return redirect(url_for("auth.login"))

    return render_template('controls/stream.html')

@bp.route('/transcribe_audio', methods =['POST'])
def transcribe_audio():
        
    audio_file = request.files["audio"]
    audio_bytes = io.BytesIO(audio_file.read())
    
    with tempfile.NamedTemporaryFile(suffix= "wav") as f:
        f.write(audio_bytes.read())
        f.seek(0)
        result = model.transcribe(f.name)
    
    return jsonify({'text': result['text']})

@bp.route('/voicetext')
def transcribe():
    if "user" not in session:
        return redirect(url_for("auth.login"))
    
    return render_template('controls/voicetext.html')