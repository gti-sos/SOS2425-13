// @ts-check
import { test, expect } from '@playwright/test';

// Título de la página
test('Título correcto del recurso "water-supply-improvements"', async ({ page }) => {
  await page.goto('localhost:5173/water-supply-improvements');
  await expect(page).toHaveTitle(/Gestión de Recursos de Abastecimiento de Agua/);
});

// Test para el encabezado principal
test('Encabezado principal correcto', async ({ page }) => {
  await page.goto('localhost:5173/water-supply-improvements');
  const heading = page.getByRole('heading', { name: 'Gestión de Recursos de Abastecimiento de Agua' });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('Gestión de Recursos de Abastecimiento de Agua');
});

// Test para los botones principales
test('Botones principales visibles y funcionales', async ({ page }) => {
  await page.goto('localhost:5173/water-supply-improvements');

  const buttons = [
    '💾 Cargar datos iniciales',
    '❌ Eliminar todo',
    'Crear',
    'Buscar',
    'Filtrar',
  ];

  for (const buttonName of buttons) {
    await expect(page.getByRole('button', { name: buttonName })).toBeVisible();
  }

  // Probar la funcionalidad de los botones
  await page.getByRole('button', { name: '💾 Cargar datos iniciales' }).click();
  await expect(page.getByText('Datos iniciales cargados correctamente')).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: '❌ Eliminar todo' }).click();
  await expect(page.getByRole('heading', { name: 'Confirmar eliminación masiva' })).toBeVisible();
  await page.getByRole('button', { name: 'Eliminar todos' }).click();
  await expect(page.getByText('Todos los parques nacionales han sido borrados')).toBeVisible();

  await page.getByRole('button', { name: 'Filtrar' }).click();
  await expect(page.locator('div:has(> input[placeholder="Año"])')).toBeVisible();
});

// Test para la tabla de recursos
test('Tabla de recursos visible con encabezados correctos y datos', async ({ page }) => {
  await page.goto('localhost:5173/water-supply-improvements');

  const table = page.locator('table');
  await expect(table).toBeVisible();

  const headers = ['Año', 'Comunidad Autónoma', 'Cantidad (€)', 'Población beneficiada', 'Proyectos', 'Acciones'];
  for (let i = 0; i < headers.length; i++) {
    await expect(page.locator('th').nth(i)).toContainText(headers[i]);
  }

  // Comprobar que la tabla tiene al menos un dato
  const rowCount = await page.locator('table tbody tr').count();
  expect(rowCount).toBeGreaterThanOrEqual(1);

  // Verificar datos de la primera fila
  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow.locator('td').nth(0)).toBeVisible();
  await expect(firstRow.locator('td').nth(1)).toBeVisible();
  await expect(firstRow.locator('td').nth(2)).toBeVisible();
  await expect(firstRow.locator('td').nth(3)).toBeVisible();
  await expect(firstRow.locator('td').nth(4)).toBeVisible();
  await expect(firstRow.locator('td').nth(5)).toBeVisible();
});

