'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, 
  FolderKanban, 
  Users as UsersIcon, 
  MoreVertical,
  X,
  Search,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    members: []
  });

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setAvailableUsers(data);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject),
    });

    if (res.ok) {
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', members: [] });
      fetchProjects();
    }
  };

  const toggleMember = (userId) => {
    setNewProject(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 mt-1">Manage and track your team's initiatives.</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search projects..." 
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <FolderKanban size={24} />
              </div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <MoreVertical size={20} />
              </button>
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">{project.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">{project.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
              <div className="flex -space-x-2">
                {project.members.slice(0, 3).map((member) => (
                  <div 
                    key={member._id}
                    title={member.name}
                    className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400"
                  >
                    {member.name.charAt(0)}
                  </div>
                ))}
                {project.members.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-medium">
                    +{project.members.length - 3}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <UsersIcon size={14} />
                <span>{project.members.length} Members</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Project Modal */}
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
                <h2 className="text-xl font-bold">Create New Project</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateProject} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name</label>
                  <input
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. Website Redesign"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                    placeholder="Describe the project goal..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Members</label>
                  <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    {availableUsers.map(u => (
                      <div 
                        key={u._id} 
                        onClick={() => toggleMember(u._id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${newProject.members.includes(u._id) ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <span className="text-sm font-medium">{u.name} ({u.role})</span>
                        {newProject.members.includes(u._id) && <CheckSquare size={16} />}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 mt-4"
                >
                  Create Project
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckSquare({ size }) {
  return (
    <div className="bg-blue-600 text-white rounded p-0.5">
      <Check size={size} />
    </div>
  );
}
