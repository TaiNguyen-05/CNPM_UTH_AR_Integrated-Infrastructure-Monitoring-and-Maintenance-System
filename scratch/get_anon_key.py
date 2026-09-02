import psycopg2

pooler_uri = "postgresql://postgres.anthsojdjibgcsgxkkdu:CNPMUTH123%40@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require"
conn = psycopg2.connect(pooler_uri)
cur = conn.cursor()

try:
    cur.execute("SELECT name, decrypted_secret FROM vault.decrypted_secrets;")
    print("Vault secrets:", cur.fetchall())
except Exception as e:
    print("Vault query error:", e)

try:
    cur.execute("SELECT * FROM pg_settings WHERE name LIKE '%jwt%' OR name LIKE '%anon%';")
    print("PG Settings:", cur.fetchall())
except Exception as e:
    print("PG Settings error:", e)

conn.close()
