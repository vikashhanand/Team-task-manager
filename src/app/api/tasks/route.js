import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getAuthUser, isAdmin } from '@/lib/api-middleware';

export async function GET(request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    await dbConnect();
    let query = {};
    
    if (projectId) {
      query.project = projectId;
    }

    if (!isAdmin(user)) {
      query.assignedTo = user._id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ dueDate: 1 });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Tasks GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { title, description, assignedTo, project, dueDate } = await request.json();

    if (!title || !assignedTo || !project || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      project,
      dueDate: new Date(dueDate),
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Tasks POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
