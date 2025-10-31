import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/errors';

export interface SiteSettings {
  // General settings
  site_name: string;
  site_tagline: string;
  site_description: string;
  site_logo: string;
  
  // SEO settings
  seo_meta_title: string;
  seo_meta_description: string;
  seo_keywords: string;
  
  // Social settings
  social_twitter: string;
  social_linkedin: string;
  social_github: string;
  social_facebook: string;
  social_instagram: string;
}

export class SettingsService {
  /**
   * Get all settings as key-value pairs
   */
  static async getAllSettings(): Promise<Record<string, string>> {
    try {
      const settings = await prisma.siteSetting.findMany();
      return Object.fromEntries(
        settings.map((s) => [s.key, s.value])
      );
    } catch (error) {
      console.error('Error getting all settings:', error);
      handlePrismaError(error);
    }
  }

  /**
   * Get settings by category
   */
  static async getSettingsByCategory(category: string): Promise<Record<string, string>> {
    try {
      const settings = await prisma.siteSetting.findMany({
        where: { category },
      });
      return Object.fromEntries(
        settings.map((s) => [s.key, s.value])
      );
    } catch (error) {
      console.error(`Error getting settings for category ${category}:`, error);
      handlePrismaError(error);
    }
  }

  /**
   * Get a single setting value
   */
  static async getSetting(key: string): Promise<string | null> {
    try {
      const setting = await prisma.siteSetting.findUnique({
        where: { key },
      });
      return setting?.value || null;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return null;
    }
  }

