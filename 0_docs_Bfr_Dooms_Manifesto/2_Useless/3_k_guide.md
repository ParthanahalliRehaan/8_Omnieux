# ☸️ Kubernetes Mastery Guide: Basics to Intermediate
## A Scenario-Based Learning Path with Backend Engineering Principles

---

> **Engineering Principle:** Before you run a single `kubectl` command, understand this: Kubernetes is not a container runner — it's a **distributed state reconciliation engine**. You declare what you want; Kubernetes fights reality until it matches your declaration. This is the same mental model as Terraform, SQL, and GitOps.

---

# PART 1: INSTALLATION & CLUSTER SETUP

## 1.1 Understanding Your Options

| Tool | What It Runs | Best For | Resource Cost |
|------|-------------|----------|---------------|
| **k3s** | Lightweight K8s (~100MB binary) | Edge, IoT, learning, CI/CD | Low |
| **k3d** | k3s inside Docker containers | Fast local multi-node testing | Very Low |
| **minikube** | Full K8s in VM or Docker | Beginners, most tutorials | Medium |
| **kind** | K8s-in-Docker (official SIG) | CI/CD, conformance testing | Medium |
| **Docker Desktop K8s** | Single-node K8s toggle | Quick experiments | Low |

> **Why k3s?** It strips out legacy alpha features, replaces etcd with SQLite (or embedded etcd), and uses containerd directly. For learning, it's faster and leaner than full K8s.

---

## 1.2 Installing kubectl (Your Universal Remote)

```bash
# Linux
curl -LO "https://dl.k8s/release/$(curl -L -s https://dl.k8s/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# macOS
brew install kubectl

# Windows
winget install Kubernetes.kubectl
```

**Verify:**
```bash
kubectl version --client
```

**Output:**
```
Client Version: v1.32.0
Kustomize Version: v5.5.0
```

> **Backend Principle:** `kubectl` is just a REST client. It speaks to the Kubernetes API Server. Everything you do via `kubectl` can be done via raw HTTP calls to the API. Understanding this demystifies the magic.

---

## 1.3 Installing k3d (Recommended for Learning)

```bash
# Install k3d (wraps k3s in Docker)
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# Or via package manager
# brew install k3d
# winget install k3d

# Create a single-node cluster
k3d cluster create my-cluster

# Create a multi-node cluster (1 control plane + 2 workers)
k3d cluster create my-cluster --servers 1 --agents 2
```

**Output:**
```
INFO[0000] Prep: Network
INFO[0000] Created network 'k3d-my-cluster'
INFO[0000] Created image volume k3d-my-cluster-images
INFO[0001] Creating node 'k3d-my-cluster-server-0'
INFO[0007] Pulling image 'docker.io/rancher/k3s:v1.32.0-k3s1'
INFO[0015] Creating LoadBalancer 'k3d-my-cluster-serverlb'
INFO[0016] Using the k3d-tools node to gather environment information
INFO[0017] Starting new tools node...
INFO[0023] Creating node 'k3d-my-cluster-agent-0'
INFO[0023] Creating node 'k3d-my-cluster-agent-1'
INFO[0028] Cluster 'my-cluster' created successfully!
```

**Verify:**
```bash
kubectl cluster-info
kubectl get nodes
```

**Output:**
```
Kubernetes control plane is running at https://0.0.0.0:6443
CoreDNS is running at https://0.0.0.0:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

NAME                       STATUS   ROLES                  AGE   VERSION
k3d-my-cluster-agent-0   Ready    <none>                 2m    v1.32.0+k3s1
k3d-my-cluster-agent-1   Ready    <none>                 2m    v1.32.0+k3s1
k3d-my-cluster-server-0  Ready    control-plane,master   2m    v1.32.0+k3s1
```

> **Backend Principle:** k3d creates Docker containers that act as K8s nodes. The "server" container runs the control plane (API Server, Scheduler, Controller Manager). The "agent" containers run your workloads. This is identical to how managed cloud clusters work — just at a smaller scale.

### k3d Cluster Management
```bash
k3d cluster list          # List clusters
k3d cluster stop my-cluster
k3d cluster start my-cluster
k3d cluster delete my-cluster
```

---

## 1.4 Alternative: minikube Setup

```bash
# Install
brew install minikube          # macOS
winget install Kubernetes.minikube  # Windows

# Start with Docker driver
minikube start --driver=docker --nodes=1

# Or multi-node
minikube start --driver=docker --nodes=3

# Dashboard
minikube dashboard
```

> **When to choose minikube over k3d?** minikube has better addon support (Ingress, metrics-server, registry) and more tutorials exist for it. k3d is faster and closer to production K3s deployments.

---

# PART 2: CORE CONCEPTS — THE KUBERNETES OBJECT MODEL

## 2.1 The Request Walkthrough: What Happens When You Run `kubectl apply`?

