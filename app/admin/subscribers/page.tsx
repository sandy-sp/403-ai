import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NewsletterService } from '@/lib/services/newsletter.service';
import { SubscribersTable } from '@/components/admin/SubscribersTable';

export const metadata = {
  title: 'Newsletter Subscribers - Admin',
};

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string; page?: string };
}) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/signin');
  }

  const page = parseInt(searchParams.page || '1');
  const status = searchParams.status as any;
  const search = searchParams.search;

  const { subscribers, total, totalPages } =
    await NewsletterService.getSubscribers({
      status,
      search,
      page,
      limit: 50,
    });

  const stats = await NewsletterService.getStatistics();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Newsletter Subscribers</h1>
        <p className="text-text-secondary">
          Manage your newsletter subscribers and view statistics
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Total Subscribers</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Active</p>
          <p className="text-3xl font-bold text-status-success">
            {stats.active}
          </p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-status-warning">
            {stats.pending}
          </p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Unsubscribed</p>
          <p className="text-3xl font-bold text-text-secondary">
            {stats.unsubscribed}
          </p>
        </div>
      </div>

      {/* Subscribers Table */}
      <SubscribersTable
        subscribers={subscribers}
        total={total}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
