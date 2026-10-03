import React, { useState } from 'react';
import { Plus, Search, Trash2, Calendar } from 'lucide-react';
import { events as initialEvents } from '@/data/events';
import { formatDateRange, formatCurrency } from '@/utils/formatters';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Event } from '@/types';

export const AdminEventsPage: React.FC = () => {
  const { addToast } = useToast();
  const [eventList, setEventList] = useState<Event[]>(initialEvents);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Event['category']>('festival');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('Greater Accra');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-03');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('50');

  const filtered = eventList.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, eventName: string) => {
    if (window.confirm(`Delete ${eventName}?`)) {
      setEventList(eventList.filter((e) => e.id !== id));
      addToast({
        variant: 'info',
        title: 'Event Deleted',
        message: `${eventName} has been removed.`,
      });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      id: `evt-${Date.now()}`,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      category,
      description: `${name} in ${location}, ${region}.`,
      shortDescription: `Annual celebration in ${location}.`,
      imageUrl: 'https://images.unsplash.com/photo-1589825743636-23a879d4b8e2?w=800&q=80',
      startDate,
      endDate,
      location,
      region,
      regionCode: region.substring(0, 2).toUpperCase(),
      isFree,
      ticketPrice: isFree ? 0 : parseFloat(price),
      activities: ['Procession', 'Drumming and dancing', 'Feasting'],
      relatedDestinations: [],
      featured: false,
      tags: [category, region.toLowerCase()],
    };

    setEventList([newEvent, ...eventList]);
    setIsModalOpen(false);
    setName('');
    setLocation('');
    addToast({
      variant: 'success',
      title: 'Event Published',
      message: `${name} has been added to the calendar.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#090C11] dark:text-white">
            Manage Festivals & Events ({eventList.length})
          </h1>
          <p className="text-xs text-[#757B81]">Review, create, and schedule cultural celebrations</p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="font-bold">
          <Plus size={16} />
          <span>New Event</span>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757B81] w-4 h-4" />
        <input
          type="text"
          placeholder="Filter events..."
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
                <th className="py-3 px-4">Event Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Admission</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                  <td className="py-3 px-4 font-semibold text-[#090C11] dark:text-white">
                    {e.name}
                  </td>
                  <td className="py-3 px-4 capitalize text-[#757B81]">{e.category}</td>
                  <td className="py-3 px-4 text-[#757B81]">{e.location}</td>
                  <td className="py-3 px-4 text-xs font-medium">
                    {formatDateRange(e.startDate, e.endDate)}
                  </td>
                  <td className="py-3 px-4">
                    {e.isFree ? (
                      <span className="text-emerald-500 font-bold">Free</span>
                    ) : (
                      <span className="font-bold">{formatCurrency(e.ticketPrice || 0)}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(e.id, e.name)}
                      className="p-1 text-[#757B81] hover:text-red-500 transition-colors"
                      aria-label="Delete event"
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Event">
        <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="font-semibold block mb-1">Event Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fetu Afahye Festival"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11]"
              >
                <option value="traditional">Traditional & Harvest</option>
                <option value="cultural">Cultural</option>
                <option value="art">Art & Exhibition</option>
                <option value="music">Music</option>
                <option value="food">Food</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Town / Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Cape Coast"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11]"
                required
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11]"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFreeCheck"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="w-4 h-4 rounded text-[#FFD300]"
            />
            <label htmlFor="isFreeCheck" className="font-semibold cursor-pointer">
              Free Admission
            </label>
          </div>

          {!isFree && (
            <div>
              <label className="font-semibold block mb-1">Ticket Price (GH₵)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090C11]"
              />
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Schedule Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminEventsPage;
