# 🐳 The Complete Docker Mastery Guide
## A Scenario-Based Learning Path from Installation to Advanced Concepts

---

# PART 1: INSTALLATION GUIDE

## 1.1 Windows Installation

### Prerequisites
- Windows 10/11 (64-bit)
- WSL2 enabled (Windows Subsystem for Linux)
- Virtualization enabled in BIOS

### Step-by-Step Commands

**Step 1: Enable WSL2**
```powershell
# Run as Administrator in PowerShell
wsl --install
```

**Output:**
```
Installing: Windows Subsystem for Linux
Ubuntu has been installed.
Launching Ubuntu...
```

**Further Use:** WSL2 provides a Linux kernel for Docker. You can also use it to run Linux distributions natively on Windows.

**Step 2: Download & Install Docker Desktop**
```powershell
# Download from https://docs.docker.com/desktop/install/windows-install/
# Or use winget
winget install Docker.DockerDesktop
```

**Output:**
```
Found Docker Desktop [Docker.DockerDesktop] Version 4.x.x
This application is licensed to you by its owner.
Successfully installed Docker Desktop
```

**Further Use:** Winget is Windows' native package manager. Use it to install and update software programmatically.

**Step 3: Verify Installation**
```powershell
docker --version
docker-compose --version
```

**Output:**
```
Docker version 24.0.7, build afdd53b
Docker Compose version v2.23.0
```

**Further Use:** Always verify versions after installation to ensure compatibility with tutorials and team environments.

---


# PART 2: DOCKER vs GITHUB — UNDERSTANDING THE DIFFERENCE

## 2.1 What Each Tool Does

| Aspect | Docker | GitHub |
|--------|--------|--------|
| **Primary Purpose** | Containerization & Runtime | Source Code Management & Collaboration |
| **What It Packages** | Applications + Dependencies + OS Layer | Source Code + Version History |
| **Runtime** | Yes — runs isolated containers | No — doesn't execute code |
| **Registry** | Docker Hub / Private Registries | GitHub itself is the host |
| **Key Concept** | Images → Containers | Repositories → Commits |
| **Collaboration** | Share images via registries | Share code via repositories |

## 2.2 The Analogy

> **Docker is like a shipping container** — it packages your app so it runs identically anywhere.
> **GitHub is like a blueprint archive** — it stores, versions, and collaborates on the plans to build things.

## 2.3 How They Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKFLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Write Code] ──► [Push to GitHub] ──► [CI/CD Pipeline]    │
│       │                                     │               │
│       │                                     ▼               │
│       │                            [Build Docker Image]      │
│       │                                     │               │
│       │                                     ▼               │
│       │                            [Push to Docker Hub]      │
│       │                                     │               │
│       │                                     ▼               │
│       └─────────────────────► [Deploy Container to Server]   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 2.4 Scenario: The Full DevOps Pipeline

**Step 1: Code lives on GitHub**
```bash
git clone https://github.com/yourorg/yourapp.git
cd yourapp
```

**Step 2: Docker packages the app**
```bash
docker build -t yourapp:v1.0 .
```

**Step 3: GitHub Actions (CI/CD) automates this**
```yaml
# .github/workflows/docker-build.yml
name: Build and Push Docker Image
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker Image
        run: docker build -t yourapp:${{ github.sha }} .
      - name: Push to Docker Hub
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push yourapp:${{ github.sha }}
```

**Output in GitHub Actions:**
```
Run docker build -t yourapp:abc123 .
#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 32B done
#1 DONE 0.0s
#2 [internal] load .dockerignore
#2 transferring context: 2B done
#2 DONE 0.0s
...
Successfully built a1b2c3d4
Successfully tagged yourapp:abc123
```

**Further Use:** This is the backbone of modern DevOps. Every code push triggers an automated build, test, and deploy pipeline.

---

# PART 3: DOCKER BASICS — SCENARIO-BASED LEARNING

---

## Scenario 1: Your First Container
**Goal:** Run a simple container to understand the basics.

### Command
```bash
docker run hello-world
```

