Base QNS -
## 1. Why does Node.js use an event loop instead of spawning a new OS thread for every HTTP request?
### 🎯 What is the Event Loop?
Think of the **event loop** as Node.js’s “traffic controller.”  
- You have **one main thread** running JavaScript.  
- When you tell Node.js to do something slow (like read a file or wait for a network response), it doesn’t sit idle. Instead, it says:  
  *“Okay, I’ll let the OS handle that in the background. Meanwhile, I’ll keep moving on to other tasks.”*  
- When the OS finishes, it raises its hand: *“Hey, I’m done!”* The event loop notices this and runs the callback you gave it.  

So instead of juggling thousands of threads, Node.js just cycles through a **queue of events** and executes them one by one.

---

### 🛠 Simple Analogy
Imagine a restaurant with one waiter:
- **Thread-per-request model (like Apache)**: Hire one waiter per customer. Expensive, chaotic, lots of staff standing around waiting for food.  
- **Event loop model (Node.js)**: One waiter takes everyone’s orders, passes them to the kitchen, and while the food cooks, keeps serving drinks and taking new orders. When the kitchen finishes, the waiter delivers the dish.  

Result: one waiter can serve hundreds of customers efficiently.

---

### ⚡ Why Not Threads?
- Threads eat memory and CPU just to exist.  
- Switching between threads (context switching) is costly.  
- Most web requests are I/O-bound (waiting for DB, network, disk), not CPU-bound. So threads would mostly sit idle.  

Node.js avoids this waste by using the event loop.

---

### 🔄 The Phases of the Event Loop (simplified)
1. **Timers** → Runs callbacks from `setTimeout` and `setInterval`.  
2. **Pending I/O** → Handles completed network/file operations.  
3. **Idle/Prepare** → Internal stuff.  
4. **Poll** → Waits for new events (like incoming HTTP requests).  
5. **Check** → Runs `setImmediate` callbacks.  
6. **Close callbacks** → Cleans up closed sockets, etc.  

And between these phases, Node.js also runs **microtasks** (like `Promise.then`) before moving on.

---

✅ **In short:** The event loop is Node.js’s way of handling thousands of requests without spawning thousands of threads. It’s like a super-efficient waiter who never gets overwhelmed.  

### 🔑 What the Event Loop Actually Is
The **event loop** is the “manager” inside Node.js that decides *when* your code runs.  
- Node.js runs JavaScript on **one main thread**.  
- When you ask it to do something slow (like read a file, query a database, or wait for a timer), Node.js doesn’t freeze.  
- Instead, it hands that job off to the system and says: *“Call me back when you’re done.”*  
- Meanwhile, the event loop keeps checking a **queue of tasks** and runs them one by one.  

So the event loop is basically a **loop that never stops**, constantly checking:  
👉 “Do I have something ready to run? If yes, run it. If not, wait.”  

---

### 🛠 Tiny Example
```js
console.log("Start");

setTimeout(() => {
  console.log("Timer finished");
}, 2000);

console.log("End");
```

**Output:**
```
Start
End
Timer finished
```

Why?  
- `Start` runs immediately.  
- `setTimeout` schedules a callback for 2 seconds later.  
- `End` runs right away because the main thread doesn’t wait.  
- After 2 seconds, the event loop sees the timer is ready and runs the callback.  

---

### 🎯 In Simple Words
Think of the event loop like a **DJ at a party**:  
- People (tasks) give requests.  
- The DJ (event loop) keeps checking the playlist queue.  
- When a song (task) is ready, the DJ plays it.  
- The DJ never stops — always looping through the queue.  

---

✅ So: **The event loop is the mechanism that lets Node.js handle many things at once without using many threads.**  

## 2. What is the difference between a Docker **image** and a Docker **container**? What happens to container filesystem data when the container stops?
### 🐳 Docker Image vs Docker Container

| Concept | What it is | Analogy |
|---------|------------|---------|
| **Docker Image** | A **read-only blueprint**. It contains the application code, libraries, dependencies, and instructions on how to run. | Like a **recipe** for a dish. |
| **Docker Container** | A **running instance** of an image. It has its own writable filesystem layer, processes, and network settings. | Like the **actual dish** cooked from the recipe. |

So:  
- **Image = static template**  
- **Container = live, running environment created from that template**

---

### 📂 What Happens to Container Filesystem Data?

- Each container gets a **temporary writable layer** on top of the image.  
- Any changes you make inside the container (like creating files, editing configs) live in this layer.  
- When the container **stops**, the writable layer still exists. You can restart the container and the data will still be there.  
- But if you **remove/delete the container**, that writable layer is destroyed — all data inside is lost.  

👉 That’s why Docker recommends using **volumes** or **bind mounts** for persistent data (like databases). Volumes live outside the container lifecycle, so they survive even if the container is deleted.

---

### ✅ In short
- **Image** = blueprint (unchanging).  
- **Container** = running instance (can change).  
- **Container filesystem data** = temporary; survives stop/restart, but is lost if the container is removed unless you use volumes.  



## 3. Why is Redis called an "in-memory data structure store" rather than just a "database"? What happens to Redis data if you restart the Redis process without persistence configured?
### 🧠 Why Redis is called an *“in-memory data structure store”*  
- **In-memory** → Redis keeps all its data in **RAM**, not on disk (unless you configure persistence). This makes it blazing fast compared to traditional databases that constantly read/write to disk.  
- **Data structure store** → Unlike a plain key-value database, Redis supports rich data types:  
  - Strings  
  - Lists  
  - Sets  
  - Sorted sets  
  - Hashes  
  - Streams  
  - Bitmaps & HyperLogLogs  

