'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, RotateCcw, Upload, X } from 'lucide-react';

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'social'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          // Show validation errors
          Object.entries(data.details).forEach(([key, error]) => {
            toast.error(`${key}: ${error}`);
          });
        } else {
          throw new Error(data.error || 'Failed to save settings');
        }
        return;
      }

      toast.success('Settings saved successfully');
      router.refresh();
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset to default settings? This will overwrite your current settings.')) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to reset settings');
      }

      toast.success('Settings reset to defaults');
      router.refresh();
    } catch (error: any) {
      console.error('Failed to reset settings:', error);
      toast.error(error.message || 'Failed to reset settings');
    } finally {
      setIsResetting(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'social', label: 'Social', icon: '🌐' },
  ] as const;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-text-secondary">Configure your site's global settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={isSaving || isResetting}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isResetting}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-secondary-light rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-accent-cyan text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-secondary'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">
                  Site Name <span className="text-status-error">*</span>
                </label>
                <input
                  type="text"
                  value={settings.site_name || ''}
                  onChange={(e) => updateSetting('site_name', e.target.value)}
                  className="input w-full"
                  placeholder="403 AI - Forbidden AI"
                  required
                />
                <p className="text-xs text-text-secondary mt-1">
                  The name of your site that appears in the browser title and header
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-2">Site Tagline</label>
                <input
                  type="text"
                  value={settings.site_tagline || ''}
                  onChange={(e) => updateSetting('site_tagline', e.target.value)}
                  className="input w-full"
                  placeholder="Exploring Forbidden Knowledge in AI/ML"
                />
                <p className="text-xs text-text-secondary mt-1">
                  A short description that appears below your site name
                </p>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">Site Description</label>
              <textarea
                value={settings.site_description || ''}
                onChange={(e) => updateSetting('site_description', e.target.value)}
                className="input w-full resize-none"
                rows={4}
                placeholder="A platform for AI research, discussions, and news about forbidden knowledge in artificial intelligence and machine learning."
              />
              <p className="text-xs text-text-secondary mt-1">
                A longer description of your site for search engines and social media
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-2">Site Logo URL</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={settings.site_logo || ''}
                  onChange={(e) => updateSetting('site_logo', e.target.value)}
                  className="input flex-1"
                  placeholder="https://example.com/logo.png"
                />
                <button
                  type="button"
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => toast.info('Logo upload feature coming soon')}
                >
                  <Upload size={18} />
                  Upload
                </button>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                URL to your site logo image (recommended: 200x50px)
              </p>
            </div>
          </div>
        )}

        {/* SEO Settings */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
            
            <div>
              <label className="block font-semibold mb-2">
                Default Meta Title <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                value={settings.seo_meta_title || ''}
                onChange={(e) => updateSetting('seo_meta_title', e.target.value)}
                className="input w-full"
                placeholder="403 AI - Forbidden AI"
                maxLength={60}
                required
              />
              <p className="text-xs text-text-secondary mt-1">
                Default title for search engines (max 60 characters)
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-2">Default Meta Description</label>
              <textarea
                value={settings.seo_meta_description || ''}
                onChange={(e) => updateSetting('seo_meta_description', e.target.value)}
                className="input w-full resize-none"
                rows={3}
                placeholder="Exploring forbidden knowledge in artificial intelligence and machine learning. Join our community of AI researchers and enthusiasts."
                maxLength={160}
              />
              <p className="text-xs text-text-secondary mt-1">
                Default description for search engines (max 160 characters)
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-2">Default Keywords</label>
              <input
                type="text"
                value={settings.seo_keywords || ''}
                onChange={(e) => updateSetting('seo_keywords', e.target.value)}
                className="input w-full"
                placeholder="AI, Machine Learning, Artificial Intelligence, Research, Technology"
              />
              <p className="text-xs text-text-secondary mt-1">
                Comma-separated keywords for search engines
              </p>
            </div>
          </div>
        )}

        {/* Social Settings */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">Twitter URL</label>
                <input
                  type="url"
                  value={settings.social_twitter || ''}
                  onChange={(e) => updateSetting('social_twitter', e.target.value)}
                  className="input w-full"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={settings.social_linkedin || ''}
                  onChange={(e) => updateSetting('social_linkedin', e.target.value)}
                  className="input w-full"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">GitHub URL</label>
                <input
                  type="url"
                  value={settings.social_github || ''}
                  onChange={(e) => updateSetting('social_github', e.target.value)}
                  className="input w-full"
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Facebook URL</label>
                <input
                  type="url"
                  value={settings.social_facebook || ''}
                  onChange={(e) => updateSetting('social_facebook', e.target.value)}
                  className="input w-full"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Instagram URL</label>
                <input
                  type="url"
                  value={settings.social_instagram || ''}
                  onChange={(e) => updateSetting('social_instagram', e.target.value)}
                  className="input w-full"
                  placeholder="https://instagram.com/yourusername"
                />
              </div>
            </div>

            <div className="bg-secondary-light rounded-lg p-4">
              <h3 className="font-semibold mb-2">Social Media Preview</h3>
              <p className="text-sm text-text-secondary mb-3">
                These links will appear in your site footer and social sharing
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'social_twitter', label: 'Twitter', color: 'bg-blue-500' },
                  { key: 'social_linkedin', label: 'LinkedIn', color: 'bg-blue-600' },
                  { key: 'social_github', label: 'GitHub', color: 'bg-gray-600' },
                  { key: 'social_facebook', label: 'Facebook', color: 'bg-blue-700' },
                  { key: 'social_instagram', label: 'Instagram', color: 'bg-pink-500' },
                ].map(({ key, label, color }) => (
                  settings[key] ? (
                    <span
                      key={key}
                      className={`px-3 py-1 rounded-full text-xs text-white ${color}`}
                    >
                      {label}
                    </span>
                  ) : null
                ))}
                {!Object.keys(settings).some(key => key.startsWith('social_') && settings[key]) && (
                  <span className="text-sm text-text-secondary">No social links configured</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}