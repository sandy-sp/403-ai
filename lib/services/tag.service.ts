import { prisma } from '@/lib/prisma';
import { generateSlug, ensureUniqueSlug } from '@/lib/utils/slug';
import { NotFoundError, ConflictError, handlePrismaError } from '@/lib/errors';
import { Tag } from '@prisma/client';

export interface CreateTagInput {
  name: string;
  slug?: string;
}

export interface UpdateTagInput {
  id: string;
  name?: string;
  slug?: string;
}

export interface TagWithPostCount extends Tag {
  _count?: {
    posts: number;
  };
}

export class TagService {
  static async createTag(input: CreateTagInput): Promise<Tag> {
    try {
      // Generate slug if not provided
      let slug = input.slug || generateSlug(input.name);

      // Check if tag with this name already exists
      const existingByName = await prisma.tag.findUnique({
        where: { name: input.name },
      });

      if (existingByName) {
        throw new ConflictError('Tag with this name already exists');
      }

      // Ensure slug is unique
      const existingSlugs = await prisma.tag.findMany({
        where: {
          slug: {
            startsWith: slug,
          },
        },
        select: { slug: true },
      });

      slug = ensureUniqueSlug(
        slug,
        existingSlugs.map((t) => t.slug)
      );

      const tag = await prisma.tag.create({
        data: {
          name: input.name,
          slug,
        },
      });

      return tag;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async updateTag(input: UpdateTagInput): Promise<Tag> {
    try {
      const existingTag = await prisma.tag.findUnique({
        where: { id: input.id },
      });

      if (!existingTag) {
        throw new NotFoundError('Tag');
      }

      // Check for name conflict if name is being updated
      if (input.name && input.name !== existingTag.name) {
        const existingByName = await prisma.tag.findUnique({
          where: { name: input.name },
        });

        if (existingByName) {
          throw new ConflictError('Tag with this name already exists');
        }
      }

      // Handle slug update
      let slug = input.slug;
      if (input.name && !input.slug) {
        slug = generateSlug(input.name);
      }

      if (slug && slug !== existingTag.slug) {
        const existingSlugs = await prisma.tag.findMany({
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
          existingSlugs.map((t) => t.slug)
        );
      }

      const tag = await prisma.tag.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(slug && { slug }),
        },
      });

      return tag;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async deleteTag(id: string): Promise<void> {
    try {
      await prisma.tag.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async getTagById(id: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { id },
    });
  }

  static async getTagBySlug(slug: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { slug },
    });
  }

  static async getAllTags(): Promise<Tag[]> {
    return prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async getTagsWithPostCount(): Promise<TagWithPostCount[]> {
    return prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async searchTags(query: string): Promise<Tag[]> {
    return prisma.tag.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
      take: 10,
    });
  }
}
