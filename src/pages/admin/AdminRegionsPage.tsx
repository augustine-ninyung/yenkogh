import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { formatAdminDate } from '@/components/admin/adminFormat';
import type { ResourceConfig } from '@/components/admin/resourceForm';
import { statsApi, type DashboardStats } from '@/services/adminApi';

type RegionCounts = DashboardStats['byRegion'][number];

const countLink = 'font-semibold underline decoration-[#FFD300] decoration-2 underline-offset-4 hover:decoration-4';

export const AdminRegionsPage: React.FC = () => {
  // What each region contains, so its row can link to those records
  const [counts, setCounts] = useState<Record<string, RegionCounts>>({});

  useEffect(() => {
    let cancelled = false;
    statsApi
      .dashboard()
      .then((stats) => {
        if (!cancelled) setCounts(Object.fromEntries(stats.byRegion.map((r) => [r.name, r])));
      })
      .catch(() => {
        // The counts are a convenience; the list still works without them
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const config = useMemo<ResourceConfig>(() => {
    const count = (name: string, kind: 'destinations' | 'festivals' | 'events', id: string) => {
      const n = counts[name]?.[kind];
      if (n === undefined) return '—';
      if (n === 0) return <span className="text-[#757B81]">0</span>;
      return (
        <Link to={`/admin/${kind}?region=${id}`} className={countLink} aria-label={`${n} ${kind} in ${name}`}>
          {n}
        </Link>
      );
    };

    return {
      table: 'regions',
      singular: 'region',
      plural: 'regions',
      title: 'Regions',
      description: 'Ghana\'s regions. Destinations, events and festivals each belong to one; follow a count to manage what is in a region.',
      searchColumns: ['name', 'capital', 'code'],
      searchPlaceholder: 'Search regions...',
      defaultSort: { column: 'name', ascending: true },
      publishable: false,
      featurable: false,
      publicPath: (row) => `/explore?region=${row.code}`,
      columns: [
        {
          key: 'name',
          header: 'Region',
          sortColumn: 'name',
          render: (row) => (
            <div className="flex items-center gap-3 min-w-[10rem]">
              {row.image_url ? (
                <img src={String(row.image_url)} alt="" loading="lazy" className="w-11 h-11 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-white/5" />
              ) : (
                <div className="w-11 h-11 rounded-lg shrink-0 bg-gray-100 dark:bg-white/5" />
              )}
              <div>
                <p className="font-semibold text-[#090C11] dark:text-white">{row.name}</p>
                <p className="text-xs text-[#757B81]">{String(row.code)}</p>
              </div>
            </div>
          ),
        },
        { key: 'capital', header: 'Capital', sortColumn: 'capital', className: 'hidden sm:table-cell', render: (row) => String(row.capital || '—') },
        { key: 'destinations', header: 'Destinations', render: (row) => count(row.name, 'destinations', row.id) },
        { key: 'festivals', header: 'Festivals', render: (row) => count(row.name, 'festivals', row.id) },
        { key: 'events', header: 'Events', className: 'hidden md:table-cell', render: (row) => count(row.name, 'events', row.id) },
        { key: 'updated', header: 'Updated', sortColumn: 'updated_at', className: 'hidden lg:table-cell whitespace-nowrap', render: (row) => formatAdminDate(row.updated_at) },
      ],
      filters: [],
      defaults: {},
      sections: [
        {
          title: 'Region',
          fields: [
            { key: 'name', label: 'Name', type: 'text', required: true, maxLength: 60 },
            { key: 'code', label: 'Code', type: 'text', required: true, maxLength: 5, hint: 'A short code, e.g. GA. Used in links.' },
            { key: 'capital', label: 'Capital', type: 'text', maxLength: 60 },
            { key: 'description', label: 'Description', type: 'textarea', maxLength: 2000, rows: 4, wide: true },
            { key: 'image_url', label: 'Photo', type: 'image', wide: true },
          ],
        },
      ],
      validate: (values) => {
        const errors: Record<string, string> = {};
        if (String(values.code ?? '').trim().length === 1) errors.code = 'The code needs at least 2 characters.';
        return errors;
      },
      prepare: (row) => ({ ...row, code: String(row.code).toUpperCase() }),
    };
  }, [counts]);

  return <ResourceManager config={config} />;
};

export default AdminRegionsPage;
