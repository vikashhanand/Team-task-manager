import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import User from '@/models/User';
import { getTokenFromRequest } from '@/lib/middleware';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getTokenFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (authUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectDB();
    const { id } = await params;
    const { userId } = await request.json();

    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (project.members.some((m) => m.equals(userObjectId))) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 409 });
    }

    project.members.push(userObjectId);
    await project.save();
    await project.populate('members', 'name email');
    await project.populate('owner', 'name email');

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
