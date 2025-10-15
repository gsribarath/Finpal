CREATE TABLE IF NOT EXISTS logintable (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash TEXT,
    auth_provider VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add Expenses table for storing all expense data
CREATE TABLE IF NOT EXISTS addexpenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES logintable(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    email VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    payment_mode VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE family (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(128),
    family_id INTEGER REFERENCES family(id)
);

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category VARCHAR(50),
    amount FLOAT,
    date DATE DEFAULT CURRENT_DATE,
    payment_mode VARCHAR(30),
    receipt_url VARCHAR(200)
);

CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50),
    due_date DATE,
    status VARCHAR(20)
);


