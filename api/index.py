import sys
import os

# Add Code/backend/src to sys.path
backend_src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Code", "backend", "src"))
if backend_src_dir not in sys.path:
    sys.path.insert(0, backend_src_dir)

from app import create_app

res = create_app()
app = res[0] if isinstance(res, tuple) else res
