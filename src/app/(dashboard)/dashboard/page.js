'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BarChart3,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const statCards = [
    { 
      title: 'Total Tasks', 
      value: stats.totalTasks, 
      icon: BarChart3, 
      color: 'indigo',
      description: 'Total tasks assigned'
    },
    { 
      title: 'Completed', 
      value: stats.completedTasks, 
      icon: CheckCircle2, 
      color: 'green',
      description: 'Tasks finished successfully'
    },
    { 
      title: 'Pending', 
      value: stats.pendingTasks, 
      icon: Clock, 
      color: 'amber',
      description: 'Tasks currently in progress'
    },
    { 
      title: 'Overdue', 
      value: stats.overdueTasks, 
      icon: AlertTriangle, 
      color: 'red',
      description: 'Missed deadlines'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {stats.userName}! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Recent Activity</h2>
            <button className="text-sm text-indigo-600 hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {/* Placeholder for activity */}
            <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="w-2 h-10 bg-indigo-500 rounded-full" />
              <div>
                <p className="text-sm font-medium">New project "Mobile App" created</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="w-2 h-10 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-medium">Task "API Integration" marked as Done</p>
                <p className="text-xs text-gray-400">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Upcoming Deadlines</h2>
            <Calendar size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 italic">No urgent deadlines approaching.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
