import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PostService } from '@/lib/services/post.service';
import { PostEditor } from '@/components/admin/PostEditor';
import { notFound } from 'next/navigation';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/signin');
  }

  const post = await PostService.getPostById(params.id);

  if (!post) {
    notFound();
  }

  const initialData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt || '',
    featuredImageUrl: post.featuredImageUrl || '',
    status: post.status,
    categoryIds: post.categories.map((c) => c.category.id),
    tagIds: post.tags.map((t) => t.tag.id),
    metaTitle: post.metaTitle || '',
    metaDescription: post.metaDescription || '',
    focusKeyword: post.focusKeyword || '',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="text-text-secondary">Update your blog post</p>
      </div>
      <PostEditor initialData={initialData} isEdit={true} />
    </div>
  );
}
