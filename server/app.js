import express from "express";
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';
import { checkConnection } from "./config/db.js";
import { createAllTables } from "./config/dbCreation.js";
import authRoutes from './routes/authRoutes.js'
import uploadRoutes from './routes/upload_downloadRoute.js'
import collectionRoutes from './routes/collectionRoutes.js'
import debugRoutes from './routes/debugRoutes.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app=express();

console.log('[SERVER] Express app created');

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*',
}));

// Request logging middleware - log EVERYTHING
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ➤ ${req.method} ${req.path}`);
  console.log(`[${timestamp}] Query:`, req.query);
  console.log(`[${timestamp}] Body:`, req.body);
  next();
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('[API/TEST] Endpoint hit!');
  res.json({ message: 'Test endpoint works' });
});

// Serve uploads folder as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

console.log('[SERVER] Routes being mounted...');
app.use('/api/auth',authRoutes)
console.log('[SERVER] Auth routes mounted');
app.use('/api',uploadRoutes)
console.log('[SERVER] Upload routes mounted');
app.use('/api',collectionRoutes)
console.log('[SERVER] Collection routes mounted');
app.use('/api',debugRoutes)
console.log('[SERVER] Debug routes mounted');

app.listen(4000, async ()=>{
  console.log("Server is running on port 4000");
  try{
    await checkConnection();
    await createAllTables();
  }catch (error){
    console.error(error)
  }
});
export default app;