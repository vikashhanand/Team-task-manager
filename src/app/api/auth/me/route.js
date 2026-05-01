import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/api-middleware';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({ 
      authenticated: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
