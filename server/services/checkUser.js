import { pool } from "../config/db.js";

export const checkUser=async(token)=>{
    try{
        const [rows]=await pool.query(`SELECT * FROM token WHERE token=? and revoked_at IS NULL`,[token]);
            if (rows.length === 0){
                return{success:false,message:"You are not authorized to perform the action"};
            }else{
                return{success:true,message:"You are authorized"};
            };
        }catch(error){
        console.error(error);
        return{success:false,message:"An internal error happened"}
    }
}