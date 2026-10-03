import React, { useState } from 'react';
import { Search, UserCheck, Shield } from 'lucide-react';
import { mockUsers } from '@/data/mockUsers';
import { Avatar } from '@/components/ui/Avatar';
import type { User } from '@/types';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#090C11] dark:text-white">
          Platform User Accounts ({users.length})
        </h1>
        <p className="text-xs text-[#757B81]">Review registered travelers and platform administrative officers</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757B81] w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name or email..."
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
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Saved Places</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <div>
                        <p className="font-semibold text-[#090C11] dark:text-white">{u.name}</p>
                        <span className="text-[11px] text-[#757B81]">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#757B81]">
                    {u.savedDestinations?.length || 0} destinations
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    {u.preferences?.currency || 'GHS'}
                  </td>
                  <td className="py-3 px-4 text-[#757B81] text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
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

export default AdminUsersPage;