```
You (kubectl)
    │
    ▼ HTTP/HTTPS
┌──────────────┐
│  API Server  │  ← Validates your YAML, writes to etcd
│  (kube-apiserver)│
└──────────────┘
    │
    ▼ Watch stream
┌──────────────┐
│ Controllers  │  ← Notices desired state ≠ actual state
│ (Deployment  │  ← Creates/updates ReplicaSet
│  Controller) │
└──────────────┘
    │
    ▼
┌──────────────┐
│   Scheduler  │  ← Decides which node gets the pod
│ (kube-scheduler)│
└──────────────┘
    │
    ▼
┌──────────────┐
│    kubelet   │  ← On the target node, pulls image, starts container
│  (Node Agent)│
└──────────────┘
    │
    ▼
┌──────────────┐
│  containerd  │  ← Actually runs the container
│  (CRI Runtime)│
└──────────────┘
```

> **Backend Principle:** This is a classic **control loop** architecture. The API Server is your event store. Controllers are your async workers. The Scheduler is your load balancer. kubelet is your node agent. Every enterprise system you've built has these same components — K8s just names them explicitly.

---

## 2.2 The Four Core Objects You Must Master

| Object | Purpose | Mental Model |
|--------|---------|-------------|
| **Pod** | Smallest deployable unit | A process wrapper (not a VM!) |
| **Deployment** | Manages Pod lifecycle | "Ensure 3 replicas exist" |
| **Service** | Stable networking | Load balancer + DNS record |
| **Namespace** | Resource isolation | Virtual cluster boundary |

---

# PART 3: SCENARIO-BASED LEARNING

---

## Scenario 1: Your First Pod — Understanding the Atomic Unit

**Goal:** Deploy a single Pod and understand why it's ephemeral.

### Imperative (Quick Test)
```bash
kubectl run nginx --image=nginx:alpine --port=80
```

**Output:**
```
pod/nginx created
```

### Verify
```bash
kubectl get pods
kubectl describe pod nginx
```

**Output:**
```
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          10s

Name:             nginx
Namespace:        default
Node:             k3d-my-cluster-agent-0/172.18.0.3
Start Time:       Mon, 28 Jul 2026 10:00:00 +0530
Labels:           run=nginx
Status:           Running
IP:               10.42.1.3
Containers:
  nginx:
    Image:          nginx:alpine
    Port:           80/TCP
    State:          Running
    Ready:          True
```

### Access It
```bash
# Port-forward from your machine to the pod
kubectl port-forward pod/nginx 8080:80

# In another terminal
curl http://localhost:8080
```

### Now Break It (Intentionally)
```bash
# Delete the pod
kubectl delete pod nginx

# Try to access again — it fails!
curl http://localhost:8080
# curl: (7) Failed to connect
```

> **Backend Principle:** **This is the most important lesson in Kubernetes.** A Pod is ephemeral. Its IP (`10.42.1.3`) died with it. If you build systems that depend on specific pod IPs, you will fail. This is why we have Services.

### Clean Up
```bash
kubectl delete pod nginx
```

---

## Scenario 2: Declarative Pod with YAML — The GitOps Mindset

**Goal:** Learn to write YAML manifests and understand the declarative model.

### pod.yaml
```yaml
apiVersion: v1              # API version for this resource type
kind: Pod                   # What we're creating
metadata:
  name: my-app-pod
  labels:                   # Key-value pairs used for selection
    app: my-app
    tier: frontend
spec:
  containers:
  - name: app
    image: nginx:alpine
    ports:
    - containerPort: 80
    env:
    - name: ENVIRONMENT
      value: "development"
    resources:
      requests:             # Guaranteed resources for scheduling
        memory: "64Mi"
        cpu: "100m"         # 100 millicores = 0.1 CPU
      limits:               # Hard ceiling — OOMKill if exceeded
        memory: "128Mi"
        cpu: "200m"
```

### Command
```bash
kubectl apply -f pod.yaml
```

**Output:**
```
pod/my-app-pod created
```

### Verify
```bash
kubectl get pod my-app-pod -o yaml    # Full YAML output
kubectl get pod my-app-pod -o json    # JSON output
kubectl get pod my-app-pod -o wide    # Wide table with node info
```

### The Idempotency Test
```bash
kubectl apply -f pod.yaml   # Run again
kubectl apply -f pod.yaml   # And again
# Output: pod/my-app-pod unchanged
```

> **Backend Principle:** `kubectl apply` is **idempotent**. It computes a diff between your YAML and the live object, then patches only what changed. This is the foundation of GitOps: your Git repo holds the desired state; CI/CD runs `kubectl apply`; the cluster converges.

### Further Use
- `kubectl create -f` = imperative, fails if exists
- `kubectl apply -f` = declarative, patches if exists — **always prefer this**
- Labels are the **primary indexing mechanism** in K8s. Services, Deployments, NetworkPolicies — all select pods by labels.

---

## Scenario 3: Deployments — Self-Healing, Scaling, and Rolling Updates

**Goal:** Deploy an app that survives failures and updates without downtime.

### Why Deployments?

