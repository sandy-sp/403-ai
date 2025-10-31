import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { MediaService } from '@/lib/services/media.service';
import { errorResponse, successResponse } from '@/lib/utils/api';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const altText = formData.get('altText') as string | undefined;

    if (!file) {
      return errorResponse(new Error('No file provided'));
    }

    const media = await MediaService.uploadImage({
      file,
      uploadedBy: session.user.id,
      altText,
    });

    return successResponse(media, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
