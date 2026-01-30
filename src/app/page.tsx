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
      // We can redirect to a "Refreshing Session" page, or simply prompt login.
      // For now, let's redirect to a special 'select-company' or force re-login.
      // But simply redirecting to dashboard will loop.
      // Let's redirect to setup/company with a query param to indicate "select default".
      // Or better yet, redirect to /setup/company to "Create or Join".
      redirect('/setup/company');
    } else {
      // User has NO company.
      redirect('/setup/wizard');
    }
  }

  return <Dashboard />;
}
