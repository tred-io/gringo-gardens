// Newsletter subscribers API endpoint
const subscribers = [
  { 
    id: "1", 
    email: "test@example.com", 
    active: true, 
    createdAt: "2025-08-16T06:42:22.470Z" 
  },
  { 
    id: "2", 
    email: "linktest@example.com", 
    active: true, 
    createdAt: "2025-08-16T06:43:20.480Z" 
  }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json(subscribers);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}