import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(200, 'Excerpt must be 200 characters or less').optional(),
  featuredImageUrl: z.string().url('Invalid image URL').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  publishedAt: z.string().datetime().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  metaTitle: z.string().max(60, 'Meta title is too long').optional(),
  metaDescription: z.string().max(160, 'Meta description is too long').optional(),
  focusKeyword: z.string().max(50, 'Focus keyword is too long').optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  content: z.string().min(1, 'Content is required').optional(),
  excerpt: z.string().max(200, 'Excerpt must be 200 characters or less').optional(),
  featuredImageUrl: z.string().url('Invalid image URL').optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  metaTitle: z.string().max(60, 'Meta title is too long').optional(),
  metaDescription: z.string().max(160, 'Meta description is too long').optional(),
  focusKeyword: z.string().max(50, 'Focus keyword is too long').optional().nullable(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
