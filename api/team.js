import { storage } from "../server/storage.js";
import { insertTeamMemberSchema } from "../shared/schema.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const teamMembers = await storage.getTeamMembers();
      return res.json(teamMembers);
    }
    
    if (req.method === "POST") {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(memberData);
      return res.status(201).json(member);
    }

    if (req.method === "PUT") {
      const { id } = req.query;
      const memberData = insertTeamMemberSchema.partial().parse(req.body);
      const member = await storage.updateTeamMember(id, memberData);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      return res.json(member);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      const success = await storage.deleteTeamMember(id);
      if (!success) {
        return res.status(404).json({ error: "Team member not found" });
      }
      return res.json({ message: "Team member deleted successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Team API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}