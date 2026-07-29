# Project 1: Omnieux — AI Gateway

> **Mission:** Build a production-grade AI Gateway that routes LLM requests, manages API keys, enforces rate limits, caches responses, tracks token usage, and fails over between providers — all exposed through a clean Swagger UI. This is the **front door** every other project will talk through.

> **Deployment:** Oracle Cloud Infrastructure (OCI) Always Free Tier. Ubuntu VM. Docker Compose for Redis + Monitoring. PM2 for the Node process. Nginx reverse proxy with Let's Encrypt SSL. No Kubernetes. No Cloudflare.

---

## 1. Project Name

**Omnieux**

> *One front door. Every model. Zero downtime.*

---

## 2. Why?

You're learning backend engineering from zero. Most tutorials teach you to build a "todo API" — but that teaches you almost nothing about how real systems handle traffic, fail gracefully, or scale. **Omnieux** solves a real problem: AI APIs are expensive, unreliable, and slow. Every company using LLMs in production needs a gateway.

By building this, you will learn:
- **How real APIs are structured** — not toy endpoints, but production patterns (rate limiting, auth, caching, circuit breakers)
- **How to think in systems** — every concept maps to a real tool, not abstract theory
- **How to deploy like a senior engineer** — Docker, OCI, Linux VMs, process managers, observability
- **Why gateways exist** — when you build RAG (Project 2), MCP (Project 3), and Agents (Project 4), they will ALL call through this gateway. If the gateway is weak, everything collapses.

This project teaches you **backend fundamentals** better than any CRUD tutorial because every feature solves a real failure mode: "What happens when Groq is down?" "What if someone spams my API?" "How do I know how much I'm spending?"

---

## 3. Stack

### Core Stack

| Tool | Role in This Project |
|------|---------------------|
| **Node.js 22 LTS** | The runtime — executes your JavaScript on the server |
| **Hono** | The web framework — handles HTTP requests, routing, middleware |
| **TypeScript** | Compile-time type safety — prevents category errors before runtime |
| **Oracle AI Database 26ai** | Persistent relational storage — API keys, request logs, usage aggregates. You write raw SQL via the official `oracledb` driver. No ORM. |
| **Redis** | Fast in-memory store — rate limit counters, response cache, circuit breaker state, BullMQ backing |
| **Docker + Docker Compose** | Local dev environment — packages Redis, monitoring stack, and optionally Oracle 26ai Free |
| **PM2** | Production process manager — keeps Node.js alive, handles restarts, clusters processes on the OCI VM |
| **Nginx** | Reverse proxy + load balancer — sits in front of Hono, handles SSL termination, serves Swagger UI static assets |
| **Certbot** | Free Let's Encrypt SSL certificates — auto-renews on the OCI VM |

### Project-Specific Additions

| Tool | Why It's Added |
|------|---------------|
| **Swagger UI (via `@hono/swagger-ui`)** | Auto-generated interactive API docs — click "Try it out" and test every endpoint from the browser. Served directly by Hono. |
| **Zod** | Runtime validation — rejects bad requests before they touch your logic |
| **Groq SDK** | Free/fast LLM provider — `$0` to start, no credit card required |
| **Ollama** | Run models locally — completely free, works offline, zero API keys |
| **BullMQ** | Redis-backed job queue — handles async tasks (log aggregation, usage reporting) without blocking API responses |
| **Prometheus + Grafana** | Metrics collection + visualization — see request rates, latency, error rates in real time |
| **OpenTelemetry + Jaeger** | Distributed tracing — follow a single request through every layer |
| **bcryptjs** | Password hashing — API keys are hashed before storage, never stored plain |
| **jose** | JWT verification — stateless authentication, no session database needed |
| **pino** | Structured JSON logging — every request logged with trace IDs, searchable by tool |
| **dotenv** | Environment variable management — keeps secrets out of code |

### Why No ORM?

Drizzle does not support Oracle. TypeORM's Oracle support is brittle. Prisma does not support Oracle. You will use the official `oracledb` Node.js driver with connection pooling and write raw SQL. This is **better for learning** — you see the queries that hit the database, you understand execution plans, and you are forced to learn SQL properly. An ORM is a productivity tool for teams; raw SQL is a learning tool for engineers.

---

## 4. Directory Structure

