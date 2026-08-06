import { Hono } from 'hono';
import { serve } from '@hono/node-server';
const app = new Hono();
app.get('/',(c) => c.text('Hello from Omnieux!'));
app.get('/health',(c)=>c.text('Health checkPoint of Omnieux'));
serve(app);
console.log(`Server running at http://localhost:${3000}`);