# Project 1: The Gatekeeper — AI Gateway

> **Mission:** Build a production-grade AI Gateway that routes LLM requests, manages API keys, enforces rate limits, caches responses, tracks token usage, and fails over between providers — all exposed through a clean Swagger UI. This is the **front door** every other project will talk through.

---

## 1. Project Name

**The Gatekeeper**

> *One front door. Every model. Zero downtime.*

---

## 2. Why?

You're learning backend engineering from zero. Most tutorials teach you to build a "todo API" — but that teaches you almost nothing about how real systems handle traffic, fail gracefully, or scale. **The Gatekeeper** solves a real problem: AI APIs are expensive, unreliable, and slow. Every company using LLMs in production needs a gateway.

By building this, you will learn:
- **How real APIs are structured** — not toy endpoints, but production patterns (rate limiting, auth, caching, circuit breakers)
- **How to think in systems** — every concept maps to a real tool, not abstract theory
- **How to deploy like a senior engineer** — Docker, Kubernetes, tunnels, observability
- **Why gateways exist** — when you build RAG (Project 2), MCP (Project 3), and Agents (Project 4), they will ALL call through this gateway. If the gateway is weak, everything collapses.

This project teaches you **backend fundamentals** better than any CRUD tutorial because every feature solves a real failure mode: "What happens when OpenAI is down?" "What if someone spams my API?" "How do I know how much I'm spending?"

---

## 3. Stack

### Core Stack (Applied Across All 4 Projects)

| Tool | Role in This Project |
|------|---------------------|
| **Node.js 22 LTS** | The runtime — executes your JavaScript on the server |
| **Hono** | The web framework — handles HTTP requests, routing, middleware |
| **Drizzle ORM** | Typesafe database queries — no raw SQL, no type errors |
| **PostgreSQL 17** | Persistent storage — API keys, request logs, usage aggregates |
| **Redis** | Fast in-memory store — rate limit counters, response cache, circuit breaker state |
| **Docker** | Packages your app + dependencies into a container |
| **k3s** | Lightweight Kubernetes — orchestrates containers locally |
| **Cloudflare Tunnel** | Exposes your local k3s cluster to the internet securely |

### Project-Specific Additions

| Tool | Why It's Added |
|------|---------------|
| **Swagger UI (via `@hono/swagger-ui`)** | Auto-generated interactive API docs — click "Try it out" and test every endpoint from the browser. This is how you "feel" the API without building a frontend. |
| **Zod** | Runtime validation — rejects bad requests before they touch your logic |
| **Groq SDK** | Free/fast LLM provider — `$0` to start, no credit card required |
| **Ollama** | Run models locally — completely free, works offline, zero API keys |
| **BullMQ** | Redis-backed job queue — handles async tasks (log aggregation, usage reporting) without blocking API responses |
| **Prometheus + Grafana** | Metrics collection + visualization — see request rates, latency, error rates in real time |
| **OpenTelemetry + Jaeger** | Distributed tracing — follow a single request through every layer |
| **Nginx** | Reverse proxy + load balancer — sits in front of Hono, handles SSL termination, static file serving |
| **bcryptjs** | Password hashing — API keys are hashed before storage, never stored plain |
| **jose** | JWT verification — stateless authentication, no session database needed |
| **pino** | Structured JSON logging — every request logged with trace IDs, searchable by tool |
| **dotenv** | Environment variable management — keeps secrets out of code |

---

## 4. Directory Structure

