// Public settings API endpoint
const settings = [
  { id: "1", key: "temporary_closure", value: JSON.stringify({ closed: false, message: "" }) }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { key } = req.query;
    const setting = settings.find(s => s.key === key);
    
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    
    res.json(setting);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}