from flask import Flask, render_template, Response, Blueprint

bp =Blueprint('controls', __name__)

@bp.route('/stream')
def index():
    return render_template('controls/stream.html')



