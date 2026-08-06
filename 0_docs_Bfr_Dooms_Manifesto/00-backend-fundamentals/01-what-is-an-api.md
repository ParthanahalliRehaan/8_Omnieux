## 🛠️ Basic REST API Example (Node.js + Express)

Here’s a simple REST API for managing users:

```javascript
// Install dependencies first:
// npm install express body-parser

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// In-memory "database"
let users = [
  { id: 1, name: "Rehaan", email: "rehaan@example.com" },
  { id: 2, name: "Aisha", email: "aisha@example.com" }
];

// GET all users
app.get('/users', (req, res) => {
  res.json(users);
});

// GET a single user
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  user ? res.json(user) : res.status(404).send("User not found");
});

// POST create a new user
app.post('/users', (req, res) => {
  const newUser = { id: users.length + 1, ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT update a user
app.put('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id == req.params.id);
  if (index !== -1) {
    users[index] = { id: parseInt(req.params.id), ...req.body };
    res.json(users[index]);
  } else {
    res.status(404).send("User not found");
  }
});

// DELETE a user
app.delete('/users/:id', (req, res) => {
  users = users.filter(u => u.id != req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`REST API running at http://localhost:${PORT}`);
});
```

👉 This covers the **CRUD operations** (Create, Read, Update, Delete) with proper HTTP methods.

---

## 🔑 Types of APIs (Expanded)

1. **REST API**  
   - Resource-based, uses HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).  
   - Example: `/users/123`.

2. **GraphQL API**  
   - Query language for APIs.  
   - Client specifies exactly what data it needs.  
   - Example query:
     ```graphql
     {
       user(id: 1) {
         name
         email
       }
     }
     ```

3. **SOAP API**  
   - XML-based protocol.  
   - Strict standards, often used in enterprise systems (banking, telecom).  
   - Example: `<soap:Envelope>...</soap:Envelope>`.

4. **gRPC API**  
   - Uses Protocol Buffers (binary format).  
   - Very fast, great for microservices.  
   - Example: Define service in `.proto` file, generate client/server code.

5. **WebSocket APIs**  
   - Real-time communication (chat apps, live notifications).  
   - Persistent connection instead of request/response.

---

## 🎯 REST API Design Best Practices
- Use **nouns** for resources (`/users`, `/orders`).
- Use **plural** resource names (`/users` not `/user`).
- Return **proper status codes** (`200 OK`, `201 Created`, `404 Not Found`).
- Support **filtering, sorting, pagination** (`/users?limit=10&sort=name`).
- Version your API (`/api/v1/users`).

---

## 🚀 Putting It All Together
- **REST** → Simple, widely used, resource-based.  
- **GraphQL** → Flexible queries, avoids over-fetching.  
- **SOAP** → Enterprise, strict XML standards.  
- **gRPC** → High-performance, microservices.  
- **WebSockets** → Real-time communication.  

