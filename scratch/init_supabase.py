import psycopg2

pooler_uri = "postgresql://postgres.anthsojdjibgcsgxkkdu:CNPMUTH123%40@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require"

with open("supabase_schema.sql", "r", encoding="utf-8") as f:
    sql_script = f.read()

print("Connecting to Supabase...")
conn = psycopg2.connect(pooler_uri)
conn.autocommit = True
cursor = conn.cursor()

print("Executing supabase_schema.sql...")
cursor.execute(sql_script)
print("SUCCESS: Database schema and seed data created successfully on Supabase!")

# Verify table counts
cursor.execute("SELECT count(*) FROM server_nodes;")
nodes_count = cursor.fetchone()[0]
cursor.execute("SELECT count(*) FROM racks;")
racks_count = cursor.fetchone()[0]
cursor.execute("SELECT count(*) FROM alerts;")
alerts_count = cursor.fetchone()[0]

print(f"Verified Database: {nodes_count} server nodes, {racks_count} racks, {alerts_count} alerts.")
conn.close()