| Capability | Pod Alone | Deployment |
|-----------|-----------|------------|
| Self-healing | ❌ Pod dies = stays dead | ✅ ReplicaSet recreates it |
| Scaling | Manual | `kubectl scale` or HPA |
| Rolling updates | ❌ Downtime | ✅ Zero-downtime replacement |
| Rollback | ❌ | ✅ `kubectl rollout undo` |

### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web          # Must match template.labels
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1       # Max pods above desired during update
      maxUnavailable: 0 # Never drop below desired count
  template:
    metadata:
      labels:
        app: web          # These labels MUST match selector
    spec:
      containers:
      - name: web
        image: nginx:1.24-alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
```

### Command
```bash
kubectl apply -f deployment.yaml
```

### Verify
```bash
kubectl get deployments
kubectl get pods -l app=web
kubectl get replicasets
```

**Output:**
```
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
web-app   3/3     3            3           30s

NAME                       READY   STATUS    RESTARTS   AGE
web-app-7c4b8d9f4f-abc12  1/1     Running   0          30s
web-app-7c4b8d9f4f-def34  1/1     Running   0          30s
web-app-7c4b8d9f4f-ghi56  1/1     Running   0          30s

NAME                  DESIRED   CURRENT   READY   AGE
web-app-7c4b8d9f4f    3         3         3       30s
```

### Test Self-Healing (The Debug Mindset)
```bash
# Pick a pod and kill it
kubectl delete pod web-app-7c4b8d9f4f-abc12

# Watch the magic
kubectl get pods -l app=web -w
```

**Output:**
```
NAME                       READY   STATUS        RESTARTS   AGE
web-app-7c4b8d9f4f-abc12  1/1     Terminating   0          2m
web-app-7c4b8d9f4f-jkl78  0/1     Pending       0          0s
web-app-7c4b8d9f4f-jkl78  0/1     ContainerCreating   0    2s
web-app-7c4b8d9f4f-jkl78  1/1     Running       0          5s
```

> **Backend Principle:** Notice the ReplicaSet hash (`7c4b8d9f4f`) in the pod name. The Deployment creates a ReplicaSet. The ReplicaSet ensures the desired count of pods exists. The Deployment manages ReplicaSet revisions for rollouts. This is a **controller-of-controllers** pattern — common in distributed systems.

### Scale It
```bash
kubectl scale deployment web-app --replicas=5
kubectl get pods -l app=web
```

### Rolling Update (Zero-Downtime Deployment)
```bash
kubectl set image deployment/web-app web=nginx:1.25-alpine
kubectl rollout status deployment/web-app
```

**Output:**
```
Waiting for deployment "web-app" rollout to finish: 1 out of 3 new replicas have been updated...
Waiting for deployment "web-app" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "web-app" rollout to finish: 3 of 3 updated replicas are available...
deployment "web-app" successfully rolled out
```

### Rollback (When You Break Production)
```bash
kubectl rollout history deployment/web-app
kubectl rollout undo deployment/web-app
# Or rollback to specific revision
kubectl rollout undo deployment/web-app --to-revision=2
```

### Observability: What's Happening Under the Hood?
```bash
# Watch the Deployment's events
kubectl describe deployment web-app

# Check ReplicaSet revisions
kubectl get rs -l app=web

# Check rollout history
kubectl rollout history deployment/web-app
```

> **Backend Principle:** The Deployment's `strategy` field controls the rollout behavior. `maxSurge: 1` means "create 1 new pod before deleting an old one." `maxUnavailable: 0` means "never have fewer than 3 available pods." This is your **availability contract** during updates.

---

## Scenario 4: Services — Stable Networking in an Ephemeral World

**Goal:** Give your pods a stable IP and DNS name that survives pod restarts.

### The Problem
Pods die and get new IPs. You can't hardcode `10.42.1.3` in your frontend config.

### The Solution
A **Service** provides a stable ClusterIP and DNS name. It maintains an **Endpoints** object that tracks which pod IPs are currently healthy.

### service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web          # Selects pods with label app=web
  ports:
  - protocol: TCP
    port: 80          # Service port (what clients use)
    targetPort: 80    # Container port (where traffic lands)
  type: ClusterIP     # Internal cluster IP only
```

### Command
```bash
kubectl apply -f service.yaml
```

### Verify
```bash
kubectl get svc web-service
kubectl describe svc web-service
kubectl get endpoints web-service
```

**Output:**
```
NAME          TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
web-service   ClusterIP   10.43.123.45    <none>        80/TCP    10s

Name:              web-service
Namespace:         default
Selector:          app=web
Type:              ClusterIP
IP:                10.43.123.45
Port:              <unset>  80/TCP
TargetPort:        80/TCP
Endpoints:         10.42.1.5:80,10.42.2.3:80,10.42.2.4:80

NAME          ENDPOINTS
web-service   10.42.1.5:80,10.42.2.3:80,10.42.2.4:80
```

### Test from Inside the Cluster
```bash
# Spin up a debug pod
kubectl run debug --rm -it --image=busybox --restart=Never -- /bin/sh

# Inside the pod — use the SERVICE NAME as DNS
wget -qO- http://web-service

# Full DNS name
wget -qO- http://web-service.default.svc.cluster.local
```

