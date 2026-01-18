import { Router } from "express";
import { 
  startConversation, 
  getConversations, 
  getConversation, 
  sendMessage, 
  getMessages,
  deleteConversation,
  markAsSold
} from "../controllers/messageController";
import { requireAuth } from "@clerk/express";

const router = Router();

// POST /api/messages - start a conversation
router.post("/", requireAuth(), startConversation);

// GET /api/messages - get all conversations for current user
router.get("/", requireAuth(), getConversations);

// POST /api/messages/mark-sold - mark product as sold (must be before /:id)
router.post("/mark-sold", requireAuth(), markAsSold);

// GET /api/messages/:id - get a specific conversation
router.get("/:id", requireAuth(), getConversation);

// GET /api/messages/:id/messages - get messages in a conversation
router.get("/:id/messages", requireAuth(), getMessages);

// POST /api/messages/:id - send a message
router.post("/:id", requireAuth(), sendMessage);

// DELETE /api/messages/:id - delete conversation (seller only)
router.delete("/:id", requireAuth(), deleteConversation);

export default router;
