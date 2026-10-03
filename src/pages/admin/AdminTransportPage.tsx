import React, { useState } from 'react';
import { Plus, Search, Trash2, Truck } from 'lucide-react';
import { transportation as initialTransport } from '@/data/transportation';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import type { Transportation } from '@/types';

export const AdminTransportPage: React.FC = () => {
  const { addToast } = useToast();
  const [transportList, setTransportList] = useState<Transportation[]>(initialTransport);
  const [search, setSearch] = useState('');

  const filtered = transportList.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete ${name}?`)) {
      setTransportList(transportList.filter((t) => t.id !== id));
      addToast({
        variant: 'info',
        title: 'Transport Option Deleted',
        message: `${name} has been removed.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#090C11] dark:text-white">
            Transportation Registry ({transportList.length})
          </h1>
          <p className="text-xs text-[#757B81]">Manage travel providers, routes, and fare estimates</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757B81] w-4 h-4" />
        <input
          type="text"
          placeholder="Filter transport..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] text-xs sm:text-sm"
        />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-[#757B81] uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Transport Mode</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Sample Routes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                  <td className="py-3 px-4 font-semibold text-[#090C11] dark:text-white">
                    {t.name}
                  </td>
                  <td className="py-3 px-4 capitalize text-[#757B81]">{t.type.replace('-', ' ')}</td>
                  <td className="py-3 px-4 text-[#757B81]">
                    {t.routes?.length || 0} routes mapped
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="p-1 text-[#757B81] hover:text-red-500 transition-colors"
                      aria-label="Delete transport mode"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTransportPage;
