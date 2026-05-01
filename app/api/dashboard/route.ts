import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { getTokenFromRequest } from '@/lib/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = getTokenFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const taskQuery: Record<string, unknown> = {};
    if (user.role !== 'admin') {
      taskQuery.assignedTo = user.userId;
    }

    const now = new Date();

    const [total, completed, inProgress, overdue, recentTasks] = await Promise.all([
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'done' }),
      Task.countDocuments({ ...taskQuery, status: 'in-progress' }),
      Task.countDocuments({ ...taskQuery, status: { $ne: 'done' }, dueDate: { $lt: now } }),
      Task.find(taskQuery)
        .populate('assignedTo', 'name email')
        .populate('project', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    let byProject: unknown[] = [];
    if (user.role === 'admin') {
      byProject = await Task.aggregate([
        { $group: { _id: '$project', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: '_id',
            as: 'projectInfo',
          },
        },
        { $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true } },
        { $project: { projectName: { $ifNull: ['$projectInfo.name', 'No Project'] }, count: 1 } },
      ]);
    }

    // Suppress unused variable warning
    void Project;

    return NextResponse.json({ total, completed, inProgress, overdue, recentTasks, byProject });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
