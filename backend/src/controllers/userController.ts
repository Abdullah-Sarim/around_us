import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(200).json({ user: null });
    }

    const user = await queries.getUserById(userId);
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};

export async function syncUser(req: Request, res: Response) {
  try {
    const { userId } = getAuth(req);
    //console.log("Auth userId:", userId);

    const { email, name, imageUrl } = req.body;
    //console.log("Body:", req.body);

    const user = await queries.upsertUser({
      id: userId!,
      email,
      name,
      imageUrl,
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
}


export const updateUserCity = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { city } = req.body;

    if (!city || typeof city !== "string") {
      return res.status(400).json({ error: "City is required" });
    }

    const user = await queries.updateUser(userId, {
      city: city.toLowerCase(),
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user city:", error);
    res.status(500).json({ error: "Failed to update city" });
  }
};

