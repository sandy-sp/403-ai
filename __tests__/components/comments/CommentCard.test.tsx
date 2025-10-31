import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommentCard } from '@/components/comments/CommentCard'

const mockComment = {
  id: '1',
  content: 'This is a test comment',
  createdAt: new Date('2024-01-01T12:00:00Z'),
  user: {
    id: 'user1',
    name: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg'
  }
}

describe('CommentCard', () => {
  it('should render comment content and author', () => {
    render(<CommentCard comment={mockComment} />)

    expect(screen.getByText('This is a test comment')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText(/ago/)).toBeInTheDocument()
  })

  it('should show avatar image when provided', () => {
    render(<CommentCard comment={mockComment} />)

    const avatar = screen.getByAltText('John Doe')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('should show default avatar when no avatarUrl', () => {
    const commentWithoutAvatar = {
      ...mockComment,
      user: { ...mockComment.user, avatarUrl: null }
    }

    render(<CommentCard comment={commentWithoutAvatar} />)

    expect(screen.getByText('J')).toBeInTheDocument() // First letter of name
  })

  it('should show edit and delete buttons for comment owner', () => {
    render(
      <CommentCard 
        comment={mockComment} 
        currentUserId="user1"
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )

    expect(screen.getByTitle('Edit comment')).toBeInTheDocument()
    expect(screen.getByTitle('Delete comment')).toBeInTheDocument()
  })

  it('should not show edit and delete buttons for non-owner', () => {
    render(
      <CommentCard 
        comment={mockComment} 
        currentUserId="user2"
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )

    expect(screen.queryByTitle('Edit comment')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Delete comment')).not.toBeInTheDocument()
  })

  it('should enter edit mode when edit button is clicked', () => {
    render(
      <CommentCard 
        comment={mockComment} 
        currentUserId="user1"
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )

    fireEvent.click(screen.getByTitle('Edit comment'))

    expect(screen.getByDisplayValue('This is a test comment')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should call onEdit when save button is clicked', async () => {
    const mockOnEdit = jest.fn()
    render(
      <CommentCard 
        comment={mockComment} 
        currentUserId="user1"
        onEdit={mockOnEdit}
        onDelete={jest.fn()}
      />
    )

    fireEvent.click(screen.getByTitle('Edit comment'))
    
    const textarea = screen.getByDisplayValue('This is a test comment')
    fireEvent.change(textarea, { target: { value: 'Updated comment' } })
    
    fireEvent.click(screen.getByText('Save'))

    expect(mockOnEdit).toHaveBeenCalledWith('1', 'Updated comment')
  })

  it('should call onDelete when delete button is clicked and confirmed', async () => {
    const mockOnDelete = jest.fn()
    
    // Mock window.confirm
    const originalConfirm = window.confirm
    window.confirm = jest.fn(() => true)

    render(
      <CommentCard 
        comment={mockComment} 
        currentUserId="user1"
        onEdit={jest.fn()}
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByTitle('Delete comment'))

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('1')
    })

    // Restore original confirm
    window.confirm = originalConfirm
  })

  it('should not call onDelete when delete is cancelled', () => {
    const mockOnDelete = jest.fn()
    
    // Mock window.confirm to return false
    const originalConfirm = window.confirm
    window.confirm = jest.fn(() => false)

    render(
      <CommentCard 
        comment={mockComment} 
        currentUserId="user1"
        onEdit={jest.fn()}
        onDelete={mockOnDelete}
      />
    )

    fireEvent.click(screen.getByTitle('Delete comment'))

    expect(mockOnDelete).not.toHaveBeenCalled()

    // Restore original confirm
    window.confirm = originalConfirm
  })

  it('should cancel edit mode when cancel button is clicked', () => {
    render(
      <CommentCard 
        comment={mockComment} 
        currentUserId="user1"
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )

    fireEvent.click(screen.getByTitle('Edit comment'))
    
    const textarea = screen.getByDisplayValue('This is a test comment')
    fireEvent.change(textarea, { target: { value: 'Changed content' } })
    
    fireEvent.click(screen.getByText('Cancel'))

    // Should be back to view mode with original content
    expect(screen.getByText('This is a test comment')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Changed content')).not.toBeInTheDocument()
  })
})