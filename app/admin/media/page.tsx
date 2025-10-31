import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MediaLibrary } from '@/components/admin/MediaLibrary';

export default async function MediaPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/signin');
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Media Library</h1>
        <p className="text-text-secondary">Manage your images and media files</p>
      </div>

      <MediaLibrary />
    </div>
  );
}