```
gatekeeper/
├── .env                          # Secrets: API keys, DB passwords, JWT secret
├── .env.example                  # Template showing what variables are needed
├── .gitignore                    # Prevents .env and node_modules from being committed
├── docker-compose.yml            # Local dev: Postgres + Redis + Nginx + App
├── Dockerfile                    # Production container image for the gateway
├── k8s/
│   ├── namespace.yaml            # Kubernetes namespace: "gatekeeper"
│   ├── deployment.yaml           # How many pods, resource limits, health checks
│   ├── service.yaml              # Internal cluster networking (ClusterIP)
│   ├── ingress.yaml              # External routing rules (Nginx Ingress)
│   ├── configmap.yaml            # Non-secret config: log levels, timeouts
│   └── secret.yaml               # Secret config: DB passwords, API keys
├── docs/
│   ├── 01-what-is-an-api.md
│   ├── 02-http-methods.md
│   ├── 03-middleware.md
│   ├── 04-rate-limiting.md
│   ├── 05-circuit-breaker.md
│   ├── 06-caching-strategies.md
│   ├── 07-jwt-auth.md
│   ├── 08-database-indexing.md
│   ├── 09-docker-basics.md
│   ├── 10-kubernetes-concepts.md
│   ├── 11-observability.md
│   ├── 12-load-balancing.md
│   ├── 13-reverse-proxy.md
│   ├── 14-structured-logging.md
│   ├── 15-connection-pooling.md
│   ├── 16-health-checks.md
│   ├── 17-graceful-shutdown.md
│   ├── 18-secrets-management.md
│   ├── 19-api-gateway-pattern.md
│   └── 20-swagger-openapi.md
├── src/
│   ├── index.ts                  # Entry point: creates Hono app, mounts routes, starts server
│   ├── config/
│   │   ├── env.ts                # Loads and validates .env variables with Zod
│   │   └── database.ts           # Drizzle ORM client initialization
│   ├── routes/
│   │   ├── health.ts             # GET /health — liveness probe for Kubernetes
│   │   ├── ready.ts              # GET /ready — readiness probe (checks DB + Redis)
│   │   ├── chat.ts               # POST /v1/chat/completions — main LLM proxy endpoint
│   │   ├── providers.ts          # GET /v1/providers — list configured providers
│   │   ├── keys.ts               # POST /v1/keys — create API key, GET /v1/keys — list
│   │   └── usage.ts              # GET /v1/usage — token consumption dashboard data
│   ├── middleware/
│   │   ├── logger.ts             # Pino structured logging: method, path, duration, status
│   │   ├── request-id.ts         # Generates UUID per request for tracing
│   │   ├── auth.ts               # JWT verification + API key validation
│   │   ├── rate-limit.ts         # Redis sliding window: X requests per Y seconds per key
│   │   ├── circuit-breaker.ts    # Per-provider state machine: CLOSED → OPEN → HALF_OPEN
│   │   ├── cache.ts              # Redis response cache: exact match + TTL
│   │   ├── error-handler.ts      # Global catch-all: consistent JSON error responses
│   │   ├── validate.ts           # Zod request body validation
│   │   └── cors.ts               # Cross-Origin Resource Sharing headers
│   ├── providers/
│   │   ├── interface.ts          # TypeScript interface: all providers implement this
│   │   ├── groq.ts               # Groq adapter: fast, free-tier available
│   │   ├── ollama.ts             # Ollama adapter: local models via HTTP
│   │   └── openai.ts             # OpenAI adapter: (optional, user-configured)
│   ├── services/
│   │   ├── gateway.ts            # Core routing logic: provider selection, failover, normalization
│   │   ├── usage-tracker.ts      # Records token counts per request to PostgreSQL
│   │   ├── cache-service.ts      # Redis get/set with TTL, cache key generation
│   │   └── queue-service.ts      # BullMQ job producer: background tasks
│   ├── workers/
│   │   └── usage-aggregator.ts   # BullMQ consumer: aggregates hourly usage, updates DB
│   ├── db/
│   │   ├── schema.ts             # Drizzle table definitions: users, api_keys, requests, usage
│   │   ├── migrations/           # Generated by Drizzle Kit, applied automatically
│   │   └── seed.ts               # Dev data: sample API keys, test users
│   ├── lib/
│   │   ├── redis.ts              # Redis client singleton (ioredis)
│   │   ├── jwt.ts                # Token generation + verification helpers
│   │   ├── hash.ts               # bcryptjs wrapper for API key hashing
│   │   └── telemetry.ts          # OpenTelemetry tracer initialization
│   ├── types/
│   │   └── index.ts              # Shared TypeScript types: Provider, Request, Response, etc.
│   └── swagger.ts                # OpenAPI spec + Swagger UI mount point
├── tests/
│   ├── unit/
│   │   ├── middleware.test.ts
│   │   ├── gateway.test.ts
│   │   └── cache.test.ts
│   ├── integration/
│   │   ├── api.test.ts
│   │   └── providers.test.ts
│   └── fixtures/
│       └── mock-requests.ts
├── prometheus.yml                # Prometheus scrape config: targets, intervals
├── grafana/
│   └── dashboards/
│       └── gateway-dashboard.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. System Design Concepts

> **Filter by tool:** Click any tool name to see only concepts using that tool.

| # | Concept | Tool | How It's Applied in The Gatekeeper |
|---|---------|------|-------------------------------------|
| 1 | **HTTP Request/Response Cycle** | Hono | Every request hits Hono's router, flows through middleware stack, reaches handler, returns JSON response. You will trace this manually with `console.log` before adding Pino. |
| 2 | **REST API Design** | Hono | Endpoints follow REST conventions: `POST /v1/chat/completions` for creation, `GET /v1/usage` for reads, consistent HTTP status codes (200, 400, 401, 429, 500). |
| 3 | **Middleware Pipeline** | Hono | Requests flow through: `request-id` → `logger` → `cors` → `rate-limit` → `auth` → `cache` → `circuit-breaker` → handler. Order matters — auth before rate limit would let unauthenticated requests consume rate limit budget. |
| 4 | **Request Routing** | Hono | Hono's router directs `/v1/chat/completions` to the chat handler, `/health` to the health probe. Dynamic routes like `/v1/providers/:id` extract path parameters. |
| 5 | **Rate Limiting (Token Bucket)** | Redis | Each API key has a Redis counter that decrements per request. When it hits zero, return `429 Too Many Requests`. Resets every window (e.g., 100 requests/minute). |
| 6 | **Rate Limiting (Sliding Window)** | Redis | More precise than token bucket: counts requests in the last 60 seconds using Redis sorted sets (ZADD + ZREMRANGEBYSCORE). Prevents burst attacks at window boundaries. |
| 7 | **Circuit Breaker Pattern** | Redis | Per-provider state stored in Redis: `CLOSED` (normal), `OPEN` (failing, reject fast), `HALF_OPEN` (test with 1 request). Prevents cascading failures when Groq is down. |
| 8 | **Response Caching (Exact Match)** | Redis | Hash the request body (model + messages + temperature) → Redis key. On identical requests, return cached response in <1ms instead of calling the provider. TTL = 5 minutes. |
| 9 | **Response Caching (Semantic/Similarity)** | Redis | Future enhancement: store embeddings of queries, check cosine similarity before hitting provider. Skipped in Project 1 to keep scope tight. |
| 10 | **Authentication (JWT)** | jose + PostgreSQL | Users log in → server signs a JWT with a secret → client sends JWT in `Authorization: Bearer <token>` header → middleware verifies signature → request proceeds. No session database needed. |
| 11 | **Authentication (API Keys)** | bcryptjs + PostgreSQL | Service-to-service auth: generate random key → hash with bcrypt → store hash in DB. On request, hash the provided key and compare. Never store plain keys. |
| 12 | **Authorization (RBAC)** | PostgreSQL | Role-based access control: `free` tier gets 100 req/day, `pro` gets 10,000. Stored in `users.tier` column, checked in `auth` middleware after authentication. |
| 13 | **Input Validation** | Zod | Every request body validated against a Zod schema before touching business logic. Invalid requests return `400 Bad Request` with exactly which field failed. Prevents injection attacks. |
| 14 | **Database Connection Pooling** | PostgreSQL + Drizzle | Instead of opening a new DB connection per request (expensive), maintain a pool of reusable connections. Drizzle handles this automatically; you configure pool size (e.g., 20). |
| 15 | **Database Indexing** | PostgreSQL | Indexes on `api_keys.hash` (fast lookup), `requests.created_at` (fast time-range queries for usage), `users.email` (fast login). Without indexes, queries scan entire tables. |
| 16 | **Write-Ahead Logging (WAL)** | PostgreSQL | Every change is written to a log before applying to data files. If the server crashes mid-write, WAL replays to restore consistency. You won't configure this directly, but understanding it explains why Postgres is reliable. |
| 17 | **ACID Transactions** | PostgreSQL + Drizzle | When recording a request + updating usage + updating rate limit count, wrap in a transaction. All succeed or all rollback. Prevents partial updates that corrupt state. |
| 18 | **Structured Logging** | pino | Every log line is JSON: `{"level":"info","requestId":"abc","method":"POST","path":"/v1/chat","durationMs":245,"status":200}`. Machines can parse this; humans can read it with `pino-pretty`. |
| 19 | **Distributed Tracing** | OpenTelemetry + Jaeger | Each request gets a `trace_id` propagated through all services. In Jaeger UI, you see: request hits Nginx → Hono → auth middleware → Redis check → Groq API call → response. Pinpoints bottlenecks. |
| 20 | **Metrics Collection** | Prometheus | Prometheus scrapes `/metrics` endpoint every 15s, collecting: `gateway_requests_total`, `gateway_latency_seconds`, `provider_errors_total`. Grafana dashboards visualize trends. |
| 21 | **Health Checks (Liveness)** | Hono + Kubernetes | `GET /health` returns 200 if the Node.js process is running. Kubernetes restarts the pod if this fails 3 times. Catches infinite loops, deadlocks. |
| 22 | **Health Checks (Readiness)** | Hono + PostgreSQL + Redis | `GET /ready` returns 200 only if DB and Redis are reachable. Kubernetes stops sending traffic to this pod until ready. Prevents serving requests during startup or DB outage. |
| 23 | **Graceful Shutdown** | Node.js + Kubernetes | On SIGTERM (pod deletion), stop accepting new requests, finish in-flight requests, close DB/Redis connections, then exit. Prevents dropped requests during deployments. |
| 24 | **Reverse Proxy** | Nginx | Nginx sits in front of Hono: terminates SSL (HTTPS), routes `/` to Hono, serves static files, adds security headers. Hono only sees internal HTTP, not raw internet traffic. |
| 25 | **Load Balancing** | Nginx + Kubernetes | Nginx distributes requests across multiple Hono pods. Kubernetes HorizontalPodAutoscaler adds pods when CPU > 70%. You start with 2 replicas, scale to 10 under load. |
| 26 | **Containerization** | Docker | Dockerfile defines the environment: Node.js 22 base, copy source, install dependencies, expose port 3000, run `node dist/index.js`. Same image runs locally, in CI, and in production. |
| 27 | **Container Orchestration** | k3s | k3s runs your Docker containers: schedules pods to nodes, restarts crashed pods, handles rolling updates (new version up, old version down, zero downtime). |
| 28 | **Secrets Management** | Kubernetes + dotenv | Local dev: `.env` file with secrets. Production: Kubernetes Secrets mounted as environment variables in pods. Never commit secrets to Git. |
| 29 | **API Gateway Pattern** | The entire architecture | Single entry point for all LLM traffic. Routes to providers, normalizes responses, handles auth, caching, failover. Frontend talks to Gateway; Gateway talks to OpenAI/Groq/Ollama. |
| 30 | **Provider Failover** | gateway.ts | If Groq returns 5xx or times out, automatically try Ollama (local). If Ollama fails, return cached response. If no cache, return graceful error with Retry-After header. |
| 31 | **Request/Response Normalization** | gateway.ts | All providers speak different APIs (Groq uses OpenAI format, Ollama uses its own). Gateway adapters translate every response into a single unified format. Frontend only learns one API. |
| 32 | **Token Usage Tracking** | PostgreSQL + BullMQ | Every request records: model, provider, input tokens, output tokens, cost. BullMQ worker aggregates hourly into `usage` table. Dashboard queries this for spend reports. |
| 33 | **Background Job Processing** | BullMQ | Don't block API responses with slow work. Queue tasks: "aggregate usage", "send alert if spend > $10". Worker processes them asynchronously. Redis stores the queue. |
| 34 | **SSL/TLS Termination** | Nginx + Cloudflare Tunnel | Nginx handles HTTPS certificates. Cloudflare Tunnel encrypts traffic between internet and your local k3s cluster. End-to-end encryption without exposing your IP. |
| 35 | **Cross-Origin Resource Sharing (CORS)** | Hono | Browser security blocks frontend on `localhost:3000` from calling API on `localhost:3001`. CORS middleware adds `Access-Control-Allow-Origin` headers to permit specific origins. |
| 36 | **Environment Configuration** | dotenv + Zod | `.env` file stores secrets. `config/env.ts` validates with Zod at startup — if `DATABASE_URL` is missing, the app crashes immediately with a clear error, not a cryptic DB failure later. |
| 37 | **Schema Migrations** | Drizzle Kit | As you add tables/columns, generate migration files (`drizzle-kit generate`). Apply them (`drizzle-kit migrate`). Version-controlled, reversible, team-safe database changes. |
| 38 | **API Documentation (OpenAPI/Swagger)** | @hono/swagger-ui | Hono's Zod schemas auto-generate OpenAPI spec. Swagger UI renders interactive docs at `/docs` — click any endpoint, fill parameters, hit "Execute", see response. No frontend code needed. |
| 39 | **Graceful Degradation** | gateway.ts | When everything fails (no provider, no cache), return a helpful error: `{error: "All providers unavailable", retryAfter: 60, fallback: "Try again shortly"}`. Never crash the client. |
| 40 | **Observability (The Three Pillars)** | pino + Prometheus + Jaeger | **Logs** (what happened: pino), **Metrics** (how much: Prometheus), **Traces** (where time went: Jaeger). Together they answer: "Why was this request slow?" |

---

## 6. 30-Day Planner

> **Progress:** `Day 0 ▓▓▓▓▓▓▓▓▓▓ Day 10 ▓▓▓▓▓▓▓▓▓▓ Day 20 ▓▓▓▓▓▓▓▓▓▓ Day 30`
> 
> Check off days as you complete them. Progress saves to your browser.

---

### Day 0 — Environment Setup: Install Everything, No Code Yet

**Before touching anything, learn:**
- What is a **terminal**? It's a text-based interface to your computer — like a chat where you type commands and the computer replies. On Mac: Terminal or iTerm2. On Windows: PowerShell or Git Bash.
- What is **Node.js**? A program that runs JavaScript outside the browser. Your backend code is JavaScript, so you need Node.js to execute it.
- What is **npm**? Node Package Manager — a tool that downloads libraries (like Hono, Drizzle) written by other developers so you don't rebuild everything from scratch.
- What is **Git**? Version control — a time machine for your code. Every "commit" is a snapshot you can return to. Essential for undoing mistakes and collaborating.
- What is a **.env file**? A file that stores secrets (API keys, passwords) that your code reads but never commits to Git. If you commit secrets, hackers steal them.
- What is **Docker**? A tool that packages your app + all its dependencies into a "container" — a sealed box that runs the same everywhere (your laptop, a server, the cloud).
- What is **Kubernetes (k3s)**? A system that manages Docker containers at scale: starts them, stops them, restarts crashed ones, routes traffic between them. k3s is a lightweight version for learning.
- What is **PostgreSQL**? A database — a program that stores data in tables (like Excel sheets) and answers questions fast. Relational means tables can link to each other.
- What is **Redis**? A super-fast in-memory database — data lives in RAM, not disk. Perfect for temporary data: caches, rate limit counters, session storage.

**Tasks:**
1. Install Node.js 22 LTS from [nodejs.org](https://nodejs.org). Verify: `node --version` should print `v22.x.x`.
2. Install Git. Verify: `git --version`.
3. Install Docker Desktop. Verify: `docker --version`.
4. Install k3s (or use `k3d` for easier local setup). Follow the [k3s quick-start](https://docs.k3s.io/quick-start).
5. Install a code editor: VS Code (free) or Cursor (AI-powered).
6. Create a GitHub account if you don't have one. Create a new repository called `gatekeeper`.
7. Clone it locally: `git clone https://github.com/YOUR_USERNAME/gatekeeper.git`
8. Open the folder in VS Code. Create the directory structure above (empty files are fine for now).
9. Run `npm init -y` to create `package.json`. This file lists your project's dependencies.
10. Create `.gitignore` with: `node_modules/`, `.env`, `dist/`, `*.log`.

