import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { getAuthUser, isAdmin } from '@/lib/api-middleware';

export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const { name, description, members } = await request.json();

    const project = await Project.findByIdAndUpdate(
      id,
      { name, description, members },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Project PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    // Find and delete the project
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: id });

    return NextResponse.json({ message: 'Project and associated tasks deleted successfully' });
  } catch (error) {
    console.error('Project DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