So Redis isn’t just a “database” — it’s more like a **toolbox of data structures** you can access instantly in memory. That’s why the official tagline is “in-memory data structure store.”

---

### 🔄 What happens if Redis restarts without persistence?
- By default, Redis stores everything in **volatile memory (RAM)**.  
- If you **restart the Redis process** and persistence is **not configured** (no RDB snapshots or AOF logs):  
  👉 **All data is lost.**  
- Redis starts fresh with an empty dataset.  

That’s why persistence options exist:  
- **RDB (snapshotting)** → Saves the dataset to disk at intervals.  
- **AOF (Append Only File)** → Logs every write operation so you can replay them.  
- You can even combine both for durability + performance.  

---

### ✅ In short
- Redis is called an *in-memory data structure store* because it’s more than a database — it’s a fast, RAM-based system with advanced data types.  
- Without persistence, restarting Redis wipes all data, since RAM is volatile.  


## 4. You chose Oracle 26ai over PostgreSQL. What is the **architectural cost** of this choice for a Node.js project? (Think: ORM support, community examples, Docker image size, driver complexity.)
### 🏗️ Architectural Costs of Oracle vs PostgreSQL in Node.js

#### 1. **ORM Support**
- **PostgreSQL**: Almost every major Node.js ORM (Sequelize, TypeORM, Prisma, Objection.js) has first-class support. Tons of tutorials, examples, and community fixes exist.  
- **Oracle 26ai**: ORM support is limited. Some ORMs don’t support Oracle at all, or require extra plugins/adapters. You may end up writing more raw SQL or custom query builders.

#### 2. **Community Examples**
- **PostgreSQL**: Huge open-source community. If you Google “Node.js + PostgreSQL,” you’ll find endless blog posts, StackOverflow answers, and GitHub repos.  
- **Oracle 26ai**: Much smaller footprint in the Node.js world. Documentation exists, but community-driven examples are sparse. You’ll rely more on Oracle’s official docs and enterprise forums.

#### 3. **Docker Image Size**
- **PostgreSQL**: Official Docker images are lightweight (~70–100 MB compressed). Easy to spin up for local dev and CI pipelines.  
- **Oracle 26ai**: Oracle images are significantly larger (hundreds of MBs to GBs). They take longer to pull, build, and run. This slows down CI/CD and increases resource usage.

#### 4. **Driver Complexity**
- **PostgreSQL**: The `pg` driver is simple, widely used, and well-maintained. Easy connection strings, straightforward pooling, and good error handling.  
- **Oracle 26ai**: Requires the `oracledb` driver, which is heavier, has native dependencies, and sometimes needs Oracle Instant Client libraries installed. This adds complexity to setup and deployment, especially in Docker.

---

### ⚖️ Summary
- **PostgreSQL** → lightweight, developer-friendly, rich ecosystem, great for rapid Node.js development.  
- **Oracle 26ai** → enterprise-grade, powerful features, but heavier, harder to integrate, fewer community resources, and more complex drivers.  

👉 The architectural cost is mainly **developer velocity**: you’ll spend more time configuring, debugging, and maintaining Oracle in Node.js compared to PostgreSQL, which has a smoother path thanks to its open-source ecosystem.


## 5. Draw the request flow for your API Gateway: `Client → Nginx → Hono → [Middleware Stack] → Provider → Response`. List what happens at each hop.
### 🔄 Request Flow:  
**Client → Nginx → Hono → [Middleware Stack] → Provider → Response**

---

### 1. **Client**
- The user (browser, mobile app, or another service) sends an HTTP request.  
- Example: `GET /api/data`  

---

### 2. **Nginx (Reverse Proxy)**
- Acts as the **entry point**.  
- Responsibilities:  
  - SSL/TLS termination (HTTPS → HTTP inside).  
  - Load balancing across multiple Hono instances.  
  - Basic request filtering (rate limiting, IP whitelisting).  
  - Routing requests to the correct backend service.  

---

### 3. **Hono (Node.js Framework)**
- Receives the request from Nginx.  
- Provides a **router** to match the request path (`/api/data`) and method (`GET`).  
- Passes the request into the middleware pipeline.  

---

### 4. **Middleware Stack**
- A chain of functions that process the request before hitting the provider.  
- Typical middleware layers:  
  - **Authentication** → Validates JWT/API keys.  
  - **Authorization** → Checks user roles/permissions.  
  - **Logging** → Records request metadata.  
  - **Validation** → Ensures request body/query params are correct.  
  - **Caching** → Returns cached responses if available.  

Each middleware can either:  
- Pass the request forward, or  
- Short-circuit with an error/response (e.g., invalid token).  

---

### 5. **Provider**
- The actual **business logic / service layer**.  
- Could be:  
  - A database query (PostgreSQL, Oracle, Redis).  
  - A call to another microservice.  
  - A computation or transformation.  
- Returns the processed data back to Hono.  

---

### 6. **Response**
- Hono sends the response back through Nginx.  
- Nginx forwards it to the client.  
- Example: JSON payload →  
```json
{
  "status": "success",
  "data": [...]
}
```

---

### ✅ In short
- **Client** → makes request.  
- **Nginx** → gateway, routing, SSL, load balancing.  
- **Hono** → router + middleware orchestrator.  
- **Middleware Stack** → auth, logging, validation, caching.  
- **Provider** → actual service logic.  
- **Response** → returned to client.  
