from flask import Flask, request, session, redirect, jsonify
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from functools import wraps
import os
from urllib.parse import quote
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'supersecretkey')
app.permanent_session_lifetime = timedelta(days=30)  # Sessions last 30 days

# Enhanced CORS configuration
CORS(app, 
     supports_credentials=True, 
     origins=['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3006'], 
     allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     expose_headers=['Content-Type', 'Authorization'])

# Add OPTIONS handler for all routes
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get('Origin', 'http://localhost:3001'))
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization,X-Requested-With")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        response.headers.add('Access-Control-Allow-Credentials', "true")
        return response, 200

# Database connection
def get_db():
    try:
        return psycopg2.connect(
            dbname=os.getenv('DB_NAME', 'smartbudget'),
            user=os.getenv('DB_USER', 'postgres'), 
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST', 'localhost')
        )
    except psycopg2.Error as e:
        print(f"Database connection error: {e}")
        raise

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

# Google OAuth setup
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    access_token_url='https://oauth2.googleapis.com/token',
    refresh_token_url=None,
    client_kwargs={
        'scope': 'openid email profile',
        'prompt': 'select_account'
    }
)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', '')
    
    if not email or not password or not name:
        return jsonify({'error': 'Name, email and password are required'}), 400
    
    password_hash = generate_password_hash(password)
    
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO logintable (email, password_hash, name, auth_provider)
            VALUES (%s, %s, %s, 'email')""", (email, password_hash, name)
        )
        conn.commit()
        return jsonify({'success': True}), 201
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify({'error': 'Email already exists'}), 409
    finally:
        cur.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, password_hash, name FROM logintable WHERE email=%s AND auth_provider='email'", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user or not check_password_hash(user[1], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    session.permanent = True  # Make session permanent
    session['user_id'] = user[0]
    session['email'] = email
    return jsonify({'success': True, 'user': {'id': user[0], 'email': email, 'name': user[2] or email.split('@')[0]}})

@app.route('/auth/google')
def auth_google():
    print("=== Google OAuth route accessed ===")
    try:
        # Use Authlib's authorize_redirect method for proper OAuth flow
        redirect_uri = 'http://localhost:5000/auth/google/callback'
        return google.authorize_redirect(redirect_uri)
    except Exception as e:
        print(f"Error initiating Google OAuth: {e}")
        return redirect('http://localhost:3000/login?error=google_init_failed')

@app.route('/auth/google/callback')
def auth_google_callback():
    print("=== Google OAuth callback received ===")
    try:
        # Get the authorization code from the callback
        code = request.args.get('code')
        if not code:
            print("No authorization code received")
            return redirect('http://localhost:3000/login?error=google_auth_failed')
        
        print(f"Authorization code received: {code[:20]}...")
        
        # Exchange code for token
        token = google.authorize_access_token()
        print(f"Token exchange successful: {token is not None}")
        
        if not token:
            print("Failed to get access token")
            return redirect('http://localhost:3000/login?error=google_auth_failed')
        
        # Get user information
        user_info = token.get('userinfo')
        if not user_info:
            # Try getting user info with a separate request
            resp = google.get('https://www.googleapis.com/oauth2/v2/userinfo', token=token)
            user_info = resp.json()
        
        print(f"User info received: {user_info}")
        
        if not user_info or 'email' not in user_info:
            print("No email in user info")
            return redirect('http://localhost:3000/login?error=google_auth_failed')
        
        email = user_info['email']
        name = user_info.get('name', email.split('@')[0])
        print(f"Processing user: {email}, {name}")
        
        # Database operations
        conn = get_db()
        cur = conn.cursor()
        
        # Check if user exists
        cur.execute("SELECT id FROM logintable WHERE email=%s", (email,))
        existing_user = cur.fetchone()
        
        if existing_user:
            user_id = existing_user[0]
            print(f"Existing user found: {user_id}")
            # Update name if it's empty
            cur.execute("UPDATE logintable SET name=%s WHERE id=%s AND (name IS NULL OR name='')", (name, user_id))
        else:
            print("Creating new user")
            # Create new user
            cur.execute(
                """INSERT INTO logintable (email, name, auth_provider)
                VALUES (%s, %s, 'google') RETURNING id""", (email, name)
            )
            user_id = cur.fetchone()[0]
            print(f"New user created: {user_id}")
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Set session
        session.permanent = True  # Make session permanent
        session['user_id'] = user_id
        session['email'] = email
        print(f"Session set for user: {user_id}")
        
        # Redirect to home page
        return redirect('http://localhost:3000/home')
        
    except Exception as e:
        print(f"Google OAuth callback error: {e}")
        import traceback
        traceback.print_exc()
        return redirect('http://localhost:3000/login?error=google_auth_failed')

@app.route('/api/me')
def api_me():
    if not session.get('user_id'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Get user details from database
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT email, name FROM logintable WHERE id=%s", (session['user_id'],))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user_id': session['user_id'], 
        'email': user[0],
        'name': user[1] or user[0].split('@')[0]  # Use name or email prefix if name is null
    })

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/')
def index():
    return {'message': 'SmartBudget API running'}

@app.route('/test')
def test():
    return {'status': 'Backend is working', 'google_oauth': 'configured'}

@app.route('/add_expense', methods=['POST', 'OPTIONS'])
def add_expense():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'CORS preflight'})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get('Origin', 'http://localhost:3001'))
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization,X-Requested-With")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        response.headers.add('Access-Control-Allow-Credentials', "true")
        return response, 200
    
    # Check authentication
    if not session.get('user_id'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        conn = get_db()
        cur = conn.cursor()
        
        # Insert into addexpenses table
        query = """INSERT INTO addexpenses (user_id, user_name, email, category, amount, expense_date, payment_mode, description) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"""
        values = (
            session['user_id'],
            data.get('user_name', ''), 
            session.get('email', ''),
            data.get('category', ''),
            float(data.get('amount', 0)), 
            data.get('date'),  # expense_date
            data.get('payment_mode', ''), 
            data.get('description', '')
        )
        cur.execute(query, values)
        expense_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({"message": "Expense added successfully!", "expense_id": expense_id})
    except Exception as e:
        print(f"Error adding expense: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses', methods=['GET'])
@login_required
def get_expenses():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""SELECT id, category, amount, expense_date, payment_mode, description, created_at 
                       FROM addexpenses WHERE user_id = %s ORDER BY created_at DESC""", (session['user_id'],))
        expenses = cur.fetchall()
        cur.close()
        conn.close()
        
        expense_list = []
        for expense in expenses:
            expense_list.append({
                'id': expense[0],
                'category': expense[1],
                'amount': float(expense[2]),
                'date': expense[3].isoformat() if expense[3] else None,
                'payment_mode': expense[4],
                'description': expense[5],
                'created_at': expense[6].isoformat() if expense[6] else None
            })
        
        return jsonify({'expenses': expense_list})
    except Exception as e:
        print(f"Error fetching expenses: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
