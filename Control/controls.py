from flask import Flask, render_template, Response, Blueprint
import cv2

bp =Blueprint('controls', __name__)

@bp.route('/stream')
def index():
    return render_template('controls/stream.html')



