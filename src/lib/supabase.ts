import { createClient } from '@supabase/supabase-js';

// A failed email link (expired, already used) comes back with the reason in the address.
// Read it before the client starts, because the client tidies the address up.
const linkParams = new URLSearchParams(window.location.hash.slice(1));
const linkError = linkParams.get('error_description') ?? linkParams.get('error');

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

/** Why the email link that opened this page cannot be used, or null if there is no problem. */
export const authLinkError: string | null = supabase ? linkError : 'Password reset by email needs the live site.';
