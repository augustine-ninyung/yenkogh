import React from 'react';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { StatusDot } from '@/components/admin/adminUi';
import { COMPLETENESS_OPTIONS, FESTIVAL_CATEGORY_OPTIONS, labelFromId, optionLabel } from '@/components/admin/adminFormat';
import type { ResourceConfig } from '@/components/admin/resourceForm';

const COMPLETENESS_TONE: Record<string, 'green' | 'blue' | 'amber'> = { detailed: 'green', basic: 'blue', 'name-only': 'amber' };

const config: ResourceConfig = {
  table: 'festivals',
  singular: 'festival',
  plural: 'festivals',
  title: 'Festivals',
  description: 'The catalogue of traditional festivals. These recur every year but rarely on a fixed date, so record the usual month here and add an Event for a specific year\'s dates.',
  searchColumns: ['name', 'town', 'ethnic_group'],
  searchPlaceholder: 'Search festivals by name, town or people...',
  defaultSort: { column: 'name', ascending: true },
  publishable: true,
  featurable: false,
  publicPath: (row) => `/festivals/${row.id}`,
  columns: [
    {
      key: 'name',
      header: 'Festival',
      sortColumn: 'name',
      render: (row) => (
        <div className="min-w-[11rem]">
          <p className="font-semibold text-[#090C11] dark:text-white">{row.name}</p>
          <p className="text-xs text-muted">{String(row.town || '')}</p>
        </div>
      ),
    },
    { key: 'region', header: 'Region', sortColumn: 'region_id', render: (row) => labelFromId(String(row.region_id)) },
    { key: 'category', header: 'Category', sortColumn: 'category', className: 'hidden md:table-cell', render: (row) => optionLabel(FESTIVAL_CATEGORY_OPTIONS, row.category) },
    { key: 'month', header: 'Usual month', sortColumn: 'month', className: 'hidden lg:table-cell', render: (row) => String(row.month || '—') },
    {
      key: 'completeness',
      header: 'Detail',
      sortColumn: 'completeness',
      className: 'hidden xl:table-cell',
      render: (row) => (
        <span className="inline-flex items-center gap-2">
          <StatusDot tone={COMPLETENESS_TONE[String(row.completeness)] ?? 'amber'} />
          {optionLabel(COMPLETENESS_OPTIONS, row.completeness)}
        </span>
      ),
    },
  ],
  filters: [
    { key: 'region_id', label: 'Regions', optionsFrom: 'regions' },
    { key: 'category', label: 'Categories', options: FESTIVAL_CATEGORY_OPTIONS },
    { key: 'completeness', label: 'Detail levels', options: COMPLETENESS_OPTIONS },
  ],
  defaults: { completeness: 'basic' },
  sections: [
    {
      title: 'Basics',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, maxLength: 120 },
        { key: 'category', label: 'Category', type: 'select', required: true, options: FESTIVAL_CATEGORY_OPTIONS },
        { key: 'region_id', label: 'Main region', type: 'select', required: true, optionsFrom: 'regions' },
        { key: 'town', label: 'Town', type: 'text', maxLength: 160 },
        { key: 'details.traditionalArea', label: 'Traditional area', type: 'text', maxLength: 160 },
        { key: 'ethnic_group', label: 'People', type: 'text', maxLength: 120 },
        { key: 'details.alternateNames', label: 'Other names', type: 'list', rows: 2, hint: 'One per line.' },
        { key: 'details.otherRegions', label: 'Also celebrated in', type: 'list', rows: 2, hint: 'Region names, one per line.' },
      ],
    },
    {
      title: 'When',
      fields: [
        { key: 'month', label: 'Usual month', type: 'text', maxLength: 120, placeholder: 'e.g. August – September', hint: 'Leave empty if it follows a lunar calendar or is not known.' },
        { key: 'details.usualDate', label: 'Usual date', type: 'text', maxLength: 200, placeholder: 'e.g. First Saturday in May' },
        { key: 'details.duration', label: 'How long it lasts', type: 'text', maxLength: 200, wide: true },
      ],
    },
    {
      title: 'About',
      fields: [
        { key: 'description', label: 'Description', type: 'textarea', maxLength: 5000, rows: 4, wide: true },
        { key: 'details.historicalSignificance', label: 'History', type: 'textarea', maxLength: 3000, rows: 4, wide: true },
        { key: 'details.culturalSignificance', label: 'Cultural significance', type: 'textarea', maxLength: 3000, rows: 4, wide: true },
        { key: 'details.activities', label: 'What happens', type: 'list', wide: true, rows: 4, hint: 'One per line.' },
        { key: 'details.attractionsNearby', label: 'Nearby attractions', type: 'list', wide: true, rows: 3, hint: 'One per line.' },
      ],
    },
    {
      title: 'Photo and sources',
      fields: [
        { key: 'image_url', label: 'Photo', type: 'image', wide: true },
        { key: 'details.imageCredit', label: 'Photo credit link', type: 'url', hint: 'The page that names the photographer and licence.' },
        { key: 'completeness', label: 'Level of detail', type: 'select', required: true, options: COMPLETENESS_OPTIONS },
        { key: 'details.sources', label: 'Sources', type: 'list', wide: true, rows: 3, hint: 'Links this information came from, one per line.' },
        { key: 'details.notes', label: 'Internal notes', type: 'textarea', maxLength: 2000, rows: 2, wide: true, hint: 'Not shown on the site.' },
      ],
    },
  ],
};

export const AdminFestivalsPage: React.FC = () => <ResourceManager config={config} />;

export default AdminFestivalsPage;
