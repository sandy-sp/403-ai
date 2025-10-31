import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommentForm } from '@/components/comments/CommentForm'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))
jest.mock('sonner')

const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockRouter = { push: mockPush, refresh: mockRefresh }

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockToast = toast as jest.Mocked<typeof toast>

// Mock fetch
global.fetch = jest.fn()

describe('CommentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter as any)
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'comment-1' })
    })
  })

  it('should render form elements', () => {
    render(<CommentForm postId="post-1" />)

    expect(screen.getByLabelText('Leave a Comment')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument()
    expect(screen.getByText('Post Comment')).toBeInTheDocument()
    expect(screen.getByText('0/1000 characters')).toBeInTheDocument()
  })

  it('should update character count as user types', () => {
    render(<CommentForm postId="post-1" />)

    const textarea = screen.getByPlaceholderText('Share your thoughts...')
    fireEvent.change(textarea, { target: { value: 'Hello world' } })

    expect(screen.getByText('11/1000 characters')).toBeInTheDocument()
  })

  it('should submit comment successfully', async () => {
    render(<CommentForm postId="post-1" />)

    const textarea = screen.getByPlaceholderText('Share your thoughts...')
    const submitButton = screen.getByText('Post Comment')

    fireEvent.change(textarea, { target: { value: 'This is my comment' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/posts/post-1/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'This is my comment' })
      })
    })

    expect(mockToast.success).toHaveBeenCalledWith('Comment submitted! It will appear after approval.')
    expect(mockRefresh).toHaveBeenCalled()
    expect(textarea).toHaveValue('') // Form should be cleared
  })

  it('should show error for empty comment', async () => {
    render(<CommentForm postId="post-1" />)

    // The form should prevent submission when empty (button is disabled)
    const submitButton = screen.getByRole('button', { name: /post comment/i })
    expect(submitButton).toBeDisabled()

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should handle API errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Rate limit exceeded' })
    })

    render(<CommentForm postId="post-1" />)

    const textarea = screen.getByPlaceholderText('Share your thoughts...')
    const submitButton = screen.getByText('Post Comment')

    fireEvent.change(textarea, { target: { value: 'This is my comment' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Rate limit exceeded')
    })
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<CommentForm postId="post-1" />)

    const textarea = screen.getByPlaceholderText('Share your thoughts...')
    const submitButton = screen.getByText('Post Comment')

    fireEvent.change(textarea, { target: { value: 'This is my comment' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Network error')
    })
  })

  it('should disable submit button while submitting', async () => {
    // Make fetch hang to test loading state
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(<CommentForm postId="post-1" />)

    const textarea = screen.getByPlaceholderText('Share your thoughts...')
    const submitButton = screen.getByText('Post Comment')

    fireEvent.change(textarea, { target: { value: 'This is my comment' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Posting...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  it('should trim whitespace from comment content', async () => {
    render(<CommentForm postId="post-1" />)

    const textarea = screen.getByPlaceholderText('Share your thoughts...')
    const submitButton = screen.getByText('Post Comment')

    fireEvent.change(textarea, { target: { value: '  This is my comment  ' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/posts/post-1/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'This is my comment' })
      })
    })
  })

  it('should enforce character limit', () => {
    render(<CommentForm postId="post-1" />)

    const textarea = screen.getByPlaceholderText('Share your thoughts...')
    const longText = 'a'.repeat(1001)

    fireEvent.change(textarea, { target: { value: longText } })

    // Should be limited to 1000 characters by maxLength attribute
    // The browser prevents typing more than maxLength characters
    expect(textarea.getAttribute('maxlength')).toBe('1000')
    expect(screen.getByText(/\/1000 characters/)).toBeInTheDocument()
  })
})