// Test para verificar funcionalidad de crear nuevo recurso
test('Formulario de crear recurso aparece al hacer clic en botón y los datos se guardan correctamente', async ({ page }) => {
  await page.goto('localhost:5173/water-supply-improvements');
  await page.waitForLoadState('networkidle');

  const createButton = page.getByRole('button', { name: /Crear/i });
  await expect(createButton).toBeVisible({ timeout: 5000 });
  await createButton.click();
  
  // Verificar que el formulario aparece y los campos están visibles
  await expect(page.getByRole('heading', { name: /Crear nuevo recurso/i })).toBeVisible();
  await expect(page.locator('#year')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#comunidad')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#cantidad')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#poblacion')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#proyectos')).toBeVisible({ timeout: 15000 });

  // Completar los campos y enviar el formulario
  await page.locator('#year').fill('2025');
  await page.locator('#comunidad').fill('Comunidad Test');
  await page.locator('#cantidad').fill('100000');
  await page.locator('#poblacion').fill('50000');
  await page.locator('#proyectos').fill('10');

  await page.getByRole('button', { name: 'Añadir' }).click();

  // Verificar que el nuevo recurso aparece en la tabla
  await expect(page.getByText('2025')).toBeVisible();
  await expect(page.getByText('Comunidad Test')).toBeVisible();
  await expect(page.getByText('100000')).toBeVisible();
  await expect(page.getByText('50000')).toBeVisible();
  await expect(page.getByText('10')).toBeVisible();
  await expect(page.getByText('Acciones')).toBeVisible();
});

// Test para editar un recurso
test('Funcionalidad de edición de recurso', async ({ page }) => {
  await page.goto('localhost:5173/water-supply-improvements');
  await page.waitForLoadState('networkidle');
  
  const editButton = page.locator('button:has-text("Editar")').first();
  await expect(editButton).toBeVisible({ timeout: 5000 });
  await editButton.click();
  
  // Verificar que los campos del formulario se completan con los datos actuales
  await expect(page.locator('#year')).toHaveValue('2025');
  await expect(page.locator('#comunidad')).toHaveValue('Comunidad Test');
  await expect(page.locator('#cantidad')).toHaveValue('100000');
  await expect(page.locator('#poblacion')).toHaveValue('50000');
  await expect(page.locator('#proyectos')).toHaveValue('10');

  // Actualizar los campos
  await page.locator('#year').fill('2026');
  await page.locator('#comunidad').fill('Comunidad Test Editada');
  await page.locator('#cantidad').fill('150000');
  await page.locator('#poblacion').fill('60000');
  await page.locator('#proyectos').fill('20');

  // Hacer clic en el botón de guardar
  await page.getByRole('button', { name: 'Guardar' }).click();

  // Verificar que los datos han sido actualizados en la tabla
  await expect(page.getByText('2026')).toBeVisible();
  await expect(page.getByText('Comunidad Test Editada')).toBeVisible();
  await expect(page.getByText('150000')).toBeVisible();
  await expect(page.getByText('60000')).toBeVisible();
  await expect(page.getByText('20')).toBeVisible();
});

// Test para verificar la paginación
test('Paginación funcional con cambio de página', async ({ page }) => {
  await page.goto('localhost:5173/water-supply-improvements');
  await page.waitForLoadState('networkidle');

  // Verificar que los controles de paginación están visibles
  await expect(page.getByText('Elementos por página:')).toBeVisible();
  await expect(page.getByRole('button', { name: '5' })).toBeVisible();
  await expect(page.getByRole('button', { name: '⬅️ Anterior' })).toBeVisible();
  await expect(page.getByRole('button', { name: '1' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Siguiente ➡️' })).toBeVisible();

  // Cambiar a la siguiente página
  await page.getByRole('button', { name: 'Siguiente ➡️' }).click();

  // Verificar que la página ha cambiado
  await expect(page.getByRole('button', { name: '2' })).toHaveClass(/btn-primary/);
  await expect(page.getByRole('button', { name: '⬅️ Anterior' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Siguiente ➡️' })).toBeVisible();
});

// Test para verificar la funcionalidad de búsqueda avanzada
test('Búsqueda avanzada y filtrado de recursos', async ({ page }) => {
  await page.goto('localhost:5173/water-supply-improvements');
  await page.waitForLoadState('networkidle');

  // Aplicar filtro de búsqueda por año
  await page.locator('input[placeholder="Año"]').fill('2025');
  await page.locator('input[placeholder="Comunidad Autónoma"]').fill('Comunidad Test');
  await page.getByRole('button', { name: 'Filtrar' }).click();

  // Verificar que los resultados han sido filtrados
  await expect(page.getByText('2025')).toBeVisible();
  await expect(page.getByText('Comunidad Test')).toBeVisible();

  // Limpiar filtros y verificar que la tabla se muestra sin filtros
  await page.getByRole('button', { name: 'Limpiar' }).click();
  await expect(page.locator('table tbody tr')).toHaveCount(5);
});

// Test para verificar el modal de confirmación de eliminación
test('Modal de confirmación al eliminar un recurso', async ({ page }) => {
  await page.goto('localhost:5173/water-supply-improvements');
  await page.waitForLoadState('networkidle');

  const deleteButton = page.locator('button:has-text("Eliminar")').first();
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();

  // Verificar que el modal de confirmación de eliminación aparece
  await expect(page.getByRole('heading', { name: 'Confirmar eliminación' })).toBeVisible();

  // Hacer clic en el botón de eliminar y verificar mensaje
  await page.getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByText('Recurso eliminado correctamente')).toBeVisible();
});
