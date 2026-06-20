# Project 3: The Swarm — MCP Tool System

> **Mission:** Build a production-grade tool system that exposes your infrastructure as tools any AI can use, and connects to external tools the AI needs — all via the Model Context Protocol (MCP). This is the **action layer** that turns AI from a chatbot into an operator.

---

## 1. Project Name

**The Swarm**

> *Every tool. One protocol. Infinite agents.*

---

## 2. Why?

You now have a Gateway (traffic control) and a Librarian (knowledge). But AI that only answers questions is a fancy search engine. **The Swarm** teaches AI to *act* — search the web, query databases, execute code, send emails, control APIs. This is the difference between "AI chatbot" and "AI agent."

By building this, you will learn:
- **How AI systems use tools** — not by hardcoding, but by letting the LLM decide which tool to call and with what arguments
- **How to design protocols** — MCP is becoming the USB-C of AI tools. Understanding protocols is senior-engineer territory
- **How to orchestrate multi-step workflows** — one tool's output becomes another's input. Error handling, retries, timeouts across tool chains
- **How to secure tool execution** — sandboxing, permission scopes, audit trails. A tool that deletes data needs more guardrails than one that reads it

This project teaches you **AI system design** — the layer where backend engineering and AI engineering merge into "platform engineering." The Swarm calls The Librarian for knowledge and The Gatekeeper for LLM inference. Together, they form a complete AI platform.

---

## 3. Stack

### Core Stack (Applied Across All 4 Projects)

| Tool | Role in This Project |
|------|---------------------|
| **Node.js 22 LTS** | Runtime for MCP servers, tool executors, and orchestration engine |
| **Hono** | HTTP API for tool registry, execution logs, and admin endpoints |
| **Drizzle ORM** | Stores tool definitions, execution history, audit logs, permission grants |
| **PostgreSQL 17** | Persistent storage for tool schemas, execution traces, cost attribution |
| **Redis** | Tool result cache, rate limit counters per tool, session state for tool chains |
| **Docker** | Sandboxed tool execution — each tool runs in an isolated container |
| **k3s** | Orchestrates MCP servers, tool executors, and sandbox containers independently |
| **Cloudflare Tunnel** | Exposes MCP SSE endpoints for remote AI hosts (Claude Desktop, Cursor, etc.) |

### Project-Specific Additions

| Tool | Why It's Added |
|------|---------------|
| **MCP TypeScript SDK** | Official Anthropic SDK for implementing MCP servers. Handles JSON-RPC 2.0 messaging, capability negotiation, and transport abstraction (stdio/SSE). |
| **Zod** | Runtime validation of tool parameters. The LLM generates arguments; Zod ensures they're valid before execution. Prevents injection attacks via tool parameters. |
| **BullMQ** | Redis-backed job queue for async tool execution. Long-running tools (web scraping, code execution) queue as jobs. API returns immediately with job ID. |
| **Docker Sandbox** | Isolated container per tool execution. Code execution runs in a restricted container with no network, read-only filesystem, CPU/memory limits. Prevents malicious code from escaping. |
| **Tavily API** | Production web search for AI. Returns clean, LLM-optimized search results with citations. Free tier available. |
| **Serper API** | Google Search API alternative. Fallback when Tavily is unavailable. |
| **Puppeteer** | Headless browser for web scraping. Renders JavaScript-heavy pages, extracts structured data, takes screenshots. |
| **Playwright** | Modern alternative to Puppeteer. Better for automation, testing, and cross-browser support. |
| **Prometheus + Grafana** | Tool-specific metrics: `tool_execution_duration`, `tool_error_rate`, `tool_cost_per_call`, `sandbox_cpu_usage`. |
| **OpenTelemetry + Jaeger** | Trace tool chains: `search` → `scrape` → `summarize` → `email`. See latency per tool, identify slow links. |
| **Nginx** | Routes MCP SSE connections, handles WebSocket upgrades for real-time tool streaming, SSL termination. |
| **bcryptjs + jose** | Tool permission tokens. Scoped JWTs grant temporary access to specific tools with expiration. |
| **pino** | Structured logging of every tool invocation: who called it, what arguments, what result, how long, what it cost. |
| **The Gatekeeper** | All LLM calls for tool decision-making ("should I use search or calculator?") route through your Project 1 API. |
| **The Librarian** | Tool execution history and documentation retrieved via RAG for context-aware tool selection. |

---

## 4. Directory Structure

