import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Dashboard from '@/components/Dashboard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Double-check authentication for root route
  if (!session) {
    redirect('/login');
  }

  const companyCount = await db.company.count();

  if (companyCount === 0) {
    redirect('/setup/wizard');
  }

  return <Dashboard />;
}
