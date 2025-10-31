import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { PostService } from '@/lib/services/post.service';
import { errorResponse, successResponse } from '@/lib/utils/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { action } = body;

    let post;
    if (action === 'publish') {
      post = await PostService.publishPost(params.id);
    } else if (action === 'unpublish') {
      post = await PostService.unpublishPost(params.id);
    } else {
      return errorResponse(new Error('Invalid action'));
    }

    return successResponse(post);
  } catch (error) {
    return errorResponse(error);
  }
}
