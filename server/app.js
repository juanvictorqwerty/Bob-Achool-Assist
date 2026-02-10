import express from "express";
import cors from 'cors'
import { checkConnection } from "./config/db.js";
import { createAllTables } from "./config/dbCreation.js";
import authRoutes from './routes/authRoutes.js'
import uploadRoutes from './routes/upload_downloadRoute.js'

const app=express();

app.use(express.json());
app.use(cors());

app.use('/api/auth',authRoutes)
app.use('/api',uploadRoutes)

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