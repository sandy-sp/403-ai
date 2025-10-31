import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { CategoryService } from '@/lib/services/category.service';
import { errorResponse, successResponse } from '@/lib/utils/api';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const withCount = searchParams.get('withCount') === 'true';

    const categories = withCount
      ? await CategoryService.getCategoriesWithPostCount()
      : await CategoryService.getAllCategories();

    return successResponse(categories);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    const category = await CategoryService.createCategory(validatedData);
    return successResponse(category, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
