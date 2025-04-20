// @ts-check
import { test, expect } from '@playwright/test';

// Título de la página
test('Título correcto del recurso "national-parks"', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');
  await expect(page).toHaveTitle(/Parques Nacionales/);
});

// Test para el encabezado principal
test('Encabezado principal correcto', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');
  const heading = page.getByRole('heading', { name: 'Parques Nacionales de España' });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('Parques Nacionales de España');
});

// Test para los botones principales
test('Botones principales visibles', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');

  await expect(page.getByRole('button', { name: '❌ Borrar todo' })).toBeVisible();
  await expect(page.getByRole('button', { name: '💾 Cargar datos iniciales' })).toBeVisible();
  await expect(page.getByRole('button', { name: ' ➕  Crear Parque' })).toBeVisible();
  await expect(page.getByRole('button', { name: ' 🔥 Búsqueda rápida' })).toBeVisible();
  await expect(page.getByRole('button', { name: ' 🔍 Filtrar parques' })).toBeVisible();
});

// Test para la tabla de parques
test('Tabla de parques visible con encabezados correctos', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');

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
  await page.goto('localhost:5173/national-parks');
  
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
  await page.goto('localhost:5173/national-parks');
  
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
  await page.goto('localhost:5173/national-parks');
  
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
  await page.goto('localhost:5173/national-parks');
  
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

// Test para comprobar la paginación
test('Controles de paginación visibles y funcionales', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');

  // Verificar que los elementos de paginación están presentes
  await expect(page.getByText('Elementos por página:')).toBeVisible();
  await expect(page.getByRole('button', { name: '5' })).toBeVisible();
  await expect(page.getByRole('button', { name: '⬅️ Anterior' })).toBeVisible();
  await expect(page.getByRole('button', { name: '1' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Siguiente ➡️' })).toBeVisible();

  // Verificar que muestra correctamente el rango de elementos
  await expect(page.getByText(/Mostrando \d+ a \d+ de \d+ parques/)).toBeVisible();

  // Probar navegación a otra página
  await page.getByRole('button', { name: '2' }).click();

  // Verificar que cambió la página (el botón 2 debe estar deshabilitado/activo)
  await expect(page.getByRole('button', { name: '2', exact: true })).toHaveClass(/btn-primary/);
});

// Test para verificar ordenación por columnas
test('Ordenación de la tabla por columnas', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');
  
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
  await page.goto('localhost:5173/national-parks');
  
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
  await page.goto('localhost:5173/national-parks');
  
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
  await page.goto('localhost:5173/national-parks');
  
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
// Test para verificar el funcionamiento de creación de un parque
/*
1- Verificar primero que el parque se ha creado correctamente
2- Cerrar manualmente el formulario haciendo clic en el botón "❌ Cancelar"
3- Después verificar que el formulario ya no es visible
*/
test('Creación de un nuevo parque', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');

  // Wait for page to be fully loaded before clicking
  await page.waitForLoadState('networkidle');

  // Use a more precise selector for the button and ensure it's visible
  const createButton = page.getByRole('button', { name: ' ➕  Crear Parque' });
  await expect(createButton).toBeVisible({ timeout: 10000 });
  
  // Click and wait for navigation/rendering
  await createButton.click();
  
  // Wait for the form header to appear, confirming the form is rendered
  await expect(page.getByText('Crear Nuevo Parque Nacional')).toBeVisible({ timeout: 10000 });
  
  // Explicitly wait for each input field to be visible before interacting
  await expect(page.locator('#parkName')).toBeVisible({ timeout: 10000 });
  await page.locator('#parkName').fill('Parque Test Playwright');
  
  await expect(page.locator('#declarationDate')).toBeVisible({ timeout: 10000 });
  await page.locator('#declarationDate').fill('2023');
  
  await expect(page.locator('#community')).toBeVisible({ timeout: 10000 });
  await page.locator('#community').fill('Test Community');
  
  await expect(page.locator('#initialArea')).toBeVisible({ timeout: 10000 });
  await page.locator('#initialArea').fill('10000');
  
  await expect(page.locator('#currentArea')).toBeVisible({ timeout: 10000 });
  await page.locator('#currentArea').fill('12000');

  // Ensure the submit button is visible before clicking
  const submitButton = page.getByRole('button', { name: 'Crear' });
  await expect(submitButton).toBeVisible({ timeout: 10000 });
  
  // Click submit button
  await submitButton.click();
  
  // Verificar que el nuevo parque aparece en la tabla (confirmando que se creó correctamente)
  await expect(page.getByText('Parque Test Playwright')).toBeVisible({ timeout: 15000 });
  
  // Esperar mensaje de éxito
  await expect(page.getByText('Parque nacional creado correctamente')).toBeVisible({ timeout: 10000 });
  
  // Verificar que el formulario se ha cerrado automáticamente
  await expect(page.locator('#parkName')).not.toBeVisible({ timeout: 10000 });
  
  // Verificar que el botón ha vuelto a su estado "Crear Parque"
  await expect(page.getByRole('button', { name: ' ➕  Crear Parque' })).toBeVisible({ timeout: 10000 });
});

// Test para verificar la funcionalidad de cargar datos iniciales
test('Cargar datos iniciales', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');
  
  // Esperar a que la página se cargue completamente
  await page.waitForLoadState('networkidle');

  // Verificar que el botón Borrar todo esté visible antes de hacer clic
  const deleteAllButton = page.getByRole('button', { name: '❌ Borrar todo' });
  await expect(deleteAllButton).toBeVisible({ timeout: 5000 });
  
  // Hacer clic y esperar a que aparezca el modal
  await deleteAllButton.click();
  
  // Esperar a que aparezca el modal de confirmación
  await expect(page.getByRole('heading', { name: 'Confirmar eliminación masiva' })).toBeVisible({ timeout: 10000 });
  
  // Buscar el botón dentro del modal usando un selector más flexible
  const confirmButton = page.locator('button:has-text("Eliminar todos")');
  await expect(confirmButton).toBeVisible({ timeout: 10000 });
  
  // Hacer clic en el botón
  await confirmButton.click();

  // Esperar mensaje de confirmación
  await expect(page.getByText(/Todos los parques nacionales han sido borrados/i)).toBeVisible({ timeout: 10000 });

  // Cargar datos iniciales
  await page.getByRole('button', { name: '💾 Cargar datos iniciales' }).click();

  // Verificar mensaje de éxito
  await expect(page.getByText(/Datos iniciales cargados correctamente/i)).toBeVisible({ timeout: 10000 });
  
  // Esperar explícitamente a que aparezcan filas en la tabla
  await page.waitForSelector('table tbody tr', { timeout: 15000 });
  
  // Verificar que se muestran datos en la tabla
  const rowCount = await page.locator('table tbody tr').count();
  expect(rowCount).toBeGreaterThanOrEqual(1);
});

// Test para el cambio en elementos por página
test('Cambio en elementos por página', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');

  // Verificar elementos iniciales por página (por defecto 5)
  await expect(page.locator('table tbody tr')).toHaveCount(5);

  // Hacer clic en el dropdown de elementos por página
  await page.getByRole('button', { name: '5' }).click();

  // Seleccionar 10 elementos por página
  await page.getByRole('button', { name: '10' }).click();
  
  // Esperar a que la tabla se actualice
  await page.waitForTimeout(1000);
  
  // Verificar que ahora se muestran hasta 10 elementos
  const rowCount = await page.locator('table tbody tr').count();
  expect(rowCount).toBeGreaterThanOrEqual(5);
  expect(rowCount).toBeLessThanOrEqual(10);
});

// Test para verificar la búsqueda rápida (ahora como test independiente)
test('Búsqueda rápida por comunidad y año', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');

  // Verificar si ya hay datos en la tabla
  const initialRowCount = await page.locator('table tbody tr').count();
  
  // Solo cargar datos iniciales si no hay datos
  if (initialRowCount === 0) {
    // Cargar datos iniciales
    await page.getByRole('button', { name: '💾 Cargar datos iniciales' }).click();
    
    // Esperar a que los datos aparezcan en la tabla (sin depender de la alerta)
    await page.waitForSelector('table tbody tr', { timeout: 15000 });
  } else {
    console.log('Los datos ya están cargados, omitiendo la carga inicial');
  }
  
  // Esperar a que la página se cargue completamente
  await page.waitForLoadState('networkidle');

  // Asegurarse de que el botón esté completamente visible
  const searchButton = page.getByRole('button', { name: ' 🔥 Búsqueda rápida' });
  await expect(searchButton).toBeVisible({ timeout: 5000 });
  
  // Hacer clic y esperar
  await searchButton.click();
  
  // Verificar primero que el contenedor del formulario aparece
  await expect(page.locator('div:has(> div:has-text("Búsqueda rápida:"))')).toBeVisible({
    timeout: 10000
  });
  
  // Luego interactuar con los campos usando selectores más flexibles
  const communityInput = page.locator('input[placeholder*="Comunidad"]');
  await expect(communityInput).toBeVisible({ timeout: 5000 });
  await communityInput.fill('Canarias');
  
  const yearInput = page.locator('input[placeholder="Año"]');
  await expect(yearInput).toBeVisible({ timeout: 5000 });
  await yearInput.fill('1954');

  // Hacer clic en el botón de búsqueda
  await page.getByRole('button', { name: 'Buscar por Comunidad y Año' }).click();

  // Esperar a que la tabla se actualice después de la búsqueda
  await page.waitForTimeout(2000);
  
  // Verificar el contenido de la tabla
  const visibleRows = await page.locator('table tbody tr').count();
  
  // Verificar que hay resultados de Canarias y 1954
  if (visibleRows > 0) {
    // Verificar cantidad de celdas con "Canarias" (mejor que verificar visibilidad)
    const canariasCount = await page.locator('table tbody tr td:has-text("Canarias")').count();
    expect(canariasCount).toBeGreaterThan(0);
    
    // Verificar cantidad de celdas con "1954"
    const year1954Count = await page.locator('table tbody tr td:has-text("1954")').count();
    expect(year1954Count).toBeGreaterThan(0);
    
    // Verificar el mensaje de éxito (opcional)
    await expect(page.getByText(/Se encontraron .+ parques? en Canarias declarados en 1954/)).toBeVisible({ timeout: 5000 });
  } else {
    // Si no hay resultados, verificar cambios en la UI sin depender de la alerta
    await expect(page.getByText(/No se encontraron/i)).toBeVisible({ timeout: 10000 });
  }
});