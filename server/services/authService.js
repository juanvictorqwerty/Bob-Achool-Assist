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