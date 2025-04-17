// @ts-check
import { test, expect } from '@playwright/test';

test('Crear y borrar ayuda de mejora del suministro de agua', async ({ page }) => {
  // Datos de prueba
  const testYear = "2030";
  const testCommunity = "__TEST_COMUNIDAD__";
  const testAmount = "9999999";
  const testPopulation = "12345";
  const testProjects = "77";

  // Ir al frontend
  await page.goto('http://localhost:5173');

  // Ir a la vista del recurso
  await page.getByRole('link', { name: 'Front water-supply-improvements' }).click();

  // Click en botón "Crear"
  await page.getByRole('button', { name: 'Crear' }).first().click();

  // Esperar que se abra el formulario
  await page.getByRole('heading', { name: 'Crear Mejora del Suministro de Agua' }).waitFor();

  // Rellenar campos (ajusta los selectores si es necesario)
  await page.getByRole('textbox').nth(0).fill(testYear);
  await page.getByRole('textbox').nth(1).fill(testCommunity);
  await page.getByRole('textbox').nth(2).fill(testAmount);
  await page.getByRole('textbox').nth(3).fill(testPopulation);
  await page.getByRole('textbox').nth(4).fill(testProjects);

  // Enviar el formulario
  await page.getByRole('button', { name: 'Crear' }).click();

  // Buscar fila recién creada
  const row = page.locator('tr').filter({ hasText: testYear });

  // Verificar contenido
  await expect(row).toContainText(testCommunity);
  await expect(row).toContainText(testAmount);
  await expect(row).toContainText(testPopulation);
  await expect(row).toContainText(testProjects);

  // Borrar el recurso
  const deleteButton = row.getByRole('button', { name: 'Borrar' });
  await deleteButton.click();

  // Verificar que ya no existe
  await expect(row).toHaveCount(0);
});
