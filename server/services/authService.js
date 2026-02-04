import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // Standard for binary(16) UUIDs
import 'dotenv/config'; // or require('dotenv').config()
import { checkUser } from '../services/checkUser.js';


export const registerUser=async(user)=>{

    try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const query=`INSERT INTO staff (
            name,
            email,
            password,
            role)
            VALUES(?,?,?,?)`

            const values=[user.name,user.email,hashedPassword, user.role]
            
            const [insertResult] = await pool.query(query, values);

            // Retrieve the inserted user's id from DB (staff.id is BINARY(16))
            const userEmail = user.email;
            const [rows] = await pool.query(`SELECT id FROM staff WHERE email = ?`, [userEmail]);
            if (!rows || rows.length === 0) {
                console.error('Failed to retrieve user id after registration for email:', userEmail);
                return { success: false, message: 'Internal error: could not retrieve user id' };
            }

            const userId = rows[0].id; // Buffer (BINARY(16)) or string

            // For JWT payload use a hex representation if it's a Buffer, otherwise use the string directly
            const userIdForJwt = Buffer.isBuffer(userId) ? userId.toString('hex') : userId;
            const sessionToken = jwt.sign({ id: userIdForJwt }, process.env.JWT_SECRET);

            // 4. Insert into DB
            const tokenId = uuidv4();

            // Use a conditional INSERT so we support both BINARY(16) and VARCHAR user_id column types
            let insertQuery, params;
            if (Buffer.isBuffer(userId)) {
                insertQuery = `
                    INSERT INTO token (id, user_id, token, created_at) 
                    VALUES (UUID_TO_BIN(?), ?, ?, NOW())
                `;
                params = [tokenId, userId, sessionToken];
            } else {
                insertQuery = `
                    INSERT INTO token (id, user_id, token, created_at) 
                    VALUES (?, ?, ?, NOW())
                `;
                params = [tokenId, userId, sessionToken];
            }

            await pool.query(insertQuery, params);

            return { success: true, message: 'Welcome user', token: sessionToken }
    }catch(error){
        console.log(error)
        return{success:false,message:"Something went wrong"}
    };
    ;
}

export const loginUser = async (email, password) => {
    try {
        // 1. Find user
        const [rows] = await pool.query(`SELECT * FROM staff WHERE email = ?`, [email]);
        
        if (rows.length !== 1) {
            return { success: false, message: "Invalid credentials" };
        }

        const user = rows[0];

        // 2. Check Password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { success: false, message: "Invalid credentials" };
        }

        // 3. Generate Token (Session or JWT)
        const userId = user.id; // Buffer or string
        const userIdForJwt = Buffer.isBuffer(userId) ? userId.toString('hex') : userId;
        const sessionToken = jwt.sign({ id: userIdForJwt }, process.env.JWT_SECRET);

        // 4. Insert into DB
        const tokenId = uuidv4();

        // Support both BINARY(16) and VARCHAR user_id column types
        let insertQuery, params;
        if (Buffer.isBuffer(userId)) {
            insertQuery = `
                INSERT INTO token (id, user_id, token, created_at) 
                VALUES (UUID_TO_BIN(?), ?, ?, NOW())
            `;
            params = [tokenId, userId, sessionToken];
        } else {
            insertQuery = `
                INSERT INTO token (id, user_id, token, created_at) 
                VALUES (?, ?, ?, NOW())
            `;
            params = [tokenId, userId, sessionToken];
        }

        await pool.query(insertQuery, params);

        return { 
            success: true, 
            message: "Welcome back", 
            token: sessionToken 
        };

    } catch (error) {
        console.error(error);
        return { success: false, message: "Something horrible happened" };
    }
};

export const logoutOneDevice=async(token)=>{
    const isAllowed=await checkUser(token)
    if (!isAllowed.success){
        return{success:false,message:"You are not authorized to perform the action"};
    }
    try{
        const query=`UPDATE token SET revoked_at=NOW() WHERE token=?`
        const values=[token]
        const [result]=await pool.query(query,values)
        if (result.affectedRows===0){
            return {success:false,message:"Token not found"}
        }
        return{success:true,message:"Token revoked"}
    }catch(error){
        console.error(error)
        return{success:false,message:"Something went wrong"}
    }
}

export const logoutAllDevices = async (token) => {
    const isAllowed = await checkUser(token);
    if (!isAllowed.success) {
        return { success: false, message: "You are not authorized to perform the action" };
    }
    try {
        // Step 1: Get user_id from the provided token
        const [rows] = await pool.query(
            `SELECT user_id FROM token WHERE token = ?`, 
            [token]
        );
        
        if (rows.length === 0) {
            return { success: false, message: "Token not found" };
        }
        
        const userId = rows[0].user_id;
        
        // Step 2: Revoke all active tokens for this user
        const [result] = await pool.query(
            `UPDATE token SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`, 
            [userId]
        );
        
        return { 
            success: true, 
            message: `All tokens revoked (${result.affectedRows} sessions)` 
        };
        
    } catch (error) {
        console.error(error);
        return { success: false, message: "Something went wrong" };
    }
}

export const forgotPassword=async(user)=>{
    console.log(user);
}