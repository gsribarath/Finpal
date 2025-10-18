# 📱 FinPal - Smart Budget Mobile App

**FinPal** is a modern, mobile-first expense tracking application built with React and Flask. Track your expenses, manage your budget, and achieve financial freedom—all from your smartphone!

---

## ✨ Features

### 🎯 Core Features
- **Smart Expense Tracking** - Log expenses quickly with category auto-suggestions
- **Multi-Language Support** - Available in English, Hindi, Tamil, and Telugu
- **Google OAuth Integration** - Seamless sign-in with your Google account
- **Real-time Dashboard** - View your monthly spending at a glance
- **Secure Authentication** - Environment-based credential management

### 📱 Mobile-First Design
- **Responsive Layout** - Optimized for all screen sizes (320px to 1920px+)
- **Bottom Navigation Bar** - Easy thumb-reach navigation for mobile devices
- **Hamburger Menu** - Clean, collapsible menu for additional options
- **Touch-Optimized** - Proper tap targets and touch feedback
- **No Horizontal Scroll** - Perfect viewport management
- **Fast Loading** - Optimized assets and minimal dependencies

### 🎨 User Experience
- **Smooth Animations** - Slide-down menus and fade-in effects
- **Active State Highlighting** - Know exactly where you are in the app
- **Touch Feedback** - Visual response to user interactions
- **Gradient Backgrounds** - Modern, appealing visual design
- **Icon-Based Navigation** - Intuitive emoji-based UI elements

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** database

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/gsribarath/Finpal.git
cd Finpal
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials (DB password, Google OAuth, etc.)
```

3. **Install backend dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Install frontend dependencies**
```bash
cd frontend
npm install
```

5. **Set up the database**
```bash
psql -U postgres -f db/schema.sql
```

6. **Run the application**

Terminal 1 (Backend):
```bash
cd backend
python app.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

7. **Access the app**
- Open your browser to `http://localhost:3000`
- Or access from your mobile device on the same network: `http://[your-ip]:3000`

---

## 📱 Mobile Optimization Details

### Viewport Configuration
- Prevents unwanted zooming
- Ensures proper scaling on all devices
- Disables pinch-to-zoom for app-like experience

### Responsive Breakpoints
- **Mobile**: 320px - 480px (optimized)
- **Tablet**: 481px - 768px (responsive)
- **Desktop**: 769px+ (enhanced)

### Navigation System
1. **Top Bar** - Logo, app name, and hamburger menu
2. **Slide-Down Menu** - Full navigation options when needed
3. **Bottom Bar** - Quick access to 4 main sections
4. **Active Highlighting** - Shows current page in bottom nav

---

## 🛠️ Technology Stack

### Frontend
- **React** 18+ - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP requests
- **i18next** - Internationalization

### Backend
- **Flask** - Python web framework
- **PostgreSQL** - Database
- **Authlib** - OAuth implementation
- **python-dotenv** - Environment management

### Security
- **Environment Variables** - All secrets in `.env`
- **CORS Protection** - Configured allowed origins
- **Session Management** - Secure cookie-based sessions
- **Password Hashing** - Werkzeug security

---

## 📂 Project Structure

```
Finpal/
├── backend/
│   ├── app.py              # Flask application
│   ├── models.py           # Database models
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html      # Mobile-optimized HTML
│   ├── src/
│   │   ├── components/
│   │   │   └── MobileNavigation.js  # Reusable nav component
│   │   ├── pages/
│   │   │   ├── Home.js              # Dashboard (mobile-first)
│   │   │   ├── Login.js             # Login page
│   │   │   ├── Register.js          # Registration
│   │   │   ├── AddExpense.js        # Expense form
│   │   │   └── ...
│   │   └── locales/                 # Translation files
│   └── package.json
├── db/
│   └── schema.sql          # Database schema
├── .env.example           # Environment template
└── README.md
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/register` - Create new account
- `POST /api/login` - Email/password login
- `GET /auth/google` - Google OAuth initiation
- `GET /api/me` - Get current user
- `POST /api/logout` - End session

### Expenses
- `POST /add_expense` - Create new expense
- `GET /api/expenses` - List user expenses

---

## 🔒 Security Features

1. **No Hardcoded Credentials** - All secrets in environment variables
2. **GitHub Secret Scanning** - Passes push protection
3. **CORS Configuration** - Restricts API access
4. **Session Security** - HTTP-only cookies
5. **Password Hashing** - Secure implementation

---

## 📞 Contact

**Developer**: Barath Gobi  
**Email**: barathgobi2007@gmail.com  
**GitHub**: [@gsribarath](https://github.com/gsribarath)  
**Repository**: [FinPal](https://github.com/gsribarath/Finpal)

---

**Made with ❤️ for better financial management**
