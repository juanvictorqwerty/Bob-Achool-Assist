import { pool } from '../config/db.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';

// Extract user ID from token
const getUserIdFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
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

// Get all collections for a user
export const getAllCollections = async (token) => {
  try {
    // Fetch all collections without user distinction
    const [collections] = await pool.query(
      `SELECT 
        c.id,
        c.user_id,
        c.collection_name,
        c.created_at,
        c.updated_at,
        COUNT(fm.id) as file_count
       FROM collections c
       LEFT JOIN file_metadata fm ON c.id = fm.collection_id
       GROUP BY c.id, c.user_id, c.collection_name, c.created_at, c.updated_at
       ORDER BY c.updated_at DESC`
    );

    return collections;
  } catch (error) {
    throw error;
  }
};

// Get collection details with files
export const getCollectionDetails = async (token, collectionId) => {
  try {
    // Get collection without user restriction
    const [collections] = await pool.query(
      `SELECT * FROM collections WHERE id = ?`,
      [collectionId]
    );

    if (collections.length === 0) {
      throw { status: 404, message: 'Collection not found' };
    }

    const collection = collections[0];

    // Get all files in collection
    const [files] = await pool.query(
      `SELECT * FROM file_metadata WHERE collection_id = ? ORDER BY uploaded_at DESC`,
      [collectionId]
    );

    return {
      ...collection,
      file_count: files.length,
      files: files
    };
  } catch (error) {
    throw error;
  }
};

// Update collection name
export const updateCollectionName = async (token, collectionId, newName) => {
  try {
    if (!newName || newName.trim() === '') {
      throw { status: 400, message: 'Collection name cannot be empty' };
    }

    // Check collection exists
    const [collections] = await pool.query(
      `SELECT * FROM collections WHERE id = ?`,
      [collectionId]
    );

    if (collections.length === 0) {
      throw { status: 404, message: 'Collection not found' };
    }

    // Update collection name
    await pool.query(
      `UPDATE collections SET collection_name = ?, updated_at = NOW() WHERE id = ?`,
      [newName, collectionId]
    );

    return { id: collectionId, collection_name: newName, message: 'Collection updated successfully' };
  } catch (error) {
    throw error;
  }
};

// Delete collection
export const deleteCollection = async (token, collectionId) => {
  try {
    // Check collection exists
    const [collections] = await pool.query(
      `SELECT * FROM collections WHERE id = ?`,
      [collectionId]
    );

    if (collections.length === 0) {
      throw { status: 404, message: 'Collection not found' };
    }

    // Get all files in collection to delete from Cloudinary
    const [files] = await pool.query(
      `SELECT * FROM file_metadata WHERE collection_id = ?`,
      [collectionId]
    );

    // Delete files from Cloudinary (if they are Cloudinary URLs)
    for (const file of files) {
      if (file.file_path && file.file_path.startsWith('https://')) {
        try {
          // Extract public_id from the Cloudinary URL
          const urlParts = file.file_path.split('/');
          const uploadIndex = urlParts.indexOf('upload');
          if (uploadIndex !== -1) {
            // Get everything after 'upload/vXXXX/' as the public_id
            const versionIndex = urlParts.indexOf('v', uploadIndex);
            if (versionIndex !== -1) {
              const publicIdWithExtension = urlParts.slice(versionIndex + 1).join('/');
              // Remove file extension from public_id
              const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
              await cloudinary.uploader.destroy(publicId);
              console.log(`[CLOUDINARY] Deleted: ${publicId}`);
            }
          }
        } catch (cloudinaryError) {
          console.error('[CLOUDINARY] Failed to delete file:', cloudinaryError);
        }
      }
    }

    // Delete collection (files will be deleted via CASCADE)
    await pool.query(
      `DELETE FROM collections WHERE id = ?`,
      [collectionId]
    );

    return { message: 'Collection deleted successfully' };
  } catch (error) {
    throw error;
  }
};

// Get files in a collection
export const getCollectionFiles = async (token, collectionId) => {
  try {
    // Check collection exists
    const [collections] = await pool.query(
      `SELECT * FROM collections WHERE id = ?`,
      [collectionId]
    );

    if (collections.length === 0) {
      throw { status: 404, message: 'Collection not found' };
    }

    // Get all files
    const [files] = await pool.query(
      `SELECT * FROM file_metadata WHERE collection_id = ? ORDER BY uploaded_at DESC`,
      [collectionId]
    );

    return files;
  } catch (error) {
    throw error;
  }
};

// Delete file from collection
export const deleteFileFromCollection = async (token, fileId) => {
  try {
    // Check file exists
    const [files] = await pool.query(
      `SELECT fm.* FROM file_metadata fm
       WHERE fm.id = ?`,
      [fileId]
    );

    if (files.length === 0) {
      throw { status: 404, message: 'File not found' };
    }

    const file = files[0];

    // Delete file from Cloudinary if it's a Cloudinary URL
    if (file.file_path && file.file_path.startsWith('https://')) {
      try {
        const urlParts = file.file_path.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex !== -1) {
          const versionIndex = urlParts.indexOf('v', uploadIndex);
          if (versionIndex !== -1) {
            const publicIdWithExtension = urlParts.slice(versionIndex + 1).join('/');
            const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
            await cloudinary.uploader.destroy(publicId);
            console.log(`[CLOUDINARY] Deleted: ${publicId}`);
          }
        }
      } catch (cloudinaryError) {
        console.error('[CLOUDINARY] Failed to delete file:', cloudinaryError);
      }
    }

    // Delete file from database
    await pool.query(
      `DELETE FROM file_metadata WHERE id = ?`,
      [fileId]
    );

    return { message: 'File deleted successfully' };
  } catch (error) {
    throw error;
  }
};
