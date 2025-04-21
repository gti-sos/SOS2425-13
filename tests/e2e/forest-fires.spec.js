// @ts-check
import { test, expect } from '@playwright/test';

// FUNCION QUE EDITA UN REGISTRO EXIXTENTE (HAY QUE ASEGURARSE QUE ESTE REGISTRO ESTA EN NUESTRA BASE DE DATOS)

test.describe('Editar incendio forestal', () => {  
	const year = 2024;
	const autonomous_community = 'andalucia'; 
	const encodedCommunity = encodeURIComponent(autonomous_community);
	const editUrl = `/forest-fires/${year}/${encodedCommunity}`;

	test('Carga la vista de edición correctamente', async ({ page }) => {
		await page.goto(editUrl);

		await expect(page.getByText(`Editar incendio: ${autonomous_community} - ${year}`)).toBeVisible();
		await expect(page.locator('input#accidentes')).toBeVisible();
		await expect(page.locator('input#porcentaje')).toBeVisible();
	});

	test('Edita un recurso con datos válidos', async ({ page }) => {
		await page.goto(editUrl);
	
		await page.locator('input#accidentes').fill('10');
		await page.locator('input#porcentaje').fill('0.2');
		await page.getByRole('button', { name: '💾 Guardar cambios' }).click();
	
		// Verificar la redirección en lugar del mensaje
		await page.waitForURL('**/forest-fires');
		
		// Verificar que estamos en la página correcta después de la redirección
		await expect(page.getByRole('heading', { name: '🔥 Gestión de Incendios Forestales' })).toBeVisible();
		
		// Opcionalmente verificar que aparece un mensaje de éxito en la página principal
		await expect(page.getByText(/✅/)).toBeVisible();
	});

	test.describe('Crear incendio forestal', () => {
		const listUrl = '/forest-fires';
	  
		test('Muestra error con porcentaje inválido (>1)', async ({ page }) => {
			await page.goto(listUrl);
			await page.waitForLoadState('networkidle');
			
			// Desactivar la validación nativa del formulario
			await page.evaluate(() => {
			  const form = document.querySelector('form:has(button[type="submit"])');
			  if (form) {
				form.setAttribute('novalidate', '');
			  }
			});
			
			// Rellenar el formulario
			await page.locator('form:has(button:text("✅ Crear recurso")) input[placeholder="Año"]').fill('2022');
			await page.locator('form:has(button:text("✅ Crear recurso")) input[placeholder="Comunidad Autónoma"]').fill('Extremadura');
			await page.locator('form:has(button:text("✅ Crear recurso")) input[placeholder="Accidentes"]').fill('500');
			await page.locator('form:has(button:text("✅ Crear recurso")) input[placeholder="% Grandes Incendios (0-1)"]').fill('1.5');
			
			await page.getByRole('button', { name: '✅ Crear recurso' }).click();
			
			// Buscar el mensaje de error
			await expect(page.getByText('⚠️ El porcentaje debe estar entre 0 y 1.')).toBeVisible({ timeout: 10000 });
		  });
	  });

	test.skip('Elimina el recurso (⚠️ cuidado si estás en producción)', async ({ page }) => {
		await page.goto(editUrl);

		page.once('dialog', dialog => dialog.accept());
		await page.getByRole('button', { name: '🗑️ Eliminar' }).click();

		await expect(page.getByRole('alert')).toHaveText(/Recurso eliminado correctamente/);
	});
});

// FUNCION QUE CREA UN NUEVO REGISTRO DE INCENDIO FORESTAL (HAY QUE ASEGURARSE QUE ESTE RECURSO NO EXISTA EN LA BASE DE DATOS)