### Output
```
Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from Docker Hub.
 3. The Docker daemon created a new container from that image.
 4. The Docker daemon streamed that output to the Docker client.

To try something more ambitious, you can run an Ubuntu container:
 $ docker run -it ubuntu bash
```

### Further Use
- Use `docker run` for any one-off container execution
- The image is pulled automatically if not present locally
- Use `docker run --rm` to auto-delete the container after exit

---

## Scenario 2: Running an Interactive Ubuntu Shell
**Goal:** Get inside a Linux container and explore.

### Command
```bash
docker run -it ubuntu:22.04 bash
```

### Output
```
Unable to find image 'ubuntu:22.04' locally
22.04: Pulling from library/ubuntu
Digest: sha256:abcdef123456...
Status: Downloaded newer image for ubuntu:22.04
root@a1b2c3d4e5f6:/# 
```

**Inside the container:**
```bash
root@a1b2c3d4e5f6:/# cat /etc/os-release
```

**Output:**
```
PRETTY_NAME="Ubuntu 22.04.3 LTS"
NAME="Ubuntu"
VERSION_ID="22.04"
```

```bash
root@a1b2c3d4e5f6:/# exit
```

### Further Use
- `-i` = interactive (keep STDIN open)
- `-t` = allocate a pseudo-TTY (terminal)
- Use this to test commands in a clean environment before adding them to Dockerfiles
- Perfect for debugging: `docker run -it --entrypoint bash <image>`

---

## Scenario 3: Running a Web Server (Nginx)
**Goal:** Run a web server and access it from your browser.

### Command
```bash
docker run -d -p 8080:80 --name my-nginx nginx:latest
```

### Output
```
Unable to find image 'nginx:latest' locally
latest: Pulling from library/nginx
a2abf6c4d29d: Pull complete
a9edb18cadd1: Pull complete
...
Status: Downloaded newer image for nginx:latest
f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
```

### Verify It's Running
```bash
docker ps
```

**Output:**
```
CONTAINER ID   IMAGE          COMMAND                  CREATED          STATUS          PORTS                  NAMES
f8a9b2c3d4e5   nginx:latest   "/docker-entrypoint.…"   10 seconds ago   Up 9 seconds    0.0.0.0:8080->80/tcp   my-nginx
```

### Test in Browser
Visit: `http://localhost:8080`

**You see:** "Welcome to nginx!"

### Further Use
- `-d` = detached mode (runs in background)
- `-p 8080:80` = maps host port 8080 to container port 80
- `--name` = gives the container a readable name
- Use `docker logs my-nginx` to see server logs
- Use `docker stop my-nginx && docker rm my-nginx` to clean up

---

## Scenario 4: Inspecting and Managing Containers
**Goal:** Learn to list, inspect, and clean up containers.

### Command — List Running Containers
```bash
docker ps
```

### Output
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
# (empty if no containers running)
```

### Command — List ALL Containers (including stopped)
```bash
docker ps -a
```

### Output
```
CONTAINER ID   IMAGE           COMMAND       CREATED       STATUS                     PORTS     NAMES
f8a9b2c3d4e5   nginx:latest    "/docker..."  2 hours ago   Exited (0) 30 minutes ago            my-nginx
a1b2c3d4e5f6   ubuntu:22.04    "bash"        3 hours ago   Exited (0) 2 hours ago               jolly_curie
```

### Command — Inspect Container Details
```bash
docker inspect my-nginx
```

### Output (truncated)
```json
[
    {
        "Id": "f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0...",
        "Created": "2024-01-15T10:30:00.123456789Z",
        "State": {
            "Status": "running",
            "Running": true,
            "StartedAt": "2024-01-15T10:30:05.123456789Z"
        },
        "NetworkSettings": {
            "IPAddress": "172.17.0.2",
            "Ports": {
                "80/tcp": [
                    {
                        "HostIp": "0.0.0.0",
                        "HostPort": "8080"
                    }
                ]
            }
        }
    }
]
```

### Command — Clean Up Stopped Containers
```bash
docker container prune
```

### Output
```
WARNING! This will remove all stopped containers.
Are you sure you want to continue? [y/N] y
Deleted Containers:
f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0

