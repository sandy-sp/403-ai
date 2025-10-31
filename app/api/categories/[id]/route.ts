import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { CategoryService } from '@/lib/services/category.service';
import { errorResponse, successResponse } from '@/lib/utils/api';
import { z } from 'zod';

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    const category = await CategoryService.updateCategory({
      id: params.id,
      ...validatedData,
    });

    return successResponse(category);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await CategoryService.deleteCategory(params.id);
    return successResponse({ message: 'Category deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
