import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';

// Debug endpoint - list all files in database
export const debugListFiles = async (req, res) => {
  console.log('\n[DEBUG] debugListFiles endpoint hit');
  try {
    const [files] = await pool.query('SELECT id, original_name, file_path, file_size FROM file_metadata LIMIT 20');
    
    console.log('\n════════ FILES IN DATABASE ════════');
    const filesWithStatus = files.map(f => {
      const exists = fs.existsSync(f.file_path);
      console.log(`${exists ? '✓' : '✗'} ${f.original_name} - ${f.file_path} (${f.file_size} bytes)`);
      return {
        ...f,
        exists,
        absolutePath: path.resolve(f.file_path)
      };
    });
    console.log('═══════════════════════════════════════\n');
    
    res.json({
      totalFiles: files.length,
      files: filesWithStatus
    });
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Debug endpoint - check if upload folder exists
export const debugCheckUploads = async (req, res) => {
  console.log('\n[DEBUG] debugCheckUploads endpoint hit');
  try {
    const uploadsPath = './uploads';
    const exists = fs.existsSync(uploadsPath);
    const absolutePath = path.resolve(uploadsPath);
    
    console.log(`\n════════ UPLOADS FOLDER ════════`);
    console.log(`Path: ${uploadsPath}`);
    console.log(`Absolute: ${absolutePath}`);
    console.log(`Exists: ${exists}`);
    
    let files = [];
    if (exists) {
      files = fs.readdirSync(uploadsPath).slice(0, 20);
      console.log(`Files in folder (showing first 20):`);
      files.forEach(f => {
        const filePath = path.join(uploadsPath, f);
        const stats = fs.statSync(filePath);
        console.log(`  - ${f} (${stats.size} bytes)`);
      });
    }
    console.log('═══════════════════════════════════\n');
    
    res.json({
      uploadsFolder: {
        path: uploadsPath,
        absolute: absolutePath,
        exists,
        fileCount: files.length,
        files: files
      }
    });
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    res.status(500).json({ message: error.message });
  }
};