Total reclaimed space: 1.23MB
```

### Further Use
- `docker ps -q` = list only container IDs (useful for scripting)
- `docker inspect --format='{{.NetworkSettings.IPAddress}}' my-nginx` = extract specific fields
- `docker container prune -f` = force delete without confirmation
- Set up cron jobs to prune old containers in production

---

## Scenario 5: Building Your First Custom Image
**Goal:** Create a Docker image for a simple Python web app.

### Project Structure
```
my-python-app/
├── app.py
├── requirements.txt
└── Dockerfile
```

**app.py:**
```python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello from Docker!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**requirements.txt:**
```
flask==3.0.0
```

**Dockerfile:**
```dockerfile
# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first (for layer caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
```

### Command — Build the Image
```bash
cd my-python-app
docker build -t my-python-app:v1 .
```

### Output
```
[+] Building 15.2s (9/9) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 312B
 => [internal] load .dockerignore
 => => transferring context: 2B
 => [1/5] FROM docker.io/library/python:3.11-slim@sha256:...
 => [2/5] WORKDIR /app
 => [3/5] COPY requirements.txt .
 => [4/5] RUN pip install --no-cache-dir -r requirements.txt
 => [5/5] COPY app.py .
 => exporting to image
 => => exporting layers
 => => writing image sha256:abc123...
 => => naming to docker.io/library/my-python-app:v1
```

### Command — Run the Container
```bash
docker run -d -p 5000:5000 --name python-app my-python-app:v1
```

### Output
```
d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4
```

### Test
```bash
curl http://localhost:5000
```

**Output:**
```
Hello from Docker!
```

### Further Use
- The `.` at the end of `docker build` is the build context (current directory)
- Tag format: `name:tag`. Always version your images!
- Layer caching: If `requirements.txt` doesn't change, Docker skips `pip install` on rebuilds
- Use `docker build --no-cache` to force a fresh build

---

## Scenario 6: Working with Volumes (Persistent Data)
**Goal:** Understand container data persistence.

### Command — Without Volume (Data Lost on Remove)
```bash
docker run -it --name temp-data ubuntu:22.04 bash -c "echo 'important data' > /data.txt && cat /data.txt"
```

**Output:**
```
important data
```

```bash
docker rm temp-data
docker run -it ubuntu:22.04 cat /data.txt
```

**Output:**
```
cat: /data.txt: No such file or directory
```

### Command — With Named Volume
```bash
# Create a named volume
docker volume create my-data

# Run container with volume
docker run -it -v my-data:/data ubuntu:22.04 bash -c "echo 'persistent data' > /data/file.txt"

# Verify persistence
docker run -it -v my-data:/data ubuntu:22.04 cat /data/file.txt
```

### Output
```
persistent data
```

### Command — With Bind Mount (Host Directory)
```bash
# Create a directory on host
mkdir -p ~/docker-data

docker run -it -v ~/docker-data:/host-data ubuntu:22.04 bash -c "echo 'shared data' > /host-data/shared.txt"

# Check on host
cat ~/docker-data/shared.txt
```

### Output
```
shared data
```

### Further Use
- **Named volumes:** Managed by Docker, best for databases and persistent app data
- **Bind mounts:** Direct host filesystem access, best for development (live code reloading)
- **tmpfs mounts:** In-memory only, for sensitive data that shouldn't persist
- Use `docker volume ls` and `docker volume rm` to manage volumes

---

## Scenario 7: Docker Networking Basics
**Goal:** Connect multiple containers.

### Command — List Networks
```bash
docker network ls
```

### Output
```
NETWORK ID     NAME      DRIVER    SCOPE
abc123def456   bridge    bridge    local
789ghi012jkl   host      host      local
mno345pqr678   none      null      local
```

### Command — Create a Custom Network
```bash
docker network create my-network
```

### Output
```
9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9
```

### Command — Run Containers on Custom Network
```bash
# Run a database
docker run -d --name my-db --network my-network -e POSTGRES_PASSWORD=secret postgres:15

# Run an app that connects to the database
docker run -it --network my-network postgres:15 psql -h my-db -U postgres
```

### Output
```
Password for user postgres: 
# Enter 'secret'

psql (15.4)
Type "help" for help.

postgres=# \l
```

