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

export interface Destination {
  name: string;
  image: string;
  subtitle?: string;
  slug?: string;
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
  },
  {
    id: '4',
    slug: 'maharashtra-escape-3-days',
    title: 'Maharashtra Escape – 3 Days / 2 Nights',
    category: 'Multi-Adventure',
    price: 7000,
    location: 'Maharashtra (Bhandardara)',
    difficulty: 'Moderate',
    duration: '3 Days',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    shortDescription: 'Experience waterfalls, trekking, heritage, boating, and BBQ nights in Maharashtra\'s natural paradise.',
    description: '🌍 Hello Traveller! ✨\nGet ready for a breathtaking Maharashtra Escape 🌄\n\n📅 Duration: 3 Days / 2 Nights\n🚌 Departure From: Rajkot | Ahmedabad | Surat | Nashik\n\n🌟 Journey Highlights:\n\n1️⃣ 5 Stunning Waterfalls 💦\n2️⃣ Harishchandra Trek 🥾\n3️⃣ Heritage Amruteshwar Temple 🛕\n4️⃣ Boat Adventure on Maharashtra\'s Biggest Dam (28 km) 🚤\n5️⃣ Scenic Road Trip 🚗\n6️⃣ Special BBQ Night under Billions of Stars 🔥✨\n\n📌 Stay: Comfortable 2 nights at Bhandardara Resort 🏡\n\n💫 What\'s the Special Magic?\n\nThis journey blends thrill & tranquility – the roar of waterfalls, the adventure of trekking, the serenity of temple visits, and the calm of a boat ride. Every moment is designed to create unforgettable memories amidst Maharashtra\'s natural beauty.\n\n📩 For detailed itinerary, just ping me!',
    highlights: [
      '5 Waterfall Adventure (25 km journey)',
      'Harishchandragad Trek with hidden waterfall',
      'Boating on Maharashtra\'s biggest dam (28 km stretch)',
      'BBQ Night with music & dancing',
      'Amruteshwar Temple visit',
      'Natural bath experience',
      'Professional trek guides'
    ],
    inclusions: [
      '2 Breakfasts, 2 Lunches, 2 Dinners',
      'BBQ night with entertainment',
      'AC vehicle transport as per itinerary',
      'Guided 5-waterfall exploration',
      'Professional trek guide',
      'Boating experience',
      'Taxes & service charges',
      '2 nights accommodation at Bhandardara Resort'
    ],
    exclusions: [
      'Personal expenses (laundry, beverages, etc.)',
      'Insurance',
      'Camera fees at monuments (if applicable)',
      'Activities not mentioned in itinerary',
      'Extra costs due to natural/political disturbances'
    ],
    itinerary: [
      {
        day: 0,
        title: 'Departure',
        description: 'From Ahmedabad – AC Sleeper Bus (6:00 PM), From Surat – AC Tempo Traveller (11:00 PM), From Vadodara – Self-arranged travel to Surat, From Nashik – Pickup at 7:00 AM (Day 1)'
      },
      {
        day: 1,
        title: 'Waterfall Wonderland',
        description: '10:30 AM – Arrival at Bhandardara Resort, 12:00 PM – Energizing Lunch, 1:30 PM – Begin 5 Waterfall Adventure: Vasundhara Falls, Koikhubhe Falls, Nahani Falls, Necklace Falls, Vanrai Falls, 7:00 PM – Return & relax, 8:00 PM – Dinner, Overnight stay at resort'
      },
      {
        day: 2,
        title: 'Thrilling Trek Adventure',
        description: '6:00 AM – Early breakfast, 7:00 AM – Departure for Harishchandragad, 8:00 AM – Start trek from base point, Mid-day – Packed lunch amidst nature, Special Highlight: Hidden waterfall + natural bath, 6:00 PM – Return to resort, 8:00 PM – Dinner, 9:30 PM – Special BBQ Night with music & dancing'
      },
      {
        day: 3,
        title: 'Heritage & Water Adventure',
        description: '8:00 AM – Breakfast, 9:00 AM – Visit Amruteshwar Temple, 11:00 AM – Boating on Maharashtra\'s biggest dam (28 km stretch), 2:00 PM – Begin return journey, 5:00 PM – Drop at Nashik, 7:00 PM – AC bus to Ahmedabad, 12:00 AM – Arrival at Surat'
      }
    ],
    thingsToCarry: [
      'Original ID proof (mandatory)',
      'Trekking shoes with good grip',
      'Quick-dry clothes (3-4 sets)',
      'Light jacket/windcheater',
      'Swimwear for waterfalls',
      'Personal water bottle (1L+)',
      'Small daypack',
      'Hat, sunglasses, sunscreen (SPF 50+)',
      'Insect repellent',
      'First aid kit & medicines',
      'Quick-dry towel',
      'Power bank & charger',
      'Waterproof cover for gadgets',
      'Torch/headlamp + batteries',
      'Toiletries & hygiene items'
    ],
    maxParticipants: 25,
    ageLimit: '12-60 years',
    season: 'Oct-Mar',
    tags: ['Adventure', 'Waterfalls', 'Trekking', 'Heritage', 'Multi-Day']
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
    excerpt: 'How a challenging trek to the Himalayas changed my perspective on life and adventure, teaching me lessons that go far beyond the mountains.',
    cover: 'https://miro.medium.com/v2/resize:fit:1400/format:webp/0*m4F4LxOfM7_l8Mu6',
    content: 'The mountains have always called to me, but this trek was different...',
    author: 'Vikram Singh',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2024-01-15',
    readTime: 8,
    tags: ['Adventure', 'Mountains', 'Personal Growth']
  },
  {
    id: '2',
    slug: 'underwater-paradise-maldives',
    title: 'Diving into Paradise: Maldives Underwater Adventure',
    excerpt: 'Exploring the vibrant coral reefs and marine life of the Maldives - a scuba diving experience that will leave you breathless.',
    cover: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
    content: 'The crystal-clear waters of the Maldives hide an underwater world...',
    author: 'Priya Nair',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b-3f?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2024-01-20',
    readTime: 7,
    tags: ['Scuba Diving', 'Marine Life', 'Maldives']
  },
  {
    id: '3',
    slug: 'desert-safari-rajasthan',
    title: 'Golden Sands and Starlit Nights: Rajasthan Desert Safari',
    excerpt: 'Experience the magic of the Thar Desert with camel rides, traditional music, and camping under a blanket of stars.',
    cover: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&h=400&fit=crop',
    content: 'The vast expanse of golden sand dunes stretched endlessly...',
    author: 'Rajesh Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2024-01-18',
    readTime: 6,
    tags: ['Desert', 'Camping', 'Culture']
  },
  {
    id: '4',
    slug: 'white-water-rapids-rishikesh',
    title: 'Conquering the Rapids: White Water Rafting in Rishikesh',
    excerpt: 'Navigate through Grade IV rapids on the holy Ganges river, where spirituality meets adrenaline in the adventure capital of India.',
    cover: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop',
    content: 'The roar of the rapids echoed through the valley as our raft...',
    author: 'Anita Gupta',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2024-01-12',
    readTime: 5,
    tags: ['Water Sports', 'Rishikesh', 'Adrenaline']
  },
  {
    id: '5',
    slug: 'backpacking-southeast-asia',
    title: 'Solo Backpacking Through Southeast Asia: 30 Days of Discovery',
    excerpt: 'From bustling Bangkok markets to serene Bali beaches, follow my month-long solo journey across Southeast Asia.',
    cover: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop',
    content: 'With nothing but a backpack and an open mind, I embarked on...',
    author: 'Karan Mehta',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2024-01-08',
    readTime: 12,
    tags: ['Solo Travel', 'Backpacking', 'Southeast Asia']
  },
  {
    id: '6',
    slug: 'family-adventure-guide',
    title: 'The Ultimate Family Adventure Guide',
    excerpt: 'Tips and tricks for planning the perfect outdoor adventure with kids, ensuring fun and safety for the whole family.',
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
    content: 'Planning outdoor adventures with family requires careful consideration...',
    author: 'Meera Reddy',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612f-3f?w=100&h=100&fit=crop&crop=face',
    publishedAt: '2024-01-10',
    readTime: 6,
    tags: ['Family', 'Tips', 'Planning']
  }
];

export const adventureStats = {
  participants: '10,000+',
  guides: '50+',
  events: '200+',
  years: '8+'
};

export const destinations = {
  india: [
    { name: 'Ladakh', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop', subtitle: 'Road Trip', slug: 'ladakh' },
    { name: 'Kerala', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=600&fit=crop', slug: 'kerala' },
    { name: 'Himachal', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop', slug: 'himachal' },
    { name: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=600&fit=crop', slug: 'goa' },
    { name: 'Andaman Nicobar', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=600&fit=crop', slug: 'andaman-nicobar' },
  ],
  international: [
    { name: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=600&fit=crop' },
    { name: 'Maldives', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop' },
    { name: 'Malaysia', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=600&fit=crop' },
    { name: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=600&fit=crop' },
    { name: 'Bali', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=600&fit=crop' },
  ],
};

export const mockDestinations: Destination[] = destinations.india;