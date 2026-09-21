import dotenv from "dotenv";

dotenv.config();

const DEFAULT_DB_URI =
  "mongodb+srv://raa705086_db_user:MFLJQhnHAH79oXT9@cluster0.mbredbz.mongodb.net/seamless_serve?retryWrites=true&w=majority&appName=Cluster0";

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  DATABASE_URL: process.env.DATABASE_URL || process.env.MONGODB_URI || DEFAULT_DB_URI,
  MONGODB_URI: process.env.MONGODB_URI || process.env.DATABASE_URL || DEFAULT_DB_URI,
  JWT_SECRET: process.env.JWT_SECRET || "seamless-serve-secure-jwt-secret-key-2026",
  CRON_SECRET: process.env.CRON_SECRET || "",
};
