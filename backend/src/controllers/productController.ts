import type { Request, Response } from "express";

import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

// Get all products (public) with pagination
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await queries.getAllProducts(page, Math.min(limit, 100));
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ error: "Failed to get products" });
  }
};

// Get products by current user (protected)
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const products = await queries.getProductsByUserId(userId);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error getting user products:", error);
    res.status(500).json({ error: "Failed to get user products" });
  }
};

// Get single product by ID (public)
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await queries.getProductById(id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ error: "Failed to get product" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, imageUrl, price, isNegotiable } = req.body;

    if (!title || !description || !imageUrl) {
      return res.status(400).json({
        error: "Title, description, and imageUrl are required",
      });
    }

    //get user to read city
    const user = await queries.getUserById(userId);

    if (!user?.city) {
      return res.status(400).json({
        error: "User city not set. Please select your city first.",
      });
    }

    const product = await queries.createProduct({
      title,
      description,
      imageUrl,
      price: price || null,
      isNegotiable: isNegotiable || "false",
      userId,
      city: user.city.toLowerCase(), //backend controlled
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// Get products by city (public) with pagination
export const getProductsByCity = async (req: Request, res: Response) => {
  try {
    const { city } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!city || typeof city !== "string") {
      return res.status(400).json({ error: "City is required" });
    }

    const result = await queries.getProductsByCity(city, page, Math.min(limit, 100));
    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting products by city:", error);
    res.status(500).json({ error: "Failed to get products by city" });
  }
};

// Update product (protected - owner only)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { title, description, imageUrl } = req.body;

    // Check if product exists and belongs to user
    const existingProduct = await queries.getProductById(id);
    if (!existingProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (existingProduct.userId !== userId) {
      res.status(403).json({ error: "You can only update your own products" });
      return;
    }

    const product = await queries.updateProduct(id, {
      title,
      description,
      imageUrl,
    });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// Delete product (protected - owner only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // Check if product exists and belongs to user
    const existingProduct = await queries.getProductById(id);
    if (!existingProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (existingProduct.userId !== userId) {
      res.status(403).json({ error: "You can only delete your own products" });
      return;
    }

    await queries.deleteProduct(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

export const markAsSold = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const productId = req.params.id;
    
    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }
    
    const product = await queries.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    if (product.userId !== userId) {
      return res.status(403).json({ error: "Only owner can mark as sold" });
    }

    const updatedProduct = await queries.updateProduct(productId, { isSold: "true", soldAt: new Date() });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error marking as sold:", error);
    res.status(500).json({ error: "Failed to mark as sold" });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Search query is required" });
    }
    const result = await queries.searchProducts(q, page, Math.min(limit, 100));
    res.status(200).json(result);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Failed to search products" });
  }
};
