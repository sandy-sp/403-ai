'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema } from '@/lib/validations/post';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { PublishPanel } from './PublishPanel';
import { generateSlug } from '@/lib/utils/slug';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { Save, Eye } from 'lucide-react';
import type { z } from 'zod';

type PostFormData = z.infer<typeof createPostSchema>;

const TiptapEditorDynamic = dynamic(
  () => import('@/components/editor/TiptapEditor').then((mod) => mod.TiptapEditor),
  { ssr: false, loading: () => <div className="h-96 bg-secondary rounded-lg animate-pulse" /> }
);

interface PostEditorProps {
  initialData?: Partial<PostFormData> & { id?: string };
  isEdit?: boolean;
}

export function PostEditor({ initialData, isEdit = false }: PostEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState(initialData?.content || '');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      excerpt: initialData?.excerpt || '',
      featuredImageUrl: initialData?.featuredImageUrl || '',
      status: initialData?.status || 'DRAFT',
      categoryIds: initialData?.categoryIds || [],
      tagIds: initialData?.tagIds || [],
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
    },
  });

  const title = watch('title');
  const slug = watch('slug');

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      setValue('slug', generateSlug(title));
    }
  }, [title, slug, setValue]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    if (isEdit && initialData?.id) {
      const timeout = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      setAutoSaveTimeout(timeout);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [content, title]);

  const handleAutoSave = async () => {
    if (!isEdit || !initialData?.id) return;

    try {
      await fetch(`/api/posts/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
        }),
      });
      toast.success('Auto-saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const onSubmit = async (data: PostFormData, status: 'DRAFT' | 'PUBLISHED') => {
    setIsSaving(true);

    try {
      const postData = {
        ...data,
        content,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : undefined,
      };

      const url = isEdit ? `/api/posts/${initialData?.id}` : '/api/posts';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save post');
      }

      const result = await response.json();
      toast.success(
        status === 'PUBLISHED' ? 'Post published successfully!' : 'Post saved as draft'
      );

      router.push('/admin/posts');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Main Editor Area */}
      <div className="flex-1">
        <div className="card mb-6">
          {/* Title Input */}
          <div className="mb-4">
            <input
              {...register('title')}
              type="text"
              placeholder="Post Title"
              className="w-full text-3xl font-bold bg-transparent border-none focus:outline-none placeholder:text-text-secondary/50"
            />
            {errors.title && (
              <p className="text-status-error text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Slug Input */}
          <div className="mb-6">
            <label className="label">URL Slug</label>
            <input
              {...register('slug')}
              type="text"
              placeholder="post-url-slug"
              className="input"
            />
            {errors.slug && (
              <p className="text-status-error text-sm mt-1">{errors.slug.message}</p>
            )}
          </div>

          {/* Rich Text Editor */}
          <TiptapEditorDynamic
            content={content}
            onChange={setContent}
            onImageUpload={handleImageUpload}
            placeholder="Start writing your post..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, 'DRAFT'))}
            disabled={isSaving}
            className="btn-secondary flex items-center gap-2"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, 'PUBLISHED'))}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            <Eye size={18} />
            {isSaving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Right Sidebar - Publish Panel */}
      <div className="w-80">
        <PublishPanel register={register} watch={watch} setValue={setValue} errors={errors} />
      </div>
    </div>
  );
}
