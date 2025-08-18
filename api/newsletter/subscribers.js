import { storage } from "../../server/storage.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const subscribers = await storage.getNewsletterSubscribers();
      return res.json(subscribers);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Newsletter subscribers API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}