```
omnieux/
├── .env                          # Secrets: API keys, DB passwords, JWT secret
├── .env.example                  # Template showing what variables are needed
├── .gitignore                    # Prevents .env and node_modules from being committed
├── docker-compose.yml            # Local dev: Redis + Monitoring + Optional Oracle 26ai Free
├── Dockerfile                    # Production container image for the gateway
├── ecosystem.config.js           # PM2 process manager configuration
├── scripts/
│   ├── setup-oci.sh              # One-shot setup script for OCI VM
│   └── backup-db.sh              # Oracle DB backup script
├── docker/
│   ├── nginx/
│   │   └── nginx.conf            # Nginx reverse proxy config
│   ├── prometheus/
│   │   └── prometheus.yml        # Prometheus scrape config
│   └── grafana/
│       └── dashboards/
│           └── omnieux-dashboard.json
├── docs/
│   ├── 00-backend-fundamentals/
│   │   ├── 01-what-is-an-api.md
│   │   ├── 02-http-request-response-cycle.md
│   │   ├── 03-rest-design-principles.md
│   │   ├── 04-middleware-pattern.md
│   │   ├── 05-routing-and-controllers.md
│   │   ├── 06-error-handling-patterns.md
│   │   └── 07-typescript-fundamentals.md
│   ├── 01-system-design/
│   │   ├── 01-api-gateway-pattern.md
│   │   ├── 02-rate-limiting-algorithms.md
│   │   ├── 03-caching-strategies.md
│   │   ├── 04-circuit-breaker-pattern.md
│   │   ├── 05-failover-and-load-balancing.md
│   │   ├── 06-message-queues-and-async-processing.md
│   │   ├── 07-observability-three-pillars.md
│   │   ├── 08-database-indexing-and-query-optimization.md
│   │   └── 09-scaling-basics.md
│   ├── 02-cloud-and-infrastructure/
│   │   ├── 01-docker-basics.md
│   │   ├── 02-docker-compose-multi-service.md
│   │   ├── 03-nginx-reverse-proxy.md
│   │   ├── 04-ssl-tls-and-certbot.md
│   │   ├── 05-oci-free-tier-deployment.md
│   │   ├── 06-pm2-process-management.md
│   │   ├── 07-systemd-service-management.md
│   │   ├── 08-log-rotation-and-monitoring.md
│   │   └── 09-backup-and-disaster-recovery.md
│   ├── 03-database/
│   │   ├── 01-oracle-26ai-architecture.md
│   │   ├── 02-sql-fundamentals.md
│   │   ├── 03-oracledb-driver-deep-dive.md
│   │   ├── 04-connection-pooling.md
│   │   ├── 05-acid-transactions.md
│   │   ├── 06-indexing-strategies.md
│   │   ├── 07-redis-data-structures.md
│   │   └── 08-redis-persistence-and-eviction.md
│   └── 04-security/
│       ├── 01-authentication-patterns.md
│       ├── 02-jwt-deep-dive.md
│       ├── 03-api-key-security-and-hashing.md
│       ├── 04-input-validation-and-injection-prevention.md
│       └── 05-cors-security-headers.md
├── src/
│   ├── index.ts                  # Entry point: creates Hono app, mounts routes, starts server
│   ├── config/
│   │   ├── env.ts                # Loads and validates .env variables with Zod
│   │   └── database.ts           # oracledb pool initialization
│   ├── routes/
│   │   ├── health.ts             # GET /health — liveness probe
│   │   ├── ready.ts              # GET /ready — readiness probe (checks DB + Redis)
│   │   ├── chat.ts               # POST /v1/chat/completions — main LLM proxy endpoint
│   │   ├── providers.ts          # GET /v1/providers — list configured providers
│   │   ├── keys.ts               # POST /v1/keys — create API key, GET /v1/keys — list
│   │   ├── usage.ts              # GET /v1/usage — token consumption dashboard data
│   │   └── auth.ts               # POST /v1/auth/login and /register
│   ├── middleware/
│   │   ├── logger.ts             # Pino structured logging
│   │   ├── request-id.ts         # Generates UUID per request for tracing
│   │   ├── auth.ts               # JWT verification + API key validation
│   │   ├── rate-limit.ts         # Redis sliding window
│   │   ├── circuit-breaker.ts    # Per-provider state machine
│   │   ├── cache.ts              # Redis response cache
│   │   ├── error-handler.ts      # Global catch-all
│   │   ├── validate.ts           # Zod request body validation
│   │   └── cors.ts               # CORS headers
│   ├── providers/
│   │   ├── interface.ts          # TypeScript interface for all providers
│   │   ├── groq.ts               # Groq adapter
│   │   ├── ollama.ts             # Ollama adapter
│   │   └── openai.ts             # OpenAI adapter (optional)
│   ├── services/
│   │   ├── gateway.ts            # Core routing logic
│   │   ├── usage-tracker.ts      # Records token counts to Oracle
│   │   ├── cache-service.ts      # Redis get/set with TTL
│   │   └── queue-service.ts      # BullMQ job producer
│   ├── workers/
│   │   └── usage-aggregator.ts   # BullMQ consumer
│   ├── db/
│   │   ├── schema.sql            # Raw SQL table definitions
│   │   ├── migrations/           # Versioned SQL migration files (you write these)
│   │   └── seed.sql              # Dev seed data
│   ├── lib/
│   │   ├── redis.ts              # Redis client singleton (ioredis)
│   │   ├── jwt.ts                # Token generation + verification
│   │   ├── hash.ts               # bcryptjs wrapper
│   │   └── telemetry.ts          # OpenTelemetry tracer init
│   ├── types/
│   │   └── index.ts              # Shared TypeScript types
│   └── swagger.ts                # OpenAPI spec + Swagger UI mount
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. System Design Concepts

| # | Concept | Tool | How It's Applied in Omnieux |
|---|---------|------|------------------------------|
| 1 | **HTTP Request/Response Cycle** | Hono | Every request hits Hono's router, flows through middleware stack, reaches handler, returns JSON response. |
| 2 | **REST API Design** | Hono | Endpoints follow REST conventions: `POST /v1/chat/completions` for creation, `GET /v1/usage` for reads, consistent HTTP status codes. |
| 3 | **Middleware Pipeline** | Hono | Requests flow through: `request-id` → `logger` → `cors` → `rate-limit` → `auth` → `cache` → `circuit-breaker` → handler. Order matters. |
| 4 | **Request Routing** | Hono | Hono's router directs `/v1/chat/completions` to the chat handler, `/health` to the health probe. |
| 5 | **Rate Limiting (Sliding Window)** | Redis | Counts requests in the last 60 seconds using Redis sorted sets (`ZADD` + `ZREMRANGEBYSCORE`). Prevents burst attacks at window boundaries. |
| 6 | **Circuit Breaker Pattern** | Redis | Per-provider state stored in Redis: `CLOSED` (normal), `OPEN` (failing, reject fast), `HALF_OPEN` (test with 1 request). |
| 7 | **Response Caching (Exact Match)** | Redis | Hash the request body → Redis key. On identical requests, return cached response in <1ms. TTL = 5 minutes. |
| 8 | **Authentication (JWT)** | jose + Oracle | Users log in → server signs a JWT → client sends `Authorization: Bearer <token>` → middleware verifies. No session DB needed. |
| 9 | **Authentication (API Keys)** | bcryptjs + Oracle | Service-to-service auth: generate random key → hash with bcrypt → store hash in Oracle. Never store plain keys. |
| 10 | **Authorization (RBAC)** | Oracle | Role-based access control: `free` tier gets 100 req/day, `pro` gets 10,000. Stored in `users.tier` column. |
| 11 | **Input Validation** | Zod | Every request body validated against a Zod schema before touching business logic. Invalid requests return `400`. |
| 12 | **Database Connection Pooling** | Oracle + `oracledb` | Maintain a pool of reusable Oracle connections. `oracledb` handles this; you configure pool size (e.g., 10). |
| 13 | **Database Indexing** | Oracle | Indexes on `api_keys.hash` (fast lookup), `requests.created_at` (fast time-range queries), `users.email` (fast login). |
| 14 | **ACID Transactions** | Oracle + `oracledb` | When recording a request + updating usage, wrap in a transaction. All succeed or all rollback. |
| 15 | **Structured Logging** | pino | Every log line is JSON: `{"level":"info","requestId":"abc","method":"POST","path":"/v1/chat","durationMs":245,"status":200}`. |
| 16 | **Distributed Tracing** | OpenTelemetry + Jaeger | Each request gets a `trace_id` propagated through all services. Pinpoints bottlenecks. |
| 17 | **Metrics Collection** | Prometheus | Prometheus scrapes `/metrics` every 15s, collecting: `gateway_requests_total`, `gateway_latency_seconds`. |
| 18 | **Health Checks (Liveness)** | Hono | `GET /health` returns 200 if the Node.js process is running. PM2 restarts if this fails. |
| 19 | **Health Checks (Readiness)** | Hono + Oracle + Redis | `GET /ready` returns 200 only if DB and Redis are reachable. Nginx stops sending traffic until ready. |
| 20 | **Graceful Shutdown** | Node.js + PM2 | On SIGTERM, stop accepting new requests, finish in-flight requests, close Oracle pool + Redis, then exit. |
| 21 | **Reverse Proxy** | Nginx | Nginx sits in front of Hono: terminates SSL (HTTPS), routes `/` to Hono, serves static files, adds security headers. |
| 22 | **Containerization** | Docker | Dockerfile defines the environment. Same image runs locally and in CI. |
| 23 | **Process Management** | PM2 | PM2 keeps the Node.js process alive on the OCI VM, handles restarts, clusters mode, log rotation. |
| 24 | **SSL/TLS Termination** | Nginx + Certbot | Nginx handles HTTPS. Certbot auto-renews Let's Encrypt certificates. |
| 25 | **Secrets Management** | dotenv + OCI | Local dev: `.env` file. Production: environment variables on the OCI VM. Never commit secrets to Git. |
| 26 | **API Gateway Pattern** | Architecture | Single entry point for all LLM traffic. Routes to providers, normalizes responses, handles auth, caching, failover. |
| 27 | **Provider Failover** | gateway.ts | If Groq returns 5xx or times out, automatically try Ollama (local). If Ollama fails, return cached response or graceful error. |
| 28 | **Request/Response Normalization** | gateway.ts | All providers speak different APIs. Gateway adapters translate every response into a single unified format. |
| 29 | **Token Usage Tracking** | Oracle + BullMQ | Every request records: model, provider, input tokens, output tokens, cost. BullMQ worker aggregates hourly. |
| 30 | **Background Job Processing** | BullMQ | Don't block API responses with slow work. Queue tasks: "aggregate usage". Worker processes asynchronously. |
| 31 | **Cross-Origin Resource Sharing (CORS)** | Hono | Browser security blocks cross-origin calls. CORS middleware adds `Access-Control-Allow-Origin` headers. |
| 32 | **Environment Configuration** | dotenv + Zod | `.env` file stores secrets. `config/env.ts` validates with Zod at startup — missing vars crash immediately with clear error. |
| 33 | **API Documentation (OpenAPI/Swagger)** | @hono/swagger-ui | Hono's Zod schemas auto-generate OpenAPI spec. Swagger UI renders interactive docs at `/docs`. |
| 34 | **Graceful Degradation** | gateway.ts | When everything fails, return a helpful error: `{error: "All providers unavailable", retryAfter: 60}`. Never crash the client. |
| 35 | **Observability (The Three Pillars)** | pino + Prometheus + Jaeger | **Logs** (what happened), **Metrics** (how much), **Traces** (where time went). Together they answer: "Why was this request slow?" |

---

## 6. 30-Day Planner

> **Rule:** I will NOT give you code. I will tell you what files to create, what docs to read, and what concepts to understand. You write the code yourself from the docs.

---

### Day 0 — Environment Setup: Install Everything, No Code Yet

**Before touching anything, learn:**
- What is a **terminal**? A text-based interface to your computer. On Mac: Terminal or iTerm2. On Windows: PowerShell or Git Bash.
- What is **Node.js**? A program that runs JavaScript outside the browser.
- What is **npm**? Node Package Manager — downloads libraries written by other developers.
- What is **Git**? Version control — a time machine for your code.
- What is a **.env file**? Stores secrets that your code reads but never commits to Git.
- What is **Docker**? Packages your app + dependencies into a "container" — a sealed box that runs the same everywhere.
- What is **Oracle AI Database 26ai**? The free database you already installed. It stores data in tables and answers queries fast.
- What is **Redis**? A super-fast in-memory database — data lives in RAM. Perfect for temporary data: caches, rate limit counters.

**Read these docs in this order. Do not skip.**

1. **Node.js 22 LTS Overview**
   - Read: https://nodejs.org/docs/latest-v22.x/api/
   - Read only the "About this Documentation" and "Usage and example" sections. Stop before individual module APIs.

2. **TypeScript Fundamentals**
   - Read: https://www.typescriptlang.org/docs/handbook/2/basic-types.html
   - Read: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html

3. **Hono Philosophy**
   - Read: https://hono.dev/docs/concepts/philosophy

4. **Docker Overview**
   - Read: https://docs.docker.com/get-started/docker-overview/

5. **Docker Compose Getting Started**
   - Read: https://docs.docker.com/compose/gettingstarted/ (Read through Step 4. Stop before the code.)

6. **Oracle AI Database 26ai Free — What It Is**
   - Read: https://www.oracle.com/database/free/
   - Read: https://docs.oracle.com/en/database/oracle/oracle-database/26/xeinl/

7. **Oracle 26ai Docker Container (Optional for Local Dev)**
   - Read: https://www.oracle.com/database/free/get-started/ (Scroll to "Run the Oracle AI Database 26ai Free Container Image")
   - Read: https://github.com/shakiyam/Oracle-AI-Database-26ai-Free-on-Docker

8. **Redis Getting Started**
   - Read: https://redis.io/docs/latest/get-started/

**Tasks:**
1. Install Node.js 22 LTS from https://nodejs.org. Verify: `node --version` should print `v22.x.x`.
2. Install Git. Verify: `git --version`.
3. Install Docker Desktop. Verify: `docker --version`.
4. Install a code editor: VS Code or Cursor.
5. Create a GitHub account if you don't have one. Create a new repository called `omnieux`.
6. Clone it locally: `git clone https://github.com/YOUR_USERNAME/omnieux.git`
7. Open the folder in VS Code.
8. Create the entire directory structure above. Every folder must exist. Every file can be empty for now.
9. Run `npm init -y` to create `package.json`.
10. Create `.gitignore` with: `node_modules/`, `.env`, `dist/`, `*.log`.
11. Create `.env.example` as an empty file (you will fill it later).
12. Create `docs/00-backend-fundamentals/00-day0-debrief.md`.

