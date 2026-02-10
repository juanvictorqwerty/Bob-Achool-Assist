import {pool} from './db.js';
import fs from 'fs';
import path from 'path';

const userTableCreation= `CREATE TABLE IF NOT EXISTS users(
                            id VARCHAR (255) PRIMARY KEY DEFAULT (UUID()),
                            email VARCHAR(100) NOT NULL UNIQUE,
                            password VARCHAR(255) NOT NULL,
                            role VARCHAR(50) DEFAULT "Student",
                            suspended boolean NOT NULL DEFAULT(false),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                        )`

const tokenTableCreation= `CREATE TABLE IF NOT EXISTS token(
                                id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
                                user_id VARCHAR(255) NOT NULL,
                                token VARCHAR(255) NOT NULL,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                revoked_at TIMESTAMP DEFAULT NULL,
                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                                )`

const collectionsTableCreation = `CREATE TABLE IF NOT EXISTS collections(
                                id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
                                user_id VARCHAR(255) NOT NULL,
                                collection_name VARCHAR(255) NOT NULL,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                UNIQUE KEY unique_user_collection (user_id, collection_name)
                                )`

const fileMetadataTableCreation = `CREATE TABLE IF NOT EXISTS file_metadata(
                                id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
                                collection_id VARCHAR(255) NOT NULL,
                                file_name VARCHAR(255) NOT NULL,
                                original_name VARCHAR(255) NOT NULL,
                                file_path VARCHAR(500) NOT NULL,
                                file_size INT NOT NULL,
                                mime_type VARCHAR(100),
                                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
                                )`

const createTable = async(tableName,query)=>{
    try{
        await pool.query(
            query
        );
        console.log(`${tableName} table created successfully`)
    }catch(error){
        console.log(error)
    }
}
const createUploadsFolder = () => {
    const uploadsPath = path.join(process.cwd(), 'uploads');
    
    try {
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
            console.log('uploads/ folder created successfully');
        } else {
            console.log('uploads/ folder already exists');
        }
    } catch (error) {
        console.error('Error creating uploads folder:', error);
    }
};
const createAllTables=async()=>{
    try{
        createUploadsFolder();

        await createTable('users',userTableCreation);
        await createTable('token',tokenTableCreation);
        await createTable('collections',collectionsTableCreation);
        await createTable('file_metadata',fileMetadataTableCreation);
    }catch(error){
        console.log(error)
    };
}
export {createAllTables};