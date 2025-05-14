import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"

// Create the connection
const connection = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "3306"),
  user: process.env.DATABASE_USER || "root",
  // Gunakan string kosong untuk password jika tidak menggunakan password
  password: process.env.DATABASE_PASSWORD || undefined,
  database: process.env.DATABASE_NAME || "dia",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Create Drizzle instance
export const db = drizzle(connection, { schema, mode: "default" })

// Export schema for use in other files
export * from "./schema"
