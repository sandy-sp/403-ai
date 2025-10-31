import { SettingsService } from '@/lib/services/settings.service'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma')
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('SettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sanitizeSetting', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World'
      const result = SettingsService.sanitizeSetting('site_name', input)
      expect(result).toBe('Hello  World')
    })

    it('should remove iframe tags', () => {
      const input = 'Content <iframe src="evil.com"></iframe> more content'
      const result = SettingsService.sanitizeSetting('site_name', input)
      expect(result).toBe('Content  more content')
    })

    it('should remove javascript protocols', () => {
      const input = 'javascript:alert("xss")'
      const result = SettingsService.sanitizeSetting('site_name', input)
      expect(result).toBe('alert("xss")')
    })

    it('should remove event handlers', () => {
      const input = '<div onclick="alert()">Content</div>'
      const result = SettingsService.sanitizeSetting('site_name', input)
      expect(result).toBe('<div>Content</div>')
    })

    it('should add https:// to social URLs', () => {
      const input = 'twitter.com/username'
      const result = SettingsService.sanitizeSetting('social_twitter', input)
      expect(result).toBe('https://twitter.com/username')
    })

    it('should not modify URLs that already have protocol', () => {
      const input = 'https://twitter.com/username'
      const result = SettingsService.sanitizeSetting('social_twitter', input)
      expect(result).toBe('https://twitter.com/username')
    })

    it('should trim whitespace', () => {
      const input = '  Hello World  '
      const result = SettingsService.sanitizeSetting('site_name', input)
      expect(result).toBe('Hello World')
    })
  })

  describe('validateSetting', () => {
    it('should validate required fields', () => {
      const result = SettingsService.validateSetting('site_name', '')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('This field is required')
    })

    it('should validate URL format for social links', () => {
      const result = SettingsService.validateSetting('social_twitter', 'invalid-url')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid URL format')
    })

    it('should reject non-HTTP protocols', () => {
      const result = SettingsService.validateSetting('social_twitter', 'ftp://example.com')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Only HTTP and HTTPS URLs are allowed')
    })

    it('should validate length limits', () => {
      const longString = 'a'.repeat(1001)
      const result = SettingsService.validateSetting('site_name', longString)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Value too long (max 1000 characters)')
    })

    it('should validate site name minimum length', () => {
      const result = SettingsService.validateSetting('site_name', 'a')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Site name must be at least 2 characters')
    })

    it('should validate meta title length', () => {
      const longTitle = 'a'.repeat(61)
      const result = SettingsService.validateSetting('seo_meta_title', longTitle)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Meta title must be 60 characters or less')
    })

    it('should validate meta description length', () => {
      const longDescription = 'a'.repeat(161)
      const result = SettingsService.validateSetting('seo_meta_description', longDescription)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Meta description must be 160 characters or less')
    })

    it('should pass valid settings', () => {
      const result = SettingsService.validateSetting('site_name', 'Valid Site Name')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('getAllSettings', () => {
    it('should return all settings as key-value pairs', async () => {
      const mockSettings = [
        { key: 'site_name', value: 'Test Site' },
        { key: 'site_tagline', value: 'Test Tagline' },
      ]
      mockPrisma.siteSetting.findMany.mockResolvedValue(mockSettings as any)

      const result = await SettingsService.getAllSettings()

      expect(result).toEqual({
        site_name: 'Test Site',
        site_tagline: 'Test Tagline',
      })
      expect(mockPrisma.siteSetting.findMany).toHaveBeenCalledWith()
    })

    it('should handle database errors', async () => {
      mockPrisma.siteSetting.findMany.mockRejectedValue(new Error('Database error'))

      await expect(SettingsService.getAllSettings()).rejects.toThrow()
    })
  })

  describe('getSettingsByCategory', () => {
    it('should return settings filtered by category', async () => {
      const mockSettings = [
        { key: 'site_name', value: 'Test Site' },
        { key: 'site_tagline', value: 'Test Tagline' },
      ]
      mockPrisma.siteSetting.findMany.mockResolvedValue(mockSettings as any)

      const result = await SettingsService.getSettingsByCategory('general')

      expect(result).toEqual({
        site_name: 'Test Site',
        site_tagline: 'Test Tagline',
      })
      expect(mockPrisma.siteSetting.findMany).toHaveBeenCalledWith({
        where: { category: 'general' },
      })
    })
  })

  describe('updateSettings', () => {
    it('should sanitize and validate before updating', async () => {
      const settings = {
        site_name: '  Test Site  ',
        social_twitter: 'twitter.com/test',
      }

      mockPrisma.siteSetting.upsert.mockResolvedValue({} as any)

      await SettingsService.updateSettings(settings)

      expect(mockPrisma.siteSetting.upsert).toHaveBeenCalledTimes(2)
      expect(mockPrisma.siteSetting.upsert).toHaveBeenCalledWith({
        where: { key: 'site_name' },
        update: { value: 'Test Site' },
        create: { key: 'site_name', value: 'Test Site', category: 'general' },
      })
      expect(mockPrisma.siteSetting.upsert).toHaveBeenCalledWith({
        where: { key: 'social_twitter' },
        update: { value: 'https://twitter.com/test' },
        create: { key: 'social_twitter', value: 'https://twitter.com/test', category: 'social' },
      })
    })

    it('should reject invalid settings', async () => {
      const settings = {
        site_name: '', // Required field
      }

      await expect(SettingsService.updateSettings(settings)).rejects.toThrow(
        'Invalid value for site_name: This field is required'
      )
    })
  })

  describe('getSetting', () => {
    it('should return setting value', async () => {
      mockPrisma.siteSetting.findUnique.mockResolvedValue({
        key: 'site_name',
        value: 'Test Site',
      } as any)

      const result = await SettingsService.getSetting('site_name')

      expect(result).toBe('Test Site')
      expect(mockPrisma.siteSetting.findUnique).toHaveBeenCalledWith({
        where: { key: 'site_name' },
      })
    })

    it('should return null for non-existent setting', async () => {
      mockPrisma.siteSetting.findUnique.mockResolvedValue(null)

      const result = await SettingsService.getSetting('non_existent')

      expect(result).toBeNull()
    })
  })

  describe('validateSettings', () => {
    it('should validate multiple settings', () => {
      const settings = {
        site_name: 'Valid Name',
        social_twitter: 'https://twitter.com/test',
        seo_meta_title: 'Valid Title',
      }

      const result = SettingsService.validateSettings(settings)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should return errors for invalid settings', () => {
      const settings = {
        site_name: '', // Required
        social_twitter: 'invalid-url',
        seo_meta_title: 'a'.repeat(61), // Too long
      }

      const result = SettingsService.validateSettings(settings)

      expect(result.valid).toBe(false)
      expect(result.errors).toEqual({
        site_name: 'This field is required',
        social_twitter: 'Invalid URL format',
        seo_meta_title: 'Meta title must be 60 characters or less',
      })
    })
  })
})