### Service Types Explained

| Type | Behavior | Use Case |
|------|----------|----------|
| **ClusterIP** | Internal IP, cluster-only access | Microservice-to-microservice calls |
| **NodePort** | Exposes on each node's IP at a high port (30000-32767) | Quick external access, dev testing |
| **LoadBalancer** | Provisions cloud load balancer (AWS ELB, GCP LB) | Production external exposure |
| **ExternalName** | CNAME to external DNS | Integrating external APIs/databases |

### Expose as NodePort (Quick External Access)
```bash
kubectl expose deployment web-app --type=NodePort --port=80 --name=web-nodeport
kubectl get svc web-nodeport
```

**Output:**
```
NAME           TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
web-nodeport   NodePort   10.43.200.100   <none>        80:30080/TCP   5s
```

With k3d, you can map ports during cluster creation:
```bash
k3d cluster create my-cluster -p "8080:80@loadbalancer"
```

> **Backend Principle:** Services are implemented by `kube-proxy` on each node. It programs iptables or IPVS rules to load-balance traffic across pod IPs. This is **layer 4** (TCP/UDP) load balancing. For HTTP routing, path rules, and SSL, you need Ingress (layer 7).

---

## Scenario 5: ConfigMaps & Secrets — Separate Config from Code

**Goal:** Externalize configuration so the same image runs in dev, staging, and prod.

### Why Not Bake Config into Images?
- Same image → different environments
- Secret rotation without rebuilding
- Configuration changes without redeployment

### ConfigMap — Non-Sensitive Data

```bash
# Imperative
kubectl create configmap app-config   --from-literal=DATABASE_HOST=postgres-service   --from-literal=LOG_LEVEL=info

# From file
kubectl create configmap nginx-config --from-file=nginx.conf
```

### configmap.yaml (Declarative)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_HOST: "postgres-service"
  LOG_LEVEL: "info"
  MAX_CONNECTIONS: "100"
  app.properties: |
    cache.enabled=true
    cache.ttl=300
```

### Secret — Sensitive Data

```bash
# Imperative (auto base64 encodes)
kubectl create secret generic db-credentials   --from-literal=username=admin   --from-literal=password=SuperSecret123
```

### secret.yaml (Declarative — use stringData!)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:           # Plain text — K8s encodes to base64
  username: admin
  password: SuperSecret123
```

### Using Them in a Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: myapi:v1
        env:
        # Inject single value as env var
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_HOST
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        # Inject ALL key-value pairs from ConfigMap as env vars
        envFrom:
        - configMapRef:
            name: app-config
        # Mount ConfigMap as files in a directory
        volumeMounts:
        - name: config-vol
          mountPath: /etc/config
          readOnly: true
        - name: secret-vol
          mountPath: /etc/secrets
          readOnly: true
      volumes:
      - name: config-vol
        configMap:
          name: app-config
      - name: secret-vol
        secret:
          secretName: db-credentials
```

### Verify
```bash
kubectl exec -it api-app-xxx -- env | grep DATABASE
kubectl exec -it api-app-xxx -- ls /etc/config
kubectl exec -it api-app-xxx -- cat /etc/secrets/password
```

> **Backend Principle:** **Secrets are NOT encrypted by default.** They are base64-encoded, which is trivial to decode. For production:
> - Enable encryption at rest via `EncryptionConfiguration`
> - Use external secret managers (HashiCorp Vault, AWS Secrets Manager)
> - Never commit Secret YAMLs to Git. Use Sealed Secrets, External Secrets Operator, or SOPS.

---

## Scenario 6: Persistent Storage — PVCs and the Storage Stack

**Goal:** Give pods storage that survives pod restarts.

### The Storage Hierarchy

```
┌─────────────────────────────────────────────┐
│              Pod (mounts volume)              │
├─────────────────────────────────────────────┤
│         PVC (PersistentVolumeClaim)           │
│         "I need 5Gi of ReadWriteOnce storage" │
├─────────────────────────────────────────────┤
│              PV (PersistentVolume)            │
│         Actual disk/volume provisioned        │
├─────────────────────────────────────────────┤
│           StorageClass (provisioner)          │
│    "Dynamically create PVs on demand"       │
└─────────────────────────────────────────────┘
```

### pvc.yaml
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce      # Only one node can mount this
  resources:
    requests:
      storage: 5Gi
  storageClassName: local-path    # k3s default; minikube uses 'standard'
```

### Using PVC in a Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-data
        persistentVolumeClaim:
          claimName: postgres-pvc
```

### Verify
```bash
kubectl apply -f pvc.yaml
kubectl apply -f postgres-deployment.yaml

kubectl get pvc
kubectl get pv
```

**Output:**
```
NAME           STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
postgres-pvc   Bound    pvc-a1b2c3d4-e5f6-7890-abcd-ef1234567890   5Gi        RWO            local-path     30s

NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM
pvc-a1b2c3d4-e5f6-7890-abcd-ef1234567890  5Gi        RWO            Delete           Bound    default/postgres-pvc
```

### Access Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **RWO** | One node reads/writes | Databases (PostgreSQL, MySQL) |
| **ROX** | Many nodes read, none write | Static assets, shared configs |
| **RWX** | Many nodes read/write | Shared file systems (NFS, EFS) |
| **RWOP** | One pod only (K8s 1.27+) | Strict isolation |

> **Backend Principle:** PVCs are **requests**, not actual storage. The StorageClass is the factory. In k3s, `local-path` creates hostPath volumes. In AWS EKS, `gp3` creates EBS volumes. In GCP GKE, `standard-rwo` creates Persistent Disks. Your app doesn't care — it just mounts the PVC.

> **Warning:** For databases, consider **StatefulSets** (Scenario 11) instead of Deployments. Deployments give you random pod names and shared PVCs. StatefulSets give you ordered names (`postgres-0`, `postgres-1`) and dedicated PVCs per pod.

---

## Scenario 7: Namespaces — Multi-Tenancy & Organization

**Goal:** Isolate environments and teams within one cluster.

### Why Namespaces?
- Resource isolation (dev/staging/prod in one cluster)
- RBAC boundaries
- Resource quotas (prevent one team from consuming all resources)
- DNS scoping: `service.namespace.svc.cluster.local`

### Command
```bash
kubectl create namespace development
kubectl create namespace production

# Set default namespace for current context
kubectl config set-context --current --namespace=development

# Run something in a specific namespace
kubectl run dev-app --image=nginx -n development
```

### Verify
```bash
kubectl get pods -n development
kubectl get pods -n production
kubectl get pods --all-namespaces    # or -A
```

### Resource Quota (Prevent Resource Hogs)
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: development
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"
    services: "10"
```

> **Backend Principle:** Namespaces are **NOT security boundaries by default.** A pod in `dev` can still talk to a service in `prod` unless you add NetworkPolicies. Think of namespaces as "organizational folders" — they help you find things, but they don't lock the doors.

---

## Scenario 8: Ingress — HTTP Routing & SSL

**Goal:** Route external HTTP traffic to services based on host and path.

### Why Not Just NodePort/LoadBalancer?
| Approach | Cost | Flexibility |
|----------|------|-------------|
| One LoadBalancer per Service | $$$ | None |
| NodePort | Free | Random high ports, no HTTP routing |
| **Ingress** | One LB total | Host-based routing, path rules, SSL |

### Enable Ingress (k3s has Traefik built-in!)
```bash
# k3s comes with Traefik ingress controller pre-installed
kubectl get pods -n kube-system | grep traefik

# minikube
minikube addons enable ingress
```

### ingress.yaml
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    # Traefik annotation (k3s)
    traefik.ingress.kubernetes.io/router.entrypoints: web
    # Nginx annotation (minikube/cloud)
    # nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: app.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
```

### With k3d: Map Ports at Cluster Creation
```bash
# Create cluster with port mapping
k3d cluster create my-cluster -p "8081:80@loadbalancer"

# Add to /etc/hosts
# 127.0.0.1 app.local

# Test
curl http://app.local:8081
curl http://app.local:8081/api
```

### TLS/SSL with Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  tls:
  - hosts:
    - app.local
    secretName: app-tls-secret    # Contains cert + key
  rules:
  - host: app.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```

> **Backend Principle:** Ingress is a **layer 7** (HTTP) router. The Ingress Controller (Traefik in k3s, NGINX in minikube/cloud) is the actual proxy that implements these rules. Annotations are controller-specific — Traefik annotations don't work on NGINX and vice versa. Always check your controller's documentation.

---

# PART 4: INTERMEDIATE CONCEPTS

---

## Scenario 9: Horizontal Pod Autoscaler (HPA)

**Goal:** Automatically scale pods based on CPU or memory usage.

### Prerequisites
```bash
# k3s: metrics-server is usually built-in
kubectl top node

# If not installed:
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### hpa.yaml
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300    # Wait 5 min before scaling down
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

### Command
```bash
kubectl apply -f hpa.yaml
kubectl get hpa
```

**Output:**
```
NAME      REFERENCE            TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
web-hpa   Deployment/web-app   5%/50%          2         10        2          1m
```

### Load Test to Trigger Scaling
```bash
# Run a load generator
kubectl run load-generator --image=busybox --restart=Never --   /bin/sh -c "while true; do wget -q -O- http://web-service; done"

# Watch HPA in another terminal
kubectl get hpa -w
```

> **Backend Principle:** HPA scales **pods** (horizontal). VPA scales **resources per pod** (vertical). Cluster Autoscaler scales **nodes**. For true elasticity, you need all three. `stabilizationWindowSeconds` prevents flapping — pods don't scale down immediately after a traffic spike ends.

---

## Scenario 10: Probes — Health Checks That Actually Matter

**Goal:** Teach Kubernetes when your app is alive, ready, and finished starting.

### Three Types of Probes

| Probe | Asks | Action on Failure |
|-------|------|-------------------|
| **Liveness** | "Is the app running?" | Restart container |
| **Readiness** | "Is the app ready for traffic?" | Remove from Service endpoints |
| **Startup** | "Has the app finished starting?" | Disable liveness/readiness until done |

### deployment-with-probes.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: myapi:v1
        ports:
        - containerPort: 8080
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2
        startupProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          failureThreshold: 10
```

