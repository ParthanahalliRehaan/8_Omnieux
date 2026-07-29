# Project 2: The Librarian — RAG Engine

> **Mission:** Build a production-grade Retrieval-Augmented Generation engine that ingests documents, chunks them into searchable pieces, embeds them into vectors, retrieves relevant context, and generates cited answers — all calling through The Gatekeeper. This is the **knowledge brain** that gives AI long-term memory.

---

## 1. Project Name

**The Librarian**

> *Every document. Instant recall. Cited answers.*

---

## 2. Why?

You now understand backend engineering — APIs, databases, caching, deployment. But raw LLMs are amnesiac: they only know their training data and can't access your private documents, your company's knowledge base, or yesterday's meeting notes. **The Librarian** solves this by teaching documents to the AI on demand.

By building this, you will learn:
- **How AI systems remember** — not through model weights (expensive, slow), but through vector search (fast, dynamic)
- **How to process unstructured data** — PDFs, Word docs, images, audio — turning chaos into searchable structure
- **How to evaluate AI systems** — RAG is useless if it retrieves garbage. You will learn to measure faithfulness, relevance, and hallucination
- **How to build AI pipelines** — ingestion → parsing → chunking → embedding → indexing → retrieval → generation. Each stage is a failure point you must handle

This project teaches you **AI Engineering** (not ML research). You won't train models from scratch — you'll learn to *use* models, *evaluate* them, and *orchestrate* them into reliable systems. This is what AI Engineers at startups and enterprises actually do.

The Librarian calls The Gatekeeper for all LLM inference. If your gateway is weak, your RAG is slow and expensive. If your gateway is strong, your RAG is fast, cheap, and reliable.

---

## 3. Stack

### Core Stack (Applied Across All 4 Projects)

| Tool | Role in This Project |
|------|---------------------|
| **Node.js 22 LTS** | Runtime for the RAG pipeline, workers, and API server |
| **Hono** | REST API for document upload, search queries, and retrieval |
| **Drizzle ORM** | Typesafe queries across documents, chunks, embeddings, and evaluation results |
| **PostgreSQL 17** | Stores documents, chunks, conversation history, evaluation metrics |
| **Redis** | Embedding cache, job queue for ingestion pipeline, session state |
| **Docker** | Containerizes the RAG engine, document processors, and vector database |
| **k3s** | Orchestrates RAG API, ingestion workers, and Qdrant as separate services |
| **Cloudflare Tunnel** | Exposes the RAG API for external document ingestion and search |

### Project-Specific Additions

| Tool | Why It's Added |
|------|---------------|
| **Qdrant** | Vector database purpose-built for similarity search. PostgreSQL + pgvector works for small scale; Qdrant handles millions of vectors with HNSW indexing, filtering, and hybrid search at production scale. |
| **OpenAI text-embedding-3-small** | Best cost/quality ratio for embeddings (1536 dimensions). Converts text chunks into dense vectors that capture semantic meaning. |
| **BullMQ** | Redis-backed job queue for the async ingestion pipeline. Document parsing, chunking, and embedding are slow — queue them so the API stays responsive. |
| **Unstructured.io** | Extracts clean text from PDFs, Word docs, PowerPoints, and images. Handles tables, headers, and complex layouts that naive parsers miss. |
| **Marker** | State-of-the-art PDF parser. Converts PDFs to Markdown with preserved structure — headings, lists, tables, equations. Better than Unstructured for academic papers. |
| **tiktoken** | OpenAI's tokenizer. Counts tokens before sending to LLM to prevent context window overflow. Essential for context assembly. |
| **LangChain** | Orchestration framework for RAG pipelines. Handles document loaders, text splitters, vector stores, and retrieval chains with less boilerplate than raw code. |
| **LangSmith** | Observability platform for LangChain. Traces every step of the RAG pipeline — which chunks were retrieved, what the LLM saw, how long each step took. |
| **RAGAS** | Evaluation framework for RAG systems. Measures faithfulness, answer relevance, context precision, context recall — automatically, without human labels. |
| **Cohere Rerank API** | Post-retrieval reranking. Takes the top-20 chunks from vector search and reorders them by relevance to the query. Dramatically improves answer quality. |
| **Prometheus + Grafana** | Metrics: ingestion throughput, retrieval latency, embedding cache hit rate, RAGAS scores over time. |
| **OpenTelemetry + Jaeger** | Distributed tracing: follow a query from upload → parse → chunk → embed → index → retrieve → rerank → generate → respond. |
| **Nginx** | Reverse proxy in front of Hono. Routes `/v1/rag/*` to RAG service, `/v1/docs/*` to document storage, handles file upload size limits. |
| **MinIO (or S3/R2)** | Object storage for original documents. PostgreSQL stores metadata; MinIO stores the actual PDFs, images, and audio files. |
| **Whisper (OpenAI)** | Speech-to-text for audio documents. Transcribes podcasts, meetings, and voicemails into searchable text. |
| **Tesseract OCR** | Extracts text from scanned images and PDFs. Converts visual documents into machine-readable content. |

---

## 4. Directory Structure

