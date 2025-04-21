// @ts-check
import { test, expect } from '@playwright/test';

// Título de la página
test('Título correcto del recurso "national-parks"', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  await expect(page).toHaveTitle(/Parques Nacionales/);
});