**In `docs/00-backend-fundamentals/00-day0-debrief.md`, answer these questions in plain English. Close the tabs and write from memory:**
1. Why does Node.js use an event loop instead of spawning a new OS thread for every HTTP request?
2. What is the difference between a Docker **image** and a Docker **container**? What happens to container filesystem data when the container stops?
3. Why is Redis called an "in-memory data structure store" rather than just a "database"? What happens to Redis data if you restart the Redis process without persistence configured?
4. You chose Oracle 26ai over PostgreSQL. What is the **architectural cost** of this choice for a Node.js project? (Think: ORM support, community examples, Docker image size, driver complexity.)
5. Draw the request flow for your API Gateway: `Client → Nginx → Hono → [Middleware Stack] → Provider → Response`. List what happens at each hop.

**End of Day 0:** You have an empty project skeleton, all tools installed, and a Git repo ready. You understand what each tool does and why it exists.

---

### Day 1 — Hello Hono: Your First Web Server

**Learn before coding:**
- What is a **web server**? A program that listens for HTTP requests and sends back responses.
- What is **HTTP**? The language browsers and servers speak.
- What is a **port**? A number that identifies which program should receive network traffic.
- What is **Hono**? A lightweight web framework for Node.js. Handles routing and middleware.

**Read these docs:**
1. **Hono Node.js Getting Started**
   - Read: https://hono.dev/docs/getting-started/nodejs
   - Read the entire page. Understand `app.get()`, `app.use()`, and the request lifecycle.

