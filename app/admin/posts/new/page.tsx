import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PostEditor } from '@/components/admin/PostEditor';

export default async function NewPostPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/signin');
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-text-secondary">Write and publish your blog post</p>
      </div>
      <PostEditor />
    </div>
  );
}
