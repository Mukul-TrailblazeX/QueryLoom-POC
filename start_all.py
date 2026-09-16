import os
import sys
import subprocess
import time
import socket
import psutil

# ==========================================
# ⚙️ CONFIGURATION - CONTROL ALL PORTS HERE
# ==========================================
FRONTEND_PORT = 5173
BACKEND_PORT = 8000
PYTHON_BRAIN_PORT = 8001

# ==========================================

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def kill_process_on_port(port):
    """Finds and forcefully kills the process listening on the specified port."""
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            for conn in proc.connections(kind='inet'):
                if conn.laddr.port == port:
                    print(f"⚠️ Port {port} is busy. Killing process {proc.info['name']} (PID: {proc.info['pid']})...")
                    proc.kill()
                    proc.wait(timeout=3)
                    print(f"✅ Killed PID {proc.info['pid']}.")
                    return
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            pass

def ensure_ports_are_free():
    for port in [FRONTEND_PORT, BACKEND_PORT, PYTHON_BRAIN_PORT]:
        if is_port_in_use(port):
            kill_process_on_port(port)

def start_servers():
    print(f"🚀 Starting Hybrid RAG System...")
    print(f"   - Frontend:    http://localhost:{FRONTEND_PORT}")
    print(f"   - Backend:     http://localhost:{BACKEND_PORT}")
    print(f"   - py Brain:http://localhost:{PYTHON_BRAIN_PORT}")
    print("--------------------------------------------------")

    processes = []

    # 1. Start py Brain
    print("⏳ Starting py RAG Brain...")
    py_env = os.environ.copy()
    py_proc = subprocess.Popen(
        [r".\py\venv\Scripts\py.exe", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", str(PYTHON_BRAIN_PORT)],
        cwd=r".\py",
        env=py_env
    )
    processes.append(py_proc)

    # 2. Start Backend (Auth/Proxy)
    print("⏳ Starting FastAPI Backend...")
    backend_env = os.environ.copy()
    # Force the backend to know where the py brain is
    backend_env["PYTHON_RAG_INTERNAL_URL"] = f"http://localhost:{PYTHON_BRAIN_PORT}/api/v1"
    backend_proc = subprocess.Popen(
        [r".\Backend\.venv\Scripts\py.exe", "run_server.py", str(BACKEND_PORT)],
        cwd=r".\Backend",
        env=backend_env
    )
    processes.append(backend_proc)

    # 3. Start Frontend
    print("⏳ Starting React Frontend...")
    frontend_env = os.environ.copy()
    # Force the frontend to point to the backend
    frontend_env["VITE_API_BASE_URL"] = f"http://localhost:{BACKEND_PORT}/api/v1"
    
    frontend_proc = subprocess.Popen(
        ["npm.cmd", "run", "dev", "--", "--port", str(FRONTEND_PORT)],
        cwd=r".\Frontend",
        env=frontend_env
    )
    processes.append(frontend_proc)

    return processes

if __name__ == "__main__":
    # Ensure psutil is installed for process management
    try:
        import psutil
    except ImportError:
        print("Missing required package 'psutil'. Installing it now...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psutil"])
        import psutil

    ensure_ports_are_free()
    time.sleep(1) # Brief pause to allow ports to fully release

    processes = []
    try:
        processes = start_servers()
        print("\n✅ All servers are running! Press Ctrl+C to safely shut down everything.\n")
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down all servers gracefully...")
        for p in processes:
            p.terminate()
        for p in processes:
            p.wait()
        print("Goodbye!")
