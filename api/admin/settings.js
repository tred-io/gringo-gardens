// Simple settings API endpoint
const settings = [
  { id: "1", key: "temporary_closure", value: JSON.stringify({ closed: false, message: "" }) }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json(settings);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}