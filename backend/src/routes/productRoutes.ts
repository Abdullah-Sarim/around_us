import { Router } from "express";
import * as productController from "../controllers/productController";
import { requireAuth } from "@clerk/express";

const router = Router();

// GET /api/products => Get all products (public)
router.get("/", productController.getAllProducts);

// GET /api/products/by-city?city=delhi (public)
router.get("/by-city", productController.getProductsByCity);

// GET /api/products/search?q=keyword (public)
router.get("/search", productController.searchProducts);

// GET /api/products/my - Get current user's products (protected)
router.get("/my", requireAuth(), productController.getMyProducts);

// GET /api/products/:id - Get single product by ID (public)
router.get("/:id", productController.getProductById);

// POST /api/products - Create new product (protected)
router.post("/", requireAuth(), productController.createProduct);

// POST /api/products/sold/:id - Mark product as sold (protected)
router.post("/sold/:id", requireAuth(), productController.markAsSold);

// PUT /api/products/:id - Update product (protected - owner only)
router.put("/:id", requireAuth(), productController.updateProduct);

// DELETE /api/products/:id - Delete product (protected - owner only)
router.delete("/:id", requireAuth(), productController.deleteProduct);

export default router;
