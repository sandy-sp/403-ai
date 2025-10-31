'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, Search, Trash2, Copy, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateShort } from '@/lib/utils/date';

interface Media {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string | null;
  size: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  createdAt: string;
}

export function MediaLibrary() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    fetchMedia();
  }, [search]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(`/api/media?${params.toString()}`);
      const data = await response.json();
      setMedia(data.media || []);
    } catch (error) {
      toast.error('Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        return await response.json();
      } catch (error: any) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter((r) => r !== null).length;

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`);
      fetchMedia();
    }

    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Image deleted successfully');
      setSelectedMedia(null);
      fetchMedia();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-secondary-light rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card mb-6">
        {/* Toolbar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>

          <label className="btn-primary flex items-center gap-2 cursor-pointer">
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload'}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-secondary-light rounded-lg p-8 text-center mb-6 hover:border-accent-cyan transition-colors"
        >
          <Upload size={48} className="mx-auto mb-2 text-text-secondary" />
          <p className="text-text-secondary">
            Drag and drop images here, or click Upload button
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Max file size: 5MB · Supported: JPG, PNG, WebP, GIF
          </p>
        </div>

        {/* Media Grid */}
        {media.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
            <p>No media files yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="aspect-square bg-secondary-light rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-accent-cyan transition-all group"
              >
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.altText || item.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-xs text-white px-2 text-center truncate">
                    {item.filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Media Details</h2>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-2 hover:bg-secondary-light rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Preview */}
                <div>
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.altText || selectedMedia.filename}
                    className="w-full rounded-lg"
                  />
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <label className="label">Filename</label>
                    <p className="text-sm">{selectedMedia.filename}</p>
                  </div>

                  <div>
                    <label className="label">URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selectedMedia.url}
                        readOnly
                        className="input flex-1 text-sm"
                      />
                      <button
                        onClick={() => copyUrl(selectedMedia.url)}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Size</label>
                      <p className="text-sm">{formatFileSize(selectedMedia.size)}</p>
                    </div>
                    <div>
                      <label className="label">Dimensions</label>
                      <p className="text-sm">
                        {selectedMedia.width} × {selectedMedia.height}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="label">Uploaded</label>
                    <p className="text-sm">{formatDateShort(selectedMedia.createdAt)}</p>
                  </div>

                  <div className="pt-4 border-t border-secondary-light">
                    <button
                      onClick={() => handleDelete(selectedMedia.id)}
                      className="btn-secondary w-full flex items-center justify-center gap-2 text-status-error hover:bg-status-error/10"
                    >
                      <Trash2 size={16} />
                      Delete Image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
