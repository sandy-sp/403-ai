import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('sonner')

const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockRouter = { push: mockPush, refresh: mockRefresh }

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockToast = toast as jest.Mocked<typeof toast>

// Mock fetch
global.fetch = jest.fn()

const mockInitialSettings = {
  site_name: 'Test Site',
  site_tagline: 'Test Tagline',
  site_description: 'Test Description',
  seo_meta_title: 'Test Meta Title',
  seo_meta_description: 'Test Meta Description',
  social_twitter: 'https://twitter.com/test',
  social_github: 'https://github.com/test'
}

describe('SettingsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter as any)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })
  })

  it('should render all tabs and form fields', () => {
    render(<SettingsForm initialSettings={mockInitialSettings} />)

    // Check tabs
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('SEO')).toBeInTheDocument()
    expect(screen.getByText('Social')).toBeInTheDocument()

    // Check general tab fields (default active)
    expect(screen.getByDisplayValue('Test Site')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Tagline')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
  })

  it('should switch between tabs', () => {
    render(<SettingsForm initialSettings={mockInitialSettings} />)

    // Switch to SEO tab
    fireEvent.click(screen.getByText('SEO'))
    expect(screen.getByDisplayValue('Test Meta Title')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Meta Description')).toBeInTheDocument()

    // Switch to Social tab
    fireEvent.click(screen.getByText('Social'))
    expect(screen.getByDisplayValue('https://twitter.com/test')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://github.com/test')).toBeInTheDocument()
  })

  it('should update form values when user types', () => {
    render(<SettingsForm initialSettings={mockInitialSettings} />)

    const siteNameInput = screen.getByDisplayValue('Test Site')
    fireEvent.change(siteNameInput, { target: { value: 'Updated Site Name' } })

    expect(screen.getByDisplayValue('Updated Site Name')).toBeInTheDocument()
  })

  it('should save settings successfully', async () => {
    render(<SettingsForm initialSettings={mockInitialSettings} />)

    const siteNameInput = screen.getByDisplayValue('Test Site')
    fireEvent.change(siteNameInput, { target: { value: 'Updated Site Name' } })

    const saveButton = screen.getByText('Save Settings')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mockInitialSettings,
          site_name: 'Updated Site Name'
        })
      })
    })

    expect(mockToast.success).toHaveBeenCalledWith('Settings saved successfully')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('should handle validation errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({
        error: 'Validation failed',
        details: {
          site_name: 'Site name is required',
          social_twitter: 'Invalid URL format'
        }
      })
    })

    render(<SettingsForm initialSettings={mockInitialSettings} />)

    const saveButton = screen.getByText('Save Settings')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('site_name: Site name is required')
      expect(mockToast.error).toHaveBeenCalledWith('social_twitter: Invalid URL format')
    })
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<SettingsForm initialSettings={mockInitialSettings} />)

    const saveButton = screen.getByText('Save Settings')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to save settings')
    })
  })

  it('should reset to defaults when reset button is clicked', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm
    window.confirm = jest.fn(() => true)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })

    render(<SettingsForm initialSettings={mockInitialSettings} />)

    const resetButton = screen.getByText('Reset to Defaults')
    fireEvent.click(resetButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/settings', {
        method: 'POST'
      })
    })

    expect(mockToast.success).toHaveBeenCalledWith('Settings reset to defaults')
    expect(mockRefresh).toHaveBeenCalled()

    // Restore original confirm
    window.confirm = originalConfirm
  })

  it('should not reset when user cancels confirmation', () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm
    window.confirm = jest.fn(() => false)

    render(<SettingsForm initialSettings={mockInitialSettings} />)

    const resetButton = screen.getByText('Reset to Defaults')
    fireEvent.click(resetButton)

    expect(global.fetch).not.toHaveBeenCalled()

    // Restore original confirm
    window.confirm = originalConfirm
  })

  it('should disable buttons while saving', async () => {
    // Make fetch hang to test loading state
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(<SettingsForm initialSettings={mockInitialSettings} />)

    const saveButton = screen.getByText('Save Settings')
    const resetButton = screen.getByText('Reset to Defaults')

    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument()
      expect(saveButton).toBeDisabled()
      expect(resetButton).toBeDisabled()
    })
  })

  it('should show character limits for text fields', () => {
    render(<SettingsForm initialSettings={mockInitialSettings} />)

    // Switch to SEO tab to see character limits
    fireEvent.click(screen.getByText('SEO'))

    expect(screen.getByText('(max 60 characters)')).toBeInTheDocument()
    expect(screen.getByText('(max 160 characters)')).toBeInTheDocument()
  })

  it('should show social media preview', () => {
    render(<SettingsForm initialSettings={mockInitialSettings} />)

    // Switch to Social tab
    fireEvent.click(screen.getByText('Social'))

    expect(screen.getByText('Social Media Preview')).toBeInTheDocument()
    expect(screen.getByText('Twitter')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })
})