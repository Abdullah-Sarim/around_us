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

// Rate limiter configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use("/api", apiLimiter);

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

// Run cleanup every hour
setInterval(cleanupSoldProducts, 60 * 60 * 1000);

app.listen(ENV.PORT, () => console.log("Server is up and running on PORT:", ENV.PORT));
