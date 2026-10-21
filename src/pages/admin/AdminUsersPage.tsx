import React, { useMemo, useState } from 'react';
import { Ban, CheckCircle2, ShieldCheck, ShieldOff } from 'lucide-react';
import { PagedTable, type TableColumn } from '@/components/admin/PagedTable';
import { AdminPageHeader, ConfirmDialog, StatusPill } from '@/components/admin/adminUi';
import { formatAdminDate } from '@/components/admin/adminFormat';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/useAuth';
import { useToast } from '@/context/useToast';
import { usePagedList } from '@/hooks/usePagedList';
import { usersApi, type AdminUser } from '@/services/adminApi';

type PendingAction =
  | { kind: 'suspend' | 'activate' | 'promote' | 'demote'; user: AdminUser }
  | null;

const ACTION_COPY = {
  suspend: {
    title: 'Suspend this account?',
    body: 'They will be signed out and unable to log in or change anything until the account is activated again. Their trips and budgets are kept.',
    confirm: 'Suspend account',
    done: 'Account suspended',
    danger: true,
  },
  activate: {
    title: 'Activate this account?',
    body: 'They will be able to log in and use their account again.',
    confirm: 'Activate account',
    done: 'Account activated',
    danger: false,
  },
  promote: {
    title: 'Make this person an administrator?',
    body: 'They will be able to change all content, moderate feedback and manage other accounts, including making more administrators.',
    confirm: 'Make administrator',
    done: 'Now an administrator',
    danger: true,
  },
  demote: {
    title: 'Remove administrator access?',
    body: 'They will keep their account but lose access to the admin area.',
    confirm: 'Remove access',
    done: 'Administrator access removed',
    danger: true,
  },
} as const;

const iconButton =
  'p-2 rounded-lg text-muted hover:bg-gray-100 dark:hover:bg-white/10 hover:text-[#090C11] dark:hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent';

export const AdminUsersPage: React.FC = () => {
  const { user: me } = useAuth();
  const { addToast } = useToast();
  const list = usePagedList<AdminUser>(usersApi.list, { initialSort: { column: 'created_at', ascending: false } });

  const [viewing, setViewing] = useState<AdminUser | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [isWorking, setIsWorking] = useState(false);

  const confirm = async () => {
    if (!pending) return;
    const { kind, user } = pending;
    setIsWorking(true);
    try {
      if (kind === 'suspend') await usersApi.setStatus(user.id, 'suspended');
      else if (kind === 'activate') await usersApi.setStatus(user.id, 'active');
      else await usersApi.setRole(user.id, kind === 'promote' ? 'admin' : 'user');
      addToast({ variant: 'success', title: ACTION_COPY[kind].done, message: user.email });
      list.reload();
    } catch (err) {
      addToast({ variant: 'error', title: 'That did not work', message: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setIsWorking(false);
      setPending(null);
    }
  };

  const columns = useMemo<TableColumn<AdminUser>[]>(
    () => [
      {
        key: 'user',
        header: 'Account',
        sortColumn: 'name',
        render: (user) => (
          <button type="button" onClick={() => setViewing(user)} className="flex items-center gap-3 text-left min-w-[12rem] group">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <span className="min-w-0">
              <span className="block font-semibold text-[#090C11] dark:text-white truncate group-hover:underline">
                {user.name}
                {user.id === me?.id && <span className="ml-1.5 text-xs font-normal text-muted">(you)</span>}
              </span>
              <span className="block text-xs text-muted truncate">{user.email}</span>
            </span>
          </button>
        ),
      },
      { key: 'role', header: 'Role', sortColumn: 'role', render: (user) => <StatusPill status={user.role} /> },
      { key: 'status', header: 'Status', sortColumn: 'status', render: (user) => <StatusPill status={user.status} /> },
      { key: 'trips', header: 'Trips', className: 'hidden md:table-cell', render: (user) => user.trips },
      { key: 'joined', header: 'Joined', sortColumn: 'created_at', className: 'hidden lg:table-cell whitespace-nowrap', render: (user) => formatAdminDate(user.createdAt) },
      {
        key: 'actions',
        header: 'Actions',
        className: 'text-right',
        render: (user) => {
          // Nobody changes their own role or status; the backend refuses it too
          const isSelf = user.id === me?.id;
          const suspended = user.status === 'suspended';
          const isAdmin = user.role === 'admin';
          return (
            <div className="flex items-center justify-end gap-0.5">
              <button
                type="button"
                disabled={isSelf}
                onClick={() => setPending({ kind: suspended ? 'activate' : 'suspend', user })}
                aria-label={suspended ? `Activate ${user.name}` : `Suspend ${user.name}`}
                title={isSelf ? 'You cannot change your own status' : suspended ? 'Activate account' : 'Suspend account'}
                className={iconButton}
              >
                {suspended ? <CheckCircle2 size={16} /> : <Ban size={16} />}
              </button>
              <button
                type="button"
                disabled={isSelf}
                onClick={() => setPending({ kind: isAdmin ? 'demote' : 'promote', user })}
                aria-label={isAdmin ? `Remove administrator access from ${user.name}` : `Make ${user.name} an administrator`}
                title={isSelf ? 'You cannot change your own role' : isAdmin ? 'Remove administrator access' : 'Make administrator'}
                className={iconButton}
              >
                {isAdmin ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
              </button>
            </div>
          );
        },
      },
    ],
    [me?.id],
  );

  const copy = pending ? ACTION_COPY[pending.kind] : null;

  return (
    <div>
      <AdminPageHeader title="Users" description="Everyone with an account. Suspend an account to block it, or change who can use the admin area." />

      <PagedTable
        list={list}
        columns={columns}
        rowKey={(user) => user.id}
        searchPlaceholder="Search by name or email..."
        noun="accounts"
        filters={[
          { key: 'role', label: 'Roles', options: [{ value: 'user', label: 'Users' }, { value: 'admin', label: 'Administrators' }] },
          { key: 'status', label: 'Statuses', options: [{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }] },
        ]}
      />

      <Modal isOpen={viewing !== null} onClose={() => setViewing(null)} title="Account" size="sm">
        {viewing && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar src={viewing.avatar} name={viewing.name} size="lg" />
              <div className="min-w-0">
                <p className="text-lg font-bold text-[#090C11] dark:text-white truncate">{viewing.name}</p>
                <p className="text-sm text-muted truncate">{viewing.email}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted mb-1">Role</dt>
                <dd><StatusPill status={viewing.role} /></dd>
              </div>
              <div>
                <dt className="text-xs text-muted mb-1">Status</dt>
                <dd><StatusPill status={viewing.status} /></dd>
              </div>
              <div>
                <dt className="text-xs text-muted mb-1">Joined</dt>
                <dd className="font-medium">{formatAdminDate(viewing.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted mb-1">Trips planned</dt>
                <dd className="font-medium">{viewing.trips}</dd>
              </div>
            </dl>
            <p className="text-xs text-muted">
              Administrators can see how many trips an account has, but not the trips or budgets themselves.
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={pending !== null}
        title={copy?.title ?? ''}
        message={
          <>
            <strong className="block mb-1 text-[#090C11] dark:text-white">
              {pending?.user.name} ({pending?.user.email})
            </strong>
            {copy?.body}
          </>
        }
        confirmLabel={copy?.confirm ?? 'Confirm'}
        danger={copy?.danger}
        isWorking={isWorking}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
};

export default AdminUsersPage;