### Further Use
- Containers on the same custom network can communicate by container name (DNS resolution)
- The default `bridge` network doesn't support DNS-based container discovery
- Use `docker network inspect my-network` to see connected containers
- In production, use overlay networks for multi-host communication (Swarm/Kubernetes)

---

## Scenario 8: Docker Compose — Multi-Container Apps
**Goal:** Define and run multi-container applications.

### docker-compose.yml
```yaml
version: '3.8'

services:
  web:
    build: ./web
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://postgres:secret@db:5432/mydb
    networks:
      - app-network

  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=mydb
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
```

### Command — Start All Services
```bash
docker-compose up -d
```

### Output
```
[+] Running 3/3
 ✔ Network myapp_app-network    Created
 ✔ Volume "myapp_postgres-data"  Created
 ✔ Container myapp-db-1         Started
 ✔ Container myapp-web-1        Started
```

### Command — View Logs
```bash
docker-compose logs -f
```

### Output
```
myapp-web-1  |  * Running on all addresses (0.0.0.0)
myapp-web-1  |  * Running on http://127.0.0.1:5000
myapp-web-1  |  * Running on http://172.20.0.3:5000
myapp-db-1   | PostgreSQL init process complete; ready for start up.
myapp-db-1   | database system is ready to accept connections
```

### Command — Scale a Service
```bash
docker-compose up -d --scale web=3
```

### Output
```
[+] Running 5/5
 ✔ Container myapp-db-1     Running
 ✔ Container myapp-web-1    Running
 ✔ Container myapp-web-2    Started
 ✔ Container myapp-web-3    Started
```

### Command — Stop and Clean Up
```bash
docker-compose down -v
```

### Output
```
[+] Running 5/5
 ✔ Container myapp-web-3    Removed
 ✔ Container myapp-web-2    Removed
 ✔ Container myapp-web-1    Removed
 ✔ Container myapp-db-1     Removed
 ✔ Network myapp_app-network Removed
 ✔ Volume myapp_postgres-data Removed
```

### Further Use
- `docker-compose up --build` = rebuild images before starting
- `docker-compose exec web bash` = get a shell in a running service
- `docker-compose -f docker-compose.prod.yml up` = use different configs for different environments
- Docker Compose is now part of Docker CLI: use `docker compose` (space, not hyphen) in newer versions

---

# PART 4: DOCKER ADVANCED — SCENARIO-BASED DEEP DIVE

---

## Scenario 9: Multi-Stage Builds (Production Optimization)
**Goal:** Create tiny production images by separating build and runtime.

### The Problem
```bash
# Single-stage build (HUGE image)
docker build -t myapp-fat -f Dockerfile.fat .
docker images myapp-fat
```

**Output:**
```
REPOSITORY   TAG       SIZE
myapp-fat    latest    1.24GB
```

### The Solution — Multi-Stage Dockerfile
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Command
```bash
docker build -t myapp-lean -f Dockerfile.multistage .
docker images myapp-lean
```

### Output
```
REPOSITORY    TAG       SIZE
myapp-lean    latest    47.2MB
```

### Further Use
- Multi-stage builds can reduce image size by 90%+
- Use different base images per stage (e.g., `golang:1.21` for build, `distroless` or `alpine` for runtime)
- Only artifacts from `COPY --from` survive to the final image
- Critical for security: build tools, source code, and secrets don't end up in production

---

## Scenario 10: Health Checks
**Goal:** Ensure containers are actually healthy, not just running.

### Dockerfile with Health Check
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3   CMD curl -f http://localhost/ || exit 1
```

### Command
```bash
docker build -t healthy-nginx .
docker run -d --name health-test -p 8080:80 healthy-nginx

# Wait 30 seconds, then check
```

### Command — Check Health Status
```bash
docker ps
```

### Output
```
CONTAINER ID   IMAGE            COMMAND                  STATUS                   PORTS                  NAMES
a1b2c3d4e5f6   healthy-nginx    "/docker-entrypoint.…"   Up 2 minutes (healthy)   0.0.0.0:8080->80/tcp   health-test
```

### Command — Simulate Failure
```bash
# Enter container and break nginx
docker exec health-test rm /usr/share/nginx/html/index.html

