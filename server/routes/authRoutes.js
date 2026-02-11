import express from 'express'
import { register, registerAdmin, login, logoutOneSession, logoutAllSessions, upgradeUserToAdmin } from '../controllers/authController.js';

const router=express.Router();

router.post('/register-user',register)
router.post('/register-admin',registerAdmin)
router.post('/login-user',login)
router.post('/logout-one-device',logoutOneSession)
router.post('/logout-all-devices',logoutAllSessions)
// Admin-only route: Upgrade a user to admin role
router.post('/upgrade-user-to-admin', upgradeUserToAdmin)

export default router;