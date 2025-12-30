import { expect, test } from '@playwright/test'

test.describe.configure({
  mode: 'serial',
})

test.describe('rendering', () => {
  test('has landing page', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/scaling.cloud/)
  })

  test('has sign in page', async ({ page }) => {
    await page.goto('/sign-in')

    await expect(page).toHaveTitle(/Sign In | scaling.cloud/)
  })
})
