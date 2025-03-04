/**
 * Mock data for spots to use in development
 */

export interface Spot {
  id: string;
  name: string;
  description: string;
  type: string;
  address: string;
  neighborhood: string;
  city: string;
  coordinates: [number, number];
  interests: string[];
  priceRange: 1 | 2 | 3 | 4;
  rating: number;
  imageUrl?: string;
  website?: string;
  phone?: string;
  tags: string[];
  popular?: boolean;
  verified?: boolean;
}

// San Francisco neighborhoods with approximate coordinates
const sfNeighborhoods: Record<string, [number, number]> = {
  'Mission': [-122.4195, 37.7586],
  'Castro': [-122.4316, 37.7609],
  'SOMA': [-122.401, 37.7786],
  'North Beach': [-122.4097, 37.8021],
  'Marina': [-122.4372, 37.8015],
  'Hayes Valley': [-122.4241, 37.7762],
  'Dogpatch': [-122.3884, 37.7585],
  'Richmond': [-122.4766, 37.7801],
  'Sunset': [-122.4834, 37.7516],
  'Haight-Ashbury': [-122.4462, 37.7702],
  'Financial District': [-122.4012, 37.7941],
  'Chinatown': [-122.4066, 37.7962],
  'Nob Hill': [-122.4148, 37.7929],
  'Pacific Heights': [-122.4344, 37.7923],
  'Russian Hill': [-122.4187, 37.8011],
  'Tenderloin': [-122.4129, 37.7835],
  'Fisherman\'s Wharf': [-122.4177, 37.8081],
};

// Helper to get random neighborhood
function getRandomNeighborhood(): { name: string; coordinates: [number, number] } {
  const neighborhoods = Object.keys(sfNeighborhoods);
  const randomIndex = Math.floor(Math.random() * neighborhoods.length);
  const name = neighborhoods[randomIndex];
  return { name, coordinates: sfNeighborhoods[name] };
}

// Helper to add small randomness to coordinates 
function addRandomnessToCoordinates(coordinates: [number, number], range = 0.008): [number, number] {
  return [
    coordinates[0] + (Math.random() - 0.5) * range,
    coordinates[1] + (Math.random() - 0.5) * range
  ];
}

