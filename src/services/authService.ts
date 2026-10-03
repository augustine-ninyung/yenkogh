import type { User } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'yenkogh_token';
const USER_KEY = 'yenkogh_user';

export const DEMO_USER_EMAIL = 'user@yenkogh.com';
export const DEMO_USER_PASSWORD = 'password123';
export const DEMO_ADMIN_EMAIL = 'admin@yenkogh.com';
export const DEMO_ADMIN_PASSWORD = 'admin123';

// ---------------------------------------------------------------------------
// Mock user store (used when no external mockUsers data is available)
// ---------------------------------------------------------------------------
const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    name: 'Kwame Mensah',
    email: DEMO_USER_EMAIL,
    avatar: 'https://ui-avatars.com/api/?name=Kwame+Mensah&background=FFD300&color=090C11',
    role: 'user',
    savedDestinations: [],
    savedEvents: [],
    preferences: {
      currency: 'GHS',
      language: 'en',
      notifications: true,
    },
    createdAt: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 'admin-001',
    name: 'Akosua Boateng',
    email: DEMO_ADMIN_EMAIL,
    avatar: 'https://ui-avatars.com/api/?name=Akosua+Boateng&background=FFD300&color=090C11',
    role: 'admin',
    savedDestinations: [],
    savedEvents: [],
    preferences: {
      currency: 'GHS',
      language: 'en',
      notifications: true,
    },
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simulate network latency */
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a fake JWT-like token.  Not cryptographically secure — only used
 * for local mock purposes.
 */
function generateFakeToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    }),
  );
  const signature = btoa(`yenkogh-mock-${userId}-${Date.now()}`);
  return `${header}.${payload}.${signature}`;
}

/** Read all registered users from localStorage (merged with mock list). */
function getAllUsers(): User[] {
  try {
    const stored = localStorage.getItem('yenkogh_registered_users');
    const registered: User[] = stored ? JSON.parse(stored) : [];
    // Merge: registered users take precedence over mock users with the same id
    const registeredIds = new Set(registered.map((u) => u.id));
    const base = MOCK_USERS.filter((u) => !registeredIds.has(u.id));
    return [...base, ...registered];
  } catch {
    return [...MOCK_USERS];
  }
}

/** Persist a newly registered user. */
function persistRegisteredUser(user: User): void {
  const stored = localStorage.getItem('yenkogh_registered_users');
  const existing: User[] = stored ? JSON.parse(stored) : [];
  existing.push(user);
  localStorage.setItem('yenkogh_registered_users', JSON.stringify(existing));
}

/** Update a stored registered user. */
function updateStoredUser(user: User): void {
  const stored = localStorage.getItem('yenkogh_registered_users');
  const existing: User[] = stored ? JSON.parse(stored) : [];
  const idx = existing.findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    existing[idx] = user;
    localStorage.setItem('yenkogh_registered_users', JSON.stringify(existing));
  }
  // Also update current session user if it matches
  const current = authService.getCurrentUser();
  if (current?.id === user.id) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

// ---------------------------------------------------------------------------
// Auth Service
// ---------------------------------------------------------------------------

export const authService = {
  /**
   * Authenticate a user with email + password.
   * Checks against mock users and any registered users in localStorage.
   * Stores the authenticated user and a fake JWT in localStorage.
   */
  async login(email: string, password: string): Promise<User> {
    await delay(800);

    const normalised = email.trim().toLowerCase();
    const users = getAllUsers();

    // Look up the user by email
    const user = users.find((u) => u.email.toLowerCase() === normalised);

    if (!user) {
      throw new Error('No account found with that email address.');
    }

    // For mock users we check the known passwords; for registered users we
    // compare the stored (plain-text) password that was set at registration.
    let passwordOk = false;
    if (normalised === DEMO_USER_EMAIL.toLowerCase()) {
      passwordOk = password === DEMO_USER_PASSWORD;
    } else if (normalised === DEMO_ADMIN_EMAIL.toLowerCase()) {
      passwordOk = password === DEMO_ADMIN_PASSWORD;
    } else {
      // Registered user — password stored in a separate map
      const pwMap = authService._getPasswordMap();
      passwordOk = pwMap[user.id] === password;
    }

    if (!passwordOk) {
      throw new Error('Incorrect password. Please try again.');
    }

    const token = generateFakeToken(user.id);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  /**
   * Register a new user.  Rejects if the email is already in use.
   */
  async register(name: string, email: string, password: string): Promise<User> {
    await delay(1000);

    const normalised = email.trim().toLowerCase();
    const users = getAllUsers();

    if (users.some((u) => u.email.toLowerCase() === normalised)) {
      throw new Error('An account with that email address already exists.');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalised,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=FFD300&color=090C11`,
      role: 'user',
      savedDestinations: [],
      savedEvents: [],
      preferences: {
        currency: 'GHS',
        language: 'en',
        notifications: true,
      },
      createdAt: new Date().toISOString(),
    };

    // Persist user and their password separately
    persistRegisteredUser(newUser);
    const pwMap = authService._getPasswordMap();
    pwMap[newUser.id] = password;
    localStorage.setItem('yenkogh_pw_map', JSON.stringify(pwMap));

    const token = generateFakeToken(newUser.id);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

    return newUser;
  },

  /** Clear all auth state from localStorage. */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /** Return the currently authenticated user, or null. */
  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  /** Return the stored fake JWT, or null. */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /** True when a token exists in localStorage. */
  isAuthenticated(): boolean {
    return Boolean(authService.getToken());
  },

  /** Persist an updated user object (called by userService). */
  _updateCurrentUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    updateStoredUser(user);
  },

  /** Internal: read the password map from localStorage. */
  _getPasswordMap(): Record<string, string> {
    try {
      const raw = localStorage.getItem('yenkogh_pw_map');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },
};
