import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Archive, ArchiveRestore, ExternalLink, Eye, EyeOff, Pencil, Plus, Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/useToast';
import { usePagedList } from '@/hooks/usePagedList';
import { ApiError, contentApi, type ListParams } from '@/services/adminApi';
import { slugify, type ContentStatus } from '@/services/content/resources';
import { AdminPageHeader, ConfirmDialog, StatusPill } from './adminUi';
import { PagedTable, type TableColumn, type TableFilter } from './PagedTable';
import { ResourceField } from './ResourceFormFields';
import {
  rowToValues,
  validateForm,
  valuesToRow,
  type AdminRow,
  type FieldDef,
  type FormErrors,
  type FormValue,
  type FormValues,
  type ResourceConfig,
} from './resourceForm';

type Option = { value: string; label: string };

const STATUS_FILTER: TableFilter = {
  key: 'status',
  label: 'Statuses',
  options: [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
  ],
};

const iconButton =
  'p-2 rounded-lg text-muted hover:bg-gray-100 dark:hover:bg-white/10 hover:text-[#090C11] dark:hover:text-white transition-colors disabled:opacity-40';

// ─── ResourceManager ──────────────────────────────────────────────────────────
// The whole admin screen for one kind of content, driven by a ResourceConfig:
// a searchable, sortable, paged list, plus adding, editing, publishing,
// featuring and archiving.

