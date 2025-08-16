// Categories API endpoint
const categories = [
  { id: "native-plants", name: "Native Plants", description: "Texas native plants", showOnHomepage: true },
  { id: "fruit-trees", name: "Fruit Trees", description: "Fresh fruit trees", showOnHomepage: true },
  { id: "shade-trees", name: "Shade Trees", description: "Decorative shade trees", showOnHomepage: true },
  { id: "hanging-baskets", name: "Hanging Baskets", description: "Beautiful hanging arrangements", showOnHomepage: true }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json(categories);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}