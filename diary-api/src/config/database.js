import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // utf8mb4 wajib agar emoji (mood) tersimpan & terbaca dengan benar.
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});
