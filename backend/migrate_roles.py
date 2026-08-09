# backend/migrate_roles.py
from sqlalchemy import create_engine, text
import os

DB_FILE = os.path.join(os.path.dirname(__file__), "lotsa.db")
engine = create_engine(f"sqlite:///{DB_FILE}")

with engine.connect() as conn:
    # Add columns to users table (safe to re-run)
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR;"))
        print("✅ Added full_name to users")
    except Exception as e:
        print("ℹ️ full_name already exists:", e)
    
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN phone_number VARCHAR;"))
        print("✅ Added phone_number to users")
    except Exception as e:
        print("ℹ️ phone_number already exists:", e)
    
    # Copy existing student profile data into users table
    conn.execute(text("""
        UPDATE users 
        SET full_name = (
            SELECT sp.full_name 
            FROM student_profiles sp 
            WHERE sp.user_id = users.id
        )
        WHERE full_name IS NULL OR full_name = '';
    """))
    
    conn.execute(text("""
        UPDATE users 
        SET phone_number = (
            SELECT sp.phone_number 
            FROM student_profiles sp 
            WHERE sp.user_id = users.id
        )
        WHERE phone_number IS NULL OR phone_number = '';
    """))
    
    conn.commit()
    print("🎉 Migration complete.")