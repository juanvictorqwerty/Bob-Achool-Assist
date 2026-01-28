import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // Standard for binary(16) UUIDs
import 'dotenv/config'; // or require('dotenv').config()

export const registerRegular=async(user)=>{
    try{
        const hashedPassword= await bcrypt.hash(user.password,10);
        const query= `INSERT INTO users(
            name,
            email,
            password,
            role)
            values(?,?,?,?)`

            const values=[user.name,user.email,hashedPassword,"student"]
            await pool.query(query,values)
            return{success:true,message:"Now login"}

    } catch (error){
        console.error("Erreur dans registerRegular:", error.message);
        return{success:false,message:"Something crashed"}
    }
}

export const registerStaff=async(user)=>{
    try{
        const hashedPassword= await bcrypt.hash(user.password,10);
        const query= `INSERT INTO users(
            name,
            email,
            password,
            role)
            values(?,?,?,?)`

            const values=[user.name,user.email,hashedPassword,"admin"]
            await pool.query(query,values)
            return{success:true,message:"Now login"}

    } catch (error){
        console.log(error)
        return{success:false,message:"Something crashed"}
    }
}

export const loginUser=async(email,password)=>{    
    try {
    const [rows]=await pool.query(`SELECT * FROM users WHERE email=?`,[email]);
    if (rows.length !==1){
        return{success: false,message:"Invalid credentials"};
    }
    const user=rows[0];
    //check password
    const passwordMatch= await bcrypt.compare(password,user.password);
    if (!passwordMatch){
        return {success:false,message:"Wrong credentials"};
    }
    const sessionToken= jwt.sign({id:user.id},
    process.env.JWT_SECRET,
    )
    const tokenId = uuidv4();
    const insertQuery = `
                            INSERT INTO token (id, user_id, token, created_at) 
                            VALUES (UUID_TO_BIN(?), ?, ?, NOW())
                        `;

    // tokenId is a string -> needs UUID_TO_BIN
    // user.id is a Buffer -> pass directly
    await pool.query(insertQuery, [tokenId, user.id, sessionToken])

    return { 
            success: true, 
            message: "Welcome back", 
            token: sessionToken 
        };
    }catch(error){
        console.error(error);
        return{success:false,message:"Something horrible happened"}
    }
}