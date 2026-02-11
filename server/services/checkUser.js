import { pool } from "../config/db.js";
import jwt from 'jsonwebtoken';

// Verify token and return user info including role
export const checkUser=async(token)=>{
    try{
        // First verify the token is valid in the database
        const [rows]=await pool.query(`SELECT * FROM token WHERE token=? and revoked_at IS NULL`,[token]);
        if (rows.length === 0){
            return{success:false,message:"You are not authorized to perform the action"};
        }
        
        // Decode the JWT to get the role
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        return{
            success:true,
            message:"You are authorized",
            role: decoded.role || "Student",
            userId: decoded.id
        };
    }catch(error){
        console.error(error);
        return{success:false,message:"An internal error happened"}
    }
}