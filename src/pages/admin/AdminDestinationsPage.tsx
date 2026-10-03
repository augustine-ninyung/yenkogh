import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Eye } from 'lucide-react';
import { destinations as initialDestinations } from '@/data/destinations';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Destination } from '@/types';

export const AdminDestinationsPage: React.FC = () => {
  const { addToast } = useToast();
  const [destList, setDestList] = useState<Destination[]>(initialDestinations);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [region, setRegion] = useState('Central');
  const [type, setType] = useState<Destination['type']>('historical');
  const [cost, setCost] = useState('200');
  const [description, setDescription] = useState('');

  const filtered = destList.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.region.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, destName: string) => {
    if (window.confirm(`Are you sure you want to delete ${destName}?`)) {
      setDestList(destList.filter((d) => d.id !== id));
      addToast({
        variant: 'info',
        title: 'Destination Removed',
        message: `${destName} has been deleted.`,
      });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newDest: Destination = {
      id: `dest-${Date.now()}`,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      region,
      regionCode: region.substring(0, 2).toUpperCase(),
      type,
      description,
      shortDescription: description.substring(0, 100),
      imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
      gallery: [],
      rating: 4.8,
      reviewCount: 1,
      activities: [],
      thingsToDo: [],
      estimatedCostPerPerson: parseFloat(cost) || 150,
      transportOptions: [],
      nearbyDestinations: [],
      featured: false,
      tags: [type, region.toLowerCase()],
    };

    setDestList([newDest, ...destList]);
    setIsAddModalOpen(false);
    setName('');
    setDescription('');
    addToast({
      variant: 'success',
      title: 'Destination Added',
      message: `${name} has been published to the catalog.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#090C11] dark:text-white">
            Manage Destinations ({destList.length})
          </h1>
          <p className="text-xs text-[#757B81]">View, create, and edit Ghanaian tourism sites</p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)} className="font-bold">
          <Plus size={16} />
          <span>New Destination</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757B81] w-4 h-4" />
        <input
          type="text"
          placeholder="Filter destinations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262B32] text-xs sm:text-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-[#757B81] uppercase text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Cost/Person</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                  <td className="py-3 px-4 font-semibold text-[#090C11] dark:text-white">
                    {d.name}
                  </td>
                  <td className="py-3 px-4 text-[#757B81]">{d.region}</td>
                  <td className="py-3 px-4 capitalize text-[#757B81]">{d.type}</td>
                  <td className="py-3 px-4 font-bold text-[#090C11] dark:text-white">
                    {formatCurrency(d.estimatedCostPerPerson)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-500">
                    ★ {d.rating?.toFixed(1) || '4.5'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDelete(d.id, d.name)}
                        className="p-1 text-[#757B81] hover:text-red-500 transition-colors"
                        aria-label="Delete destination"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Destination">
        <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="font-semibold block mb-1">Destination Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shai Hills Resource Reserve"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11]"
              >
                <option value="Greater Accra">Greater Accra</option>
                <option value="Central">Central</option>
                <option value="Ashanti">Ashanti</option>
                <option value="Eastern">Eastern</option>
                <option value="Volta">Volta</option>
                <option value="Northern">Northern</option>
                <option value="Savannah">Savannah</option>
                <option value="Western">Western</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11]"
              >
                <option value="historical">Historical</option>
                <option value="national-park">National Park</option>
                <option value="waterfall">Waterfall</option>
                <option value="beach">Beach</option>
                <option value="wildlife">Wildlife</option>
                <option value="cultural">Cultural</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Estimated Cost Per Person (GH₵)</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11]"
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight historical context, wildlife, key activities..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11]"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Destination
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDestinationsPage;
