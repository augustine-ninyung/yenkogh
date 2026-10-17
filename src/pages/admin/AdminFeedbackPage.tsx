import React, { useMemo, useState } from 'react';
import { PagedTable, type TableColumn } from '@/components/admin/PagedTable';
import { AdminPageHeader, StatusPill } from '@/components/admin/adminUi';
import { formatAdminDate, formatAdminDateTime } from '@/components/admin/adminFormat';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';
import { usePagedList } from '@/hooks/usePagedList';
import { feedbackApi, type FeedbackItem, type FeedbackStatus } from '@/services/adminApi';

const STATUS_OPTIONS: { value: FeedbackStatus; label: string; meaning: string }[] = [
  { value: 'pending', label: 'Pending', meaning: 'Not looked at yet' },
  { value: 'reviewed', label: 'Reviewed', meaning: 'Read, no decision yet' },
  { value: 'approved', label: 'Approved', meaning: 'Accepted as correct or useful' },
  { value: 'resolved', label: 'Resolved', meaning: 'Acted on and finished' },
  { value: 'rejected', label: 'Rejected', meaning: 'Inappropriate or not valid' },
];

const KIND_OPTIONS = [
  { value: 'correction', label: 'Corrections' },
  { value: 'report', label: 'Reports' },
  { value: 'suggestion', label: 'Suggestions' },
  { value: 'review', label: 'Reviews' },
];

const NOTE_MAX = 1000;

export const AdminFeedbackPage: React.FC = () => {
  const { addToast } = useToast();
  const list = usePagedList<FeedbackItem>(feedbackApi.list, {
    initialSort: { column: 'created_at', ascending: false },
  });

  const [reviewing, setReviewing] = useState<FeedbackItem | null>(null);
  const [status, setStatus] = useState<FeedbackStatus>('pending');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const open = (item: FeedbackItem) => {
    setReviewing(item);
    setStatus(item.status);
    setNote(item.adminNote);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewing || note.trim().length > NOTE_MAX) return;
    setIsSaving(true);
    try {
      await feedbackApi.moderate(reviewing.id, status, note);
      addToast({ variant: 'success', title: 'Feedback updated', message: `Marked as ${status}.` });
      setReviewing(null);
      list.reload();
    } catch (err) {
      addToast({ variant: 'error', title: 'Could not save', message: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const columns = useMemo<TableColumn<FeedbackItem>[]>(
    () => [
      {
        key: 'message',
        header: 'Feedback',
        render: (item) => (
          <button type="button" onClick={() => open(item)} className="text-left min-w-[14rem] max-w-md group">
            <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
              {item.kind}
              {item.subjectName && <span className="normal-case font-normal"> · {item.subjectName}</span>}
            </span>
            <span className="block text-[#090C11] dark:text-white line-clamp-2 group-hover:underline">{item.message}</span>
          </button>
        ),
      },
      {
        key: 'from',
        header: 'From',
        className: 'hidden md:table-cell',
        render: (item) => (
          <div className="min-w-0">
            <p className="font-medium truncate">{item.userName}</p>
            <p className="text-xs text-muted truncate">{item.userEmail}</p>
          </div>
        ),
      },
      { key: 'sent', header: 'Sent', sortColumn: 'created_at', className: 'hidden lg:table-cell whitespace-nowrap', render: (item) => formatAdminDate(item.createdAt) },
      { key: 'status', header: 'Status', sortColumn: 'status', render: (item) => <StatusPill status={item.status} /> },
      {
        key: 'actions',
        header: 'Actions',
        className: 'text-right',
        render: (item) => (
          <Button variant="ghost" size="sm" onClick={() => open(item)} aria-label={`Review feedback from ${item.userName}`}>
            Review
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <AdminPageHeader
        title="Feedback"
        description="Corrections, reports and suggestions sent in by travellers. Nothing here is ever deleted: set a status and leave a note so there is a record of what was done."
      />

      <PagedTable
        list={list}
        columns={columns}
        rowKey={(item) => item.id}
        searchPlaceholder="Search feedback..."
        noun="submissions"
        filters={[
          { key: 'status', label: 'Statuses', options: STATUS_OPTIONS },
          { key: 'kind', label: 'Kinds', options: KIND_OPTIONS },
        ]}
      />

      <Modal isOpen={reviewing !== null} onClose={() => !isSaving && setReviewing(null)} title="Review feedback" size="lg">
        {reviewing && (
          <form onSubmit={save} className="space-y-5">
            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
              <p className="text-xs text-muted mb-2">
                <span className="font-semibold uppercase tracking-wide">{reviewing.kind}</span>
                {reviewing.subjectName && <> about <strong>{reviewing.subjectName}</strong></>} · from {reviewing.userName}
                {reviewing.userEmail && ` (${reviewing.userEmail})`} · {formatAdminDateTime(reviewing.createdAt)}
              </p>
              <p className="text-sm text-[#090C11] dark:text-white whitespace-pre-wrap break-words">{reviewing.message}</p>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold text-[#262B32] dark:text-white mb-2">Status</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                      status === option.value
                        ? 'border-[#FFD300] bg-[#FFD300]/10'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedback-status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={() => setStatus(option.value)}
                      className="mt-0.5 accent-[#FFD300]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className="block text-xs text-muted">{option.meaning}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label htmlFor="feedback-note" className="text-sm font-semibold text-[#262B32] dark:text-white">
                  Note
                </label>
                <span className={`text-xs ${note.trim().length > NOTE_MAX ? 'text-red-600 font-semibold' : 'text-muted'}`}>
                  {note.trim().length}/{NOTE_MAX}
                </span>
              </div>
              <textarea
                id="feedback-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="What was done about it, for the record."
                aria-invalid={note.trim().length > NOTE_MAX}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-[#090C11] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD300] resize-y"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <Button type="button" variant="ghost" onClick={() => setReviewing(null)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSaving} disabled={note.trim().length > NOTE_MAX} className="font-bold">
                Save
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminFeedbackPage;
