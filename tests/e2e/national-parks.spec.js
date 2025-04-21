// @ts-check
import { test, expect } from '@playwright/test';

// Título de la página
test('Título correcto del recurso "national-parks"', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  await expect(page).toHaveTitle(/Parques Nacionales/);
});

// Test para el encabezado principal
test('Encabezado principal correcto', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  const heading = page.getByRole('heading', { name: 'Parques Nacionales de España' });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('Parques Nacionales de España');
});

// Test para los botones principales
test('Botones principales visibles', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  await expect(page.getByRole('button', { name: '❌ Borrar todo' })).toBeVisible();
  await expect(page.getByRole('button', { name: '💾 Cargar datos iniciales' })).toBeVisible();
  await expect(page.getByRole('button', { name: ' ➕  Crear Parque' })).toBeVisible();
  await expect(page.getByRole('button', { name: ' 🔥 Búsqueda rápida' })).toBeVisible();
  await expect(page.getByRole('button', { name: ' 🔍 Filtrar parques' })).toBeVisible();
});

// Test para la tabla de parques
test('Tabla de parques visible con encabezados correctos', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  // Verificar que la tabla existe
  const table = page.locator('table');
  await expect(table).toBeVisible();

  // Verificar encabezados de columna
  await expect(page.locator('th').nth(0)).toContainText('Nombre');
  await expect(page.locator('th').nth(1)).toContainText('Fecha de declaración');
  await expect(page.locator('th').nth(2)).toContainText('Comunidad Autónoma');
  await expect(page.locator('th').nth(3)).toContainText('Área inicial');
  await expect(page.locator('th').nth(4)).toContainText('Área actual');
  await expect(page.locator('th').nth(5)).toContainText('Acciones');
});

// Test para verificar funcionalidad de crear parque
test('Formulario de crear parque aparece al hacer clic en botón', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  // Esperar a que la página se cargue completamente
  await page.waitForLoadState('networkidle');
  
  // Usar un selector más flexible para el botón
  const createButton = page.getByRole('button', { name: /Crear Parque/i });
  
  await expect(createButton).toBeVisible({ timeout: 5000 });
  
  // Hacer clic y verificar el console log
  console.log('Haciendo clic en el botón Crear Parque');
  await createButton.click();
  
  // Esperar a que aparezca el formulario o algún elemento contenedor del formulario
  // Primero, buscar el encabezado del formulario
  await expect(page.getByRole('heading', { name: /Crear Nuevo Parque/i })).toBeVisible({ timeout: 10000 });
  
  // Usar selectores de ID en lugar de getByLabel para ser más robustos
  await expect(page.locator('#parkName')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#declarationDate')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#community')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#initialArea')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#currentArea')).toBeVisible({ timeout: 15000 });
});

// Test para verificar botones del formulario de crear parque
test('Botones de crear y limpiar en el formulario de crear parque', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  // Esperar a que la página cargue completamente
  await page.waitForLoadState('networkidle');
  
  // Examinar el HTML visible para debugging
  console.log('Haciendo clic en el botón Crear Parque');
  
  // Usar un selector exacto con los espacios correctos del botón
  await page.getByRole('button', { name: ' ➕  Crear Parque' }).click();
  
  // Esperar a que cualquier parte del formulario sea visible primero
  await expect(page.locator('div:has(> h4:text("Crear Nuevo Parque Nacional"))')).toBeVisible({ 
    timeout: 10000 
  });
  
  // Luego verificar los botones
  await expect(page.getByRole('button', { name: 'Crear' })).toBeVisible({ timeout: 5000 });
  await expect(page.locator('button:has-text("Limpiar")')).toBeVisible({ timeout: 5000 });
});

