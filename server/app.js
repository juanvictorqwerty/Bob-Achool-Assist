import express from "express";
import cors from 'cors'
import { checkConnection } from "./config/db.js";

const app=express();

app.use(express.json());
app.use(cors());

app.listen(4000, async ()=>{
  console.log("Server is running on port 4000");
  try{
    await checkConnection();
  }catch (error){
    console.log(error)
  }
});
export default app;