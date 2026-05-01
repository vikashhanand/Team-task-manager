import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getAuthUser, isAdmin } from '@/lib/api-middleware';

export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    const updateData = await request.json();

    // Find task first to check permissions
    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Role-based update logic
    let updateFields = {};
    if (isAdmin(user)) {
      // Admin can update anything
      updateFields = updateData;
      if (updateData.dueDate) updateFields.dueDate = new Date(updateData.dueDate);
    } else {
      // Member can only update their own task status
      if (task.assignedTo.toString() !== user._id.toString()) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (updateData.status) {
        updateFields = { status: updateData.status };
      } else {
        return NextResponse.json({ error: 'Members can only update status' }, { status: 403 });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email').populate('project', 'name');

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Task PUT Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
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
    await Task.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Task DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
