NodeJS Setup mentioned in AI_Engineering folder ---> https://github.com/ParthanahalliRehaan/3_AI_Engineering
Git ---> https://github.com/ParthanahalliRehaan/1_GitHub_Guide
Oracle --->https://github.com/RehaanParthanahlli/College in 2/0_DBMS

# Docker (https://docs.docker.com/get-started/)
    - With diff methodologies followed on Docker, one can reduce their latency!
## 0 Understanding Basic Docker with npm analogy!
🟢 **npm install analogy**  
- When you run `npm install`, you’re telling Node to fetch all the dependencies your app needs, so it runs consistently across machines.  
- Docker does something similar, but instead of just libraries, it can define the **whole runtime environment**: operating system, language runtime, libraries, configs, and even how services connect.

📦 **Think of it this way**  
- `npm install` → sets up your app’s dependencies.  
- `docker build` → sets up your app **and** the infrastructure it needs to run.  

So Docker is like an expanded package manager for environments. It ensures that when you “install” (or run) your app, you don’t just get the code dependencies, but also the exact system setup it requires — all reproducible and portable.

That’s why people say Docker lets you manage infrastructure like applications: you declare it in code, version it, and spin it up anywhere, just like you would with `npm install`.
## 1 Diff b/w x86_64 x64 ARM
### 🔑 What does **64‑bit processor** mean?
- A CPU has **registers** (tiny storage slots inside the processor).  
- In a **64‑bit CPU**, each register is **64 bits wide**.  
- That means each register (or “word”) can hold values up to \(2^{64}\) different combinations (~18 quintillion).  
- This is why 64‑bit CPUs can theoretically address far more memory than 32‑bit CPUs (\(2^{32}\) ≈ 4.29 billion → ~4 GB limit).

---

### 📏 Word size and operations
- **Word size** = the natural unit of data the CPU handles in one operation.  
- On a 64‑bit CPU, the word size is **64 bits**.  
- So yes: one register = one operand in an instruction, and each operand can be 64 bits long.  
- Example: a 32‑bit CPU can add two 32‑bit numbers in one step; a 64‑bit CPU can add two 64‑bit numbers in one step.

---

### ⚡ GHz and cores
- **GHz (gigahertz)** = clock speed → how many cycles per second the CPU executes.  
  - Example: 3 GHz = 3 billion cycles per second.  
  - Each cycle can execute one or more micro‑operations depending on CPU design.  
- **Cores** = independent processing units inside the CPU.  
  - A **16‑core CPU** means 16 separate cores, each capable of running instructions in parallel.  
  - So a 16‑core, 3 GHz CPU can theoretically execute billions of instructions per second across 16 parallel lanes.

---

### 🖥️ Architectures
- **x64 (x86‑64 / AMD64)** → 64‑bit extension of Intel’s x86 architecture, pioneered by **AMD**, used in modern **Intel** and **AMD** CPUs.  
- **ARM64** → 64‑bit version of ARM architecture, used in **Apple M1/M2/M3**, **Qualcomm Snapdragon**, **AWS Graviton**.  
- Both are 64‑bit, but with different instruction sets.

---

