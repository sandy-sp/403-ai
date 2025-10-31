import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { PostService } from '@/lib/services/post.service';
import { updatePostSchema } from '@/lib/validations/post';
import { errorResponse, successResponse } from '@/lib/utils/api';
import { NotFoundError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await PostService.getPostById(params.id);
    
    if (!post) {
      throw new NotFoundError('Post');
    }

    return successResponse(post);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await request.json();
    
    const validatedData = updatePostSchema.parse(body);
    
    const post = await PostService.updatePost({
      id: params.id,
      ...validatedData,
      publishedAt: validatedData.publishedAt
        ? new Date(validatedData.publishedAt)
        : undefined,
    });

    return successResponse(post);
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
    await PostService.deletePost(params.id);
    return successResponse({ message: 'Post deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