### Backend Health Endpoint (Node.js Example)
```javascript
// /health — liveness (must be FAST, no DB calls)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// /ready — readiness (checks dependencies)
app.get('/ready', async (req, res) => {
  try {
    await db.ping();
    await redis.ping();
    res.status(200).json({ status: 'ready' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: err.message });
  }
});
```

> **Backend Principle:** **Liveness without readiness is dangerous.** If your app is still initializing its DB connection pool, liveness might pass but readiness should fail. Kubernetes removes "not ready" pods from Service endpoints — traffic doesn't reach them. But liveness restarts "stuck" pods. Use **both**.

> **Startup probes** are critical for slow-starting apps (Java, .NET). They prevent premature liveness kills during initialization. Once the startup probe succeeds, liveness and readiness take over.

---

## Scenario 11: StatefulSets — When Pods Need Identity

**Goal:** Deploy stateful apps (databases, message queues) with stable network IDs and storage.

### Why Not Deployments for Databases?

| Feature | Deployment | StatefulSet |
|---------|------------|-------------|
| Pod naming | Random: `web-app-7c4b8d9f4f-abc12` | Ordinal: `postgres-0`, `postgres-1` |
| Network identity | Changes on reschedule | Stable via Headless Service |
| Storage | Shared PVC (risky) | Dedicated PVC per pod |
| Startup | All at once | Ordered, sequential |
| Scaling | Any order | Ordered: N-1 then N |

### Headless Service (Required!)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
  clusterIP: None    # Headless — DNS returns pod IPs directly
```

### statefulset.yaml
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres-headless
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 5Gi
```

### Verify
```bash
kubectl apply -f statefulset.yaml
kubectl get statefulset
kubectl get pods -l app=postgres
```

**Output:**
```
NAME        READY   AGE
postgres    3/3     2m

NAME         READY   STATUS    RESTARTS   AGE
postgres-0   1/1     Running   0          2m
postgres-1   1/1     Running   0          90s
postgres-2   1/1     Running   0          60s
```

### DNS Resolution
```bash
# Each pod gets a stable DNS name
postgres-0.postgres-headless.default.svc.cluster.local
postgres-1.postgres-headless.default.svc.cluster.local
postgres-2.postgres-headless.default.svc.cluster.local
```

> **Backend Principle:** StatefulSets are for apps that care about **identity**. Databases need to know "who is the primary?" Message queues need to know "which broker am I?" The ordinal naming (`-0`, `-1`, `-2`) and stable DNS make this possible. `volumeClaimTemplates` creates a **dedicated PVC per pod** — if `postgres-0` dies and reschedules, it reattaches to its original disk.

> **Production Advice:** For production databases, consider **managed services** (RDS, Cloud SQL) or **Kubernetes Operators** (PostgreSQL Operator, MongoDB Community Operator). StatefulSets are powerful but managing database failover, backups, and upgrades by hand is error-prone.

---

## Scenario 12: Jobs & CronJobs — Batch Processing

**Goal:** Run one-off or scheduled tasks in Kubernetes.

### Job — Run to Completion
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-migration
spec:
  template:
    spec:
      containers:
      - name: migrator
        image: myapp:migrator
        command: ["python", "migrate.py"]
        env:
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_URL
      restartPolicy: OnFailure
  backoffLimit: 3
```

### CronJob — Scheduled Tasks
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup-job
spec:
  schedule: "0 2 * * *"          # Daily at 2 AM (cron syntax)
  concurrencyPolicy: Forbid        # Skip if previous is still running
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15-alpine
            command:
            - /bin/sh
            - -c
            - pg_dump $DATABASE_URL > /backups/backup-$(date +%Y%m%d).sql
            volumeMounts:
            - name: backup-vol
              mountPath: /backups
          volumes:
          - name: backup-vol
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

> **Backend Principle:** Jobs replace traditional `crontab` with containerized, observable, resource-limited tasks. `restartPolicy: OnFailure` retries the container if it exits non-zero. `backoffLimit` controls retry attempts. `activeDeadlineSeconds` kills the job if it runs too long — preventing runaway batch jobs from consuming cluster resources.

---

## Scenario 13: DaemonSets — One Pod Per Node

**Goal:** Run infrastructure agents on every node.

### Use Cases
| Use Case | Example |
|----------|---------|
| Log collection | Fluent Bit, Filebeat |
| Monitoring | Node Exporter, Datadog Agent |
| Network | Calico, Cilium |

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      containers:
      - name: node-exporter
        image: prom/node-exporter:latest
        ports:
        - containerPort: 9100
          hostPort: 9100
        volumeMounts:
        - name: proc
          mountPath: /host/proc
          readOnly: true
        - name: sys
          mountPath: /host/sys
          readOnly: true
      volumes:
      - name: proc
        hostPath:
          path: /proc
      - name: sys
        hostPath:
          path: /sys
```

