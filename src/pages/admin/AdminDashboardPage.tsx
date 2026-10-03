import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  MapPin,
  Calendar,
  Truck,
  Users,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { destinations } from '@/data/destinations';
import { events } from '@/data/events';
import { transportation } from '@/data/transportation';
import { mockUsers } from '@/data/mockUsers';
import { Button } from '@/components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const stats = [
    { label: 'Active Destinations', value: destinations.length, icon: MapPin, to: '/admin/destinations', color: 'text-blue-500' },
    { label: 'Featured Events', value: events.length, icon: Calendar, to: '/admin/events', color: 'text-amber-500' },
    { label: 'Transport Modes', value: transportation.length, icon: Truck, to: '/admin/transportation', color: 'text-emerald-500' },
    { label: 'Platform Users', value: mockUsers.length + 1520, icon: Users, to: '/admin/users', color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#090C11] dark:text-white">
            Tourism Management Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#757B81]">
            Monitor platform metrics, destinations, upcoming festivals, and transport guides.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/destinations">
            <Button variant="primary" size="sm" className="font-bold">
              <Plus size={15} />
              <span>Add Destination</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              to={s.to}
              className="p-6 rounded-2xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 hover:border-[#FFD300]/40 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#757B81] uppercase tracking-wider">
                  {s.label}
                </span>
                <div className={`p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 ${s.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#090C11] dark:text-white">
                  {s.value}
                </span>
                <span className="text-xs text-[#FFD300] font-semibold flex items-center gap-1">
                  Manage <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Destinations & Events Table Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Destinations */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">Key Destinations</h3>
            <Link to="/admin/destinations" className="text-xs text-[#FFD300] hover:underline font-semibold">
              View all
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {destinations.slice(0, 5).map((d) => (
              <div key={d.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <p className="font-semibold text-[#090C11] dark:text-white">{d.name}</p>
                  <span className="text-[11px] text-[#757B81]">{d.region} Region</span>
                </div>
                <span className="text-xs font-bold text-emerald-500">
                  ★ {d.rating?.toFixed(1) || '4.5'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Events */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#262B32] border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">Cultural Festivals</h3>
            <Link to="/admin/events" className="text-xs text-[#FFD300] hover:underline font-semibold">
              View all
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {events.slice(0, 5).map((e) => (
              <div key={e.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <p className="font-semibold text-[#090C11] dark:text-white">{e.name}</p>
                  <span className="text-[11px] text-[#757B81]">{e.location}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 capitalize">
                  {e.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