test.describe('Crear incendio forestal', () => {
	const listUrl = '/forest-fires';
  
	test('Crea un nuevo incendio con datos válidos', async ({ page }) => {
	  // Ir a la página principal donde está el formulario
	  await page.goto(listUrl);
	  
	  // Esperar a que la página cargue completamente
	  await page.waitForLoadState('networkidle');
	  
	  // Usar selectores basados en placeholder que coinciden con el HTML real
	  await page.locator('input[placeholder="Año"]').fill('2022');
	  await page.locator('input[placeholder="Comunidad Autónoma"]').fill('Extremadura');
	  await page.locator('input[placeholder="Accidentes"]').fill('500');
	  await page.locator('input[placeholder="% Grandes Incendios (0-1)"]').fill('0.15');
	  
	  // Usar el texto real del botón
	  await page.getByRole('button', { name: '✅ Crear recurso' }).click();
	  
	  // Verificar mensaje de éxito (usando un selector más general)
	  await expect(page.getByText(/Recurso creado correctamente/)).toBeVisible({ timeout: 10000 });
	});
  
	// También actualizar el otro test similar
	test('Muestra error con porcentaje inválido (>1)', async ({ page }) => {
	  await page.goto(listUrl);
	  await page.waitForLoadState('networkidle');
  
	  await page.locator('input[placeholder="Año"]').fill('2022');
	  await page.locator('input[placeholder="Comunidad Autónoma"]').fill('Extremadura');
	  await page.locator('input[placeholder="Accidentes"]').fill('500');
	  await page.locator('input[placeholder="% Grandes Incendios (0-1)"]').fill('1.5');
	  
	  await page.getByRole('button', { name: '✅ Crear recurso' }).click();
	  
	  await expect(page.getByText('⚠️ El porcentaje debe estar entre 0 y 1.')).toBeVisible({ timeout: 10000 });
	});
  });

// FUNCION QUE COMPRUEBA QUE LA LISTA DE INCENDIOS FORESTALES SE CARGAN CORRECTAMENTE Y QUE EL FILTRADO POR AÑO Y COMUNIDAD FUNCIONA BIEN

test.describe('Listado de incendios forestales', () => {
	const year = 2024;
	const autonomous_community = 'andalucIa'; 
	const listUrl = '/forest-fires';

	test('Carga correctamente la lista de incendios', async ({ page }) => {
		await page.goto(listUrl);
		
		// Esperar a que la página se cargue completamente
		await page.waitForLoadState('networkidle');
	
		// Verificar elementos con los textos exactos que aparecen en la página
		await expect(page.getByRole('heading', { name: '🔥 Gestión de Incendios Forestales' })).toBeVisible();
		await expect(page.getByText('Año')).toBeVisible();
		await expect(page.getByText('Comunidad Autónoma')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
	});
	test('Filtra los incendios por año y comunidad', async ({ page }) => {
		await page.goto(listUrl);
		
		// Cargar datos iniciales primero para asegurar que hay datos
		await page.getByRole('button', { name: '📋 Cargar datos iniciales' }).click();
		await page.waitForTimeout(1000); // Esperar que carguen los datos
		
		// Usa los selectores correctos con los nombres de placeholder exactos
		await page.locator('form:has(button:text("Buscar")) input[placeholder="Desde año"]').fill('2024');
		await page.locator('form:has(button:text("Buscar")) input[placeholder="Comunidad Autónoma"]').fill('andalucia');
		
		// Usar el botón de búsqueda con el nombre correcto
		await page.getByRole('button', { name: 'Buscar' }).click();
		
		// Esperar a que se complete la búsqueda
		await page.waitForTimeout(1000);
		
		// Verificar que aparece el mensaje de resultados correcto
		await expect(page.getByText(/🔍 Se encontraron \d+ resultado/)).toBeVisible({ timeout: 5000 });
		
		// Verificar que hay resultados en la tabla
		const rowCount = await page.locator('table tbody tr').count();
		expect(rowCount).toBeGreaterThan(0);
		
		// Verificar que el resultado filtrado contiene la comunidad buscada
		await expect(page.getByText('andalucia', { exact: false })).toBeVisible();
	  });
});
