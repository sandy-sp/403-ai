'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, Search, Trash2 } from 'lucide-react';
import { formatDateShort } from '@/lib/utils/date';
import { toast } from 'sonner';

interface Subscriber {
  id: string;
  email: string;
  status: string;
  createdAt: Date;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
}

interface Props {
  subscribers: Subscriber[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export function SubscribersTable({
  subscribers,
  total,
  currentPage,
  totalPages,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all'
  );
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/admin/subscribers?${params.toString()}`);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    const params = new URLSearchParams(searchParams.toString());
    if (status !== 'all') {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`/admin/subscribers?${params.toString()}`);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) {
      return;
    }

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscriber');
      }

      toast.success('Subscriber deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete subscriber');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(
        `/api/admin/subscribers/export?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Subscribers exported successfully');
    } catch (error) {
      toast.error('Failed to export subscribers');
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/subscribers?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-status-success/20 text-status-success',
      PENDING: 'bg-status-warning/20 text-status-warning',
      UNSUBSCRIBED: 'bg-secondary text-text-secondary',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="card">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              size={20}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="input pl-10 w-full"
            />
          </div>
          <button type="submit" className="btn-outline">
            Search
          </button>
        </form>

        <button onClick={handleExport} className="btn-outline flex items-center gap-2">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'ACTIVE', 'PENDING', 'UNSUBSCRIBED'].map((status) => (
          <button
            key={status}
            onClick={() => handleStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              statusFilter === status
                ? 'bg-accent-cyan text-primary'
                : 'bg-secondary-light text-text-secondary hover:bg-secondary'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-light">
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                Email
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                Subscribed
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                Confirmed
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr
                key={subscriber.id}
                className="border-b border-secondary-light hover:bg-secondary-light/50"
              >
                <td className="py-3 px-4">{subscriber.email}</td>
                <td className="py-3 px-4">{getStatusBadge(subscriber.status)}</td>
                <td className="py-3 px-4 text-sm text-text-secondary">
                  {formatDateShort(subscriber.createdAt)}
                </td>
                <td className="py-3 px-4 text-sm text-text-secondary">
                  {subscriber.confirmedAt
                    ? formatDateShort(subscriber.confirmedAt)
                    : '-'}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() =>
                      handleDelete(subscriber.id, subscriber.email)
                    }
                    disabled={isDeleting === subscriber.id}
                    className="text-status-error hover:text-status-error/80 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-text-secondary">
            Showing {(currentPage - 1) * 50 + 1} to{' '}
            {Math.min(currentPage * 50, total)} of {total} subscribers
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn-outline disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn-outline disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {subscribers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No subscribers found</p>
        </div>
      )}
    </div>
  );
}
