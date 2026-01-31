import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Dashboard from '@/components/Dashboard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session: any = await getServerSession(authOptions);

  // Double-check authentication for root route
  if (!session) {
    redirect('/login');
  }

  // Check if current session has a company selected
  if (!session.user?.companyId) {
    // Session doesn't have companyId.
    // Check if user is linked to ANY company in DB (maybe session is stale or first login)
    const userCompany = await db.userCompany.findFirst({
      where: { userId: session.user.id },
      include: { company: true }
    });

    if (userCompany) {
      // User belongs to a company, but session is stale.
      // Force logout and redirect to login to refresh session with companyId
      redirect('/api/auth/signout?callbackUrl=/login');
    } else {
      // User has NO company.
      redirect('/setup/wizard');
    }
  }

  return <Dashboard />;
}