> **Backend Principle:** DaemonSets ensure every node runs the same agent. This is critical for **observability** — you need Node Exporter on every node to collect CPU/memory/disk metrics. They use `hostPath` volumes to access the host's `/proc` and `/sys` filesystems.

---

## Scenario 14: RBAC — Who Can Do What

**Goal:** Implement least-privilege access.

### RBAC Components

| Resource | Scope | Purpose |
|----------|-------|---------|
| **Role** | Namespace | Permissions within one namespace |
| **ClusterRole** | Cluster-wide | Permissions across all namespaces |
| **RoleBinding** | Namespace | Links Role to a user/service account |
| **ClusterRoleBinding** | Cluster-wide | Links ClusterRole to a user/service account |

### Service Account for Your App
```bash
kubectl create serviceaccount api-service-account -n production
```

### role.yaml
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
```

### rolebinding.yaml
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: production
subjects:
- kind: ServiceAccount
  name: api-service-account
  namespace: production
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### Use It in a Pod
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-app
  namespace: production
spec:
  template:
    spec:
      serviceAccountName: api-service-account    # ← Critical!
      containers:
      - name: api
        image: myapi:v1
```

### Verify
```bash
kubectl auth can-i list pods   --as=system:serviceaccount:production:api-service-account   -n production
# yes

kubectl auth can-i delete pods   --as=system:serviceaccount:production:api-service-account   -n production
# no
```

> **Backend Principle:** **Default service accounts have NO permissions.** If your app needs to talk to the K8s API (e.g., a controller, an operator, a sidecar that reads pod info), you MUST create a dedicated service account and bind a Role to it. This is the same principle as IAM roles in AWS — least privilege, always.

---

## Scenario 15: Helm — Package Management for K8s

**Goal:** Deploy complex applications without writing 500 lines of YAML.

### Install Helm
```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### Basic Commands
```bash
# Add a chart repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Search
helm search repo postgresql

# Install (one command = full database setup)
helm install my-db bitnami/postgresql   --set auth.postgresPassword=secret123   --set persistence.size=10Gi

# List releases
helm list

# Upgrade
helm upgrade my-db bitnami/postgresql --set auth.postgresPassword=newsecret

# Rollback
helm rollback my-db 1

# Uninstall
helm uninstall my-db
```

### Create Your Own Chart
```bash
helm create mychart
```

**Structure:**
```
mychart/
├── Chart.yaml          # Metadata (name, version, dependencies)
├── values.yaml         # Default configuration
├── charts/             # Sub-charts (dependencies)
└── templates/          # Go templates → rendered K8s YAML
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    └── _helpers.tpl    # Reusable template snippets
```

### values.yaml
```yaml
replicaCount: 2

image:
  repository: nginx
  tag: "1.25"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  host: app.local

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

> **Backend Principle:** Helm separates **logic** (templates) from **configuration** (values.yaml). This is identical to how you separate application code from environment-specific `.env` files. `helm template` renders manifests without installing — use it in CI/CD to validate before deployment.

---

## Scenario 16: Debugging — The Systematic Approach

**Goal:** Don't guess. Observe, hypothesize, verify.

### The Debugging Checklist

```bash
# 1. What is the pod's actual state?
kubectl get pods -A

# 2. Why is it in that state?
kubectl describe pod <pod-name>
# → Read the Events section at the bottom

# 3. What did the container output?
kubectl logs <pod-name>
kubectl logs <pod-name> --previous    # Crashed container

# 4. What is the container doing RIGHT NOW?
kubectl exec -it <pod-name> -- /bin/sh
# Inside: ps aux, netstat, env, cat /etc/resolv.conf

# 5. Can it reach its dependencies?
kubectl run debug --rm -it --image=busybox -- /bin/sh
# Inside: wget -qO- http://web-service, nslookup web-service

# 6. Is DNS working?
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup kubernetes.default

# 7. What are the resource constraints?
kubectl top pod
kubectl top node
kubectl describe node <node-name>

# 8. Network policies blocking traffic?
kubectl get networkpolicies -n <namespace>

# 9. Ephemeral debug container (K8s 1.25+)
kubectl debug -it <pod-name> --image=nicolaka/netshoot --target=<container-name>
```

### Common Pod States

| State | Meaning | Fix |
|-------|---------|-----|
| **Pending** | Can't be scheduled | Check node resources, taints, PVC binding |
| **CrashLoopBackOff** | Container keeps crashing | Check `kubectl logs --previous` |
| **ImagePullBackOff** | Can't pull image | Check image name, registry auth, network |
| **OOMKilled** | Out of memory | Increase memory limit or fix leak |
| **Evicted** | Node ran out of disk/memory | Check `kubectl describe node` |
| **Terminating** | Stuck deleting | `kubectl delete pod --force --grace-period=0` |

