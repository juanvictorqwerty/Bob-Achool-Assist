import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { uploadFiles, downloadFile, downloadCollectionZip } from "../controllers/upload.js";

console.log('[ROUTES] upload_downloadRoute.js loading');

const router = express.Router();

// Multer memory storage (upload to Cloudinary directly)
const storage = multer.memoryStorage();

// Filter: Only PDF and Photos (JPEG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf", 
    "image/jpeg", 
    "image/png", 
    "image/webp",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    console.log(`[MULTER] File type accepted: ${file.mimetype}`);
    cb(null, true);
  } else {
    console.error(`[MULTER] File type rejected: ${file.mimetype}`);
    cb(new Error("Invalid file type. Only PDF and Images are allowed."), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Custom middleware to upload files to Cloudinary using unsigned upload
const uploadToCloudinary = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  const uploadPromises = req.files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'school-assist-uploads',
          // Unsigned upload with upload preset
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'school_uploads',
        },
        (error, result) => {
          if (error) {
            console.error('[CLOUDINARY] Upload error:', error);
            reject(error);
          } else {
            console.log('[CLOUDINARY] Uploaded:', result.public_id);
            // Attach Cloudinary info to the file object
            file.cloudinary = {
              public_id: result.public_id,
              url: result.secure_url,
              resource_type: result.resource_type,
              format: result.format,
              size: result.bytes,
            };
            resolve(result);
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  });

  try {
    await Promise.all(uploadPromises);
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cloudinary upload failed: ' + error.message
    });
  }
};

// "files" is the key, 6 is the max count
console.log('[ROUTES] Registering POST /upload-multiple');
router.post("/upload-multiple", upload.array("files", 6), uploadToCloudinary, uploadFiles);

console.log('[ROUTES] Registering GET /download/:fileId');
router.get("/download/:fileId", downloadFile);

console.log('[ROUTES] Registering GET /download-collection/:collectionId/zip');
router.get("/download-collection/:collectionId/zip", downloadCollectionZip);

console.log('[ROUTES] upload_downloadRoute.js loaded');

export default router;
