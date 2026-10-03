import type { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Augustine Mensah',
    email: 'augustine@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80',
    bio: 'Passionate Ghanaian explorer with a love for local history, jollof rice debates, and chasing waterfalls across every region.',
    preferences: {
      currency: 'GHS',
      language: 'en',
      notifications: true,
      interests: ['historical', 'waterfall', 'cultural', 'beach'],
      preferredRegions: ['CP', 'GA', 'VR'],
      budgetRange: 'mid-range',
      travelStyle: 'cultural',
    },
    createdAt: '2025-03-15T08:30:00Z',
    savedDestinations: ['cape-coast-castle', 'wli-waterfalls', 'mole-national-park'],
    savedEvents: ['homowo-festival-2026', 'chale-wote-2026'],
  },
  {
    id: 'user-2',
    name: 'Ama Owusu',
    email: 'ama.owusu@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1502767089025-6572583495f9?w=200&q=80',
    bio: 'Adventure seeker from Kumasi. I live for national parks, vibrant festivals, and discovering the hidden gems of Ashanti and beyond.',
    preferences: {
      currency: 'GHS',
      language: 'en',
      notifications: true,
      interests: ['wildlife', 'national-park', 'cultural', 'beach'],
      preferredRegions: ['AH', 'SV', 'WN'],
      budgetRange: 'budget',
      travelStyle: 'adventure',
    },
    createdAt: '2025-07-01T12:00:00Z',
    savedDestinations: ['mole-national-park', 'kakum-national-park', 'nzulezu-stilt-village'],
    savedEvents: ['panafest-2026', 'aboakyir-2026'],
  },
  {
    id: 'user-3',
    name: 'Kofi Darko',
    email: 'kofi.darko@example.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    bio: 'Travel writer and food enthusiast documenting authentic Ghanaian cuisine and culture one community at a time.',
    preferences: {
      currency: 'GHS',
      language: 'en',
      notifications: true,
      interests: ['cultural', 'food', 'city', 'historical'],
      preferredRegions: ['GA', 'AH', 'CP'],
      budgetRange: 'mid-range',
      travelStyle: 'cultural',
    },
    createdAt: '2025-11-20T09:15:00Z',
    savedDestinations: ['kwame-nkrumah-memorial-park', 'manhyia-palace', 'labadi-beach'],
    savedEvents: ['ghana-jollof-festival-2026', 'chale-wote-2026', 'ghana-film-festival-2026'],
  },
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@yenkogh.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    bio: 'Platform administrator for YɛnkɔGH. Responsible for curating destination listings, event data, and ensuring the best experience for Ghana tourism.',
    preferences: {
      currency: 'GHS',
      language: 'en',
      notifications: true,
      interests: ['cultural', 'historical', 'national-park'],
      preferredRegions: ['GA', 'AH', 'CP', 'VR'],
      budgetRange: 'mid-range',
      travelStyle: 'mixed',
    },
    createdAt: '2024-12-01T00:00:00Z',
    savedDestinations: [],
    savedEvents: [],
  },
];

export const DEMO_USER_EMAIL = 'augustine@example.com';
export const DEMO_USER_PASSWORD = 'password123';

export const DEMO_ADMIN_EMAIL = 'admin@yenkogh.com';
export const DEMO_ADMIN_PASSWORD = 'admin123';

export const getUserById = (id: string): User | undefined =>
  mockUsers.find((u) => u.id === id);

export const getUserByEmail = (email: string): User | undefined =>
  mockUsers.find((u) => u.email === email);