// Test para verificar la funcionalidad de búsqueda rápida
test('Formulario de búsqueda rápida aparece al hacer clic en botón', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  // Esperar a que la página se cargue completamente
  await page.waitForLoadState('networkidle');

  // Obtener el botón y verificar que existe
  const searchButton = page.getByRole('button', { name: ' 🔥 Búsqueda rápida' });
  await expect(searchButton).toBeVisible({ timeout: 5000 });
  
  // Hacer clic y esperar
  await searchButton.click();
  
  // Primero verificar que el contenedor del formulario aparece
  await expect(
    page.locator('div:has(> div:has-text("Búsqueda rápida:"))')
  ).toBeVisible({ timeout: 10000 });
  
  // Luego verificar los campos específicos con selectores más flexibles
  await expect(
    page.locator('input[placeholder*="Comunidad"]')
  ).toBeVisible({ timeout: 5000 });
  
  await expect(
    page.locator('input[placeholder="Año"]')
  ).toBeVisible({ timeout: 5000 });

  // Verificar botones del formulario
  await expect(page.getByRole('button', { name: 'Buscar por Comunidad y Año' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Limpiar' })).toBeVisible();
});

// Test para verificar la funcionalidad de filtrado avanzado
test('Formulario de filtrado avanzado aparece al hacer clic en botón', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  // Esperar a que la página se cargue completamente
  await page.waitForLoadState('networkidle');

  // Usar un selector más preciso y verificar que el botón esté visible
  const filterButton = page.getByRole('button', { name: ' 🔍 Filtrar parques' });
  await expect(filterButton).toBeVisible({ timeout: 5000 });
  
  // Hacer clic y esperar
  await filterButton.click();
  
  // Primero verificar que aparece el contenedor del formulario
  await expect(
    page.locator('div:has(> h4:text("Filtrar Parques Nacionales"))')
  ).toBeVisible({ timeout: 10000 });
  
  // Luego verificar el encabezado específico
  await expect(
    page.getByRole('heading', { name: 'Filtrar Parques Nacionales' })
  ).toBeVisible({ timeout: 10000 });

  // Verificar campos del formulario con timeouts explícitos
  await expect(page.locator('#searchName')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#searchCommunity')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#searchFrom')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#searchTo')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#searchInitAreaMin')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#searchInitAreaMax')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#searchCurrAreaMin')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#searchCurrAreaMax')).toBeVisible({ timeout: 5000 });

  // Verificar botones
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('button', { name: 'Limpiar' })).toBeVisible({ timeout: 5000 });
});



// Test para verificar ordenación por columnas
test('Ordenación de la tabla por columnas', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  // Esperar a que la página se cargue completamente
  await page.waitForLoadState('networkidle');

  // Verificar que las columnas tienen indicadores de ordenación
  await expect(page.locator('th').first()).toHaveAttribute('style', /cursor: pointer/);

  // Obtener el estado actual de ordenación
  const initialSortIndicator = await page.locator('th').first().textContent() ?? '';
  const initialSortIsAsc = initialSortIndicator.includes('↑');
  
  // Hacer clic en la columna Nombre para cambiar la ordenación
  await page.locator('th').first().click();
  
  // Esperar a que se complete la ordenación
  await page.waitForTimeout(1000);

  // Verificar que el indicador ha cambiado al opuesto del inicial
  if (initialSortIsAsc) {
    await expect(page.locator('th').first()).toContainText('Nombre ↓', { timeout: 10000 });
  } else {
    await expect(page.locator('th').first()).toContainText('Nombre ↑', { timeout: 10000 });
  }
  
  // Hacer clic de nuevo para volver al estado original
  await page.locator('th').first().click({ force: true });
  
  // Esperar a que se complete la ordenación
  await page.waitForTimeout(1000);

  // Verificar que ha vuelto al estado original
  if (initialSortIsAsc) {
    await expect(page.locator('th').first()).toContainText('Nombre ↑', { timeout: 10000 });
  } else {
    await expect(page.locator('th').first()).toContainText('Nombre ↓', { timeout: 10000 });
  }
});