# Wait for health check to fail
docker ps
```

### Output (after failure)
```
CONTAINER ID   IMAGE            COMMAND                  STATUS                     PORTS                  NAMES
a1b2c3d4e5f6   healthy-nginx    "/docker-entrypoint.…"   Up 5 minutes (unhealthy)   0.0.0.0:8080->80/tcp   health-test
```

### Further Use
- Orchestrators (Swarm/Kubernetes) use health checks to restart or reroute traffic from unhealthy containers
- `--interval` = how often to check
- `--start-period` = grace period before first check (for slow-starting apps)
- Custom health checks can check database connectivity, API endpoints, etc.

---

## Scenario 11: Resource Limits
**Goal:** Prevent a container from consuming all host resources.

### Command — Run with Memory and CPU Limits
```bash
docker run -d   --name limited-app   --memory="512m"   --memory-swap="1g"   --cpus="1.5"   --pids-limit=100   nginx
```

### Output
```
b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d
```

### Command — Verify Limits
```bash
docker inspect limited-app --format='{{.HostConfig.Memory}} {{.HostConfig.CpuQuota}}'
```

### Output
```
536870912 150000
```

(536870912 bytes = 512MB, 150000 = 1.5 CPUs)

### Further Use
- `--memory` = hard limit. The kernel will OOM-kill the container if exceeded
- `--memory-swap` = total memory + swap. Set equal to `--memory` to disable swap
- `--cpus` = limit CPU cores. Use `--cpu-shares` for relative priority
- `--pids-limit` = prevents fork bombs
- Critical for multi-tenant environments and preventing noisy neighbors

---

## Scenario 12: Dockerignore Optimization
**Goal:** Exclude unnecessary files from the build context.

### The Problem
```bash
docker build -t big-image .
```

**Output:**
```
[+] Building 120.5s (8/8) FINISHED
 => => transferring context: 2.34GB
```

### The Solution — .dockerignore
```
# .dockerignore
node_modules
*.log
.git
.gitignore
.env
.env.local
.env.*.local
coverage
.nyc_output
dist
build
*.md
.DS_Store
.vscode
.idea
docker-compose*.yml
Dockerfile*
```

### Command — Rebuild
```bash
docker build -t small-image .
```

### Output
```
[+] Building 5.2s (8/8) FINISHED
 => => transferring context: 15.4MB
```

### Further Use
- `.dockerignore` works like `.gitignore` but for the Docker build context
- Excluding `node_modules` is crucial—let the container rebuild dependencies
- Never include `.env` files with secrets—use runtime environment variables instead
- Smaller build context = faster builds, less bandwidth, happier CI/CD pipelines

---

## Scenario 13: Debugging Running Containers
**Goal:** Troubleshoot issues inside running containers.

### Command — View Logs
```bash
docker logs -f --tail 100 my-app
```

### Output
```
2024-01-15 10:00:01 ERROR: Connection refused to database at db:5432
2024-01-15 10:00:02 INFO: Retrying connection (attempt 2/5)...
2024-01-15 10:00:04 ERROR: Connection refused to database at db:5432
```

### Command — Execute Commands Inside Container
```bash
# Get a shell
docker exec -it my-app bash

# Or run a specific command
docker exec my-app ps aux
```

### Output
```
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  18508  3200 ?        Ss   10:00   0:00 python app.py
root        15  0.0  0.0   7652  2800 ?        R+   10:05   0:00 ps aux
```

### Command — Copy Files In/Out
```bash
# Copy from container to host
docker cp my-app:/app/logs/error.log ./error.log

