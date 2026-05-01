import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import User from '@/models/User';
import dbConnect from './mongodb';

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');
    return user;
  } catch (error) {
    return null;
  }
}

export function isAdmin(user) {
  return user && user.role === 'admin';
}
