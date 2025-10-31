import { prisma } from '@/lib/prisma';
import cloudinary, {
  CLOUDINARY_FOLDER,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
} from '@/lib/cloudinary';
import { NotFoundError, ValidationError, handlePrismaError } from '@/lib/errors';
import { Media } from '@prisma/client';

export interface UploadImageInput {
  file: File;
  uploadedBy: string;
  altText?: string;
}

export interface UploadImageResult {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  filename: string;
}

export interface GetMediaOptions {
  uploadedBy?: string;
  search?: string;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface MediaResponse {
  media: Media[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class MediaService {
  static validateFile(file: File): void {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new ValidationError(
        `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }
  }

  static async uploadToCloudinary(
    file: File,
    folder: string = CLOUDINARY_FOLDER
  ): Promise<UploadImageResult> {
    try {
      // Convert File to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder,
              resource_type: 'image',
              transformation: [
                { quality: 'auto', fetch_format: 'auto' },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      // Generate thumbnail URL
      const thumbnailUrl = cloudinary.url(result.public_id, {
        transformation: [
          { width: 300, height: 300, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      return {
        url: result.secure_url,
        thumbnailUrl,
        width: result.width,
        height: result.height,
        size: result.bytes,
        mimeType: file.type,
        filename: file.name,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  static async uploadImage(input: UploadImageInput): Promise<Media> {
    try {
      // Validate file
      this.validateFile(input.file);

      // Upload to Cloudinary
      const uploadResult = await this.uploadToCloudinary(input.file);

      // Save to database
      const media = await prisma.media.create({
        data: {
          filename: uploadResult.filename,
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          mimeType: uploadResult.mimeType,
          size: uploadResult.size,
          width: uploadResult.width,
          height: uploadResult.height,
          altText: input.altText,
          uploadedBy: input.uploadedBy,
        },
      });

      return media;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async deleteImage(id: string): Promise<void> {
    try {
      const media = await prisma.media.findUnique({
        where: { id },
      });

      if (!media) {
        throw new NotFoundError('Media');
      }

      // Extract public_id from Cloudinary URL
      const urlParts = media.url.split('/');
      const publicIdWithExtension = urlParts.slice(-2).join('/');
      const publicId = publicIdWithExtension.split('.')[0];

      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Failed to delete from Cloudinary:', error);
        // Continue with database deletion even if Cloudinary deletion fails
      }

      // Delete from database
      await prisma.media.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  static async getMediaById(id: string): Promise<Media | null> {
    return prisma.media.findUnique({
      where: { id },
    });
  }

  static async getMediaLibrary(
    options: GetMediaOptions = {}
  ): Promise<MediaResponse> {
    const {
      uploadedBy,
      search,
      page = 1,
      limit = 20,
      startDate,
      endDate,
    } = options;

    const where: any = {};

    if (uploadedBy) {
      where.uploadedBy = uploadedBy;
    }

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    return {
      media,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async updateMediaAltText(
    id: string,
    altText: string
  ): Promise<Media> {
    try {
      return await prisma.media.update({
        where: { id },
        data: { altText },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
