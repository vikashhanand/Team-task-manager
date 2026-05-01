import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import { getTokenFromRequest } from '@/lib/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = getTokenFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const projects = user.role === 'admin'
      ? await Project.find().populate('owner', 'name email').populate('members', 'name email').sort({ createdAt: -1 })
      : await Project.find({ members: user.userId }).populate('owner', 'name email').populate('members', 'name email').sort({ createdAt: -1 });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getTokenFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectDB();
    const { name, description } = await request.json();

    if (!name) return NextResponse.json({ error: 'Project name is required' }, { status: 400 });

    const project = await Project.create({
      name,
      description: description || '',
      owner: user.userId,
      members: [user.userId],
    });

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