### ✅ Final Takeaway
- **“64”** = CPU registers and word size are 64 bits wide → can represent \(2^{64}\) values.  
- **“x64”** = the specific 64‑bit Intel/AMD architecture (x86‑64 / AMD64).  
- **GHz** = speed of cycles per second.  
- **Cores** = number of independent processors inside the chip (e.g., 16 cores = 16 parallel workers).  
- One register = one operand, and in a 64‑bit CPU, that operand is 64 bits long.
- We cant define no. of registers based on, no. of bits of computer.
## 2 Why do we need WSL, before installing Docker?
**You don’t strictly need WSL before installing Docker on Windows, but in practice Docker Desktop uses WSL 2 as its default backend.** This is because WSL 2 provides a real Linux kernel inside Windows, which Docker relies on to run Linux containers efficiently. Without WSL 2, you’d have to use Hyper‑V, which is heavier and only available in certain Windows editions.  [Docker Documentation](https://docs.docker.com/desktop/setup/install/windows-install/)  [Docker Documentation](https://docs.docker.com/desktop/setup/install/windows-install.md)  [Docker Documentation](https://docs.docker.com/desktop/features/wsl/)

---

### 🔑 Why WSL 2 is needed
- **Docker runs Linux containers** → Containers are built for Linux, so Windows needs a Linux kernel to support them.  
- **WSL 2 provides that kernel** → Microsoft ships a lightweight Linux kernel with WSL 2, so Docker can run natively without a full VM.  
- **Default backend** → Docker Desktop defaults to WSL 2 for most users because it’s faster, lighter, and doesn’t require admin rights.  
- **Alternative backend** → Hyper‑V can be used instead, but only if you install Docker in “all‑users” mode and have Windows Pro/Enterprise editions.

---

### ⚡ Benefits of WSL 2 with Docker
- **Performance** → Faster startup and better file system sharing compared to Hyper‑V.  
- **Efficiency** → Dynamic memory allocation (Docker only uses what it needs).  
- **Convenience** → You can run Linux distributions side‑by‑side with Windows, making development smoother.  
- **Compatibility** → Works on Windows 10 (22H2+) and Windows 11 (23H2+).

---

### 🖥️ Installation Modes
| Mode            | Backend | Admin Rights | Notes |
|-----------------|---------|--------------|-------|
| **Per‑user (recommended)** | WSL 2 only | Not required | Default option, lighter, secure |
| **All‑users**   | WSL 2 or Hyper‑V | Required | Supports Windows containers, heavier setup |

---

### ✅ Final Takeaway
- **WSL 2 is the recommended and default way to run Docker Desktop on Windows.**  
- You don’t need to install WSL manually beforehand — Docker Desktop will prompt you to enable it during installation.  
- If you prefer not to use WSL 2, you can use Hyper‑V, but it’s less efficient and requires Windows Pro/Enterprise.  
## 3 Which Installing mode is suitable?
### 🖥️ Docker Desktop installation modes on Windows
- **Per‑user (recommended)**  
  - Installs Docker Desktop only for your Windows account.  
  - Uses **WSL 2** as the backend (no Hyper‑V).  
  - Doesn’t require admin rights.  
  - Lighter, more secure, and the default choice for most developers.  

- **All‑users**  
  - Installs Docker Desktop system‑wide for every account on the machine.  
  - Requires **administrator rights**.  
  - Can use either **WSL 2** or **Hyper‑V** as the backend.  
  - Heavier setup, mainly useful if multiple people share the same PC or if you specifically need Hyper‑V support (e.g., Windows containers).

---

### ✅ Which should you choose?
- If you’re just developing on your own machine → **Per‑user** is the best option.  
- If you’re setting up a shared workstation or need Hyper‑V → **All‑users**.  

---

👉 Final takeaway:  
You don’t need to install WSL manually before Docker — Docker Desktop will prompt you to enable WSL 2 if it’s missing. For most developers, **Per‑user mode with WSL 2** is the smoothest and most efficient setup.  
## 4 Finally after successful Installation, Read the beginners DOCs 15-30 Minutes!(Or Just read from docker_guide.md)
    - Keywords:
         - docker compose watch(Command similar to live server, or bundlers)
         - What is a Image repository(In what ways, Docker is similar to Git&GitHub)
         - What does container mean?

# Kubernetes(K3s Vs K8s)
**Kubernetes (often abbreviated as K8s) is free and open source. However, while the software itself costs nothing, running it in production involves infrastructure and operational expenses. K3s is a lightweight, certified Kubernetes distribution optimized for edge devices, IoT, and resource-constrained environments, whereas standard Kubernetes (K8s) is designed for large-scale enterprise clusters.**  [Kubernetes](https://kubernetes.io/?source=about_page-------------------------------------)  [toolradar.com](https://toolradar.com/tools/kubernetes/pricing)  [DoiT International](https://www.doit.com/blog/imported-k3s-vs-k8s)  [SUSE](https://www.suse.com/c/k3s-and-k8s-key-differences-and-use-cases-explained/)  [clever.cloud](https://www.clever.cloud/blog/features/2026/05/28/k3s-vs-k8s-what-are-the-differences-and-which-one-should-you-choose-in-2026/)

---

## 💡 Kubernetes (K8s) – Free but Not Costless
- **License:** Open source, CNCF-hosted, free to download and use.  [Kubernetes](https://kubernetes.io/docs/home/index.html)  
- **Hidden Costs:**  
  - Infrastructure (servers, cloud compute, storage, networking).  
  - Expertise (DevOps engineers, cluster management).  
  - Managed services (AWS EKS, Google GKE, Azure AKS) charge control plane fees (typically ~$73/month per cluster, though Azure AKS has a free tier).  [toolradar.com](https://toolradar.com/tools/kubernetes/pricing)  
- **Best Fit:** Enterprises with multiple microservices, compliance needs, or large-scale workloads.

---

## ⚖️ K8s vs K3s Comparison

| Feature | **K8s (Standard Kubernetes)** | **K3s (Lightweight Kubernetes)** |
|---------|-------------------------------|----------------------------------|
| **Purpose** | Enterprise-scale production clusters | Edge, IoT, labs, small-scale production |
| **Binary Size** | Multiple components (hundreds of MBs) | Single binary < 70 MB |
| **Resource Requirements** | ≥ 2 GB RAM per node | Runs on 512 MB RAM nodes |
| **Datastore** | etcd (distributed, high availability) | SQLite (single-node), embedded etcd for HA |
| **Installation Time** | Hours to days (complex setup) | Minutes (simplified setup) |
| **Bundled Components** | Must configure separately (CNI, ingress, runtime) | Includes Flannel (CNI), Traefik (ingress), containerd runtime |
| **ARM Support** | ARM64 supported | ARM64 + ARMv7 native |
| **Scalability** | Thousands of nodes | Up to ~1,200 agents in HA mode |
| **Operational Complexity** | High (requires dedicated platform team) | Low (simplified, fewer moving parts)  [DoiT International](https://www.doit.com/blog/imported-k3s-vs-k8s)  [SUSE](https://www.suse.com/c/k3s-and-k8s-key-differences-and-use-cases-explained/)  [clever.cloud](https://www.clever.cloud/blog/features/2026/05/28/k3s-vs-k8s-what-are-the-differences-and-which-one-should-you-choose-in-2026/) |

---

## ✅ Which Should You Use?
- **Choose K8s if:**  
  - You’re running **large-scale enterprise workloads**.  
  - You need **fine-grained control, resilience, and scalability**.  
  - You have a **dedicated DevOps team** to manage complexity.

- **Choose K3s if:**  
  - You’re deploying to **edge devices, IoT, or small clusters**.  
  - You want **fast setup and low resource consumption**.  
  - You’re experimenting, learning, or running lightweight production workloads.

---

## ⚠️ Key Trade-Offs
- **K8s:** More powerful but heavier; requires significant expertise and infrastructure.  
- **K3s:** Easier to run, but less suited for massive enterprise-scale clusters.  
- Both are **CNCF-certified**, meaning workloads are portable between them without modification.  [DoiT International](https://www.doit.com/blog/imported-k3s-vs-k8s)  

# Redis(Comforting knowledge!)
## 🔹 What is Redis?
- **Redis (Remote Dictionary Server)** is an open-source, in-memory key-value store.
- Primary uses:
  - **Database**: Stores structured/unstructured data.
  - **Cache**: Speeds up applications by reducing database load.
  - **Message broker**: Supports pub/sub messaging.

---

## 🔹 Do You Need Linux or WSL for Redis?
- **No, Redis does not strictly require Linux or WSL.**
- You can run Redis on **Windows 10/11** using:
  - **Docker Desktop** (recommended) → runs Redis inside a Linux-based container.
  - **Redis for Windows ports** (community builds, less reliable).
  - **Redis Cloud** → no local installation needed.
- **Why WSL comes up**:
  - Docker Desktop on Windows uses **WSL2** under the hood to provide a Linux kernel.
  - Redis itself is developed for Linux, so native support is strongest there.
  - Running Redis directly on Windows without WSL/Docker is possible but not officially supported.

👉 In short: **Redis can run on Windows via Docker Desktop (which uses WSL2 internally), but you don’t need to manually install WSL just for Redis unless you want a native Linux environment.**

---

## 🔹 Why Use a Container for Redis?
- **Isolation**: Keeps Redis separate from host OS.
- **Portability**: Same image runs anywhere.
- **Version control**: Easily switch Redis versions.
- **Cleanup**: Remove container without leftover files.
- **Consistency**: Matches production environments.

---

## 🔹 Installing Redis

### Option 1: Docker (Best for Windows)
```bash
# Pull Redis image
docker pull redis

# Run Redis container
docker run --name redis-server -d -p 6379:6379 redis
```
- Connect via `localhost:6379`.

### Option 2: Native Linux/macOS
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# macOS (Homebrew)
brew install redis
```

### Option 3: Redis Cloud
- Sign up at [Redis Cloud](https://redis.com/try-free/).
- Managed hosting, no local setup.

---

## 🖥️ Kubernetes (k3s/k3d) vs Windows

### 🔹 Why Kubernetes Needs WSL
- Kubernetes relies on **Linux kernel features**:
  - cgroups
  - namespaces
  - iptables networking
- Windows does not natively support these.
- **WSL2 provides a Linux kernel**, enabling k3s/k3d to run.

### 🔹 Difference from Redis
- Redis can run fine in a container on Windows (no manual WSL setup needed).
- Kubernetes **cannot** run natively on Windows → WSL2 is mandatory.

---

### ✅ Key Takeaways
- Redis: **No direct WSL requirement** → Docker Desktop handles it.  
- Kubernetes: **WSL2 required** → depends on Linux kernel features.  
- Containers simplify Redis installation and make it production-ready.  

