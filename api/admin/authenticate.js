// Admin authentication endpoint
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'GringoGardens2025!';
    
    if (password === adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}