**End of Day 0:** You have an empty project skeleton, all tools installed, and a Git repo ready. You understand what each tool does and why it exists.

---

### Day 1 — Hello Hono: Your First Web Server

**Learn before coding:**
- What is a **web server**? A program that listens for HTTP requests (from browsers, apps, other servers) and sends back responses. Like a restaurant waiter: takes orders, brings food.
- What is **HTTP**? The language browsers and servers speak. A request says "GET me this page" or "POST this data." A response says "Here it is (200)" or "Not found (404)."
- What is a **port**? A number (like 3000) that identifies which program on your computer should receive network traffic. Multiple programs can run, each on a different port.
- What is **Hono**? A lightweight web framework for Node.js. It handles routing ("this URL goes to this function") and middleware ("run this code before every request"). Faster and simpler than Express.

**Tasks:**
1. Install Hono: `npm install hono`
2. Install TypeScript: `npm install -D typescript tsx` and run `npx tsc --init` to create `tsconfig.json`.
3. Create `src/index.ts`:
   ```typescript
   import { Hono } from 'hono'
   const app = new Hono()
   app.get('/', (c) => c.text('Hello from The Gatekeeper!'))
   app.get('/health', (c) => c.json({ status: 'ok' }))
   export default app
   ```
4. Add to `package.json` scripts: `"dev": "tsx src/index.ts"`
5. Run `npm run dev`. Open `http://localhost:3000` in your browser. You should see "Hello from The Gatekeeper!"
6. Test `/health` with your browser and with `curl http://localhost:3000/health`
7. Explain to yourself: What happens when you type the URL? Browser → HTTP GET → Hono router → handler function → JSON response → browser displays it.

