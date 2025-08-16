// Products API endpoint
const products = [
  { id: "1", name: "Texas Bluebonnet", price: 12.99, category: "native-plants", featured: true, active: true },
  { id: "2", name: "Live Oak", price: 45.99, category: "shade-trees", featured: false, active: true },
  { id: "3", name: "Peach Tree", price: 32.99, category: "fruit-trees", featured: true, active: true }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json(products);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}