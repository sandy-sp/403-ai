import { PostService } from '@/lib/services/post.service';
import { CategoryService } from '@/lib/services/category.service';
import { TagService } from '@/lib/services/tag.service';
import { BlogList } from '@/components/blog/BlogList';
import { BlogSidebar } from '@/components/blog/BlogSidebar';

export const metadata = {
  title: 'Blog - 403 AI',
  description: 'Explore AI research, discussions, and news on forbidden knowledge in AI/ML',
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string; tag?: string; search?: string; page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = 12;

  const [{ posts, total, totalPages }, categories, tags] = await Promise.all([
    PostService.getPublishedPosts({
      page,
      limit,
      categoryId: searchParams.category,
      tagId: searchParams.tag,
      search: searchParams.search,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }),
    CategoryService.getCategoriesWithPostCount(),
    TagService.getTagsWithPostCount(),
  ]);

  // Get popular posts (top 5 by views)
  const { posts: popularPosts } = await PostService.getPublishedPosts({
    limit: 5,
    sortBy: 'viewCount',
    sortOrder: 'desc',
  });

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-secondary border-b border-secondary-light">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
            Blog
          </h1>
          <p className="text-text-secondary">
            Exploring forbidden knowledge in AI and machine learning
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <BlogList
              posts={posts}
              currentPage={page}
              totalPages={totalPages}
              total={total}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80">
            <BlogSidebar
              categories={categories}
              tags={tags}
              popularPosts={popularPosts}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
