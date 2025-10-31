import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { PostService } from '@/lib/services/post.service';
import { EmailService } from '@/lib/services/email.service';
import { updatePostSchema } from '@/lib/validations/post';
import { errorResponse, successResponse } from '@/lib/utils/api';
import { NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

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
    
    // Get the original post to check if it's being published for the first time
    const originalPost = await PostService.getPostById(params.id);
    if (!originalPost) {
      throw new NotFoundError('Post');
    }

    const post = await PostService.updatePost({
      id: params.id,
      ...validatedData,
      featuredImageUrl: validatedData.featuredImageUrl === null ? undefined : validatedData.featuredImageUrl,
      focusKeyword: validatedData.focusKeyword === null ? undefined : validatedData.focusKeyword,
      publishedAt: validatedData.publishedAt
        ? new Date(validatedData.publishedAt)
        : undefined,
    });

    // Send newsletter if requested and post is being published (not already published)
    if (
      validatedData.sendNewsletter && 
      validatedData.status === 'PUBLISHED' && 
      originalPost.status !== 'PUBLISHED'
    ) {
      try {
        const subscribers = await prisma.newsletterSubscriber.findMany({
          where: { status: 'ACTIVE' },
          select: { email: true },
        });

        if (subscribers.length > 0) {
          await EmailService.sendNewsletter(
            subscribers.map(s => s.email),
            {
              title: post.title,
              excerpt: post.excerpt || '',
              slug: post.slug,
              featuredImageUrl: post.featuredImageUrl || undefined,
            }
          );
        }
      } catch (emailError) {
        console.error('Failed to send newsletter:', emailError);
        // Continue - post update should succeed even if newsletter fails
      }
    }

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