```
librarian/
├── .env                          # Secrets: OpenAI key, Qdrant URL, Redis password
├── .env.example                  # Template for required environment variables
├── .gitignore                    # Excludes node_modules, .env, uploads/, dist/
├── docker-compose.yml            # Local dev: Postgres + Redis + Qdrant + MinIO + App
├── Dockerfile                    # Production image for the RAG API server
├── k8s/
│   ├── namespace.yaml            # Namespace: "librarian"
│   ├── deployment-api.yaml       # Hono API server: 2 replicas, resource limits
│   ├── deployment-worker.yaml    # BullMQ ingestion workers: 3 replicas, CPU-heavy
│   ├── deployment-qdrant.yaml    # Vector database: persistent volume for data
│   ├── service-api.yaml          # ClusterIP for API
│   ├── service-qdrant.yaml       # ClusterIP for vector DB
│   ├── ingress.yaml              # Routes /v1/rag/* to API service
│   ├── configmap.yaml            # Non-secret: chunk sizes, batch sizes, timeouts
│   └── secret.yaml               # Secret: API keys, DB passwords
├── docs/
│   ├── 01-what-is-rag.md
│   ├── 02-embeddings-and-vectors.md
│   ├── 03-vector-databases.md
│   ├── 04-chunking-strategies.md
│   ├── 05-hybrid-search.md
│   ├── 06-reranking.md
│   ├── 07-context-assembly.md
│   ├── 08-document-parsing.md
│   ├── 09-embedding-models.md
│   ├── 10-hnsw-indexing.md
│   ├── 11-similarity-metrics.md
│   ├── 12-token-budgeting.md
│   ├── 13-citation-attribution.md
│   ├── 14-ragas-evaluation.md
│   ├── 15-hallucination-detection.md
│   ├── 16-prompt-engineering-for-rag.md
│   ├── 17-async-pipelines.md
│   ├── 18-observability-for-ai.md
│   ├── 19-cost-optimization.md
│   ├── 20-multimodal-documents.md
│   ├── 21-semantic-vs-keyword-search.md
│   ├── 22-incremental-indexing.md
│   ├── 23-query-rewriting.md
│   ├── 24-evaluation-datasets.md
│   └── 25-production-rag-patterns.md
├── src/
│   ├── index.ts                  # Entry point: Hono app, mounts routes, starts server
│   ├── config/
│   │   ├── env.ts                # Validates .env with Zod; loads Qdrant, OpenAI, Redis URLs
│   │   └── database.ts           # Drizzle ORM client for PostgreSQL
│   ├── routes/
│   │   ├── health.ts             # GET /health — liveness probe
│   │   ├── ready.ts              # GET /ready — checks Postgres, Redis, Qdrant connectivity
│   │   ├── ingest.ts             # POST /v1/rag/ingest — upload document, queue for processing
│   │   ├── query.ts              # POST /v1/rag/query — search + generate cited answer
│   │   ├── documents.ts          # GET /v1/rag/documents — list uploaded documents
│   │   ├── chunks.ts             # GET /v1/rag/documents/:id/chunks — view chunks of a document
│   │   └── evaluate.ts           # POST /v1/rag/evaluate — run RAGAS benchmark
│   ├── middleware/
│   │   ├── logger.ts             # Pino structured logging with trace IDs
│   │   ├── request-id.ts         # UUID per request for distributed tracing
│   │   ├── auth.ts               # Validates JWT or API key via The Gatekeeper
│   │   ├── rate-limit.ts         # Redis sliding window per API key
│   │   ├── validate.ts           # Zod request body validation
│   │   ├── error-handler.ts      # Consistent JSON error responses
│   │   └── cors.ts               # CORS headers for cross-origin requests
│   ├── ingestion/
│   │   ├── pipeline.ts           # Orchestrates the full ingestion DAG
│   │   ├── parsers/
│   │   │   ├── pdf.ts            # Marker / pdf-parse for PDF extraction
│   │   │   ├── docx.ts           # mammoth for Word documents
│   │   │   ├── markdown.ts       # marked for Markdown files
│   │   │   ├── html.ts           # cheerio / firecrawl for web pages
│   │   │   ├── image.ts          # Tesseract OCR + GPT-4o Vision for images
│   │   │   ├── audio.ts          # Whisper transcription for audio files
│   │   │   └── video.ts          # Scene detection + keyframe extraction
│   │   ├── chunking/
│   │   │   ├── fixed.ts          # Fixed-size chunks (e.g., 512 tokens)
│   │   │   ├── semantic.ts       # Sentence-boundary chunking (spaCy)
│   │   │   ├── recursive.ts      # Hierarchical splitting (parent → children)
│   │   │   └── router.ts         # Strategy pattern: selects chunker based on document type
│   │   └── embedder.ts           # Calls OpenAI embedding API via The Gatekeeper
│   ├── retrieval/
│   │   ├── vector.ts             # Qdrant similarity search with HNSW index
│   │   ├── keyword.ts            # PostgreSQL full-text search (ts_rank + to_tsvector)
│   │   ├── hybrid.ts             # Reciprocal Rank Fusion: dense + sparse combined
│   │   ├── rerank.ts             # Cohere Rerank API post-processing
│   │   └── router.ts             # Strategy pattern: selects retrieval method
│   ├── generation/
│   │   ├── context-assembly.ts   # Token budget management: fit top-k chunks into 70% of context
│   │   ├── synthesizer.ts        # Calls The Gatekeeper for answer generation with citations
│   │   └── citation.ts           # Maps generated sentences back to source chunk IDs
│   ├── evaluation/
│   │   ├── ragas.ts              # Faithfulness, answer relevancy, context precision/recall
│   │   ├── benchmark.ts          # Golden dataset runner with statistical reporting
│   │   ├── llm-judge.ts          # Automated scoring using LLM-as-judge
│   │   └── golden-dataset.ts     # Curated Q&A pairs for regression testing
│   ├── workers/
│   │   └── ingestion-worker.ts   # BullMQ consumer: parse → chunk → embed → index
│   ├── db/
│   │   ├── schema.ts             # Drizzle tables: documents, chunks, embeddings, queries, evaluations
│   │   ├── migrations/           # Generated by Drizzle Kit
│   │   └── seed.ts               # Dev data: sample documents, test queries
│   ├── lib/
│   │   ├── redis.ts              # Redis client singleton (ioredis)
│   │   ├── qdrant.ts             # Qdrant client initialization
│   │   ├── gateway-client.ts     # Typed fetch wrapper for The Gatekeeper API
│   │   ├── minio.ts              # MinIO/S3 client for document storage
│   │   ├── tiktoken.ts           # Token counting utility
│   │   └── telemetry.ts          # OpenTelemetry tracer setup
│   ├── types/
│   │   └── index.ts              # Shared TypeScript types: Document, Chunk, Embedding, QueryResult
│   └── swagger.ts                # OpenAPI spec + Swagger UI at /docs
├── tests/
│   ├── unit/
│   │   ├── chunking.test.ts
│   │   ├── retrieval.test.ts
│   │   └── context-assembly.test.ts
│   ├── integration/
│   │   ├── ingestion.test.ts
│   │   ├── query.test.ts
│   │   └── evaluation.test.ts
│   └── fixtures/
│       ├── sample-document.pdf
│       ├── sample-queries.json
│       └── expected-answers.json
├── prometheus.yml                # Scrape config for RAG metrics
├── grafana/
│   └── dashboards/
│       └── rag-dashboard.json    # Ingestion throughput, retrieval latency, RAGAS scores
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. System Design Concepts

> **Filter by tool:** Each concept shows which specific tool implements it.

| #   | Concept                                          | Tool                          | How It's Applied in The Librarian                                                                                                                                                   |
| -----| --------------------------------------------------| -------------------------------| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1   | **Retrieval-Augmented Generation (RAG)**         | The entire architecture       | Instead of relying on LLM training data, retrieve relevant document chunks and inject them into the prompt. The LLM answers based on your private documents, not generic knowledge. |
| 2   | **Vector Embeddings**                            | OpenAI text-embedding-3-small | Converts text into 1536-dimensional dense vectors where similar meanings are close in space. "King - Man + Woman ≈ Queen" works because of these vectors.                           |
| 3   | **Vector Database**                              | Qdrant                        | Stores millions of embeddings with HNSW indexing for sub-100ms similarity search. PostgreSQL + pgvector works for <100k vectors; Qdrant scales to billions.                         |
| 4   | **HNSW Indexing**                                | Qdrant                        | Hierarchical Navigable Small World — a graph-based index that finds approximate nearest neighbors in O(log n) time. Trade-off: slightly lower accuracy for massive speedup.         |
| 5   | **Cosine Similarity**                            | Qdrant                        | Measures the angle between two vectors. Identical direction = 1.0 (perfect match). Opposite = -1.0. Perpendicular = 0.0. Used to rank retrieved chunks.                             |
| 6   | **Euclidean Distance**                           | Qdrant                        | Alternative to cosine: measures straight-line distance between vectors. Useful when vector magnitudes matter, not just direction.                                                   |
| 7   | **Document Chunking (Fixed-Size)**               | tiktoken + custom             | Splits text into equal token chunks (e.g., 512 tokens). Simple but may cut sentences mid-thought. Fast, predictable.                                                                |
| 8   | **Document Chunking (Semantic)**                 | spaCy + custom                | Splits at sentence or paragraph boundaries. Preserves meaning but chunk sizes vary. Better for comprehension, harder for uniform processing.                                        |
| 9   | **Document Chunking (Recursive)**                | LangChain                     | Hierarchical splitting: split by headers, then paragraphs, then sentences. Parent chunks provide context; child chunks provide granularity.                                         |
| 10  | **Chunk Overlap**                                | Custom                        | 20% overlap between adjacent chunks preserves context at boundaries. Without overlap, information at chunk edges is lost.                                                           |
| 11  | **Hybrid Search (Dense + Sparse)**               | Qdrant + PostgreSQL           | Dense retrieval (vectors) finds semantic similarity. Sparse retrieval (BM25/TF-IDF) finds exact keyword matches. Combined via Reciprocal Rank Fusion for best of both.              |
| 12  | **Reciprocal Rank Fusion (RRF)**                 | Custom                        | Combines rankings from multiple sources: `score = Σ(1 / (k + rank_i))`. A chunk ranked #1 in vector search and #5 in keyword search gets a strong combined score.                   |
| 13  | **BM25 / TF-IDF**                                | PostgreSQL                    | Classic information retrieval: ranks documents by term frequency and inverse document frequency. "Rare words in this document" score higher.                                        |
| 14  | **Full-Text Search (PostgreSQL)**                | PostgreSQL                    | `to_tsvector` indexes text for fast keyword queries. `ts_rank` scores relevance. Complements vector search for exact matches.                                                       |
| 15  | **Query Rewriting (HyDE)**                       | The Gatekeeper                | Hypothetical Document Embedding: ask the LLM to generate a hypothetical answer, then embed THAT as the query. Improves retrieval for vague questions.                               |
| 16  | **Query Expansion**                              | The Gatekeeper                | Generate 3 variants of the user's query (synonyms, rephrasings, sub-questions). Search with all variants, deduplicate results. Increases recall.                                    |
| 17  | **Re-ranking (Cross-Encoder)**                   | Cohere Rerank API             | After retrieving top-20 chunks via fast vector search, send query + each chunk to a cross-encoder that scores true relevance. Return top-5. Much more accurate than vector alone.   |
| 18  | **Context Window Budgeting**                     | tiktoken + custom             | LLMs have token limits (e.g., 128k for GPT-4o). Reserve 70% for retrieved chunks, 30% for the answer. Count tokens with tiktoken to prevent overflow.                               |
| 19  | **Context Assembly**                             | Custom                        | Select chunks by relevance score until token budget is full. Add chunk metadata (source document, page number) for citation. Order by relevance, not original document order.       |
| 20  | **Citation Attribution**                         | Custom                        | Map each sentence in the generated answer back to the source chunk ID. Store chunk-to-document mapping. Return citations: "[1] Source: annual_report_2024.pdf, page 12."            |
| 21  | **Tokenization**                                 | tiktoken                      | LLMs don't see words — they see tokens (sub-word pieces). "ChatGPT" might be 2 tokens. Understanding tokenization prevents context window overflow and explains pricing.            |
| 22  | **Prompt Engineering for RAG**                   | The Gatekeeper                | System prompt: "You are a research assistant. Answer using ONLY the provided context. If the answer isn't in the context, say 'I don't know.' Cite sources with [1], [2]."          |
| 23  | **Faithfulness Evaluation**                      | RAGAS                         | Measures whether the generated answer is supported by the retrieved context. NLI-based: does the context entail the answer? Prevents hallucinations.                                |
| 24  | **Answer Relevancy Evaluation**                  | RAGAS                         | Measures whether the answer addresses the user's question. Even a faithful answer is useless if it's off-topic.                                                                     |
| 25  | **Context Precision Evaluation**                 | RAGAS                         | Of the retrieved chunks, what fraction was actually relevant? Low precision = noisy context dilutes the answer.                                                                     |
| 26  | **Context Recall Evaluation**                    | RAGAS                         | Of the chunks needed to answer correctly, what fraction was retrieved? Low recall = missing critical information.                                                                   |
| 27  | **Mean Reciprocal Rank (MRR)**                   | Custom                        | If the first relevant chunk is at position 3, MRR = 1/3. Average across queries. Measures ranking quality.                                                                          |
| 28  | **Normalized Discounted Cumulative Gain (NDCG)** | Custom                        | Weights early positions more heavily. A relevant chunk at position 1 contributes more than at position 10. Standard IR metric.                                                      |
| 29  | **Golden Dataset**                               | Custom                        | Curated Q&A pairs where the correct answer and supporting chunks are known. Run RAG on these, compare output to expected. Regression testing for RAG.                               |
| 30  | **LLM-as-Judge**                                 | The Gatekeeper                | Use a strong LLM (GPT-4o) to score RAG outputs. Prompt: "Rate this answer 1-5 for faithfulness and relevance." Cheaper than human labeling, surprisingly accurate.                  |
| 31  | **Async Pipeline (DAG)**                         | BullMQ + custom               | Ingestion is a Directed Acyclic Graph: parse → chunk → embed → index. Each step is a job. If embedding fails, retry without re-parsing.                                             |
| 32  | **Job Queue (BullMQ)**                           | Redis + BullMQ                | Document ingestion is slow (parsing PDFs, calling embedding API). Queue jobs so the upload API returns immediately with "processing." Workers process in background.                |
| 33  | **Job Retry with Backoff**                       | BullMQ                        | If embedding API is rate-limited, retry with exponential backoff: 1s, 2s, 4s, 8s... Prevents hammering the provider.                                                                |
| 34  | **Dead Letter Queue**                            | BullMQ                        | After max retries, move failed jobs to a dead letter queue. Alert operators. Don't silently drop failed ingestions.                                                                 |
| 35  | **Incremental Indexing**                         | Qdrant + Drizzle              | Add new documents without rebuilding the entire index. Upsert chunks: `ON CONFLICT (chunk_hash) DO UPDATE`. Zero downtime indexing.                                                 |
| 36  | **Index Versioning**                             | Qdrant + custom               | Maintain `chunks_v1` and `chunks_v2` collections. Build new index in background, atomically swap alias. Rollback instantly if quality drops.                                        |
| 37  | **Multimodal RAG (Images)**                      | Tesseract + GPT-4o            | Extract text from images via OCR. For diagrams, use vision models to describe content, embed descriptions.                                                                          |
| 38  | **Multimodal RAG (Audio)**                       | Whisper                       | Transcribe podcasts, meetings, voicemails. Chunk transcripts, embed, retrieve. Audio becomes as searchable as text.                                                                 |
| 39  | **Multimodal RAG (Video)**                       | Custom                        | Scene detection → keyframe extraction → vision model description → embed descriptions. Search: "find the meeting where we discussed Q3 budget."                                     |
| 40  | **Object Storage**                               | MinIO                         | Original documents (PDFs, images) stored in S3-compatible object storage. PostgreSQL stores metadata (filename, size, MIME type). Separation of concerns.                           |
| 41  | **Connection Pooling**                           | PostgreSQL + Drizzle          | RAG queries are database-heavy. Maintain a pool of 20 reusable connections. Prevents connection exhaustion under load.                                                              |
| 42  | **Write-Ahead Logging (WAL)**                    | PostgreSQL                    | Every document ingestion is logged before applying. If server crashes mid-ingestion, WAL replays to restore consistency.                                                            |
| 43  | **ACID Transactions**                            | PostgreSQL + Drizzle          | When creating a document + its chunks + its embeddings, wrap in a transaction. All succeed or all rollback. No orphan chunks.                                                       |
| 44  | **Database Indexing**                            | PostgreSQL                    | Indexes on `documents.tenant_id`, `chunks.document_id`, `queries.created_at`. Without these, listing documents or filtering by tenant scans entire tables.                          |
| 45  | **Caching (Embedding Cache)**                    | Redis                         | Cache query embeddings: hash the query text → check Redis → if hit, skip OpenAI API call. Saves money and latency on repeated questions.                                            |
| 46  | **Caching (Response Cache)**                     | Redis                         | Cache final RAG answers for common queries ("What is our refund policy?"). TTL = 1 hour. Check before any retrieval.                                                                |
| 47  | **Rate Limiting**                                | Redis                         | Per-API-key sliding window on `/v1/rag/query`. Prevents users from burning through your OpenAI credits.                                                                             |
| 48  | **Circuit Breaker**                              | Redis                         | Break on OpenAI embedding API failures. Fallback to cached embeddings or return "service temporarily unavailable."                                                                  |
| 49  | **Structured Logging**                           | pino                          | Every ingestion job logged: document ID, parser used, chunk count, embedding count, duration. Every query logged: retrieval method, chunks retrieved, generation time.              |
| 50  | **Distributed Tracing**                          | OpenTelemetry + Jaeger        | Trace: upload → parse (500ms) → chunk (50ms) → embed (2000ms) → index (100ms). Pinpoint bottlenecks. Trace queries: retrieve (80ms) → rerank (150ms) → generate (800ms).            |
| 51  | **Metrics Collection**                           | Prometheus                    | `rag_ingestion_duration_seconds`, `rag_query_latency_seconds`, `ragas_faithfulness_score`, `embedding_cache_hit_rate`. Grafana dashboards show trends.                              |
| 52  | **Health Checks**                                | Hono + k8s                    | `/health` = process alive. `/ready` = Postgres + Redis + Qdrant reachable. Kubernetes uses these to route traffic and restart failed pods.                                          |
| 53  | **Graceful Shutdown**                            | Node.js + k8s                 | On SIGTERM: stop accepting new ingestion jobs, finish in-flight embeddings, close DB/Redis/Qdrant connections, exit cleanly.                                                        |
| 54  | **Reverse Proxy**                                | Nginx                         | Routes `/v1/rag/*` to RAG service, `/uploads/*` to MinIO, handles SSL termination. RAG service sees only internal traffic.                                                          |
| 55  | **Load Balancing**                               | Nginx + k8s                   | Distribute query requests across RAG API pods. Scale ingestion workers independently (CPU-heavy) from API pods (I/O-heavy).                                                         |

---

## 6. 30-Day Planner

---

### Day 0 — Environment Setup & Concept Foundation

**Before touching anything, learn:**
- What is **RAG**? Retrieval-Augmented Generation: instead of asking an LLM to answer from memory, you first retrieve relevant documents, then ask the LLM to answer based on those documents. Like an open-book exam.
- What is an **embedding**? A list of numbers (e.g., 1536 of them) that captures the meaning of text. Similar texts have similar number lists. Computers compare these lists to find "semantically close" content.
- What is a **vector**? Just a fancy word for "list of numbers with direction and magnitude." In AI, every piece of text becomes a vector.
- What is **semantic search**? Searching by meaning, not keywords. If you search "royal ruler," it finds "king" even if the word "king" never appears. Because their vectors are close.
- What is **tokenization** (review from Project 1)? LLMs charge by token, not word. "ChatGPT" = 2 tokens. You must count tokens to stay within limits.
- What is **LangChain**? A framework that glues AI components together: document loaders → text splitters → vector stores → retrievers → LLMs. Saves you from writing boilerplate.
- What is **Qdrant**? A database built specifically for storing and searching vectors. Like PostgreSQL is for tables, Qdrant is for vectors.

**Tasks:**
1. Verify Node.js 22, Docker, k3s, Git are still installed from Project 1.
2. Create GitHub repo `librarian`. Clone locally.
3. Run `npm init -y`. Install core dependencies: `hono`, `drizzle-orm`, `pg`, `ioredis`, `zod`, `pino`, `bullmq`, `@qdrant/js-client-rest`.
4. Install dev dependencies: `typescript`, `tsx`, `drizzle-kit`, `@types/node`.
5. Create directory structure (empty files) per the tree above.
6. Create `.env` and `.gitignore`.
7. Create `docker-compose.yml` with services: `postgres` (17), `redis` (7), `qdrant` (latest), `minio` (latest).
8. Run `docker compose up -d`. Verify all services start: `docker ps`.
9. Test Qdrant: `curl http://localhost:6333/collections` → should return `{"result":[],"status":"ok"}`.
10. Test MinIO: open `http://localhost:9001`, login with default credentials.

**End of Day 0:** All infrastructure running locally. You understand what RAG is and why vectors matter.

---

### Day 1 — Hello Qdrant: Your First Vector Database

**Learn before coding:**
- What is a **collection** in Qdrant? Like a table in PostgreSQL, but for vectors. Each collection has a name, vector size (1536 for OpenAI), and distance metric (cosine).
- What is **vector similarity search**? Given a query vector, find the N closest vectors in the collection. Qdrant does this in milliseconds even with millions of vectors.
- What is **HNSW**? A graph algorithm that pre-builds connections between similar vectors. Search follows these connections instead of comparing to every vector. Speeds up search 1000x.

**Tasks:**
1. Create `src/lib/qdrant.ts`: initialize Qdrant client pointing to `http://localhost:6333`.
2. Create a test script `src/db/test-qdrant.ts`:
   ```typescript
   import { qdrant } from '../lib/qdrant'

   // Create collection
   await qdrant.createCollection('test_chunks', {
     vectors: { size: 1536, distance: 'Cosine' }
   })

   // Insert a fake vector
   await qdrant.upsert('test_chunks', {
     points: [{ id: 1, vector: new Array(1536).fill(0.1), payload: { text: 'hello world' } }]
   })

   // Search
   const results = await qdrant.search('test_chunks', {
     vector: new Array(1536).fill(0.1),
     limit: 3
   })
   console.log(results)
   ```
3. Run: `tsx src/db/test-qdrant.ts`.
4. Explain: `payload` stores metadata (the original text, document ID, page number). `vector` stores the embedding. Search returns closest vectors + their payloads.
5. Delete test collection: `await qdrant.deleteCollection('test_chunks')`.

**End of Day 1:** You can create collections, insert vectors, and search. You understand why vector DBs exist.

---

### Day 2 — OpenAI Embeddings: Turning Text into Vectors

**Learn before coding:**
- What is an **embedding model**? A neural network trained to convert text into vectors where similar meanings are close. Not a chat model — it doesn't generate text, it only produces vectors.
- What is **text-embedding-3-small**? OpenAI's cheapest embedding model. 1536 dimensions. Good enough for most RAG use cases. Costs ~$0.02 per 1M tokens.
- What is **dimensionality**? The number of numbers in the vector. 1536 means each text is represented by 1536 floating-point numbers. Higher dimensions = more nuance but more storage.

**Tasks:**
1. Sign up for OpenAI API, get API key. Add to `.env`.
2. Install OpenAI SDK: `npm install openai`.
3. Create `src/lib/embedder.ts`:
   ```typescript
   import OpenAI from 'openai'
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

   export async function embed(text: string) {
     const response = await openai.embeddings.create({
       model: 'text-embedding-3-small',
       input: text,
     })
     return response.data[0].embedding // Array of 1536 numbers
   }
   ```
4. Create test script: embed "The quick brown fox" and "A fast brown animal." Compare cosine similarity (should be high, ~0.8+). Embed "Quantum physics" and compare (should be low, ~0.2).
5. Install and use `compute-cosine-similarity` or write your own:
   ```typescript
   function cosineSimilarity(a: number[], b: number[]) {
     const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
     const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
     const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
     return dot / (magA * magB)
   }
   ```
6. Verify: similar sentences have high similarity, unrelated sentences have low similarity.

**End of Day 2:** You can convert text to vectors and compare their similarity. This is the core of semantic search.

---

### Day 3 — Document Parsing: From File to Text

**Learn before coding:**
- What is **document parsing**? Extracting clean text from files (PDFs, Word docs, images). Not as simple as "read the file" — PDFs store text as positioned glyphs, not as sentences.
- What is **OCR**? Optical Character Recognition — reading text from images. Scanned PDFs are images, not text. Tesseract is an open-source OCR engine.
- What is **Unstructured.io**? A library that handles complex documents: tables, headers, footnotes, multi-column layouts. Returns structured elements, not just raw text.

**Tasks:**
1. Install parsers: `npm install pdf-parse mammoth`.
2. Install Tesseract: `brew install tesseract` (Mac) or `apt-get install tesseract-ocr` (Linux).
3. Install `node-tesseract-ocr`: `npm install node-tesseract-ocr`.
4. Create `src/ingestion/parsers/pdf.ts`: uses `pdf-parse` to extract text from PDFs.
5. Create `src/ingestion/parsers/docx.ts`: uses `mammoth` to extract text from Word documents.
6. Create `src/ingestion/parsers/image.ts`: uses Tesseract to OCR images.
7. Create test script: download a sample PDF, parse it, print extracted text. Verify it makes sense (not gibberish).
8. Handle edge cases: encrypted PDFs, corrupted files, empty documents. Return clear errors.

**End of Day 3:** You can extract text from multiple document formats. You understand why parsing is harder than it looks.

---

### Day 4 — Chunking Strategies: Splitting Text Intelligently

**Learn before coding:**
- What is **chunking**? Splitting long documents into smaller pieces that fit in the LLM's context window and the embedding model's input limit. A 100-page PDF becomes 200 chunks of 512 tokens each.
- Why chunk? Embedding models have input limits (e.g., 8192 tokens). LLMs have context limits. And smaller chunks retrieve more precisely than entire documents.
- What is **overlap**? Repeating the last 20% of chunk N at the start of chunk N+1. Preserves context across boundaries. Without overlap, "The quick brown..." and "...fox jumps" lose the connection.

**Tasks:**
1. Install `tiktoken`: `npm install js-tiktoken`.
2. Create `src/ingestion/chunking/fixed.ts`:
   - Input: text string, chunkSize (tokens), overlap (tokens).
   - Use tiktoken to count tokens. Split at token boundaries.
   - Return array of { text, startToken, endToken, index }.
3. Create `src/ingestion/chunking/semantic.ts`:
   - Split at sentence boundaries (period + space + capital letter).
   - Group sentences into chunks of approximately chunkSize tokens.
   - More natural breaks but variable chunk sizes.
4. Create `src/ingestion/chunking/router.ts`:
   - Strategy pattern: choose chunker based on document type.
   - PDFs with tables → fixed (predictable). Narrative text → semantic (natural).
5. Test: chunk a long text with both strategies. Count chunks. Verify overlap works.

**End of Day 4:** You can split documents into searchable chunks. You understand the trade-offs between strategies.

---

### Day 5 — The Ingestion Pipeline: Parse → Chunk → Embed → Index

**Learn before coding:**
- What is a **pipeline**? A sequence of processing steps where the output of step N is the input of step N+1. Like an assembly line.
- What is **async/await**? JavaScript's way to handle operations that take time (API calls, file reads) without blocking other work. `await` pauses this function; other functions keep running.
- What is **error handling in pipelines**? If embedding fails, you don't want to re-parse the document. Each step should be retryable independently.

**Tasks:**
1. Create `src/ingestion/pipeline.ts`:
   ```typescript
   export async function ingestDocument(file: Buffer, filename: string, mimeType: string) {
     // Step 1: Parse
     const text = await parseDocument(file, mimeType)

     // Step 2: Chunk
     const chunks = await chunkText(text, { strategy: 'semantic', size: 512, overlap: 50 })

     // Step 3: Embed
     const embeddings = await Promise.all(chunks.map(c => embed(c.text)))

     // Step 4: Index
     await indexChunks(chunks, embeddings, filename)

     return { documentId, chunkCount: chunks.length }
   }
   ```
2. Create `src/ingestion/embedder.ts`: batch embedding (send multiple chunks in one OpenAI API call for efficiency).
3. Create `src/ingestion/indexer.ts`: insert chunks into Qdrant with payload metadata.
4. Create `src/db/schema.ts`: add `documents` and `chunks` tables.
5. Generate migration, apply it.
6. Test end-to-end: upload a PDF, verify it appears in `documents` table, verify chunks appear in Qdrant.

**End of Day 5:** Documents flow through your pipeline and become searchable. You understand async pipelines.

---

### Day 6 — BullMQ: Async Job Processing

**Learn before coding:**
- What is a **job queue**? A list of tasks waiting to be processed. Producers add jobs; consumers remove and execute them. Decouples fast operations (API responses) from slow operations (document processing).
- What is **BullMQ**? A Redis-backed job queue for Node.js. Supports priorities, delays, retries, scheduling, and progress tracking.
- Why not just `await` in the API? If parsing takes 30 seconds, the HTTP request hangs. Users see a spinning wheel. With queues, you return "processing" immediately.

**Tasks:**
1. Install BullMQ: `npm install bullmq`.
2. Create `src/lib/queue.ts`: initialize `Queue('ingestion')` connected to Redis.
3. Update `src/routes/ingest.ts`:
   - Accept file upload (multipart/form-data).
   - Save file to MinIO.
   - Add job to queue: `{ documentId, filename, mimeType, s3Key }`.
   - Return immediately: `{ status: 'processing', documentId, checkStatusAt: '/v1/rag/documents/:id' }`.
4. Create `src/workers/ingestion-worker.ts`:
   - BullMQ `Worker('ingestion', async (job) => { ... })`.
   - Executes the full pipeline: download from MinIO → parse → chunk → embed → index.
   - Update document status in PostgreSQL: `pending` → `parsing` → `chunking` → `embedding` → `indexed`.
5. Run worker: `tsx src/workers/ingestion-worker.ts`.
6. Test: upload PDF via curl. Verify immediate response. Watch worker logs. Verify final status is `indexed`.

**End of Day 6:** Your API is responsive even during heavy processing. You understand why queues are essential for production systems.

---

### Day 7 — Retrieval: Vector Search + Keyword Search

**Learn before coding:**
- What is **dense retrieval**? Using vector embeddings to find semantically similar content. Good for conceptual queries ("What is RAG?").
- What is **sparse retrieval**? Using keyword matching (BM25/TF-IDF) to find exact word matches. Good for specific queries ("Section 3.2 of the contract").
- What is **hybrid search**? Combining both. Dense finds "related concepts." Sparse finds "exact mentions." Together they cover more ground.

**Tasks:**
1. Create `src/retrieval/vector.ts`:
   - Embed the query text.
   - Search Qdrant: `qdrant.search('chunks', { vector: queryEmbedding, limit: 20, filter: { must: [{ key: 'tenantId', match: { value: tenantId } }] } })`.
   - Return chunks with similarity scores.
2. Create `src/retrieval/keyword.ts`:
   - Use PostgreSQL full-text search: `SELECT * FROM chunks WHERE to_tsvector('english', text) @@ plainto_tsquery('english', $1)`.
   - Return chunks with `ts_rank` scores.
3. Create `src/retrieval/hybrid.ts`:
   - Get top-20 from vector search, top-20 from keyword search.
   - Apply Reciprocal Rank Fusion: `score = 1/(60 + rank_vector) + 1/(60 + rank_keyword)`.
   - Deduplicate by chunk ID, sort by fused score, return top-10.
4. Create `POST /v1/rag/query`: accepts `{ query, method: 'vector' | 'keyword' | 'hybrid' }`.
5. Test all three methods with the same query. Compare results.

**End of Day 7:** You can retrieve relevant chunks using multiple strategies. You understand when each method excels.

---

### Day 8 — Re-ranking: Precision After Recall

**Learn before coding:**
- What is **recall**? Did we find ALL relevant chunks? (Retrieval phase — cast a wide net.)
- What is **precision**? Of the chunks we found, how many are ACTUALLY relevant? (Re-ranking phase — narrow down.)
- What is a **cross-encoder**? A model that takes TWO texts (query + chunk) and outputs a relevance score. More accurate than vector similarity but slower. Use it on top-20, not the full collection.

**Tasks:**
1. Sign up for Cohere API, get free API key.
2. Install Cohere SDK: `npm install cohere-ai`.
3. Create `src/retrieval/rerank.ts`:
   ```typescript
   import { CohereClient } from 'cohere-ai'
   const cohere = new CohereClient({ token: process.env.COHERE_API_KEY })

   export async function rerank(query: string, chunks: Chunk[], topN: number = 5) {
     const response = await cohere.rerank({
       query,
       documents: chunks.map(c => c.text),
       topN,
       model: 'rerank-english-v3.0'
     })
     return response.results.map(r => ({ chunk: chunks[r.index], score: r.relevanceScore }))
   }
   ```
4. Update `POST /v1/rag/query`: after retrieval, if `rerank: true`, call reranker. Return top-5 instead of top-10.
5. Test: query with and without reranking. Compare answer quality subjectively.

**End of Day 8:** Your retrieval is precise. You understand the recall → precision pipeline.

---

### Day 9 — Context Assembly & Generation: Building the Prompt

**Learn before coding:**
- What is **context assembly**? Taking retrieved chunks and formatting them into a prompt the LLM can use. Not just "here are some chunks" — structured, cited, within token budget.
- What is **token budgeting**? The LLM has a limit (e.g., 128k tokens). You must fit: system prompt + retrieved context + user query + room for answer. Use tiktoken to count everything.
- What are **citations**? Telling the user WHERE the answer came from. "The revenue was $5M [1]" where [1] links to `annual_report.pdf, page 12`.

**Tasks:**
1. Create `src/generation/context-assembly.ts`:
   - Input: retrieved chunks, maxTokens (budget).
   - Count system prompt tokens. Count user query tokens.
   - Add chunks by relevance until remaining budget is < 30% of max (reserve for answer).
   - Format: `"Context:
[1] {chunk.text} (Source: {chunk.source}, Page: {chunk.page})
[2] ..."`.
2. Create `src/generation/synthesizer.ts`:
   - Build full prompt: system instructions + assembled context + user query.
   - Call The Gatekeeper (your Project 1 API) for generation.
   - Parse response, extract citations from the LLM's output.
3. Create `src/generation/citation.ts`:
   - Map citation numbers [1], [2] back to chunk metadata.
   - Return structured response: `{ answer, citations: [{ number, source, page, text }] }`.
4. Test: upload a document, query it, verify answer contains citations and they point to real chunks.

**End of Day 9:** Your RAG generates cited answers. You understand how context shapes LLM outputs.

---

### Day 10 — Core RAG Complete: End-to-End Test

**Learn before coding:**
- What is **end-to-end testing**? Testing the entire flow, not just individual functions. Like testing a car by driving it, not just checking the engine.
- What is a **golden dataset**? A set of questions with known correct answers. Used to verify your system works before deploying.

**Tasks:**
1. Create `tests/fixtures/sample-document.pdf`: a simple 2-page document about a fictional company "Acme Corp."
2. Create `tests/fixtures/sample-queries.json`:
   ```json
   [
     { "query": "What is Acme Corp's revenue?", "expectedAnswer": "$10 million", "expectedSource": "page 1" },
     { "query": "Who is the CEO?", "expectedAnswer": "Jane Smith", "expectedSource": "page 2" }
   ]
   ```
3. Write integration test: upload PDF → wait for indexing → query → verify answer contains expected text → verify citation points to correct page.
4. Run test: `npm test`. Fix any failures.
5. Document: create `docs/01-what-is-rag.md` explaining what you built and how it works.

**End of Day 10:** Core RAG works end-to-end. You can ingest documents and ask questions with cited answers.

---

### Day 11 — Query Rewriting: HyDE & Multi-Query

**Learn before coding:**
- What is **HyDE**? Hypothetical Document Embedding. Instead of embedding the user's vague query ("tell me about taxes"), ask the LLM to generate a hypothetical answer, then embed THAT. The hypothetical answer is richer and more specific.
- What is **query expansion**? Generate multiple variants of the query. Search with all of them. More variants = more chances to find relevant chunks.

**Tasks:**
1. Create `src/retrieval/query-rewriting/hyde.ts`:
   - Call The Gatekeeper: "Generate a short paragraph answering: {query}".
   - Embed the generated paragraph.
   - Search Qdrant with this embedding.
2. Create `src/retrieval/query-rewriting/multi-query.ts`:
   - Call The Gatekeeper: "Generate 3 different ways to ask: {query}".
   - Embed all 3 variants.
   - Search with each, deduplicate results, return combined top-10.
3. Update `POST /v1/rag/query`: add `rewrite: 'none' | 'hyde' | 'multi'` parameter.
4. Test: use a vague query with and without rewriting. Measure if retrieval quality improves.

**End of Day 11:** Your retrieval handles vague queries better. You understand query optimization.

---

### Day 12 — Evaluation with RAGAS: Measure Quality

**Learn before coding:**
- What is **RAGAS**? A framework that evaluates RAG systems automatically. No human labels needed — it uses LLMs to judge faithfulness, relevance, etc.
- Why evaluate? Without metrics, you're flying blind. "It feels like it's working" is not engineering.
- What is **faithfulness**? Does the answer stick to the retrieved context? Or does it hallucinate information not in the chunks?

**Tasks:**
1. Install RAGAS: `npm install ragas` (or use the Python version via a microservice if Node.js support is limited).
2. Create `src/evaluation/ragas.ts`:
   - `evaluateFaithfulness(answer, contexts)`: LLM judges if each sentence is supported by context.
   - `evaluateAnswerRelevancy(answer, query)`: LLM judges if answer addresses the question.
   - `evaluateContextPrecision(contexts, query)`: What fraction of retrieved chunks were useful?
   - `evaluateContextRecall(contexts, expectedAnswer)`: Were all needed chunks retrieved?
3. Create `POST /v1/rag/evaluate`: accepts `{ query, expectedAnswer? }`, runs full RAG pipeline, returns metrics.
4. Test with golden dataset. Print scores. Identify weak points.

**End of Day 12:** You can measure RAG quality objectively. You understand why evaluation is non-negotiable for AI systems.

---

### Day 13 — LLM-as-Judge: Automated Scoring

**Learn before coding:**
- What is **LLM-as-judge**? Using a strong model (GPT-4o) to score outputs from a weaker pipeline. Cheaper and faster than human evaluation.
- What are **prompt templates for judging**? Structured prompts that force the LLM to output scores consistently. Example: "Rate faithfulness 1-5. Output ONLY a number."

**Tasks:**
1. Create `src/evaluation/llm-judge.ts`:
   - Prompt template: `"You are an evaluator. Rate the following answer for faithfulness to the provided context.

Context: {context}

Answer: {answer}

Rate 1-5 where 1 = completely unfaithful, 5 = perfectly faithful. Output ONLY the number."`.
   - Call The Gatekeeper with this prompt.
   - Parse numeric response.
2. Compare RAGAS scores vs. LLM-as-judge scores. Do they agree? If not, why?
3. Build `src/evaluation/benchmark.ts`: runs all golden dataset queries, collects all metrics, generates report.

**End of Day 13:** You have two evaluation methods. You understand the trade-offs between automated frameworks and custom judges.

---

### Day 14 — Observability: LangSmith Tracing

**Learn before coding:**
- What is **LangSmith**? An observability platform built by the LangChain team. Traces every step: which chunks were retrieved, what the LLM saw, how long each step took.
- Why trace RAG specifically? Debugging RAG is hard. "Why did it give a bad answer?" Traces show: maybe retrieval found wrong chunks, maybe context was truncated, maybe the LLM ignored instructions.

**Tasks:**
1. Sign up for LangSmith (free tier), get API key.
2. Install LangChain: `npm install langchain @langchain/openai`.
3. Wrap your RAG pipeline in LangChain components:
   - `DocumentLoader` → `TextSplitter` → `OpenAIEmbeddings` → `QdrantVectorStore` → `RetrievalQAChain`.
4. Configure LangSmith tracing: set `LANGCHAIN_TRACING_V2=true`, `LANGCHAIN_API_KEY`.
5. Run queries, open LangSmith dashboard, inspect traces.
6. Identify: which step takes longest? Which chunks were retrieved? What prompt was sent to LLM?

**End of Day 14:** You can debug RAG pipelines visually. You understand why tracing is essential for AI systems.

---

### Day 15 — Advanced Chunking: Recursive & Hierarchical

**Learn before coding:**
- What is **recursive chunking**? Split by largest unit first (sections), then medium (paragraphs), then smallest (sentences). Preserves document hierarchy.
- What is **hierarchical retrieval**? Retrieve small chunks for precision, but include their parent section for context. "This sentence [small chunk] is from Section 3.2 [parent chunk]."

**Tasks:**
1. Create `src/ingestion/chunking/recursive.ts`:
   - Split by Markdown headers (`#`, `##`, `###`).
   - Within each section, split by paragraphs.
   - Within each paragraph, split by sentences (if still too long).
   - Return hierarchy: parent chunk ID, child chunk IDs.
2. Update Qdrant schema: add `parentId` to payload.
3. Update retrieval: when retrieving a child chunk, optionally include its parent for additional context.
4. Test with a structured document (Markdown with headers). Compare recursive vs. fixed chunking.

**End of Day 15:** Your chunking respects document structure. You understand hierarchical information.

---

### Day 16 — Multimodal RAG: Images & Audio

**Learn before coding:**
- What is **multimodal RAG**? Processing non-text documents: images, audio, video. Convert them to text (OCR, transcription, description), then embed the text.
- What is **CLIP**? A model that embeds both images and text into the same vector space. Search with text, find images. Search with image, find similar images.

**Tasks:**
1. Image RAG:
   - Tesseract OCR for scanned documents.
   - For diagrams/charts: use The Gatekeeper with vision model (GPT-4o) to generate text description, embed description.
2. Audio RAG:
   - Install Whisper: `npm install openai` (Whisper is part of OpenAI API).
   - Transcribe audio: `openai.audio.transcriptions.create({ file: audio, model: 'whisper-1' })`.
   - Chunk transcript, embed, index.
3. Update `src/ingestion/parsers/` with image and audio handlers.
4. Test: upload an image with text, query "What does the image say?" Verify answer.

**End of Day 16:** Your RAG handles images and audio. You understand multimodal AI pipelines.

---

### Day 17 — Cost Optimization: Caching & Batching

**Learn before coding:**
- What is **embedding caching**? Hash the text → check Redis → if exists, reuse embedding. Avoids redundant OpenAI API calls. Saves money and latency.
- What is **batch embedding**? Send multiple texts in one API call instead of one-by-one. OpenAI charges the same, but you save HTTP overhead.

**Tasks:**
1. Create `src/lib/cache.ts`:
   - `getEmbeddingHash(text)` → SHA-256 of normalized text.
   - `getCachedEmbedding(hash)` → check Redis.
   - `setCachedEmbedding(hash, embedding, ttl = 86400)` → store in Redis.
2. Update `src/ingestion/embedder.ts`: check cache before calling OpenAI. Batch uncached texts into single API call.
3. Add metrics: `embedding_cache_hit_rate`, `embedding_api_calls_saved`.
4. Test: ingest same document twice. Second ingestion should use 100% cached embeddings.

**End of Day 17:** Your RAG is cost-efficient. You understand why caching is critical for AI APIs.

---

### Day 18 — Docker & k3s: Containerize The Librarian

**Learn before coding:**
- What is a **microservice**? A small, independent service that does one thing well. The Librarian is a microservice that handles document knowledge. The Gatekeeper is a separate microservice.
- What is **service-to-service communication**? The Librarian calls The Gatekeeper via HTTP. In Kubernetes, services discover each other via DNS names.

**Tasks:**
1. Create `Dockerfile` for The Librarian (multi-stage build, like Project 1).
2. Update `docker-compose.yml`: add `librarian` service, depends on `postgres`, `redis`, `qdrant`, `minio`.
3. Test locally: `docker compose up --build`.
4. Create k8s manifests: `deployment-api.yaml`, `deployment-worker.yaml`, `service-api.yaml`.
5. Deploy to k3s: `kubectl apply -f k8s/`.
6. Verify pods: `kubectl get pods -n librarian`.

**End of Day 18:** The Librarian runs in Kubernetes. You understand microservice deployment.

---

### Day 19 — Service Mesh: The Librarian Calls The Gatekeeper

**Learn before coding:**
- What is **service discovery**? In Kubernetes, services find each other by name. `http://gatekeeper.gatekeeper.svc.cluster.local:3000` resolves to the Gatekeeper service.
- What is an **internal API call**? The Librarian (in `librarian` namespace) calls The Gatekeeper (in `gatekeeper` namespace) over the cluster network. Not exposed to the internet.

**Tasks:**
1. Update `src/lib/gateway-client.ts`:
   - Base URL: `http://gatekeeper.gatekeeper.svc.cluster.local:3000` (in k3s) or `http://localhost:3000` (local dev).
   - Typed wrapper for Gatekeeper endpoints: `chatCompletion()`, `getUsage()`.
   - Error handling: if Gatekeeper returns 503, retry with backoff.
1. Update `src/generation/synthesizer.ts`: use `gateway-client` instead of direct OpenAI calls.
2. Test: deploy both services in k3s. Query The Librarian. Verify it calls The Gatekeeper for LLM inference.
3. Check Jaeger traces: see request flow from Librarian → Gatekeeper → Groq.
4. Step 5 — Publish to npm registry
  1. Ensure package.json has correct name (@your-org/librarian), version (1.0.0), main (dist/index.js), and files (["dist/", "src/"])
  2. Run npm run build to compile TypeScript to dist/
  3. Run npm publish --access public (or --access restricted for private)
  4. Verify: npm view @your-org/librarian shows the published package
  5. Test install in a fresh directory: npm install @your-org/librarian and import Librarian class

**End of Day 19:** Your services communicate internally. You understand microservice architecture.

---

### Day 20 — Nginx Ingress: Route External Traffic

**Learn before coding:**
- What is **path-based routing**? `/v1/rag/*` goes to The Librarian. `/v1/chat/*` goes to The Gatekeeper. One domain, multiple services.
- What is **SSL termination**? Nginx handles HTTPS certificates. Services behind it speak plain HTTP. Simplifies certificate management.

**Tasks:**
1. Update `k8s/ingress.yaml`:
   ```yaml
   rules:
     - host: api.yourdomain.com
       http:
         paths:
           - path: /v1/rag
             backend:
               service:
                 name: librarian-api
                 port: { number: 3000 }
           - path: /v1/chat
             backend:
               service:
                 name: gatekeeper
                 port: { number: 3000 }
   ```
2. Apply ingress. Test: `curl https://api.yourdomain.com/v1/rag/health` and `curl https://api.yourdomain.com/v1/chat/health`.
3. Verify SSL: `curl -v` should show TLS handshake.

**End of Day 20:** External traffic routes correctly. You understand ingress and routing.

---

### Day 21 — Prometheus & Grafana: RAG Metrics

**Tasks:**
1. Add Prometheus metrics to The Librarian:
   - `rag_ingestion_duration_seconds` (histogram)
   - `rag_query_latency_seconds` (histogram)
   - `ragas_faithfulness_score` (gauge)
   - `embedding_cache_hit_rate` (gauge)
   - `chunks_indexed_total` (counter)
2. Create Grafana dashboard JSON: panels for ingestion throughput, query latency, cache hit rate, RAGAS scores over time.
3. Import dashboard. Generate traffic. Verify graphs update.

**End of Day 21:** You monitor RAG performance. You understand AI system observability.

---

### Day 22 — OpenTelemetry: Trace the Full Pipeline

**Tasks:**
1. Add spans to ingestion pipeline: `parse` → `chunk` → `embed` → `index`.
2. Add spans to query pipeline: `embed_query` → `retrieve` → `rerank` → `assemble_context` → `generate`.
3. Deploy Jaeger in k3s. View traces.
4. Identify slowest span. Optimize it.

**End of Day 22:** You trace every step. You understand pipeline bottlenecks.

---

### Day 23 — Advanced Evaluation: Golden Dataset & CI

**Tasks:**
1. Build comprehensive golden dataset: 50 Q&A pairs across document types (PDF, image, audio).
2. Create `tests/evaluation/golden-run.ts`: runs all queries, collects RAGAS + LLM-judge scores.
3. Set thresholds: faithfulness > 0.7, answer relevancy > 0.8. Fail if below.
4. Add to CI: GitHub Action runs golden dataset on every PR.

**End of Day 23:** You have regression testing for RAG quality. You understand CI for AI systems.

---

### Day 24 — Multi-Tenancy: Isolated Knowledge Bases

**Tasks:**
1. Add `tenantId` to all tables and Qdrant payloads.
2. Filter all retrieval by `tenantId`.
3. Tenant-scoped rate limits and usage tracking.
4. Test: Tenant A cannot retrieve Tenant B's documents.

**End of Day 24:** Your RAG serves multiple customers safely.

---

### Day 25 — Security: Input Sanitization & Prompt Injection

**Tasks:**
1. Sanitize uploaded filenames (prevent path traversal).
2. Scan document text for prompt injection patterns (`ignore previous instructions`, `DAN`, `jailbreak`).
3. Add content-type validation. Reject unexpected file types.
4. Rate limit per tenant per document type.

**End of Day 25:** Your RAG is hardened against common attacks.

---

### Day 26 — Graceful Shutdown & Resource Cleanup

**Tasks:**
1. Handle SIGTERM: finish in-flight ingestion jobs, close Qdrant/Redis/Postgres connections.
2. Cancel pending BullMQ jobs gracefully.
3. Clean up temporary files from MinIO uploads.
4. Test: `kubectl delete pod` during ingestion. Verify no data corruption.

**End of Day 26:** Your RAG shuts down cleanly.

---

### Day 27 — Load Testing: Find RAG Breaking Points

**Tasks:**
1. k6 load test: 100 concurrent queries.
2. Monitor: Qdrant latency, embedding API rate limits, Postgres connection pool.
3. Identify bottleneck. Optimize: add Qdrant replicas, increase connection pool, enable embedding cache.
4. Re-run and compare.

**End of Day 27:** You know your RAG's limits.

---

### Day 28 — Cloudflare Tunnel: Expose RAG API

**Tasks:**
1. Configure `cloudflared` tunnel for The Librarian.
2. Update DNS: `rag.yourdomain.com` → tunnel.
3. Test from external network.
4. Verify SSL and rate limiting work.

**End of Day 28:** Your RAG is accessible worldwide.

---

### Day 29 — Documentation & README

**Tasks:**
1. Write `README.md`: architecture, setup, API docs, deployment.
2. Write `docs/ARCHITECTURE.md`: RAG pipeline diagram.
3. Write `docs/OPERATIONS.md`: monitoring, scaling, troubleshooting.
4. Document all 55 system design concepts with examples from your codebase.

**End of Day 29:** Your project is documented.

---

### Day 30 — Ship Day: Final Polish & Reflection

**Tasks:**
1. Run full test suite: unit + integration + golden dataset.
2. Verify Grafana dashboards, Jaeger traces, LangSmith logs.
3. GitHub release `v1.0.0`.
4. Reflect: list all concepts learned. Categorize: Vector Search, NLP, Evaluation, DevOps, AI Engineering.
5. Identify gaps for Project 3 (MCP Swarm).

**End of Day 30:** You have shipped a production-grade RAG engine.

---

## Copy Planner Prompt

```
I'm building The Librarian — a production-grade RAG Engine. Give me a detailed Day-by-Day 30-day plan. My stack is Node.js, Hono, Drizzle ORM, PostgreSQL, Redis, Docker, k3s, Cloudflare Tunnel, plus Qdrant, OpenAI text-embedding-3-small, BullMQ, Unstructured.io, Marker, tiktoken, LangChain, LangSmith, RAGAS, Cohere Rerank, Prometheus, Grafana, OpenTelemetry, Jaeger, Nginx, MinIO, Whisper, and Tesseract. Today is Day [N]. Walk me through exactly what to build, what to learn, and what files/configs to create. Explain every new term before using it. I have never done backend engineering before but I completed Project 1 (AI Gateway).
```

---

## What You Can Build Now That You Couldn't Before Project 1

| Before Project 1 | After Project 2 |
|------------------|-----------------|
| "What's an API?" | Build systems that understand documents and answer questions |
| "What's a database?" | Design vector + relational hybrid databases |
| "What's caching?" | Optimize AI pipelines with embedding caches |
| "What's AI Engineering?" | Build RAG, evaluate it, deploy it, monitor it |
| "What's semantic search?" | Implement dense + sparse + hybrid retrieval |
| "What's multimodal?" | Process PDFs, images, audio into searchable knowledge |
| "What's observability?" | Trace AI pipelines, measure quality with RAGAS |

---

## Next: Project 3 — The Swarm (MCP Tool System)

The Librarian handles knowledge. The Swarm handles action. You'll build a system that exposes tools to AI models via the Model Context Protocol — enabling any AI to search the web, query databases, and execute code through your infrastructure.
