import type { AccountStatus, User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'yenkogh_token';
const USER_KEY = 'yenkogh_user';

// Demo accounts exist only in the local fallback (no backend configured)
export const DEMO_USER_EMAIL = 'user@yenkogh.com';
export const DEMO_USER_PASSWORD = 'password123';
export const DEMO_ADMIN_EMAIL = 'admin@yenkogh.com';
export const DEMO_ADMIN_PASSWORD = 'admin123';

/** Thrown after sign-up when the account must be confirmed by email before logging in. */
export class EmailConfirmationRequiredError extends Error {
  constructor() {
    super('Check your email and follow the link to confirm your account, then log in.');
    this.name = 'EmailConfirmationRequiredError';
  }
}

// ---------------------------------------------------------------------------
// Backend (Supabase) helpers
// ---------------------------------------------------------------------------

/** A row of the `profiles` table. */
export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  status: AccountStatus;
  avatar: string | null;
  bio: string | null;
  preferences: User['preferences'];
  saved_destinations: string[];
  saved_events: string[];
  created_at: string;
}

const avatarFor = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FFD300&color=090C11`;

export const profileToUser = (row: ProfileRow): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  status: row.status ?? 'active',
  avatar: row.avatar ?? avatarFor(row.name),
  bio: row.bio ?? undefined,
  preferences: row.preferences,
  savedDestinations: row.saved_destinations ?? [],
  savedEvents: row.saved_events ?? [],
  createdAt: row.created_at,
});

const SUSPENDED_MESSAGE = 'This account has been suspended. Contact support if you think this is a mistake.';

/**
 * Loads a signed-in person's profile. The database creates the row at sign-up;
 * if it is somehow missing, it is created here so login never dead-ends.
 */
async function fetchProfile(userId: string, fallback: { email: string; name: string }): Promise<User> {
  if (!supabase) throw new Error('Backend is not configured.');
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return profileToUser(data as ProfileRow);

  const { data: created, error: createError } = await supabase
    .from('profiles')
    .insert({ id: userId, name: fallback.name, email: fallback.email })
    .select('*')
    .single();
  if (createError) throw new Error(createError.message);
  return profileToUser(created as ProfileRow);
}

// ---------------------------------------------------------------------------
// Mock user store (used when no backend is configured)
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
// Local helpers
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

const OVERRIDES_KEY = 'yenkogh_user_overrides';

type UserOverride = { role?: UserRole; status?: AccountStatus };

/** Local fallback: role and status changes an admin has made, by user id. */
function readOverrides(): Record<string, UserOverride> {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}') as Record<string, UserOverride>;
  } catch {
    return {};
  }
}

/** Read all registered users from localStorage (merged with mock list). */
function getAllUsers(): User[] {
  let users: User[];
  try {
    const stored = localStorage.getItem('yenkogh_registered_users');
    const registered: User[] = stored ? JSON.parse(stored) : [];
    // Merge: registered users take precedence over mock users with the same id
    const registeredIds = new Set(registered.map((u) => u.id));
    const base = MOCK_USERS.filter((u) => !registeredIds.has(u.id));
    users = [...base, ...registered];
  } catch {
    users = [...MOCK_USERS];
  }
  const overrides = readOverrides();
  return users.map((u) => ({ status: 'active' as const, ...u, ...overrides[u.id] }));
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
   * With a backend this signs in through Supabase Auth. Without one it checks
   * the mock users and any registered users in localStorage.
   */
  async login(email: string, password: string): Promise<User> {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) throw new Error(error?.message ?? 'Could not sign in.');
      const profile = await fetchProfile(data.user.id, {
        email: data.user.email ?? email.trim(),
        name: (data.user.user_metadata?.name as string | undefined) ?? email.split('@')[0],
      });
      if (profile.status === 'suspended') {
        await supabase.auth.signOut();
        throw new Error(SUSPENDED_MESSAGE);
      }
      return profile;
    }

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

    if (user.status === 'suspended') {
      throw new Error(SUSPENDED_MESSAGE);
    }

    const token = generateFakeToken(user.id);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  /**
   * Register a new user.  Rejects if the email is already in use.
   * With a backend, throws EmailConfirmationRequiredError when the project
   * requires the address to be confirmed before the first login.
   */
  async register(name: string, email: string, password: string): Promise<User> {
    if (supabase) {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        // Read by the database trigger that creates the profile row
        options: { data: { name: cleanName, avatar: avatarFor(cleanName) } },
      });
      if (error || !data.user) throw new Error(error?.message ?? 'Could not create the account.');
      if (!data.session) throw new EmailConfirmationRequiredError();
      return fetchProfile(data.user.id, { email: cleanEmail, name: cleanName });
    }

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
      avatar: avatarFor(name.trim()),
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

  /** End the session. */
  logout(): void {
    if (supabase) {
      void supabase.auth.signOut();
      return;
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Backend only: the person already signed in on this device, with their
   * session token, or null. Used to restore the session when the app loads.
   */
  async restoreSession(): Promise<{ user: User; token: string } | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) return null;
    const user = await fetchProfile(session.user.id, {
      email: session.user.email ?? '',
      name: (session.user.user_metadata?.name as string | undefined) ?? '',
    });
    // Suspended while signed in elsewhere: end this session too
    if (user.status === 'suspended') {
      await supabase.auth.signOut();
      return null;
    }
    return { user, token: session.access_token };
  },

  /** Backend only: the current session token, or null. */
  async getSessionToken(): Promise<string | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  },

  /** Local fallback only: the user stored in this browser, or null. */
  getCurrentUser(): User | null {
    if (supabase) return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  /** Local fallback only: the stored fake JWT, or null. */
  getToken(): string | null {
    if (supabase) return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /** Local fallback only: true when a token exists in localStorage. */
  isAuthenticated(): boolean {
    return Boolean(authService.getToken());
  },

  /** Local fallback only: persist an updated user object (called by userService). */
  _updateCurrentUser(user: User): void {
    if (supabase) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    updateStoredUser(user);
  },

  /** Local fallback only: every account in this browser, with admin changes applied. */
  _listLocalUsers(): User[] {
    return supabase ? [] : getAllUsers();
  },

  /** Local fallback only: record a role or status change made in the admin area. */
  _setLocalUserOverride(userId: string, change: UserOverride): User {
    const overrides = readOverrides();
    overrides[userId] = { ...overrides[userId], ...change };
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
    const updated = getAllUsers().find((u) => u.id === userId);
    if (!updated) throw new Error('Account not found.');
    return updated;
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