```
swarm/
├── .env                          # Secrets: Tavily key, Serper key, JWT secret, Docker registry creds
├── .env.example                  # Template for all required environment variables
├── .gitignore                    # Excludes node_modules, .env, sandbox-volumes/, dist/
├── docker-compose.yml            # Local dev: Postgres + Redis + App + Sandbox containers
├── Dockerfile                    # Production image for MCP server and orchestrator
├── Dockerfile.sandbox            # Minimal sandbox image for untrusted tool execution
├── k8s/
│   ├── namespace.yaml            # Namespace: "swarm"
│   ├── deployment-mcp.yaml     # MCP server pods: 2 replicas, handles stdio/SSE connections
│   ├── deployment-executor.yaml  # Tool executor pods: 3 replicas, CPU-heavy, auto-scaled
│   ├── deployment-sandbox.yaml   # Sandbox daemon: manages ephemeral tool containers
│   ├── service-mcp.yaml          # ClusterIP for MCP server
│   ├── service-executor.yaml     # ClusterIP for tool executor
│   ├── ingress.yaml              # Routes /mcp/* to MCP server, /tools/* to executor
│   ├── configmap.yaml            # Non-secret: tool timeouts, sandbox limits, allowed origins
│   └── secret.yaml               # Secret: API keys, JWT signing key, registry credentials
├── docs/
│   ├── 01-what-is-mcp.md
│   ├── 02-json-rpc-2.0.md
│   ├── 03-tool-calling.md
│   ├── 04-function-calling-vs-tool-use.md
│   ├── 05-mcp-transports.md
│   ├── 06-capability-negotiation.md
│   ├── 07-tool-schemas.md
│   ├── 08-sandboxing.md
│   ├── 09-intent-routing.md
│   ├── 10-tool-chaining.md
│   ├── 11-parallel-execution.md
│   ├── 12-error-handling-in-chains.md
│   ├── 13-audit-logging.md
│   ├── 14-permission-scopes.md
│   ├── 15-rate-limiting-per-tool.md
│   ├── 16-cost-attribution.md
│   ├── 17-protocol-design.md
│   ├── 18-stdio-vs-sse.md
│   ├── 19-tool-discovery.md
│   ├── 20-dynamic-tool-loading.md
│   ├── 21-web-scraping-patterns.md
│   ├── 22-code-execution-safety.md
│   ├── 23-api-integration-patterns.md
│   ├── 24-circuit-breaker-per-tool.md
│   ├── 25-observability-for-tools.md
│   ├── 26-multi-tenant-tool-access.md
│   ├── 27-tool-versioning.md
│   ├── 28-fallback-strategies.md
│   ├── 29-human-in-the-loop.md
│   ├── 30-event-driven-tool-triggers.md
│   ├── 31-semantic-tool-routing.md
│   ├── 32-tool-result-caching.md
│   ├── 33-tool-composition-patterns.md
│   ├── 34-execution-isolation.md
│   └── 35-production-mcp-patterns.md
├── src/
│   ├── index.ts                  # Entry point: starts MCP server + Hono admin API
│   ├── config/
│   │   ├── env.ts                # Validates .env with Zod
│   │   └── database.ts           # Drizzle ORM client
│   ├── mcp/
│   │   ├── server.ts             # MCP server initialization: tools/list, tools/call handlers
│   │   ├── transport/
│   │   │   ├── stdio.ts          # stdio transport for local AI hosts (Claude Desktop)
│   │   │   └── sse.ts            # SSE transport for remote/web AI hosts
│   │   ├── handlers/
│   │   │   ├── initialize.ts     # MCP initialize handshake: declare capabilities
│   │   │   ├── tools-list.ts     # Return all available tools with schemas
│   │   │   ├── tools-call.ts     # Execute a tool by name with validated arguments
│   │   │   └── resources-read.ts # Read-only resource access (documents, configs)
│   │   └── protocol.ts           # JSON-RPC 2.0 message framing, request/response matching
│   ├── tools/
│   │   ├── registry.ts           # Tool registration: name, schema, handler, permissions, cost
│   │   ├── interface.ts          # Tool interface: execute(args, context) => Result
│   │   ├── schemas.ts            # Zod schemas for every tool's parameters
│   │   └── implementations/
│   │       ├── search/
│   │       │   ├── tavily.ts     # Web search via Tavily API
│   │       │   ├── serper.ts     # Web search via Serper API (fallback)
│   │       │   └── brave.ts      # Web search via Brave API (tertiary)
│   │       ├── scrape/
│   │       │   ├── puppeteer.ts  # Headless browser scraping
│   │       │   └── playwright.ts # Modern browser automation
│   │       ├── code/
│   │       │   ├── execute.ts    # Sandboxed code execution
│   │       │   └── lint.ts       # Code quality check
│   │       ├── database/
│   │       │   ├── query.ts      # Execute read-only SQL queries
│   │       │   └── migrate.ts    # Run database migrations (admin only)
│   │       ├── communication/
│   │       │   ├── email.ts      # Send emails via SMTP/API
│   │       │   └── slack.ts      # Post to Slack channels
│   │       ├── file/
│   │       │   ├── read.ts       # Read files from allowed paths
│   │       │   └── write.ts      # Write files (sandboxed, restricted)
│   │       └── custom/
│   │           ├── rag-query.ts  # Query The Librarian (Project 2)
│   │           ├── gateway-chat.ts # Chat via The Gatekeeper (Project 1)
│   │           └── calendar.ts   # Google Calendar integration
│   ├── orchestrator/
│   │   ├── intent-router.ts      # LLM decides which tool(s) to use for a goal
│   │   ├── chain-builder.ts    # Build tool dependency graphs: Tool A output → Tool B input
│   │   ├── parallel-executor.ts  # Promise.all() for independent tool calls
│   │   ├── sequential-executor.ts # Await each step for dependent chains
│   │   └── result-merger.ts      # Merge results from multiple tools into unified response
│   ├── sandbox/
│   │   ├── docker.ts             # Spawn ephemeral Docker containers for tool execution
│   │   ├── limits.ts             # CPU, memory, network, filesystem restrictions
│   │   ├── cleanup.ts            # Auto-remove containers after execution
│   │   └── monitor.ts            # Real-time sandbox resource monitoring
│   ├── workers/
│   │   └── tool-execution-worker.ts  # BullMQ consumer for async tool jobs
│   ├── routes/
│   │   ├── health.ts             # GET /health — liveness probe
│   │   ├── ready.ts              # GET /ready — checks all dependencies
│   │   ├── tools.ts              # GET /v1/tools — list all tools with schemas
│   │   ├── execute.ts            # POST /v1/tools/:name/execute — direct tool execution
│   │   ├── chains.ts             # POST /v1/chains — submit tool chain for execution
│   │   ├── jobs.ts               # GET /v1/jobs/:id — check async job status
│   │   ├── logs.ts               # GET /v1/logs — audit trail of tool invocations
│   │   └── permissions.ts        # POST /v1/permissions — grant/revoke tool access
│   ├── middleware/
│   │   ├── logger.ts             # Pino structured logging
│   │   ├── request-id.ts         # UUID per request
│   │   ├── auth.ts               # JWT + API key validation
│   │   ├── rate-limit.ts         # Per-tool rate limits via Redis
│   │   ├── validate.ts           # Zod parameter validation
│   │   ├── error-handler.ts      # Consistent JSON errors
│   │   └── cors.ts               # CORS headers
│   ├── db/
│   │   ├── schema.ts             # Drizzle tables: tools, executions, permissions, audit_logs
│   │   ├── migrations/
│   │   └── seed.ts               # Dev data: sample tools, test permissions
│   ├── lib/
│   │   ├── redis.ts              # Redis client
│   │   ├── jwt.ts                # Token generation/verification
│   │   ├── gateway-client.ts     # Typed fetch to The Gatekeeper
│   │   ├── librarian-client.ts   # Typed fetch to The Librarian
│   │   ├── docker.ts             # Dockerode client for sandbox management
│   │   └── telemetry.ts          # OpenTelemetry setup
│   ├── types/
│   │   └── index.ts              # Shared types: Tool, ToolResult, Chain, ExecutionContext
│   └── swagger.ts                # OpenAPI spec + Swagger UI at /docs
├── tests/
│   ├── unit/
│   │   ├── tool-registry.test.ts
│   │   ├── intent-router.test.ts
│   │   └── sandbox.test.ts
│   ├── integration/
│   │   ├── mcp-handshake.test.ts
│   │   ├── tool-execution.test.ts
│   │   └── tool-chain.test.ts
│   └── fixtures/
│       └── mock-tools.ts
├── prometheus.yml
├── grafana/
│   └── dashboards/
│       └── swarm-dashboard.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. System Design Concepts

| # | Concept | Tool | How It's Applied in The Swarm |
|---|---------|------|--------------------------------|
| 1 | **Model Context Protocol (MCP)** | MCP SDK | Standardized protocol for AI tools. Your server exposes `tools/list` and `tools/call` endpoints. Any MCP-compatible host (Claude Desktop, Cursor, Cline) can discover and use your tools without custom integration. |
| 2 | **JSON-RPC 2.0** | Custom + MCP SDK | The wire format for MCP: `{"jsonrpc":"2.0","method":"tools/call","params":{},"id":1}`. Request/response matching via `id`. Batched requests for efficiency. |
| 3 | **Capability Negotiation** | MCP SDK | On connection, server declares: "I support tools, resources, and prompts." Client declares: "I support sampling (asking the LLM)." Both adapt to each other's capabilities. No assumptions. |
| 4 | **Tool Schema Definition** | Zod + MCP SDK | Every tool declares its parameters as JSON Schema (auto-generated from Zod). The LLM reads this schema to generate valid arguments. Schema is contract — break it and the LLM fails. |
| 5 | **Tool Discovery** | Registry + MCP SDK | Host calls `tools/list`, server returns all available tools with names, descriptions, and parameter schemas. Dynamic: tools can be added/removed without restarting the host. |
| 6 | **Function Calling vs. Tool Use** | The Gatekeeper | Function calling: LLM generates a JSON blob `{name:"search",arguments:{query:"AI"}}`. Tool use: the system executes that JSON. Your orchestrator bridges both. |
| 7 | **Intent Routing** | The Gatekeeper | Given a user goal ("find the latest AI news and email it to me"), the LLM decides which tools to use: `search` → `scrape` → `email`. Not hardcoded — the LLM reasons about the goal. |
| 8 | **Tool Chaining (DAG)** | Orchestrator | Tool A's output becomes Tool B's input. Example: `search("AI news")` → results → `scrape(result[0].url)` → content → `summarize(content)` → summary → `email(to:"boss", body:summary)`. Directed Acyclic Graph — no cycles allowed. |
| 9 | **Parallel Tool Execution** | Orchestrator + Promise.all | Independent tools run simultaneously. `search("AI")` + `search("ML")` + `search("LLM")` execute in parallel, results merged. 3x faster than sequential. |
| 10 | **Sequential Tool Execution** | Orchestrator + await | Dependent tools must wait. `scrape` cannot run until `search` returns a URL. `email` cannot run until `summarize` produces text. Chain enforces order. |
| 11 | **Error Handling in Chains** | Orchestrator + pino | If `scrape` fails (404), the chain has options: skip and continue, retry with fallback URL, abort entire chain, or substitute cached result. Log every decision. |
| 12 | **Circuit Breaker per Tool** | Redis | Each tool has its own circuit breaker. Tavily down? Break it, fallback to Serper. Puppeteer crashing? Break it, fallback to Playwright. Isolated failures don't cascade. |
| 13 | **Tool Result Caching** | Redis | Cache deterministic tool outputs. `search("Node.js 22 release date")` returns same result for 1 hour. Cache key = hash(toolName + args). Saves API costs and latency. |
| 14 | **Sandboxing** | Docker | Untrusted code execution runs in ephemeral containers: no network access, read-only root filesystem, 512MB RAM limit, 30s timeout, auto-deleted after execution. Prevents `rm -rf /` attacks. |
| 15 | **Resource Limits** | Docker + k8s | Per-sandbox: CPU quota (0.5 cores), memory limit (512MB), disk limit (100MB), no network, no privileged mode. k8s enforces these at the orchestrator level. |
| 16 | **Execution Isolation** | Docker | Each tool execution gets its own container. One malicious tool cannot see another's files, memory, or network connections. Defense in depth. |
| 17 | **Audit Logging** | PostgreSQL + pino | Every tool invocation logged: who (userId), what (toolName + args), when (timestamp), result (success/failure + output), cost (API fees), duration. Immutable. Compliance-ready. |
| 18 | **Permission Scopes** | PostgreSQL + jose | Scoped JWTs grant tool access: `scope: "search:read scrape:read"` allows search and scrape, but not `code:execute` or `email:send`. Principle of least privilege. |
| 19 | **Rate Limiting per Tool** | Redis | Different limits per tool: `search` = 100/min (cheap), `code:execute` = 10/min (expensive), `email:send` = 5/min (sensitive). Prevents abuse and cost spikes. |
| 20 | **Cost Attribution** | PostgreSQL | Track API costs per tool, per user, per chain. Tavily search = $0.001/call. Code execution = $0.01/minute. Aggregate in `usage` table for billing. |
| 21 | **Human-in-the-Loop (HITL)** | Orchestrator + Hono | Sensitive tools (email, file:write, database:migrate) pause execution and request human approval via API. Timeout = 5 minutes. Auto-reject on timeout. |
| 22 | **Event-Driven Tool Triggers** | Redis Pub/Sub + BullMQ | Tools triggered by system events, not just user requests. "New document uploaded" → auto-index via Librarian. "High error rate" → auto-alert via Slack. |
| 23 | **Semantic Tool Routing** | The Librarian + The Gatekeeper | Instead of hardcoded routing, embed tool descriptions into vectors. User query "find me papers" routes to `search` because its description vector is closest to the query vector. |
| 24 | **Tool Versioning** | PostgreSQL | Tools have versions: `search@v1`, `search@v2` (with new parameters). Hosts pin to versions. Rollback instantly if v2 breaks. |
| 25 | **Fallback Strategies** | Orchestrator | Tiered fallback: primary tool → secondary tool → cached result → partial result → graceful error. Every chain defines its own fallback policy. |
| 26 | **stdio Transport** | MCP SDK | For local AI hosts (Claude Desktop). Server reads JSON-RPC from stdin, writes to stdout. Simple, no network needed. Process lifecycle tied to host. |
| 27 | **SSE Transport** | MCP SDK + Hono | For remote/web AI hosts. Server-Sent Events over HTTP. Bidirectional via POST for client→server, SSE for server→client. Scales to many concurrent connections. |
| 28 | **Web Scraping Patterns** | Puppeteer + Playwright | Handle JavaScript-rendered pages, infinite scroll, CAPTCHAs, rate limits. Extract structured data (JSON-LD, microdata) when available. Respect robots.txt. |
| 29 | **Code Execution Safety** | Docker Sandbox | Untrusted code: Python, JavaScript, Bash. Run in container with no network, no filesystem writes outside /tmp, CPU/memory limits, timeout. Output sanitized before returning to LLM. |
| 30 | **API Integration Patterns** | Custom | REST APIs (Tavily, Serper), GraphQL APIs, WebSocket APIs. Each integration: auth (API key, OAuth), rate limiting, retry logic, error normalization, response caching. |
| 31 | **Dynamic Tool Loading** | Registry | Tools loaded at runtime from `tools/` directory. New tool = new file + registry entry. No server restart. Hot-swappable in production. |
| 32 | **Tool Composition** | Orchestrator | Small tools compose into complex workflows. `search` + `scrape` + `summarize` = "research agent." `query` + `visualize` + `email` = "reporting agent." |
| 33 | **Multi-Tenant Tool Access** | PostgreSQL | Tenant A sees tools `search`, `scrape`. Tenant B sees `search`, `code:execute`. Tenant C sees all tools but with stricter rate limits. Row-level security on tool permissions. |
| 34 | **Protocol Design** | Custom + MCP SDK | Designing the message format, state machine, error codes, and versioning strategy for a new protocol. MCP is your case study — you'll extend it for custom needs. |
| 35 | **Graceful Degradation** | Orchestrator | When all tools fail, return: `"I couldn't complete this task. Here's what I tried: [search: timeout, scrape: blocked]. Try rephrasing your request."` Never crash the host. |

---

## 6. 30-Day Planner

---

### Day 0 — Environment Setup & MCP Foundation

**Before touching anything, learn:**
- What is **MCP**? Model Context Protocol — a standard way for AI applications to discover and use tools. Think of it as USB-C for AI: one port, infinite devices.
- What is a **tool** in AI? A function the LLM can call. Not a physical tool — a piece of code that does something (search, calculate, send email). The LLM decides when to use it.
- What is **JSON-RPC**? A protocol for remote procedure calls using JSON. Instead of REST URLs, you send `{"method":"tools/call","params":{...}}`. Simpler for machine-to-machine communication.
- What is **stdio**? Standard input/output — reading from keyboard, writing to screen. In MCP, the server reads commands from stdin and writes responses to stdout. No network needed.
- What is **SSE**? Server-Sent Events — a web technology where the server pushes data to the browser over a single HTTP connection. Used for real-time updates: "tool execution in progress... done."
- What is **sandboxing**? Running code in an isolated environment where it can't harm the host system. Like a playpen for dangerous code.

**Tasks:**
1. Verify Node.js 22, Docker, k3s, Git from Projects 1–2.
2. Create GitHub repo `swarm`. Clone locally.
3. Run `npm init -y`. Install core dependencies: `hono`, `drizzle-orm`, `pg`, `ioredis`, `zod`, `pino`, `bullmq`, `@modelcontextprotocol/sdk`.
4. Install dev dependencies: `typescript`, `tsx`, `drizzle-kit`, `@types/node`.
5. Create directory structure per the tree above.
6. Install Docker sandbox tools: `npm install dockerode`.
7. Create `.env` and `.gitignore`.
8. Create `docker-compose.yml` with Postgres, Redis, and a sandbox test container.
9. Run `docker compose up -d`. Verify all services start.
10. Read the MCP specification: [modelcontextprotocol.io](https://modelcontextprotocol.io). Focus on "Introduction" and "Core Architecture."

**End of Day 0:** You understand what MCP is and why it exists. Infrastructure is running.

---

### Day 1 — Hello MCP Server: Your First Tool

**Learn before coding:**
- What is an **MCP server**? A program that exposes tools to AI hosts. It handles: initialize handshake, list available tools, execute tool calls.
- What is the **initialize handshake**? Host sends `initialize` with its capabilities. Server responds with its capabilities. They agree on protocol version. Like two phones negotiating Bluetooth pairing.
- What is **tools/list**? An MCP method. Host asks "What tools do you have?" Server responds with names, descriptions, and parameter schemas.
- What is **tools/call**? Host asks "Run this tool with these arguments." Server executes, returns result.

**Tasks:**
1. Create `src/mcp/server.ts`:
   ```typescript
   import { Server } from '@modelcontextprotocol/sdk/server/index.js'
   import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

   const server = new Server({ name: 'swarm', version: '1.0.0' }, {
     capabilities: { tools: {} }
   })

   server.setRequestHandler(ListToolsRequestSchema, async () => ({
     tools: [{
       name: 'hello',
       description: 'Says hello to someone',
       inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] }
     }]
   }))

   server.setRequestHandler(CallToolRequestSchema, async (request) => {
     if (request.params.name === 'hello') {
       return { content: [{ type: 'text', text: `Hello, ${request.params.arguments.name}!` }] }
     }
   })

   const transport = new StdioServerTransport()
   await server.connect(transport)
   ```
2. Test manually: `echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | npx tsx src/mcp/server.ts`
3. Verify response contains the `hello` tool.
4. Test tool call: `echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"hello","arguments":{"name":"World"}},"id":2}' | npx tsx src/mcp/server.ts`
5. Explain: stdin → MCP server → parse JSON-RPC → route to handler → execute → JSON-RPC response → stdout.