export const ResourceManager: React.FC<{ config: ResourceConfig }> = ({ config }) => {
  const { addToast } = useToast();
  const [regionOptions, setRegionOptions] = useState<Option[]>([]);

  const fetchPage = useCallback(
    (params: ListParams) => contentApi.list(config.table, params, config.searchColumns) as unknown as Promise<{ rows: AdminRow[]; total: number }>,
    [config.table, config.searchColumns],
  );
  // The Regions screen links here with ?region=<id> to show one region's records
  const [searchParams] = useSearchParams();
  const regionParam = searchParams.get('region');
  const hasRegionFilter = config.filters.some((f) => f.key === 'region_id');
  const list = usePagedList<AdminRow>(fetchPage, {
    initialSort: config.defaultSort,
    initialFilters: regionParam && hasRegionFilter ? { region_id: regionParam } : undefined,
  });

  // Region pickers list what is in the database, not a copy kept in the app
  useEffect(() => {
    let cancelled = false;
    contentApi
      .list('regions', { page: 1, pageSize: 100, sort: { column: 'name', ascending: true } }, [])
      .then((page) => {
        if (!cancelled) setRegionOptions(page.rows.map((r) => ({ value: r.id, label: r.name })));
      })
      .catch(() => {
        // The list's own error state covers a backend that cannot be reached
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sections = useMemo(
    () =>
      config.sections.map((section) => ({
        ...section,
        fields: section.fields.map((f): FieldDef => (f.optionsFrom === 'regions' ? { ...f, options: regionOptions } : f)),
      })),
    [config.sections, regionOptions],
  );

  const filters = useMemo<TableFilter[]>(
    () => [
      ...config.filters.map((f) => ('optionsFrom' in f ? { key: f.key, label: f.label, options: regionOptions } : f)),
      ...(config.publishable ? [STATUS_FILTER] : []),
    ],
    [config.filters, config.publishable, regionOptions],
  );

  // ── Form ──
  const [editing, setEditing] = useState<AdminRow | 'new' | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // Until the slug is typed into, it follows the name
  const slugEdited = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const openForm = (row: AdminRow | 'new') => {
    setEditing(row);
    setValues(rowToValues(row === 'new' ? null : row, sections, config.defaults));
    setErrors({});
    setFormError(null);
    slugEdited.current = row !== 'new';
  };

  const setValue = (key: string, value: FormValue) => {
    if (key === 'slug') slugEdited.current = true;
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && 'slug' in prev && !slugEdited.current) next.slug = slugify(String(value));
      return next;
    });
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const showErrors = (found: FormErrors) => {
    setErrors(found);
    // Bring the first problem into view so nobody has to hunt for it
    requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateForm(values, { sections, validate: config.validate });
    if (Object.keys(found).length > 0) {
      showErrors(found);
      return;
    }

    const isNew = editing === 'new';
    let row = valuesToRow(values, sections, isNew ? null : (editing as AdminRow));
    if (config.prepare) row = config.prepare(row);

    setIsSaving(true);
    setFormError(null);
    try {
      if (isNew) {
        const id = slugify(String(row.slug || row.name));
        if (!id) {
          showErrors({ name: 'The name needs at least one letter or number.' });
          return;
        }
        await contentApi.create(config.table, {
          ...row,
          id,
          name: String(row.name),
          ...(config.publishable ? { status: 'draft' as ContentStatus } : {}),
        } as never);
      } else {
        await contentApi.update(config.table, (editing as AdminRow).id, row as never);
      }
      addToast({
        variant: 'success',
        title: isNew ? `${capitalize(config.singular)} added` : 'Changes saved',
        message: isNew && config.publishable ? `"${row.name}" was saved as a draft. Publish it when it is ready.` : `"${row.name}" has been saved.`,
      });
      setEditing(null);
      list.reload();
    } catch (err) {
      if (err instanceof ApiError && err.field && err.field in values) showErrors({ [err.field]: err.message });
      else setFormError(err instanceof Error ? err.message : 'Could not save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Row actions ──
  const [busyId, setBusyId] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<AdminRow | null>(null);

  const change = async (row: AdminRow, patch: Record<string, unknown>, done: string) => {
    setBusyId(row.id);
    try {
      await contentApi.update(config.table, row.id, patch as never);
      addToast({ variant: 'success', title: done, message: `"${row.name}"` });
      list.reload();
    } catch (err) {
      addToast({ variant: 'error', title: 'That did not work', message: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setBusyId(null);
      setArchiving(null);
    }
  };

  const columns = useMemo<TableColumn<AdminRow>[]>(
    () => [
      ...config.columns,
      ...(config.publishable
        ? [{ key: 'status', header: 'Status', sortColumn: 'status', render: (row: AdminRow) => <StatusPill status={row.status ?? 'draft'} /> }]
        : []),
      {
        key: 'actions',
        header: 'Actions',
        className: 'text-right',
        render: (row: AdminRow) => {
          const busy = busyId === row.id;
          const archived = row.status === 'archived';
          const isPublished = row.status === 'published';
          return (
            <div className="flex items-center justify-end gap-0.5">
              {config.publicPath && isPublished && (
                <Link to={config.publicPath(row)} target="_blank" className={iconButton} aria-label={`View ${row.name} on the site`} title="View on the site">
                  <ExternalLink size={16} />
                </Link>
              )}
              {config.featurable && !archived && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => change(row, { featured: !row.featured }, row.featured ? 'No longer featured' : 'Featured')}
                  aria-label={row.featured ? `Stop featuring ${row.name}` : `Feature ${row.name}`}
                  aria-pressed={Boolean(row.featured)}
                  title={row.featured ? 'Stop featuring' : 'Feature'}
                  className={iconButton}
                >
                  <Star size={16} className={cn(row.featured && 'fill-[#FFD300] text-[#FFD300]')} />
                </button>
              )}
              {config.publishable && !archived && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => change(row, { status: isPublished ? 'draft' : 'published' }, isPublished ? 'Unpublished' : 'Published')}
                  aria-label={isPublished ? `Unpublish ${row.name}` : `Publish ${row.name}`}
                  title={isPublished ? 'Unpublish (back to draft)' : 'Publish'}
                  className={iconButton}
                >
                  {isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
              <button type="button" disabled={busy} onClick={() => openForm(row)} aria-label={`Edit ${row.name}`} title="Edit" className={iconButton}>
                <Pencil size={16} />
              </button>
              {config.publishable &&
                (archived ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => change(row, { status: 'draft' }, 'Restored as a draft')}
                    aria-label={`Restore ${row.name}`}
                    title="Restore"
                    className={iconButton}
                  >
                    <ArchiveRestore size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setArchiving(row)}
                    aria-label={`Archive ${row.name}`}
                    title="Archive"
                    className={cn(iconButton, 'hover:text-red-600 dark:hover:text-red-400')}
                  >
                    <Archive size={16} />
                  </button>
                ))}
            </div>
          );
        },
      },
    ],
    // openForm and change are recreated each render but only read current state when called
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, busyId, sections],
  );

  const isNew = editing === 'new';

  return (
    <div>
      <AdminPageHeader
        title={config.title}
        description={config.description}
        action={
          <Button variant="primary" size="sm" className="font-bold" onClick={() => openForm('new')}>
            <Plus size={16} />
            Add {config.singular}
          </Button>
        }
      />

      <PagedTable
        list={list}
        columns={columns}
        rowKey={(row) => row.id}
        filters={filters}
        searchPlaceholder={config.searchPlaceholder}
        noun={config.plural}
      />

      <Modal
        isOpen={editing !== null}
        onClose={() => !isSaving && setEditing(null)}
        title={isNew ? `Add ${config.singular}` : `Edit ${config.singular}`}
        size="xl"
      >
        <form ref={formRef} onSubmit={handleSave} noValidate className="space-y-6">
          {formError && (
            <div role="alert" className="p-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/15 text-sm text-red-800 dark:text-red-200">
              {formError}
            </div>
          )}

          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted mb-3">{section.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <ResourceField
                    key={field.key}
                    field={field}
                    value={values[field.key] ?? ''}
                    error={errors[field.key]}
                    onChange={(value) => setValue(field.key, value)}
                    table={config.table}
                  />
                ))}
              </div>
            </section>
          ))}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
            <p className="text-xs text-muted">
              {isNew && config.publishable ? 'New records are saved as drafts and are not on the site until published.' : 'Fields marked * are required.'}
            </p>
            <div className="flex gap-2.5">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSaving} className="font-bold">
                {isNew ? `Add ${config.singular}` : 'Save changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={archiving !== null}
        title={`Archive this ${config.singular}?`}
        message={
          <>
            <strong className="text-[#090C11] dark:text-white">{archiving?.name}</strong> will be taken off the site. Nothing is deleted: you can restore it at any time from the Archived filter.
          </>
        }
        confirmLabel="Archive"
        danger
        isWorking={busyId === archiving?.id}
        onConfirm={() => archiving && change(archiving, { status: 'archived' }, 'Archived')}
        onCancel={() => setArchiving(null)}
      />
    </div>
  );
};

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export default ResourceManager;
