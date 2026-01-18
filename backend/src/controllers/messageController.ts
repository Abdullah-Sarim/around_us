import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export const startConversation = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { productId, sellerId, buyerId } = req.body;

    console.log("startConversation:", { productId, sellerId, buyerId, userId });

    if (!productId || !sellerId) {
      return res.status(400).json({ error: "productId and sellerId are required" });
    }

    // Current user is the seller - messaging a buyer from comments
    if (userId === sellerId && buyerId && buyerId !== userId) {
      const conversation = await queries.getOrCreateConversation(productId, buyerId, userId);
      return res.status(200).json(conversation);
    }

    // Current user is a buyer - messaging the seller
    if (userId !== sellerId) {
      const conversation = await queries.getOrCreateConversation(productId, userId, sellerId);
      return res.status(200).json(conversation);
    }

    return res.status(400).json({ error: "Cannot message yourself" });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({ error: "Failed to start conversation" });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const conversations = await queries.getConversationsByUser(userId);
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const conversation = await queries.getConversationById(id);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ error: "Failed to get conversation" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const conversation = await queries.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const message = await queries.createMessage({
      conversationId: id,
      senderId: userId,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const conversation = await queries.getConversationById(id);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await queries.markMessagesAsRead(id, userId);
    const messages = await queries.getMessagesByConversation(id);
    
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const conversation = await queries.getConversationById(id);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Only the seller can delete the conversation
    if (conversation.sellerId !== userId) {
      return res.status(403).json({ error: "Only seller can delete conversation" });
    }

    await queries.deleteConversation(id);
    res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
};

export const markAsSold = async (req: Request, res: Response) => {
  try {
    //console.log("markAsSold called, body:", req.body);
    const { userId } = getAuth(req);
    //console.log("userId:", userId);
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { productId } = req.body;
    //console.log("productId:", productId);
    
    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }
    
    const product = await queries.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    //console.log("product.userId:", product.userId, "userId:", userId);
    
    if (product.userId !== userId) {
      return res.status(403).json({ error: "Only owner can mark as sold" });
    }

    const updatedProduct = await queries.updateProduct(productId, { isSold: "true", soldAt: new Date() });
    console.log("Product marked as sold:", updatedProduct);
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error marking as sold:", error);
    res.status(500).json({ error: "Failed to mark as sold" });
  }
};