2. **HTTP Methods (MDN)**
   - Read: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods

**Tasks:**
1. Install Hono: `npm install hono`
2. Install TypeScript dev dependencies: `npm install -D typescript tsx`
3. Run `npx tsc --init` to create `tsconfig.json`.
4. Create `src/index.ts`. Write a basic Hono app with two routes: `GET /` returning "Hello from Omnieux!" and `GET /health` returning `{ status: "ok" }`. Do this from the Hono docs — do not copy from tutorials.
5. Add a `"dev"` script to `package.json` that runs `tsx src/index.ts`.
6. Run `npm run dev`. Open `http://localhost:3000` in your browser.
7. Test `/health` with your browser and with `curl http://localhost:3000/health`
8. Create `docs/00-backend-fundamentals/01-what-is-an-api.md`. Write a 3-paragraph summary of what an API is and how Hono handles the request/response cycle.

**End of Day 1:** You have a running web server. You understand the request/response cycle conceptually.

---

### Day 2 — TypeScript & Project Structure: Type Safety from Day One

**Learn before coding:**
- What is **TypeScript**? JavaScript with types. The compiler catches type errors before you run the code.
- What is a **type**? A contract describing what shape data has.
- What is **tsconfig.json**? Configuration for the TypeScript compiler.
- What is **tsx**? A tool that runs TypeScript directly without manual compilation.

**Read these docs:**
1. **TypeScript tsconfig Reference**
   - Read: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html

2. **Hono Middleware Pattern**
   - Read: https://hono.dev/docs/concepts/middleware

**Tasks:**
1. Configure `tsconfig.json`: set `"strict": true`, `"outDir": "./dist"`, `"rootDir": "./src"`, `"esModuleInterop": true`, `"moduleResolution": "bundler"`.
2. Create `src/types/index.ts`. Define these types yourself based on what you know about the project: `Provider`, `ChatRequest`, `ChatResponse`, `ApiKey`, `User`. Use interfaces and type aliases.
3. Create `src/config/env.ts`. This file should read `PORT` from `process.env.PORT` and default to `3000`. Type it as `number`.
4. Create `src/middleware/logger.ts`. Write a simple middleware that prints `[METHOD] PATH` for every request. Use `console.log` for now — you will replace it with Pino later.
5. Mount the logger in `src/index.ts` using `app.use()`.
6. Test: every request should now print to your terminal.
7. Create `src/routes/health.ts` as a separate file. Import it into `src/index.ts`. This teaches modular routing.
8. Create `docs/00-backend-fundamentals/02-http-request-response-cycle.md`. Explain the lifecycle of an HTTP request from browser to response.

**End of Day 2:** Your code is typed and modular. You understand why types prevent bugs.

---

### Day 3 — Oracle 26ai & Raw SQL: Your First Database

**Learn before coding:**
- What is **SQL**? Structured Query Language — how you talk to relational databases.
- What is **`oracledb`**? The official Node.js driver for Oracle Database.
- What is a **connection pool**? A cache of database connections that can be reused.
- What is a **schema**? The structure of your database: tables, columns, types.
- What is a **migration**? A script that transforms the database from one schema version to another.

**Read these docs:**
1. **node-oracledb Getting Started**
   - Read: https://node-oracledb.readthedocs.io/en/latest/user_guide/introduction.html
   - Read: https://node-oracledb.readthedocs.io/en/latest/user_guide/installation.html

2. **node-oracledb Connection Pooling**
   - Read: https://node-oracledb.readthedocs.io/en/latest/user_guide/connection_pooling.html

3. **Oracle 26ai SQL Reference (Introduction only)**
   - Read: https://docs.oracle.com/en/database/oracle/oracle-database/26/sqlrf/

4. **Oracle 26ai Free Container Image**
   - Read: https://www.oracle.com/database/free/get-started/

**Tasks:**
1. Install `oracledb`: `npm install oracledb`
2. If running Oracle locally in Docker, pull and start the Oracle 26ai Free container:
   ```
   docker pull container-registry.oracle.com/database/free:latest
   ```
   Follow the container startup instructions from the Oracle docs.
