import { prisma } from '@/lib/prisma';
import { generateSlug, ensureUniqueSlug } from '@/lib/utils/slug';
import { generateExcerpt } from '@/lib/utils/content';
import { NotFoundError, ConflictError, handlePrismaError } from '@/lib/errors';
import type {
  CreatePostInput,
  UpdatePostInput,
  GetPostsOptions,
  PostsResponse,
  PostWithRelations,
} from '@/lib/types/post';
import { PostStatus } from '@prisma/client';

export class PostService {
  private static readonly POST_INCLUDE = {
    author: {
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    },
    categories: {
      include: {
        category: true,
      },
    },
    tags: {
      include: {
        tag: true,
      },
    },
  };

  static async createPost(input: CreatePostInput): Promise<PostWithRelations> {
    try {
      // Generate slug if not provided
      let slug = input.slug || generateSlug(input.title);

      // Ensure slug is unique
      const existingSlugs = await prisma.post.findMany({
        where: {
          slug: {
            startsWith: slug,
          },
        },
        select: { slug: true },
      });

      slug = ensureUniqueSlug(
        slug,
        existingSlugs.map((p) => p.slug)
      );

      // Generate excerpt if not provided
      const excerpt = input.excerpt || generateExcerpt(input.content);

      // Create post
      const post = await prisma.post.create({
        data: {
          title: input.title,
          slug,
          content: input.content,
          excerpt,
          featuredImageUrl: input.featuredImageUrl,
          status: input.status || PostStatus.DRAFT,
          visibility: input.visibility || 'PUBLIC',
          publishedAt: input.publishedAt,
          metaTitle: input.metaTitle || input.title,
          metaDescription: input.metaDescription || excerpt,
          focusKeyword: input.focusKeyword,
          authorId: input.authorId,
          categories: input.categoryIds
            ? {
                create: input.categoryIds.map((categoryId) => ({
                  categoryId,
                })),
              }
            : undefined,
          tags: input.tagIds
            ? {
                create: input.tagIds.map((tagId) => ({
                  tagId,
                })),
              }
            : undefined,
        },
        include: this.POST_INCLUDE,
      });

      return post as PostWithRelations;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async updatePost(input: UpdatePostInput): Promise<PostWithRelations> {
    try {
      const existingPost = await prisma.post.findUnique({
        where: { id: input.id },
      });

      if (!existingPost) {
        throw new NotFoundError('Post');
      }

      // Handle slug update
      let slug = input.slug;
      if (input.title && !input.slug) {
        slug = generateSlug(input.title);
      }

      if (slug && slug !== existingPost.slug) {
        const existingSlugs = await prisma.post.findMany({
          where: {
            slug: {
              startsWith: slug,
            },
            id: {
              not: input.id,
            },
          },
          select: { slug: true },
        });

        slug = ensureUniqueSlug(
          slug,
          existingSlugs.map((p) => p.slug)
        );
      }

      // Handle category and tag updates
      const updateData: any = {
        ...(input.title && { title: input.title }),
        ...(slug && { slug }),
        ...(input.content && { content: input.content }),
        ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
        ...(input.featuredImageUrl !== undefined && {
          featuredImageUrl: input.featuredImageUrl,
        }),
        ...(input.status && { status: input.status }),
        ...(input.visibility && { visibility: input.visibility }),
        ...(input.publishedAt !== undefined && {
          publishedAt: input.publishedAt,
        }),
        ...(input.metaTitle && { metaTitle: input.metaTitle }),
        ...(input.metaDescription && {
          metaDescription: input.metaDescription,
        }),
        ...(input.focusKeyword !== undefined && {
          focusKeyword: input.focusKeyword,
        }),
      };

      // Update categories if provided
      if (input.categoryIds) {
        await prisma.postCategory.deleteMany({
          where: { postId: input.id },
        });
        updateData.categories = {
          create: input.categoryIds.map((categoryId) => ({
            categoryId,
          })),
        };
      }

      // Update tags if provided
      if (input.tagIds) {
        await prisma.postTag.deleteMany({
          where: { postId: input.id },
        });
        updateData.tags = {
          create: input.tagIds.map((tagId) => ({
            tagId,
          })),
        };
      }

      const post = await prisma.post.update({
        where: { id: input.id },
        data: updateData,
        include: this.POST_INCLUDE,
      });

      return post as PostWithRelations;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async deletePost(id: string): Promise<void> {
    try {
      await prisma.post.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async getPostById(id: string): Promise<PostWithRelations | null> {
    const post = await prisma.post.findUnique({
      where: { id },
      include: this.POST_INCLUDE,
    });

    return post as PostWithRelations | null;
  }

  static async getPostBySlug(slug: string): Promise<PostWithRelations | null> {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: this.POST_INCLUDE,
    });

    return post as PostWithRelations | null;
  }

  static async getPosts(options: GetPostsOptions = {}): Promise<PostsResponse> {
    const {
      status,
      authorId,
      categoryId,
      tagId,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId,
        },
      };
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        {
          tags: {
            some: {
              tag: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: this.POST_INCLUDE,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts: posts as PostWithRelations[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getPublishedPosts(
    options: Omit<GetPostsOptions, 'status'> = {}
  ): Promise<PostsResponse> {
    return this.getPosts({
      ...options,
      status: PostStatus.PUBLISHED,
    });
  }

  static async incrementViewCount(id: string): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  static async publishPost(id: string): Promise<PostWithRelations> {
    try {
      const post = await prisma.post.update({
        where: { id },
        data: {
          status: PostStatus.PUBLISHED,
          publishedAt: new Date(),
        },
        include: this.POST_INCLUDE,
      });

      return post as PostWithRelations;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async unpublishPost(id: string): Promise<PostWithRelations> {
    try {
      const post = await prisma.post.update({
        where: { id },
        data: {
          status: PostStatus.DRAFT,
        },
        include: this.POST_INCLUDE,
      });

      return post as PostWithRelations;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async getRelatedPosts(
    postId: string,
    limit: number = 4
  ): Promise<PostWithRelations[]> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      return [];
    }

    const categoryIds = post.categories.map((c) => c.categoryId);
    const tagIds = post.tags.map((t) => t.tagId);

    const relatedPosts = await prisma.post.findMany({
      where: {
        id: { not: postId },
        status: PostStatus.PUBLISHED,
        OR: [
          {
            categories: {
              some: {
                categoryId: { in: categoryIds },
              },
            },
          },
          {
            tags: {
              some: {
                tagId: { in: tagIds },
              },
            },
          },
        ],
      },
      include: this.POST_INCLUDE,
      take: limit,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return relatedPosts as PostWithRelations[];
  }
}
