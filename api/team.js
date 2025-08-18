// Team members API endpoint
const teamMembers = [
  { 
    id: "1", 
    name: "Ellis Baty", 
    position: "Owner", 
    bio: "Passionate about native Texas plants and sustainable gardening.", 
    imageUrl: "", 
    order: 0, 
    active: true, 
    createdAt: "2025-08-16T18:33:26.974Z" 
  }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json(teamMembers);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}