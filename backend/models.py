from app import db
from datetime import datetime
import psycopg2
from werkzeug.security import generate_password_hash, check_password_hash

DB_CONFIG = {
    'dbname': 'smartbudget',
    'user': 'postgres',
    'password': 'gsribarath',
    'host': 'localhost'
}

def get_db():
    return psycopg2.connect(**DB_CONFIG)

def create_user(email, name, password, provider):
    conn = get_db()
    cur = conn.cursor()
    hashed = generate_password_hash(password) if password else None
    try:
        cur.execute(
            "INSERT INTO logintable (email, name, auth_provider, password) VALUES (%s, %s, %s, %s)",
            (email, name, provider, hashed)
        )
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return False
    finally:
        cur.close()
        conn.close()
    return True

def get_user_by_email(email):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, email, name, auth_provider, password FROM logintable WHERE email=%s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

def update_last_login(email):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE logintable SET created_at=NOW() WHERE email=%s", (email,))
    conn.commit()
    cur.close()
    conn.close()
