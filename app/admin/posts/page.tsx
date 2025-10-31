import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PostsTable } from '@/components/admin/PostsTable';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function PostsPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/signin');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Posts</h1>
          <p className="text-text-secondary">Manage your blog posts</p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          New Post
        </Link>
      </div>

      <PostsTable />
    </div>
  );
}
