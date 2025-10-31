'use client';

import { useEffect, useState } from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { X } from 'lucide-react';
import type { z } from 'zod';
import type { createPostSchema } from '@/lib/validations/post';

type PostFormData = z.infer<typeof createPostSchema>;

interface PublishPanelProps {
  register: UseFormRegister<PostFormData>;
  watch: UseFormWatch<PostFormData>;
  setValue: UseFormSetValue<PostFormData>;
  errors: FieldErrors<PostFormData>;
}

export function PublishPanel({ register, watch, setValue, errors }: PublishPanelProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('');

  const selectedCategoryIds = watch('categoryIds') || [];
  const selectedTagIds = watch('tagIds') || [];
  const featuredImageUrl = watch('featuredImageUrl');

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    if (featuredImageUrl) {
      setFeaturedImagePreview(featuredImageUrl);
    }
  }, [featuredImageUrl]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const current = selectedCategoryIds;
    const updated = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    setValue('categoryIds', updated);
  };

  const handleTagToggle = (tagId: string) => {
    const current = selectedTagIds;
    const updated = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    setValue('tagIds', updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setValue('featuredImageUrl', data.url);
      setFeaturedImagePreview(data.url);
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Featured Image */}
      <div className="card">
        <h3 className="font-semibold mb-3">Featured Image</h3>
        {featuredImagePreview ? (
          <div className="relative">
            <img
              src={featuredImagePreview}
              alt="Featured"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                setValue('featuredImageUrl', '');
                setFeaturedImagePreview('');
              }}
              className="absolute top-2 right-2 p-1 bg-status-error rounded-full hover:bg-status-error/80"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="featured-image"
            />
            <label
              htmlFor="featured-image"
              className="block w-full p-8 border-2 border-dashed border-secondary-light rounded-lg text-center cursor-pointer hover:border-accent-cyan transition-colors"
            >
              <p className="text-text-secondary">Click to upload image</p>
            </label>
          </div>
        )}
      </div>

      {/* Excerpt */}
      <div className="card">
        <h3 className="font-semibold mb-3">Excerpt</h3>
        <textarea
          {...register('excerpt')}
          placeholder="Brief description (max 200 characters)"
          className="input min-h-[100px] resize-none"
          maxLength={200}
        />
        {errors.excerpt && (
          <p className="text-status-error text-sm mt-1">{errors.excerpt.message}</p>
        )}
      </div>

      {/* Categories */}
      <div className="card">
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategoryIds.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                className="w-4 h-4 rounded border-secondary-light bg-secondary text-accent-cyan focus:ring-accent-cyan"
              />
              <span className="text-sm">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="card">
        <h3 className="font-semibold mb-3">Tags</h3>
        <input
          type="text"
          placeholder="Search tags..."
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          className="input mb-3"
        />
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {filteredTags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTagIds.includes(tag.id)}
                onChange={() => handleTagToggle(tag.id)}
                className="w-4 h-4 rounded border-secondary-light bg-secondary text-accent-cyan focus:ring-accent-cyan"
              />
              <span className="text-sm">{tag.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SEO Settings */}
      <div className="card">
        <h3 className="font-semibold mb-3">SEO Settings</h3>
        <div className="space-y-3">
          <div>
            <label className="label">Meta Title</label>
            <input
              {...register('metaTitle')}
              type="text"
              placeholder="SEO title"
              className="input"
              maxLength={60}
            />
          </div>
          <div>
            <label className="label">Meta Description</label>
            <textarea
              {...register('metaDescription')}
              placeholder="SEO description"
              className="input min-h-[80px] resize-none"
              maxLength={160}
            />
          </div>
          <div>
            <label className="label">Focus Keyword</label>
            <input
              {...register('focusKeyword')}
              type="text"
              placeholder="Primary keyword"
              className="input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