**End of Day 1:** You have a working MCP server with one tool. You understand the request/response flow.

---

### Day 2 — Zod Schemas: Validating Tool Parameters

**Learn before coding:**
- What is **schema validation** for tools? The LLM generates arguments as JSON. Before executing, you MUST verify: is `query` a string? Is `limit` a number between 1 and 100? Invalid args crash tools or cause harm.
- What is **Zod** (review)? TypeScript-first validation. Define shape, Zod checks data, TypeScript infers types. Prevents runtime errors.

**Tasks:**
1. Create `src/tools/schemas.ts`:
   ```typescript
   import { z } from 'zod'

   export const SearchSchema = z.object({
     query: z.string().min(1).max(500),
     limit: z.number().int().min(1).max(100).default(10),
   })

   export const CodeExecuteSchema = z.object({
     code: z.string().min(1).max(10000),
     language: z.enum(['javascript', 'python', 'bash']),
     timeout: z.number().int().min(1).max(300).default(30),
   })
   ```
2. Create `src/tools/interface.ts`:
   ```typescript
   export interface Tool {
     name: string
     description: string
     schema: z.ZodTypeAny
     execute: (args: any, context: ExecutionContext) => Promise<ToolResult>
     permissions: string[]
     costPerCall: number
   }
   ```
