import dotenv from 'dotenv';
import { registerUser, loginUser, logoutOneDevice, logoutAllDevices, updateUserRole } from '../services/authService.js';
import { checkUser } from '../services/checkUser.js';

dotenv.config();

export const register=async(req,res)=>{
    const {email ,password, role}=req.body;
    if ( !email || !password ){
        return res.status(400).json({success:false,message:"All fields are required"})
    }
    // Default role is "Student" as per database schema
    const user = { email, password, role: role || "Student"};

    try {
        const response=await registerUser(user)
        if (response.success){
            return res.status(200).json(response)
        }else{
            return res.status(400).json(response)
        }
    }catch (error){
        console.log(error)
        return res.status(500).json({success:false,message:"Something went wrong"})
    }
}

// Admin registration with secret key for authorization
export const registerAdmin=async(req,res)=>{
    const {email, password, adminSecret}=req.body;
    
    // Validate required fields
    if (!email || !password || !adminSecret) {
        return res.status(400).json({success:false,message:"Email, password, and admin secret are required"});
    }
    
    // Verify admin secret (use environment variable for security)
    const expectedSecret = process.env.ADMIN_REGISTRATION_SECRET;
    if (!expectedSecret || adminSecret !== expectedSecret) {
        return res.status(403).json({success:false,message:"Invalid admin registration secret"});
    }
    
    // Register as Admin
    const user = { email, password, role: "Admin" };
    
    try {
        const response = await registerUser(user);
        if (response.success) {
            return res.status(200).json(response);
        } else {
            return res.status(400).json(response);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false,message:"Something went wrong"});
    }
}

// Admin-only: Upgrade a user to admin role
export const upgradeUserToAdmin = async (req, res) => {
    const { targetUserEmail, adminToken } = req.body;
    
    if (!targetUserEmail || !adminToken) {
        return res.status(400).json({success:false, message: "Email and admin token are required"});
    }
    
    // Verify the requester is an admin
    const isAdmin = await checkUser(adminToken);
    if (!isAdmin.success || isAdmin.role !== "Admin") {
        return res.status(403).json({success:false, message: "Only admins can upgrade users to admin role"});
    }
    
    try {
        const response = await updateUserRole(targetUserEmail, "Admin");
        if (response.success) {
            return res.status(200).json(response);
        } else {
            return res.status(400).json(response);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false, message: "Something went wrong"});
    }
};

export const login=async(req,res)=>{
    const {email, password}=req.body;
    if (!email || !password){
        return res.status(400).json({success:false,message:"password and email are required"})
    }
        const user={email,password};
    try {
        const response=await loginUser(email,password)
        console.log(user)
        if (response.success){
            return res.status(200).json(response)
        }else{
            return res.status(400).json(response)
        }
    } catch (error){
        console.log(error)
        return res.status(500).json({success:false,message:"Something went wrong"})
    }
}

export const logoutOneSession=async(req,res)=>{
    const {token}=req.body;
    if (!token){
        return res.status(400).json({success:false,message:"Token is required"})
    }
    try{
        const response=await logoutOneDevice(token)
        if (response.success){
            return res.status(200).json(response)
        }else{
            return res.status(400).json(response)
        }
    }catch(error){
        console.error(error)
        return res.status(500).json({success:false,message:"Something went wrong"})
    }
}

export const logoutAllSessions=async(req,res)=>{
    const {token}=req.body;
    if (!token){
        return res.status(400).json({success:false,message:"Token is required"})
    }
    try{
        const response=await logoutAllDevices(token)
        if (response.success){
            return res.status(200).json(response)
        }else{
            return res.status(400).json(response)
        }
    }catch(error){
        console.error(error)
        return res.status(500).json({success:false,message:"Something went wrong"})
    }
}