# Copy from host to container
docker cp ./fix.py my-app:/app/fix.py
```

### Output
```
# No output on success
```

### Command — Inspect Container Stats
```bash
docker stats my-app --no-stream
```

### Output
```
CONTAINER ID   NAME     CPU %   MEM USAGE / LIMIT   MEM %   NET I/O          BLOCK I/O        PIDS
a1b2c3d4e5f6   my-app   0.15%   45.2MiB / 512MiB    8.83%   1.23kB / 456B    2.34MB / 12.3kB  5
```

### Further Use
- `docker logs -f` = follow mode (like `tail -f`)
- `docker exec` requires the container to be running. For stopped containers, use `docker commit` + `docker run` or debug via sidecar
- `docker stats` is great for identifying resource leaks
- Use `docker top my-app` to see host-level processes

---

## Scenario 14: Layer Caching Strategies
**Goal:** Optimize build times by understanding layer caching.

### Dockerfile (Cache-Friendly)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Layer 1: Copy only requirements first (rarely changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Layer 2: Copy source code (changes frequently)
COPY src/ ./src/

# Layer 3: Set environment (never changes)
ENV PYTHONUNBUFFERED=1

CMD ["python", "src/app.py"]
```

### Command — First Build
```bash
docker build -t cached-app .
```

### Output
```
[+] Building 45.2s (8/8) FINISHED
 => [3/5] COPY requirements.txt .                    0.1s
 => [4/5] RUN pip install --no-cache-dir -r req...  42.0s
 => [5/5] COPY src/ ./src/                           0.5s
```

### Command — Rebuild After Code Change (requirements.txt unchanged)
```bash
# Edit src/app.py, then rebuild
docker build -t cached-app .
```

### Output
```
[+] Building 2.1s (8/8) FINISHED
 => [3/5] COPY requirements.txt .                    0.0s  (cached)
 => [4/5] RUN pip install --no-cache-dir -r req...   0.0s  (cached)
 => [5/5] COPY src/ ./src/                           0.5s
```

### Further Use
- Order Dockerfile instructions from least-changing to most-changing
- `RUN` layers are cached if the command string hasn't changed
- Use BuildKit for advanced caching: `DOCKER_BUILDKIT=1 docker build ...`
- Remote cache with `--cache-from` for CI/CD pipelines
- A single changed line invalidates all subsequent layer caches

---

## Scenario 15: Docker Security — Running as Non-Root
**Goal:** Follow security best practices.

### Dockerfile (Secure)
```dockerfile
FROM python:3.11-slim

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

# Change ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 5000
CMD ["python", "src/app.py"]
```

### Command
```bash
docker build -t secure-app .
docker run -d --name secure-container -p 5000:5000 secure-app
```

### Command — Verify Non-Root Execution
```bash
docker exec secure-container ps aux
```

### Output
```
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
appuser      1  0.0  0.1  18508  3200 ?        Ss   10:00   0:00 python src/app.py
```

### Further Use
- Running as root in containers is a major security risk—if compromised, the attacker has root on the host
- Use `USER` instruction or `--user` flag
- Read-only root filesystem: `docker run --read-only ...`
- Drop capabilities: `docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE ...`
- Use distroless images (e.g., `gcr.io/distroless/python3`) for minimal attack surface

---

## Scenario 16: Docker Swarm — Container Orchestration
**Goal:** Deploy services across multiple nodes.

### Command — Initialize Swarm
```bash
docker swarm init --advertise-addr 192.168.1.100
```

### Output
```
Swarm initialized: current node (abc123def456) is now a manager.

To add a worker to this swarm, run:
  docker swarm join --token SWMTKN-1-xxx... 192.168.1.100:2377

To add a manager to this swarm, run:
  docker swarm join --token SWMTKN-1-yyy... 192.168.1.100:2377
```

### Command — Deploy a Service
```bash
docker service create   --name web-api   --replicas 3   --publish 8080:80   --limit-memory 512m   --limit-cpus 1   nginx:alpine
```

### Output
```
p4o5m6n7l8k9j0i1h2g3f4e5d6c7b8a9
overall progress: 3 out of 3 tasks
1/3: running   [==================================================>]
2/3: running   [==================================================>]
3/3: running   [==================================================>]
verify: Service converged
```

### Command — Scale the Service
```bash
docker service scale web-api=5
```

### Output
```
web-api scaled to 5
overall progress: 5 out of 5 tasks
1/5: running   [==================================================>]
2/5: running   [==================================================>]
3/5: running   [==================================================>]
4/5: running   [==================================================>]
5/5: running   [==================================================>]
verify: Service converged
```

