import { GET, PUT, POST } from '@/app/api/admin/settings/route'
import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { SettingsService } from '@/lib/services/settings.service'

// Mock dependencies
jest.mock('@/lib/auth')
jest.mock('@/lib/services/settings.service')

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>
const mockSettingsService = SettingsService as jest.Mocked<typeof SettingsService>

describe('/api/admin/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdmin.mockResolvedValue({
      user: { id: '1', role: 'ADMIN', name: 'Admin', email: 'admin@test.com' }
    } as any)
  })

  describe('GET', () => {
    it('should return all settings', async () => {
      const mockSettings = {
        site_name: 'Test Site',
        site_tagline: 'Test Tagline'
      }
      mockSettingsService.getAllSettings.mockResolvedValue(mockSettings)

      const request = new NextRequest('http://localhost:3000/api/admin/settings')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockSettings)
      expect(mockSettingsService.getAllSettings).toHaveBeenCalled()
    })

    it('should return settings by category', async () => {
      const mockSettings = {
        site_name: 'Test Site',
        site_tagline: 'Test Tagline'
      }
      mockSettingsService.getSettingsByCategory.mockResolvedValue(mockSettings)

      const request = new NextRequest('http://localhost:3000/api/admin/settings?category=general')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockSettings)
      expect(mockSettingsService.getSettingsByCategory).toHaveBeenCalledWith('general')
    })

    it('should require admin access', async () => {
      mockRequireAdmin.mockRejectedValue(new Error('Unauthorized'))

      const request = new NextRequest('http://localhost:3000/api/admin/settings')
      const response = await GET(request)

      expect(response.status).toBe(403)
    })

    it('should handle service errors', async () => {
      mockSettingsService.getAllSettings.mockRejectedValue(new Error('Service error'))

      const request = new NextRequest('http://localhost:3000/api/admin/settings')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })

  describe('PUT', () => {
    it('should update settings successfully', async () => {
      const settings = {
        site_name: 'Updated Site',
        site_tagline: 'Updated Tagline'
      }

      mockSettingsService.validateSettings.mockReturnValue({
        valid: true,
        errors: {}
      })
      mockSettingsService.updateSettings.mockResolvedValue()

      const request = new NextRequest('http://localhost:3000/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockSettingsService.validateSettings).toHaveBeenCalledWith(settings)
      expect(mockSettingsService.updateSettings).toHaveBeenCalledWith(settings)
    })

    it('should reject invalid settings', async () => {
      const settings = {
        site_name: '', // Invalid
      }

      mockSettingsService.validateSettings.mockReturnValue({
        valid: false,
        errors: { site_name: 'This field is required' }
      })

      const request = new NextRequest('http://localhost:3000/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details).toEqual({ site_name: 'This field is required' })
    })

    it('should require admin access', async () => {
      mockRequireAdmin.mockRejectedValue(new Error('Unauthorized'))

      const request = new NextRequest('http://localhost:3000/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PUT(request)

      expect(response.status).toBe(403)
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/settings', {
        method: 'PUT',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await PUT(request)

      expect(response.status).toBe(400)
    })
  })

  describe('POST', () => {
    it('should initialize default settings', async () => {
      mockSettingsService.initializeDefaults.mockResolvedValue()

      const request = new NextRequest('http://localhost:3000/api/admin/settings', {
        method: 'POST'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockSettingsService.initializeDefaults).toHaveBeenCalled()
    })

    it('should require admin access', async () => {
      mockRequireAdmin.mockRejectedValue(new Error('Unauthorized'))

      const request = new NextRequest('http://localhost:3000/api/admin/settings', {
        method: 'POST'
      })

      const response = await POST(request)

      expect(response.status).toBe(403)
    })
  })
})