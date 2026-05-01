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
  Check,
  Trash2
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
  const [activeMenu, setActiveMenu] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeMenu && !e.target.closest('.project-menu-container')) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenu]);

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

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    console.log('Updating project:', editingProject);
    
    // Ensure we only send member IDs to the backend
    const projectData = {
      ...editingProject,
      members: editingProject.members.map(m => m._id || m)
    };

    const res = await fetch(`/api/projects/${editingProject._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });

    if (res.ok) {
      setIsEditModalOpen(false);
      setEditingProject(null);
      fetchProjects();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    const projectId = projectToDelete._id;
    
    console.log('Confirmed Deletion for:', projectId);
    
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
        fetchProjects();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Delete request failed:', error);
      alert('Network error. Failed to delete project.');
    }
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
              <div className="relative project-menu-container">
                <button 
                  onClick={() => {
                    setActiveMenu(activeMenu === project._id ? null : project._id);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <MoreVertical size={20} />
                </button>
                
                <AnimatePresence>
                  {activeMenu === project._id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-10 py-2"
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                          setIsEditModalOpen(true);
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        Edit Details
                      </button>
                      {user?.role === 'admin' && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setProjectToDelete(project);
                            setIsDeleteModalOpen(true);
                            setActiveMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                        >
                          Delete Project
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

      {/* Edit Project Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">Edit Project</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleUpdateProject} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name</label>
                  <input
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Members</label>
                  <div className="max-h-40 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    {availableUsers.map(u => (
                      <div 
                        key={u._id} 
                        onClick={() => {
                          const members = editingProject.members.some(m => (m._id || m) === u._id)
                            ? editingProject.members.filter(m => (m._id || m) !== u._id)
                            : [...editingProject.members, u._id];
                          setEditingProject({...editingProject, members});
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${editingProject.members.some(m => (m._id || m) === u._id) ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <span className="text-sm font-medium">{u.name} ({u.role})</span>
                        {editingProject.members.some(m => (m._id || m) === u._id) && <CheckSquare size={16} />}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 mt-4"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && projectToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2">Delete Project?</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{projectToDelete.name}"</span>? 
                This action is permanent and will delete all associated tasks.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteProject}
                  className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
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