// Test para verificar la navegación a detalles de un parque
test('Navegación a detalles de un parque', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  // Esperar a que la página se cargue completamente
  await page.waitForLoadState('networkidle');

  // Verificar si hay datos en la tabla
  const initialRowCount = await page.locator('table tbody tr').count();
  
  // Cargar datos iniciales si la tabla está vacía
  if (initialRowCount === 0) {
    // Cargar datos iniciales
    const loadButton = page.getByRole('button', { name: '💾 Cargar datos iniciales' });
    await expect(loadButton).toBeVisible({ timeout: 5000 });
    await loadButton.click();
    
    // Esperar a que la tabla se actualice con los datos
    await page.waitForSelector('table tbody tr', { timeout: 15000 });
  }
  
  // Verificar que hay al menos un parque en la tabla
  const rowCount = await page.locator('table tbody tr').count();
  expect(rowCount).toBeGreaterThanOrEqual(1);

  // Obtener el nombre del primer parque (usando ?? para asegurar que no sea null)
  const parkName = await page.locator('table tbody tr').first().locator('td').first().textContent() ?? '';

  // Hacer clic en el enlace del parque
  await page.locator('table tbody tr').first().locator('td a').first().click();

  // Verificar que navegó a la página de detalles (URL contiene el nombre del parque)
  await expect(page).toHaveURL(new RegExp(`/national-parks/${encodeURIComponent(parkName)}`));
});

// Test para el modal de confirmación de eliminación
test('Modal de confirmación al eliminar un parque', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  // Esperar a que la página se cargue completamente
  await page.waitForLoadState('networkidle');

  // Verificar si ya hay datos en la tabla
  const initialRowCount = await page.locator('table tbody tr').count();
  
  // Solo intentar cargar datos iniciales si no hay datos
  if (initialRowCount === 0) {
    // Primero cargar datos iniciales para asegurar que haya parques
    const loadButton = page.getByRole('button', { name: '💾 Cargar datos iniciales' });
    await expect(loadButton).toBeVisible({ timeout: 5000 });
    await loadButton.click();
    
    // Esperar a que la tabla se actualice con los datos
    await page.waitForSelector('table tbody tr', { timeout: 15000 });
  }
  
  // Verificar que hay al menos un parque en la tabla
  const rowCount = await page.locator('table tbody tr').count();
  expect(rowCount).toBeGreaterThanOrEqual(1);

  // Hacer clic en el botón Eliminar del primer parque
  await page.locator('table tbody tr').first().getByRole('button', { name: 'Eliminar' }).click();

  // Verificar que aparece el modal de confirmación
  await expect(page.getByRole('heading', { name: 'Confirmar eliminación' })).toBeVisible();
  await expect(page.getByText('¿Estás seguro que deseas eliminar el parque nacional')).toBeVisible();

  // Verificar botones del modal
  await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Eliminar' }).nth(1)).toBeVisible();

  // Cancelar la eliminación
  await page.getByRole('button', { name: 'Cancelar' }).click();

  // Verificar que el modal desaparece
  await expect(page.getByRole('heading', { name: 'Confirmar eliminación' })).not.toBeVisible();
});

// Test para el modal de confirmación de eliminación masiva
test('Modal de confirmación al eliminar todos los parques', async ({ page }) => {
  await page.goto('/national-parks');
  let url = await page.url();

	console.log(`URL: ${url}`)
  // Esperar a que la página se cargue completamente
  await page.waitForLoadState('networkidle');

  // Verificar que el botón Borrar todo esté visible antes de hacer clic
  const deleteAllButton = page.getByRole('button', { name: '❌ Borrar todo' });
  await expect(deleteAllButton).toBeVisible({ timeout: 5000 });
  
  // Hacer clic y esperar
  await deleteAllButton.click();
  
  // Usar un selector más flexible y aumentar el timeout
  await expect(
    page.locator('div.modal-header:has-text("Confirmar eliminación masiva")')
  ).toBeVisible({ timeout: 10000 });
  
  // Verificar el encabezado específico una vez que sabemos que el modal está visible
  await expect(
    page.getByRole('heading', { name: 'Confirmar eliminación masiva' })
  ).toBeVisible({ timeout: 5000 });

  // Verificar botones del modal
  await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Eliminar todos' })).toBeVisible();

  // Cancelar la eliminación
  await page.getByRole('button', { name: 'Cancelar' }).click();

  // Verificar que el modal desaparece
  await expect(
    page.getByRole('heading', { name: 'Confirmar eliminación masiva' })
  ).not.toBeVisible({ timeout: 5000 });
});





