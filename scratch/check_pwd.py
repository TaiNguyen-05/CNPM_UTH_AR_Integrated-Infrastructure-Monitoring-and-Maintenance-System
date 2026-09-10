import os, sys, psycopg2, bcrypt
from dotenv import load_dotenv

load_dotenv('Code/backend/src/.env')
db_url = os.environ.get('SUPABASE_DB_URL').replace('postgresql+psycopg2://', 'postgresql://')

conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute('SELECT email, password_hash FROM users WHERE password_hash IS NOT NULL;')
rows = cur.fetchall()

test_passwords = ['123456', 'Password123!', 'CNPMUTH123@', 'admin123', 'password', '12345678', 'Admin123!']

for email, pwd_hash in rows:
    print(f'=== Testing user: {email} ===')
    matched = False
    for p in test_passwords:
        if bcrypt.checkpw(p.encode('utf-8'), pwd_hash.encode('utf-8')):
            print(f'  MATCH FOUND! Password is: "{p}"')
            matched = True
            break
    if not matched:
        print('  No common password matched.')
conn.close()
