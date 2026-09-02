"""
AR-IMMS Unified System Launcher
Starts backend (Flask API + Static Frontend Server) unified on port 9999.
"""

import os
import sys
import subprocess

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, 'frontend')
FRONTEND_DIST = os.path.join(FRONTEND_DIR, 'dist')
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend', 'src')
BACKEND_APP = os.path.join(BACKEND_DIR, 'app.py')

VENV_PYTHON_WIN = os.path.join(BACKEND_DIR, '.venv', 'Scripts', 'python.exe')
VENV_PYTHON_UNIX = os.path.join(BACKEND_DIR, '.venv', 'bin', 'python')

def get_python_executable():
    if os.path.exists(VENV_PYTHON_WIN):
        return VENV_PYTHON_WIN
    if os.path.exists(VENV_PYTHON_UNIX):
        return VENV_PYTHON_UNIX
    return sys.executable

def ensure_frontend_built():
    index_html = os.path.join(FRONTEND_DIST, 'index.html')
    if not os.path.exists(index_html):
        print("📦 Đang đóng gói Frontend (npm run build)...")
        subprocess.run(['npm', 'run', 'build'], cwd=FRONTEND_DIR, shell=True, check=True)
        print("✅ Đóng gói Frontend hoàn tất.")

def main():
    print("==================================================================")
    print("🚀 AR-IMMS Central Command Center (Unified Monorepo)")
    print("🌐 Web App & Admin Dashboard:  http://localhost:9999/")
    print("📖 Swagger API Documentation:  http://localhost:9999/docs")
    print("🩺 Health Check Endpoint:      http://localhost:9999/api/health")
    print("==================================================================")

    ensure_frontend_built()

    python_exec = get_python_executable()
    env = os.environ.copy()
    env['PYTHONPATH'] = BACKEND_DIR + os.pathsep + env.get('PYTHONPATH', '')

    try:
        subprocess.run([python_exec, BACKEND_APP], cwd=BACKEND_DIR, env=env)
    except KeyboardInterrupt:
        print("\n🛑 Đã dừng hệ thống AR-IMMS.")

if __name__ == '__main__':
    main()
