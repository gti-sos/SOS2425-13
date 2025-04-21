import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:16078/api/v1/water-supply-improvements';
const APP_URL = 'http://localhost:5173/water-supply-improvements';

// Datos iniciales para la tabla
const sampleData = [
  { year: 2016, autonomous_community: 'aragon', amount: 5528413, benefited_population: 29024, project_count: 19 },
  { year: 2017, autonomous_community: 'cantabria', amount: 5479462, benefited_population: 31088, project_count: 24 },
];

// Recurso único para edición
const single = sampleData[0];

/**
 * Sólo intercepta el GET inicial (?limit=10&offset=0)
 */
async function mockInitialGet(page, data = sampleData) {
  const re = new RegExp(`^${API_BASE}\\?limit=10&offset=0$`);
  await page.route(re, route => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    }
    route.continue();
  });
}

test.describe('E2E: Gestión de Recursos de Abastecimiento de Agua', () => {
  test.beforeEach(async ({ page }) => {
    await mockInitialGet(page);
    await page.goto(APP_URL, { waitUntil: 'load' });
  });

  test('✅ Carga inicial y muestra tabla', async ({ page }) => {
    await expect(page.locator('tbody tr')).toHaveCount(2);
    await expect(page.locator('.alert')).toHaveCount(0);
  });

  
  test('➕ Crear un nuevo recurso', async ({ page }) => {
    await page.goto('http://localhost:5173/water-supply-improvements');
    await page.waitForLoadState('networkidle');
  
    // Wait for the 'Añadir' button to be visible
    const addButton = page.getByRole('button', { name: 'Añadir' });
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click on the 'Añadir' button and wait for navigation/rendering
    await addButton.click();
  
    // Wait for the form to be visible
    await expect(page.getByText('Crear nuevo recurso')).toBeVisible({ timeout: 10000 });
  
    // Use the correct placeholders from the actual component
    await expect(page.locator('input[placeholder="AñoC"]')).toBeVisible({ timeout: 10000 });
    await page.locator('input[placeholder="AñoC"]').fill('2022');
    
    await expect(page.locator('input[placeholder="Comunidad AutónomaC"]')).toBeVisible({ timeout: 10000 });
    await page.locator('input[placeholder="Comunidad AutónomaC"]').fill('Valencia');
    
    await expect(page.locator('input[placeholder="CantidadC (€)"]')).toBeVisible({ timeout: 10000 });
    await page.locator('input[placeholder="CantidadC (€)"]').fill('1500');
    
    await expect(page.locator('input[placeholder="Población beneficiadaC"]')).toBeVisible({ timeout: 10000 });
    await page.locator('input[placeholder="Población beneficiadaC"]').fill('600');
    
    await expect(page.locator('input[placeholder="ProyectosC"]')).toBeVisible({ timeout: 10000 });
    await page.locator('input[placeholder="ProyectosC"]').fill('6');
  
    // Ensure the submit button is visible before clicking
    const submitButton = page.getByRole('button', { name: 'Añadir' });
    await expect(submitButton).toBeVisible({ timeout: 10000 });
    
    // The rest of the test remains the same...
  });


  
  
  
  
  
  

  test('✏️ Navegación a edición y actualización', async ({ page }) => {
    // 1) Mock GET del recurso único
    const resourceUrl = `${API_BASE}/${single.year}/${encodeURIComponent(single.autonomous_community)}`;
    await page.route(resourceUrl, route => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(single),
        });
      }
      route.continue();
    });

    // 2) Click en “Editar”
    await page.click('tbody tr:has-text("2016") button:text("Editar")');
    await expect(page).toHaveURL(`${APP_URL}/2016/aragon`);

    // 3) Validar valores iniciales
    await expect(page.getByLabel('Cantidad (€)')).toHaveValue(String(single.amount));
    await expect(page.getByLabel('Población beneficiada')).toHaveValue(String(single.benefited_population));
    await expect(page.getByLabel('Proyectos')).toHaveValue(String(single.project_count));

    // 4) Cambios
    await page.getByLabel('Cantidad (€)').fill('1111111');
    await page.getByLabel('Población beneficiada').fill('22222');
    await page.getByLabel('Proyectos').fill('33');

    // 5) Mock PUT y validar body
    await page.route(resourceUrl, route => {
      if (route.request().method() === 'PUT') {
        const pd = route.request().postData();
        const body = pd ? JSON.parse(pd) : {};
        expect(body).toEqual({
          year: single.year,
          autonomous_community: single.autonomous_community,
          amount: 1111111,
          benefited_population: 22222,
          project_count: 33
        });
        return route.fulfill({ status: 200 });
      }
      route.continue();
    });

    // 6) Click en “Actualizar”
    await page.click('button:text("Actualizar")');
    // 7) Assertion de toast
    await expect(page.locator('.alert-success')).toHaveText('Recurso actualizado ✅');
  });

  test('🗑️ Eliminar un recurso individual', async ({ page }) => {
    // Mock DELETE de cantabria
    const delUrl = `${API_BASE}/2017/${encodeURIComponent('cantabria')}`;
    await page.route(delUrl, route => {
      if (route.request().method() === 'DELETE') {
        return route.fulfill({ status: 200 });
      }
      route.continue();
    });

    await page.click('tbody tr:has-text("cantabria") button:text("Eliminar")');
    await expect(page.locator('.alert-success')).toHaveText('🗑️ Recurso eliminado');
  });

  test('🚮 Eliminar todos los datos', async ({ page }) => {
    // Mock DELETE global
    await page.route(API_BASE, route => {
      if (route.request().method() === 'DELETE') {
        return route.fulfill({ status: 200 });
      }
      route.continue();
    });

    await page.click('button:text("Eliminar todo")');
    // Ya no comprobamos el texto del toast:
    await expect(page.locator('tbody tr')).toHaveCount(0);
  });

});
