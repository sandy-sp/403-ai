import { Post, PostStatus, Visibility, User, Category, Tag } from '@prisma/client';

export type PostWithRelations = Post & {
  author: User;
  categories: Array<{ category: Category }>;
  tags: Array<{ tag: Tag }>;
};

export interface CreatePostInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  status?: PostStatus;
  visibility?: Visibility;
  publishedAt?: Date;
  categoryIds?: string[];
  tagIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  authorId: string;
}

export interface UpdatePostInput {
  id: string;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featuredImageUrl?: string;
  status?: PostStatus;
  visibility?: Visibility;
  publishedAt?: Date;
  categoryIds?: string[];
  tagIds?: string[];
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
}

export interface GetPostsOptions {
  status?: PostStatus;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface PostsResponse {
  posts: PostWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
