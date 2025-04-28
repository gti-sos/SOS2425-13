// @ts-check
import { test, expect } from '@playwright/test';

// Título de la página
test('Título correcto del recurso "forest-fires"', async ({ page }) => {
  await page.goto('/forest-fires');
  let url = await page.url();

	console.log(`URL: ${url}`)
  await expect(page).toHaveTitle(/Incendios Forestales/);
});
