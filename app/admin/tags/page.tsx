import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TagsManager } from '@/components/admin/TagsManager';

export default async function TagsPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/signin');
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tags</h1>
        <p className="text-text-secondary">Label your posts with tags for better organization</p>
      </div>

      <TagsManager />
    </div>
  );
}