**End of Day 1:** You have a running web server. You understand the request/response cycle conceptually.

---

### Day 2 — TypeScript & Project Structure: Type Safety from Day One

**Learn before coding:**
- What is **TypeScript**? JavaScript with types. Instead of `let x = 5` (x could become anything), you write `let x: number = 5`. The compiler catches type errors before you run the code.
- What is a **type**? A contract describing what shape data has. Example: `type User = { id: number; name: string }` means every User MUST have a number id and string name.
- What is **tsconfig.json**? Configuration for the TypeScript compiler. It tells TS how strict to be, where source files live, where compiled output goes.
- What is **tsx**? A tool that runs TypeScript directly without manual compilation. Great for development; production uses compiled JavaScript.

**Tasks:**
1. Configure `tsconfig.json`: set `"strict": true`, `"outDir": "./dist"`, `"rootDir": "./src"`.
2. Create `src/types/index.ts` with types: `Provider`, `ChatRequest`, `ChatResponse`, `ApiKey`.
3. Create `src/config/env.ts`: load `PORT` from environment variables, default to 3000. Type it as `number`.
4. Create `src/middleware/logger.ts`: a simple middleware that prints `\[METHOD] PATH` for every request.
5. Mount the logger in `src/index.ts` using `app.use(logger)`.
6. Test: every request should now print to your terminal.
7. Create `src/routes/health.ts` as a separate file, import it into `src/index.ts`. This teaches modular routing.

**End of Day 2:** Your code is typed and modular. You understand why types prevent bugs.

---

### Day 3 — PostgreSQL & Drizzle ORM: Your First Database

**Learn before coding:**
- What is an **ORM**? Object-Relational Mapping. Instead of writing raw SQL (`SELECT * FROM users`), you write JavaScript (`db.select().from(users)`). The ORM translates to SQL.
- What is **Drizzle**? A modern TypeScript ORM that feels like writing SQL but is fully typed. If you rename a column, TypeScript complains everywhere you use it.
- What is a **schema**? The structure of your database: what tables exist, what columns they have, what types those columns are.
- What is a **migration**? A script that transforms the database from one schema version to another. Like Git for your database structure.
- What is **Docker Compose**? A tool that runs multiple containers together. You'll use it to run PostgreSQL and Redis without installing them natively.

**Tasks:**
1. Install Drizzle: `npm install drizzle-orm pg` and `npm install -D drizzle-kit`
2. Create `docker-compose.yml` with a `postgres` service: image `postgres:17`, port `5432`, environment variables for password and database name.
3. Run `docker compose up -d postgres` to start PostgreSQL in the background.
4. Create `src/db/schema.ts` with your first table:
   ```typescript
   import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'
   export const users = pgTable('users', {
     id: serial('id').primaryKey(),
     email: varchar('email', { length: 255 }).notNull().unique(),
     createdAt: timestamp('created_at').defaultNow(),
   })
   ```
5. Create `drizzle.config.ts` pointing to your database URL.
6. Run `npx drizzle-kit generate` to create the first migration file.
7. Run `npx drizzle-kit migrate` to apply it to your running Postgres.
8. Install a GUI tool: TablePlus (free) or pgAdmin. Connect to `localhost:5432` and verify the `users` table exists.

**End of Day 3:** You have a running database with a typed schema. You understand tables, columns, and migrations.

---

### Day 4 — Redis: The Speed Layer

**Learn before coding:**
- What is **Redis**? A database that stores everything in memory (RAM). Reads/writes in microseconds. Data disappears if you restart it (unless configured to persist). Perfect for temporary data.
- What is a **key-value store**? Data is stored as pairs: `key = "user:123"`, `value = "{name: 'Alice'}"`. No tables, no joins — just fast lookups.
- What is **ioredis**? A Node.js client library for talking to Redis. It handles connection pooling and reconnection automatically.
- Why Redis alongside PostgreSQL? Postgres is for permanent data (users, logs). Redis is for fast temporary data (caches, counters, locks).

**Tasks:**
1. Add Redis to `docker-compose.yml`: image `redis:7-alpine`, port `6379`.
2. Run `docker compose up -d redis`.
3. Install ioredis: `npm install ioredis`.
4. Create `src/lib/redis.ts`: a singleton Redis client that connects to `redis://localhost:6379`.
5. Create a test script `src/db/test-redis.ts`:
   ```typescript
   import redis from '../lib/redis'
   await redis.set('test-key', 'hello-redis', 'EX', 60) // expires in 60s
   const value = await redis.get('test-key')
   console.log(value) // "hello-redis"
   ```
6. Run it with `tsx src/db/test-redis.ts`.
7. Explain: `EX 60` means the key auto-deletes after 60 seconds. This is how you'll implement rate limit windows and cache TTL.

**End of Day 4:** You can read and write to Redis. You understand when to use Redis vs PostgreSQL.

---

### Day 5 — API Keys & Authentication: Who Can Use Your Gateway?

**Learn before coding:**
- What is **authentication**? Proving who you are. Like showing ID at a club.
- What is an **API key**? A secret string (like `gk_live_abc123xyz`) that identifies which application is calling your API. Think of it as a password for machines.
- What is **bcrypt**? A hashing algorithm. Instead of storing "password123", you store a scrambled version. Even if hackers steal your database, they can't reverse the scramble.
- What is **UUID**? Universally Unique Identifier — a random string like `550e8400-e29b-41d4-a716-446655440000`. Used for API keys because they're impossible to guess.

**Tasks:**
1. Install bcryptjs: `npm install bcryptjs` and types: `npm install -D @types/bcryptjs`.
2. Install UUID: `npm install uuid` and types: `npm install -D @types/uuid`.
3. Update `src/db/schema.ts`: add `apiKeys` table with columns: `id`, `keyHash`, `name`, `tier` (free/pro/enterprise), `createdAt`, `expiresAt`.
4. Generate migration and apply it.
5. Create `src/lib/hash.ts`: functions `hashKey(plainKey)` and `compareKey(plainKey, hash)`.
6. Create `src/routes/keys.ts`: `POST /v1/keys` generates a new API key (return the plain key ONCE to the user), hashes it, stores in DB.
7. Create `src/middleware/auth.ts`: reads `X-API-Key` header, hashes it, checks against DB. If valid, attaches `apiKey` object to request context.
8. Test with curl: `curl -H "X-API-Key: your-key" http://localhost:3000/v1/chat`.

**End of Day 5:** You have working API key authentication. You understand hashing, UUIDs, and middleware.

---

### Day 6 — Rate Limiting: Stop the Spammers

**Learn before coding:**
- What is **rate limiting**? Restricting how many requests a user can make in a time window. Prevents abuse, controls costs, ensures fair usage.
- What is a **sliding window**? Instead of "100 requests per minute" resetting at :00 seconds, it counts requests in the LAST 60 seconds continuously. Smoother and fairer.
- What is a **Redis sorted set**? A Redis data type where each entry has a score (timestamp). You can quickly count entries within a time range — perfect for sliding windows.

