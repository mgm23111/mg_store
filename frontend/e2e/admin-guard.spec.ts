import { expect, test } from '@playwright/test';

test('should redirect unauthenticated users from admin dashboard to login', async ({ page }) => {
  await page.goto('/admin/dashboard');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('button', { name: /Iniciar/i })).toBeVisible();
});