### Command — Rolling Update
```bash
docker service update --image nginx:1.25 web-api
```

### Output
```
web-api
overall progress: 5 out of 5 tasks
1/5: running   [==================================================>]
2/5: running   [==================================================>]
3/5: running   [==================================================>]
4/5: running   [==================================================>]
5/5: running   [==================================================>]
verify: Service converged
```

### Further Use
- Swarm is Docker's native orchestrator—simpler than Kubernetes
- Built-in load balancing across replicas
- Rolling updates with zero downtime
- Use `docker stack deploy -c docker-compose.yml mystack` for declarative deployment
- For large-scale production, consider Kubernetes instead

---

## Scenario 17: Docker BuildKit Advanced Features
**Goal:** Use modern build features.

### Command — Enable BuildKit
```bash
export DOCKER_BUILDKIT=1
```

### Dockerfile with Secrets (Don't bake secrets into images)
```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/

# Mount secret at build time (not in final image!)
RUN --mount=type=secret,id=api_key,target=/run/secrets/api_key     API_KEY=$(cat /run/secrets/api_key) python src/configure.py

CMD ["python", "src/app.py"]
```

### Command — Build with Secret
```bash
docker build --secret id=api_key,src=./api_key.txt -t secret-app .
```

### Output
```
[+] Building 12.3s (10/10) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 412B
 => [5/6] RUN --mount=type=secret,id=api_key,target=/run/secrets/api_key API_KEY=$(cat /run/secrets/api_key) python src/configure.py
```

### Further Use
- BuildKit enables parallel builds, better caching, and advanced features
- Secrets are mounted temporarily during build—not present in final image
- SSH forwarding: `--ssh default` for private repo access during build
- Cache mounts: `--mount=type=cache,target=/root/.cache/pip` for faster dependency installs
- Enable permanently: add `"buildkit": true` to `/etc/docker/daemon.json`

---

## Scenario 18: Image Scanning for Vulnerabilities
**Goal:** Identify security issues in your images.

### Command — Scan with Docker Scout (built-in)
```bash
docker scout quickview my-python-app:v1
```

### Output
```
    ✓ SBOM of image already cached, 47 packages indexed
    ✗ Detected 2 vulnerable packages with a total of 5 vulnerabilities

          Name              Version    Type        Vulnerabilities          
    ───────────────────────────────────────────────────────────────────────
    setuptools            65.5.0     Python            1C     0H     0M     1L
    pip                   23.0.1     Python            0C     1H     2M     0L
```

### Command — Detailed CVE Report
```bash
docker scout cves my-python-app:v1
```

### Output
```
    ✓ SBOM of image already cached, 47 packages indexed

## Overview

   │                  Analyzed Image                    
   ─────────────────────────────────────────────────────
   │  my-python-app:v1                                  
   │    └── linux/amd64                                 

## Packages and Vulnerabilities

   2C    1H    2M    1L  setuptools 65.5.0
         CVE-2022-40897 (low)
         ...
```

### Further Use
- Run scans in CI/CD before pushing to registry
- Use `docker scout recommendations my-image` for fix suggestions
- Alternative tools: Trivy, Snyk, Clair
- Regularly rebuild images to pull in security patches from base images

---

## Scenario 19: Docker Contexts (Remote Docker Hosts)
**Goal:** Manage multiple Docker environments.

### Command — List Contexts
```bash
docker context ls
```

### Output
```
NAME        DESCRIPTION                               DOCKER ENDPOINT                ERROR
default *   Current DOCKER_HOST based configuration   unix:///var/run/docker.sock
```

### Command — Create Remote Context
```bash
docker context create production   --docker "host=ssh://user@production-server.com"
```

### Output
```
production
Successfully created context "production"
```

### Command — Switch Context
```bash
docker context use production
docker ps
```