**Tasks:**
1. Create `src/middleware/rate-limit.ts`:
   - Read `apiKey.tier` from context (set by auth middleware).
   - Free tier: 10 requests/minute. Pro: 100/minute. Enterprise: 1000/minute.
   - Use Redis `ZADD` to record request timestamp, `ZREMRANGEBYSCORE` to remove old entries, `ZCARD` to count current window.
   - If count > limit, return `429 Too Many Requests` with `Retry-After` header.
2. Mount the middleware in `src/index.ts` AFTER auth middleware.
3. Test: make 11 requests rapidly with a free-tier key. The 11th should return 429.
4. Add `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers to every response.

**End of Day 6:** Your gateway rejects excessive requests. You understand why rate limiting is essential for production APIs.

---

### Day 7 — Groq Integration: Your First LLM Provider

**Learn before coding:**
- What is **Groq**? A company that runs LLMs on specialized chips (LPUs) — inference is extremely fast. They offer a generous free tier.
- What is an **API adapter**? A wrapper that translates YOUR internal format to a provider's format and back. Your gateway speaks one language; adapters translate.
- What is **fetch** in Node.js? The built-in way to make HTTP requests. Node 18+ includes it. You use it to call Groq's API.

**Tasks:**
1. Sign up at [groq.com](https://groq.com), get a free API key.
2. Install Groq SDK: `npm install groq` or use raw fetch.
3. Create `src/providers/interface.ts`: define the `LLMProvider` interface — every provider must implement `chatCompletion(request)`.
4. Create `src/providers/groq.ts`: implements the interface. Maps your `ChatRequest` to Groq's format, calls their API, normalizes the response.
5. Create `src/routes/chat.ts`: `POST /v1/chat/completions` — reads request body, picks provider (hardcode Groq for now), forwards request, returns normalized response.
6. Test with curl:
   ```bash
   curl -X POST http://localhost:3000/v1/chat/completions \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your-key" \
     -d '{"model":"llama3-8b-8192","messages":[{"role":"user","content":"Hello"}]}'
   ```
7. Verify the response matches your normalized format, not Groq's raw format.

**End of Day 7:** Your gateway proxies requests to Groq. You understand adapters and API normalization.

---

### Day 8 — Ollama Integration: Free Local Models

**Learn before coding:**
- What is **Ollama**? A tool that downloads and runs open-source LLMs (Llama, Mistral, etc.) on your own computer. Completely free, works offline, no API keys.
- What is a **local inference server**? Ollama exposes an HTTP API at `http://localhost:11434`. Your gateway calls it just like Groq, but the model runs on your machine.
- Why local models? Privacy (data never leaves your machine), cost (zero), availability (works without internet).

