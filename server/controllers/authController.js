import dotenv from 'dotenv';
import { registerUser,loginUser,logoutOneDevice,logoutAllDevices } from '../services/authService.js';

dotenv.config();

export const register=async(req,res)=>{
    const {email ,password}=req.body;
    if ( !email || !password ){
        return res.status(400).json({success:false,message:"All fields are required"})
    }
    const user = { email, password};

    try {
        const response=await registerUser(user)
        if (response.success){
            return res.status(200).json(response)
        }else{
            return res.status(400).json(response)
        }
    }catch (error){
        console.error(error)
        return res.status(500).json({success:false,message:error.message || "Something went wrong", error:error.message})
    }
}

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
        console.error(error)
        return res.status(500).json({success:false,message:error.message || "Something went wrong", error:error.message})
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
        return res.status(500).json({success:false,message:error.message || "Something went wrong", error:error.message})
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
        return res.status(500).json({success:false,message:error.message || "Something went wrong", error:error.message})
    }
}