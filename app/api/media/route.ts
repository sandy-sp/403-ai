import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { MediaService } from '@/lib/services/media.service';
import { errorResponse, successResponse } from '@/lib/utils/api';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;

    const options = {
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
    };

    const result = await MediaService.getMediaLibrary(options);
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
