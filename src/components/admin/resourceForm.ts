import type { TransportRoute } from '@/types';
import type { ContentStatus, ContentTable } from '@/services/content/resources';
import type { TableColumn, TableFilter } from './PagedTable';

// How a content type's admin screen is described: its table columns, filters
// and form fields. One description drives the list, the form, validation and
// the conversion between form values and database rows.

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'number'
  | 'date'
  | 'url'
  | 'image'
  | 'boolean'
  /** One entry per line, stored as a list */
  | 'list'
  /** Image links, one per line, stored as gallery items */
  | 'gallery'
  | 'routes';

export interface FieldDef {
  /** A column name, or "details.something" for a value kept in the details JSON */
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  /** For number columns that may be empty in the database */
  nullable?: boolean;
  options?: { value: string; label: string }[];
  /** Fill the options with the regions in the database */
  optionsFrom?: 'regions';
  hint?: string;
  placeholder?: string;
  /** Take the full width of the form instead of one of its two columns */
  wide?: boolean;
  rows?: number;
}

export interface FormSection {
  title: string;
  fields: FieldDef[];
}

export type FormValue = string | boolean | TransportRoute[];
export type FormValues = Record<string, FormValue>;
export type FormErrors = Record<string, string>;

/** A row of any content table, as the admin screens handle it. */
export interface AdminRow {
  id: string;
  name: string;
  status?: ContentStatus;
  featured?: boolean;
  details?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  [column: string]: unknown;
}

export interface ResourceConfig {
  table: ContentTable;
  /** "destination" */
  singular: string;
  /** "destinations" */
  plural: string;
  title: string;
  description: string;
  searchColumns: string[];
  searchPlaceholder: string;
  columns: TableColumn<AdminRow>[];
  filters: (TableFilter | { key: string; label: string; optionsFrom: 'regions' })[];
  sections: FormSection[];
  defaultSort: { column: string; ascending: boolean };
  /** Has draft, published and archived states */
  publishable: boolean;
  featurable: boolean;
  /** Starting values for a new record */
  defaults: FormValues;
  /** Checks that involve more than one field */
  validate?: (values: FormValues) => FormErrors;
  /** Last adjustments to the row before it is saved */
  prepare?: (row: Record<string, unknown>) => Record<string, unknown>;
  /** Where the record appears on the public site, if it has its own page */
  publicPath?: (row: AdminRow) => string;
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const lines = (value: FormValue): string[] =>
  String(value)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const isDetailKey = (key: string) => key.startsWith('details.');
const detailName = (key: string) => key.slice('details.'.length);

const allFields = (sections: FormSection[]) => sections.flatMap((s) => s.fields);

// ─── Row → form ───────────────────────────────────────────────────────────────

function readValue(row: AdminRow | null, field: FieldDef): unknown {
  if (!row) return undefined;
  return isDetailKey(field.key) ? row.details?.[detailName(field.key)] : row[field.key];
}

export function rowToValues(row: AdminRow | null, sections: FormSection[], defaults: FormValues): FormValues {
  const values: FormValues = {};
  for (const field of allFields(sections)) {
    const raw = readValue(row, field);
    if (raw === undefined || raw === null) {
      values[field.key] = defaults[field.key] ?? (field.type === 'boolean' ? false : field.type === 'routes' ? [] : '');
      continue;
    }
    switch (field.type) {
      case 'boolean':
        values[field.key] = Boolean(raw);
        break;
      case 'list':
        values[field.key] = Array.isArray(raw) ? raw.join('\n') : '';
        break;
      case 'gallery':
        values[field.key] = Array.isArray(raw) ? raw.map((g: { url?: string }) => g.url ?? '').filter(Boolean).join('\n') : '';
        break;
      case 'routes':
        values[field.key] = Array.isArray(raw) ? (raw as TransportRoute[]).map((r) => ({ ...r, estimatedCost: { ...r.estimatedCost } })) : [];
        break;
      default:
        values[field.key] = String(raw);
    }
  }
  return values;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateField(field: FieldDef, value: FormValue): string | undefined {
  if (field.type === 'boolean') return undefined;

  if (field.type === 'routes') {
    const routes = value as TransportRoute[];
    for (const [i, route] of routes.entries()) {
      const n = i + 1;
      if (!route.from.trim() || !route.to.trim()) return `Route ${n} needs both a start and an end.`;
      if (!route.estimatedDuration.trim()) return `Route ${n} needs a travel time.`;
      const { min, max } = route.estimatedCost;
      if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < 0) return `Route ${n} has a fare that is not a valid amount.`;
      if (min > max) return `Route ${n}: the lowest fare is above the highest.`;
    }
    return undefined;
  }

  const text = String(value).trim();
  if (!text) return field.required ? `${field.label} is required.` : undefined;

  if (field.maxLength && text.length > field.maxLength) {
    return `${field.label} must be ${field.maxLength} characters or fewer (it is ${text.length}).`;
  }

  switch (field.type) {
    case 'number': {
      const n = Number(text);
      if (!Number.isFinite(n)) return `${field.label} must be a number.`;
      if (field.min !== undefined && n < field.min) return `${field.label} cannot be less than ${field.min}.`;
      if (field.max !== undefined && n > field.max) return `${field.label} cannot be more than ${field.max}.`;
      return undefined;
    }
    case 'date':
      return DATE_PATTERN.test(text) && !Number.isNaN(new Date(`${text}T00:00:00`).getTime())
        ? undefined
        : `${field.label} must be a valid date.`;
    case 'url':
    case 'image':
      return URL_PATTERN.test(text) ? undefined : `${field.label} must be a link starting with http:// or https://.`;
    case 'gallery':
      return lines(text).every((l) => URL_PATTERN.test(l)) ? undefined : 'Every line must be a link starting with http:// or https://.';
    case 'select':
      return !field.options || field.options.some((o) => o.value === text) ? undefined : `Choose a ${field.label.toLowerCase()} from the list.`;
    default:
      if (field.key === 'slug' && !SLUG_PATTERN.test(text)) {
        return 'Use lowercase letters, numbers and single hyphens only, e.g. cape-coast-castle.';
      }
      return undefined;
  }
}

export function validateForm(values: FormValues, config: Pick<ResourceConfig, 'sections' | 'validate'>): FormErrors {
  const errors: FormErrors = {};
  for (const field of allFields(config.sections)) {
    const problem = validateField(field, values[field.key]);
    if (problem) errors[field.key] = problem;
  }
  // Cross-field checks only add to fields that are otherwise fine
  for (const [key, problem] of Object.entries(config.validate?.(values) ?? {})) {
    if (!errors[key]) errors[key] = problem;
  }
  return errors;
}

// ─── Form → row ───────────────────────────────────────────────────────────────

/**
 * The columns to save. Values kept in `details` are merged over what is
 * already there, so parts of a record this form does not edit are preserved.
 */
export function valuesToRow(values: FormValues, sections: FormSection[], existing: AdminRow | null): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const details: Record<string, unknown> = { ...(existing?.details ?? {}) };
  let hasDetails = false;

