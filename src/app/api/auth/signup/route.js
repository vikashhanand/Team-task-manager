import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    console.log('Attempting DB connection...');
    await dbConnect();
    console.log('DB connected successfully');

    const body = await request.json().catch(() => ({}));
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields: name, email, and password are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'member',
    });

    const token = signToken({ id: user._id, role: user.role });

    const response = NextResponse.json({ 
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    }, { status: 201 });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Signup Error Detailed:', error);
    return NextResponse.json({ 
      error: 'Signup failed', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
