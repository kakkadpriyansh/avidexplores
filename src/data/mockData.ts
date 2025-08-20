export interface Event {
  id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  location: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  duration: string;
  image: string;
  description: string;
  shortDescription: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
  }>;
  thingsToCarry: string[];
  maxParticipants: number;
  ageLimit: string;
  season: string;
  tags: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  event: string;
  location: string;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  content: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
}

export const mockEvents: Event[] = [
  {
    id: '1',
    slug: 'himalayan-base-camp-trek',
    title: 'Himalayan Base Camp Trek',
    category: 'Trekking',
    price: 15999,
    location: 'Himachal Pradesh',
    difficulty: 'Challenging',
    duration: '7 Days',
    image: '/src/assets/trek-bridge.jpg',
    shortDescription: 'Experience the majestic Himalayas on this challenging 7-day trek to base camp.',
    description: 'Embark on an unforgettable journey through pristine mountain trails, ancient villages, and breathtaking landscapes. This challenging trek offers spectacular views of snow-capped peaks and an authentic mountain experience.',
    highlights: [
      'Stunning mountain vistas',
      'Traditional village visits',
      'Professional mountain guides',
      'All camping equipment provided'
    ],
    inclusions: ['Transportation', 'Accommodation', 'Meals', 'Professional Guide', 'Safety Equipment'],
    exclusions: ['Personal expenses', 'Travel insurance', 'Additional meals'],
    itinerary: [
      { day: 1, title: 'Arrival & Base Setup', description: 'Meet at base camp, gear check, and acclimatization.' },
      { day: 2, title: 'Forest Trail', description: 'Trek through dense pine forests and meadows.' },
      { day: 3, title: 'High Altitude Camp', description: 'Reach high altitude camp with panoramic views.' }
    ],
    thingsToCarry: ['Trekking boots', 'Warm clothing', 'Rain gear', 'Personal medications'],
    maxParticipants: 15,
    ageLimit: '16-60 years',
    season: 'Mar-Jun, Sep-Nov',
    tags: ['Adventure', 'Mountains', 'Camping']
  },
  {
    id: '2',
    slug: 'river-rafting-adventure',
    title: 'River Rafting Adventure',
    category: 'Water Sports',
    price: 2999,
    location: 'Rishikesh',
    difficulty: 'Moderate',
    duration: '1 Day',
    image: '/src/assets/rafting-action.jpg',
    shortDescription: 'Thrilling white water rafting experience on the sacred Ganges.',
    description: 'Navigate through exhilarating rapids and enjoy the stunning river landscapes of Rishikesh. Perfect for adventure seekers looking for an adrenaline rush.',
    highlights: [
      'Grade III-IV rapids',
      'Professional rafting guides',
      'Safety equipment included',
      'Riverside lunch'
    ],
    inclusions: ['Safety gear', 'Professional guide', 'Lunch', 'Transportation'],
    exclusions: ['Personal expenses', 'Additional meals'],
    itinerary: [
      { day: 1, title: 'Rafting Day', description: 'Full day rafting with lunch break on the riverbank.' }
    ],
    thingsToCarry: ['Quick-dry clothes', 'Extra clothes', 'Waterproof bag'],
    maxParticipants: 24,
    ageLimit: '12-55 years',
    season: 'Sep-Jun',
    tags: ['Water Sports', 'Adventure', 'Day Trip']
  },
  {
    id: '3',
    slug: 'weekend-camping-escape',
    title: 'Weekend Camping Escape',
    category: 'Camping',
    price: 1899,
    location: 'Lonavala',
    difficulty: 'Easy',
    duration: '2 Days',
    image: '/src/assets/camping-stars.jpg',
    shortDescription: 'Perfect weekend getaway with camping under the stars.',
    description: 'Escape the city chaos with a peaceful weekend camping experience. Enjoy bonfires, stargazing, and nature walks in a serene mountain setting.',
    highlights: [
      'Bonfire nights',
      'Stargazing sessions',
      'Nature walks',
      'Team activities'
    ],
    inclusions: ['Camping gear', 'Meals', 'Activities', 'Transportation'],
    exclusions: ['Personal expenses', 'Beverages'],
    itinerary: [
      { day: 1, title: 'Setup & Activities', description: 'Camp setup, nature walk, and bonfire night.' },
      { day: 2, title: 'Adventure & Departure', description: 'Morning activities and departure.' }
    ],
    thingsToCarry: ['Comfortable clothes', 'Torch', 'Personal medicines'],
    maxParticipants: 30,
    ageLimit: '8-65 years',
    season: 'Year Round',
    tags: ['Camping', 'Family Friendly', 'Weekend']
  }
];

export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b-3f?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Amazing experience! The trek was challenging but absolutely worth it. The guides were professional and the views were breathtaking.',
    event: 'Himalayan Base Camp Trek',
    location: 'Mumbai'
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'The river rafting was thrilling! Perfect organization and safety measures. Will definitely book again.',
    event: 'River Rafting Adventure',
    location: 'Delhi'
  },
  {
    id: '3',
    name: 'Anita Patel',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 4,
    text: 'Great weekend escape with family. Kids loved the camping experience and bonfire nights.',
    event: 'Weekend Camping Escape',
    location: 'Pune'
  }
];

export const mockStories: Story[] = [
  {
    id: '1',
    slug: 'conquering-the-peaks',
    title: 'Conquering the Peaks: A Journey of Self-Discovery',
    excerpt: 'How a challenging trek to the Himalayas changed my perspective on life and adventure.',
    cover: 'https://images.unsplash.com/photo-1464822759506-4b2e6ea6a3de?w=600&h=400&fit=crop',
    content: 'The mountains have always called to me, but this trek was different...',
    author: 'Vikram Singh',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2024-01-15',
    readTime: 8,
    tags: ['Adventure', 'Mountains', 'Personal Growth']
  },
  {
    id: '2',
    slug: 'family-adventure-guide',
    title: 'The Ultimate Family Adventure Guide',
    excerpt: 'Tips and tricks for planning the perfect outdoor adventure with kids.',
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
    content: 'Planning outdoor adventures with family requires careful consideration...',
    author: 'Meera Reddy',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612f-3f?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2024-01-10',
    readTime: 6,
    tags: ['Family', 'Tips', 'Planning']
  },
  {
    id: '3',
    slug: 'monsoon-trekking-safety',
    title: 'Monsoon Trekking: Safety First',  
    excerpt: 'Essential safety tips for trekking during the monsoon season.',
    cover: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop',
    content: 'Monsoon trekking can be magical, but it requires extra precautions...',
    author: 'Arjun Kapoor',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2024-01-05',
    readTime: 5,
    tags: ['Safety', 'Monsoon', 'Trekking']
  }
];

export const adventureStats = {
  participants: '10,000+',
  guides: '50+',
  events: '200+',
  years: '8+'
};