import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CategoriesManager } from '@/components/admin/CategoriesManager';

export default async function CategoriesPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/signin');
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-text-secondary">Organize your blog posts with categories</p>
      </div>

      <CategoriesManager />
    </div>
  );
}
