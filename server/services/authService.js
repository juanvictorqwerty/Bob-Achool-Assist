import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import { checkUser } from '../services/checkUser.js';


export const registerUser=async(user)=>{

    try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const query = `INSERT INTO users (email, password) VALUES (?, ?)`;

            const values = [user.email, hashedPassword];
            
            const [insertResult] = await pool.query(query, values);

            // Retrieve the inserted user's id from DB
            const userEmail = user.email;
            const [rows] = await pool.query(`SELECT id FROM users WHERE email = ?`, [userEmail]);
            if (!rows || rows.length === 0) {
                console.error('Failed to retrieve user id after registration for email:', userEmail);
                return { success: false, message: 'Internal error: could not retrieve user id' };
            }

            // userId is always a string (VARCHAR)
            const userId = rows[0].id;
            const sessionToken = jwt.sign({ id: userId }, process.env.JWT_SECRET);

            // Insert token
            const tokenId = uuidv4();

            const insertQuery = `
                INSERT INTO token (id, user_id, token, created_at)
                VALUES (?, ?, ?, NOW())
            `;
            const params = [tokenId, userId, sessionToken];

            await pool.query(insertQuery, params);

            return { success: true, message: 'Welcome user', token: sessionToken }
    }catch(error){
        console.error('Registration error:', error);
        // Handle duplicate email error (MySQL error code ER_DUP_ENTRY)
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: "Email already registered" };
        }
        return { success: false, message: "Something went wrong: " + error.message };
    };
}

export const loginUser = async (email, password) => {
    try {
        // 1. Find user
        const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
        
        if (rows.length !== 1) {
            return { success: false, message: "Invalid credentials" };
        }

        const user = rows[0];

        // 2. Check Password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return { success: false, message: "Invalid credentials" };
        }

        // 3. Generate Token
        const userId = user.id; // Always a string (VARCHAR)
        const sessionToken = jwt.sign({ id: userId }, process.env.JWT_SECRET);

        // 4. Insert token
        const tokenId = uuidv4();

        const insertQuery = `
            INSERT INTO token (id, user_id, token, created_at)
            VALUES (?, ?, ?, NOW())
        `;
        const params = [tokenId, userId, sessionToken];

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