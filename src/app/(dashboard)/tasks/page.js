'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  X,
  Calendar,
  User as UserIcon,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    project: '',
    dueDate: '',
  });

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchProjects();
      if (user.role === 'admin') {
        fetchUsers();
      }
    }
  }, [user]);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      console.log('Fetched Projects:', data);
      if (res.ok) {
        setProjects(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch projects:', data.error);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setAvailableUsers(data);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });

    if (res.ok) {
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', assignedTo: '', project: '', dueDate: '' });
      fetchTasks();
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        setTasks(previousTasks);
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      } else {
        // Refresh to get any other changes (like populated fields)
        fetchTasks();
      }
    } catch (error) {
      setTasks(previousTasks);
      alert('Network error. Failed to update status.');
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      fetchTasks();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-100 dark:border-green-900/30';
      case 'in-progress': return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 border-gray-100 dark:border-gray-700';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'done') return false;
    const due = new Date(dueDate);
    due.setHours(23, 59, 59, 999);
    return due < new Date();
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-500 mt-1">Track progress and meet your deadlines.</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={20} />
            <span>Create Task</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "bg-white dark:bg-gray-900 p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
              isOverdue(task.dueDate, task.status) ? "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/5 shadow-sm" : "border-gray-100 dark:border-gray-800 shadow-sm"
            )}
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{task.title}</h3>
                {isOverdue(task.dueDate, task.status) && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <AlertCircle size={10} /> Overdue
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{task.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar size={14} />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <UserIcon size={14} />
                  <span>{task.assignedTo.name}</span>
                </div>
                <div className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-md">
                  {task.project.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                className={cn(
                  "text-xs font-bold py-2 px-3 pr-8 rounded-xl border cursor-pointer outline-none transition-all",
                  getStatusColor(task.status)
                )}
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              {user?.role === 'admin' && (
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <CheckCircle2 size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500">No tasks found. Relax or create a new one!</p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">Create New Task</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Task Title</label>
                  <input
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Implement Auth"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                    placeholder="Task details..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Project</label>
                    <select
                      required
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newTask.project}
                      onChange={(e) => setNewTask({...newTask, project: e.target.value})}
                    >
                      <option value="">Select Project</option>
                      {projects.length > 0 ? (
                        projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)
                      ) : (
                        <option disabled>No projects found. Create one first!</option>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Assign To</label>
                    <select
                      required
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    >
                      <option value="">Select Member</option>
                      {availableUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Due Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 mt-4"
                >
                  Create Task
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