3. Update `src/mcp/server.ts`: validate all incoming arguments against schemas before executing. Return Zod error messages if invalid.
4. Test: send invalid args (`limit: 999`), verify clear error response.

**End of Day 2:** Tool parameters are validated. You understand why validation prevents injection attacks.

---

### Day 3 — Tool Registry: Dynamic Tool Loading

**Learn before coding:**
- What is a **registry**? A central catalog where tools register themselves. Like a phone book: look up `search`, get the handler function + schema + permissions.
- What is **dynamic loading**? Tools are discovered at runtime from the `tools/` directory. Add a new file → it appears in `tools/list` without restarting the server.

**Tasks:**
1. Create `src/tools/registry.ts`:
   ```typescript
   class ToolRegistry {
     private tools = new Map<string, Tool>()

     register(tool: Tool) { this.tools.set(tool.name, tool) }
     get(name: string) { return this.tools.get(name) }
     list() { return Array.from(this.tools.values()).map(t => ({ name: t.name, description: t.description, schema: t.schema })) }
   }

   export const registry = new ToolRegistry()
   ```
2. Create `src/tools/implementations/search/tavily.ts`: implements `Tool` interface. Registers itself on import.
3. Create loader: `src/tools/index.ts` imports all tool files, triggering self-registration.
4. Update MCP server: `tools/list` reads from registry. `tools/call` looks up in registry and executes.
5. Test: add a new tool file, verify it appears in `tools/list` without server restart.

