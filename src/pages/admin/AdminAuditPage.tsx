import React, { useMemo } from 'react';
import { PagedTable, type TableColumn } from '@/components/admin/PagedTable';
import { AdminPageHeader } from '@/components/admin/adminUi';
import { formatAdminDateTime, labelFromId } from '@/components/admin/adminFormat';
import { usePagedList } from '@/hooks/usePagedList';
import { auditApi, type AuditEntry } from '@/services/adminApi';

const RESOURCE_OPTIONS = [
  { value: 'destinations', label: 'Destinations' },
  { value: 'events', label: 'Events' },
  { value: 'festivals', label: 'Festivals' },
  { value: 'regions', label: 'Regions' },
  { value: 'transport_options', label: 'Transportation' },
  { value: 'profiles', label: 'Accounts' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'session', label: 'Admin logins' },
];

const ACTION_OPTIONS = [
  'created', 'updated', 'published', 'unpublished', 'featured', 'unfeatured', 'archived', 'restored',
  'suspended', 'activated', 'role_changed', 'moderated', 'admin_login',
].map((value) => ({ value, label: labelFromId(value) }));

/** "from draft to published" for changes that record a before and after. */
const changeDetail = (metadata: Record<string, unknown>): string =>
  metadata.from !== undefined && metadata.to !== undefined ? `${String(metadata.from)} → ${String(metadata.to)}` : '';

export const AdminAuditPage: React.FC = () => {
  const list = usePagedList<AuditEntry>(auditApi.list, {
    pageSize: 20,
    initialSort: { column: 'created_at', ascending: false },
  });

  const columns = useMemo<TableColumn<AuditEntry>[]>(
    () => [
      { key: 'when', header: 'When', sortColumn: 'created_at', className: 'whitespace-nowrap', render: (entry) => formatAdminDateTime(entry.createdAt) },
      { key: 'who', header: 'Who', sortColumn: 'actor_email', className: 'hidden md:table-cell', render: (entry) => entry.actorEmail || '—' },
      {
        key: 'action',
        header: 'Action',
        sortColumn: 'action',
        render: (entry) => <span className="font-semibold text-[#090C11] dark:text-white">{labelFromId(entry.action)}</span>,
      },
      {
        key: 'what',
        header: 'What',
        render: (entry) => (
          <div className="min-w-[10rem]">
            <p className="text-xs text-[#757B81]">{RESOURCE_OPTIONS.find((r) => r.value === entry.resource)?.label ?? entry.resource}</p>
            <p className="line-clamp-1">{entry.summary || entry.resourceId || '—'}</p>
            {changeDetail(entry.metadata) && <p className="text-xs text-[#757B81]">{changeDetail(entry.metadata)}</p>}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <AdminPageHeader
        title="Audit log"
        description="A record of what administrators have done. Entries are written by the database itself and cannot be edited or removed."
      />
      <PagedTable
        list={list}
        columns={columns}
        rowKey={(entry) => entry.id}
        searchPlaceholder="Search by record or administrator..."
        noun="entries"
        filters={[
          { key: 'resource', label: 'Areas', options: RESOURCE_OPTIONS },
          { key: 'action', label: 'Actions', options: ACTION_OPTIONS },
        ]}
      />
    </div>
  );
};

export default AdminAuditPage;
