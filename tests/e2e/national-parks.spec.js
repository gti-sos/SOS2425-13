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
  
  // Usar el mismo selector exacto que en la prueba anterior
  await page.getByRole('button', { name: ' ➕  Crear Parque' }).click();
  
  // Añadir un pequeño tiempo de espera para asegurar que el formulario se ha cargado completamente
  await page.waitForTimeout(1000);

  // Verificar los botones con un timeout más amplio y usando selectores más flexibles
  await expect(page.getByRole('button', { name: /Crear/i })).toBeVisible({ timeout: 10000 });
  
  // Para el botón Limpiar, usar un selector más específico basado en el HTML real
  // Opción 1: Usar una expresión regular para el nombre
  await expect(page.getByRole('button', { name: /Limpiar/i })).toBeVisible({ timeout: 10000 });
  
  // Opción 2 (alternativa): Buscar por el HTML interno que incluye el ícono
  // await expect(page.locator('button:has-text("Limpiar")')).toBeVisible({ timeout: 10000 });
  
  // Opción 3 (alternativa): Buscar por la acción del botón
  // await expect(page.locator('button[on\\:click="clearCreateForm"]')).toBeVisible({ timeout: 10000 });
});

// Test para verificar la funcionalidad de búsqueda rápida
test('Formulario de búsqueda rápida aparece al hacer clic en botón', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');

  // Usar un selector más flexible para el botón
  const searchButton = page.getByRole('button', { name: /Búsqueda rápida/i });
  await expect(searchButton).toBeVisible();
  
  // Mostrar información de depuración
  console.log('Haciendo clic en el botón de Búsqueda rápida');
  
  // Hacer clic y esperar más tiempo para que el formulario se muestre
  await searchButton.click();
  
  console.log('Clic realizado, esperando que aparezca el formulario');
  
  // Aumentar el timeout y usar un selector más específico y robusto
  await expect(
    page.locator('input.form-control[placeholder="Comunidad Autónoma"]')
  ).toBeVisible({ timeout: 10000 });
  
  await expect(
    page.locator('input[placeholder="Año"]')
  ).toBeVisible({ timeout: 10000 });

  // Verificar botones del formulario
  await expect(page.getByRole('button', { name: 'Buscar por Comunidad y Año' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Limpiar' })).toBeVisible({ timeout: 10000 });
});

// Test para verificar la funcionalidad de filtrado avanzado
test('Formulario de filtrado avanzado aparece al hacer clic en botón', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');

  // Hacer clic en el botón de filtrado
  const createButton = page.getByRole('button', { name: ' 🔍 Filtrar parques' });
  await createButton.click();

  // Verificar que aparece el encabezado
  await expect(page.getByRole('heading', { name: 'Filtrar Parques Nacionales' })).toBeVisible();

  // Verificar campos del formulario
  await expect(page.locator('#searchName')).toBeVisible();
  await expect(page.locator('#searchCommunity')).toBeVisible();
  await expect(page.locator('#searchFrom')).toBeVisible();
  await expect(page.locator('#searchTo')).toBeVisible();
  await expect(page.locator('#searchInitAreaMin')).toBeVisible();
  await expect(page.locator('#searchInitAreaMax')).toBeVisible();
  await expect(page.locator('#searchCurrAreaMin')).toBeVisible();
  await expect(page.locator('#searchCurrAreaMax')).toBeVisible();

  // Verificar botones
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Limpiar' }).nth(1)).toBeVisible();
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

  // Verificar que las columnas tienen indicadores de ordenación
  await expect(page.locator('th').first()).toHaveAttribute('style', /cursor: pointer/);

  // Hacer clic en la columna Nombre para ordenar
  await page.locator('th').first().click();

  // Verificar que aparece el indicador de ordenación
  await expect(page.locator('th').first()).toContainText('Nombre ↑');

  // Hacer clic de nuevo para invertir el orden
  await page.locator('th').first().click();

  // Verificar que cambia el indicador
  await expect(page.locator('th').first()).toContainText('Nombre ↓');
});

// Test para verificar la navegación a detalles de un parque
test('Navegación a detalles de un parque', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');

  // Esperar a que se cargue la tabla con datos
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

  // Esperar a que se cargue la tabla con datos
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

  // Hacer clic en el botón Borrar todo
  await page.getByRole('button', { name: '❌ Borrar todo' }).click();

  // Verificar que aparece el modal de confirmación
  await expect(page.getByRole('heading', { name: 'Confirmar eliminación masiva' })).toBeVisible();

  // Verificar botones del modal
  await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Eliminar todos' })).toBeVisible();

  // Cancelar la eliminación
  await page.getByRole('button', { name: 'Cancelar' }).click();

  // Verificar que el modal desaparece
  await expect(page.getByRole('heading', { name: 'Confirmar eliminación masiva' })).not.toBeVisible();
});

// Test para verificar el funcionamiento de creación de un parque
test('Creación de un nuevo parque', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');

  // Abrir formulario de crear parque
  await page.getByRole('button', { name: ' ➕  Crear Parque' }).click();

  // Rellenar el formulario
  await page.locator('#parkName').fill('Parque Test Playwright');
  await page.locator('#declarationDate').fill('2023');
  await page.locator('#community').fill('Test Community');
  await page.locator('#initialArea').fill('10000');
  await page.locator('#currentArea').fill('12000');

  // Hacer clic en el botón Crear
  await page.getByRole('button', { name: 'Crear' }).click();

  // Verificar que aparece mensaje de éxito (podría ser necesario ajustar el selector)
  await expect(page.getByText(/Parque nacional creado correctamente/i)).toBeVisible();

  // Verificar que el nuevo parque aparece en la tabla
  await expect(page.getByText('Parque Test Playwright')).toBeVisible();
});

// Test para verificar la funcionalidad de cargar datos iniciales
test('Cargar datos iniciales', async ({ page }) => {
  await page.goto('localhost:5173/national-parks');

  // Primero eliminar todos los datos
  await page.getByRole('button', { name: '❌ Borrar todo' }).click();
  await page.getByRole('button', { name: 'Eliminar todos' }).click();

  // Esperar mensaje de confirmación
  await expect(page.getByText(/Todos los parques nacionales han sido borrados/i)).toBeVisible();

  // Cargar datos iniciales
  await page.getByRole('button', { name: '💾 Cargar datos iniciales' }).click();

  // Verificar mensaje de éxito
  await expect(page.getByText(/Datos iniciales cargados correctamente/i)).toBeVisible();
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
  // Verificar que ahora se muestran hasta 10 elementos
  const rowCount = await page.locator('table tbody tr').count();
  expect(rowCount).toBeGreaterThanOrEqual(5);
  expect(rowCount).toBeLessThanOrEqual(10);


  // Test para verificar la búsqueda rápida
  test('Búsqueda rápida por comunidad y año', async ({ page }) => {
    await page.goto('localhost:5173/national-parks');

    // Abrir búsqueda rápida
    await page.getByRole('button', { name: ' 🔥 Búsqueda rápida' }).click();

    // Rellenar formulario
    await page.getByPlaceholder('Comunidad Autónoma').fill('Andalucía');
    await page.getByPlaceholder('Año').fill('1999');

    // Hacer clic en buscar
    await page.getByRole('button', { name: 'Buscar por Comunidad y Año' }).click();

    // Verificar que se muestran resultados filtrados
    await expect(page.getByText(/Se encontraron \d+ parques/)).toBeVisible();
  });
})