**End of Day 3:** Tools are dynamically discoverable. You understand plugin architectures.

---

### Day 4 — Web Search Tool: Tavily Integration

**Learn before coding:**
- What is **Tavily**? A search API designed for AI. Returns clean results with title, URL, content snippet, and relevance score. Optimized for LLM consumption — not bloated like raw Google results.
- What is an **API integration pattern**? Auth (API key in header), request (POST with JSON), response (JSON with results), error handling (retry, fallback, cache).

**Tasks:**
1. Sign up for Tavily API, get free API key. Add to `.env`.
2. Install: `npm install tavily` (or use raw fetch).
3. Create `src/tools/implementations/search/tavily.ts`:
   ```typescript
   import { tavily } from '@tavily/core'

   export const searchTool: Tool = {
     name: 'tavily_search',
     description: 'Search the web for current information',
     schema: SearchSchema,
     permissions: ['search:read'],
     costPerCall: 0.001,
     async execute(args, context) {
       const client = tavily({ apiKey: process.env.TAVILY_API_KEY })
       const results = await client.search({ query: args.query, maxResults: args.limit })
       return { success: true, data: results.results }
     }
   }
   ```
4. Register in registry.
5. Test via MCP: `tools/call` with `{"name":"tavily_search","arguments":{"query":"Node.js 22 features","limit":5}}`.
6. Verify results contain title, URL, content.

**End of Day 4:** Your MCP server has a real web search tool. You understand API integration patterns.

---

### Day 5 — Intent Router: LLM Decides Which Tool to Use

**Learn before coding:**
- What is **intent routing**? Given a user goal, the LLM decides which tool(s) to call. Not hardcoded `if/else` — the LLM reasons about the goal and available tools.
- What is a **system prompt for routing**? "You are a tool router. Available tools: [list]. Given the user's goal, select the best tool and explain why."

**Tasks:**
1. Create `src/orchestrator/intent-router.ts`:
   ```typescript
   export async function routeIntent(goal: string, availableTools: Tool[]): Promise<string[]> {
     const prompt = `You are a tool router. Available tools:
