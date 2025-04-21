import { test, expect } from '@playwright/test';



  
  test('Encabezado principal correcto', async ({ page }) => {
    await page.goto('/water-supply-improvements'); // Asegúrate de que la URL sea correcta
    let url = await page.url();
    // Verificar que el encabezado principal sea el esperado
    console.log(`URL: ${url}`)
    await expect(page).toHaveTitle(/Parques Nacionales/);
  });
  

