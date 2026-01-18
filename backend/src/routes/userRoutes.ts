import { Router } from "express";
import { syncUser, updateUserCity, getCurrentUser } from "../controllers/userController";
import { requireAuth } from "@clerk/express";

const router = Router();

// GET /api/users/me - get current user (protected)
router.get("/me", requireAuth(), getCurrentUser);

// POST /api/users/sync - sync Clerk user
router.post("/sync", requireAuth(), syncUser);

// PATCH /api/users/city - update user city
router.patch("/city", requireAuth(), updateUserCity);

export default router;
