import express from "express";
import cors from "cors";
import path from "path";
import rateLimit from "express-rate-limit";

import { ENV } from "./config/env";
import { clerkMiddleware } from "@clerk/express";

import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import commentRoutes from "./routes/commentRoutes";
import messageRoutes from "./routes/messageRoutes";
import { db } from "./db/index";
import { eq } from "drizzle-orm";
import { products } from "./db/schema";

const app = express();

const corsOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://around-us-f2jk.vercel.app",
  "https://around-us-f2jk-g8yvwdltg-abdullah-sarims-projects.vercel.app",
];

// Add production frontend if FRONTEND_URL is set
if (ENV.FRONTEND_URL) {
  corsOrigins.push(ENV.FRONTEND_URL);
}

// Public API rate limiter (GET requests - less strict)
const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for public endpoints
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET" && req.path === "/health", // Skip health check
});

// Authenticated API rate limiter (POST/PUT/DELETE - stricter)
const authApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute for authenticated endpoints
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply public rate limiter to read endpoints
app.use("/api/products", publicApiLimiter);
app.use("/api/users", publicApiLimiter);
app.use("/api/test", publicApiLimiter);

// Auth routes get stricter limit (must come after public limiter)

app.use(cors({ 
  origin: corsOrigins, 
  credentials: true 
}));

app.use(clerkMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({
    message: "Welcome to AroundUs API - Powered by PostgreSQL, Drizzle ORM & Clerk Auth",
    endpoints: {
      users: "/api/users",
      products: "/api/products",
      comments: "/api/comments",
      messages: "/api/messages",
    },
  });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "test route works" });
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/messages", messageRoutes);

app.get("/test2", (req, res) => {
  res.json({ message: "test2 works" });
});

// Cleanup old sold products (older than 7 days)
const cleanupSoldProducts = async () => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const result = await db.execute(
      `DELETE FROM products WHERE is_sold = 'true' AND sold_at < '${oneWeekAgo.toISOString()}' RETURNING *`
    );
    
    if (result.rowCount && result.rowCount > 0) {
      console.log(`Cleaned up ${result.rowCount} old sold products`);
    }
  } catch (error) {
    console.error("Error cleaning up sold products:", error);
  }
};

// Run cleanup every 6 hours
setInterval(cleanupSoldProducts, 6 * 60 * 60 * 1000);

app.listen(ENV.PORT, () => console.log("Server is up and running on PORT:", ENV.PORT));
