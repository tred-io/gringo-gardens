// User Authentication API for Vercel
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // For production, return authenticated user (simplified auth)
    // In a real app, you'd check session/JWT tokens
    const user = {
      id: "admin-user",
      name: "Admin User",
      email: "admin@gringogardens.com",
      role: "admin"
    };
    
    return res.status(200).json(user);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}