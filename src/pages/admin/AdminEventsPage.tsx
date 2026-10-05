import React from 'react';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { StatusDot } from '@/components/admin/adminUi';
import { EVENT_CATEGORY_OPTIONS, formatAdminDate, labelFromId, optionLabel } from '@/components/admin/adminFormat';
import type { ResourceConfig } from '@/components/admin/resourceForm';

/** Where an event sits relative to today. */
const timingOf = (start: string, end: string): 'upcoming' | 'ongoing' | 'past' => {
  const today = new Date().toISOString().slice(0, 10);
  return start > today ? 'upcoming' : end < today ? 'past' : 'ongoing';
};

const TIMING_TONE = { upcoming: 'blue', ongoing: 'green', past: 'grey' } as const;

const config: ResourceConfig = {
  table: 'events',
  singular: 'event',
  plural: 'events',
  title: 'Events',
  description: 'Dated happenings: this year\'s edition of a festival, a concert, a food fair. Each has its own dates, so a festival that moves every year gets a new event each time.',
  searchColumns: ['name', 'location', 'short_description'],
  searchPlaceholder: 'Search events by name or place...',
  defaultSort: { column: 'start_date', ascending: false },
  publishable: true,
  featurable: true,
  publicPath: (row) => `/events/${row.id}`,
  columns: [
    {
      key: 'name',
      header: 'Event',
      sortColumn: 'name',
      render: (row) => (
        <div className="min-w-[11rem]">
          <p className="font-semibold text-[#090C11] dark:text-white">{row.name}</p>
          <p className="text-xs text-[#757B81]">{String(row.location || '')}</p>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      sortColumn: 'start_date',
      render: (row) => {
        const timing = timingOf(String(row.start_date), String(row.end_date));
        return (
          <div className="whitespace-nowrap">
            <p>
              {formatAdminDate(String(row.start_date))}
              {row.end_date !== row.start_date && ` – ${formatAdminDate(String(row.end_date))}`}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#757B81] capitalize">
              <StatusDot tone={TIMING_TONE[timing]} />
              {timing}
            </span>
          </div>
        );
      },
    },
    { key: 'region', header: 'Region', sortColumn: 'region_id', className: 'hidden md:table-cell', render: (row) => labelFromId(String(row.region_id)) },
    { key: 'category', header: 'Category', sortColumn: 'category', className: 'hidden lg:table-cell', render: (row) => optionLabel(EVENT_CATEGORY_OPTIONS, row.category) },
  ],
  filters: [
    { key: 'region_id', label: 'Regions', optionsFrom: 'regions' },
    { key: 'category', label: 'Categories', options: EVENT_CATEGORY_OPTIONS },
    {
      key: 'timing',
      label: 'Dates',
      options: [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'ongoing', label: 'Happening now' },
        { value: 'past', label: 'Past' },
      ],
    },
  ],
  defaults: { is_free: true },
  validate: (values) => {
    const errors: Record<string, string> = {};
    if (values.start_date && values.end_date && String(values.end_date) < String(values.start_date)) {
      errors.end_date = 'The end date cannot be before the start date.';
    }
    if (!values.is_free && !(Number(values.ticket_price) > 0)) {
      errors.ticket_price = 'Enter a ticket price, or tick "Free to attend".';
    }
    return errors;
  },
  // A free event has no price to keep
  prepare: (row) => (row.is_free ? { ...row, ticket_price: null } : row),
  sections: [
    {
      title: 'Basics',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, maxLength: 120 },
        { key: 'slug', label: 'Slug', type: 'text', required: true, maxLength: 120, hint: 'Filled in from the name. Include the year, e.g. homowo-festival-2027.' },
        { key: 'category', label: 'Category', type: 'select', required: true, options: EVENT_CATEGORY_OPTIONS },
        { key: 'region_id', label: 'Region', type: 'select', required: true, optionsFrom: 'regions' },
        { key: 'location', label: 'Town or city', type: 'text', required: true, maxLength: 120 },
        { key: 'details.venue', label: 'Venue', type: 'text', maxLength: 160 },
      ],
    },
    {
      title: 'Dates and tickets',
      fields: [
        { key: 'start_date', label: 'Start date', type: 'date', required: true },
        { key: 'end_date', label: 'End date', type: 'date', required: true, hint: 'The same as the start date for a one-day event.' },
        { key: 'is_free', label: 'Free to attend', type: 'boolean' },
        { key: 'ticket_price', label: 'Ticket price (GH₵)', type: 'number', min: 0, nullable: true },
      ],
    },
    {
      title: 'Details',
      fields: [
        { key: 'short_description', label: 'Short description', type: 'textarea', maxLength: 300, rows: 2, wide: true },
        { key: 'description', label: 'Full description', type: 'textarea', maxLength: 5000, rows: 6, wide: true },
        { key: 'image_url', label: 'Photo', type: 'image', wide: true },
        { key: 'details.activities', label: 'Highlights and programme', type: 'list', wide: true, rows: 4, hint: 'One per line.' },
        { key: 'details.transportInfo', label: 'Getting there', type: 'textarea', maxLength: 1000, rows: 2, wide: true },
        { key: 'details.website', label: 'Website', type: 'url' },
        { key: 'details.tags', label: 'Tags', type: 'list', rows: 2, hint: 'One per line.' },
      ],
    },
  ],
};

export const AdminEventsPage: React.FC = () => <ResourceManager config={config} />;

export default AdminEventsPage;
