import React from 'react';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { DESTINATION_TYPE_OPTIONS, formatAdminDate, labelFromId, optionLabel } from '@/components/admin/adminFormat';
import type { ResourceConfig } from '@/components/admin/resourceForm';
import { formatCurrency } from '@/utils/formatters';

const config: ResourceConfig = {
  table: 'destinations',
  singular: 'destination',
  plural: 'destinations',
  title: 'Destinations',
  description: 'The places travellers can explore. Published destinations appear on the Explore page.',
  searchColumns: ['name', 'slug', 'short_description'],
  searchPlaceholder: 'Search destinations by name...',
  defaultSort: { column: 'name', ascending: true },
  publishable: true,
  featurable: true,
  publicPath: (row) => `/explore/${row.slug}`,
  columns: [
    {
      key: 'name',
      header: 'Destination',
      sortColumn: 'name',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-[12rem]">
          {row.image_url ? (
            <img src={String(row.image_url)} alt="" loading="lazy" className="w-11 h-11 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-white/5" />
          ) : (
            <div className="w-11 h-11 rounded-lg shrink-0 bg-gray-100 dark:bg-white/5" />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-[#090C11] dark:text-white truncate">{row.name}</p>
            <p className="text-xs text-muted truncate">/{String(row.slug)}</p>
          </div>
        </div>
      ),
    },
    { key: 'region', header: 'Region', sortColumn: 'region_id', className: 'hidden md:table-cell', render: (row) => labelFromId(String(row.region_id)) },
    { key: 'type', header: 'Category', sortColumn: 'type', className: 'hidden lg:table-cell', render: (row) => optionLabel(DESTINATION_TYPE_OPTIONS, row.type) },
    { key: 'cost', header: 'Typical cost', sortColumn: 'estimated_cost', className: 'hidden lg:table-cell', render: (row) => formatCurrency(Number(row.estimated_cost)) },
    { key: 'updated', header: 'Updated', sortColumn: 'updated_at', className: 'hidden xl:table-cell whitespace-nowrap', render: (row) => formatAdminDate(row.updated_at) },
  ],
  filters: [
    { key: 'region_id', label: 'Regions', optionsFrom: 'regions' },
    { key: 'type', label: 'Categories', options: DESTINATION_TYPE_OPTIONS },
  ],
  defaults: {},
  sections: [
    {
      title: 'Basics',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, maxLength: 120 },
        { key: 'slug', label: 'Slug', type: 'text', required: true, maxLength: 120, hint: 'The end of its web address. Filled in from the name.' },
        { key: 'region_id', label: 'Region', type: 'select', required: true, optionsFrom: 'regions' },
        { key: 'type', label: 'Category', type: 'select', required: true, options: DESTINATION_TYPE_OPTIONS },
        { key: 'short_description', label: 'Short description', type: 'textarea', maxLength: 300, rows: 2, wide: true, hint: 'One or two sentences, shown on cards.' },
        { key: 'description', label: 'Full description', type: 'textarea', maxLength: 5000, rows: 6, wide: true },
      ],
    },
    {
      title: 'Photos',
      fields: [
        { key: 'image_url', label: 'Main photo', type: 'image', wide: true },
        { key: 'details.imageCredit', label: 'Photo credit link', type: 'text', maxLength: 300, wide: true, hint: 'For photos that must be credited, such as Wikimedia Commons: the page that names the author and licence.' },
        { key: 'details.gallery', label: 'Gallery', type: 'gallery', wide: true, rows: 3, hint: 'One image link per line.' },
      ],
    },
    {
      title: 'Visiting',
      fields: [
        { key: 'details.openingHours', label: 'Opening hours', type: 'text', maxLength: 120, placeholder: 'e.g. 9:00 AM to 4:30 PM daily' },
        { key: 'details.bestTimeToVisit', label: 'Best time to visit', type: 'text', maxLength: 160 },
        { key: 'details.entryFee', label: 'Entry fee (GH₵)', type: 'number', min: 0 },
        { key: 'estimated_cost', label: 'Typical cost per person (GH₵)', type: 'number', min: 0, hint: 'Used by the trip planner and budget.' },
        { key: 'details.latitude', label: 'Latitude', type: 'number', min: -90, max: 90 },
        { key: 'details.longitude', label: 'Longitude', type: 'number', min: -180, max: 180 },
        { key: 'details.safetyInfo', label: 'Safety information', type: 'textarea', maxLength: 1000, rows: 3, wide: true },
        { key: 'details.thingsToDo', label: 'Things to do', type: 'list', wide: true, rows: 4, hint: 'One per line.' },
        { key: 'details.tags', label: 'Tags', type: 'list', wide: true, rows: 2, hint: 'One per line. Used by search.' },
      ],
    },
    {
      title: 'Activities and prices',
      fields: [
        { key: 'details.activities', label: 'What visitors can do here', type: 'activities', wide: true, hint: 'The trip planner builds each day from these and uses these prices. Price is per person; use 0 if it is free.' },
      ],
    },
    {
      title: 'Getting there',
      fields: [
        { key: 'details.transportOptions', label: 'Ways of reaching this place', type: 'access', wide: true, hint: 'Say where each one starts, e.g. "from Accra". The trip planner uses these for travel legs; leave the fare empty if it is not known.' },
      ],
    },
  ],
};

export const AdminDestinationsPage: React.FC = () => <ResourceManager config={config} />;

export default AdminDestinationsPage;
