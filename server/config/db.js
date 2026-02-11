import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); //adds the env

const pool=mysql2.createPool({
    host : process.env.DB_Host,
    user : process.env.DB_User,
    password: process.env.DB_Password,
    database: process.env.DB_Name,
    port: process.env.DB_Port,
    connectTimeout:10000,
    acquireTimeout:10000,
    connectionLimit:100,
    queueLimit:0,
    waitForConnections:true
})

const checkConnection= async()=>{
    try{
        const connection=await pool.getConnection();
        console.log("Database connected")
        connection.release();
    }catch(error){
        console.log("Connection failed")
        throw error
    }
}
export {pool,checkConnection}