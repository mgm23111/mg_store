import { expect, test } from '@playwright/test';

test.describe('Legal Pages and Cookie Consent', () => {
  test('should display and persist cookie consent choice', async ({ page }) => {
    await page.goto('/terminos-condiciones');

    await expect(page.getByText('Usamos cookies para mejorar tu experiencia')).toBeVisible();
    await page.getByRole('button', { name: 'Aceptar' }).click();
    await expect(page.getByText('Usamos cookies para mejorar tu experiencia')).not.toBeVisible();

    await page.reload();
    await expect(page.getByText('Usamos cookies para mejorar tu experiencia')).not.toBeVisible();
  });

  test('should navigate to legal pages from footer', async ({ page }) => {
    await page.goto('/terminos-condiciones');

    await expect(page.getByRole('heading', { name: 'Terminos y Condiciones' })).toBeVisible();
    await page.getByRole('link', { name: 'Privacidad' }).click();
    await expect(page.getByRole('heading', { name: 'Politica de Privacidad' })).toBeVisible();

    await page.getByRole('link', { name: 'Cookies' }).first().click();
    await expect(page.getByRole('heading', { name: 'Politica de Cookies' })).toBeVisible();
  });
});