// Create mock spots
export const mockSpots: Spot[] = [
  {
    id: 'ritual-coffee-valencia',
    name: 'Ritual Coffee Roasters',
    description: 'Bright, spacious cafe known for expertly prepared coffee and minimalist decor.',
    type: 'cafe',
    address: '1026 Valencia St',
    neighborhood: 'Mission',
    city: 'San Francisco',
    coordinates: [-122.4214, 37.7563],
    interests: ['coffee', 'work', 'reading'],
    priceRange: 2,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    website: 'https://ritualcoffee.com',
    phone: '(415) 641-1011',
    tags: ['Coffee', 'Cafe', 'Workspace'],
    popular: true,
    verified: true,
  },
  {
    id: 'dolores-park',
    name: 'Dolores Park',
    description: 'Sunny park with stunning city views, popular for picnics and social gatherings.',
    type: 'park',
    address: 'Dolores St & 19th St',
    neighborhood: 'Mission',
    city: 'San Francisco',
    coordinates: [-122.4274, 37.7596],
    interests: ['picnics', 'nature', 'social'],
    priceRange: 1,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1551875466-db81a9dbd4f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    website: 'https://sfrecpark.org/parks-open-spaces/park-recreation-map/',
    tags: ['Park', 'Views', 'Outdoors'],
    popular: true,
    verified: true,
  },
  {
    id: 'bi-rite-creamery',
    name: 'Bi-Rite Creamery',
    description: 'Beloved ice cream shop serving organic handmade treats and baked goods.',
    type: 'dessert',
    address: '3692 18th St',
    neighborhood: 'Mission',
    city: 'San Francisco',
    coordinates: [-122.4256, 37.7614],
    interests: ['icecream', 'food', 'dessert'],
    priceRange: 2,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    website: 'https://biritemarket.com/creamery/',
    phone: '(415) 626-5600',
    tags: ['Ice Cream', 'Dessert', 'Organic'],
    popular: true,
    verified: true,
  },
  {
    id: 'philz-coffee-castro',
    name: 'Philz Coffee',
    description: 'Customized pour-over coffee in a casual setting with outdoor seating.',
    type: 'cafe',
    address: '549 Castro St',
    neighborhood: 'Castro',
    city: 'San Francisco',
    coordinates: [-122.4353, 37.7606],
    interests: ['coffee', 'work', 'social'],
    priceRange: 2,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1051&q=80',
    website: 'https://www.philzcoffee.com/',
    phone: '(415) 321-7366',
    tags: ['Coffee', 'Chill', 'Local'],
    verified: true,
  },
  {
    id: 'sightglass-coffee-soma',
    name: 'Sightglass Coffee',
    description: 'Industrial-chic coffee bar with house-roasted beans and pastries.',
    type: 'cafe',
    address: '270 7th St',
    neighborhood: 'SOMA',
    city: 'San Francisco',
    coordinates: [-122.4087, 37.7768],
    interests: ['coffee', 'work', 'design'],
    priceRange: 2,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1501747315-124a0eaca060?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    website: 'https://sightglasscoffee.com/',
    phone: '(415) 861-1313',
    tags: ['Coffee', 'Roastery', 'Design'],
    verified: true,
  },
  {
    id: 'ferry-building',
    name: 'Ferry Building Marketplace',
    description: 'Historic building hosting gourmet shops, eateries & farmers market.',
    type: 'shopping',
    address: '1 Ferry Building',
    neighborhood: 'Financial District',
    city: 'San Francisco',
    coordinates: [-122.3936, 37.7955],
    interests: ['food', 'shopping', 'farmers markets'],
    priceRange: 3,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1546896978-c49d25982326?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    website: 'https://www.ferrybuildingmarketplace.com/',
    phone: '(415) 983-8000',
    tags: ['Food Hall', 'Market', 'Waterfront'],
    popular: true,
    verified: true,
  },
  {
    id: 'tonga-room',
    name: 'Tonga Room & Hurricane Bar',
    description: 'Classic tiki bar with tropical drinks, Polynesian food & indoor "rainstorms".',
    type: 'bar',
    address: '950 Mason St',
    neighborhood: 'Nob Hill',
    city: 'San Francisco',
    coordinates: [-122.4106, 37.7909],
    interests: ['cocktails', 'nightlife', 'dinner'],
    priceRange: 3,
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    website: 'https://www.tongaroom.com/',
    phone: '(415) 772-5278',
    tags: ['Tiki Bar', 'Unique', 'Cocktails'],
    popular: true,
    verified: true,
  },
  {
    id: 'musee-mecanique',
    name: 'Musée Mécanique',
    description: 'Quirky museum with vintage arcade games and mechanical musical instruments.',
    type: 'museum',
    address: 'Pier 45',
    neighborhood: 'Fisherman\'s Wharf',
    city: 'San Francisco',
    coordinates: [-122.4154, 37.809],
    interests: ['history', 'gaming', 'museums'],
    priceRange: 1,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    website: 'http://www.museemecanique.com/',
    phone: '(415) 346-2000',
    tags: ['Arcade', 'Vintage', 'Museum'],
    verified: true,
  },
  {
    id: 'tartine-bakery',
    name: 'Tartine Bakery',
    description: 'Legendary bakery known for artisanal bread, pastries, and long lines.',
    type: 'bakery',
    address: '600 Guerrero St',
    neighborhood: 'Mission',
    city: 'San Francisco',
    coordinates: [-122.4224, 37.7612],
    interests: ['food', 'bakeries', 'sourdough'],
    priceRange: 2,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1517433367423-c9e1351b44f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    website: 'https://tartinebakery.com/',
    phone: '(415) 487-2600',
    tags: ['Bakery', 'Pastries', 'Sourdough'],
    popular: true,
    verified: true,
  },
  {
    id: 'golden-gate-park',
    name: 'Golden Gate Park',
    description: 'Expansive urban park with museums, gardens, and recreational areas.',
    type: 'park',
    address: '501 Stanyan St',
    neighborhood: 'Richmond',
    city: 'San Francisco',
    coordinates: [-122.4759, 37.7694],
    interests: ['nature', 'museums', 'gardens'],
    priceRange: 1,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1571764840589-8fe6505d05b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    website: 'https://goldengatepark.com/',
    tags: ['Park', 'Nature', 'Recreation'],
    popular: true,
    verified: true,
  },
];

