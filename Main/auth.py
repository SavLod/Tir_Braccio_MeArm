from functools import wraps
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from werkzeug.security import check_password_hash, generate_password_hash

from Main import db

bp = Blueprint('auth', __name__)

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if "role" not in session or session["role"] not in roles:
                return redirect(url_for('auth.login'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@bp.route('/')
def home():
    user = session.get('user') 
    is_admin = user.get('is_admin') if user else False
    return render_template('auth/home.html', user=user, is_admin=is_admin)

@bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = db.get_db()
        existing = conn.execute(
            "SELECT id FROM user WHERE username = ?", (username,)
        ).fetchone()

        if existing:
            flash("User already exists!")
            return redirect(url_for("auth.register"))

        conn.execute(
            "INSERT INTO user (username, password, is_admin) VALUES (?, ?, ?)",
            (username, generate_password_hash(password), False)
        )
        conn.commit()
        return redirect(url_for("auth.login"))

    return render_template("auth/register.html")

@bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = db.get_db()
        user_data = conn.execute(
            "SELECT * FROM user WHERE username = ?", (username,)
        ).fetchone()

        if user_data and check_password_hash(user_data["password"], password):
            session["user"] = {
                "id": user_data["id"],
                "username": user_data["username"],
                "is_admin": bool(user_data["is_admin"])
            }
            return redirect(url_for("auth.home"))

        flash("Invalid credentials!")
        return redirect(url_for("auth.login"))

    return render_template("auth/login.html")

@bp.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("auth.home"))

@bp.route("/admin", methods=["GET", "POST"])
@role_required('admin')

def admin_panel():
    user = session.get("user")
    if not user or not user.get("is_admin"):
        return redirect(url_for("auth.home"))  

    conn = db.get_db()

    if request.method == "POST":
        action = request.form["action"]
        target_user = request.form["username"]

        if action == "delete":
            conn.execute("DELETE FROM user WHERE username = ?", (target_user,))
        elif action == "make_admin":
            conn.execute("UPDATE user SET is_admin = 1 WHERE username = ?", (target_user,))
        elif action == "remove_admin":
            conn.execute("UPDATE user SET is_admin = 0 WHERE username = ?", (target_user,))
        conn.commit()

    users = conn.execute("SELECT username, is_admin FROM user").fetchall()
    return render_template("auth/admin.html", users=users, user=user, is_admin=True)