3. Create `src/config/database.ts`. Initialize an `oracledb` connection pool pointing to your Oracle instance. Use the docs — figure out the correct pool configuration.
4. Create `src/db/schema.sql`. Write raw SQL to create your first table: `users` with columns `id`, `email`, `password_hash`, `tier`, `created_at`. Use Oracle data types (`NUMBER GENERATED ALWAYS AS IDENTITY`, `VARCHAR2`, `TIMESTAMP`).
5. Connect to your Oracle database using SQL*Plus, SQL Developer, or SQLcl. Run your `schema.sql` manually.
6. Create `docs/03-database/01-oracle-26ai-architecture.md`. Explain: What is a PDB (Pluggable Database) in Oracle 26ai? What is the difference between `CDB$ROOT` and `FREEPDB1`? Why does this matter for your connection string?

**End of Day 3:** You have a running Oracle database with a schema. You understand tables, columns, and why you are writing raw SQL instead of using an ORM.

---

### Day 4 — Redis: The Speed Layer

**Learn before coding:**
- What is **Redis**? A database that stores everything in memory (RAM). Reads/writes in microseconds.
- What is a **key-value store**? Data stored as pairs. No tables, no joins — just fast lookups.
- What is **ioredis**? A Node.js client for Redis.
- Why Redis alongside Oracle? Oracle is for permanent data. Redis is for fast temporary data.

**Read these docs:**
1. **Redis Data Types**
   - Read: https://redis.io/docs/latest/develop/data-types/ (Focus on Strings, Hashes, Sorted Sets)

2. **ioredis GitHub / README**
   - Read: https://github.com/redis/ioredis

**Tasks:**
1. Add Redis to `docker-compose.yml`: image `redis:7-alpine`, port `6379`.
2. Run `docker compose up -d redis`.
3. Install ioredis: `npm install ioredis`
4. Create `src/lib/redis.ts`: a singleton Redis client connecting to `redis://localhost:6379`.
5. Create a test script `src/db/test-redis.ts` that sets a key with a 60-second expiry and reads it back. Run it with `tsx`.
6. Create `docs/03-database/07-redis-data-structures.md`. Explain: What are Redis Strings, Hashes, and Sorted Sets? Which one will you use for rate limiting and why?

**End of Day 4:** You can read and write to Redis. You understand when to use Redis vs Oracle.

---

### Day 5 — API Keys & Authentication: Who Can Use Your Gateway?

**Learn before coding:**
- What is **authentication**? Proving who you are.
- What is an **API key**? A secret string that identifies which application is calling your API.
- What is **bcrypt**? A hashing algorithm. Stores scrambled versions of secrets.
- What is **UUID**? A random string impossible to guess.

**Read these docs:**
1. **bcryptjs README**
   - Read: https://github.com/dcodeIO/bcrypt.js

2. **UUID npm package**
   - Read: https://github.com/uuidjs/uuid

**Tasks:**
1. Install bcryptjs: `npm install bcryptjs` and types: `npm install -D @types/bcryptjs`
2. Install UUID: `npm install uuid` and types: `npm install -D @types/uuid`
3. Update `src/db/schema.sql`: add `api_keys` table with columns: `id`, `key_hash`, `name`, `tier`, `created_at`, `expires_at`. Use Oracle types.
4. Run the new SQL against your Oracle database manually.
5. Create `src/lib/hash.ts`: write functions `hashKey(plainKey)` and `compareKey(plainKey, hash)` using bcryptjs. Read the bcryptjs docs to figure out the salt rounds.
6. Create `src/routes/keys.ts`: `POST /v1/keys` generates a new API key (return plain key ONCE), hashes it, stores in Oracle via raw SQL. `GET /v1/keys` lists all keys.
7. Create `src/middleware/auth.ts`: reads `X-API-Key` header, looks up hash in Oracle, compares with bcryptjs. If valid, attach `apiKey` object to Hono context.
8. Create `docs/04-security/03-api-key-security-and-hashing.md`. Explain: Why do we hash API keys? Why not store them plain? Why use bcrypt instead of SHA-256?

**End of Day 5:** You have working API key authentication. You understand hashing, UUIDs, and middleware.

---

### Day 6 — Rate Limiting: Stop the Spammers

**Learn before coding:**
- What is **rate limiting**? Restricting how many requests a user can make in a time window.
- What is a **sliding window**? Counts requests in the LAST 60 seconds continuously.
- What is a **Redis sorted set**? A Redis data type with scores (timestamps).

**Read these docs:**
1. **Rate Limiting Patterns (Redis)**
   - Read: https://redis.io/glossary/rate-limiting/

2. **Redis ZADD, ZREMRANGEBYSCORE, ZCARD**
   - Read: https://redis.io/docs/latest/commands/zadd/
   - Read: https://redis.io/docs/latest/commands/zremrangebyscore/
   - Read: https://redis.io/docs/latest/commands/zcard/

**Tasks:**
1. Create `src/middleware/rate-limit.ts`:
   - Read `apiKey.tier` from context.
   - Free tier: 10 requests/minute. Pro: 100/minute. Enterprise: 1000/minute.
   - Use Redis `ZADD` to record request timestamp, `ZREMRANGEBYSCORE` to remove old entries, `ZCARD` to count current window.
   - If count > limit, return `429 Too Many Requests` with `Retry-After` header.
