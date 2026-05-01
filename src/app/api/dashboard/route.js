import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getAuthUser, isAdmin } from '@/lib/api-middleware';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    let query = {};
    if (!isAdmin(user)) {
      query.assignedTo = user._id;
    }

    const tasks = await Task.find(query);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const pendingTasks = tasks.filter(t => t.status !== 'done').length;
    
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < now).length;

    const stats = {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      userRole: user.role,
      userName: user.name
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
