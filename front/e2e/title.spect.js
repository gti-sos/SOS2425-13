//@ts-check
import { test, expect } from'@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('https://sos2425-13.onrender.com/');
  
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/SOS2425-13/);
  });