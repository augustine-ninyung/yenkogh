import { destinations } from '@/data/destinations';
import { events } from '@/data/events';
import { festivals } from '@/data/festivals';
import { regions } from '@/data/regions';
import { transportation } from '@/data/transportation';
import {
  destinationToRow,
  eventToRow,
  festivalToRow,
  regionToRow,
  transportToRow,
  type ContentTable,
  type RowByTable,
} from './resources';

// The local stand-in for the database, used only while no backend is
// configured. Rows have exactly the shape of the real tables, so the admin
// area behaves the same either way; they live in this browser's storage.
//
// Nothing here is a security boundary. Real enforcement is in the database
// (supabase/admin.sql); this only lets the app run on a fresh checkout.

// Taken at import time, before the public site's copies are refreshed from storage
const SEED: { [T in ContentTable]: RowByTable[T][] } = {
  regions: regions.map((r, i) => regionToRow(r, i)),
  destinations: destinations.map((d, i) => destinationToRow(d, i, regions)),
  events: events.map((e, i) => eventToRow(e, i, regions)),
  festivals: festivals.map((f, i) => festivalToRow(f, i, regions)),
  transport_options: transportation.map((t, i) => transportToRow(t, i)),
};

const tableKey = (table: ContentTable) => `yenkogh_db_${table}`;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export interface LocalAuditEntry {
  id: number;
  actor_id: string | null;
  actor_email: string;
  action: string;
  resource: string;
  resource_id: string;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface LocalFeedbackRow {
  id: string;
  user_id: string;
  kind: string;
  subject_type: string;
  subject_id: string | null;
  subject_name: string;
  message: string;
  status: string;
  admin_note: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const AUDIT_KEY = 'yenkogh_db_audit_log';
const FEEDBACK_KEY = 'yenkogh_db_feedback';

export const localDb = {
  /** True once an admin has changed this table here; until then the bundled content is used as is. */
  isModified(table: ContentTable): boolean {
    try {
      return localStorage.getItem(tableKey(table)) !== null;
    } catch {
      return false;
    }
  },

  rows<T extends ContentTable>(table: T): RowByTable[T][] {
    return readJson<RowByTable[T][]>(tableKey(table), SEED[table]);
  },

  write<T extends ContentTable>(table: T, rows: RowByTable[T][]): void {
    localStorage.setItem(tableKey(table), JSON.stringify(rows));
  },

  audit(): LocalAuditEntry[] {
    return readJson<LocalAuditEntry[]>(AUDIT_KEY, []);
  },

  addAudit(entry: Omit<LocalAuditEntry, 'id' | 'created_at' | 'metadata'> & { metadata?: Record<string, unknown> }): void {
    const all = localDb.audit();
    all.push({
      ...entry,
      metadata: entry.metadata ?? {},
      id: (all[all.length - 1]?.id ?? 0) + 1,
      created_at: new Date().toISOString(),
    });
    // Keep the local log from growing without bound
    localStorage.setItem(AUDIT_KEY, JSON.stringify(all.slice(-500)));
  },

  feedback(): LocalFeedbackRow[] {
    return readJson<LocalFeedbackRow[]>(FEEDBACK_KEY, []);
  },

  writeFeedback(rows: LocalFeedbackRow[]): void {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(rows));
  },
};