**Tasks:**
1. Install Ollama: [ollama.com/download](https://ollama.com/download)
2. Pull a model: `ollama pull llama3.2` (small, fast, good for testing).
3. Verify Ollama is running: `curl http://localhost:11434/api/tags` should list models.
4. Create `src/providers/ollama.ts`: implements `LLMProvider`. Calls `POST http://localhost:11434/api/chat`.
5. Update `src/services/gateway.ts`: add provider selection logic. If request specifies `provider: "ollama"`, use Ollama. Otherwise default to Groq.
6. Test both providers through your gateway. Compare response times.

**End of Day 8:** Your gateway supports both cloud and local providers. You understand the trade-offs.

---

### Day 9 — Circuit Breaker: Surviving Provider Outages

**Learn before coding:**
- What is a **circuit breaker**? A pattern that stops calling a failing service temporarily. Like a home circuit breaker: too much current → flip to OFF → wait → test → flip back.
- Why? If Groq is down and you keep calling it, you waste time (timeouts), overwhelm the failing service (making recovery harder), and frustrate users.
- States: **CLOSED** (normal, requests flow), **OPEN** (failing, reject immediately), **HALF_OPEN** (test with 1 request, decide whether to close or reopen).

**Tasks:**
1. Create `src/middleware/circuit-breaker.ts`:
   - Per-provider state stored in Redis (key: `circuit:provider:groq`).
   - Track failures: if 5 errors in 60 seconds, OPEN the circuit.
   - In OPEN state: reject immediately with `503 Service Unavailable` and `Retry-After: 60`.
   - After 60 seconds: HALF_OPEN. Allow 1 request. If success, CLOSE. If fail, OPEN again.
2. Integrate into `gateway.ts`: before calling any provider, check circuit state.
3. Test: temporarily disconnect internet. Requests to Groq should fail fast (not hang) with clear error.

**End of Day 9:** Your gateway fails gracefully. You understand why cascading failures destroy systems.

---

### Day 10 — Response Caching: Speed Without Cost

**Learn before coding:**
- What is **caching**? Storing a copy of expensive-to-compute data so future requests get it instantly. A cache hit is free; a cache miss costs full price.
- What is a **cache key**? A unique identifier for cached data. For LLM requests, hash the model + messages + temperature. Identical inputs → identical key → cached response.
- What is **TTL**? Time To Live — how long cache entry survives before deletion. Set to 5 minutes for LLM responses (answers to "What is Node.js?" don't change often).

**Tasks:**
1. Create `src/services/cache-service.ts`:
   - `generateKey(request)` → SHA-256 hash of normalized request JSON.
   - `get(key)` → check Redis. If exists, return parsed JSON.
   - `set(key, response, ttlSeconds)` → store in Redis with `EX` (expire).
2. Create `src/middleware/cache.ts`:
   - Before calling provider, check cache.
   - If cache hit, return immediately with `X-Cache: HIT` header.
   - If cache miss, call provider, store response, return with `X-Cache: MISS`.
3. Test: send identical request twice. Second should be instant (check response time).

**End of Day 10:** Core backend scaffolding complete. Your gateway has auth, rate limits, multiple providers, circuit breakers, and caching.

---

### Day 11 — Zod Validation: Never Trust the Client

**Learn before coding:**
- What is **validation**? Checking that incoming data matches expectations. A request claiming `"temperature": 999` is invalid (max is usually 2).
- What is **Zod**? A TypeScript-first validation library. You define a schema, Zod checks data against it, and the result is typed.
- Why validate? Malicious users send garbage data. Without validation, garbage crashes your server or corrupts your database.

**Tasks:**
1. Install Zod: `npm install zod`.
2. Create `src/config/schema.ts`:
   - `ChatRequestSchema`: model (string), messages (array of {role, content}), temperature (number, min 0, max 2, optional).
   - `CreateKeySchema`: name (string, min 1, max 100), tier (enum: free/pro/enterprise).
3. Create `src/middleware/validate.ts`: generic middleware that takes a Zod schema, validates `c.req.json()`, returns `400` with specific field errors if invalid.
4. Apply to all routes: `app.post('/v1/chat', validate(ChatRequestSchema), ...)`.
5. Test: send `{"temperature": 999}` → should get `400 {error: "temperature must be <= 2"}`.

**End of Day 11:** Bad requests are rejected with clear errors. You understand why validation is the first line of defense.

---

### Day 12 — Usage Tracking: Know Your Spend

**Learn before coding:**
- What is **tokenization**? LLMs don't count words; they count "tokens" (sub-word pieces). "Hello world" might be 3 tokens. More tokens = more cost.
- What is **usage tracking**? Recording every request: who made it, which model, how many input/output tokens, what it cost. Essential for billing and optimization.
- What is **BullMQ**? A Redis-backed job queue. Instead of blocking the API response to write usage data, you queue a background job.

**Tasks:**
1. Install BullMQ: `npm install bullmq`.
2. Update `src/db/schema.ts`: add `requests` table (id, apiKeyId, provider, model, inputTokens, outputTokens, latencyMs, createdAt) and `usage` table (apiKeyId, date, totalTokens, totalCost).
3. Create `src/services/queue-service.ts`: initialize BullMQ queue connected to Redis.
4. Create `src/workers/usage-aggregator.ts`: BullMQ worker that reads jobs from queue, aggregates hourly, writes to `usage` table.
5. Update `gateway.ts`: after successful provider call, queue a job with request details.
6. Run the worker: `tsx src/workers/usage-aggregator.ts`.
7. Test: make requests, check `requests` table has rows, check `usage` table aggregates correctly.

**End of Day 12:** You track every token. You understand why background jobs prevent API slowdown.

---

### Day 13 — Swagger UI: See Your API Come Alive

**Learn before coding:**
- What is **Swagger UI**? An interactive documentation page auto-generated from your code. It lists every endpoint, shows parameters, lets you "Try it out" — fill a form, click execute, see the response. No frontend code needed.
- What is **OpenAPI**? A standard format for describing APIs. Swagger UI reads this format to build the interactive page.
- Why use it? You see your API as users see it. You catch missing validation, wrong types, unclear descriptions.

**Tasks:**
1. Install: `npm install @hono/swagger-ui @hono/zod-openapi`.
2. Create `src/swagger.ts`:
   - Define OpenAPI spec: title "The Gatekeeper", version "1.0.0".
   - Register every route with description, parameters, response schemas.
3. Mount Swagger UI at `/docs`: `app.get('/docs', swaggerUI({ url: '/openapi.json' }))`.
4. Run server, open `http://localhost:3000/docs`.
5. Test every endpoint through the UI: create API key, send chat request, check usage.
6. Add descriptions to every route and parameter. Good docs are part of the feature.

**End of Day 13:** You have interactive API docs. You understand why API design matters.

---

### Day 14 — JWT Authentication: User Sessions

**Learn before coding:**
- What is a **JWT**? JSON Web Token — a signed string containing user info. Structure: `header.payload.signature`. Like a tamper-proof ID card.
- What is **signing**? The server creates a token with a secret key. Anyone with the secret can verify the token is genuine. Without the secret, you can't forge it.
- What is a **session**? A period during which a user is authenticated. With JWT, the session lives in the token (no server-side session storage needed).

**Tasks:**
1. Install jose: `npm install jose`.
2. Create `src/lib/jwt.ts`: `signToken(payload)` and `verifyToken(token)` using your `JWT_SECRET` from `.env`.
3. Update `src/middleware/auth.ts`: support BOTH API key (`X-API-Key` header) and JWT (`Authorization: Bearer <token>` header).
4. Create `POST /v1/auth/login`: accepts email/password, verifies against DB, returns JWT.
5. Create `POST /v1/auth/register`: creates user, returns JWT.
6. Test in Swagger UI: register → login → use Bearer token to access protected routes.

**End of Day 14:** Users can log in with sessions. You understand stateless authentication.

---

### Day 15 — Error Handling: Consistent, Helpful Errors

**Learn before coding:**
- What is an **error handler**? Centralized code that catches all errors and returns consistent responses. Without it, uncaught errors crash the server or leak stack traces (security risk).
- What is a **status code**? A 3-digit number telling the client what happened. 200 = success, 400 = your fault, 401 = not logged in, 429 = too fast, 500 = our fault.
- What is **graceful degradation**? When something breaks, the system still responds helpfully instead of crashing.

**Tasks:**
1. Create `src/middleware/error-handler.ts`:
   - Catches all errors (sync and async).
   - If Zod error → 400 with field details.
   - If auth error → 401 with "Authentication required."
   - If rate limit → 429 with `Retry-After`.
   - If provider error → 503 with fallback message.
   - Unknown errors → 500 with generic message (hide details in production).
2. Log every error with Pino: error message, stack trace, request ID, user ID.
3. Test each error type in Swagger UI. Verify responses are consistent.

**End of Day 15:** Your API never crashes the client. You understand production error handling.

---

### Day 16 — Structured Logging with Pino: Production-Grade Observability

**Learn before coding:**
- What is **structured logging**? Every log line is JSON with consistent fields. Machines parse it; dashboards query it. `console.log("User logged in")` is useless at scale.
- What is **Pino**? A fast JSON logger for Node.js. Outputs one JSON line per log entry.
- What is a **request ID**? A unique identifier attached to every request, propagated through all services. Lets you trace one request across logs.

**Tasks:**
1. Install Pino: `npm install pino pino-pretty`.
2. Update `src/middleware/logger.ts`: replace `console.log` with Pino.
   - Log: `level`, `requestId`, `method`, `path`, `statusCode`, `durationMs`, `userId`, `apiKeyId`.
3. Update `src/middleware/request-id.ts`: generate UUID, attach to context, include in every log.
4. Add `pino-pretty` for development (human-readable) and raw JSON for production.
5. Test: make requests, observe structured logs in terminal.

**End of Day 16:** Every request is traceable. You understand why `console.log` doesn't scale.

---

### Day 17 — Docker: Containerize Your Gateway

**Learn before coding:**
- What is a **Dockerfile**? A recipe for building a container image: start from a base image (Node.js), copy files, install dependencies, set command to run.
- What is a **container image**? A packaged, runnable version of your app + environment. Like a ZIP file that includes the operating system, Node.js, your code, and all dependencies.
- What is a **multi-stage build**? Use one image to build (TypeScript compilation), copy only the output to a smaller final image. Reduces attack surface and size.

**Tasks:**
1. Create `Dockerfile`:
   ```dockerfile
   FROM node:22-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:22-alpine
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   COPY package.json .
   EXPOSE 3000
   CMD ["node", "dist/index.js"]
   ```
2. Build: `docker build -t gatekeeper .`
3. Update `docker-compose.yml`: add `app` service that builds from Dockerfile, depends on `postgres` and `redis`.
4. Run: `docker compose up --build`. Test: `curl http://localhost:3000/health`.
5. Verify: changes to source code require rebuild. This teaches the build/run separation.

**End of Day 17:** Your app runs in a container. You understand Docker fundamentals.

---

### Day 18 — Kubernetes (k3s): Orchestrate Your Containers

**Learn before coding:**
- What is **Kubernetes**? A system for managing containers at scale. It decides which machine runs which container, restarts crashed ones, routes traffic, scales up/down.
- What is a **Pod**? The smallest deployable unit in Kubernetes — usually one container (your app) + optionally sidecars.
- What is a **Deployment**? A Kubernetes object that manages Pods: ensures the right number are running, handles rolling updates.
- What is a **Service**? Kubernetes internal networking — gives your Pods a stable DNS name and IP address.
- What is **k3s**? A lightweight Kubernetes distribution. Runs on a single machine for learning. Production uses full Kubernetes (EKS, GKE, AKS).

**Tasks:**
1. Ensure k3s is running: `kubectl get nodes` should show your node.
2. Create `k8s/namespace.yaml`: defines `gatekeeper` namespace.
3. Create `k8s/deployment.yaml`:
   - Image: `gatekeeper:latest` (build and load into k3s: `k3d image import gatekeeper` or use local registry).
   - Replicas: 2 (two pods running simultaneously).
   - Resource limits: 512Mi memory, 500m CPU.
   - Liveness probe: `GET /health` every 10s.
   - Readiness probe: `GET /ready` every 5s.
4. Create `k8s/service.yaml`: ClusterIP on port 3000.
5. Apply: `kubectl apply -f k8s/`. Verify: `kubectl get pods -n gatekeeper`.
6. Port-forward to test: `kubectl port-forward svc/gatekeeper 3000:3000 -n gatekeeper`.

**End of Day 18:** Your app runs in Kubernetes. You understand pods, deployments, and services.

---

### Day 19 — Nginx Ingress: The Front Door

**Learn before coding:**
- What is an **Ingress**? Kubernetes object that routes external HTTP traffic into your cluster. Like a receptionist: "You want /api? Go to the API service."
- What is **Nginx Ingress Controller**? A Kubernetes pod that implements Ingress rules using Nginx. Handles SSL, load balancing, rate limiting at the edge.
- What is **SSL/TLS**? Encryption for HTTP (HTTPS). Certificates prove your server's identity and encrypt data in transit.

**Tasks:**
1. Install Nginx Ingress Controller in k3s: `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml`
2. Create `k8s/ingress.yaml`:
   - Host: `gatekeeper.local` (for local testing).
   - Path `/` → service `gatekeeper` port 3000.
3. Add `gatekeeper.local` to `/etc/hosts` pointing to `127.0.0.1`.
4. Test: `curl http://gatekeeper.local/health`.
5. Explain: Nginx receives the request, routes to a pod, pod responds, Nginx returns to client.

**End of Day 19:** External traffic reaches your cluster. You understand ingress and reverse proxying.

---

### Day 20 — Prometheus & Grafana: See Your System

**Learn before coding:**
- What is **Prometheus**? A time-series database that scrapes metrics from your app. Stores: "At 2:00 PM, there were 150 requests/minute."
- What is **Grafana**? A visualization tool that queries Prometheus and draws dashboards. You see graphs: request rate over time, error spikes, latency percentiles.
- What is a **metric**? A named measurement: `gateway_requests_total{status="200"} 150`. Labels let you slice data.

**Tasks:**
1. Install Prometheus client: `npm install prom-client`.
2. Create `src/lib/metrics.ts`: initialize Prometheus registry, define counters and histograms.
3. Update `src/middleware/logger.ts`: increment `gateway_requests_total` counter per request, observe `gateway_latency_seconds` histogram.
4. Add `GET /metrics` route: returns Prometheus-formatted metrics.
5. Deploy Prometheus in k3s (or use Docker Compose for simplicity while learning).
6. Deploy Grafana, configure datasource = Prometheus.
7. Import dashboard JSON from `grafana/dashboards/gateway-dashboard.json`.
8. Generate traffic: `for i in {1..100}; do curl ...; done`. Watch graphs update in Grafana.

**End of Day 20:** You see your system in real time. You understand why observability is non-negotiable.

---

### Day 21 — OpenTelemetry & Jaeger: Trace Every Request

**Learn before coding:**
- What is **distributed tracing**? Following a single request as it travels through multiple services. Each "span" is one operation with a start time, end time, and metadata.
- What is **OpenTelemetry**? A standard for collecting traces, metrics, and logs. Vendor-neutral: works with Jaeger, Datadog, New Relic.
- What is **Jaeger**? A tool that stores traces and renders them as waterfall diagrams. You see: 50ms in auth, 200ms in Groq, 5ms in cache.

**Tasks:**
1. Install OpenTelemetry: `npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http`.
2. Create `src/lib/telemetry.ts`: initialize tracer, configure OTLP exporter pointing to Jaeger.
3. Create spans in key middleware: `auth span` → `rate-limit span` → `cache span` → `provider span`.
4. Deploy Jaeger in k3s (all-in-one image).
5. Make requests, open Jaeger UI, search by trace ID, see the waterfall.
6. Identify the slowest span. This is your optimization target.

**End of Day 21:** You trace requests through every layer. You understand where time goes.

---

### Day 22 — Provider Failover & Smart Routing: The Gateway Brain

**Learn before coding:**
- What is **failover**? When primary fails, automatically switch to backup. Users shouldn't notice.
- What is **latency-based routing**? Measure each provider's response time, route to the fastest.
- What is **cost-based routing**? Route simple queries to cheap models, complex queries to powerful ones.

**Tasks:**
1. Update `src/services/gateway.ts`:
   - Maintain per-provider latency stats in Redis (exponential moving average).
   - Routing strategy: if user specifies provider, use it. If not:
     - Check circuit breaker. Skip OPEN providers.
     - Pick lowest-latency CLOSED provider.
     - If all closed, try HALF_OPEN.
     - If all failing, return cached response or error.
2. Add `X-Provider-Used` header to responses so users know which model answered.
3. Test: block Groq (disconnect internet), verify requests route to Ollama automatically.

**End of Day 22:** Your gateway is intelligent. You understand production routing strategies.

---

### Day 23 — Advanced Caching: Cache Invalidation & Strategies

**Learn before coding:**
- What is **cache invalidation**? Removing stale cache entries when underlying data changes. One of the two hard problems in computer science (naming things, cache invalidation, off-by-one errors).
- What is **cache warming**? Pre-populating cache with expected data before users request it.
- What is **stale-while-revalidate**? Return cached data immediately (fast), but refresh it in the background (fresh).

**Tasks:**
1. Add cache invalidation endpoint: `POST /v1/cache/invalidate` (admin only) — deletes specific cache keys or patterns.
2. Add cache warming: on startup, pre-cache common queries ("What is JavaScript?", "Explain REST").
3. Add `Cache-Control` headers to responses: `max-age=300, stale-while-revalidate=60`.
4. Monitor cache hit rate in Grafana. Target: >30% for production savings.

**End of Day 23:** You control cache lifecycle. You understand caching strategies beyond "store and retrieve."

---

### Day 24 — Multi-Tenancy: Isolate Customers

**Learn before coding:**
- What is **multi-tenancy**? One application serves multiple customers (tenants) with complete data isolation. Like an apartment building: one structure, separate units.
- What is **row-level security**? Database feature that automatically filters rows based on the current tenant. Prevents accidental cross-tenant data leaks.

**Tasks:**
1. Update schema: add `tenantId` to `users`, `api_keys`, `requests`, `usage` tables.
2. Update auth middleware: extract `X-Tenant-ID` header, attach to context.
3. Update all queries: add `.where(eq(table.tenantId, ctx.get('tenantId')))`.
4. Create tenant-scoped rate limits: each tenant gets their own Redis key space.
5. Test: Tenant A's API key cannot see Tenant B's usage data.

**End of Day 24:** Your gateway serves multiple customers safely. You understand tenant isolation.

---

### Day 25 — Security Hardening: Input Sanitization & Headers

**Learn before coding:**
- What is **input sanitization**? Cleaning user input to prevent attacks. Example: removing `<script>` tags that could execute JavaScript.
- What is **SQL injection**? Attacker sends `"'; DROP TABLE users; --"` as input. Without sanitization, your database executes it.
- What are **security headers**? HTTP headers that tell browsers how to behave: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`.

**Tasks:**
1. Add security headers middleware: Helmet.js equivalent for Hono.
2. Sanitize all string inputs: strip HTML, limit length, validate characters.
3. Add prompt injection detection: regex patterns for common jailbreak attempts.
4. Run security scan: `npm audit` to check for vulnerable dependencies.
5. Add CORS restrictions: only allow specific origins, not `*`.

**End of Day 25:** Your gateway is hardened. You understand security is layered, not a single feature.

---

### Day 26 — Graceful Shutdown & Connection Management

**Learn before coding:**
- What is **graceful shutdown**? When told to stop (SIGTERM), finish in-flight requests, close connections, then exit. Prevents dropped requests during deployments.
- What is a **connection pool**? Reusable database connections. Opening a connection is expensive; pools keep them warm.
- What is a **SIGTERM**? A signal from the operating system saying "please exit soon." Kubernetes sends this before deleting a pod.

**Tasks:**
1. Update `src/index.ts`: listen for `SIGTERM` and `SIGINT`.
2. On shutdown: stop accepting new requests, wait for active requests to finish (max 30s), close Drizzle connection pool, close Redis connection, exit process.
3. Add `server.close()` to stop the HTTP server from accepting new connections.
4. Log shutdown sequence with Pino.
5. Test: `kubectl delete pod gatekeeper-xxx` — watch logs show graceful shutdown.

**End of Day 26:** Your app shuts down cleanly. You understand why this matters for zero-downtime deployments.

---

### Day 27 — Load Testing: Find Breaking Points

**Learn before coding:**
- What is **load testing**? Simulating many users to find where your system breaks. Like stress-testing a bridge.
- What is **k6**? A modern load testing tool. You write JavaScript scenarios: "100 virtual users, each making 10 requests/second."
- What is a **bottleneck**? The slowest part of your system that limits overall throughput. Usually database or external API calls.

**Tasks:**
1. Install k6: [grafana.com/k6](https://grafana.com/k6).
2. Create `tests/load/chat-load.js`:
   ```javascript
   import http from 'k6/http'
   export const options = { vus: 50, duration: '30s' }
   export default function() {
     http.post('http://localhost:3000/v1/chat/completions', JSON.stringify({...}), { headers: {...} })
   }
   ```
3. Run load test: `k6 run tests/load/chat-load.js`.
4. Observe: CPU usage, memory, response times, error rates in Grafana.
5. Identify bottleneck. Optimize: add connection pooling, tune Redis, increase pod replicas.
6. Re-run and compare.

**End of Day 27:** You know your system's limits. You understand performance engineering.

---

### Day 28 — Cloudflare Tunnel: Expose to the Internet

**Learn before coding:**
- What is **Cloudflare Tunnel**? A secure tunnel from your local network to Cloudflare's edge. No public IP needed, no port forwarding, no firewall rules.
- How it works: You run `cloudflared` on your machine. It creates an outbound connection to Cloudflare. Internet traffic flows through this tunnel to your local k3s cluster.
- Why use it? Secure (encrypted), free, no DDoS exposure, custom domain support.

**Tasks:**
1. Install `cloudflared`: [developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup).
2. Authenticate: `cloudflared tunnel login` (opens browser, links to Cloudflare account).
3. Create tunnel: `cloudflared tunnel create gatekeeper`.
4. Configure tunnel in `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: ~/.cloudflared/<TUNNEL_ID>.json
   ingress:
     - hostname: gatekeeper.yourdomain.com
       service: http://localhost:80
     - service: http_status:404
   ```
5. Point DNS: `gatekeeper.yourdomain.com` → tunnel ID in Cloudflare dashboard.
6. Run tunnel: `cloudflared tunnel run gatekeeper`.
7. Test from your phone (different network): `curl https://gatekeeper.yourdomain.com/health`.

**End of Day 28:** Your local cluster is accessible worldwide. You understand secure tunneling.

---

### Day 29 — Documentation & README: Leave a Trail

**Tasks:**
1. Write `README.md`:
   - Project description and architecture diagram (ASCII art is fine).
   - Prerequisites: Node.js 22, Docker, k3s, Cloudflare account.
   - Installation: clone, `npm install`, `docker compose up`, `kubectl apply`.
   - Environment variables: list every `.env` variable with description.
   - API documentation: link to `/docs` (Swagger UI).
   - Deployment: step-by-step to k3s + Cloudflare Tunnel.
   - Architecture decisions: why Hono over Express, why PostgreSQL over MongoDB, why k3s over Docker Compose for production.
2. Write `docs/ARCHITECTURE.md`: system design overview with diagrams.
3. Write `docs/OPERATIONS.md`: how to monitor, scale, troubleshoot.
4. Ensure every `docs/` file is complete and accurate.

**End of Day 29:** Your project is documented. You understand why documentation is a feature, not an afterthought.

---

### Day 30 — Ship Day: Final Polish & Reflection

**Tasks:**
1. Run full test suite: `npm test` (unit + integration).
2. Run load test one final time. Verify performance hasn't regressed.
3. Check Grafana: all dashboards working, no error spikes.
4. Verify Cloudflare Tunnel is stable.
5. Create a GitHub release: tag `v1.0.0`, write release notes.
6. Write a blog post or Twitter thread about what you built. Teaching others solidifies your learning.
7. Reflect: List every concept you learned. Categorize: Networking, Databases, Security, DevOps, AI Integration.
8. Identify gaps: What still feels shaky? Those become your study targets before Project 2.

**End of Day 30:** You have shipped a production-grade AI Gateway. You are no longer a backend beginner.

---

## Copy Planner Prompt

Click to copy a ready-to-paste Claude prompt:

```
I'm building The Gatekeeper — a production-grade AI Gateway. Give me a detailed Day-by-Day 30-day plan. My stack is Node.js, Hono, Drizzle ORM, PostgreSQL, Redis, Docker, k3s, Cloudflare Tunnel, plus Swagger UI, Zod, Groq, Ollama, BullMQ, Prometheus, Grafana, OpenTelemetry, Jaeger, Nginx, bcryptjs, jose, and pino. Today is Day [N]. Walk me through exactly what to build, what to learn, and what files/configs to create. Explain every new term before using it. I have never done backend engineering before.
```

---

## What You Can Build Now That You Couldn't Before Day 0

| Before | After |
|--------|-------|
| "What's a server?" | Deployed a containerized API to Kubernetes |
| "What's a database?" | Designed schemas, wrote migrations, optimized queries |
| "What's caching?" | Implemented Redis caching with TTL and invalidation |
| "What's auth?" | Built JWT + API key authentication with bcrypt hashing |
| "What's rate limiting?" | Enforced tiered rate limits with sliding windows |
| "What's a circuit breaker?" | Survived provider outages with automatic failover |
| "What's observability?" | Traced requests, collected metrics, built dashboards |
| "What's Kubernetes?" | Orchestrated containers with deployments, services, ingress |
| "What's an API gateway?" | Built one that proxies, caches, authenticates, and monitors |

---

## Next: Project 2 — The Librarian (RAG Engine)

The Gatekeeper handles traffic. The Librarian handles knowledge. You'll build a document ingestion pipeline, vector search, and retrieval-augmented generation — all calling through the gateway you just built.