${availableTools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

User goal: "${goal}"

Select the best tool(s) for this goal. Return ONLY a JSON array of tool names.`

     const response = await gatewayClient.chatCompletion({
       model: 'llama3-8b-8192',
       messages: [{ role: 'user', content: prompt }],
       response_format: { type: 'json_object' }
     })

     const selected = JSON.parse(response.choices[0].message.content).tools
     return selected.filter((name: string) => availableTools.some(t => t.name === name))
   }
   ```
2. Test: "Find the latest AI news" → should return `["tavily_search"]`.
3. Test: "Find AI news and email it to my boss" → should return `["tavily_search", "email_send"]` (email not built yet, but router should suggest it).
4. Add fallback: if LLM returns invalid tool names, log error and return `["tavily_search"]` (safe default).

**End of Day 5:** Your system routes goals to tools intelligently. You understand LLM-based decision making.

---

### Day 6 — Tool Chains: Output Becomes Input

**Learn before coding:**
- What is a **tool chain**? A sequence where Tool A's result feeds into Tool B's arguments. Like a shell pipeline: `cat file | grep pattern | sort | head`.
- What is a **DAG**? Directed Acyclic Graph — a chain with no loops. A → B → C is valid. A → B → A is invalid (would loop forever).

**Tasks:**
1. Create `src/orchestrator/chain-builder.ts`:
   ```typescript
   export interface ChainStep {
     tool: string
     args: Record<string, any>
     dependsOn?: number[]  // indices of previous steps whose output feeds into this step
   }

   export async function executeChain(steps: ChainStep[]): Promise<any[]> {
     const results: any[] = []
     for (const step of steps) {
       // Resolve dependencies: replace ${step0.result[0].url} with actual values
       const resolvedArgs = resolveDependencies(step.args, results)
       const tool = registry.get(step.tool)
       const result = await tool.execute(resolvedArgs, context)
       results.push(result)
     }
     return results
   }
   ```
2. Create test chain:
   ```typescript
   const chain = [
     { tool: 'tavily_search', args: { query: 'Node.js 22' } },
     { tool: 'scrape', args: { url: '${step0.result[0].url}' }, dependsOn: [0] }
   ]
   ```
3. Test: search → scrape. Verify second step receives URL from first step.
4. Add error handling: if step 0 fails, step 1 should not execute. Return partial results + error.

**End of Day 6:** Tools compose into workflows. You understand pipeline architectures.

---

### Day 7 — Parallel Execution: Speed Through Concurrency

**Learn before coding:**
- What is **concurrency**? Doing multiple things at the same time. Not parallelism (multiple CPU cores) — concurrency is about structure: starting tasks, moving on, collecting results later.
- What is **Promise.all**? JavaScript's way to wait for multiple async operations simultaneously. `await Promise.all([task1, task2, task3])` waits for all three, returns all results.

**Tasks:**
1. Create `src/orchestrator/parallel-executor.ts`:
   ```typescript
   export async function executeParallel(tools: { name: string; args: any }[]): Promise<any[]> {
     const promises = tools.map(({ name, args }) => {
       const tool = registry.get(name)
       return tool.execute(args, context)
     })
     return Promise.all(promises)
   }
   ```
2. Test: execute 3 searches in parallel (`"AI"`, `"ML"`, `"LLM"`). Measure time vs. sequential.
3. Add error handling: `Promise.allSettled` instead of `Promise.all` — returns results for successful tools, errors for failed ones. Don't let one failure kill the batch.
4. Update chain-builder: if steps have no dependencies, auto-parallelize them.

**End of Day 7:** Independent tools run simultaneously. You understand concurrency patterns.

---

### Day 8 — Docker Sandbox: Safe Code Execution

**Learn before coding:**
- What is **Docker** (review)? Containers package apps with their dependencies. A sandbox container is stripped down: no network, no sensitive files, strict resource limits.
- What is **Dockerode**? A Node.js library for controlling Docker programmatically: create containers, start them, stream logs, remove them.
- Why sandbox code execution? Users (or LLMs) might submit `rm -rf /` or `while(true){}`. Sandboxes contain the blast radius.

**Tasks:**
1. Install Dockerode: `npm install dockerode`.
2. Create `Dockerfile.sandbox`:
   ```dockerfile
   FROM node:22-alpine
   RUN adduser -D -s /bin/sh sandbox
   USER sandbox
   WORKDIR /tmp
   CMD ["node", "-e", "process.stdin.pipe(require('fs').createWriteStream('/tmp/code.js')); setTimeout(()=>require('/tmp/code.js'),100)"]
   ```
3. Create `src/sandbox/docker.ts`:
   ```typescript
   import Docker from 'dockerode'
   const docker = new Docker()

   export async function runSandboxed(code: string, language: string, timeoutMs: number) {
     const container = await docker.createContainer({
       Image: 'swarm-sandbox:latest',
       Cmd: ['sh', '-c', `echo '${code}' | node`],
       HostConfig: {
         NetworkMode: 'none',
         Memory: 512 * 1024 * 1024, // 512MB
         CpuQuota: 50000, // 0.5 cores
         AutoRemove: true,
       },
       StopTimeout: timeoutMs / 1000,
     })

     await container.start()
     const stream = await container.logs({ follow: true, stdout: true, stderr: true })
     // Collect output, enforce timeout
     return { output, exitCode }
   }
   ```
4. Test: run `console.log("Hello from sandbox")` → should print and exit.
5. Test: run `while(true){}` → should timeout and be killed.
6. Test: run `require('fs').writeFileSync('/etc/passwd', 'hacked')` → should fail (read-only or permission denied).

**End of Day 8:** Untrusted code runs safely. You understand sandboxing fundamentals.

---

### Day 9 — BullMQ: Async Tool Execution

**Learn before coding:**
- What is **async tool execution** (review)? Long-running tools (web scraping, code execution) shouldn't block the MCP response. Queue them, return job ID, poll for results.
- What is a **job state machine**? `pending` → `active` → `completed`/`failed`. Clients poll `GET /v1/jobs/:id` for status.

**Tasks:**
1. Create `src/lib/queue.ts`: initialize `Queue('tool-execution')`.
2. Update `src/mcp/handlers/tools-call.ts`: for long-running tools (>5s), queue job, return `{ jobId, status: 'pending', checkAt: '/v1/jobs/:id' }`.
3. Create `src/workers/tool-execution-worker.ts`: BullMQ worker that executes tools from queue.
4. Create `src/routes/jobs.ts`: `GET /v1/jobs/:id` returns job status and result.
5. Test: call a slow tool, verify immediate response with jobId, poll until complete.

**End of Day 9:** Long tools don't block. You understand async job patterns.

---

### Day 10 — Core Tool System Complete: End-to-End Test

**Tasks:**
1. Build golden dataset of tool chains:
   - `"Find Node.js 22 features"` → `search` → `scrape` → `summarize`
   - `"Calculate fibonacci(100)"` → `code:execute`
   - `"Search AI news and email summary"` → `search` + `scrape` (parallel) → `summarize` → `email`
2. Run each chain, verify correct tools are called in correct order.
3. Verify sandboxing: code execution cannot escape container.
4. Verify audit logging: every tool call logged with args, result, duration, user.
5. Document: create `docs/01-what-is-mcp.md`.

**End of Day 10:** Core tool system works. Tools are discovered, routed, executed, sandboxed, and logged.

---

### Day 11 — SSE Transport: Remote AI Hosts

**Learn before coding:**
- What is **SSE** (review)? Server-Sent Events — HTTP connection where server pushes data. For MCP, client connects via SSE, server streams JSON-RPC messages.
- Why SSE over stdio? stdio requires local process. SSE works over the internet — Claude Desktop on one machine, your server on another.

**Tasks:**
1. Create `src/mcp/transport/sse.ts`:
   ```typescript
   import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'

   app.get('/mcp/sse', async (c) => {
     const transport = new SSEServerTransport('/mcp/messages', c.res)
     await server.connect(transport)
   })

   app.post('/mcp/messages', async (c) => {
     // Handle client messages
   })
   ```
2. Test with curl: `curl http://localhost:3000/mcp/sse` should establish SSE connection.
3. Send initialize message via POST, verify SSE response.
4. Document: how to connect Claude Desktop to your remote MCP server.

**End of Day 11:** Remote AI hosts can connect to your tools. You understand transport abstraction.

---

### Day 12 — Permission Scopes & Auth

**Learn before coding:**
- What is **RBAC** (review)? Role-Based Access Control. User has role, role has permissions, permissions grant tool access.
- What is a **scoped token**? JWT with limited permissions: `scope: "search:read"` — can search, cannot execute code or send email.

**Tasks:**
1. Update `src/db/schema.ts`: add `permissions` table (userId, tool, action, grantedAt, expiresAt).
2. Update `src/middleware/auth.ts`: decode JWT, extract scope, attach to context.
3. Update `src/mcp/handlers/tools-call.ts`: before executing, check if user's scope includes required permission.
4. Return `403 Forbidden` with missing permissions if unauthorized.
5. Test: user with `search:read` can search but gets 403 on `code:execute`.

**End of Day 12:** Tools are access-controlled. You understand authorization patterns.

---

### Day 13 — Rate Limiting per Tool

**Tasks:**
1. Update `src/middleware/rate-limit.ts`: per-tool limits stored in Redis.
   - Key: `rate:tool:${toolName}:user:${userId}`
   - `search` = 100/min, `code:execute` = 10/min, `email:send` = 5/min
2. Different limits per user tier (free/pro/enterprise).
3. Return `429` with `Retry-After` and `X-RateLimit-Remaining`.
4. Test: exhaust `code:execute` limit, verify 429, verify other tools still work.

**End of Day 13:** Tools have individual rate limits. You understand granular resource control.

---

### Day 14 — Human-in-the-Loop: Sensitive Tool Approval

**Learn before coding:**
- What is **HITL**? Human-in-the-Loop — pause execution and ask a human before proceeding. For destructive or expensive operations.
- Why? LLMs make mistakes. You don't want an AI to accidentally delete a database or send an email to your CEO without confirmation.

**Tasks:**
1. Update tool schema: add `requiresApproval: boolean` flag.
2. Update `src/orchestrator/chain-builder.ts`: if step requires approval, pause chain, store state in Redis, return `approvalRequired: true, approvalUrl: '/v1/approvals/:id'`.
3. Create `src/routes/approvals.ts`: `POST /v1/approvals/:id/approve` resumes chain. `POST /v1/approvals/:id/reject` aborts chain.
4. Add timeout: approval expires after 5 minutes. Auto-reject on timeout.
5. Test: chain with `email:send` pauses. Approve → completes. Reject → aborts with partial results.

**End of Day 14:** Destructive tools require human approval. You understand safety in AI systems.

---

### Day 15 — Audit Logging: Immutable Execution History

**Tasks:**
1. Update `src/db/schema.ts`: add `audit_logs` table (id, userId, toolName, argsHash, resultHash, durationMs, cost, status, createdAt).
2. Update every tool execution: log to PostgreSQL after completion.
3. Hash sensitive args (don't store raw API keys or passwords).
4. Create `src/routes/logs.ts`: `GET /v1/logs` — filterable by user, tool, date, status.
5. Test: execute tools, verify logs appear. Verify args are hashed, not plain.

**End of Day 15:** Every tool call is auditable. You understand compliance requirements.

---

### Day 16 — Cost Attribution: Track Every Penny

**Tasks:**
1. Update `src/tools/interface.ts`: add `costPerCall` field.
2. Update `src/db/schema.ts`: add `tool_costs` table (userId, toolName, date, totalCalls, totalCost).
3. After every tool execution: increment cost counter in Redis, aggregate hourly into PostgreSQL.
4. Create `src/routes/usage.ts`: `GET /v1/usage` — cost breakdown by tool, by day, by user.
5. Test: execute 10 searches at $0.001 each → verify total cost = $0.01.

**End of Day 16:** Tool costs are tracked. You understand cost management in AI systems.

---

### Day 17 — Circuit Breaker per Tool

**Tasks:**
1. Update `src/middleware/circuit-breaker.ts`: per-tool circuits in Redis.
   - Key: `circuit:tool:${toolName}`
   - Tavily failing? Open circuit, fallback to Serper.
   - Puppeteer crashing? Open circuit, fallback to Playwright.
2. Each tool defines its own fallback chain.
3. Test: block Tavily (disconnect internet), verify fallback to Serper.

**End of Day 17:** Tool failures are isolated. You understand resilient system design.

---

### Day 18 — Tool Result Caching

**Tasks:**
1. Update `src/lib/cache.ts`: cache tool results.
   - Key: `tool:result:${toolName}:${hash(args)}`
   - TTL: `search` = 1 hour, `scrape` = 24 hours, `code:execute` = 0 (never cache — side effects).
2. Check cache before executing. Store result after executing.
3. Add `X-Tool-Cache: HIT/MISS` header.
4. Test: identical search twice → second is instant.

**End of Day 18:** Deterministic tools are cached. You understand intelligent caching.

---

### Day 19 — Semantic Tool Routing

**Tasks:**
1. Embed all tool descriptions using OpenAI embeddings.
2. Store in Qdrant (or The Librarian from Project 2).
3. When user submits goal, embed goal, search for nearest tool descriptions.
4. Return top-3 suggested tools with confidence scores.
5. Fallback to LLM-based routing if confidence < 0.7.

**End of Day 19:** Tools are discovered semantically. You understand vector-based routing.

---

### Day 20 — Docker & k3s: Containerize The Swarm

**Tasks:**
1. Create `Dockerfile` for MCP server + orchestrator.
2. Create `Dockerfile.sandbox` for tool execution.
3. Update `docker-compose.yml`: add `swarm` and `sandbox` services.
4. Create k8s manifests: deployment, service, ingress.
5. Deploy to k3s. Verify pods running.
6. Step 6 — Publish to npm registry
  1. Ensure package.json has name: "@your-org/swarm", version: "1.0.0"
  2. Run npm run build
  3. Run npm publish --access public
  4. Verify with npm view @your-org/swarm
  5. Test install: npm install @your-org/swarm and import Swarm / MCPClient

**End of Day 20:** The Swarm runs in Kubernetes.

---

### Day 21 — Nginx Ingress: Route MCP Traffic

**Tasks:**
1. Update `k8s/ingress.yaml`:
   - `/mcp/sse` → swarm MCP server
   - `/v1/tools/*` → swarm API
   - `/v1/rag/*` → librarian (Project 2)
   - `/v1/chat/*` → gatekeeper (Project 1)
2. Apply ingress. Test all routes.
3. Verify SSL termination.

**End of Day 21:** All services route through one domain. You understand unified API gateways.

---

### Day 22 — Prometheus & Grafana: Tool Metrics

**Tasks:**
1. Add metrics: `tool_execution_duration`, `tool_error_rate`, `tool_cost_per_call`, `sandbox_cpu_usage`.
2. Create Grafana dashboard: tool latency histogram, error rate by tool, cost trends.
3. Generate traffic. Verify graphs.

**End of Day 22:** Tool performance is visible.

---

### Day 23 — OpenTelemetry: Trace Tool Chains

**Tasks:**
1. Add spans: `intent_routing` → `tool_execution` → `sandbox_spawn` → `result_return`.
2. Trace across services: Swarm → Gatekeeper (for LLM routing decision).
3. View in Jaeger. Identify slowest tool.

**End of Day 23:** Tool chains are traceable.

---

### Day 24 — Multi-Tenancy: Isolated Tool Access

**Tasks:**
1. Add `tenantId` to all tables.
2. Tenant-scoped tool permissions: Tenant A sees `search`, `scrape`. Tenant B sees all tools.
3. Tenant-scoped rate limits and cost tracking.
4. Test: cross-tenant isolation.

**End of Day 24:** Tools are multi-tenant.

---

### Day 25 — Security: Input Sanitization & Injection Defense

**Tasks:**
1. Sanitize all tool arguments: strip HTML, limit length, validate characters.
2. Detect prompt injection in code execution requests.
3. Restrict file paths in `file:read`/`file:write` to allowed directories.
4. Add `Content-Security-Policy` headers.

**End of Day 25:** Tools are hardened.

---

### Day 26 — Graceful Shutdown & Cleanup

**Tasks:**
1. SIGTERM handling: finish in-flight tool executions, close Redis/Postgres connections.
2. Cancel pending BullMQ jobs gracefully.
3. Auto-remove expired sandbox containers.
4. Test: `kubectl delete pod` during execution.

**End of Day 26:** Clean shutdowns.

---

### Day 27 — Load Testing: Find Tool Breaking Points

**Tasks:**
1. k6 load test: 100 concurrent tool executions.
2. Monitor: sandbox spawn time, Redis queue depth, Postgres connections.
3. Optimize: pre-warm sandbox containers, increase worker replicas.
4. Re-run and compare.

**End of Day 27:** Tool limits known.

---

### Day 28 — Cloudflare Tunnel: Expose MCP to Internet

**Tasks:**
1. Configure `cloudflared` for Swarm SSE endpoint.
2. Update DNS: `mcp.yourdomain.com` → tunnel.
3. Test from external network: connect Claude Desktop to `https://mcp.yourdomain.com/mcp/sse`.
4. Verify auth and rate limiting work remotely.

**End of Day 28:** MCP is accessible worldwide.

---

### Day 29 — Documentation & README

**Tasks:**
1. Write `README.md`: architecture, setup, API docs, deployment.
2. Write `docs/ARCHITECTURE.md`: MCP protocol diagram, tool chain examples.
3. Document all 35 system design concepts with code examples.
4. Write integration guide: "How to connect Claude Desktop to The Swarm."

**End of Day 29:** Project documented.

---

### Day 30 — Ship Day: Final Polish & Reflection

**Tasks:**
1. Run full test suite: unit + integration + chain tests.
2. Verify Grafana, Jaeger, audit logs.
3. GitHub release `v1.0.0`.
4. Reflect: list all concepts learned. Categorize: Protocol Design, Security, Orchestration, DevOps, AI Systems.
5. Identify gaps for Project 4 (Agent Orchestrator).

**End of Day 30:** You have shipped a production-grade MCP tool system.

---

## Copy Planner Prompt

```
I'm building The Swarm — a production-grade MCP Tool System. Give me a detailed Day-by-Day 30-day plan. My stack is Node.js, Hono, Drizzle ORM, PostgreSQL, Redis, Docker, k3s, Cloudflare Tunnel, plus MCP SDK, Zod, BullMQ, Docker Sandbox, Tavily, Serper, Puppeteer, Playwright, Prometheus, Grafana, OpenTelemetry, Jaeger, Nginx, bcryptjs, jose, pino, The Gatekeeper (Project 1), and The Librarian (Project 2). Today is Day [N]. Walk me through exactly what to build, what to learn, and what files/configs to create. Explain every new term before using it. I have never done backend engineering before but I completed Projects 1 and 2.
```

---

## What You Can Build Now That You Couldn't Before Project 2

| Before Project 2        | After Project 3                                |
| -------------------------| ------------------------------------------------|
| "AI answers questions"  | "AI uses tools to act on the world"            |
| "I can build APIs"      | "I can design protocols"                       |
| "I can cache responses" | "I can sandbox untrusted code"                 |
| "I can route requests"  | "I can route intent via LLM reasoning"         |
| "I can deploy services" | "I can orchestrate multi-service tool chains"  |
| "I can monitor latency" | "I can trace decisions across tool executions" |

---

## Next: Project 4 — The Conductor (Multi-Agent Orchestrator)

The Swarm handles individual tools. The Conductor orchestrates multiple AI agents with memory, planning, and collaboration — turning tools into autonomous teams that solve complex problems together.