// Generate additional mock spots based on neighborhoods and interests
export function generateAdditionalSpots(count: number): Spot[] {
  const additionalSpots: Spot[] = [];
  
  const spotTypes = [
    { type: 'cafe', interests: ['coffee', 'work', 'reading'] },
    { type: 'restaurant', interests: ['food', 'dining', 'dinner'] },
    { type: 'bar', interests: ['cocktails', 'nightlife', 'social'] },
    { type: 'park', interests: ['nature', 'picnics', 'outdoors'] },
    { type: 'museum', interests: ['art', 'history', 'culture'] },
    { type: 'shop', interests: ['shopping', 'vintage', 'design'] },
    { type: 'fitness', interests: ['yoga', 'hiking', 'wellness'] },
  ];
  
  for (let i = 0; i < count; i++) {
    // Choose random type and neighborhood
    const randomTypeIndex = Math.floor(Math.random() * spotTypes.length);
    const { type, interests } = spotTypes[randomTypeIndex];
    const neighborhood = getRandomNeighborhood();
    
    // Generate random ID
    const id = `mock-spot-${type}-${i}`;
    
    // Add spot
    additionalSpots.push({
      id,
      name: `${neighborhood.name} ${type.charAt(0).toUpperCase() + type.slice(1)} #${i + 1}`,
      description: `A lovely ${type} in the ${neighborhood.name} neighborhood.`,
      type,
      address: `${Math.floor(Math.random() * 2000)} ${['Main', 'First', 'Oak', 'Maple', 'Park', 'Market'][Math.floor(Math.random() * 6)]} St`,
      neighborhood: neighborhood.name,
      city: 'San Francisco',
      coordinates: addRandomnessToCoordinates(neighborhood.coordinates),
      interests: interests,
      priceRange: (Math.floor(Math.random() * 4) + 1) as 1 | 2 | 3 | 4,
      rating: 3 + Math.random() * 2,
      tags: [type.charAt(0).toUpperCase() + type.slice(1), neighborhood.name],
      popular: Math.random() > 0.8,
      verified: Math.random() > 0.3,
    });
  }
  
  return additionalSpots;
}

// Combine both sets of spots
export const allMockSpots = [...mockSpots, ...generateAdditionalSpots(30)];

/**
 * Get spots filtered by interests
 */
export function getSpotsByInterests(interests: string[]): Spot[] {
  if (!interests.length) return allMockSpots;
  
  return allMockSpots.filter(spot => 
    spot.interests.some(interest => 
      interests.some(userInterest => 
        interest.toLowerCase().includes(userInterest.toLowerCase()) ||
        userInterest.toLowerCase().includes(interest.toLowerCase())
      )
    )
  );
}

/**
 * Get spots near a location
 */
export function getSpotsByLocation(lat: number, lng: number, radiusKm: number = 3): Spot[] {
  // Simple distance calculation (not accounting for Earth's curvature)
  // For exact distances, use Haversine formula
  const latRad = lat * Math.PI / 180;
  const lngRad = lng * Math.PI / 180;
  
  return allMockSpots.filter(spot => {
    const spotLatRad = spot.coordinates[1] * Math.PI / 180;
    const spotLngRad = spot.coordinates[0] * Math.PI / 180;
    
    // Approximate distance in kilometers (simplified)
    const distance = Math.sqrt(
      Math.pow((spotLatRad - latRad) * 111.32, 2) + 
      Math.pow((spotLngRad - lngRad) * 111.32 * Math.cos(latRad), 2)
    );
    
    return distance <= radiusKm;
  });
}

/**
 * Get recommended spots based on user interests
 */
export function getRecommendedSpots(interests: string[], count: number = 5): Spot[] {
  const spotsByInterests = getSpotsByInterests(interests);
  const popular = spotsByInterests.filter(spot => spot.popular);
  const verified = spotsByInterests.filter(spot => spot.verified);
  
  // Prioritize spots that are both popular and verified
  const prioritySpots = popular.filter(spot => spot.verified);
  const remainingCount = count - prioritySpots.length;
  
  if (remainingCount <= 0) {
    // If we have enough priority spots, return a subset
    return prioritySpots.slice(0, count);
  }
  
  // Add some popular spots that aren't verified
  const popularNotVerified = popular.filter(spot => !spot.verified);
  let recommendations = [...prioritySpots];
  
  if (popularNotVerified.length > 0) {
    const popularToAdd = Math.min(remainingCount, popularNotVerified.length);
    recommendations = [...recommendations, ...popularNotVerified.slice(0, popularToAdd)];
  }
  
  // If we still need more, add verified spots that aren't popular
  if (recommendations.length < count) {
    const verifiedNotPopular = verified.filter(spot => !spot.popular);
    const verifiedToAdd = Math.min(count - recommendations.length, verifiedNotPopular.length);
    recommendations = [...recommendations, ...verifiedNotPopular.slice(0, verifiedToAdd)];
  }
  
  // If we still need more, add random spots
  if (recommendations.length < count) {
    const remaining = spotsByInterests.filter(
      spot => !recommendations.some(r => r.id === spot.id)
    );
    const randomToAdd = Math.min(count - recommendations.length, remaining.length);
    recommendations = [...recommendations, ...remaining.slice(0, randomToAdd)];
  }
  
  return recommendations;
} 