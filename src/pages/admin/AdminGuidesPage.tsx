import React from 'react';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { formatAdminDate } from '@/components/admin/adminFormat';
import type { FormErrors, ResourceConfig } from '@/components/admin/resourceForm';
import { mailLink, telLink } from '@/utils/contactLinks';

const config: ResourceConfig = {
  table: 'tour_guides',
  singular: 'tour guide',
  plural: 'tour guides',
  title: 'Tour guides',
  description:
    'Licensed guides listed on the public Tour guides page. A guide can only be published once their licence is verified and they have agreed to be listed.',
  searchColumns: ['name', 'licence_number'],
  searchPlaceholder: 'Search by name or licence number...',
  defaultSort: { column: 'name', ascending: true },
  publishable: true,
  featurable: false,
  publicPath: () => '/guides',
  columns: [
    {
      key: 'name',
      header: 'Guide',
      sortColumn: 'name',
      render: (row) => <p className="font-semibold text-[#090C11] dark:text-white min-w-[10rem]">{row.name}</p>,
    },
    { key: 'licence', header: 'Licence', sortColumn: 'licence_number', className: 'hidden md:table-cell', render: (row) => String(row.licence_number || 'Not recorded') },
    {
      key: 'verified',
      header: 'Verified',
      sortColumn: 'verified_on',
      className: 'hidden md:table-cell whitespace-nowrap',
      render: (row) => (row.verified && row.verified_on ? formatAdminDate(String(row.verified_on)) : 'Not yet'),
    },
  ],
  filters: [{ key: 'region_id', label: 'Regions', optionsFrom: 'regions' }],
  defaults: { verified: false, consent_confirmed: false },
  sections: [
    {
      title: 'The guide',
      fields: [
        { key: 'name', label: 'Full name', type: 'text', required: true, maxLength: 120 },
        { key: 'region_id', label: 'Main region', type: 'select', required: true, optionsFrom: 'regions' },
        { key: 'description', label: 'Short bio', type: 'textarea', maxLength: 1000, rows: 3, wide: true },
        { key: 'details.languages', label: 'Languages', type: 'list', rows: 3, hint: 'One per line.' },
        { key: 'details.specialties', label: 'Specialties', type: 'list', rows: 3, hint: 'One per line, such as castles or birdwatching.' },
      ],
    },
    {
      title: 'Contact details shown to the public',
      fields: [
        { key: 'details.phone', label: 'Phone', type: 'text', maxLength: 24, placeholder: '+233 24 000 0000' },
        { key: 'details.email', label: 'Email', type: 'text', maxLength: 160 },
      ],
    },
    {
      title: 'Verification',
      fields: [
        { key: 'licence_number', label: 'Licence number', type: 'text', maxLength: 60, hint: 'As shown on the licence.' },
        { key: 'verified_on', label: 'Date checked', type: 'date' },
        { key: 'verified', label: 'Verified: I checked this licence with the Ghana Tourism Authority', type: 'boolean', wide: true },
        { key: 'consent_confirmed', label: 'The guide has agreed to be listed, with these contact details', type: 'boolean', wide: true },
      ],
    },
  ],
  validate: (values) => {
    const errors: FormErrors = {};
    const phone = String(values['details.phone'] ?? '').trim();
    const email = String(values['details.email'] ?? '').trim();
    if (phone && !telLink(phone)) errors['details.phone'] = 'Enter a phone number using digits, such as +233 24 000 0000.';
    if (email && !mailLink(email)) errors['details.email'] = 'Enter a valid email address.';
    if (values.verified) {
      if (!String(values.licence_number ?? '').trim()) errors.licence_number = 'Record the licence number you checked.';
      if (!String(values.verified_on ?? '').trim()) errors.verified_on = 'Give the date you checked the licence.';
    }
    return errors;
  },
  // An empty date is stored as no date, which the column requires
  prepare: (row) => ({ ...row, verified_on: row.verified_on || null }),
};

export const AdminGuidesPage: React.FC = () => <ResourceManager config={config} />;

export default AdminGuidesPage;