2. Mount the middleware in `src/index.ts` AFTER auth middleware.
3. Test: make 11 requests rapidly with a free-tier key. The 11th should return 429.
4. Add `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers.
5. Create `docs/01-system-design/02-rate-limiting-algorithms.md`. Compare Token Bucket vs Sliding Window. Why did you choose Sliding Window?

**End of Day 6:** Your gateway rejects excessive requests. You understand why rate limiting is essential for production APIs.

---

### Day 7 — Groq Integration: Your First LLM Provider

**Learn before coding:**
- What is **Groq**? A company that runs LLMs on LPUs — inference is extremely fast. Free tier available.
- What is an **API adapter**? A wrapper that translates your internal format to a provider's format and back.
- What is **fetch** in Node.js? The built-in way to make HTTP requests.

**Read these docs:**
1. **Groq API Documentation**
   - Read: https://console.groq.com/docs/quickstart

2. **Groq SDK npm**
   - Read: https://www.npmjs.com/package/groq-sdk

**Tasks:**
1. Sign up at https://groq.com, get a free API key.
2. Install Groq SDK: `npm install groq-sdk` OR decide to use raw `fetch`. Make the choice and justify it in your docs.
3. Create `src/providers/interface.ts`: define the `LLMProvider` interface — every provider must implement `chatCompletion(request)`.
4. Create `src/providers/groq.ts`: implement the interface. Map your `ChatRequest` to Groq's format, call their API, normalize the response into your own format.
5. Create `src/routes/chat.ts`: `POST /v1/chat/completions` — reads request body, picks provider (hardcode Groq for now), forwards request, returns normalized response.
6. Test with curl (include your API key header).
7. Create `docs/01-system-design/01-api-gateway-pattern.md`. Explain: What is an API Gateway? Why does the frontend talk to the Gateway instead of directly to Groq?

**End of Day 7:** Your gateway proxies requests to Groq. You understand adapters and API normalization.

---

### Day 8 — Ollama Integration: Free Local Models

**Learn before coding:**
- What is **Ollama**? A tool that downloads and runs open-source LLMs on your own computer.
- What is a **local inference server**? Ollama exposes an HTTP API at `http://localhost:11434`.

**Read these docs:**
1. **Ollama Download**
   - Read: https://ollama.com/download

2. **Ollama API Documentation**
   - Read: https://github.com/ollama/ollama/blob/main/docs/api.md

**Tasks:**
1. Install Ollama.
2. Pull a model: `ollama pull llama3.2`
3. Verify Ollama is running: `curl http://localhost:11434/api/tags`
4. Create `src/providers/ollama.ts`: implements `LLMProvider`. Calls `POST http://localhost:11434/api/chat`.
5. Update `src/services/gateway.ts`: add provider selection logic. If request specifies `provider: "ollama"`, use Ollama. Otherwise default to Groq.
6. Test both providers through your gateway. Compare response times.
7. Create `docs/01-system-design/05-failover-and-load-balancing.md`. Explain: What are the trade-offs between cloud and local providers?

**End of Day 8:** Your gateway supports both cloud and local providers.

---

### Day 9 — Circuit Breaker: Surviving Provider Outages

**Learn before coding:**
- What is a **circuit breaker**? A pattern that stops calling a failing service temporarily.
- States: **CLOSED** (normal), **OPEN** (failing, reject fast), **HALF_OPEN** (test with 1 request).

**Read these docs:**
1. **Circuit Breaker Pattern (Martin Fowler)**
   - Read: https://martinfowler.com/bliki/CircuitBreaker.html

**Tasks:**
1. Create `src/middleware/circuit-breaker.ts`:
   - Per-provider state stored in Redis (key: `circuit:provider:groq`).
   - Track failures: if 5 errors in 60 seconds, OPEN the circuit.
   - In OPEN state: reject immediately with `503 Service Unavailable` and `Retry-After: 60`.
   - After 60 seconds: HALF_OPEN. Allow 1 request. If success, CLOSE. If fail, OPEN again.
2. Integrate into `gateway.ts`: before calling any provider, check circuit state.
3. Test: temporarily disconnect internet. Requests to Groq should fail fast (not hang).
4. Create `docs/01-system-design/04-circuit-breaker-pattern.md`. Draw the state machine diagram.

**End of Day 9:** Your gateway fails gracefully. You understand why cascading failures destroy systems.

---

### Day 10 — Response Caching: Speed Without Cost

**Learn before coding:**
- What is **caching**? Storing a copy of expensive-to-compute data.
- What is a **cache key**? A unique identifier for cached data.
- What is **TTL**? Time To Live — how long a cache entry survives.

**Read these docs:**
1. **Redis Expire / TTL**
   - Read: https://redis.io/docs/latest/commands/expire/

**Tasks:**
1. Create `src/services/cache-service.ts`:
   - `generateKey(request)` → SHA-256 hash of normalized request JSON.
   - `get(key)` → check Redis. If exists, return parsed JSON.
   - `set(key, response, ttlSeconds)` → store in Redis with `EX`.
2. Create `src/middleware/cache.ts`:
   - Before calling provider, check cache.
   - If cache hit, return immediately with `X-Cache: HIT`.
   - If cache miss, call provider, store response, return with `X-Cache: MISS`.
3. Test: send identical request twice. Second should be instant.
4. Create `docs/01-system-design/03-caching-strategies.md`. Explain: What is exact-match caching? When does it break for LLM requests?

**End of Day 10:** Core backend scaffolding complete.

---

### Day 11 — Zod Validation: Never Trust the Client

**Learn before coding:**
- What is **validation**? Checking that incoming data matches expectations.
- What is **Zod**? A TypeScript-first validation library.

**Read these docs:**
1. **Zod Documentation**
   - Read: https://zod.dev/

**Tasks:**
1. Install Zod: `npm install zod`
2. Create `src/config/schema.ts`:
   - `ChatRequestSchema`: model (string), messages (array), temperature (number, min 0, max 2, optional).
   - `CreateKeySchema`: name (string, min 1, max 100), tier (enum).
3. Create `src/middleware/validate.ts`: generic middleware that takes a Zod schema, validates `c.req.json()`, returns `400` with field errors.
4. Apply to all routes.
5. Test: send `{"temperature": 999}` → should get `400`.
6. Create `docs/04-security/04-input-validation-and-injection-prevention.md`. Explain: How does Zod prevent SQL injection?

**End of Day 11:** Bad requests are rejected with clear errors.

---

### Day 12 — Usage Tracking: Know Your Spend

**Learn before coding:**
- What is **tokenization**? LLMs count tokens, not words.
- What is **BullMQ**? A Redis-backed job queue.

**Read these docs:**
1. **BullMQ Documentation**
   - Read: https://docs.bullmq.io/

2. **BullMQ Quick Start**
   - Read: https://docs.bullmq.io/guide/getting-started

**Tasks:**
1. Install BullMQ: `npm install bullmq`
2. Update `src/db/schema.sql`: add `requests` table and `usage` table. Run the SQL.
3. Create `src/services/queue-service.ts`: initialize BullMQ queue.
4. Create `src/workers/usage-aggregator.ts`: BullMQ worker.
5. Update `gateway.ts`: after successful provider call, queue a job.
6. Run the worker: `tsx src/workers/usage-aggregator.ts`
7. Create `docs/01-system-design/06-message-queues-and-async-processing.md`. Explain: Why queue usage tracking instead of writing directly to Oracle in the request handler?