### Output
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
# Shows containers on production server!
```

### Further Use
- Switch between local, staging, and production Docker hosts seamlessly
- Use SSH for secure remote access without exposing Docker TCP port
- Combine with `docker-compose` for remote multi-container deployments
- Team members can share context configurations

---

## Scenario 20: Cleanup and Maintenance
**Goal:** Keep your Docker environment clean.

### Command — System-Wide Cleanup
```bash
docker system df
```

### Output
```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          15        5         4.234GB   2.891GB (68%)
Containers      8         3         234.5MB   123.4MB (53%)
Local Volumes   12        4         1.234GB   890.1MB (72%)
Build Cache     45        0         567.8MB   567.8MB (100%)
```

### Command — Prune Everything
```bash
docker system prune -a --volumes
```

### Output
```
WARNING! This will remove:
  - all stopped containers
  - all networks not used by at least one container
  - all volumes not used by at least one container
  - all images without at least one container associated
  - all build cache

Are you sure you want to continue? [y/N] y

Deleted Containers:
a1b2c3d4e5f6...

Deleted Images:
untagged: nginx:latest
untagged: ubuntu:22.04
...

Deleted Networks:
my-old-network

Deleted Volumes:
my-old-volume

Total reclaimed space: 3.45GB
```

### Further Use
- Run `docker system prune` weekly on development machines
- In CI/CD, prune after builds to prevent disk space issues
- `docker image prune` = only unused images
- `docker volume prune` = only unused volumes
- `docker builder prune` = only build cache
- Set up automated cleanup with cron: `0 2 * * * docker system prune -f`

---

# PART 5: QUICK REFERENCE CHEAT SHEET

## Essential Commands

| Task | Command |
|------|---------|
| Run container | `docker run -d -p 8080:80 --name web nginx` |
| List running | `docker ps` |
| List all | `docker ps -a` |
| Stop container | `docker stop web` |
| Remove container | `docker rm web` |
| Remove force | `docker rm -f web` |
| List images | `docker images` |
| Remove image | `docker rmi nginx` |
| Build image | `docker build -t myapp:v1 .` |
| View logs | `docker logs -f web` |
| Execute shell | `docker exec -it web bash` |
| Copy files | `docker cp web:/file.txt ./file.txt` |
| Inspect | `docker inspect web` |
| Stats | `docker stats web` |
| Networks | `docker network ls` |
| Volumes | `docker volume ls` |
| System cleanup | `docker system prune -a` |

## Dockerfile Instructions

| Instruction | Purpose |
|-------------|---------|
| `FROM` | Base image |
| `RUN` | Execute command |
| `COPY` | Copy files from host |
| `ADD` | Copy + extract URLs |
| `WORKDIR` | Set working directory |
| `ENV` | Environment variables |
| `EXPOSE` | Document ports |
| `CMD` | Default command |
| `ENTRYPOINT` | Fixed command |
| `VOLUME` | Mount point |
| `USER` | Run as user |
| `HEALTHCHECK` | Health monitoring |
| `ARG` | Build-time variables |
| `LABEL` | Metadata |

## Docker Compose Commands

| Task | Command |
|------|---------|
| Start services | `docker-compose up -d` |
| Stop services | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Rebuild | `docker-compose up -d --build` |
| Scale service | `docker-compose up -d --scale web=3` |
| Run command | `docker-compose exec web bash` |
| Full cleanup | `docker-compose down -v` |

---

# CONCLUSION

## Learning Path Summary

```
Week 1: Installation + Basics
├── Install Docker
├── Run hello-world
├── Build simple images
└── Understand containers vs images

Week 2: Core Concepts
├── Volumes & persistence
├── Networking
├── Docker Compose
└── Write Dockerfiles

Week 3: Advanced Topics
├── Multi-stage builds
├── Health checks
├── Resource limits
└── Security best practices

Week 4: Production & Operations
├── Swarm/Kubernetes intro
├── Image scanning
├── CI/CD integration
└── Monitoring & logging
```

## Key Principles to Remember

1. **Containers are ephemeral** — design for statelessness; use volumes for persistence
2. **One process per container** — don't treat containers like VMs
3. **Images are immutable** — never modify running containers; rebuild images instead
4. **Layer caching matters** — order Dockerfile instructions wisely
5. **Security is not optional** — run as non-root, scan images, limit resources
6. **Docker + GitHub = DevOps** — version your code, containerize your apps, automate everything

---

> *"Docker doesn't just solve the 'it works on my machine' problem — it eliminates the concept of 'my machine' entirely."*