> **Backend Principle:** `kubectl describe` is your most powerful tool. The **Events** section at the bottom tells the story of WHY something failed. The scheduler couldn't place the pod? The PVC is pending? The image pull failed? It's all there. Always read Events before checking logs.

---

# PART 5: QUICK REFERENCE

## Essential kubectl Commands

| Task | Command |
|------|---------|
| Get pods | `kubectl get pods` |
| Get all namespaces | `kubectl get pods -A` |
| Get by label | `kubectl get pods -l app=web` |
| Describe | `kubectl describe pod <name>` |
| Apply YAML | `kubectl apply -f file.yaml` |
| Delete | `kubectl delete -f file.yaml` |
| Logs | `kubectl logs <pod>` |
| Previous logs | `kubectl logs <pod> --previous` |
| Stream logs | `kubectl logs -f <pod>` |
| Exec shell | `kubectl exec -it <pod> -- /bin/sh` |
| Port forward | `kubectl port-forward pod/<name> 8080:80` |
| Copy files | `kubectl cp <pod>:/remote ./local` |
| Scale | `kubectl scale deployment <name> --replicas=5` |
| Rollout status | `kubectl rollout status deployment/<name>` |
| Rollout history | `kubectl rollout history deployment/<name>` |
| Rollback | `kubectl rollout undo deployment/<name>` |
| Resource usage | `kubectl top pod` / `kubectl top node` |
| All resources | `kubectl get all` |
| Events | `kubectl get events --sort-by='.lastTimestamp'` |
| Switch context | `kubectl config use-context <name>` |
| Switch namespace | `kubectl config set-context --current --namespace=<ns>` |

## Core Resource Types

| Resource | Purpose | Command |
|----------|---------|---------|
| **Pod** | Smallest deployable unit | `kubectl get pods` |
| **Deployment** | Manages pods, rolling updates | `kubectl get deployments` |
| **Service** | Stable networking | `kubectl get svc` |
| **ConfigMap** | Non-sensitive config | `kubectl get cm` |
| **Secret** | Sensitive config | `kubectl get secrets` |
| **Ingress** | HTTP routing | `kubectl get ingress` |
| **PVC** | Storage request | `kubectl get pvc` |
| **PV** | Actual storage | `kubectl get pv` |
| **StatefulSet** | Stateful apps | `kubectl get statefulsets` |
| **DaemonSet** | One pod per node | `kubectl get daemonsets` |
| **Job** | Batch task | `kubectl get jobs` |
| **CronJob** | Scheduled task | `kubectl get cronjobs` |
| **HPA** | Auto-scaler | `kubectl get hpa` |

## Minimal YAML Templates

### Deployment + Service
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:v1
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: app-svc
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
```

---

# ENGINEERING DEBRIEF

## What You Should Know Before Moving to Advanced Topics

1. **The Control Loop:** Every K8s resource is managed by a controller that watches for differences between desired and actual state. This is the fundamental architecture — not magic, just distributed systems engineering.

2. **Labels Are Everything:** If you don't understand label selectors, you don't understand Kubernetes. Deployments select pods. Services select pods. NetworkPolicies select pods. Ingress backends select services. Master labels.

3. **Ephemeral by Design:** Pods die. IPs change. Storage must be explicit. If your app assumes stable local state, it will break. Design for failure.

4. **Observability Is Not Optional:** In distributed systems, you cannot ssh into every pod. You need logs (`kubectl logs`), metrics (`kubectl top`), and events (`kubectl describe`). Instrument your apps with `/health` and `/ready` endpoints.

5. **Security Is Layered:** Non-root containers → read-only root filesystem → security contexts → RBAC → NetworkPolicies → Pod Security Standards. Defense in depth.

6. **Declarative > Imperative:** Write YAML. Version it in Git. Apply it via CI/CD. This is GitOps, and it's how production clusters are managed.

## Learning Path Checklist

```
Week 1: Core Primitives
├── Install k3d/kubectl
├── Run first Pod
├── Write Deployment YAML
├── Create Service and test DNS
└── Deploy a 2-tier app (web + db)

Week 2: Configuration & Storage
├── ConfigMaps and Secrets
├── PersistentVolumeClaims
├── Namespaces and ResourceQuotas
└── Ingress with host/path routing

Week 3: Production Patterns
├── Probes (liveness/readiness/startup)
├── HPA and resource limits
├── StatefulSets for databases
├── Jobs and CronJobs
└── DaemonSets for node agents

Week 4: Operations & Security
├── RBAC and ServiceAccounts
├── Helm charts
├── Debugging toolkit (logs, describe, exec, events)
├── Security contexts and non-root containers
└── Monitoring basics (metrics-server)
```

> *"Kubernetes doesn't eliminate complexity — it moves it. You trade 'it works on my machine' for 'the cluster reconciles my declared intent against reality.' The complexity is still there; it's just now observable, debuggable, and automatable."*
