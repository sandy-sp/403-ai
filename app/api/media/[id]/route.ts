import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { MediaService } from '@/lib/services/media.service';
import { errorResponse, successResponse } from '@/lib/utils/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();
    await MediaService.deleteImage(id);
    return successResponse({ message: 'Media deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const body = await request.json();
    const { altText } = body;

    const media = await MediaService.updateMediaAltText(id, altText);
    return successResponse(media);
  } catch (error) {
    return errorResponse(error);
  }
}
