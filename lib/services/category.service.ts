import { prisma } from '@/lib/prisma';
import { generateSlug, ensureUniqueSlug } from '@/lib/utils/slug';
import { NotFoundError, ConflictError, handlePrismaError } from '@/lib/errors';
import { Category } from '@prisma/client';

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
}

export interface CategoryWithPostCount extends Category {
  _count?: {
    posts: number;
  };
}

export class CategoryService {
  static async createCategory(
    input: CreateCategoryInput
  ): Promise<Category> {
    try {
      // Generate slug if not provided
      let slug = input.slug || generateSlug(input.name);

      // Check if category with this name already exists
      const existingByName = await prisma.category.findUnique({
        where: { name: input.name },
      });

      if (existingByName) {
        throw new ConflictError('Category with this name already exists');
      }

      // Ensure slug is unique
      const existingSlugs = await prisma.category.findMany({
        where: {
          slug: {
            startsWith: slug,
          },
        },
        select: { slug: true },
      });

      slug = ensureUniqueSlug(
        slug,
        existingSlugs.map((c) => c.slug)
      );

      const category = await prisma.category.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
        },
      });

      return category;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async updateCategory(
    input: UpdateCategoryInput
  ): Promise<Category> {
    try {
      const existingCategory = await prisma.category.findUnique({
        where: { id: input.id },
      });

      if (!existingCategory) {
        throw new NotFoundError('Category');
      }

      // Check for name conflict if name is being updated
      if (input.name && input.name !== existingCategory.name) {
        const existingByName = await prisma.category.findUnique({
          where: { name: input.name },
        });

        if (existingByName) {
          throw new ConflictError('Category with this name already exists');
        }
      }

      // Handle slug update
      let slug = input.slug;
      if (input.name && !input.slug) {
        slug = generateSlug(input.name);
      }

      if (slug && slug !== existingCategory.slug) {
        const existingSlugs = await prisma.category.findMany({
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
          existingSlugs.map((c) => c.slug)
        );
      }

      const category = await prisma.category.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(slug && { slug }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
        },
      });

      return category;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      await prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async getCategoryById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { slug },
    });
  }

  static async getAllCategories(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async getCategoriesWithPostCount(): Promise<CategoryWithPostCount[]> {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
