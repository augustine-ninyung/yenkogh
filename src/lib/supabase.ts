import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * The Supabase client, or null when the project URL and key are not set.
 *
 * With no backend configured the services fall back to the browser's
 * localStorage and the built-in demo accounts, so the app still runs on a
 * fresh checkout. The anon key is meant to be public: what each person can
 * read or change is enforced by the row-level security in supabase/schema.sql.
 */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const isBackendConfigured = supabase !== null;
