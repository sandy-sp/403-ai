// E2E Test Example for Comment System
// Note: This requires Playwright to be installed and configured
// Run: npm install -D @playwright/test

import { test, expect } from '@playwright/test'

test.describe('Comment System E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test data and login
    await page.goto('/signin')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin')
  })

  test('should create and display a comment', async ({ page }) => {
    // Navigate to a blog post
    await page.goto('/blog/test-post')

    // Fill out comment form
    await page.fill('textarea[placeholder="Share your thoughts..."]', 'This is a test comment')
    
    // Submit comment
    await page.click('button:has-text("Post Comment")')
    
    // Wait for success message
    await expect(page.locator('text=Comment submitted! It will appear after approval.')).toBeVisible()
    
    // Verify form is cleared
    await expect(page.locator('textarea[placeholder="Share your thoughts..."]')).toHaveValue('')
  })

  test('should moderate comments in admin panel', async ({ page }) => {
    // Navigate to admin comments
    await page.goto('/admin/comments')
    
    // Verify comments table is visible
    await expect(page.locator('h1:has-text("Comment Moderation")')).toBeVisible()
    
    // Filter by pending comments
    await page.click('button:has-text("Pending")')
    
    // Approve first comment
    await page.click('button[title="Approve"]:first-of-type')
    
    // Verify success message
    await expect(page.locator('text=Comment approved successfully')).toBeVisible()
  })

  test('should handle comment rate limiting', async ({ page }) => {
    await page.goto('/blog/test-post')
    
    // Submit multiple comments quickly
    for (let i = 0; i < 6; i++) {
      await page.fill('textarea[placeholder="Share your thoughts..."]', `Comment ${i}`)
      await page.click('button:has-text("Post Comment")')
      
      if (i < 5) {
        await expect(page.locator('text=Comment submitted!')).toBeVisible()
      } else {
        // Should hit rate limit on 6th comment
        await expect(page.locator('text=Too many requests')).toBeVisible()
      }
    }
  })

  test('should edit own comment', async ({ page }) => {
    await page.goto('/blog/test-post')
    
    // Create a comment first
    await page.fill('textarea[placeholder="Share your thoughts..."]', 'Original comment')
    await page.click('button:has-text("Post Comment")')
    
    // Wait for admin to approve (in real test, you'd mock this)
    // For demo purposes, assume comment is approved
    
    // Find and edit the comment
    await page.click('button[title="Edit comment"]')
    await page.fill('textarea', 'Edited comment')
    await page.click('button:has-text("Save")')
    
    // Verify comment was updated
    await expect(page.locator('text=Edited comment')).toBeVisible()
  })

  test('should delete own comment', async ({ page }) => {
    await page.goto('/blog/test-post')
    
    // Find and delete a comment
    await page.click('button[title="Delete comment"]')
    
    // Confirm deletion
    page.on('dialog', dialog => dialog.accept())
    
    // Verify comment was deleted
    await expect(page.locator('text=Comment deleted successfully')).toBeVisible()
  })
})

test.describe('Settings Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/signin')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin')
  })

  test('should update site settings', async ({ page }) => {
    // Navigate to settings
    await page.goto('/admin/settings')
    
    // Update site name
    await page.fill('input[value*="Site"]', 'Updated Site Name')
    
    // Switch to SEO tab
    await page.click('button:has-text("SEO")')
    
    // Update meta title
    await page.fill('input[placeholder="SEO title"]', 'Updated Meta Title')
    
    // Save settings
    await page.click('button:has-text("Save Settings")')
    
    // Verify success message
    await expect(page.locator('text=Settings saved successfully')).toBeVisible()
  })

  test('should validate settings input', async ({ page }) => {
    await page.goto('/admin/settings')
    
    // Clear required field
    await page.fill('input[value*="Site"]', '')
    
    // Try to save
    await page.click('button:has-text("Save Settings")')
    
    // Should show validation error
    await expect(page.locator('text=This field is required')).toBeVisible()
  })

  test('should reset settings to defaults', async ({ page }) => {
    await page.goto('/admin/settings')
    
    // Click reset button
    await page.click('button:has-text("Reset to Defaults")')
    
    // Confirm reset
    page.on('dialog', dialog => dialog.accept())
    
    // Verify success message
    await expect(page.locator('text=Settings reset to defaults')).toBeVisible()
  })
})

test.describe('Analytics Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/signin')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin')
  })

  test('should display analytics dashboard', async ({ page }) => {
    await page.goto('/admin/analytics')
    
    // Verify main elements are visible
    await expect(page.locator('h1:has-text("Analytics")')).toBeVisible()
    await expect(page.locator('text=Key Metrics')).toBeVisible()
    await expect(page.locator('text=Trends')).toBeVisible()
    await expect(page.locator('text=Top Performing Content')).toBeVisible()
  })

  test('should change date range', async ({ page }) => {
    await page.goto('/admin/analytics')
    
    // Click date range picker
    await page.click('button:has-text("Last 30 days")')
    
    // Select different range
    await page.click('button:has-text("Last 7 days")')
    
    // Verify charts update (check for loading state)
    await expect(page.locator('text=Loading analytics...')).toBeVisible()
    await expect(page.locator('text=Loading analytics...')).not.toBeVisible()
  })

  test('should export analytics data', async ({ page }) => {
    await page.goto('/admin/analytics')
    
    // Click export button
    await page.click('button:has-text("Overview Report")')
    
    // Verify download starts (in real test, you'd check for download)
    await expect(page.locator('text=Preparing export...')).toBeVisible()
  })
})