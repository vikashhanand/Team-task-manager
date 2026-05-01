'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  Mail, 
  ShieldCheck, 
  User as UserIcon,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function UsersPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          setTeam(data);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) return <div>Loading team...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Members</h1>
        <p className="text-gray-500 mt-1">Manage your team and their roles.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search team members..." 
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Join Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {team.map((member, index) => (
              <motion.tr 
                key={member._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                      {member.name.charAt(0)}
                    </div>
                    <span className="font-medium">{member.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    {member.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${member.role === 'admin' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {member.role === 'admin' ? <ShieldCheck size={12} /> : <UserIcon size={12} />}
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400 italic">
                  Member since 2024
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
