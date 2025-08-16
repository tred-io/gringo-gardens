// Reviews API endpoint
const reviews = [
  { id: "1", customerName: "Sarah Johnson", rating: 5, content: "Amazing selection of native plants!", featured: true },
  { id: "2", customerName: "Mike Davis", rating: 5, content: "Great quality trees and excellent service.", featured: true }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json(reviews);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}