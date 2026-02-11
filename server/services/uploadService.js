import { pool } from '../config/db.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Extract user ID from token
const getUserIdFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify token exists in database
    const [rows] = await pool.query(
      `SELECT user_id FROM token WHERE token = ? AND revoked_at IS NULL`,
      [token]
    );
    
    if (rows.length === 0) {
      throw new Error('Token not found or revoked');
    }
    
    return rows[0].user_id;
  } catch (error) {
    throw { status: 401, message: 'Unauthorized: Invalid token' };
  }
};

// Get or create collection
const getOrCreateCollection = async (userId, collectionName) => {
  try {
    // Check if collection already exists
    const [existing] = await pool.query(
      `SELECT id FROM collections WHERE user_id = ? AND collection_name = ?`,
      [userId, collectionName]
    );
    
    if (existing.length > 0) {
      return existing[0].id;
    }
    
    // Create new collection
    const collectionId = uuidv4();
    await pool.query(
      `INSERT INTO collections (id, user_id, collection_name) VALUES (?, ?, ?)`,
      [collectionId, userId, collectionName]
    );
    
    return collectionId;
  } catch (error) {
    throw { status: 500, message: 'Failed to create/fetch collection: ' + error.message };
  }
};

// Save file metadata to database
const saveFileMetadata = async (collectionId, file) => {
  try {
    const fileId = uuidv4();
    await pool.query(
      `INSERT INTO file_metadata (id, collection_id, file_name, original_name, file_path, file_size, mime_type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        fileId,
        collectionId,
        file.filename,
        file.originalname,
        file.path,
        file.size,
        file.mimetype
      ]
    );
    
    return fileId;
  } catch (error) {
    throw { status: 500, message: 'Failed to save file metadata: ' + error.message };
  }
};

// Main upload processor
export const processUpload = async (token, files, collectionName) => {
  try {
    if (!token) {
      throw { status: 401, message: 'Missing authorization token' };
    }
    
    if (!collectionName || collectionName.trim() === '') {
      throw { status: 400, message: 'Collection name is required' };
    }
    
    if (!files || files.length === 0) {
      throw { status: 400, message: 'No files provided' };
    }
    
    // Get user ID from token
    const userId = await getUserIdFromToken(token);
    
    // Get or create collection
    const collectionId = await getOrCreateCollection(userId, collectionName);
    
    // Save metadata for all files
    const uploadedFiles = [];
    for (const file of files) {
      const fileId = await saveFileMetadata(collectionId, file);
      uploadedFiles.push({
        fileId,
        fileName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      });
    }
    
    return {
      collectionId,
      collectionName,
      filesCount: uploadedFiles.length,
      files: uploadedFiles
    };
  } catch (error) {
    throw error;
  }
};

// Get file for download (public - no authentication required)
export const getFileForDownloadPublic = async (fileId) => {
  try {
    // Get file metadata without user authorization check
    const [files] = await pool.query(
      `SELECT * FROM file_metadata WHERE id = ?`,
      [fileId]
    );
    
    if (files.length === 0) {
      throw { status: 404, message: 'File not found' };
    }
    
    return {
      path: files[0].file_path,
      originalName: files[0].original_name
    };
  } catch (error) {
    throw error;
  }
};

// Get file for download (with authorization)
export const getFileForDownload = async (token, fileId) => {
  try {
    if (!token) {
      throw { status: 401, message: 'Missing authorization token' };
    }
    
    const userId = await getUserIdFromToken(token);
    
    // Get file metadata with authorization check
    const [files] = await pool.query(
      `SELECT * FROM file_metadata 
       JOIN collections c ON fm.collection_id = c.id
       WHERE id = ? AND c.user_id = ?`,
      [fileId, userId]
    );
    
    if (files.length === 0) {
      throw { status: 404, message: 'File not found or access denied' };
    }
    
    return {
      path: files[0].file_path,
      originalName: files[0].original_name
    };
  } catch (error) {
    throw error;
  }
};