**End of Day 12:** You track every token. You understand why background jobs prevent API slowdown.

---

### Day 13 — Swagger UI: See Your API Come Alive

**Read these docs:**
1. **@hono/swagger-ui**
   - Read: https://github.com/honojs/middleware/tree/main/packages/swagger-ui

2. **OpenAPI Specification (Introduction)**
   - Read: https://swagger.io/docs/specification/v3_0/basic-structure/

**Tasks:**
1. Install: `npm install @hono/swagger-ui`
2. Create `src/swagger.ts`: define OpenAPI spec, register routes.
3. Mount Swagger UI at `/docs`.
4. Run server, open `http://localhost:3000/docs`.
5. Test every endpoint through the UI.
6. Create `docs/00-backend-fundamentals/01-what-is-an-api.md` (update it). Add: Why is Swagger UI valuable even if you don't have a frontend team?

**End of Day 13:** You have interactive API docs.

---

### Day 14 — JWT Authentication: User Sessions

**Read these docs:**
1. **jose Documentation**
   - Read: https://github.com/panva/jose

2. **JWT.io Introduction**
   - Read: https://jwt.io/introduction

**Tasks:**
1. Install jose: `npm install jose`
2. Create `src/lib/jwt.ts`: `signToken` and `verifyToken`.
3. Update `src/middleware/auth.ts`: support BOTH API key and JWT.
4. Create `POST /v1/auth/login` and `POST /v1/auth/register`.
5. Test in Swagger UI.
6. Create `docs/04-security/02-jwt-deep-dive.md`. Explain: What are header, payload, and signature? Why is JWT stateless?

**End of Day 14:** Users can log in with sessions.

---

### Day 15 — Error Handling: Consistent, Helpful Errors

**Tasks:**
1. Create `src/middleware/error-handler.ts`:
   - Zod error → 400
   - Auth error → 401
   - Rate limit → 429 with `Retry-After`
   - Provider error → 503
   - Unknown → 500 (hide details in production)
2. Log every error with Pino (or console for now).
3. Test each error type.
4. Create `docs/00-backend-fundamentals/06-error-handling-patterns.md`. Compare centralized vs decentralized error handling.

**End of Day 15:** Your API never crashes the client.

---

### Day 16 — Structured Logging with Pino

**Read these docs:**
1. **Pino Documentation**
   - Read: https://github.com/pinojs/pino

**Tasks:**
1. Install Pino: `npm install pino pino-pretty`
2. Update `src/middleware/logger.ts`: replace `console.log` with Pino.
3. Update `src/middleware/request-id.ts`: generate UUID per request.
4. Create `docs/01-system-design/07-observability-three-pillars.md`. Explain: What are logs, metrics, and traces?

**End of Day 16:** Every request is traceable.

---

### Day 17 — Docker: Containerize Your Gateway

**Read these docs:**
1. **Dockerfile Reference**
   - Read: https://docs.docker.com/reference/dockerfile/

2. **node-oracledb Docker Instructions**
   - Read: https://node-oracledb.readthedocs.io/en/latest/user_guide/installation.html#docker

**Tasks:**
1. Create `Dockerfile`. Multi-stage build: builder stage compiles TypeScript, final stage runs `node dist/index.js`. You MUST install Oracle Instant Client in the final stage or use `oracledb` thick mode. Read the node-oracledb Docker docs carefully.
2. Build: `docker build -t omnieux .`
3. Update `docker-compose.yml`: add `app` service.
4. Run: `docker compose up --build`. Test.
5. Create `docs/02-cloud-and-infrastructure/01-docker-basics.md`. Explain: What is a multi-stage build? Why is the Oracle Instant Client needed in the container?

**End of Day 17:** Your app runs in a container.

---

### Day 18 — Oracle Cloud Free Tier: Provision Your VPS

**Read these docs:**
1. **OCI Always Free Tier**
   - Read: https://www.oracle.com/cloud/free/

2. **OCI Compute Instance Setup**
   - Read: https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/configuringimagecapabilities.htm

**Tasks:**
1. Create an Oracle Cloud account.
2. Launch an Always Free VM: Ubuntu 22.04, ARM or AMD shape.
3. Configure the VCN security list: open ports 22 (SSH), 80 (HTTP), 443 (HTTPS).
4. SSH into your VM: `ssh ubuntu@YOUR_PUBLIC_IP`
5. Install Docker on the VM.
6. Create `docs/02-cloud-and-infrastructure/05-oci-free-tier-deployment.md`. Document your VM specs, IP address, and security rules.

**End of Day 18:** You have a live Linux server on the internet.

---

### Day 19 — Nginx & SSL: The Front Door

**Read these docs:**
1. **Nginx Beginner's Guide**
   - Read: https://nginx.org/en/docs/beginners_guide.html

2. **Certbot Instructions for Nginx on Ubuntu**
   - Read: https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal

**Tasks:**
1. Install Nginx on your OCI VM: `sudo apt install nginx`
2. Install Certbot: `sudo apt install certbot python3-certbot-nginx`
3. Create `docker/nginx/nginx.conf` locally. Configure reverse proxy to `localhost:3000`.
4. Copy the config to your VM: `/etc/nginx/sites-available/omnieux`
5. Enable site, test Nginx config, reload.
6. Run Certbot: `sudo certbot --nginx`
7. Test: `curl https://your-domain.com/health`
8. Create `docs/02-cloud-and-infrastructure/03-nginx-reverse-proxy.md` and `04-ssl-tls-and-certbot.md`.

**End of Day 19:** External traffic reaches your server over HTTPS.

---

### Day 20 — Prometheus & Grafana: See Your System

**Read these docs:**
1. **Prometheus Getting Started**
   - Read: https://prometheus.io/docs/introduction/overview/

2. **Grafana Getting Started**
   - Read: https://grafana.com/docs/grafana/latest/getting-started/

