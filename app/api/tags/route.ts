import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { TagService } from '@/lib/services/tag.service';
import { errorResponse, successResponse } from '@/lib/utils/api';
import { z } from 'zod';

const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const withCount = searchParams.get('withCount') === 'true';
    const search = searchParams.get('search');

    let tags;
    if (search) {
      tags = await TagService.searchTags(search);
    } else if (withCount) {
      tags = await TagService.getTagsWithPostCount();
    } else {
      tags = await TagService.getAllTags();
    }

    return successResponse(tags);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const validatedData = createTagSchema.parse(body);

    const tag = await TagService.createTag(validatedData);
    return successResponse(tag, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
