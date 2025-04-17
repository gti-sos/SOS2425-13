//@ts-check
import { test, expect } from '@playwright/test';


// 🌍 URL base dinámica




// RUTA completa del recurso
const baseURL = 'https://sos2425-13.onrender.com/'
const PATH = '/water-supply-improvements';
const URL = `${baseURL}${PATH}`;

/* ------------------ TESTS E2E PARA SOS2425 ------------------ */

// 1. Página de inicio
test('Carga correctamente la página principal', async ({ page }) => {
  await page.goto(URL);
  await expect(page.getByRole('heading', { name: /Gestión de Recursos/i })).toBeVisible();
});

// 2. Cargar datos iniciales
test('Cargar datos iniciales', async ({ page }) => {
  await page.goto(URL);
  await page.getByRole('button', { name: 'Cargar datos iniciales' }).click();
  await expect(page.locator('.alert-success')).toBeVisible();
});

// 3. Crear recurso
test('Crear nuevo recurso', async ({ page }) => {
  await page.goto(URL);

  await page.getByPlaceholder('Año').fill('2026');
  await page.getByPlaceholder('Comunidad Autónoma').fill('Asturias');
  await page.getByPlaceholder('Cantidad').fill('123456');
  await page.getByPlaceholder('Población beneficiada').fill('3000');
  await page.getByPlaceholder('Proyectos').fill('4');

  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page.locator('.alert-success')).toHaveText(/Recurso creado correctamente/);
});

// 4. Eliminar todos los recursos
test('Eliminar todos los recursos', async ({ page }) => {
  await page.goto(URL);
  await page.getByRole('button', { name: 'Eliminar todo' }).click();
  await expect(page.locator('.alert-success')).toHaveText(/Todos los datos fueron eliminados/);
});

// 5. Buscar por intervalo de años
test('Buscar por intervalo', async ({ page }) => {
  await page.goto(URL);
  await page.getByPlaceholder('Desde').fill('2020');
  await page.getByPlaceholder('Hasta').fill('2023');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator('table')).toBeVisible();
});
