'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Member {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: Member;
  members: Member[];
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  assignedTo?: Member;
  dueDate?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
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

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch(`/api/tasks?projectId=${id}`).then((r) => r.json()),
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ]).then(([projectData, tasksData, usersData, meData]) => {
      setProject(projectData.project);
      setTasks(tasksData.tasks || []);
      setAllUsers(usersData.users || []);
      setCurrentUser(meData.user);
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setMemberError('');
    setAddingMember(true);
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMemberError(data.error || 'Failed to add member');
      } else {
        setProject(data.project);
        setShowAddMember(false);
        setSelectedUser('');
      }
    } finally {
      setAddingMember(false);
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading project...</div>;
  if (!project) return <div className="p-8 text-red-500">Project not found</div>;

  const nonMembers = allUsers.filter((u) => !project.members.some((m) => m._id === u._id));

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/projects" className="text-blue-600 text-sm hover:underline">← Back to Projects</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
            {project.description && <p className="text-gray-500 mt-2">{project.description}</p>}
            <p className="text-xs text-gray-400 mt-3">Created {new Date(project.createdAt).toLocaleDateString()} by {project.owner.name}</p>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Tasks ({tasks.length})</h3>
              <Link href={`/tasks?projectId=${id}`} className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No tasks for this project yet.</div>
            ) : (
              <div className="divide-y">
                {tasks.map((task) => (
                  <div key={task._id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-800">{task.title}</p>
                      {task.assignedTo && <p className="text-xs text-gray-500 mt-0.5">Assigned to {task.assignedTo.name}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-xl p-6 shadow-sm border h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Members ({project.members.length})</h3>
            {currentUser?.role === 'admin' && nonMembers.length > 0 && (
              <button
                onClick={() => setShowAddMember(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add
              </button>
            )}
          </div>

          {showAddMember && (
            <form onSubmit={handleAddMember} className="mb-4 space-y-2">
              {memberError && <p className="text-red-500 text-xs">{memberError}</p>}
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500"
              >
                <option value="">Select user...</option>
                {nonMembers.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddMember(false)} className="flex-1 px-3 py-1.5 text-xs border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={addingMember || !selectedUser} className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {addingMember ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {project.members.map((member) => (
              <div key={member._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
