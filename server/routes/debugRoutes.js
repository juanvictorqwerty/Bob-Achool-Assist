import express from 'express';
import { debugListFiles, debugCheckUploads, debugDbStructure } from '../controllers/debugController.js';

console.log('[ROUTES] debugRoutes.js loading');

const router = express.Router();

console.log('[ROUTES] Registering GET /debug/files');
router.get('/debug/files', debugListFiles);

console.log('[ROUTES] Registering GET /debug/uploads');
router.get('/debug/uploads', debugCheckUploads);

console.log('[ROUTES] Registering GET /debug/db-structure');
router.get('/debug/db-structure', debugDbStructure);

console.log('[ROUTES] debugRoutes.js loaded');

export default router;
