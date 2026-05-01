'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  recentTasks: Array<{
    _id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    assignedTo?: { name: string; email: string };
    project?: { name: string };
  }>;
}

const statusColors: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
};

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-orange-100 text-orange-700',
  high: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{data?.total ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{data?.completed ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{data?.inProgress ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{data?.overdue ?? 0}</p>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Recent Tasks</h3>
          <Link href="/tasks" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
        </div>
        {data?.recentTasks && data.recentTasks.length > 0 ? (
          <div className="divide-y">
            {data.recentTasks.map((task) => (
              <div key={task._id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    {task.project && <span>{task.project.name}</span>}
                    {task.assignedTo && <span>• {task.assignedTo.name}</span>}
                    {task.dueDate && <span>• Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">No tasks yet. <Link href="/tasks" className="text-blue-600">Create one</Link></div>
        )}
      </div>
    </div>
  );
}
