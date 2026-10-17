import React, { useId, useRef, useState } from 'react';
import { ImageOff, Plus, Trash2, Upload } from 'lucide-react';
import type { Activity, TransportOption, TransportRoute } from '@/types';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { IMAGE_RULES, mediaApi, validateImageFile } from '@/services/adminApi';
import type { ContentTable } from '@/services/content/resources';
import { isRowsField } from './resourceForm';
import type { FieldDef, FormValue } from './resourceForm';

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#090C11] text-sm text-[#090C11] dark:text-white placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-[#FFD300] focus:border-transparent';
const borderFor = (error?: string) => (error ? 'border-red-500' : 'border-gray-200 dark:border-white/15');

interface FieldProps {
  field: FieldDef;
  value: FormValue;
  error?: string;
  onChange: (value: FormValue) => void;
  /** Which storage folder an uploaded image goes in */
  table: ContentTable;
}

// ─── Image: a link, a preview, and an upload button ───────────────────────────

const ImageInput: React.FC<FieldProps & { id: string; describedBy?: string }> = ({ value, error, onChange, table, id, describedBy }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const url = String(value);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const problem = validateImageFile(file);
    if (problem) {
      setUploadError(problem);
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    try {
      const uploaded = await mediaApi.uploadImage(file, table);
      // The picture this one replaces is no longer needed
      if (url && url !== uploaded) void mediaApi.removeImage(url);
      setPreviewFailed(false);
      onChange(uploaded);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'The upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <div className="flex gap-3">
      <div className="w-24 h-20 shrink-0 rounded-xl border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/5 overflow-hidden flex items-center justify-center">
        {url && !previewFailed ? (
          <img src={url} alt="" className="w-full h-full object-cover" onError={() => setPreviewFailed(true)} />
        ) : (
          <ImageOff size={20} className="text-muted/60" aria-label={url ? 'This image could not be loaded' : 'No image yet'} />
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <input
          id={id}
          type="url"
          value={url}
          onChange={(e) => {
            setPreviewFailed(false);
            onChange(e.target.value);
          }}
          placeholder="https://..."
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(inputClass, borderFor(error))}
        />
        <div className="flex flex-wrap items-center gap-2">
          {mediaApi.canUpload ? (
            <>
              <input
                ref={fileInput}
                type="file"
                accept={IMAGE_RULES.types.join(',')}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <Button type="button" variant="ghost" size="sm" isLoading={isUploading} onClick={() => fileInput.current?.click()}>
                <Upload size={14} />
                {isUploading ? 'Uploading...' : 'Upload a file'}
              </Button>
              <span className="text-xs text-muted">JPEG, PNG or WebP, up to 5 MB</span>
            </>
          ) : (
            <span className="text-xs text-muted">Paste an image link. File uploads are available once the database is connected.</span>
          )}
          {url && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              <Trash2 size={14} />
              Remove
            </Button>
          )}
        </div>
        {uploadError && (
          <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Transport routes ─────────────────────────────────────────────────────────

const EMPTY_ROUTE: TransportRoute = { from: '', to: '', estimatedDuration: '', estimatedCost: { min: 0, max: 0 }, frequency: '', notes: '' };

const RoutesInput: React.FC<{ value: TransportRoute[]; onChange: (routes: TransportRoute[]) => void }> = ({ value, onChange }) => {
  const update = (index: number, change: Partial<TransportRoute>) =>
    onChange(value.map((r, i) => (i === index ? { ...r, ...change } : r)));
  const small = cn(inputClass, borderFor(), 'py-2');

  return (
    <div className="space-y-3">
      {value.length === 0 && <p className="text-sm text-muted">No routes yet.</p>}
      {value.map((route, i) => (
        <fieldset key={i} className="rounded-xl border border-gray-200 dark:border-white/10 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <legend className="text-xs font-bold uppercase tracking-wide text-muted">Route {i + 1}</legend>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label={`Remove route ${i + 1}`}
              className="p-1 text-muted hover:text-red-500"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input className={small} value={route.from} onChange={(e) => update(i, { from: e.target.value })} placeholder="From (e.g. Accra)" aria-label={`Route ${i + 1} from`} />
            <input className={small} value={route.to} onChange={(e) => update(i, { to: e.target.value })} placeholder="To (e.g. Kumasi)" aria-label={`Route ${i + 1} to`} />
            <input className={small} value={route.estimatedDuration} onChange={(e) => update(i, { estimatedDuration: e.target.value })} placeholder="Travel time (e.g. 4-5 hours)" aria-label={`Route ${i + 1} travel time`} />
            <input className={small} value={route.frequency ?? ''} onChange={(e) => update(i, { frequency: e.target.value })} placeholder="How often (e.g. hourly)" aria-label={`Route ${i + 1} frequency`} />
            <input
              className={small}
              type="number"
              min={0}
              value={route.estimatedCost.min}
              onChange={(e) => update(i, { estimatedCost: { ...route.estimatedCost, min: e.target.valueAsNumber } })}
              aria-label={`Route ${i + 1} lowest fare in cedis`}
              placeholder="Lowest fare (GH₵)"
            />
            <input
              className={small}
              type="number"
              min={0}
              value={route.estimatedCost.max}
              onChange={(e) => update(i, { estimatedCost: { ...route.estimatedCost, max: e.target.valueAsNumber } })}
              aria-label={`Route ${i + 1} highest fare in cedis`}
              placeholder="Highest fare (GH₵)"
            />
            <input className={cn(small, 'sm:col-span-2')} value={route.notes ?? ''} onChange={(e) => update(i, { notes: e.target.value })} placeholder="Notes (terminal, pickup point, status...)" aria-label={`Route ${i + 1} notes`} />
          </div>
        </fieldset>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...value, { ...EMPTY_ROUTE, estimatedCost: { min: 0, max: 0 } }])}>
        <Plus size={14} />
        Add a route
      </Button>
    </div>
  );
};

// ─── Destination activities ───────────────────────────────────────────────────

const ActivitiesInput: React.FC<{ value: Activity[]; onChange: (activities: Activity[]) => void }> = ({ value, onChange }) => {
  const update = (index: number, change: Partial<Activity>) =>
    onChange(value.map((a, i) => (i === index ? { ...a, ...change } : a)));
  const small = cn(inputClass, borderFor(), 'py-2');

  return (
    <div className="space-y-3">
      {value.length === 0 && <p className="text-sm text-muted">No activities yet.</p>}
      {value.map((activity, i) => (
        <fieldset key={i} className="rounded-xl border border-gray-200 dark:border-white/10 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <legend className="text-xs font-bold uppercase tracking-wide text-muted">Activity {i + 1}</legend>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label={`Remove activity ${i + 1}`}
              className="p-1 text-muted hover:text-red-500"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <input className={cn(small, 'sm:col-span-2')} value={activity.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Name (e.g. Canopy Walkway)" aria-label={`Activity ${i + 1} name`} />
            <input className={small} value={activity.duration ?? ''} onChange={(e) => update(i, { duration: e.target.value })} placeholder="Time (e.g. 2 hours)" aria-label={`Activity ${i + 1} duration`} />
            <input
              className={small}
              type="number"
              min={0}
              value={Number.isFinite(activity.cost) ? activity.cost : ''}
              onChange={(e) => update(i, { cost: e.target.valueAsNumber })}
              placeholder="Price (GH₵)"
              aria-label={`Activity ${i + 1} price per person in cedis`}
            />
            <input className={cn(small, 'sm:col-span-4')} value={activity.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="What it involves, in a sentence" aria-label={`Activity ${i + 1} description`} />
          </div>
        </fieldset>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...value, { id: '', name: '', description: '', duration: '', cost: 0 }])}>
        <Plus size={14} />
        Add an activity
      </Button>
    </div>
  );
};

// ─── Ways of reaching a destination ───────────────────────────────────────────

const AccessInput: React.FC<{ value: TransportOption[]; onChange: (options: TransportOption[]) => void }> = ({ value, onChange }) => {
  const update = (index: number, change: Partial<TransportOption>) =>
    onChange(value.map((o, i) => (i === index ? { ...o, ...change } : o)));
  const small = cn(inputClass, borderFor(), 'py-2');

  return (
    <div className="space-y-3">
      {value.length === 0 && <p className="text-sm text-muted">No ways of getting there yet.</p>}
      {value.map((option, i) => (
        <fieldset key={i} className="rounded-xl border border-gray-200 dark:border-white/10 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <legend className="text-xs font-bold uppercase tracking-wide text-muted">Way {i + 1}</legend>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label={`Remove way ${i + 1}`}
              className="p-1 text-muted hover:text-red-500"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input className={small} value={option.type} onChange={(e) => update(i, { type: e.target.value })} placeholder="Kind (Bus, Trotro, Taxi...)" aria-label={`Way ${i + 1} kind of transport`} />
            <input className={small} value={option.estimatedCost ?? ''} onChange={(e) => update(i, { estimatedCost: e.target.value })} placeholder="Fare (e.g. ₵30–50)" aria-label={`Way ${i + 1} fare in cedis`} />
            <input className={small} value={option.duration ?? ''} onChange={(e) => update(i, { duration: e.target.value })} placeholder="Time (e.g. 3 hours)" aria-label={`Way ${i + 1} travel time`} />
            <input className={cn(small, 'sm:col-span-3')} value={option.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="Directions (e.g. STC or VIP bus from Accra (Tudu) to Cape Coast)" aria-label={`Way ${i + 1} directions`} />
          </div>
        </fieldset>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...value, { type: '', description: '', estimatedCost: '', duration: '' }])}>
        <Plus size={14} />
        Add a way of getting there
      </Button>
    </div>
  );
};

// ─── One labelled field ───────────────────────────────────────────────────────

export const ResourceField: React.FC<FieldProps> = (props) => {
  const { field, value, error, onChange } = props;
  const id = useId();
  const describedBy = error ? `${id}-error` : field.hint ? `${id}-hint` : undefined;
  const common = { id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy };

  let control: React.ReactNode;
  switch (field.type) {
    case 'boolean':
      return (
        <div className={cn(field.wide && 'sm:col-span-2')}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#FFD300]"
            />
            <span>
              <span className="text-sm font-semibold text-[#262B32] dark:text-white">{field.label}</span>
              {field.hint && <span className="block text-xs text-muted">{field.hint}</span>}
            </span>
          </label>
        </div>
      );
    case 'textarea':
    case 'list':
    case 'gallery':
      control = (
        <textarea
          {...common}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          rows={field.rows ?? (field.type === 'textarea' ? 4 : 3)}
          placeholder={field.placeholder}
          className={cn(inputClass, borderFor(error), 'resize-y')}
        />
      );
      break;
    case 'select':
      control = (
        <select {...common} value={String(value)} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, borderFor(error))}>
          <option value="">Choose...</option>
          {(field.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case 'image':
      control = <ImageInput {...props} id={id} describedBy={describedBy} />;
      break;
    case 'routes':
      control = <RoutesInput value={value as TransportRoute[]} onChange={onChange} />;
      break;
    case 'activities':
      control = <ActivitiesInput value={value as Activity[]} onChange={onChange} />;
      break;
    case 'access':
      control = <AccessInput value={value as TransportOption[]} onChange={onChange} />;
      break;
    default:
      control = (
        <input
          {...common}
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'url' ? 'url' : 'text'}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          min={field.min}
          max={field.max}
          step={field.type === 'number' ? 'any' : undefined}
          placeholder={field.placeholder}
          className={cn(inputClass, borderFor(error))}
        />
      );
  }

  const length = typeof value === 'string' ? value.trim().length : 0;

  return (
    <div className={cn(field.wide && 'sm:col-span-2')}>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <label htmlFor={isRowsField(field.type) ? undefined : id} className="text-sm font-semibold text-[#262B32] dark:text-white">
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
        {field.maxLength && field.type === 'textarea' && (
          <span className={cn('text-xs', length > field.maxLength ? 'text-red-600 font-semibold' : 'text-muted')}>
            {length}/{field.maxLength}
          </span>
        )}
      </div>
      {control}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : field.hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {field.hint}
        </p>
      ) : null}
    </div>
  );
};
