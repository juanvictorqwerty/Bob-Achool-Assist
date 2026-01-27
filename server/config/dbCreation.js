import {pool} from './db.js'

const userTableCreation= `CREATE TABLE IF NOT EXISTS users(
                            id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
                            name VARCHAR(50) NOT NULL,
                            email VARCHAR(100) NOT NULL UNIQUE,
                            password VARCHAR(255) NOT NULL,
                            role VARCHAR(50),
                            suspended boolean NOT NULL DEFAULT(false),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                        )`

const tokenTableCreation= `CREATE TABLE IF NOT EXISTS token(
                                id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
                                user_id BINARY(16) NOT NULL,
                                token VARCHAR(255) NOT NULL,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                revoked_at TIMESTAMP DEFAULT NULL,
                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

const createAllTables=async()=>{
    try{
        await createTable('users',userTableCreation);
        await createTable('token',tokenTableCreation);
    }catch(error){
        console.log(error)
    };
}
export {createAllTables};