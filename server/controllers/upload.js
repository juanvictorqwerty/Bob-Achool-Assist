import { processUpload, getFileForDownloadPublic, getCollectionFiles, getCollectionById } from '../services/uploadService.js';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

// Upload multiple files
export const uploadFiles = async (req, res) => {
  try {
    console.log('[UPLOAD] Request received');
    console.log('[UPLOAD] Files:', req.files ? req.files.length : 0);
    console.log('[UPLOAD] Collection Name:', req.body.collection_name);

    const token = req.headers.authorization?.replace('Bearer ', '');
    const collectionName = req.body.collection_name;
    const files = req.files;

    const result = await processUpload(token, files, collectionName);
    
    console.log('[UPLOAD] Success:', result);
    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('[UPLOAD] Error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('[UPLOAD] Failed to delete file:', unlinkError);
        }
      });
    }
    
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Upload failed'
    });
  }
};

// Download file (public endpoint - no auth required)
export const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    console.log('[DOWNLOAD] Request for file ID:', fileId);
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
    }

    // Get file metadata
    const fileData = await getFileForDownloadPublic(fileId);
    
    console.log('[DOWNLOAD] File path:', fileData.path);
    console.log('[DOWNLOAD] Original name:', fileData.originalName);

    // Check if file exists
    if (!fs.existsSync(fileData.path)) {
      console.error('[DOWNLOAD] File not found on disk:', fileData.path);
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Get file stats
    const stats = fs.statSync(fileData.path);
    console.log('[DOWNLOAD] File size:', stats.size, 'bytes');

    // Determine content type based on file extension
    const ext = path.extname(fileData.originalName).toLowerCase();
    const contentTypeMap = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Set headers for download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileData.originalName)}"`);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache');
    
    // CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    console.log('[DOWNLOAD] Sending file...');

    // Stream the file
    const fileStream = fs.createReadStream(fileData.path);
    
    fileStream.on('error', (error) => {
      console.error('[DOWNLOAD] Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming file'
        });
      }
    });

    fileStream.on('end', () => {
      console.log('[DOWNLOAD] File sent successfully');
    });

    fileStream.pipe(res);
    
  } catch (error) {
    console.error('[DOWNLOAD] Error:', error);
    
    if (!res.headersSent) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Download failed'
      });
    }
  }
};

// Download entire collection as ZIP
export const downloadCollectionZip = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const token = req.query.token;
    
    console.log('[ZIP] Request for collection ID:', collectionId);
    
    if (!collectionId) {
      return res.status(400).json({
        success: false,
        message: 'Collection ID is required'
      });
    }

    // Get collection with files (public endpoint - no auth required)
    const files = await getCollectionFiles(null, collectionId);
    
    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No files found in collection'
      });
    }

    // Get collection details including the name
    const collection = await getCollectionById(collectionId);
    
    // Sanitize collection name for filename (remove invalid characters)
    const sanitizedCollectionName = collection.collection_name.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    console.log(`[ZIP] Found ${files.length} files to zip`);

    // Set headers for ZIP download using collection original name
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(sanitizedCollectionName)}.zip"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Best compression
    });

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('[ZIP] Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error creating ZIP archive'
        });
      }
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add each file to the archive
    for (const file of files) {
      const filePath = file.file_path;
      
      if (!fs.existsSync(filePath)) {
        console.error(`[ZIP] File not found: ${filePath}`);
        continue;
      }

      // Use original filename in the archive
      archive.file(filePath, { name: file.original_name });
      console.log(`[ZIP] Added: ${file.original_name}`);
    }

    // Finalize the archive
    await archive.finalize();
    
    console.log('[ZIP] Archive completed');
    
  } catch (error) {
    console.error('[ZIP] Error:', error);
    
    if (!res.headersSent) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'ZIP download failed'
      });
    }
  }
};