import express from 'express';
import {
  getAllCollectionsHandler,
  getCollectionDetailsHandler,
  updateCollectionNameHandler,
  deleteCollectionHandler,
  getCollectionFilesHandler,
  deleteFileHandler
} from '../controllers/collectionController.js';

console.log('[ROUTES] collectionRoutes.js loading');

const router = express.Router();

// Collection routes
console.log('[ROUTES] Registering GET /collections');
router.get('/collections', getAllCollectionsHandler);

console.log('[ROUTES] Registering GET /collections/:collectionId');
router.get('/collections/:collectionId', getCollectionDetailsHandler);

console.log('[ROUTES] Registering PUT /collections/:collectionId');
router.put('/collections/:collectionId', updateCollectionNameHandler);

console.log('[ROUTES] Registering DELETE /collections/:collectionId');
router.delete('/collections/:collectionId', deleteCollectionHandler);

// Files within collection
console.log('[ROUTES] Registering GET /collections/:collectionId/files');
router.get('/collections/:collectionId/files', getCollectionFilesHandler);

console.log('[ROUTES] Registering DELETE /files/:fileId');
router.delete('/files/:fileId', deleteFileHandler);

console.log('[ROUTES] collectionRoutes.js loaded');

export default router;
