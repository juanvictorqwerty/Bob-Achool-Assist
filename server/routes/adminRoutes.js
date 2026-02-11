import express from "express";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify admin access
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    const [users] = await pool.query(
      "SELECT role FROM users WHERE id = ?",
      [decoded.id]
    );
    
    if (users.length === 0 || users[0].role !== "Admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }
    
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error("[ADMIN] Auth error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Get all users
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u.suspended,
        u.created_at,
        COUNT(c.id) as collections_count
      FROM users u
      LEFT JOIN collections c ON c.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    
    res.json({ success: true, users });
  } catch (error) {
    console.error("[ADMIN] Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

// Get all collections
router.get("/collections", verifyAdmin, async (req, res) => {
  try {
    const [collections] = await pool.query(`
      SELECT 
        c.id,
        c.collection_name,
        c.user_id,
        c.created_at,
        c.updated_at,
        u.email as user_email,
        COUNT(fm.id) as file_count
      FROM collections c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN file_metadata fm ON fm.collection_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    
    res.json({ success: true, collections });
  } catch (error) {
    console.error("[ADMIN] Error fetching collections:", error);
    res.status(500).json({ success: false, message: "Failed to fetch collections" });
  }
});

// Delete user
router.delete("/users/:userId", verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if trying to delete yourself
    if (userId === req.userId) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account" });
    }
    
    await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("[ADMIN] Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

export default router;
