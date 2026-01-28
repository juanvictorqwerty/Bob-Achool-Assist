import dotenv from 'dotenv';
import {registerRegular} from '../services/authService.js'
import {registerStaff} from '../services/authService.js'
//import {loginUser} from '../services/authService.js'

dotenv.config();

export const register=async(req,res)=>{
    const {name, email,password,code}=req.body;
    if (!name||!email||!password){
        return res.status(400).json({success:false,message:"All fields are required"})
    }
    const user={name,email,password}
    if (!code){
        try{
            const response=await registerRegular(user)
            if (response.success){
                return res.status(200).json(response)
            }else{
                return res.status(400).json(response)
            }
        }catch(error){
            console.log(error)
            return res.status(500).json({success:false,message:"Something went wrong"})
        }
    }else{
        if (code!=process.env.Secret){
            return res.status(400).json("Wrong code")
        }
        try{
            const response=await registerStaff(user)
            if (response.success){
                return res.status(200).json({success:true,message:"Accepted"})
            }else{
                return res.status(400).json({success:false,message:"Registration impossible"})
            }
        }catch(error){
            console.log(error)
            return res.status(500).json({success:false,message:"Something horrible happened"})
        }
    }
}
