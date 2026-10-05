import React from 'react';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { TRANSPORT_TYPE_OPTIONS, formatAdminDate, optionLabel } from '@/components/admin/adminFormat';
import type { ResourceConfig } from '@/components/admin/resourceForm';

const listLength = (value: unknown) => (Array.isArray(value) ? value.length : 0);

const config: ResourceConfig = {
  table: 'transport_options',
  singular: 'transport option',
  plural: 'transport options',
  title: 'Transportation',
  description: 'Ways of getting around, with their providers and routes. Each route carries a fare range and travel time for the Transportation guide, the trip planner and budgets.',
  searchColumns: ['name', 'description'],
  searchPlaceholder: 'Search transport options...',
  defaultSort: { column: 'name', ascending: true },
  publishable: true,
  featurable: false,
  columns: [
    {
      key: 'name',
      header: 'Option',
      sortColumn: 'name',
      render: (row) => <p className="font-semibold text-[#090C11] dark:text-white min-w-[10rem]">{row.name}</p>,
    },
    { key: 'type', header: 'Type', sortColumn: 'type', render: (row) => optionLabel(TRANSPORT_TYPE_OPTIONS, row.type) },
    { key: 'routes', header: 'Routes', className: 'hidden md:table-cell', render: (row) => listLength(row.details?.routes) },
    { key: 'providers', header: 'Providers', className: 'hidden lg:table-cell', render: (row) => listLength(row.details?.providers) },
    { key: 'updated', header: 'Updated', sortColumn: 'updated_at', className: 'hidden lg:table-cell whitespace-nowrap', render: (row) => formatAdminDate(row.updated_at) },
  ],
  filters: [{ key: 'type', label: 'Types', options: TRANSPORT_TYPE_OPTIONS }],
  defaults: {},
  sections: [
    {
      title: 'Basics',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, maxLength: 120, placeholder: 'e.g. Intercity Bus (STC / VIP)' },
        { key: 'type', label: 'Type', type: 'select', required: true, options: TRANSPORT_TYPE_OPTIONS },
        { key: 'description', label: 'Description', type: 'textarea', maxLength: 5000, rows: 4, wide: true },
        { key: 'image_url', label: 'Photo', type: 'image', wide: true },
      ],
    },
    {
      title: 'Providers and booking',
      fields: [
        { key: 'details.providers', label: 'Providers', type: 'list', rows: 3, hint: 'One per line.' },
        { key: 'details.bookingInfo', label: 'Booking, hours and contacts', type: 'textarea', maxLength: 1000, rows: 3 },
      ],
    },
    {
      title: 'Routes',
      fields: [{ key: 'details.routes', label: 'Routes, fares and travel times', type: 'routes', wide: true }],
    },
    {
      title: 'Advice for travellers',
      fields: [
        { key: 'details.safetyTips', label: 'Safety tips', type: 'list', wide: true, rows: 3, hint: 'One per line.' },
        { key: 'details.pros', label: 'Good for', type: 'list', rows: 3, hint: 'One per line.' },
        { key: 'details.cons', label: 'Drawbacks', type: 'list', rows: 3, hint: 'One per line.' },
      ],
    },
  ],
};

export const AdminTransportPage: React.FC = () => <ResourceManager config={config} />;

export default AdminTransportPage;
