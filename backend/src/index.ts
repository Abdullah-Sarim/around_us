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

//console.log("userRoutes:", userRoutes);
//console.log("productRoutes:", productRoutes);

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
  } catch (error) {
    console.error("Error cleaning up sold products:", error);
  }
};

// Run cleanup every hour
setInterval(cleanupSoldProducts, 60 * 60 * 1000);

app.listen(ENV.PORT, () => console.log("Server is up and running on PORT:", ENV.PORT));