**Tasks:**
1. Install prom-client: `npm install prom-client`
2. Create `src/lib/metrics.ts`: initialize registry, define counters and histograms.
3. Add `GET /metrics` route.
4. Add Prometheus and Grafana services to `docker-compose.yml`.
5. Deploy on OCI VM: `docker compose up -d prometheus grafana`
6. Configure Grafana datasource = Prometheus.
7. Generate traffic and watch graphs.
8. Create `docs/01-system-design/07-observability-three-pillars.md` (update it). Add metrics section.

**End of Day 20:** You see your system in real time.

---

### Day 21 — OpenTelemetry & Jaeger: Trace Every Request

**Read these docs:**
1. **OpenTelemetry Node.js**
   - Read: https://opentelemetry.io/docs/instrumentation/js/

2. **Jaeger Getting Started**
   - Read: https://www.jaegertracing.io/docs/2.0/getting-started/

**Tasks:**
1. Install OpenTelemetry packages.
2. Create `src/lib/telemetry.ts`.
3. Create spans in key middleware.
4. Add Jaeger to `docker-compose.yml`.
5. Deploy, make requests, open Jaeger UI.
6. Identify the slowest span.

**End of Day 21:** You trace requests through every layer.

---

### Day 22 — Provider Failover & Smart Routing

**Tasks:**
1. Update `src/services/gateway.ts`:
   - Maintain per-provider latency stats in Redis.
   - Routing: circuit breaker check → lowest latency → fallback.
2. Add `X-Provider-Used` header.
3. Test: block Groq, verify failover to Ollama.
4. Create `docs/01-system-design/05-failover-and-load-balancing.md` (update it).

**End of Day 22:** Your gateway is intelligent.

---

### Day 23 — Advanced Caching

**Tasks:**
1. Add cache invalidation endpoint: `POST /v1/cache/invalidate` (admin only).
2. Add cache warming on startup.
3. Add `Cache-Control` headers.
4. Create `docs/01-system-design/03-caching-strategies.md` (update it).

**End of Day 23:** You control cache lifecycle.

---

### Day 24 — Multi-Tenancy

**Tasks:**
1. Update schema: add `tenant_id` to all tables.
2. Update auth middleware: extract `X-Tenant-ID`.
3. Update all queries: add `WHERE tenant_id = :tenantId`.
4. Create tenant-scoped rate limits.
5. Create `docs/01-system-design/09-scaling-basics.md`. Explain: What is multi-tenancy and why is it hard?

**End of Day 24:** Your gateway serves multiple customers safely.

---

### Day 25 — Security Hardening

**Tasks:**
1. Add security headers middleware.
2. Sanitize string inputs.
3. Add prompt injection detection.
4. Run `npm audit`.
5. Restrict CORS origins.
6. Create `docs/04-security/05-cors-security-headers.md`.

**End of Day 25:** Your gateway is hardened.

---

### Day 26 — Graceful Shutdown & PM2

**Read these docs:**
1. **PM2 Quick Start**
   - Read: https://pm2.keymetrics.io/docs/usage/quick-start/

2. **PM2 Ecosystem File**
   - Read: https://pm2.keymetrics.io/docs/usage/application-declaration/

**Tasks:**
1. Create `ecosystem.config.js`. Configure PM2 for your app: instances, restart policy, env vars.
2. Update `src/index.ts`: listen for `SIGTERM` and `SIGINT`.
3. On shutdown: stop accepting requests, wait for active requests, close Oracle pool, close Redis, exit.
4. Deploy to OCI VM: `pm2 start ecosystem.config.js`
5. Test: `pm2 logs`, `pm2 reload`, verify zero-downtime restart.
6. Create `docs/02-cloud-and-infrastructure/06-pm2-process-management.md`.

**End of Day 26:** Your app shuts down cleanly and runs under a process manager.

---

### Day 27 — Load Testing: Find Breaking Points

**Read these docs:**
1. **k6 Documentation**
   - Read: https://grafana.com/docs/k6/latest/

**Tasks:**
1. Install k6 locally.
2. Create `tests/load/chat-load.js`.
3. Run load test against your OCI VM.
4. Observe in Grafana: CPU, memory, response times, error rates.
5. Identify bottleneck. Optimize.
6. Re-run and compare.

**End of Day 27:** You know your system's limits.

---

### Day 28 — OCI Hardening & Monitoring

**Tasks:**
1. Configure `ufw` on OCI VM: allow only 22, 80, 443.
2. Set up automated Oracle DB backups to OCI Object Storage.
3. Configure log rotation with `logrotate`.
4. Create `docs/02-cloud-and-infrastructure/08-log-rotation-and-monitoring.md`.
5. Create `docs/02-cloud-and-infrastructure/09-backup-and-disaster-recovery.md`.

**End of Day 28:** Your server is production-hardened.

---

### Day 29 — Documentation & README

**Tasks:**
1. Write `README.md`:
   - Architecture diagram (ASCII art).
   - Prerequisites.
   - Installation steps.
   - Environment variables.
   - API docs link.
   - Deployment steps to OCI.
2. Write `docs/ARCHITECTURE.md`.
3. Write `docs/OPERATIONS.md`.

**End of Day 29:** Your project is documented.

---

### Day 30 — Ship Day

**Tasks:**
1. Run full test suite.
2. Run load test final time.
3. Check Grafana.
4. Verify SSL auto-renewal: `sudo certbot renew --dry-run`
5. Create GitHub release: `v1.0.0`.
6. Reflect: List every concept learned. Categorize.
7. Identify gaps for Project 2.

**End of Day 30:** You have shipped a production-grade AI Gateway.

---

## What You Can Build Now That You Couldn't Before Day 0

| Before | After |
|--------|-------|
| "What's a server?" | Deployed a containerized API to a live Linux VPS |
| "What's a database?" | Designed Oracle schemas, wrote migrations, optimized queries |
| "What's caching?" | Implemented Redis caching with TTL and invalidation |
| "What's auth?" | Built JWT + API key authentication with bcrypt hashing |
| "What's rate limiting?" | Enforced tiered rate limits with sliding windows |
| "What's a circuit breaker?" | Survived provider outages with automatic failover |
| "What's observability?" | Traced requests, collected metrics, built dashboards |
| "What's an API gateway?" | Built one that proxies, caches, authenticates, and monitors |