  for (const field of allFields(sections)) {
    const value = values[field.key];
    let stored: unknown;

    switch (field.type) {
      case 'boolean':
        stored = Boolean(value);
        break;
      case 'number': {
        const text = String(value).trim();
        stored = text ? Number(text) : isDetailKey(field.key) ? undefined : field.nullable ? null : 0;
        break;
      }
      case 'list':
        stored = lines(value);
        break;
      case 'gallery': {
        const before = (existing?.details?.[detailName(field.key)] ?? []) as { url: string; alt?: string; caption?: string }[];
        stored = lines(value).map((url, i) => {
          const kept = before.find((g) => g.url === url);
          return { id: `g${i + 1}`, url, alt: kept?.alt ?? String(values.name ?? ''), ...(kept?.caption ? { caption: kept.caption } : {}) };
        });
        break;
      }
      case 'routes':
        stored = (value as TransportRoute[]).map((r) => ({
          from: r.from.trim(),
          to: r.to.trim(),
          estimatedDuration: r.estimatedDuration.trim(),
          estimatedCost: { min: Number(r.estimatedCost.min), max: Number(r.estimatedCost.max) },
          ...(r.frequency?.trim() ? { frequency: r.frequency.trim() } : {}),
          ...(r.notes?.trim() ? { notes: r.notes.trim() } : {}),
        }));
        break;
      default:
        stored = String(value).trim();
    }

    if (isDetailKey(field.key)) {
      hasDetails = true;
      // An emptied optional value is removed, not stored as an empty string
      if (stored === undefined || stored === '') delete details[detailName(field.key)];
      else details[detailName(field.key)] = stored;
    } else {
      row[field.key] = stored;
    }
  }

  if (hasDetails) row.details = details;
  return row;
}
