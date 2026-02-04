import express from 'express'
import { register,login,logoutOneSession,logoutAllSessions } from '../controllers/authController.js';

const router=express.Router();

router.post('/register-user',register)
router.post('/login-user',login)
router.post('/logout-one-device',logoutOneSession)
router.post('/logout-all-devices',logoutAllSessions)

export default router;