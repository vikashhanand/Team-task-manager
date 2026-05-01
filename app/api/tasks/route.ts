import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import { getTokenFromRequest } from '@/lib/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = getTokenFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    const query: Record<string, unknown> = {};

    if (user.role !== 'admin') {
      query.assignedTo = user.userId;
    }

    if (projectId) query.project = projectId;
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getTokenFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { title, description, status, priority, assignedTo, project, dueDate } = await request.json();

    if (!title) return NextResponse.json({ error: 'Task title is required' }, { status: 400 });

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo: assignedTo || null,
      project: project || null,
      dueDate: dueDate || null,
      createdBy: user.userId,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'name');
    await task.populate('createdBy', 'name email');

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
