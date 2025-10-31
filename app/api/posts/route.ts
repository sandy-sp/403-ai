import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { PostService } from '@/lib/services/post.service';
import { createPostSchema } from '@/lib/validations/post';
import { errorResponse, successResponse } from '@/lib/utils/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const options = {
      status: searchParams.get('status') as any,
      authorId: searchParams.get('authorId') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      tagId: searchParams.get('tagId') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    const result = await PostService.getPosts(options);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    
    const validatedData = createPostSchema.parse(body);
    
    const post = await PostService.createPost({
      ...validatedData,
      publishedAt: validatedData.publishedAt
        ? new Date(validatedData.publishedAt)
        : undefined,
      authorId: session.user.id,
    });

    return successResponse(post, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
