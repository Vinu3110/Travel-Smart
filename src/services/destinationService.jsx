
const destinations = [
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    country: "India",
    location: "Agra, India",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80",
    rating: 4.9,
    price: "₹5,000",
    description: "Discover India's iconic marble monument and its beautiful gardens.",
    category: "Heritage"
  },
  {
    id: "goa",
    name: "Goa Beaches",
    country: "India",
    location: "Goa, India",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
    rating: 4.7,
    price: "₹8,000",
    description: "Relax on sunny beaches, enjoy coastal views, and explore local food.",
    category: "Beach"
  },
  {
    id: "kerala",
    name: "Kerala Backwaters",
    country: "India",
    location: "Alappuzha, Kerala",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80",
    rating: 4.8,
    price: "₹7,000",
    description: "Experience peaceful backwaters, green landscapes, and houseboats.",
    category: "Nature"
  },
  {
    id: "jaipur",
    name: "Pink City",
    country: "India",
    location: "Jaipur, Rajasthan",
    image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=900&q=80",
    rating: 4.7,
    price: "₹6,000",
    description: "Explore royal palaces, historic forts, and colourful markets.",
    category: "Heritage"
  },
  {
    id: "paris",
    name: "Eiffel Tower",
    country: "France",
    location: "Paris, France",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80",
    rating: 4.8,
    price: "₹45,000",
    description: "Discover famous landmarks, charming streets, and French culture.",
    category: "City"
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    location: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
    rating: 4.8,
    price: "₹35,000",
    description: "Enjoy tropical beaches, beautiful temples, and lush green scenery.",
    category: "Nature"
  },
  {
    id: "switzerland",
    name: "Swiss Alps",
    country: "Switzerland",
    location: "Swiss Alps, Switzerland",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=80",
    rating: 4.9,
    price: "₹75,000",
    description: "Enjoy mountain scenery, fresh air, and beautiful alpine villages.",
    category: "Adventure"
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    location: "Tokyo, Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80",
    rating: 4.8,
    price: "₹55,000",
    description: "Experience modern city life, traditional temples, and Japanese food.",
    category: "City"
  }
];

export function getDestinations() {
  return destinations;
}

export function getCountries() {
  return [...new Set(destinations.map((destination) => destination.country))].sort();
}

export function getDestinationById(id) {
  return destinations.find((destination) => destination.id === id);
}

export default destinations;
