import psycopg2
import urllib.parse

password = urllib.parse.quote_plus("CNPMUTH123@")
project_id = "anthsojdjibgcsgxkkdu"

print("Encoded password:", password)

# Try direct
try:
    conn_str = f"postgresql://postgres:{password}@db.{project_id}.supabase.co:5432/postgres?sslmode=require"
    conn = psycopg2.connect(conn_str, connect_timeout=5)
    print("SUCCESS: Direct connection works!")
    print("WORKING_URI:", conn_str)
    conn.close()
except Exception as e:
    print("Direct error:", e)

# Try common poolers
for region in ["ap-southeast-1", "ap-southeast-2", "ap-northeast-2", "ap-northeast-1", "us-east-1", "eu-central-1", "ap-south-1"]:
    try:
        pooler_uri = f"postgresql://postgres.{project_id}:{password}@aws-0-{region}.pooler.supabase.com:6543/postgres?sslmode=require"
        conn = psycopg2.connect(pooler_uri, connect_timeout=5)
        print(f"SUCCESS: Pooler {region} works!")
        print("WORKING_POOLER_URI:", pooler_uri)
        conn.close()
        break
    except Exception as e:
        print(f"Pooler {region} failed: {e}")
