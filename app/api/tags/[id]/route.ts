import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { TagService } from '@/lib/services/tag.service';
import { errorResponse, successResponse } from '@/lib/utils/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await TagService.deleteTag(params.id);
    return successResponse({ message: 'Tag deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
