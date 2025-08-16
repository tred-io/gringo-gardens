// Contact form API endpoint
export default function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Contact form submission:', req.body);
    res.json({ message: 'Message sent successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}