  /**
   * Update a single setting
   */
  static async updateSetting(key: string, value: string): Promise<void> {
    try {
      const category = this.getCategoryFromKey(key);
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value, category },
      });
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      handlePrismaError(error);
    }
  }

  /**
   * Update multiple settings
   */
  static async updateSettings(settings: Record<string, string>): Promise<void> {
    try {
      // Validate and sanitize all settings first
      const sanitizedSettings: Record<string, string> = {};
      
      for (const [key, value] of Object.entries(settings)) {
        const sanitizedValue = this.sanitizeSetting(key, value);
        const validation = this.validateSetting(key, sanitizedValue);
        
        if (!validation.valid) {
          throw new Error(`Invalid value for ${key}: ${validation.error}`);
        }
        
        sanitizedSettings[key] = sanitizedValue;
      }

      await Promise.all(
        Object.entries(sanitizedSettings).map(([key, value]) => {
          const category = this.getCategoryFromKey(key);
          return prisma.siteSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value, category },
          });
        })
      );
    } catch (error) {
      console.error('Error updating settings:', error);
      handlePrismaError(error);
    }
  }

  /**
   * Delete a setting
   */
  static async deleteSetting(key: string): Promise<void> {
    try {
      await prisma.siteSetting.delete({
        where: { key },
      });
    } catch (error) {
      console.error(`Error deleting setting ${key}:`, error);
      handlePrismaError(error);
    }
  }

  /**
   * Get category from setting key
   */
  private static getCategoryFromKey(key: string): string {
    if (key.startsWith('site_')) return 'general';
    if (key.startsWith('seo_')) return 'seo';
    if (key.startsWith('social_')) return 'social';
    return 'general';
  }

  /**
   * Initialize default settings
   */
  static async initializeDefaults(): Promise<void> {
    try {
      const defaults: Record<string, string> = {
        // General settings
        site_name: '403 AI - Forbidden AI',
        site_tagline: 'Exploring Forbidden Knowledge in AI/ML',
        site_description: 'A platform for AI research, discussions, and news about forbidden knowledge in artificial intelligence and machine learning.',
        site_logo: '',
        
        // SEO settings
        seo_meta_title: '403 AI - Forbidden AI',
        seo_meta_description: 'Exploring forbidden knowledge in artificial intelligence and machine learning. Join our community of AI researchers and enthusiasts.',
        seo_keywords: 'AI, Machine Learning, Artificial Intelligence, Research, Technology, Innovation',
        
        // Social settings
        social_twitter: '',
        social_linkedin: '',
        social_github: '',
        social_facebook: '',
        social_instagram: '',
      };

      for (const [key, value] of Object.entries(defaults)) {
        const category = this.getCategoryFromKey(key);
        await prisma.siteSetting.upsert({
          where: { key },
          update: {}, // Don't update if exists
          create: {
            key,
            value,
            category,
          },
        });
      }

      console.log('Default settings initialized');
    } catch (error) {
      console.error('Error initializing default settings:', error);
      handlePrismaError(error);
    }
  }

  /**
   * Get settings with fallback to defaults
   */
  static async getSettingsWithDefaults(): Promise<SiteSettings> {
    try {
      const settings = await this.getAllSettings();
      
      // Provide defaults for missing settings
      const defaults: SiteSettings = {
        site_name: '403 AI - Forbidden AI',
        site_tagline: 'Exploring Forbidden Knowledge in AI/ML',
        site_description: 'A platform for AI research, discussions, and news',
        site_logo: '',
        seo_meta_title: '403 AI - Forbidden AI',
        seo_meta_description: 'Exploring forbidden knowledge in artificial intelligence',
        seo_keywords: 'AI, Machine Learning, Research',
        social_twitter: '',
        social_linkedin: '',
        social_github: '',
        social_facebook: '',
        social_instagram: '',
      };

      return {
        ...defaults,
        ...settings,
      } as SiteSettings;
    } catch (error) {
      console.error('Error getting settings with defaults:', error);
      // Return defaults if there's an error
      return {
        site_name: '403 AI - Forbidden AI',
        site_tagline: 'Exploring Forbidden Knowledge in AI/ML',
        site_description: 'A platform for AI research, discussions, and news',
        site_logo: '',
        seo_meta_title: '403 AI - Forbidden AI',
        seo_meta_description: 'Exploring forbidden knowledge in artificial intelligence',
        seo_keywords: 'AI, Machine Learning, Research',
        social_twitter: '',
        social_linkedin: '',
        social_github: '',
        social_facebook: '',
        social_instagram: '',
      };
    }
  }

  /**
   * Get settings for a specific category with caching
   */
  static async getCachedSettings(category?: string): Promise<Record<string, string>> {
    try {
      if (category) {
        return await this.getSettingsByCategory(category);
      }
      return await this.getAllSettings();
    } catch (error) {
      console.error('Error getting cached settings:', error);
      return {};
    }
  }

  /**
   * Sanitize setting value
   */
  static sanitizeSetting(key: string, value: string): string {
    // Basic HTML sanitization - remove script tags and dangerous content
    let sanitized = value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    // Additional sanitization for specific field types
    if (key.startsWith('social_') && sanitized) {
      // Ensure URLs start with http:// or https://
      if (!/^https?:\/\//i.test(sanitized)) {
        sanitized = 'https://' + sanitized;
      }
    }

    return sanitized;
  }

  /**
   * Validate setting value
   */
  static validateSetting(key: string, value: string): { valid: boolean; error?: string } {
    // Sanitize first
    const sanitizedValue = this.sanitizeSetting(key, value);

    // URL validation for social links
    if (key.startsWith('social_') && sanitizedValue) {
      try {
        const url = new URL(sanitizedValue);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(url.protocol)) {
          return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
        }
      } catch {
        return { valid: false, error: 'Invalid URL format' };
      }
    }

    // Length validation
    if (sanitizedValue.length > 1000) {
      return { valid: false, error: 'Value too long (max 1000 characters)' };
    }

    // Required fields validation
    const requiredFields = ['site_name', 'seo_meta_title'];
    if (requiredFields.includes(key) && !sanitizedValue.trim()) {
      return { valid: false, error: 'This field is required' };
    }

    // Specific field validations
    if (key === 'site_name' && sanitizedValue.length < 2) {
      return { valid: false, error: 'Site name must be at least 2 characters' };
    }

    if (key === 'seo_meta_title' && sanitizedValue.length > 60) {
      return { valid: false, error: 'Meta title must be 60 characters or less' };
    }

    if (key === 'seo_meta_description' && sanitizedValue.length > 160) {
      return { valid: false, error: 'Meta description must be 160 characters or less' };
    }

    return { valid: true };
  }

  /**
   * Bulk validate settings
   */
  static validateSettings(settings: Record<string, string>): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const [key, value] of Object.entries(settings)) {
      const validation = this.validateSetting(key, value);
      if (!validation.valid) {
        errors[key] = validation.error!;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
}