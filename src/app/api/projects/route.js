import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import { getAuthUser, isAdmin } from '@/lib/api-middleware';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    let projects;
    if (isAdmin(user)) {
      projects = await Project.find({}).populate('createdBy', 'name email').populate('members', 'name email');
    } else {
      projects = await Project.find({ members: user._id }).populate('createdBy', 'name email').populate('members', 'name email');
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects GET Error:', error);
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
    const { name, description, members } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: user._id,
      members: members || [user._id], // Default to including the admin
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Projects POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
