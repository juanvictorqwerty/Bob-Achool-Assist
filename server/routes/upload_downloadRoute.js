import express from "express";
import multer from "multer";
import path from "path";
import { uploadFiles, downloadFile, downloadCollectionZip } from "../controllers/upload.js";

console.log('[ROUTES] upload_downloadRoute.js loading');

const router = express.Router();

// Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`[MULTER] Storing file to: uploads/`);
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    console.log(`[MULTER] Generated filename: ${filename}`);
    cb(null, filename);
  }
});

// Filter: Only PDF and Photos (JPEG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.openxmlformats-officedocument.presentationml.presentation"];
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

// "files" is the key, 6 is the max count
console.log('[ROUTES] Registering POST /upload-multiple');
router.post("/upload-multiple", upload.array("files", 6), uploadFiles);

console.log('[ROUTES] Registering GET /download/:fileId');
router.get("/download/:fileId", downloadFile);

console.log('[ROUTES] Registering GET /download-collection/:collectionId/zip');
router.get("/download-collection/:collectionId/zip", downloadCollectionZip);

console.log('[ROUTES] upload_downloadRoute.js loaded');

export default router;