import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminEmails } from './adminEmails';

export async function isAdminRequest() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return false;
  }
  
  return adminEmails.includes(session.user.email);
}